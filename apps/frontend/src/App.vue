<script setup lang="ts">
import QueryInput from './components/QueryInput.vue'
</script>

<template>
  <div class="app-container">
    <t-layout>
      <t-header class="header">
        <div class="logo">TAPD分析器</div>
      </t-header>
      <t-content class="content">
        <QueryInput />
      </t-content>
      <t-footer class="footer">
        TAPD分析器 &copy; {{ new Date().getFullYear() }}
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
  background-color: var(--td-brand-color);
  color: white;
  height: 64px;
  line-height: 64px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.content {
  flex: 1;
  padding: 24px;
  background-color: #f5f5f5;
}

.footer {
  text-align: center;
  padding: 16px;
  color: #666;
  background-color: #f0f0f0;
}
</style>
