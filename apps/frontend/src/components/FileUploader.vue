<script setup lang="ts">
import { ref, computed } from 'vue';
import { md, renderMarkdown, markdownToPlainText } from '../utils/markdownUtils';
import { isValidMarkdownFile, uploadFile as uploadFileToServer, copyToClipboard } from '../utils/fileUtils';

const fileContent = ref('');
const fileName = ref('');
const loading = ref(false);
const error = ref('');
const dragActive = ref(false);
const showRawContent = ref(false);
const copySuccess = ref(false);

// 计算属性：渲染后的Markdown
const renderedContent = computed(() => {
  return renderMarkdown(fileContent.value);
});

// 处理文件上传 - 用于TDesign上传组件
const handleFileChange = (file: any) => {
  if (!file) return;
  
  // 确保只处理第一个文件
  const actualFile = Array.isArray(file) ? file[0]?.raw : file.raw;
  if (!actualFile) return;
  
  // 检查文件类型
  if (!isValidMarkdownFile(actualFile)) {
    error.value = '只支持上传MD文件';
    return;
  }
  
  uploadFile(actualFile);
};

// 实际上传文件的函数
const uploadFile = async (file: File) => {
  loading.value = true;
  error.value = '';
  
  try {
    console.log('正在上传文件:', file.name);
    
    const result = await uploadFileToServer(file);
    fileContent.value = result.content;
    fileName.value = result.filename;
    console.log('文件上传成功');
  } catch (err) {
    console.error('上传失败:', err);
    error.value = '文件上传失败，请稍后再试';
  } finally {
    loading.value = false;
  }
};

// 处理拖动进入
const handleDragEnter = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = true;
};

// 处理拖动离开
const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
};

// 处理拖动悬停
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
};

// 处理拖放
const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  dragActive.value = false;
  
  if (!e.dataTransfer?.files.length) return;
  
  const file = e.dataTransfer.files[0];
  if (!isValidMarkdownFile(file)) {
    error.value = '只支持上传MD文件';
    return;
  }
  
  uploadFile(file);
};

// 处理手动选择文件
const handleManualUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md';
  input.onchange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files?.length) return;
    
    const file = target.files[0];
    uploadFile(file);
  };
  input.click();
};

// 切换显示原始内容/渲染内容
const toggleContentView = () => {
  showRawContent.value = !showRawContent.value;
};

// 复制内容到剪贴板
const copyContent = async () => {
  try {
    // 将内容转换为纯文本，不含任何HTML标记或Markdown符号
    const contentToCopy = markdownToPlainText(fileContent.value);
    
    await copyToClipboard(contentToCopy);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('复制失败:', err);
    error.value = '复制到剪贴板失败';
  }
};

// 清除文件内容
const clearFile = () => {
  fileContent.value = '';
  fileName.value = '';
  error.value = '';
};
</script>

<template>
  <div class="uploader-container">
    <h2>MD文件上传与分析</h2>
    
    <t-space direction="vertical" size="large" style="width: 100%">
      <!-- 上传区域 - 使用原生拖放实现 -->
      <div 
        class="drop-area" 
        :class="{ 'drag-active': dragActive }"
        @dragenter="handleDragEnter"
        @dragleave="handleDragLeave"
        @dragover="handleDragOver"
        @drop="handleDrop"
        @click="handleManualUpload"
      >
        <div class="upload-content">
          <t-icon name="upload" size="24px" />
          <p>拖拽MD文件到此处或点击上传</p>
          <p class="upload-hint">支持单个Markdown文件</p>
        </div>
      </div>
      
      <t-alert v-if="error" theme="error" :message="error" />
      
      <!-- 加载中提示 -->
      <div v-if="loading" class="loading-container">
        <t-loading />
        <p>上传中...</p>
      </div>
      
      <!-- 文件内容展示 -->
      <div v-if="fileContent" class="content-container">
        <div class="content-header">
          <div class="header-left">
            <h3>{{ fileName }}</h3>
          </div>
          <div class="header-right">
            <t-tooltip :content="copySuccess ? '复制成功！' : '复制为纯文本'">
              <t-button theme="primary" variant="text" size="small" @click="copyContent">
                <template #icon><t-icon name="file-copy" /></template>
                复制纯文本
              </t-button>
            </t-tooltip>
            <t-switch v-model="showRawContent" size="small" style="margin-left: 10px">
              <template #label>查看原始内容</template>
            </t-switch>
            <t-button theme="default" size="small" @click="clearFile" style="margin-left: 10px">清除</t-button>
          </div>
        </div>
        <t-card :bordered="true" hover-shadow>
          <!-- 原始内容 -->
          <pre v-if="showRawContent" class="content-display">{{ fileContent }}</pre>
          
          <!-- 渲染后的内容 -->
          <div v-else class="markdown-content" v-html="renderedContent"></div>
        </t-card>
      </div>
    </t-space>
  </div>
</template>

<style scoped>
.uploader-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.drop-area {
  border: 2px dashed #dcdcdc;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
}

.drop-area:hover {
  border-color: #0052d9;
  background-color: rgba(0, 82, 217, 0.03);
}

.drag-active {
  border-color: #0052d9;
  background-color: rgba(0, 82, 217, 0.05);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-hint {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
}

.content-container {
  margin-top: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
}

.content-display {
  white-space: pre-wrap;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  overflow-x: auto;
  max-height: 500px;
  overflow-y: auto;
}

/* 为了允许渲染的Markdown正确显示 */
:deep(.markdown-content) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  max-height: 500px;
  overflow-y: auto;
  padding: 0 4px;
}

:deep(.markdown-content h1),
:deep(.markdown-content h2),
:deep(.markdown-content h3),
:deep(.markdown-content h4),
:deep(.markdown-content h5),
:deep(.markdown-content h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

:deep(.markdown-content h1) {
  font-size: 2em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

:deep(.markdown-content h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

:deep(.markdown-content h3) {
  font-size: 1.25em;
}

:deep(.markdown-content p) {
  margin-top: 0;
  margin-bottom: 16px;
}

:deep(.markdown-content a) {
  color: #0052d9;
  text-decoration: none;
}

:deep(.markdown-content a:hover) {
  text-decoration: underline;
}

:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  padding-left: 2em;
  margin-top: 0;
  margin-bottom: 16px;
}

:deep(.markdown-content li) {
  margin-bottom: 0.25em;
}

:deep(.markdown-content code) {
  font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
}

:deep(.markdown-content pre) {
  font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
  margin-bottom: 16px;
}

:deep(.markdown-content pre code) {
  padding: 0;
  margin: 0;
  background-color: transparent;
  border: 0;
  word-break: normal;
  white-space: pre;
}

:deep(.markdown-content blockquote) {
  margin: 0 0 16px;
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #dfe2e5;
}

:deep(.markdown-content table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
  overflow: auto;
}

:deep(.markdown-content table th),
:deep(.markdown-content table td) {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

:deep(.markdown-content table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}
</style> 