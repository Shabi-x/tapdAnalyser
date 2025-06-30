<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3003/api';

const query = ref('');
const result = ref('');
const loading = ref(false);
const error = ref('');

const submitQuery = async () => {
  if (!query.value.trim()) {
    error.value = '请输入查询内容';
    return;
  }
  
  error.value = '';
  loading.value = true;
  
  try {
    const response = await axios.post(`${API_URL}/query`, { query: query.value });
    result.value = response.data.result;
  } catch (err) {
    console.error('查询失败:', err);
    error.value = '查询失败，请稍后再试';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="query-container">
    <h2>TAPD文档分析</h2>
    
    <t-space direction="vertical" size="large" style="width: 100%">
      <t-input
        v-model="query"
        placeholder="请输入您的查询，例如：北京的天气"
        :autofocus="true"
        @keyup.enter="submitQuery"
      />
      
      <t-button 
        theme="primary" 
        :loading="loading" 
        @click="submitQuery"
        style="width: 100%"
      >
        提交查询
      </t-button>
      
      <t-alert v-if="error" theme="error" :message="error" />
      
      <div v-if="result" class="result-container">
        <h3>查询结果</h3>
        <t-card :bordered="true" hover-shadow>
          <div class="result-content">{{ result }}</div>
        </t-card>
      </div>
    </t-space>
  </div>
</template>

<style scoped>
.query-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.result-container {
  margin-top: 20px;
}

.result-content {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style> 