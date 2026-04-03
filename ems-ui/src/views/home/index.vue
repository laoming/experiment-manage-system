<template>
  <div class="home-page">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎使用实验报告管理系统</h1>
      <p class="welcome-subtitle">Experiment Report Management System - 高效、便捷的实验管理平台</p>

      <div class="welcome-info">
        <div class="info-item">
          <span class="info-label">登录时间</span>
          <span class="info-value">{{ loginTime }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">系统状态</span>
          <span class="info-value" style="color: #52c41a;">运行中</span>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="(stat, index) in stats" :key="index">
        <div class="stat-icon" :style="{ background: stat.color }">
          {{ stat.icon }}
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 公告与消息区域 -->
    <div class="notice-message-section">
      <div class="notice-message-container">
        <!-- 公告列表 -->
        <div class="notice-card">
          <div class="card-header">
            <span class="card-icon">📢</span>
            <h3 class="card-title">公告</h3>
          </div>
          <div class="card-content">
            <div v-if="noticeLoading" class="loading-text">加载中...</div>
            <div v-else-if="noticeList.length === 0" class="empty-text">暂无公告</div>
            <div v-else>
              <div
                v-for="notice in noticeList"
                :key="notice.id"
                class="list-item"
                @click="viewNotice(notice)"
              >
                <div class="list-item-dot"></div>
                <div class="list-item-content">
                  <div class="list-item-title">{{ notice.title }}</div>
                </div>
                <div class="list-item-time">{{ notice.createTime }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="notice-card">
          <div class="card-header">
            <span class="card-icon">💬</span>
            <h3 class="card-title">消息</h3>
          </div>
          <div class="card-content">
            <div v-if="messageLoading" class="loading-text">加载中...</div>
            <div v-else-if="messageList.length === 0" class="empty-text">暂无消息</div>
            <div v-else>
              <div
                v-for="message in messageList"
                :key="message.id"
                class="list-item"
                @click="viewMessage(message)"
              >
                <div class="list-item-dot"></div>
                <div class="list-item-content">
                  <div class="list-item-title">{{ message.title }}</div>
                </div>
                <div class="list-item-time">{{ message.createTime }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getHomeStats, getHomeNotices, getHomeMessages } from '@/api/home'
import { markAsRead } from '@/api/message'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const userInfo = ref(null)
const loginTime = ref('')

const stats = ref([
  { icon: '📄', label: '实验报告', value: 0, color: '#409eff' },
  { icon: '📝', label: '实验模板', value: 0, color: '#67c23a' },
  { icon: '📚', label: '课程数量', value: 0, color: '#e6a23c' },
  { icon: '🔔', label: '未读消息', value: 0, color: '#f56c6c' }
])

const noticeList = ref([])
const noticeLoading = ref(false)
const messageList = ref([])
const messageLoading = ref(false)

onMounted(async () => {
  const info = localStorage.getItem('userInfo')
  if (info) {
    userInfo.value = JSON.parse(info)
  }

  // 设置登录时间
  const now = new Date()
  loginTime.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  // 加载数据
  await Promise.all([
    loadStats(),
    loadNotices(),
    loadMessages()
  ])
})

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await getHomeStats()
    if (res.code === 200 && res.data) {
      stats.value[0].value = res.data.reportCount || 0
      stats.value[1].value = res.data.templateCount || 0
      stats.value[2].value = res.data.courseCount || 0
      stats.value[3].value = res.data.unreadMessageCount || 0
    }
  } catch (e) {
    console.error('加载统计数据失败:', e)
  }
}

// 加载公告
const loadNotices = async () => {
  noticeLoading.value = true
  try {
    const res = await getHomeNotices(5)
    if (res.code === 200 && res.data) {
      noticeList.value = (res.data.records || []).map(n => ({
        ...n,
        createTime: formatDateTime(n.createTime)
      }))
    }
  } catch (e) {
    console.error('加载公告失败:', e)
  } finally {
    noticeLoading.value = false
  }
}

// 加载消息
const loadMessages = async () => {
  messageLoading.value = true
  try {
    const res = await getHomeMessages(5)
    if (res.code === 200 && res.data) {
      messageList.value = (res.data.records || []).map(m => ({
        ...m,
        createTime: formatDateTime(m.createTime)
      }))
    }
  } catch (e) {
    console.error('加载消息失败:', e)
  } finally {
    messageLoading.value = false
  }
}

// 查看公告
const viewNotice = (notice) => {
  ElMessageBox.alert(notice.content || '暂无内容', notice.title, {
    confirmButtonText: '确定'
  })
}

// 查看消息
const viewMessage = async (message) => {
  ElMessageBox.alert(message.content || '暂无内容', message.title, {
    confirmButtonText: '标记已读'
  }).then(async () => {
    try {
      await markAsRead(message.id)
      // 从列表中移除
      const idx = messageList.value.findIndex(m => m.id === message.id)
      if (idx > -1) {
        messageList.value.splice(idx, 1)
        stats.value[3].value = Math.max(0, stats.value[3].value - 1)
      }
    } catch (e) {
      console.error('标记已读失败:', e)
    }
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.home-page {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 欢迎区域 */
.welcome-section {
  background: white;
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.welcome-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 24px;
}

.welcome-info {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 14px;
  color: #999;
}

.info-value {
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.stat-info {
  .stat-number {
    font-size: 28px;
    font-weight: 600;
    color: #333;
  }

  .stat-label {
    font-size: 14px;
    color: #999;
  }
}

/* 公告消息区域 */
.notice-message-section {
  margin-top: 20px;
}

.notice-message-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.notice-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.card-icon {
  font-size: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-content {
  padding: 16px 20px;
  min-height: 200px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #fafafa;
    margin: 0 -20px;
    padding: 12px 20px;
  }
}

.list-item-dot {
  width: 6px;
  height: 6px;
  background: #667eea;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
}

.list-item-content {
  flex: 1;
  overflow: hidden;
}

.list-item-title {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-time {
  font-size: 12px;
  color: #999;
  margin-left: 16px;
  flex-shrink: 0;
}

.loading-text,
.empty-text {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .welcome-section {
    padding: 24px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .welcome-info {
    gap: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .notice-message-container {
    grid-template-columns: 1fr;
  }
}
</style>
