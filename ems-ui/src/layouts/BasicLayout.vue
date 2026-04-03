<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <div class="logo-icon">EMS</div>
          <div class="logo-text">实验报告管理系统</div>
        </div>
        <div class="user-info">
          <span class="user-name clickable" @click="openProfile" title="点击修改个人信息">
            欢迎, {{ userInfo?.displayName || '用户' }}
          </span>
          <button class="logout-btn" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </header>

    <!-- 标签页栏 -->
    <TabsBar ref="tabsBarRef" />

    <div class="layout-body">
      <!-- 侧边栏菜单 -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <el-menu
          :default-active="activeMenu"
          :collapse="sidebarCollapsed"
          :collapse-transition="false"
          class="sidebar-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/home">
            <el-icon><HomeFilled /></el-icon>
            <template #title>首页</template>
          </el-menu-item>

          <el-sub-menu index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/user">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/role">
              <el-icon><UserFilled /></el-icon>
              <span>角色管理</span>
            </el-menu-item>
            <el-menu-item index="/organization">
              <el-icon><OfficeBuilding /></el-icon>
              <span>组织管理</span>
            </el-menu-item>
            <el-menu-item index="/menu">
              <el-icon><Menu /></el-icon>
              <span>菜单管理</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="course">
            <template #title>
              <el-icon><Reading /></el-icon>
              <span>课程管理</span>
            </template>
            <el-menu-item index="/course">
              <el-icon><Collection /></el-icon>
              <span>课程列表</span>
            </el-menu-item>
            <el-menu-item index="/my-course">
              <el-icon><Notebook /></el-icon>
              <span>我的课程</span>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="experiment">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>实验管理</span>
            </template>
            <el-menu-item index="/template-list">
              <el-icon><Files /></el-icon>
              <span>实验模板</span>
            </el-menu-item>
            <el-menu-item index="/report">
              <el-icon><Tickets /></el-icon>
              <span>实验报告</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/message">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>消息管理</template>
          </el-menu-item>

          <el-menu-item index="/notice">
            <el-icon><Bell /></el-icon>
            <template #title>公告管理</template>
          </el-menu-item>
        </el-menu>

        <!-- 折叠按钮 -->
        <div class="sidebar-toggle" @click="toggleSidebar">
          <el-icon v-if="sidebarCollapsed"><Expand /></el-icon>
          <el-icon v-else><Fold /></el-icon>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="main-content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <keep-alive :max="10">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </main>
    </div>

    <!-- 修改个人信息弹窗 -->
    <el-dialog v-model="showProfileModal" title="修改个人信息" width="500px">
      <el-form :model="profileForm" label-width="100px">
        <el-form-item label="账号">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>
        <el-form-item label="用户名称" required>
          <el-input v-model="profileForm.displayName" placeholder="请输入用户名称" />
        </el-form-item>
        <el-form-item label="旧密码">
          <el-input v-model="profileForm.oldPassword" type="password" placeholder="如不修改密码请留空" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="profileForm.newPassword" type="password" placeholder="如不修改密码请留空" />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input v-model="profileForm.confirmPassword" type="password" placeholder="如不修改密码请留空" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeProfile">取消</el-button>
        <el-button type="primary" @click="handleProfileSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { updateProfile, changePassword } from '@/api/user'
import { getUserInfo } from '@/utils/auth'
import TabsBar from '@/components/TabsBar.vue'
import TabsManager from '@/utils/tabsManager'

const router = useRouter()
const route = useRoute()

const userInfo = ref(null)
const sidebarCollapsed = ref(false)
const tabsBarRef = ref(null)

const showProfileModal = ref(false)
const profileForm = reactive({
  username: '',
  displayName: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const profileLoading = ref(false)

const activeMenu = computed(() => route.path)

onMounted(() => {
  userInfo.value = getUserInfo()
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const goHome = () => {
  router.push('/home')
}

// 菜单选择处理
const handleMenuSelect = (index) => {
  // 跳转到对应路由
  router.push(index)
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 清除标签页
    TabsManager.clearAll()
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    ElMessage.success('已退出登录')
    router.push('/login')
  }).catch(() => {})
}

const openProfile = () => {
  if (userInfo.value) {
    profileForm.username = userInfo.value.username || ''
    profileForm.displayName = userInfo.value.displayName || ''
  }
  showProfileModal.value = true
}

const closeProfile = () => {
  showProfileModal.value = false
  profileForm.oldPassword = ''
  profileForm.newPassword = ''
  profileForm.confirmPassword = ''
}

const handleProfileSubmit = async () => {
  if (!profileForm.displayName.trim()) {
    ElMessage.warning('请输入用户名称')
    return
  }

  // 检查密码修改
  if (profileForm.newPassword || profileForm.oldPassword || profileForm.confirmPassword) {
    if (!profileForm.oldPassword) {
      ElMessage.warning('请输入旧密码')
      return
    }
    if (!profileForm.newPassword) {
      ElMessage.warning('请输入新密码')
      return
    }
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      ElMessage.warning('两次输入的密码不一致')
      return
    }
    if (profileForm.newPassword.length < 6) {
      ElMessage.warning('密码长度不能少于6位')
      return
    }
  }

  profileLoading.value = true
  try {
    // 更新个人信息
    const updateRes = await updateProfile({
      id: userInfo.value.id,
      displayName: profileForm.displayName
    })
    
    if (updateRes.code !== 200) {
      ElMessage.error(updateRes.message || '修改失败')
      return
    }

    // 修改密码
    if (profileForm.newPassword) {
      const pwdRes = await changePassword({
        oldPassword: profileForm.oldPassword,
        newPassword: profileForm.newPassword
      })
      if (pwdRes.code !== 200) {
        ElMessage.error(pwdRes.message || '密码修改失败')
        return
      }
    }

    // 更新本地存储
    userInfo.value.displayName = profileForm.displayName
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

    ElMessage.success('个人信息修改成功')
    closeProfile()
  } catch (e) {
    ElMessage.error('修改失败: ' + (e.message || '未知错误'))
  } finally {
    profileLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 导航栏样式 */
.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
}

.header-content {
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 18px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-name {
  color: #333;
  font-weight: 500;
  cursor: default;
  transition: all 0.3s;

  &.clickable {
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;

    &:hover {
      background: #f5f5f5;
      color: #667eea;
    }
  }
}

.logout-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;

  &:hover {
    background: #e0e0e0;
    color: #333;
  }
}

/* 布局主体 */
.layout-body {
  display: flex;
  padding-top: 102px; /* header height (60px) + tabs-bar height (42px) */
  min-height: calc(100vh - 102px);
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  position: fixed;
  left: 0;
  top: 60px; /* 紧贴 header */
  bottom: 0;
  z-index: 100;
  transition: width 0.3s;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: 64px;
  }
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  overflow-y: auto;

  &:not(.el-menu--collapse) {
    width: 220px;
  }
}

.sidebar-toggle {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-top: 1px solid #ebeef5;
  color: #666;
  transition: all 0.3s;

  &:hover {
    background: #f5f7fa;
    color: #667eea;
  }
}

/* 主内容区域 */
.main-content {
  flex: 1;
  margin-left: 220px;
  padding: 20px;
  min-height: calc(100vh - 102px);
  transition: margin-left 0.3s;
}

/* 侧边栏折叠时的样式 */
.app-layout.sidebar-collapsed {
  .layout-body {
    .main-content {
      margin-left: 64px;
    }
  }
  
  .sidebar {
    width: 64px;
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    z-index: 200;
    transform: translateX(-100%);
    
    &.collapsed {
      transform: translateX(0);
      width: 220px;
    }
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
