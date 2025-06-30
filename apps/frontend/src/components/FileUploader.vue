<script setup lang="ts">
import { ref, computed } from 'vue';
import { md, renderMarkdown, markdownToPlainText } from '../utils/markdownUtils';
import { isValidMarkdownFile, uploadFile as uploadFileToServer, copyToClipboard } from '../utils/fileUtils';
import axios from 'axios';

const fileContent = ref('');
const fileName = ref('');
const loading = ref(false);
const error = ref('');
const dragActive = ref(false);
const showRawContent = ref(false);
const copySuccess = ref(false);
const configResult = ref('');
const convertLoading = ref(false);
const convertError = ref('');

// 定义emit
const emit = defineEmits(['analysis-result', 'analysis-loading', 'analysis-error']);


// 计算属性：渲染后的Markdown
const renderedContent = computed(() => {
  return renderMarkdown(fileContent.value);
});

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
  configResult.value = '';
  convertError.value = '';
  // 通知父组件清除结果
  emit('analysis-result', { content: '', sourceFile: '', type: 'markdown' });
};

// 分析内容
const analyzeContent = async () => {
  if (!fileContent.value) {
    error.value = '请先上传文件';
    return;
  }
  
  convertLoading.value = true;
  convertError.value = '';
  
  // 通知父组件加载状态变化
  emit('analysis-loading', true);
  
  try {
    console.log('正在分析内容，生成配置代码');
    
    // 使用MCPClient处理Markdown转换
    // 假设我们有一个MCP客户端API端点
    const response = await axios.post('http://localhost:3003/api/mcp/query', {
      query: `请将以下Markdown文档转换为仪表盘配置代码：\n\n${fileContent.value}`
    });
    
    if (response.data.error) {
      convertError.value = response.data.error;
      // 通知父组件错误
      emit('analysis-error', response.data.error);
    } else {
      configResult.value = response.data.result || '未能生成有效的配置代码';
      // 通知父组件结果
      emit('analysis-result', {
        content: configResult.value,
        sourceFile: fileName.value,
        type: 'markdown'
      });
    }
  } catch (err) {
    console.error('生成配置代码失败:', err);
    convertError.value = '生成配置代码失败，请稍后再试';
    // 通知父组件错误
    emit('analysis-error', '生成配置代码失败，请稍后再试');
  } finally {
    convertLoading.value = false;
    // 通知父组件加载状态变化
    emit('analysis-loading', false);
  }
};

// 复制配置代码
const copyConfig = async () => {
  if (!configResult.value) return;
  
  try {
    await copyToClipboard(configResult.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('复制失败:', err);
    error.value = '复制到剪贴板失败';
  }
};
</script>

<template>
  <div class="uploader-container">
    <div class="layout-container">
      <!-- 左侧内容区域 -->
      <div class="left-section">
        <!-- 文件内容获取区域 -->
        <t-card :bordered="true" hover-shadow class="upload-card">
          <div class="card-header">
            <h3>内容获取</h3>
          </div>
          
          <!-- 文件上传区域 -->
          <t-space direction="vertical" size="small" style="width: 100%">
            <div>
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
                  <p class="upload-text">拖拽MD文件到此处或点击上传</p>
                </div>
              </div>
            </div>
            
            <t-alert v-if="error" theme="error" :message="error" />
            
            <!-- 加载中提示 -->
            <div v-if="loading" class="loading-container">
              <t-loading />
              <p>上传中...</p>
            </div>
          </t-space>
        </t-card>
        
        <!-- 内容展示区域 -->
        <t-card v-if="fileContent" :bordered="true" hover-shadow class="content-card">
          <template #title>
            <div class="content-header">
              <div class="header-left">
                <t-tag theme="primary" variant="light">{{ fileName }}</t-tag>
              </div>
              <div class="header-right">
                <t-tooltip :content="copySuccess ? '复制成功！' : '复制为纯文本'">
                  <t-button variant="text" size="small" @click="copyContent">
                    <template #icon><t-icon name="file-copy" /></template>
                  </t-button>
                </t-tooltip>
                <t-switch v-model="showRawContent" size="small">
                  <template #label>{{ showRawContent ? '源码' : '预览' }}</template>
                </t-switch>
                <t-button variant="text" size="small" @click="clearFile">
                  <template #icon><t-icon name="delete" /></template>
                </t-button>
              </div>
            </div>
          </template>
          
          <!-- 内容显示 -->
          <div class="content-wrapper">
            <!-- 原始内容 -->
            <pre v-if="showRawContent" class="content-display">{{ fileContent }}</pre>
            
            <!-- 渲染后的内容 -->
            <div v-else class="markdown-content" v-html="renderedContent"></div>
          </div>
          
          <!-- 分析控制 -->
          <template #footer>
            <div class="footer-actions">
              <t-button theme="primary" @click="analyzeContent" :loading="convertLoading">
                <template #icon><t-icon name="play" /></template>
                生成配置代码
              </t-button>
            </div>
          </template>
        </t-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.uploader-container {
  width: 100%;
  padding: 16px;
}

.layout-container {
  display: flex;
  gap: 16px;
}

.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0; /* 防止内容溢出 */
}

.upload-card, .content-card {
  width: 100%;
  background: white;
  border-radius: 8px;
  transition: all 0.3s;
  overflow: hidden;
  position: relative;
}

.content-card::after {
  content: '';
  position: absolute;
  bottom: 60px;
  right: 20px;
  width: 100px;
  height: 40px;
  background-image: url('/tapd-logo.svg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.08;
  pointer-events: none;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2C2C2C;
}

.drop-area {
  border: 2px dashed #dcdcdc;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  background: linear-gradient(180deg, #F5F9FF, #EFF7FF);
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-area:hover {
  border-color: #3B7CFF;
  box-shadow: 0 0 8px rgba(59, 124, 255, 0.2);
  transform: translateY(-2px);
}

.drag-active {
  border-color: #3B7CFF;
  background: linear-gradient(180deg, #F5F9FF, #EFF7FF);
  box-shadow: 0 0 12px rgba(59, 124, 255, 0.3);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-text {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 16px 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 4px;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-wrapper {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #EAEAEA;
  border-radius: 4px;
  padding: 12px;
  background-color: #FAFAFA;
}

.content-display {
  white-space: pre-wrap;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 为了允许渲染的Markdown正确显示 */
:deep(.markdown-content) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
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
  font-size: 1.8em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

:deep(.markdown-content h2) {
  font-size: 1.4em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

:deep(.markdown-content h3) {
  font-size: 1.2em;
}

:deep(.markdown-content p) {
  margin-top: 0;
  margin-bottom: 16px;
}

:deep(.markdown-content a) {
  color: #3B7CFF;
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