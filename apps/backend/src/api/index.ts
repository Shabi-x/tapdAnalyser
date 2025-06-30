import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { MCPClient } from '../client/mcpClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 初始化MCP客户端
const mcpClient = new MCPClient();

// 配置multer，使用内存存储
const upload = multer({ storage: multer.memoryStorage() });

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查接口
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务正常运行' });
});

// 查询接口
app.post('/api/query', async (req, res) => {
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

// 文件上传接口 - 简单版本，只提取内容
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: '未找到上传的文件' });
    }

    // 检查文件类型
    const fileOriginalName = file.originalname;
    if (!fileOriginalName.toLowerCase().endsWith('.md')) {
      return res.status(400).json({ error: '只支持Markdown文件' });
    }

    // 直接从内存中提取文件内容
    const fileContent = file.buffer.toString('utf-8');
    console.log(`接收到文件: ${fileOriginalName}, 大小: ${file.size} 字节`);
    
    // 返回文件内容
    res.json({ 
      content: fileContent,
      filename: fileOriginalName
    });
  } catch (error) {
    console.error('处理上传文件时出错:', error);
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