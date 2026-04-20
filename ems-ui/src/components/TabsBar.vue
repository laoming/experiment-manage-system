<template>
  <div class="tabs-bar" v-if="tabs.length > 0">
    <div class="tabs-container" ref="tabsContainerRef">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: tab.key === currentTab, 'tab-unclosable': !tab.closable }"
        @click="handleSwitchTab(tab)"
        @contextmenu.prevent="showContextMenu($event, tab)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-title">{{ tab.title }}</span>
        <span
          v-if="tab.closable"
          class="tab-close"
          @click.stop="handleCloseTab(tab)"
          :class="{ 'show-close': tab.key === currentTab }"
        >✕</span>
      </div>
    </div>
    <div class="tabs-actions">
      <button class="tabs-action-btn" @click="handleCloseOtherTabs" title="关闭其他">✕ 其他</button>
      <button class="tabs-action-btn" @click="handleCloseAllTabs" title="关闭全部">✕ 全部</button>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="contextMenuVisible"
        class="context-menu"
        :style="{ top: contextMenuY + 'px', left: contextMenuX + 'px' }"
      >
        <div
          v-if="currentContextTab && currentContextTab.closable"
          class="context-menu-item"
          @click="handleContextMenuClose"
        >关闭</div>
        <div class="context-menu-item" @click="handleContextMenuCloseOther">关闭其他</div>
        <div class="context-menu-item" @click="handleContextMenuCloseAll">关闭全部</div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TabsManager from '@/utils/tabsManager'

const router = useRouter()
const route = useRoute()

const tabs = ref([])
const currentTab = ref('')
const tabsContainerRef = ref(null)

// 右键菜单状态
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const currentContextTab = ref(null)

// 初始化标签页
const initTabs = () => {
  TabsManager.init()
  tabs.value = TabsManager.getTabs()
  currentTab.value = TabsManager.getCurrentTab()
}

// 添加标签页
const addTab = (tabInfo) => {
  const newTab = {
    key: tabInfo.key || tabInfo.path,
    title: tabInfo.title,
    path: tabInfo.path,
    icon: tabInfo.icon || TabsManager.getMenuIcon(tabInfo.title),
    closable: tabInfo.closable !== false
  }
  TabsManager.addTab(newTab)
  tabs.value = TabsManager.getTabs()
  currentTab.value = newTab.key
}

// 切换标签页
const handleSwitchTab = (tab) => {
  if (tab.key === currentTab.value) return
  currentTab.value = tab.key
  TabsManager.saveCurrentTab(tab.key)
  if (tab.path) {
    router.push(tab.path)
  }
}

// 关闭标签页
const handleCloseTab = (tab) => {
  TabsManager.closeTab(tab.key, router)
  tabs.value = TabsManager.getTabs()
  currentTab.value = TabsManager.getCurrentTab()
}

// 关闭其他标签页
const handleCloseOtherTabs = () => {
  if (!currentTab.value) return
  TabsManager.closeOtherTabs(currentTab.value)
  tabs.value = TabsManager.getTabs()
}

// 关闭所有标签页
const handleCloseAllTabs = () => {
  TabsManager.closeAllTabs()
  tabs.value = TabsManager.getTabs()
  currentTab.value = ''
  router.push('/home')
}

// 显示右键菜单
const showContextMenu = (event, tab) => {
  currentContextTab.value = tab
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  contextMenuVisible.value = true
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenuVisible.value = false
  currentContextTab.value = null
}

// 右键菜单操作
const handleContextMenuClose = () => {
  if (currentContextTab.value) {
    handleCloseTab(currentContextTab.value)
  }
  hideContextMenu()
}

const handleContextMenuCloseOther = () => {
  if (currentContextTab.value) {
    TabsManager.closeOtherTabs(currentContextTab.value.key)
    tabs.value = TabsManager.getTabs()
    currentTab.value = currentContextTab.value.key
  }
  hideContextMenu()
}

const handleContextMenuCloseAll = () => {
  handleCloseAllTabs()
  hideContextMenu()
}

// 根据路径获取标题 - 必须在 watch 之前定义
const getRouteTitle = (path) => {
  const titleMap = {
    '/home': '首页',
    '/user': '用户管理',
    '/role': '角色管理',
    '/organization': '组织管理',
    '/menu': '菜单管理',
    '/course': '课程管理',
    '/my-course': '我的课程',
    '/template-list': '实验模板',
    '/template': '模板编辑',
    '/report': '实验报告',
    '/message': '消息管理',
    '/notice': '公告管理'
  }
  return titleMap[path] || '页面'
}

// 根据路径获取图标 - 必须在 watch 之前定义
const getRouteIcon = (path) => {
  const iconMap = {
    '/home': '🏠',
    '/user': '👤',
    '/role': '👥',
    '/organization': '🏢',
    '/menu': '📑',
    '/course': '📚',
    '/my-course': '📖',
    '/template-list': '🧪',
    '/template': '📝',
    '/report': '📋',
    '/message': '💬',
    '/notice': '📢'
  }
  return iconMap[path] || '📄'
}

// 监听路由变化，自动添加标签页
watch(
  () => route.path,
  (path) => {
    // 登录页不添加标签页
    if (path === '/login') return

    // 查找是否已存在该路径的标签页
    const existingTab = tabs.value.find(t => t.path === path)
    if (existingTab) {
      // 如果标签页已存在，切换到该标签页
      currentTab.value = existingTab.key
      TabsManager.saveCurrentTab(existingTab.key)
    } else {
      // 如果不存在，创建新的标签页
      const title = getRouteTitle(path)
      const icon = getRouteIcon(path)
      addTab({
        key: path,
        title,
        path,
        icon,
        closable: path !== '/home' // 首页不可关闭
      })
    }
  },
  { immediate: true }
)

// 点击其他地方隐藏右键菜单
onMounted(() => {
  initTabs()
  document.addEventListener('click', hideContextMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', hideContextMenu)
})

// 暴露方法供外部调用
defineExpose({
  addTab,
  closeTab: handleCloseTab,
  closeAllTabs: handleCloseAllTabs,
  clearAll: TabsManager.clearAll
})
</script>

<style lang="scss" scoped>
.tabs-bar {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  height: 42px;
  background: white;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  padding-left: 240px; /* sidebar width + 20px padding */
  z-index: 99;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.tabs-container {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 13px;
  color: #666;
  position: relative;
  min-width: 100px;
  max-width: 200px;

  &:hover {
    background: #e8e8e8;
    color: #667eea;
  }

  &.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
  }
}

.tab-icon {
  font-size: 14px;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-close {
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
  padding: 2px;
  border-radius: 3px;
  margin-left: 4px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.tab-close.show-close,
.tab-item:hover .tab-close {
  opacity: 1;
}

.tab-item.active .tab-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 不可关闭的标签页 */
.tab-unclosable {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 40px;
    background: linear-gradient(to left, rgba(255, 255, 255, 0.3), transparent);
    pointer-events: none;
  }
}

.tabs-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
  flex-shrink: 0;
}

.tabs-action-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: #f5f5f5;
    color: #667eea;
    border-color: #667eea;
  }
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 3000;
  min-width: 120px;
}

.context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
    color: #667eea;
  }

  &:first-child {
    border-radius: 4px 4px 0 0;
  }

  &:last-child {
    border-radius: 0 0 4px 4px;
  }
}
</style>
