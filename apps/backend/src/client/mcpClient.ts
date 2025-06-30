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
        const messages: ChatCompletionMessageParam[] = [
            {
                role: "user",
                content: query,
            },
        ];

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

        const response = await this.openai.chat.completions.create({
            model: "qwen-plus",
            messages,
            tools: openAITools,
        });

        const choice = response.choices[0];
        if (!choice.message.tool_calls) {
            return choice.message.content || "抱歉，我不太理解您的问题。";
        }

        const results = [];
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
                    results.push(result.content);
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

    async cleanup() {
        await this.mcp.close();
    }
} 