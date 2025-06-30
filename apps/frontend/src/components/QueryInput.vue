<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3003/api';

const tapdUrl = ref('');
const result = ref('');
const loading = ref(false);
const error = ref('');
const showHistory = ref(false);

// 假设的查询历史
const urlHistory = ref([
  { id: 1, text: 'https://tapd.oa.com/example/prong/stories/view/123456789', time: '2023-10-15' },
  { id: 2, text: 'https://tapd.oa.com/example/prong/stories/view/987654321', time: '2023-10-12' }
]);

// 验证TAPD URL
const isValidTapdUrl = (url: string): boolean => {
  return url.trim().startsWith('https://tapd.oa.com/') || url.trim().startsWith('http://tapd.oa.com/');
};

// 获取TAPD内容
const fetchTapdContent = async () => {
  if (!tapdUrl.value.trim()) {
    error.value = '请输入TAPD链接';
    return;
  }
  
  if (!isValidTapdUrl(tapdUrl.value)) {
    error.value = '请输入有效的TAPD链接，以 https://tapd.oa.com/ 开头';
    return;
  }
  
  error.value = '';
  loading.value = true;
  
  try {
    // 使用正确的接口格式调用后端的fetchWebContent工具
    const response = await axios.post(`${API_URL}/query`, { 
      query: `总结这个网页的内容：${tapdUrl.value}`
    });
    
    if (response.data && response.data.error) {
      error.value = response.data.error;
    } else {
      result.value = response.data || '暂无相关内容返回';
      
      // 将链接添加到历史记录
      if (!urlHistory.value.some(item => item.text === tapdUrl.value)) {
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        
        urlHistory.value.unshift({
          id: Date.now(),
          text: tapdUrl.value,
          time: dateStr
        });
        
        // 限制历史记录最多5条
        if (urlHistory.value.length > 5) {
          urlHistory.value.pop();
        }
      }
    }
  } catch (err) {
    console.error('获取TAPD内容失败:', err);
    error.value = '获取TAPD内容失败，请确认链接是否正确或稍后再试';
  } finally {
    loading.value = false;
  }
};

const useHistoryUrl = (text: string) => {
  tapdUrl.value = text;
  showHistory.value = false;
};

const clearResult = () => {
  result.value = '';
};

// 复制内容到剪贴板
const copyContent = async () => {
  if (!result.value) return;
  
  try {
    await navigator.clipboard.writeText(result.value);
    // 可以添加复制成功的提示
  } catch (err) {
    console.error('复制失败:', err);
    error.value = '复制到剪贴板失败';
  }
};

// 提取需求要点
const extractRequirements = () => {
  if (!result.value) return;
  
  // 这里可以实现提取需求要点的逻辑
  console.log('提取需求要点:', result.value);
};

// 进一步分析
const analyzeContent = () => {
  if (!result.value) return;
  
  // 这里可以实现进一步分析的逻辑
  console.log('进一步分析:', result.value);
};
</script>

<template>
  <div class="query-container">
    <!-- TAPD链接输入区域 -->
    <t-card :bordered="true" hover-shadow class="input-card">
      <div class="card-header">
        <h3>TAPD链接获取</h3>
        <t-button theme="primary" variant="text" size="small" @click="showHistory = !showHistory">
          <template #icon><t-icon name="history" /></template>
          历史记录
        </t-button>
      </div>
      
      <t-space direction="vertical" size="small" style="width: 100%">
        <div class="web-input-container">
          <t-input
            v-model="tapdUrl"
            placeholder="输入TAPD链接 (例如: https://tapd.oa.com/prong/stories/view/123456789)"
            :autofocus="true"
            @keyup.enter="fetchTapdContent"
          >
            <template #prefix>
              <t-icon name="link" />
            </template>
          </t-input>
          
          <t-button 
            theme="primary" 
            :loading="loading" 
            @click="fetchTapdContent"
          >
            获取
          </t-button>
        </div>
        
        <div v-if="showHistory" class="history-dropdown">
          <t-list :split="true" size="small">
            <t-list-item v-for="item in urlHistory" :key="item.id" @click="useHistoryUrl(item.text)">
              <template #content>
                <div class="history-item">
                  <t-icon name="history" />
                  <span class="history-url">{{ item.text }}</span>
                  <small>{{ item.time }}</small>
                </div>
              </template>
            </t-list-item>
          </t-list>
        </div>
        
        <t-alert v-if="error" theme="error" :message="error" />
        
        <div v-if="loading" class="loading-container">
          <t-loading />
          <p>获取TAPD内容中...</p>
        </div>
      </t-space>
    </t-card>
    
    <!-- 结果展示区域 -->
    <t-card v-if="result" :bordered="true" hover-shadow class="content-card">
      <template #title>
        <div class="content-header">
          <div class="header-left">
            <t-tag theme="primary" variant="light">TAPD内容</t-tag>
          </div>
          <div class="header-right">
            <t-button variant="text" size="small" @click="clearResult">
              <template #icon><t-icon name="delete" /></template>
            </t-button>
          </div>
        </div>
      </template>
      
      <div class="content-wrapper">
        <div class="result-content">{{ result }}</div>
      </div>
      
      <template #footer>
        <div class="footer-actions">
          <t-space>
            <t-button variant="outline" size="small" @click="copyContent">
              <template #icon><t-icon name="file-copy" /></template>
              复制
            </t-button>
            <t-button variant="outline" size="small" @click="extractRequirements">
              <template #icon><t-icon name="code" /></template>
              提取要求
            </t-button>
          </t-space>
          <t-button theme="primary" size="small" @click="analyzeContent">
            进一步分析
          </t-button>
        </div>
      </template>
    </t-card>
  </div>
</template>

<style scoped>
.query-container {
  width: 100%;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-card, .content-card {
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

.web-input-container {
  display: flex;
  gap: 8px;
}

.history-dropdown {
  border: 1px solid #EAEAEA;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  background-color: white;
  z-index: 100;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  cursor: pointer;
}

.history-url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.history-item small {
  margin-left: auto;
  color: #999;
  font-size: 12px;
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

.result-content {
  white-space: pre-wrap;
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 