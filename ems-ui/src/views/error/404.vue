<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.error-page {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.error-content {
  text-align: center;
  
  .error-code {
    font-size: 120px;
    font-weight: 600;
    color: #667eea;
    margin-bottom: 20px;
    line-height: 1;
  }
  
  .error-message {
    font-size: 18px;
    color: #666;
    margin-bottom: 30px;
  }
}
</style>
