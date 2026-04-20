/**
 * 标签页管理器
 * 管理多标签页的打开、关闭、切换等功能
 */

const TABS_KEY = 'ems_tabs'
const CURRENT_TAB_KEY = 'ems_current_tab'
const TAB_VERSION_KEY = 'ems_tab_versions'

// 菜单图标映射
const menuIconMap = {
  '首页': '🏠',
  '用户管理': '👤',
  '角色管理': '👥',
  '组织管理': '🏢',
  '菜单管理': '📑',
  '课程管理': '📚',
  '课程列表': '📚',
  '我的课程': '📖',
  '实验管理': '🧪',
  '实验模板': '🧪',
  '实验报告': '📋',
  '消息管理': '💬',
  '公告管理': '📢'
}

const TabsManager = {
  /**
   * 初始化标签页管理器
   */
  init() {
    // 如果没有标签页，初始化为空数组
    if (!localStorage.getItem(TABS_KEY)) {
      localStorage.setItem(TABS_KEY, JSON.stringify([]))
    }
    // 如果没有版本计数器，初始化为空对象
    if (!localStorage.getItem(TAB_VERSION_KEY)) {
      localStorage.setItem(TAB_VERSION_KEY, JSON.stringify({}))
    }
  },

  /**
   * 获取所有标签页
   */
  getTabs() {
    try {
      const tabs = localStorage.getItem(TABS_KEY)
      return tabs ? JSON.parse(tabs) : []
    } catch (e) {
      return []
    }
  },

  /**
   * 保存标签页
   */
  saveTabs(tabs) {
    localStorage.setItem(TABS_KEY, JSON.stringify(tabs))
  },

  /**
   * 获取当前标签页 key
   */
  getCurrentTab() {
    return localStorage.getItem(CURRENT_TAB_KEY) || ''
  },

  /**
   * 保存当前标签页 key
   */
  saveCurrentTab(key) {
    localStorage.setItem(CURRENT_TAB_KEY, key)
  },

  /**
   * 获取路径的版本号
   */
  getPathVersion(path) {
    try {
      const versions = JSON.parse(localStorage.getItem(TAB_VERSION_KEY) || '{}')
      return versions[path] || 0
    } catch (e) {
      return 0
    }
  },

  /**
   * 增加路径的版本号（关闭标签页时调用）
   */
  incrementPathVersion(path) {
    try {
      const versions = JSON.parse(localStorage.getItem(TAB_VERSION_KEY) || '{}')
      versions[path] = (versions[path] || 0) + 1
      localStorage.setItem(TAB_VERSION_KEY, JSON.stringify(versions))
    } catch (e) {
      // 忽略错误
    }
  },

  /**
   * 获取带版本号的缓存 key
   */
  getCacheKey(path) {
    const version = this.getPathVersion(path)
    return version > 0 ? `${path}_v${version}` : path
  },

  /**
   * 添加标签页
   */
  addTab(tab) {
    const tabs = this.getTabs()
    // 检查是否已存在相同路径的标签页
    const existingIndex = tabs.findIndex(t => t.path === tab.key)

    if (existingIndex !== -1) {
      // 如果已存在，更新并切换到该标签页
      this.saveCurrentTab(tabs[existingIndex].key)
      return tabs
    } else {
      // 如果不存在，创建新的标签页
      tabs.push({
        ...tab,
        closable: tab.closable !== false // 默认可关闭
      })
      this.saveTabs(tabs)
      this.saveCurrentTab(tab.key)
      return tabs
    }
  },

  /**
   * 关闭标签页
   */
  closeTab(key, router) {
    let tabs = this.getTabs()
    const index = tabs.findIndex(t => t.key === key)

    if (index === -1) return tabs

    const closedTab = tabs[index]

    // 增加该路径的版本号，确保下次打开时创建新实例
    this.incrementPathVersion(closedTab.path)

    // 如果关闭的是当前标签页，需要切换到其他标签页
    const currentTab = this.getCurrentTab()
    if (currentTab === key) {
      // 优先切换到右边的标签页，否则切换到左边
      const nextTab = tabs[index + 1] || tabs[index - 1]
      if (nextTab) {
        this.saveCurrentTab(nextTab.key)
        if (router) {
          router.push(nextTab.path)
        }
      } else {
        this.saveCurrentTab('')
        if (router) {
          router.push('/home')
        }
      }
    }

    // 移除标签页
    tabs = tabs.filter(t => t.key !== key)
    this.saveTabs(tabs)
    return tabs
  },

  /**
   * 关闭其他标签页
   */
  closeOtherTabs(key) {
    let tabs = this.getTabs()
    const currentTab = tabs.find(t => t.key === key)

    // 增加被关闭标签页的版本号
    tabs.forEach(tab => {
      if (tab.key !== key && tab.closable) {
        this.incrementPathVersion(tab.path)
      }
    })

    tabs = tabs.filter(t => t.key === key || !t.closable)
    this.saveTabs(tabs)
    this.saveCurrentTab(key)
    return tabs
  },

  /**
   * 关闭所有可关闭的标签页
   */
  closeAllTabs() {
    let tabs = this.getTabs()

    // 增加所有被关闭标签页的版本号
    tabs.forEach(tab => {
      if (tab.closable) {
        this.incrementPathVersion(tab.path)
      }
    })

    tabs = tabs.filter(t => !t.closable)
    this.saveTabs(tabs)
    this.saveCurrentTab('')
    return tabs
  },

  /**
   * 清除所有标签页（退出登录时调用）
   */
  clearAll() {
    localStorage.removeItem(TABS_KEY)
    localStorage.removeItem(CURRENT_TAB_KEY)
    localStorage.removeItem(TAB_VERSION_KEY)
  },

  /**
   * 获取菜单图标
   */
  getMenuIcon(title) {
    return menuIconMap[title] || '📄'
  },

  /**
   * 切换标签页
   */
  switchTab(key, router) {
    const tabs = this.getTabs()
    const tab = tabs.find(t => t.key === key)
    if (tab) {
      this.saveCurrentTab(key)
      if (router && tab.path) {
        router.push(tab.path)
      }
    }
    return tab
  }
}

export default TabsManager
