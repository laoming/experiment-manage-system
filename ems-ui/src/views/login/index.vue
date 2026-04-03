<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>实验报告管理系统</h1>
        <p>Experiment Report Management System</p>
      </div>
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="form.rememberMe">记住我</el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>&copy; 2026 实验报告管理系统. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/auth'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

onMounted(() => {
  const savedUsername = localStorage.getItem('saved_username')
  if (savedUsername) {
    form.username = savedUsername
    form.rememberMe = true
  }
})

const handleLogin = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  loading.value = true
  
  try {
    const res = await login(form.username, form.password)
    
    if (res.code === 200) {
      // 保存 token
      localStorage.setItem('token', res.data)
      
      // 解析 token 获取用户信息
      const userInfo = parseToken(res.data)
      if (userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
      }
      
      // 记住用户名
      if (form.rememberMe) {
        localStorage.setItem('saved_username', form.username)
      } else {
        localStorage.removeItem('saved_username')
      }
      
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

const parseToken = (token) => {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    const decoder = new TextDecoder('utf-8')
    const decoded = decoder.decode(bytes)
    const claims = JSON.parse(decoded)
    
    return {
      id: claims.userId || claims.id || '',
      username: claims.sub || claims.username || '',
      displayName: claims.displayName || '',
      roleId: claims.roleId || ''
    }
  } catch (error) {
    console.error('解析Token失败:', error)
    return null
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  padding: 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    font-size: 26px;
    color: #333;
    margin-bottom: 8px;
    font-weight: 600;
  }
  
  p {
    font-size: 13px;
    color: #999;
    margin: 0;
  }
}

.login-form {
  .el-input {
    --el-input-border-radius: 8px;
  }
  
  .el-checkbox {
    --el-checkbox-font-size: 14px;
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  
  &:hover,
  &:focus {
    background: linear-gradient(135deg, #5a6fd6 0%, #6a4196 100%);
  }
}

.login-footer {
  text-align: center;
  margin-top: 32px;
  color: #999;
  font-size: 12px;
  
  p {
    margin: 0;
  }
}

:deep(.el-input__wrapper) {
  padding: 0 15px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  
  &:hover {
    box-shadow: 0 0 0 1px #667eea inset;
  }
  
  &.is-focus {
    box-shadow: 0 0 0 1px #667eea inset;
  }
}

:deep(.el-input__inner) {
  height: 44px;
  line-height: 44px;
}
</style>
