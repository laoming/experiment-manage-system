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
            username: ''
        };
    },
    mounted() {
        this.initUsername();
    },
    methods: {
        /**
         * 初始化用户名
         */
        initUsername() {
            const displayName = Auth.getDisplayName();
            if (displayName) {
                this.username = displayName;
            } else {
                const userInfo = Auth.getUserInfo();
                if (userInfo && userInfo.username) {
                    this.username = userInfo.username;
                }
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
                Auth.logout();
            }
        }
    }
};
