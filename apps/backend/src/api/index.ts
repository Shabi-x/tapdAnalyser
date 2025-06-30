import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MCPClient } from '../client/mcpClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化MCP客户端
const mcpClient = new MCPClient();

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务正常运行' });
});

// 查询接口
app.post('/api/query', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: '查询内容不能为空' });
    }

    console.log(`接收到查询请求: ${query}`);
    
    // 调用MCP客户端处理查询
    const response = await mcpClient.processQuery(query);
    
    res.json({ result: response });
  } catch (error) {
    console.error('处理查询时出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// 启动服务器
async function startServer() {
  try {
    // 连接到MCP服务器
    // 使用编译后的js文件
    const serverScriptPath = process.env.MCP_SERVER_PATH || './dist/server/index.js';
    
    console.log(`尝试连接到MCP服务器: ${serverScriptPath}`);
    await mcpClient.connectToServer(serverScriptPath);
    
    app.listen(PORT, () => {
      console.log(`API 服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('启动API服务器失败:', error);
    process.exit(1);
  }
}

startServer(); 