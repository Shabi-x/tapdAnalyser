import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DEFAULT_CONVERT_RULE } from "../rules/transform.js";

async function main() {
    try {
        const server = new McpServer({
            name: "Tapd Analyser",
            version: "1.0.0",
        });

        server.tool(
            "summarizeWebPage",
            "获取并总结网页内容，提取主要信息",
            {
                url: { type: "string", description: "要获取内容的网页URL，需要包含http://或https://前缀" }
            },
            async ({ url }): Promise<any> => {
                console.log(`收到网页内容请求，URL: ${url}`);
            }
        );
        
        server.tool(
            "transformMarkdownToBIDashboard",
            "将Markdown格式的需求文档转换为仪表盘配置代码",
            {
                plainText: { type: "string", description: "已转换为纯文本格式的需求文档内容" },
                customRules: { type: "string", description: "自定义转换规则，JSON格式字符串，可选" }
            },
            async ({ plainText, customRules }): Promise<any> => {
                
                try {
                    // 获取基础规则
                    const baseRule = DEFAULT_CONVERT_RULE;
                    
                    // 解析自定义规则（如果有）
                    let mergedRule = { ...baseRule };
                    if (customRules) {
                        try {
                            const parsedCustomRules = JSON.parse(customRules);
                            // 合并自定义规则和默认规则
                            mergedRule = {
                                ...baseRule,
                                ...parsedCustomRules,
                                // 如果自定义规则中有prompt，则覆盖默认prompt
                                prompt: parsedCustomRules.prompt || baseRule.prompt,
                                // 合并examples，如果自定义规则中有examples
                                examples: [
                                    ...(baseRule.examples || []),
                                    ...(parsedCustomRules.examples || [])
                                ]
                            };
                            console.log("已合并自定义规则");
                        } catch (parseError) {
                            console.error("解析自定义规则失败:", parseError);
                            // 如果解析失败，继续使用默认规则
                        }
                    }
                    
                    // 使用合并后的规则中的提示词
                    let prompt = mergedRule.prompt;
                    
                    // 构建示例部分（如果有）
                    let examplesText = "";
                    const examples = mergedRule.examples;
                    if (examples && Array.isArray(examples) && examples.length > 0) {
                        examplesText = "\n\n示例：\n";
                        for (const example of examples) {
                            if (example && example.input && example.output) {
                                examplesText += `\n输入：\n${example.input}\n\n输出：\n${example.output}\n`;
                            }
                        }
                    }
                    
                    // 构建完整的提示词
                    const fullPrompt = `${prompt}${examplesText}\n\n以下是需要转换的内容：\n\n${plainText}`;
                    
                    console.log("已构建完整提示词，长度:", fullPrompt.length);
                    
                    // 返回规则配置和需要转换的内容
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: JSON.stringify({
                                    rule: mergedRule,
                                    content: plainText,
                                    prompt: fullPrompt
                                })
                            },
                        ],
                    };
                } catch (error: any) {
                    console.error("处理文档转换请求失败:", error);
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `处理文档转换请求失败: ${error.message || '未知错误'}`,
                            },
                        ],
                    };
                }
            }
        );

        console.log("初始化 StdioServerTransport...");
        const transport = new StdioServerTransport();
        
        console.log("连接到传输层...");
        await server.connect(transport);
        
        console.log("MCP 服务器启动成功！等待客户端连接...");

        // 添加进程退出处理
        process.on('SIGINT', async () => {
            console.log("\n收到中断信号，正在关闭服务器...");
            await server.close();
            process.exit(0);
        });

    } catch (error: any) {
        console.error("服务器启动失败:", error);
        process.exit(1);
    }
}

main(); 