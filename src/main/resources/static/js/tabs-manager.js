/**
 * 标签页管理器
 * 管理多个打开的标签页状态
 */
const TabsManager = {
    storageKey: 'ems_tabs',
    currentTabKey: 'ems_current_tab',
    homeTab: {
        key: 'home',
        title: '首页',
        path: '/ems/pages/home.html',
        icon: '🏠',
        closable: false
    },

    /**
     * 获取所有标签页
     */
    getTabs() {
        try {
            const tabs = localStorage.getItem(this.storageKey);
            let tabsArray = [];
            
            // 尝试解析localStorage中的数据
            if (tabs) {
                try {
                    tabsArray = JSON.parse(tabs);
                    // 确保解析结果为数组
                    if (!Array.isArray(tabsArray)) {
                        tabsArray = [];
                    }
                } catch (parseError) {
                    console.error('解析标签页数据失败:', parseError);
                    tabsArray = [];
                }
            }
            
            // 确保首页标签页始终存在且在第一个位置
            if (tabsArray.length === 0 || tabsArray[0].key !== 'home') {
                tabsArray.unshift(this.homeTab);
            }
            
            // 确保所有标签页都有必需的字段
            tabsArray = tabsArray.filter(tab => tab && tab.key && tab.title && tab.path);
            
            return tabsArray;
        } catch (error) {
            console.error('获取标签页失败:', error);
            return [this.homeTab];
        }
    },

    /**
     * 保存标签页
     */
    saveTabs(tabs) {
        try {
            // 确保传入的是数组
            if (!Array.isArray(tabs)) {
                console.error('saveTabs: tabs 必须是数组');
                return;
            }
            
            // 过滤掉无效的标签页
            const validTabs = tabs.filter(tab => tab && tab.key && tab.title && tab.path);
            
            // 确保首页标签页始终存在且在第一个位置
            if (validTabs.length === 0 || validTabs[0].key !== 'home') {
                validTabs.unshift(this.homeTab);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(validTabs));
        } catch (error) {
            console.error('保存标签页失败:', error);
        }
    },

    /**
     * 获取当前活动标签页
     */
    getCurrentTab() {
        try {
            const currentTab = localStorage.getItem(this.currentTabKey);
            // 如果当前标签页为空或无效，默认为首页
            if (!currentTab || typeof currentTab !== 'string' || currentTab.trim() === '') {
                return 'home';
            }
            return currentTab;
        } catch (error) {
            console.error('获取当前标签页失败:', error);
            return 'home';
        }
    },

    /**
     * 保存当前活动标签页
     */
    saveCurrentTab(tabKey) {
        try {
            // 确保传入的key是有效的字符串
            const validKey = (tabKey && typeof tabKey === 'string' && tabKey.trim() !== '') ? tabKey : 'home';
            localStorage.setItem(this.currentTabKey, validKey);
        } catch (error) {
            console.error('保存当前标签页失败:', error);
        }
    },

    /**
     * 打开一个标签页
     * @param {Object} menu - 菜单对象
     * @param {string} menu.id - 菜单ID
     * @param {string} menu.menuName - 菜单名称
     * @param {string} menu.path - 菜单路径
     */
    async openTab(menu) {
        console.log('📌 [TabsManager] openTab - 开始处理菜单:', menu);

        try {
            if (!menu) {
                console.error('[TabsManager] 无效的菜单: menu 为空');
                return;
            }

            if (!menu.path) {
                console.error('[TabsManager] 无效的菜单: menu.path 为空', menu);
                alert('菜单路径配置错误，请联系管理员');
                return;
            }

            if (!menu.id) {
                console.error('[TabsManager] 无效的菜单: menu.id 为空', menu);
                alert('菜单ID配置错误，请联系管理员');
                return;
            }

            const tabs = this.getTabs();
            const tabKey = String(menu.id);

            console.log('📌 [TabsManager] openTab - tabKey:', tabKey);
            console.log('📌 [TabsManager] openTab - 当前标签页列表:', tabs.map(t => ({ key: t.key, title: t.title })));

            // 检查标签页是否已存在
            const existingIndex = tabs.findIndex(tab => tab.key === tabKey);

            if (existingIndex > -1) {
                console.log('📌 [TabsManager] openTab - 标签页已存在，索引:', existingIndex);
                // 标签页已存在，只更新 currentTab（SPA模式下不需要跳转）
                this.saveCurrentTab(tabKey);
            } else {
                console.log('📌 [TabsManager] openTab - 标签页不存在，添加新标签页');
                // 添加新标签页（跳过首页）
                if (tabKey !== 'home') {
                    const menuTitle = menu.menuName || '页面';
                    tabs.push({
                        key: tabKey,
                        title: menuTitle,
                        path: menu.path,
                        icon: this.getMenuIcon(menuTitle),
                        closable: true,
                        loaded: false
                    });
                    this.saveTabs(tabs);
                    console.log('📌 [TabsManager] openTab - 新标签页已保存:', { key: tabKey, title: menuTitle, path: menu.path });
                }
                this.saveCurrentTab(tabKey);
            }

            // 触发自定义事件，通知页面加载内容
            console.log('📌 [TabsManager] openTab - 触发布局加载事件');
            window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey } }));
        } catch (error) {
            console.error('[TabsManager] 打开标签页失败:', error);
            console.error('[TabsManager] 错误堆栈:', error.stack);
            // 发生错误时，显示错误提示而不是跳转
            alert('打开菜单失败: ' + (error.message || '未知错误'));
        }
    },

    /**
     * 打开标签页（简化版，用于页面内跳转）
     * @param {string} path - 目标路径
     * @param {string} title - 标签页标题
     */
    openTabByPath(path, title) {
        try {
            if (!path) {
                console.warn('无效的路径:', path);
                return;
            }

            const tabs = this.getTabs();

            // 生成唯一的标签页 key
            const pathHash = this.generateTabKey(path);

            // 检查标签页是否已存在
            const existingIndex = tabs.findIndex(tab => tab.key === pathHash);

            if (existingIndex > -1) {
                // 标签页已存在，检查当前路径是否已经是目标路径
                if (!this.isCurrentPath(path)) {
                    // 当前路径不是目标路径，需要跳转
                    this.saveCurrentTab(pathHash);
                    window.location.href = path;
                } else {
                    // 已经在目标路径，只更新 currentTab
                    this.saveCurrentTab(pathHash);
                    console.log('📌 [TabsManager] 已在目标路径，只更新标签页状态');
                }
            } else {
                // 添加新标签页
                const pageTitle = title || this.extractTitleFromPath(path);
                tabs.push({
                    key: pathHash,
                    title: pageTitle,
                    path: path,
                    icon: this.getMenuIcon(pageTitle),
                    closable: true
                });
                this.saveTabs(tabs);
                this.saveCurrentTab(pathHash);
                window.location.href = path;
            }
        } catch (error) {
            console.error('[TabsManager] 打开标签页失败:', error);
            // 发生错误时跳转到首页
            this.saveCurrentTab('home');
            window.location.href = this.homeTab.path;
        }
    },

    /**
     * 生成标签页的唯一 key
     */
    generateTabKey(path) {
        // 使用路径生成唯一 key（去除 query 参数）
        const baseKey = path.split('?')[0];
        return 'page_' + btoa(baseKey).replace(/[+=]/g, '');
    },

    /**
     * 检查当前路径是否匹配目标路径
     * @param {string} targetPath - 目标路径
     * @returns {boolean}
     */
    isCurrentPath(targetPath) {
        const currentPath = window.location.pathname;
        // 移除 query 参数进行比较
        const basePath = currentPath.split('?')[0];
        const targetBasePath = targetPath.split('?')[0];
        return basePath === targetBasePath;
    },

    /**
     * 从路径中提取标题
     */
    extractTitleFromPath(path) {
        const match = path.match(/\/pages\/([^-]+?)(-list|-edit)?\.html/);
        if (match) {
            const baseName = match[1];
            return this.formatTitle(baseName);
        }
        return '页面';
    },

    /**
     * 格式化标题
     */
    formatTitle(name) {
        const titles = {
            'experiment-template': '实验模板编辑',
            'experiment-template-list': '实验模板管理',
            'user': '用户管理',
            'organization': '组织管理',
            'home': '首页',
            'experiment-report': '实验报告',
            'course-list': '课程管理',
            'course': '课程管理'
        };
        return titles[name] || name;
    },

    /**
     * 关闭标签页
     * @param {string} tabKey - 标签页的key
     * @param {Function} callback - 关闭后的回调函数（已废弃，保留参数兼容性）
     */
    closeTab(tabKey, callback) {
        try {
            const tabs = this.getTabs();
            const currentTab = this.getCurrentTab();
            const index = tabs.findIndex(tab => tab.key === tabKey);

            console.log('📌 [TabsManager] closeTab - 关闭标签页:', tabKey);
            console.log('📌 [TabsManager] closeTab - 当前标签页:', currentTab);
            console.log('📌 [TabsManager] closeTab - 所有标签页:', tabs.map(t => ({ key: t.key, title: t.title })));

            if (index === -1) {
                console.warn('标签页不存在:', tabKey);
                return;
            }

            // 不允许关闭首页标签页
            if (tabKey === 'home') {
                console.warn('首页标签页不可关闭');
                return;
            }

            // 移除标签页
            tabs.splice(index, 1);
            this.saveTabs(tabs);
            console.log('📌 [TabsManager] closeTab - 删除后的标签页:', tabs.map(t => ({ key: t.key, title: t.title })));
            window.dispatchEvent(new CustomEvent('tab-close', { detail: { closedKeys: [tabKey] } }));


            // 如果关闭的是当前标签页，需要切换到其他标签页
            if (currentTab === tabKey) {
                if (tabs.length > 0) {
                    // 切换到前一个标签页或第一个标签页
                    const newIndex = Math.max(0, index - 1);
                    const nextTab = tabs[newIndex];
                    console.log('📌 [TabsManager] closeTab - 切换到标签页:', nextTab.key, nextTab.title);

                    // 保存当前标签页并触发切换事件（SPA模式下不跳转）
                    this.saveCurrentTab(nextTab.key);
                    window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey: nextTab.key } }));
                } else {
                    // 没有标签页了，返回首页
                    console.log('📌 [TabsManager] closeTab - 没有其他标签页，返回首页');
                    this.saveCurrentTab('home');
                    window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey: 'home' } }));
                }
            }
            // 注意：不再使用 callback，因为页面跳转后会重新加载组件
            // 新页面加载时会从 localStorage 读取最新的状态
        } catch (error) {
            console.error('[TabsManager] 关闭标签页失败:', error);
            // 发生错误时切换到首页
            this.saveCurrentTab('home');
            window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey: 'home' } }));
        }
    },

    /**
     * 切换到指定标签页
     * @param {string} tabKey - 标签页的key
     */
    switchTab(tabKey) {
        try {
            const tabs = this.getTabs();
            const tab = tabs.find(t => t.key === tabKey);

            if (!tab) {
                console.warn('标签页不存在:', tabKey);
                // 切换到首页
                this.saveCurrentTab('home');
                window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey: 'home' } }));
                return;
            }

            // 保存当前标签页
            this.saveCurrentTab(tabKey);

            // 触发切换事件（SPA模式下不跳转）
            window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey } }));
        } catch (error) {
            console.error('[TabsManager] 切换标签页失败:', error);
            // 发生错误时切换到首页
            this.saveCurrentTab('home');
            window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey: 'home' } }));
        }
    },

    /**
     * 关闭其他标签页
     * @param {string} tabKey - 要保留的标签页key
     */
    closeOtherTabs(tabKey) {
        try {
            const tabs = this.getTabs();
            const targetTab = tabs.find(tab => tab.key === tabKey);

            if (targetTab) {
                const closedKeys = tabs
                    .filter(tab => tab.key !== 'home' && tab.key !== tabKey)
                    .map(tab => tab.key);

                // 保留首页和目标标签页
                const tabsToKeep = [this.homeTab];
                if (tabKey !== 'home') {
                    tabsToKeep.push(targetTab);
                }
                this.saveTabs(tabsToKeep);
                this.saveCurrentTab(tabKey);
                if (closedKeys.length > 0) {
                    window.dispatchEvent(new CustomEvent('tab-close', { detail: { closedKeys } }));
                }
                // 触发切换事件（SPA模式下不跳转）
                window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey } }));
            }
        } catch (error) {
            console.error('[TabsManager] 关闭其他标签页失败:', error);
            // 发生错误时，只保留首页
            this.saveTabs([this.homeTab]);
            this.saveCurrentTab('home');
            window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey: 'home' } }));
        }
    },

    /**
     * 关闭所有可关闭的标签页
     */
    closeAllTabs() {
        const tabs = this.getTabs();
        const closedKeys = tabs.filter(tab => tab.key !== 'home').map(tab => tab.key);

        // 只保留首页
        this.saveTabs([this.homeTab]);
        this.saveCurrentTab('home');
        if (closedKeys.length > 0) {
            window.dispatchEvent(new CustomEvent('tab-close', { detail: { closedKeys } }));
        }
        // 触发切换事件（SPA模式下不跳转）
        window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey: 'home' } }));
    },

    /**
     * 获取菜单图标
     */
    getMenuIcon(menuName) {
        const iconMap = {
            '用户列表': '👤',
            '角色管理': '👥',
            '菜单管理': '📋',
            '组织列表': '🏢',
            '实验项目': '📝',
            '实验数据': '📊',
            '数据统计': '📈',
            '实验模板': '📝',
            '实验报告': '📄',
            '首页': '🏠',
            '课程管理': '📚',
            '课程': '📚'
        };
        return iconMap[menuName] || '📄';
    },

    /**
     * 清除所有标签页（用于退出登录时）
     */
    clearAll() {
        this.saveTabs([]);
        this.saveCurrentTab('');
    },

    /**
     * 初始化（首次加载时调用）
     */
    init() {
        // 确保首页标签页存在
        const tabs = this.getTabs();
        if (tabs.length === 0 || tabs[0].key !== 'home') {
            this.saveTabs([this.homeTab]);
            this.saveCurrentTab('home');
        }
    }
};
