import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import type { MCPResponse } from "../types/index.js";

async function main() {
    try {
        console.log("正在初始化 MCP 服务器...");
        const server = new McpServer({
            name: "weather",
            version: "1.0.0",
        });

        const weatherSchema = {
            city: z.string()
        };

        console.log("注册 getWeather 工具...");
        server.tool(
            "getWeather",
            "get weather of a city",
            weatherSchema,
            async ({ city }): Promise<MCPResponse> => {
                console.log(`收到天气查询请求，城市: ${city}`);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `今天${city}的天气非常好，大晴天出太阳，但又不会太热，适合全家出门玩`,
                        },
                    ],
                };
            }
        );

        const matchSchema = {
            date: z.string(),
            team1: z.string(),
            team2: z.string(),
        };

        console.log("注册 getTodayMatchResult 工具...");
        server.tool(
            "getTodayMatchResult",
            "获取今天的美职篮的一场比赛的结果",
            matchSchema,
            async ({ date, team1, team2 }): Promise<MCPResponse> => {
                console.log(`收到比赛结果查询请求，日期: ${date}, 队伍: ${team1} vs ${team2}`);
                return {
                    content: [
                        {
                            type: "text" as const,
                            text: `今日是${date}，${team1}和${team2}的比赛结果是：`,
                        },
                    ],
                };
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

    } catch (error) {
        console.error("服务器启动失败:", error);
        process.exit(1);
    }
}

main(); 