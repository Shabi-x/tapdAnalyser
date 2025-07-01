import express, { Request, Response, RequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { MCPClient } from '../client/mcpClient.js';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// 定义一个简单的默认规则，替代原来从transform.js导入的规则
const DEFAULT_CONVERT_RULE = {
  prompt: "请将以下Markdown格式的需求文档转换为TypeScript配置代码，生成一个符合需求的仪表盘配置对象。",
  examples: [
    {
      input: "示例输入",
      output: "示例输出"
    }
  ]
};

// 全局MCP客户端
let mcpClient: MCPClient | null = null;

// 配置multer，使用内存存储
const upload = multer({ storage: multer.memoryStorage() });

// 中间件
app.use(cors());
app.use(express.json());

// 初始化MCP客户端
async function initMCPClient() {
  try {
    if (!mcpClient) {
      mcpClient = new MCPClient();
      
      // 使用环境变量或默认编译后的路径
      const serverPath = process.env.MCP_SERVER_PATH || path.resolve(process.cwd(), './dist/server/index.js');
      
      console.log('尝试连接到MCP服务器:', serverPath);
      
      if (fs.existsSync(serverPath)) {
        await mcpClient.connectToServer(serverPath);
        console.log('成功连接到MCP服务器');
      } else {
        console.error('找不到MCP服务器脚本:', serverPath);
        console.log('注意: 当前运行在模拟模式，某些功能可能不可用');
      }
    }
    return mcpClient;
  } catch (error) {
    console.error('初始化MCP客户端失败:', error);
    return null;
  }
}

// 健康检查接口
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: '服务正常运行' });
});

// 查询接口处理器
const queryHandler: RequestHandler = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      res.status(400).json({ error: '请提供查询内容' });
      return;
    }
    
    const client = await initMCPClient();
    if (!client) {
      res.status(500).json({ error: 'MCP客户端未初始化' });
      return;
    }
    
    // 处理网页摘要请求
    if (query.includes('总结这个网页的内容：')) {
      const url = query.replace('总结这个网页的内容：', '').trim();
      
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        res.status(400).json({ error: 'URL必须以http://或https://开头' });
        return;
      }
      
      const response = await client.processQuery(`使用summarizeWebPage工具，对这个网页进行摘要：${url}`);
      res.send(response);
      return;
    }
    
    const response = await client.processQuery(query);
    res.send(response);
  } catch (error: any) {
    console.error('查询处理失败:', error);
    res.status(500).json({ error: error.message || '查询处理失败' });
  }
};

// 处理MCP Markdown转换请求的处理器
const mcpQueryHandler: RequestHandler = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      res.status(400).json({ error: '请提供查询内容' });
      return;
    }
    
    // 获取MCP客户端
    const client = await initMCPClient();
    if (!client) {
      res.status(500).json({ error: 'MCP客户端未初始化' });
      return;
    }
    
    // 如果请求中包含Markdown内容，使用transformMarkdownToBIDashboard工具
    if (query.includes('请将以下Markdown文档转换为仪表盘配置代码')) {
      // 提取Markdown内容
      const markdownContent = query.split('请将以下Markdown文档转换为仪表盘配置代码：\n\n')[1] || '';
      
      if (!markdownContent) {
        res.status(400).json({ error: '未提供有效的Markdown内容' });
        return;
      }
      
      // 使用transformMarkdownToBIDashboard工具
      console.log('使用transformMarkdownToBIDashboard工具处理Markdown内容...');
      const response = await client.processQuery(`使用transformMarkdownToBIDashboard工具处理以下Markdown内容: ${markdownContent.substring(0, 100)}...`);
      
      // 从响应中提取代码
      let result = response;
      if (result.includes('```typescript')) {
        result = result.split('```typescript')[1].split('```')[0].trim();
      } else if (result.includes('```ts')) {
        result = result.split('```ts')[1].split('```')[0].trim();
      } else if (result.includes('```javascript')) {
        result = result.split('```javascript')[1].split('```')[0].trim();
      } else if (result.includes('```js')) {
        result = result.split('```js')[1].split('```')[0].trim();
      } else if (result.includes('```')) {
        result = result.split('```')[1].split('```')[0].trim();
      }
      
      // 返回结果
      res.json({ result });
      return;
    }
    
    // 其他常规查询
    const response = await client.processQuery(query);
    res.json({ result: response });
  } catch (error: any) {
    console.error('MCP查询处理失败:', error);
    res.status(500).json({ error: error.message || 'MCP查询处理失败' });
  }
};

// Markdown转换处理器
const convertHandler: RequestHandler = async (req, res) => {
  try {
    const { content, rule } = req.body;
    
    if (!content) {
      res.status(400).json({ error: '请提供需要转换的内容' });
      return;
    }
    
    // 使用提供的规则或默认规则
    const convertRule = rule
    
    // 获取MCP客户端
    const client = await initMCPClient();
    if (!client) {
      res.status(500).json({ 
        error: 'MCP客户端未初始化，使用模拟模式',
        result: `// 模拟生成的配置代码\n{\n  title: "示例配置",\n  sections: [\n    {\n      name: "section1",\n      items: []\n    }\n  ]\n}`
      });
      return;
    }
    
    // 构建提示词
    const examples = convertRule.examples ? 
      `\n\n示例：\n输入:\n${convertRule.examples[0].input}\n\n输出:\n${convertRule.examples[0].output}` : '';
    
    const prompt = `${convertRule.prompt}${examples}\n\n以下是需要转换的Markdown内容：\n\n${content}`;
    
    console.log('发送到MCP的提示词:', prompt.substring(0, 200) + '...');
    
    // 发送到MCP处理
    const response = await client.processQuery(prompt);
    
    // 处理响应
    // 假设响应格式是代码块
    let result = response;
    if (result.includes('```typescript')) {
      result = result.split('```typescript')[1].split('```')[0].trim();
    } else if (result.includes('```ts')) {
      result = result.split('```ts')[1].split('```')[0].trim();
    } else if (result.includes('```javascript')) {
      result = result.split('```javascript')[1].split('```')[0].trim();
    } else if (result.includes('```js')) {
      result = result.split('```js')[1].split('```')[0].trim();
    } else if (result.includes('```')) {
      result = result.split('```')[1].split('```')[0].trim();
    }
    
    res.json({ result });
  } catch (error: any) {
    console.error('转换处理失败:', error);
    res.status(500).json({ error: error.message || '转换处理失败' });
  }
};

// 仪表盘配置生成处理器
const generateDashboardHandler: RequestHandler = async (req, res) => {
  try {
    const { content, enumMappings } = req.body;
    
    if (!content) {
      res.status(400).json({ error: '请提供需要转换的需求文档内容' });
      return;
    }
    
    // 获取MCP客户端
    const client = await initMCPClient();
    
    // 构建更完整的提示词，包含示例和复杂配置参考
    const examples = DEFAULT_CONVERT_RULE.examples ? 
      `\n\n示例：\n输入:\n${DEFAULT_CONVERT_RULE.examples[0].input}\n\n输出:\n${DEFAULT_CONVERT_RULE.examples[0].output}` : '';
    
    // 处理响应
    let result;
    
    if (!client) {
      console.warn('MCP客户端未初始化，使用模拟模式');
      // 如果MCP客户端未初始化，返回模拟数据
      res.status(500).json({ 
        error: 'MCP客户端未初始化，使用模拟模式',
        result: `// 模拟生成的仪表盘配置代码\nconst dashboardConfig = {\n  formBlock: {\n    filterConfig: {\n      fields: []\n    }\n  },\n  tableBlock: {\n    title: "数据表格",\n    dimension: { config: [] },\n    table: { config: { columns: [] } }\n  },\n  chartBlock: {\n    title: "图表",\n    chartType: "line"\n  }\n};`
      });
      return;
    }
    
    try {
      console.log('使用generateDashboardConfig工具生成配置...');
      
      // 使用MCP工具生成配置
      const toolQuery = `使用generateDashboardConfig工具处理需求文档`;
      
      // 构造工具调用参数
      const toolResult = await client.processQuery(toolQuery);
      
      // 判断是否需要直接调用工具
      if (toolResult.includes('使用generateDashboardConfig工具') || 
          toolResult.includes('无法理解') || 
          !toolResult.includes('const ')) {
        console.log('直接调用工具...');
        
        // 准备示例数据
        const exampleData = DEFAULT_CONVERT_RULE.examples ? 
          `输入:\n${DEFAULT_CONVERT_RULE.examples[0].input}\n\n输出:\n${DEFAULT_CONVERT_RULE.examples[0].output}` : '';
        
        // 直接调用工具
        const response = await client.processQuery(`使用generateDashboardConfig工具将以下Markdown文档转换为仪表盘配置代码，markdown参数是：${content.substring(0, 100)}...，prompt参数是：${DEFAULT_CONVERT_RULE.prompt.substring(0, 100)}...`);
        
        result = response;
      } else {
        result = toolResult;
      }
      
      // 处理响应格式
      if (result.includes('```typescript')) {
        result = result.split('```typescript')[1].split('```')[0].trim();
      } else if (result.includes('```ts')) {
        result = result.split('```ts')[1].split('```')[0].trim();
      } else if (result.includes('```javascript')) {
        result = result.split('```javascript')[1].split('```')[0].trim();
      } else if (result.includes('```js')) {
        result = result.split('```js')[1].split('```')[0].trim();
      } else if (result.includes('```')) {
        result = result.split('```')[1].split('```')[0].trim();
      }
      
      // 返回结果
      res.json({ 
        result,
        originalMarkdown: content
      });
      
    } catch (error: any) {
      console.error('工具调用失败:', error);
      res.status(500).json({ error: error.message || '配置生成失败' });
    }
  } catch (error: any) {
    console.error('仪表盘配置生成失败:', error);
    res.status(500).json({ error: error.message || '仪表盘配置生成失败' });
  }
};

// 文件上传处理器
const uploadHandler: RequestHandler = (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: '未上传文件' });
      return;
    }
    
    // 读取文件内容
    const content = file.buffer.toString('utf8');
    
    res.json({
      filename: file.originalname,
      content
    });
  } catch (error: any) {
    console.error('文件处理失败:', error);
    res.status(500).json({ error: error.message || '文件处理失败' });
  }
};

// 获取可用枚举配置
const getEnumsHandler: RequestHandler = (req, res) => {
  try {
    const enums = {
    };
    
    res.json(enums);
  } catch (error: any) {
    console.error('获取枚举配置失败:', error);
    res.status(500).json({ error: error.message || '获取枚举配置失败' });
  }
};

// 注册路由
app.post('/api/query', queryHandler);
app.post('/api/mcp/query', mcpQueryHandler);
app.post('/api/convert', convertHandler);
app.post('/api/generate-dashboard', generateDashboardHandler);
app.get('/api/enums', getEnumsHandler);
app.post('/api/upload', upload.single('file'), uploadHandler);

// 启动服务器
export async function startServer() {
  try {
    // 初始化MCP客户端
    await initMCPClient();
    
    // 启动服务器
    return new Promise<void>((resolve) => {
      app.listen(PORT, () => {
        console.log(`API 服务器运行在 http://localhost:${PORT}`);
        resolve();
      });
    });
  } catch (error) {
    console.error('启动API服务器失败:', error);
    throw error;
  }
}

// 如果直接运行此文件 (ES模块版本)
// Node.js ESM中检测主模块的方式
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  startServer().catch((error) => {
    console.error('服务器启动失败:', error);
    process.exit(1);
  });
}

export default app;