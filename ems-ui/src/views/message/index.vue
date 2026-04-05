<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">消息管理</h1>
      <p class="page-subtitle">查看和管理系统消息，支持发送新消息</p>
    </div>

    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="search-box">
        <el-input v-model="queryForm.title" placeholder="输入消息标题搜索" clearable style="width: 200px" />
        <el-select v-model="queryForm.isRead" placeholder="全部状态" clearable style="width: 120px">
          <el-option label="未读" :value="0" />
          <el-option label="已读" :value="1" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">
          <el-icon><Refresh /></el-icon> 重置
        </el-button>
      </div>
      <div class="action-box">
        <el-button type="success" @click="openSendModal">
          <el-icon><Plus /></el-icon> 发送消息
        </el-button>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" v-loading="loading">
      <div v-if="messageList.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无消息" />
      </div>
      <div v-for="msg in messageList" :key="msg.id" class="message-item" :class="{ unread: msg.isRead === 0 }">
        <div class="message-header">
          <div class="message-title">
            <el-badge v-if="msg.isRead === 0" is-dot class="unread-dot" />
            <span>{{ msg.title }}</span>
            <el-tag v-if="msg.senderName" size="small" type="info">{{ msg.senderName }}</el-tag>
          </div>
          <div class="message-time">{{ formatDateTime(msg.createTime) }}</div>
        </div>
        <div class="message-content">{{ msg.content }}</div>
        <div class="message-actions">
          <el-button v-if="msg.isRead === 0" type="primary" link size="small" @click="handleMarkRead(msg)">
            标记已读
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(msg)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="messageList.length > 0">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchMessageList"
        @current-change="fetchMessageList"
      />
    </div>

    <!-- 发送消息弹窗 -->
    <el-dialog 
      v-model="showSendModal" 
      title="发送消息" 
      width="500px" 
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="sendForm" label-width="80px">
        <el-form-item label="消息标题" required>
          <el-input v-model="sendForm.title" placeholder="请输入消息标题" />
        </el-form-item>
        <el-form-item label="接收人" required>
          <el-select v-model="sendForm.receiverId" placeholder="请选择接收人" style="width: 100%" filterable>
            <el-option v-for="user in userOptions" :key="user.id" :label="user.displayName || user.username" :value="user.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息内容" required>
          <el-input v-model="sendForm.content" type="textarea" rows="4" placeholder="请输入消息内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSendModal = false">取消</el-button>
        <el-button type="primary" @click="handleSendMessage" :loading="sending">发送</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated, onDeactivated } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { getMessagePage, markAsRead, deleteMessage, getUnreadCount, sendMessage, getUserSimpleList } from '@/api/message'
import { formatDateTime } from '@/utils/format'
import { getUserInfo } from '@/utils/auth'
import { usePagination, useSearch } from '@/hooks'

// 分页
const { pagination, loading } = usePagination()

// 搜索
const defaultQuery = { title: '', isRead: null }
const { queryForm, handleSearch, handleReset } = useSearch(defaultQuery, () => {
  pagination.current = 1
  fetchMessageList()
})

// 数据
const messageList = ref([])
const unreadCount = ref(0)
const showSendModal = ref(false)
const sending = ref(false)
const userOptions = ref([])

const sendForm = reactive({
  title: '',
  content: '',
  receiverId: ''
})

// 获取消息列表
const fetchMessageList = async () => {
  loading.value = true
  try {
    const res = await getMessagePage({ ...queryForm, ...pagination })
    if (res.code === 200) {
      messageList.value = res.data.records || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

// 获取未读数量
const fetchUnreadCount = async () => {
  const res = await getUnreadCount()
  if (res.code === 200) unreadCount.value = res.data || 0
}

// 获取用户选项
const fetchUserOptions = async () => {
  const res = await getUserSimpleList()
  if (res.code === 200) userOptions.value = res.data || []
}

// 标记已读
const handleMarkRead = async (msg) => {
  const res = await markAsRead(msg.id)
  if (res.code === 200) {
    msg.isRead = 1
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    ElMessage.success('已标记为已读')
  } else {
    ElMessage.error(res.message || '操作失败')
  }
}

// 删除消息
const handleDelete = async (msg) => {
  try {
    const { ElMessageBox } = await import('element-plus')
    await ElMessageBox.confirm('确定删除该消息吗？', '提示', { type: 'warning' })
    const res = await deleteMessage(msg.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      fetchMessageList()
      fetchUnreadCount()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') ElMessage.error('删除失败')
  }
}

// 打开发送弹窗
const openSendModal = () => {
  sendForm.title = ''
  sendForm.content = ''
  sendForm.receiverId = ''
  showSendModal.value = true
}

// 发送消息
const handleSendMessage = async () => {
  if (!sendForm.title.trim()) return ElMessage.warning('请输入消息标题')
  if (!sendForm.receiverId) return ElMessage.warning('请选择接收人')
  if (!sendForm.content.trim()) return ElMessage.warning('请输入消息内容')

  sending.value = true
  try {
    const userInfo = getUserInfo()
    const receiver = userOptions.value.find(u => u.id === sendForm.receiverId)
    const res = await sendMessage({
      title: sendForm.title,
      content: sendForm.content,
      receiverId: sendForm.receiverId,
      receiverName: receiver?.displayName || receiver?.username || '',
      senderId: userInfo?.id,
      senderName: userInfo?.displayName || userInfo?.username || ''
    })
    if (res.code === 200) {
      ElMessage.success('发送成功')
      showSendModal.value = false
      fetchMessageList()
    } else {
      ElMessage.error(res.message || '发送失败')
    }
  } finally {
    sending.value = false
  }
}

onMounted(() => {
  fetchMessageList()
  fetchUnreadCount()
  fetchUserOptions()
})

// 组件被 keep-alive 激活时，确保弹窗关闭
onActivated(() => {
  showSendModal.value = false
})

// 组件被 keep-alive 缓存失活时，关闭弹窗
onDeactivated(() => {
  showSendModal.value = false
})
</script>

<style scoped>
.page-container { padding: 20px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: 600; color: #1a1a2e; margin: 0 0 8px 0; }
.page-subtitle { font-size: 14px; color: #666; margin: 0; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: #fff; padding: 16px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.search-box, .action-box { display: flex; gap: 10px; }
.message-list { background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); min-height: 300px; }
.empty-state { padding: 60px 0; }
.message-item { padding: 16px 20px; border-bottom: 1px solid #ebeef5; transition: background-color 0.2s; }
.message-item:last-child { border-bottom: none; }
.message-item:hover { background-color: #f5f7fa; }
.message-item.unread { background-color: #ecf5ff; }
.message-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.message-title { display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 16px; color: #1a1a2e; }
.unread-dot { margin-right: 4px; }
.message-time { font-size: 12px; color: #999; }
.message-content { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 8px; }
.message-actions { display: flex; gap: 12px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; background: #fff; padding: 16px; border-radius: 8px; }
</style>
