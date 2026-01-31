/**
 * 首页逻辑
 */
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            loginTime: '',
            loading: true,
            menuList: [],
            menuDirectories: [],
            expandedDirectories: []
        };
    },

    mounted() {
        this.checkLogin();
        this.initData();
        this.fetchMenuList();
    },

    methods: {
        /**
         * 检查登录状态
         */
        checkLogin() {
            const token = Auth.getToken();
            if (!token) {
                // 未登录，跳转到登录页
                window.location.href = '/ems/pages/index.html';
                return;
            }
            this.loading = false;
        },

        /**
         * 初始化数据
         */
        initData() {
            console.log('🚀 [HOME] 开始初始化数据...');

            // 获取当前时间
            const now = new Date();
            this.loginTime = now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // 可以在这里调用后端 API 获取用户信息
            // this.fetchUserInfo();
        },

        /**
         * 获取菜单列表
         */
        async fetchMenuList() {
            try {
                console.log('🔍 [HOME] 开始获取菜单列表...');

                // 直接使用fetch，让拦截器自动处理token和前缀
                const response = await fetch('/menu/list', {
                    method: 'GET'
                });

                console.log('📦 [HOME] 菜单响应:', response);

                if (response.code === 200 && Array.isArray(response.data)) {
                    this.menuList = response.data;
                    this.processMenus();
                    console.log('✅ [HOME] 菜单列表加载成功，共', response.data.length, '个菜单');
                } else {
                    console.error('❌ [HOME] 菜单响应格式错误:', response);
                }
            } catch (error) {
                console.error('❌ [HOME] 获取菜单列表失败:', error);
            }
        },

        /**
         * 处理菜单数据
         */
        processMenus() {
            // 获取所有菜单目录（parentId = '0'，menuType = 'D'）
            this.menuDirectories = this.menuList.filter(menu =>
                menu.parentId === '0' && menu.menuType === 'D'
            );
        },

        /**
         * 根据目录ID获取菜单列表
         */
        getMenusByDirectory(directoryId) {
            return this.menuList.filter(menu =>
                menu.parentId === directoryId && menu.menuType === 'M'
            );
        },

        /**
         * 切换目录展开/收起
         */
        toggleDirectory(directoryId) {
            const index = this.expandedDirectories.indexOf(directoryId);
            if (index > -1) {
                this.expandedDirectories.splice(index, 1);
            } else {
                this.expandedDirectories.push(directoryId);
            }
        },

        /**
         * 导航到菜单页面
         */
        navigateToMenu(menu) {
            if (menu.path) {
                TabsManager.openTab(menu);
            } else {
                console.warn('菜单没有配置路径:', menu);
            }
        },

        /**
         * 获取目录图标
         */
        getDirectoryIcon(menuName) {
            const iconMap = {
                '系统管理': '⚙️',
                '用户管理': '👥',
                '实验管理': '🔬',
                '数据分析': '📊',
                '权限管理': '🔐',
                '组织管理': '🏢'
            };
            return iconMap[menuName] || '📁';
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
                '数据统计': '📈'
            };
            return iconMap[menuName] || '📄';
        },

        /**
         * 获取用户信息
         */
        async fetchUserInfo() {
            try {
                const response = await API.getUserInfo();
                if (response.code === 200) {
                    this.username = response.data.username || this.username;
                }
            } catch (error) {
                console.error('获取用户信息失败:', error);
            }
        },

        /**
         * 退出登录
         */
        handleLogout() {
            if (confirm('确定要退出登录吗？')) {
                API.logout();
            }
        }
    }
});

// 注册顶部导航栏组件
app.component('header-component', HeaderComponent);

// 挂载应用
app.mount('#app');
