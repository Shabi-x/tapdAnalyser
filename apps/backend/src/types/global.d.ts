declare module 'multer' {
  import { Request } from 'express';
  
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination?: string;
    filename?: string;
    path?: string;
    buffer: Buffer;
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
  
  function multer(options?: Options): any;
  
  namespace multer {
    function diskStorage(options: {
      destination?: string | ((req: Request, file: File, callback: (error: Error | null, destination: string) => void) => void);
      filename?: (req: Request, file: File, callback: (error: Error | null, filename: string) => void) => void;
    }): any;
    function memoryStorage(): any;
  }
  
  export = multer;
}

// 扩展Express请求类型
declare namespace Express {
  interface Request {
    file?: import('multer').File;
    files?: { [fieldname: string]: import('multer').File[] } | import('multer').File[];
  }
} 