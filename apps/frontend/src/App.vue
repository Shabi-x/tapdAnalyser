<script setup lang="ts">
import QueryInput from './components/QueryInput.vue'
import FileUploader from './components/FileUploader.vue'
import { ref } from 'vue'

const activeTab = ref('upload') // 默认显示文件上传
const showResultPanel = ref(true) // 控制结果面板的显示
const toggleResultPanel = () => {
  showResultPanel.value = !showResultPanel.value
}
</script>

<template>
  <div class="app-container">
    <t-layout>
      <t-header class="header">
        <div class="logo-container">
          <img src="/tapd-logo.svg" alt="TAPD Logo" class="tapd-logo" />
          <div class="logo">TAPD Analyser</div>
        </div>
        <div class="header-actions">
          <t-switch size="small">
            <template #label>深色模式</template>
          </t-switch>
          <t-avatar size="small" class="user-avatar">
            <template #icon><t-icon name="user" /></template>
          </t-avatar>
        </div>
      </t-header>
      <t-content class="content">
        <div class="main-layout">
          <!-- 左侧内容区 -->
          <div class="content-panel" :class="{ 'expanded': !showResultPanel }">
            <t-tabs v-model="activeTab" theme="card" size="medium">
              <t-tab-panel value="upload" label="Markdown上传">
                <template #icon><t-icon name="file" /></template>
                <FileUploader />
              </t-tab-panel>
              <t-tab-panel value="query" label="TAPD需求">
                <template #icon><t-icon name="link" /></template>
                <QueryInput />
              </t-tab-panel>
              <!-- <t-tab-panel value="history" label="历史">
                <template #icon><t-icon name="history" /></template>
                <div class="empty-placeholder">
                  <t-icon name="history" size="large" />
                  <p>历史记录功能即将上线</p>
                </div>
              </t-tab-panel> -->
            </t-tabs>
            <t-button class="toggle-btn" shape="circle" @click="toggleResultPanel">
              <t-icon :name="showResultPanel ? 'chevron-right' : 'chevron-left'" />
            </t-button>
          </div>
          
          <!-- 右侧结果区 -->
          <div v-if="showResultPanel" class="result-panel">
            <div class="panel-header">
              <h3>分析结果</h3>
              <t-space>
                <t-button theme="primary" variant="text" size="small">
                  <template #icon><t-icon name="download" /></template>
                  导出
                </t-button>
                <t-button theme="primary" variant="text" size="small">
                  <template #icon><t-icon name="code" /></template>
                  应用
                </t-button>
              </t-space>
            </div>
            <div class="result-content">
              <!-- 结果展示区域 -->
              <div class="empty-content">
                <img src="/tapd-logo.svg" alt="TAPD Logo" class="empty-logo" />
                <t-empty 
                  description="请先上传Markdown文件或输入TAPD链接" 
                  image=""
                />
                <div class="empty-tips">
                  <p>支持以下功能：</p>
                  <ul>
                    <li>上传Markdown文件进行分析</li>
                    <li>输入TAPD链接获取需求详情</li>
                    <li>对内容进行结构化分析</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </t-content>
      <t-footer class="footer">
        TAPD Analyzer &copy; {{ new Date().getFullYear() }}
      </t-footer>
    </t-layout>
  </div>
</template>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 0 24px;
  background: linear-gradient(90deg, #3B7CFF, #4B8FFF);
  color: white;
  height: 60px;
  line-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-container:hover {
  transform: translateY(-2px);
}

.tapd-logo {
  height: 32px;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.logo {
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  cursor: pointer;
  background-color: rgba(255, 255, 255, 0.2);
}

.content {
  flex: 1;
  padding: 0;
  background-color: #F9FAFB;
  overflow: hidden;
}

.main-layout {
  display: flex;
  height: 100%;
}

.content-panel {
  flex: 1;
  position: relative;
  transition: all 0.3s ease;
  max-width: 60%;
}

.content-panel.expanded {
  max-width: 95%;
}

.result-panel {
  width: 40%;
  border-left: 1px solid #EAEAEA;
  display: flex;
  flex-direction: column;
  background-color: white;
  transition: all 0.3s ease;
}

.toggle-btn {
  position: absolute;
  right: -15px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.panel-header {
  padding: 16px;
  border-bottom: 1px solid #EAEAEA;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.empty-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #999;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}

.empty-logo {
  height: 60px;
  width: auto;
  margin-bottom: 20px;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.empty-tips {
  margin-top: 20px;
  padding: 16px;
  background-color: var(--color-primary-light);
  border-radius: 8px;
  width: 80%;
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.empty-tips p {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--color-primary-dark);
}

.empty-tips ul {
  margin: 0;
  padding-left: 20px;
}

.empty-tips li {
  margin-bottom: 6px;
  color: var(--color-text-secondary);
}

.footer {
  text-align: center;
  padding: 12px;
  color: #666;
  background-color: #f0f0f0;
  font-size: 14px;
}
</style>
