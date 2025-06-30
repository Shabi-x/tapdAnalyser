import dotenv from 'dotenv';
import { startServer } from './api/index.js';

dotenv.config();

// 启动服务器
startServer()
  .then(() => {
    console.log('API服务器启动成功');
  })
  .catch((error) => {
    console.error('API服务器启动失败:', error);
    process.exit(1);
  }); 