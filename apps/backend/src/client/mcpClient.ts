import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import OpenAI from "openai";
import type { MCPTool, ChatCompletionMessageParam } from "../types/index.js";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL;
if (!OPENAI_API_KEY || !OPENAI_BASE_URL) {
    throw new Error("OPENAI_API_KEY 或 OPENAI_BASE_URL 未设置");
}

export class MCPClient {
    private mcp: Client;
    private openai: OpenAI;
    private transport: StdioClientTransport | null = null;
    private tools: MCPTool[] = [];

    constructor() {
        this.openai = new OpenAI({
            apiKey: OPENAI_API_KEY,
            baseURL: OPENAI_BASE_URL,
        });
        this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
    }

    async connectToServer(serverScriptPath: string) {
        try {
            const isJs = serverScriptPath.endsWith(".js");
            const isPy = serverScriptPath.endsWith(".py");
            if (!isJs && !isPy) {
                throw new Error("服务器脚本必须是 .js 或 .py 文件");
            }
            const command = isPy
                ? process.platform === "win32"
                    ? "python"
                    : "python3"
                : process.execPath;

            this.transport = new StdioClientTransport({
                command,
                args: [serverScriptPath],
            });
            this.mcp.connect(this.transport);

            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
            }));
            console.log(
                "已连接到服务器，工具包括：",
                this.tools.map(({ name }) => name)
            );
        } catch (e) {
            console.log("无法连接到 MCP 服务器: ", e);
            throw e;
        }
    }

    async processQuery(query: string) {
        // 检查是否已连接到MCP服务器
        if (this.tools.length === 0) {
            console.log("警告：未连接到MCP服务器或没有可用工具，将直接使用模型生成回应");
            return this.generateDirectResponse(query);
        }

        const messages: ChatCompletionMessageParam[] = [
            {
                role: "user",
                content: query,
            },
        ];

        // 创建请求参数对象
        const requestParams: any = {
            model: "qwen-plus",
            messages
        };

        // 只有当tools非空时才添加tools参数
        if (this.tools && this.tools.length > 0) {
            const openAITools = this.tools.map(tool => ({
                type: 'function' as const,
                function: {
                    name: tool.name,
                    description: tool.description || "",
                    parameters: {
                        type: "object",
                        properties: tool.inputSchema.properties || {},
                        required: tool.inputSchema.required || []
                    }
                }
            }));
            
            requestParams.tools = openAITools;
        }

        // 使用构建的参数对象发送请求
        const response = await this.openai.chat.completions.create(requestParams);

        const choice = response.choices[0];
        const results: string[] = [];

        // 如果没有tool_calls，直接返回内容
        if (!choice.message.tool_calls || choice.message.tool_calls.length === 0) {
            return choice.message.content || "抱歉，我不太理解您的问题。";
        }

        for (const toolCall of choice.message.tool_calls) {
            const toolName = toolCall.function.name;
            const toolArgs = JSON.parse(toolCall.function.arguments);

            console.log(`\n大模型决定调用工具: ${toolName}`);
            console.log("调用参数:", toolArgs);
            
            const result = await this.mcp.callTool({
                name: toolName,
                arguments: toolArgs,
            });

            if (result.content) {
                if (Array.isArray(result.content)) {
                    const text = result.content.map(item => item.text).join('');
                    results.push(text);
                } else {
                    results.push(JSON.stringify(result.content));
                }
            }

            messages.push({
                role: "assistant",
                content: null,
                tool_calls: [toolCall],
            });

            messages.push({
                role: "tool",
                content: JSON.stringify(result.content),
                tool_call_id: toolCall.id,
            });
        }

        const finalResponse = await this.openai.chat.completions.create({
            model: "qwen-plus",
            messages,
        });
        console.log("大模型生成的最终回答:", finalResponse.choices[0].message.content);

        results.push(finalResponse.choices[0].message.content || "");
        return results.join("\n\n");
    }

    /**
     * 直接调用MCP工具
     * @param toolName 工具名称
     * @param args 工具参数
     * @returns 调用结果
     */
    async callTool(toolName: string, args: any) {
        if (!this.mcp) {
            throw new Error("MCP客户端未初始化");
        }
        return this.mcp.callTool({
            name: toolName,
            arguments: args
        });
    }

    /**
     * 当没有可用工具时，直接使用模型生成回应
     */
    async generateDirectResponse(query: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: "qwen-plus",
                messages: [
                    {
                        role: "system",
                        content: ""
                    },
                    {
                        role: "user",
                        content: query
                    }
                ]
            });

            return response.choices[0].message.content || "抱歉，我无法生成有效的回应。";
        } catch (error) {
            console.error("直接生成回应时出错:", error);
            return "抱歉，在处理您的请求时遇到了问题。请稍后再试。";
        }
    }

    async cleanup() {
        await this.mcp.close();
    }
} 