/**
 * 首页逻辑
 */
const { createApp } = Vue;

createApp({
    data() {
        return {
            username: '',
            loginTime: '',
            loading: true
        };
    },

    mounted() {
        this.checkLogin();
        this.initData();
    },

    methods: {
        /**
         * 检查登录状态
         */
        checkLogin() {
            const token = API.getToken();
            if (!token) {
                // 未登录，跳转到登录页
                window.location.href = '/ems/index.html';
                return;
            }
            this.loading = false;
        },

        /**
         * 初始化数据
         */
        initData() {
            // 从 localStorage 获取保存的用户名
            const savedUsername = localStorage.getItem('saved_username');
            if (savedUsername) {
                this.username = savedUsername;
            }

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
        },

        /**
         * 导航到用户管理
         */
        navigateToUserManagement() {
            alert('用户管理功能开发中...');
        },

        /**
         * 导航到实验管理
         */
        navigateToExperimentManagement() {
            alert('实验管理功能开发中...');
        },

        /**
         * 导航到数据分析
         */
        navigateToDataAnalysis() {
            alert('数据分析功能开发中...');
        },

        /**
         * 导航到系统设置
         */
        navigateToSettings() {
            alert('系统设置功能开发中...');
        }
    }
}).mount('#app');
