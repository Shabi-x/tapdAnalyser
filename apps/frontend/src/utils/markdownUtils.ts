import MarkdownIt from 'markdown-it';

// 配置markdown-it渲染器
export const md = new MarkdownIt({
  html: true,          // 允许HTML标签
  breaks: true,        // 转换\n为<br>
  linkify: true,       // 自动将URL转为链接
  typographer: true,   // 启用一些语言中立的替换和引号美化
  xhtmlOut: false      // 使用'/'闭合单标签
});

/**
 * 预处理Markdown内容，修复常见格式问题
 * @param text 原始Markdown文本
 * @returns 处理后的Markdown文本
 */
export const preprocessMarkdown = (text: string): string => {
  if (!text) return '';
  
  // 处理无效字符和格式
  return text
    // 修复标题格式 - **标题** 转换为普通文本
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // 修复列表项 + 被当作纯文本
    .replace(/^\+ /gm, '- ')
    // 处理下划线强调，确保正确渲染为斜体
    .replace(/_([^_]+)_/g, '*$1*')
    // 清理多余的空格
    .replace(/\s+\n/g, '\n');
};

/**
 * 将Markdown内容转换为纯文本，移除所有HTML标签和Markdown符号
 * @param text 原始Markdown/HTML文本
 * @returns 处理后的纯文本
 */
export const markdownToPlainText = (text: string): string => {
  if (!text) return '';
  
  // 首先移除所有HTML标签
  let plainText = text
    // 移除所有HTML标签
    .replace(/<[^>]*>/g, '')
    // 移除HTML实体编码
    .replace(/&[a-zA-Z]+;/g, ' ')
    .replace(/&[#][0-9]+;/g, ' ');
  
  // 然后处理Markdown语法
  plainText = plainText
    // 去除所有的Markdown标记
    .replace(/#+\s/g, '')                     // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1')          // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1')              // 移除斜体标记
    .replace(/`(.*?)`/g, '$1')                // 移除代码标记
    .replace(/~~(.*?)~~/g, '$1')              // 移除删除线标记
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')       // 将链接替换为链接文本
    .replace(/!\[(.*?)\]\(.*?\)/g, '[图片:$1]') // 将图片替换为描述
    .replace(/^\s*[-+*]\s/gm, '- ')           // 标准化列表标记
    .replace(/^\s*\d+\.\s/gm, '- ')           // 将有序列表转为无序列表
    .replace(/^\s*>/gm, '')                   // 移除引用标记
    .replace(/\n{3,}/g, '\n\n')               // 减少多余空行
    .replace(/^\s*```[\s\S]*?```\s*$/gm, '')  // 移除代码块
    .replace(/\|\s*[-:]+\s*\|/g, '')          // 移除表格格式行
    .replace(/\|\s*([^|]*)\s*\|/g, '$1, ')    // 将表格单元格转为逗号分隔
    .replace(/_/g, '')                        // 移除下划线
    .replace(/\s+/g, ' ')                     // 将多个空格合并为一个
    .replace(/\s*\n\s*/g, '\n')               // 清理行首尾空格
    .replace(/\n{3,}/g, '\n\n');              // 再次减少多余空行
  
  // 清理剩余可能的特殊字符和多余空格
  return plainText
    .trim()                                   // 移除首尾空格
    .replace(/\n +/g, '\n')                   // 移除行首空格
    .replace(/  +/g, ' ');                    // 将多个空格合并为一个
};

/**
 * 渲染Markdown内容为HTML
 * @param text 要渲染的Markdown文本
 * @returns 渲染后的HTML内容
 */
export const renderMarkdown = (text: string): string => {
  if (!text) return '';
  const processedContent = preprocessMarkdown(text);
  return md.render(processedContent);
}; 