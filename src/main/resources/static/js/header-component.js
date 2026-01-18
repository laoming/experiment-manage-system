/**
 * 顶部导航栏 Vue 组件
 */
const HeaderComponent = {
    template: `
        <div class="header">
            <div class="header-content">
                <div class="logo" @click="goHome">
                    <div class="logo-icon">EMS</div>
                    <div>
                        <div class="logo-text">实验管理系统</div>
                    </div>
                </div>
                <nav class="nav-menu">
                    <a 
                        v-for="menu in menuList" 
                        :key="menu.id" 
                        class="nav-item"
                        :class="{ active: isActiveMenu(menu.path) }"
                        @click="navigateTo(menu.path)"
                    >
                        {{ menu.menuName }}
                    </a>
                </nav>
                <div class="user-info">
                    <span class="user-name clickable" @click="$emit('open-profile')" title="点击修改个人信息">
                        欢迎, {{ username }}
                    </span>
                    <button class="logout-btn" @click="handleLogout">退出登录</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            username: '',
            menuList: []
        };
    },
    mounted() {
        this.initUsername();
        this.fetchMenuList();
    },
    methods: {
        /**
         * 初始化用户名
         */
        initUsername() {
            const userInfo = API.getUserInfoFromToken();
            if (userInfo && userInfo.displayName) {
                this.username = userInfo.displayName;
            } else if (userInfo && userInfo.username) {
                this.username = userInfo.username;
            }
        },

        /**
         * 获取菜单列表
         */
        async fetchMenuList() {
            try {
                const response = await API.getMenuList();
                if (response.code === 200) {
                    this.menuList = response.data || [];
                }
            } catch (error) {
                console.error('获取菜单列表失败:', error);
            }
        },

        /**
         * 判断当前菜单是否激活
         */
        isActiveMenu(path) {
            if (!path) return false;
            const currentPath = window.location.pathname;
            return currentPath === path || currentPath.startsWith(path);
        },

        /**
         * 导航到指定页面
         */
        navigateTo(path) {
            if (path && path.startsWith('/ems/pages/')) {
                window.location.href = path;
            }
        },

        /**
         * 返回首页
         */
        goHome() {
            window.location.href = '/ems/pages/home.html';
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
};
