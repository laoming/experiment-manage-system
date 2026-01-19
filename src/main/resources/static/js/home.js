/**
 * 首页逻辑
 */
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            loginTime: '',
            loading: true,
            showUserProfileModal: false,
            userProfileForm: {
                username: '',
                displayName: '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
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
            const token = API.getToken();
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
                const response = await API.getMenuList();
                if (response.code === 200 && Array.isArray(response.data)) {
                    this.menuList = response.data;
                    this.processMenus();
                }
            } catch (error) {
                console.error('获取菜单列表失败:', error);
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
                window.location.href = menu.path;
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
        },

        /**
         * 打开个人信息弹窗
         */
        openUserProfileModal() {
            const userInfo = API.getUserInfoFromToken();
            this.userProfileForm = {
                username: userInfo.username || '',
                displayName: userInfo.displayName || '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            this.showUserProfileModal = true;
        },

        /**
         * 关闭个人信息弹窗
         */
        closeUserProfileModal() {
            this.showUserProfileModal = false;
            this.userProfileForm = {
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
        async handleUserProfileSubmit() {
            // 验证用户名称
            if (!this.userProfileForm.displayName.trim()) {
                alert('请输入用户名称');
                return;
            }

            // 如果要修改密码
            if (this.userProfileForm.newPassword || this.userProfileForm.oldPassword) {
                if (!this.userProfileForm.oldPassword) {
                    alert('请输入旧密码');
                    return;
                }
                if (!this.userProfileForm.newPassword) {
                    alert('请输入新密码');
                    return;
                }
                if (this.userProfileForm.newPassword !== this.userProfileForm.confirmPassword) {
                    alert('两次输入的密码不一致');
                    return;
                }
                if (this.userProfileForm.newPassword.length < 6) {
                    alert('新密码长度不能少于6位');
                    return;
                }
            }

            try {
                // 更新用户信息
                const response = await API.updateUser({
                    username: this.userProfileForm.username,
                    displayName: this.userProfileForm.displayName
                });

                if (response.code === 200) {
                    // 如果修改了密码，调用重置密码接口
                    if (this.userProfileForm.newPassword) {
                        const passwordResponse = await API.resetPassword({
                            username: this.userProfileForm.username,
                            password: this.userProfileForm.newPassword
                        });

                        if (passwordResponse.code === 200) {
                            alert('个人信息和密码修改成功，请重新登录');
                            API.logout();
                        } else {
                            alert('密码修改失败：' + (passwordResponse.message || '未知错误'));
                        }
                    } else {
                        alert('个人信息修改成功');
                        this.username = this.userProfileForm.displayName;
                        this.closeUserProfileModal();
                    }
                } else {
                    alert('个人信息修改失败：' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('修改个人信息失败:', error);
                alert('修改失败：' + (error.message || '网络错误，请稍后重试'));
            }
        }
    }
});

// 注册顶部导航栏组件
app.component('header-component', HeaderComponent);

// 挂载应用
app.mount('#app');
