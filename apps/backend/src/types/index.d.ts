import { Schema } from "zod";

// Model Context Protocol 工具定义
export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: Schema;
}

// 聊天完成消息参数
export interface ChatCompletionMessageParam {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string | null;
  name?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

// 声明multer模块
declare module 'multer' {
  import { Request } from 'express';
  
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination?: string;
      filename?: string;
      path?: string;
      buffer?: Buffer;
    }
    
    interface Options {
      dest?: string;
      storage?: any;
      limits?: {
        fieldNameSize?: number;
        fieldSize?: number;
        fields?: number;
        fileSize?: number;
        files?: number;
        parts?: number;
        headerPairs?: number;
      };
      fileFilter?: (req: Request, file: File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
      preservePath?: boolean;
    }
  }
  
  interface Multer {
    (options?: Multer.Options): any;
    diskStorage(options: {
      destination?: string | ((req: Request, file: Multer.File, callback: (error: Error | null, destination: string) => void) => void);
      filename?: (req: Request, file: Multer.File, callback: (error: Error | null, filename: string) => void) => void;
    }): any;
    memoryStorage(): any;
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: Array<{ name: string; maxCount?: number }>): any;
    none(): any;
  }
  
  const multer: Multer;
  export default multer;
}

// 扩展Express请求类型
declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: { [fieldname: string]: Multer.File[] } | Multer.File[];
    }
  }
} 