import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { load } from "cheerio";
import { DEFAULT_CONVERT_RULE } from "../rules/transform.js";

/**
 * 从URL获取网页内容并提取摘要
 * @param url 网页URL
 * @returns 网页内容摘要
 */
async function fetchWebContent(url: string): Promise<string> {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = load(html);
        
        // 移除脚本、样式和其他非内容元素
        $('script, style, header, footer, nav').remove();
        
        // 提取标题
        const title = $('title').text().trim();
        
        // 提取正文内容
        let content = '';
        $('p, h1, h2, h3, h4, h5, h6, li').each((_, element) => {
            const text = $(element).text().trim();
            if (text) {
                content += text + '\n\n';
            }
        });
        
        // 提取meta描述
        const metaDescription = $('meta[name="description"]').attr('content') || '';
        
        // 构建摘要
        let summary = '';
        if (title) {
            summary += `标题: ${title}\n\n`;
        }
        
        if (metaDescription) {
            summary += `描述: ${metaDescription}\n\n`;
        }
        
        summary += `内容摘要:\n${content.substring(0, 2000)}${content.length > 2000 ? '...(内容已截断)' : ''}`;
        
        return summary;
    } catch (error: any) {
        console.error('获取网页内容失败:', error);
        return `获取网页内容失败: ${error.message || '未知错误'}`;
    }
}

async function main() {
    try {
        console.log("正在初始化 MCP 服务器...");
        const server = new McpServer({
            name: "web-content-server",
            version: "1.0.0",
        });

        console.log("注册 summarizeWebPage 工具...");
        server.tool(
            "summarizeWebPage",
            "获取并总结网页内容，提取主要信息",
            {
                url: { type: "string", description: "要获取内容的网页URL，需要包含http://或https://前缀" }
            },
            async ({ url }): Promise<any> => {
                console.log(`收到网页内容请求，URL: ${url}`);
                
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: "URL必须以http://或https://开头",
                            },
                        ],
                    };
                }
                
                try {
                    const summary = await fetchWebContent(url);
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: summary,
                            },
                        ],
                    };
                } catch (error: any) {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `获取网页内容失败: ${error.message || '未知错误'}`,
                            },
                        ],
                    };
                }
            }
        );
        
        console.log("注册 transformMarkdownToBIDashboard 工具...");
        server.tool(
            "transformMarkdownToBIDashboard",
            "将Markdown格式的需求文档转换为仪表盘配置代码",
            {
                markdown: { type: "string", description: "Markdown格式的需求文档内容" },
                customPrompt: { type: "string", description: "自定义转换提示词，可选" }
            },
            async ({ markdown, customPrompt }): Promise<any> => {
                console.log(`收到Markdown转换请求，文档长度: ${markdown.length} 字符`);
                
                try {
                    // 使用DEFAULT_CONVERT_RULE中的默认提示词
                    let prompt = DEFAULT_CONVERT_RULE.prompt;
                    
                    // 如果有自定义提示词，则使用自定义提示词
                    if (customPrompt) {
                        prompt = customPrompt;
                    }
                    
                    // 构建示例部分（如果有）
                    let examplesText = "";
                    if (DEFAULT_CONVERT_RULE.examples && DEFAULT_CONVERT_RULE.examples.length > 0) {
                        examplesText = "\n\n示例：\n";
                        for (const example of DEFAULT_CONVERT_RULE.examples) {
                            examplesText += `\n输入：\n${example.input}\n\n输出：\n${example.output}\n`;
                        }
                    }
                    
                    // 构建完整的提示词
                    const fullPrompt = `${prompt}${examplesText}\n\n以下是需要转换的Markdown内容：\n\n${markdown}`;
                    
                    // 返回规则配置和需要转换的内容
                    // 不直接调用AI，让客户端决定如何处理这些数据
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: JSON.stringify({
                                    rule: DEFAULT_CONVERT_RULE,
                                    markdownContent: markdown,
                                    prompt: fullPrompt
                                })
                            },
                        ],
                    };
                } catch (error: any) {
                    console.error("处理Markdown转换请求失败:", error);
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `处理Markdown转换请求失败: ${error.message || '未知错误'}`,
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