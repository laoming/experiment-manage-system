/**
 * 顶部导航栏 Vue 组件
 */
const HeaderComponent = {
    template: `
        <div>
            <div class="header">
                <div class="header-content">
                    <div class="logo" @click="goHome">
                        <div class="logo-icon">EMS</div>
                        <div>
                            <div class="logo-text">实验报告管理系统</div>
                        </div>
                    </div>
                    <div class="user-info">
                        <span class="user-name clickable" @click="openProfile" title="点击修改个人信息">
                            欢迎, {{ username }}
                        </span>
                        <button class="logout-btn" @click="handleLogout">退出登录</button>
                    </div>
                </div>
            </div>

            <!-- 标签栏 -->
            <div class="tabs-bar" v-if="tabs.length > 0">
                <div class="tabs-container">
                    <div
                        v-for="tab in tabs"
                        :key="tab.key"
                        class="tab-item"
                        :class="{ active: tab.key === currentTab, 'tab-unclosable': !tab.closable }"
                        @click="switchTab(tab.key)"
                        @contextmenu.prevent="showContextMenu($event, tab)"
                    >
                        <span class="tab-icon">{{ tab.icon }}</span>
                        <span class="tab-title">{{ tab.title }}</span>
                        <span
                            v-if="tab.closable"
                            class="tab-close"
                            @click.stop="closeTab(tab.key)"
                            :class="{ 'show-close': tab.key === currentTab }"
                        >✕</span>
                    </div>
                </div>
                <div class="tabs-actions">
                    <button class="tabs-action-btn" @click="closeOtherTabs(currentTab)" title="关闭其他">✕ 其他</button>
                    <button class="tabs-action-btn" @click="closeAllTabs" title="关闭全部">✕ 全部</button>
                </div>
            </div>

            <!-- 右键菜单 -->
            <div
                class="context-menu"
                :class="{ show: showMenu }"
                :style="{ top: menuY + 'px', left: menuX + 'px' }"
                v-if="showMenu"
            >
                <div
                    v-if="currentContextTab && currentContextTab.closable"
                    class="context-menu-item"
                    @click="closeTab(currentContextTab.key)"
                >关闭</div>
                <div class="context-menu-item" @click="closeOtherTabs(currentContextTab.key)">关闭其他</div>
                <div class="context-menu-item" @click="closeAllTabs">关闭全部</div>
            </div>

            <!-- 修改个人信息弹窗 -->
            <div class="modal-overlay" v-if="showProfileModal" @click.self="closeProfile">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>修改个人信息</h2>
                        <button class="modal-close" @click="closeProfile">✕</button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="handleProfileSubmit">
                            <div class="form-group">
                                <label class="form-label">账号</label>
                                <input
                                    :value="profileForm.username"
                                    type="text"
                                    class="form-input"
                                    disabled
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label">用户名称 <span class="required">*</span></label>
                                <input
                                    v-model="profileForm.displayName"
                                    type="text"
                                    class="form-input"
                                    placeholder="请输入用户名称"
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label">旧密码</label>
                                <input
                                    v-model="profileForm.oldPassword"
                                    type="password"
                                    class="form-input"
                                    placeholder="如不修改密码请留空"
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label">新密码</label>
                                <input
                                    v-model="profileForm.newPassword"
                                    type="password"
                                    class="form-input"
                                    placeholder="如不修改密码请留空"
                                >
                            </div>
                            <div class="form-group">
                                <label class="form-label">确认新密码</label>
                                <input
                                    v-model="profileForm.confirmPassword"
                                    type="password"
                                    class="form-input"
                                    placeholder="如不修改密码请留空"
                                >
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" @click="closeProfile">
                                    取消
                                </button>
                                <button type="submit" class="btn btn-primary">
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            username: '',
            showProfileModal: false,
            profileForm: {
                username: '',
                displayName: '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            tabs: [],
            currentTab: '',
            showMenu: false,
            menuX: 0,
            menuY: 0,
            currentContextTab: null
        };
    },
    mounted() {
        // 使用 try-catch 确保导航栏组件始终能正常初始化
        try {
            this.initUsername();
            TabsManager.init();
            this.initTabs();
            document.addEventListener('click', this.hideContextMenu);
            // 监听标签页切换事件
            window.addEventListener('tab-switch', this.handleTabSwitchEvent);
        } catch (error) {
            console.error('导航栏初始化失败:', error);
        }
    },

    beforeUnmount() {
        document.removeEventListener('click', this.hideContextMenu);
        window.removeEventListener('tab-switch', this.handleTabSwitchEvent);
    },

    beforeUnmount() {
        document.removeEventListener('click', this.hideContextMenu);
    },
    methods: {
        /**
         * 初始化用户名
         */
        initUsername() {
            try {
                const displayName = Auth.getDisplayName();
                if (displayName) {
                    this.username = displayName;
                } else {
                    const userInfo = Auth.getUserInfo();
                    if (userInfo && userInfo.username) {
                        this.username = userInfo.username;
                    } else {
                        // 如果无法获取用户信息，使用默认值
                        this.username = '用户';
                    }
                }
            } catch (error) {
                console.error('[Header] 初始化用户名失败:', error);
                this.username = '用户';
            }
        },

        /**
         * 打开个人信息弹窗
         */
        openProfile() {
            try {
                const userInfo = Auth.getUserInfo();
                this.profileForm = {
                    username: (userInfo && userInfo.username) ? userInfo.username : '',
                    displayName: (userInfo && userInfo.displayName) ? userInfo.displayName : '',
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                };
                this.showProfileModal = true;
            } catch (error) {
                console.error('[Header] 打开个人信息弹窗失败:', error);
                this.profileForm = {
                    username: '',
                    displayName: '',
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                };
                this.showProfileModal = true;
            }
        },

        /**
         * 关闭个人信息弹窗
         */
        closeProfile() {
            this.showProfileModal = false;
            this.profileForm = {
                username: '',
                displayName: '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
        },

        /**
         * 提交个人信息修改
         */
        async handleProfileSubmit() {
            if (!this.profileForm.displayName.trim()) {
                alert('请输入用户名称');
                return;
            }

            if (this.profileForm.newPassword || this.profileForm.oldPassword) {
                if (!this.profileForm.oldPassword) {
                    alert('请输入旧密码');
                    return;
                }
                if (!this.profileForm.newPassword) {
                    alert('请输入新密码');
                    return;
                }
                if (this.profileForm.newPassword !== this.profileForm.confirmPassword) {
                    alert('两次输入的密码不一致');
                    return;
                }
                if (this.profileForm.newPassword.length < 6) {
                    alert('新密码长度不能少于6位');
                    return;
                }
            }

            try {
                const response = await fetch('/user/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.profileForm.username,
                        displayName: this.profileForm.displayName
                    })
                });

                if (response.code === 200) {
                    if (this.profileForm.newPassword) {
                        const passwordResponse = await fetch('/user/resetPassword', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username: this.profileForm.username,
                                password: this.profileForm.newPassword
                            })
                        });

                        if (passwordResponse.code === 200) {
                            alert('个人信息和密码修改成功，请重新登录');
                            Auth.logout();
                        } else {
                            alert('密码修改失败：' + (passwordResponse.message || '未知错误'));
                        }
                    } else {
                        alert('个人信息修改成功');
                        this.initUsername();
                        this.closeProfile();
                    }
                } else {
                    alert('个人信息修改失败：' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('修改个人信息失败:', error);
                alert('修改失败：' + (error.message || '网络错误，请稍后重试'));
            }
        },

        /**
         * 返回首页
         */
        goHome() {
            this.currentTab = 'home';
            TabsManager.saveCurrentTab('home');
            window.location.href = '/ems/common/pages/home.html';

        },

        /**
         * 退出登录
         */
        handleLogout() {
            if (confirm('确定要退出登录吗？')) {
                // 清除所有标签页
                TabsManager.clearAll();
                Auth.logout();
            }
        },

        /**
         * 处理标签页切换事件
         */
        handleTabSwitchEvent(event) {
            const { tabKey } = event.detail;
            console.log('📌 [Header] 收到标签页切换事件:', tabKey);

            // 更新当前标签页
            this.currentTab = tabKey;

            // 更新标签页列表（同步最新状态）
            this.tabs = TabsManager.getTabs();
        },

        /**
         * 初始化标签页
         */
        initTabs() {
            try {
                const currentPath = window.location.pathname;
                console.log('📌 [Header] initTabs - 当前路径:', currentPath);

                // 确保获取到的标签页是数组
                const tabsFromManager = TabsManager.getTabs();
                this.tabs = Array.isArray(tabsFromManager) ? tabsFromManager : [];
                console.log('📌 [Header] initTabs - 读取的标签页:', this.tabs.map(t => ({ key: t.key, title: t.title })));

                this.currentTab = TabsManager.getCurrentTab() || 'home';
                console.log('📌 [Header] initTabs - 当前标签页key:', this.currentTab);

                // 检查当前页面是否在标签页中
                const currentPageTabs = this.tabs.filter(tab => tab.path && tab.path.includes(currentPath));
                console.log('📌 [Header] initTabs - 匹配的标签页:', currentPageTabs.map(t => ({ key: t.key, title: t.title, path: t.path })));

                if (currentPageTabs.length > 0) {
                    // 当前页面在标签页中，更新 currentTab 为匹配的标签页
                    const matchedTab = currentPageTabs[0];
                    console.log('📌 [Header] 当前页面匹配标签页:', matchedTab.key, matchedTab.title);
                    this.currentTab = matchedTab.key;
                    TabsManager.saveCurrentTab(matchedTab.key);
                } else {
                    // 检查是否是首页
                    if (currentPath.includes('home.html')) {
                        console.log('📌 [Header] 当前页面是首页');
                        this.currentTab = 'home';
                        TabsManager.saveCurrentTab('home');
                        return;
                    }

                    // 当前页面不在标签页中，需要添加
                    const pageTitle = document.title ? document.title.replace('实验报告管理系统 - ', '') : '页面';
                    this.addTabForCurrentPage(pageTitle, currentPath);
                }
            } catch (error) {
                console.error('[Header] 初始化标签页失败:', error);
                // 发生错误时，使用默认值
                this.tabs = TabsManager.getTabs();
                this.currentTab = 'home';
            }
        },

        /**
         * 为当前页面添加标签页
         */
        addTabForCurrentPage(title, path) {
            try {
                const tabKey = 'page_' + Date.now();
                const newTab = {
                    key: tabKey,
                    title: title || '页面',
                    path: path || window.location.pathname,
                    icon: TabsManager.getMenuIcon(title),
                    closable: true
                };
                
                // 确保tabs是数组
                if (!Array.isArray(this.tabs)) {
                    this.tabs = [];
                }
                
                this.tabs.push(newTab);
                TabsManager.saveTabs(this.tabs);
                TabsManager.saveCurrentTab(tabKey);
                this.currentTab = tabKey;
            } catch (error) {
                console.error('[Header] 添加标签页失败:', error);
            }
        },

        /**
         * 切换标签页
         */
        switchTab(tabKey) {
            try {
                // 如果点击的是当前标签页，不执行跳转
                if (this.currentTab === tabKey) {
                    console.log('📌 [Header] 点击的是当前标签页，不跳转');
                    return;
                }

                this.currentTab = tabKey;
                TabsManager.switchTab(tabKey);
            } catch (error) {
                console.error('[Header] 切换标签页失败:', error);
            }
        },

        /**
         * 关闭标签页
         */
        closeTab(tabKey) {
            // 关闭标签页
            TabsManager.closeTab(tabKey, null);
            // 更新标签页列表（同步最新状态）
            this.tabs = TabsManager.getTabs();
            // 注意：不要更新 currentTab，让 TabsManager 来决定切换到哪个标签页
            // 事件会由 TabsManager 触发，handleTabSwitchEvent 会接收
        },

        /**
         * 关闭其他标签页
         */
        closeOtherTabs(tabKey) {
            this.hideContextMenu();
            TabsManager.closeOtherTabs(tabKey);
            // 触发标签页更新事件
            window.dispatchEvent(new CustomEvent('tab-switch', { detail: { tabKey } }));
        },

        /**
         * 关闭所有标签页
         */
        closeAllTabs() {
            this.hideContextMenu();
            TabsManager.closeAllTabs();
            this.currentTab = '';
            this.tabs = TabsManager.getTabs();
        },

        /**
         * 显示右键菜单
         */
        showContextMenu(event, tab) {
            this.currentContextTab = tab;
            this.menuX = event.clientX;
            this.menuY = event.clientY;
            this.showMenu = true;
        },

        /**
         * 隐藏右键菜单
         */
        hideContextMenu() {
            this.showMenu = false;
        }
    }
};
