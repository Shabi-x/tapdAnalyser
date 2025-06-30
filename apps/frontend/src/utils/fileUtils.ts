import axios from 'axios';

const API_URL = 'http://localhost:3003/api';

/**
 * 验证文件是否为Markdown文件
 * @param file 要验证的文件对象
 * @returns 是否为有效的Markdown文件
 */
export const isValidMarkdownFile = (file: File): boolean => {
  return file && file.name.toLowerCase().endsWith('.md');
};

/**
 * 上传文件到服务器
 * @param file 要上传的文件
 * @returns 响应结果，包含文件内容和文件名
 */
export const uploadFile = async (file: File): Promise<{ content: string; filename: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return {
    content: response.data.content,
    filename: response.data.filename
  };
};

/**
 * 将内容复制到剪贴板
 * @param text 要复制的文本
 * @returns 复制操作的Promise
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  if (!text) {
    throw new Error('无内容可复制');
  }
  
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('复制到剪贴板失败:', error);
    throw error;
  }
}; 