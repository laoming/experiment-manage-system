/**
 * 登录页面逻辑
 */
const { createApp: createLoginApp } = Vue;

createLoginApp({
    data() {
        return {
            username: '',
            password: '',
            rememberMe: false,
            loading: false,
            errorMessage: ''
        };
    },
    
    mounted() {
        // 如果已登录，直接跳转到首页
        const token = Auth.getToken();
        if (token) {
            this.redirectToHome();
        }

        // 从 localStorage 恢复用户名（如果选择了记住我）
        const savedUsername = localStorage.getItem('saved_username');
        if (savedUsername) {
            this.username = savedUsername;
            this.rememberMe = true;
        }

        // 自动聚焦用户名输入框
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.focus();
        }
    },

    methods: {
        /**
         * 处理登录
         */
        async handleLogin() {
            // 表单验证
            if (!this.validateForm()) {
                return;
            }

            this.loading = true;
            this.errorMessage = '';

            console.log('🔐 [LOGIN] 开始登录流程...');
            console.log('🔐 [LOGIN] 用户名:', this.username);

            try {
                const result = await Auth.login(this.username, this.password);

                if (result.success) {
                    // 登录成功
                    console.log('✅ [LOGIN] 登录成功！');
                    console.log('👤 [LOGIN] 用户信息:', result.data);

                    // 保存用户名（如果选择了记住我）
                    if (this.rememberMe) {
                        localStorage.setItem('saved_username', this.username);
                        console.log('💾 [LOGIN] 保存用户名到 localStorage');
                    } else {
                        localStorage.removeItem('saved_username');
                    }

                    // 延迟跳转
                    setTimeout(() => {
                        console.log('➡️ [LOGIN] 跳转到首页...');
                        this.redirectToHome();
                    }, 500);
                } else {
                    // 登录失败
                    console.error('❌ [LOGIN] 登录失败:', result.message);
                    this.errorMessage = result.message || '登录失败，请检查用户名和密码';
                }
            } catch (error) {
                console.error('❌ [LOGIN] 登录错误:', error);
                this.errorMessage = error.message || '网络错误，请稍后重试';
            } finally {
                this.loading = false;
            }
        },

        /**
         * 表单验证
         */
        validateForm() {
            if (!this.username.trim()) {
                this.errorMessage = '请输入用户名';
                return false;
            }

            if (!this.password.trim()) {
                this.errorMessage = '请输入密码';
                return false;
            }

            return true;
        },

        /**
         * 聚焦密码输入框
         */
        focusPassword() {
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.focus();
            }
        },

        /**
         * 跳转到首页
         */
        redirectToHome() {
            window.location.href = '/ems/common/pages/home.html';

        }
    }
}).mount('#app');
