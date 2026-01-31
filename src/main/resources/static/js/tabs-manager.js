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
            const tabsArray = tabs ? JSON.parse(tabs) : [];
            
            // 确保首页标签页始终存在且在第一个位置
            if (tabsArray.length === 0 || tabsArray[0].key !== 'home') {
                tabsArray.unshift(this.homeTab);
            }
            
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
            // 确保首页标签页始终存在且在第一个位置
            if (tabs.length === 0 || tabs[0].key !== 'home') {
                tabs.unshift(this.homeTab);
            }
            localStorage.setItem(this.storageKey, JSON.stringify(tabs));
        } catch (error) {
            console.error('保存标签页失败:', error);
        }
    },

    /**
     * 获取当前活动标签页
     */
    getCurrentTab() {
        try {
            const currentTab = localStorage.getItem(this.currentTabKey) || '';
            // 如果当前标签页为空，默认为首页
            return currentTab || 'home';
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
            localStorage.setItem(this.currentTabKey, tabKey || 'home');
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
    openTab(menu) {
        if (!menu || !menu.path) {
            console.warn('无效的菜单:', menu);
            return;
        }

        const tabs = this.getTabs();
        const tabKey = menu.id;

        // 检查标签页是否已存在
        const existingIndex = tabs.findIndex(tab => tab.key === tabKey);

        if (existingIndex > -1) {
            // 标签页已存在，检查当前路径是否已经是目标路径
            if (!this.isCurrentPath(menu.path)) {
                // 当前路径不是目标路径，需要跳转
                this.saveCurrentTab(tabKey);
                window.location.href = menu.path;
            } else {
                // 已经在目标路径，只更新 currentTab
                this.saveCurrentTab(tabKey);
                console.log('📌 [TabsManager] 已在目标路径，只更新标签页状态');
            }
        } else {
            // 添加新标签页（跳过首页）
            if (tabKey !== 'home') {
                tabs.push({
                    key: tabKey,
                    title: menu.menuName,
                    path: menu.path,
                    icon: this.getMenuIcon(menu.menuName),
                    closable: true
                });
                this.saveTabs(tabs);
            }
            this.saveCurrentTab(tabKey);
            window.location.href = menu.path;
        }
    },

    /**
     * 打开标签页（简化版，用于页面内跳转）
     * @param {string} path - 目标路径
     * @param {string} title - 标签页标题
     */
    openTabByPath(path, title) {
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
            'experiment-report': '实验报告'
        };
        return titles[name] || name;
    },

    /**
     * 关闭标签页
     * @param {string} tabKey - 标签页的key
     * @param {Function} callback - 关闭后的回调函数（已废弃，保留参数兼容性）
     */
    closeTab(tabKey, callback) {
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

        // 如果关闭的是当前标签页，需要切换到其他标签页
        if (currentTab === tabKey) {
            if (tabs.length > 0) {
                // 切换到前一个标签页或第一个标签页
                const newIndex = Math.max(0, index - 1);
                const nextTab = tabs[newIndex];
                console.log('📌 [TabsManager] closeTab - 切换到标签页:', nextTab.key, nextTab.title, nextTab.path);
                console.log('📌 [TabsManager] closeTab - 当前URL:', window.location.pathname);
                console.log('📌 [TabsManager] closeTab - 目标URL:', nextTab.path);

                // 保存当前标签页
                this.saveCurrentTab(nextTab.key);

                // 检查当前URL是否已经是目标URL
                if (this.isCurrentPath(nextTab.path)) {
                    console.log('📌 [TabsManager] closeTab - 已在目标URL，不跳转');
                    // 已在目标URL，强制刷新页面
                    window.location.reload();
                } else {
                    console.log('📌 [TabsManager] closeTab - 执行跳转到:', nextTab.path);
                    window.location.href = nextTab.path;
                }
            } else {
                // 没有标签页了，返回首页
                console.log('📌 [TabsManager] closeTab - 没有其他标签页，返回首页');
                this.saveCurrentTab('home');
                console.log('📌 [TabsManager] closeTab - 当前URL:', window.location.pathname);
                console.log('📌 [TabsManager] closeTab - 目标URL:', this.homeTab.path);

                // 检查当前URL是否已经是首页
                if (this.isCurrentPath(this.homeTab.path)) {
                    console.log('📌 [TabsManager] closeTab - 已在首页URL，刷新页面');
                    // 已在首页，强制刷新
                    window.location.reload();
                } else {
                    console.log('📌 [TabsManager] closeTab - 执行跳转到首页:', this.homeTab.path);
                    window.location.href = this.homeTab.path;
                }
            }
        }
        // 注意：不再使用 callback，因为页面跳转后会重新加载组件
        // 新页面加载时会从 localStorage 读取最新的状态
    },

    /**
     * 切换到指定标签页
     * @param {string} tabKey - 标签页的key
     */
    switchTab(tabKey) {
        const tabs = this.getTabs();
        const tab = tabs.find(t => t.key === tabKey);

        if (tab) {
            this.saveCurrentTab(tabKey);
            window.location.href = tab.path;
        } else {
            console.warn('标签页不存在:', tabKey);
        }
    },

    /**
     * 关闭其他标签页
     * @param {string} tabKey - 要保留的标签页key
     */
    closeOtherTabs(tabKey) {
        const tabs = this.getTabs();
        const targetTab = tabs.find(tab => tab.key === tabKey);

        if (targetTab) {
            // 保留首页和目标标签页
            const tabsToKeep = [this.homeTab];
            if (tabKey !== 'home') {
                tabsToKeep.push(targetTab);
            }
            this.saveTabs(tabsToKeep);
            this.saveCurrentTab(tabKey);
        }
    },

    /**
     * 关闭所有可关闭的标签页
     */
    closeAllTabs() {
        // 只保留首页
        this.saveTabs([this.homeTab]);
        this.saveCurrentTab('home');
        window.location.href = this.homeTab.path;
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
            '首页': '🏠'
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
