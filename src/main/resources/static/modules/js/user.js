/**
 * 用户管理逻辑
 */
const app = Vue.createApp({
    data() {
        return {
            loading: false,
            userList: [],
            roleList: [],
            orgList: [],
            queryForm: {
                username: '',
                displayName: '',
                roleId: null,
                status: null
            },
            pagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            showUserModal: false,
            userModalMode: 'add', // 'add' or 'edit'
            userForm: {
                id: '',
                username: '',
                password: '',
                displayName: '',
                roleId: '',
                orgId: '',
                status: 1
            },
            showPasswordModal: false,
            passwordForm: {
                id: '',
                username: '',
                password: '',
                confirmPassword: ''
            },
            pageError: null
        };
    },

    mounted() {
        console.log('📌 [USER] 用户管理页面开始加载...');
        this.checkLogin();
        this.initPage();
    },

    errorCaptured(err, vm, info) {
        console.error('[USER] Vue组件错误:', err, info);
        console.error('[USER] 错误堆栈:', err.stack);
        this.pageError = err.message || '页面加载失败';
        return false; // 阻止错误继续向上传播
    },

    methods: {
        /**
         * 初始化页面
         */
        async initPage() {
            try {
                console.log('📌 [USER] 开始加载页面数据...');
                await Promise.all([
                    this.fetchRoleList(),
                    this.fetchOrgList(),
                    this.fetchUserList()
                ]);
                console.log('✅ [USER] 页面数据加载完成');
            } catch (error) {
                console.error('[USER] 初始化页面失败:', error);
                this.pageError = '初始化页面失败: ' + (error.message || '未知错误');
            }
        },

        /**
         * 检查登录状态
         */
        checkLogin() {
            try {
                const token = Auth.getToken();
            if (!token) {
                window.location.href = '/ems/common/pages/index.html';
                return;
            }
        } catch (error) {
            console.error('[USER] 检查登录状态失败:', error);
            window.location.href = '/ems/common/pages/index.html';
        }

        },

        /**
         * 获取角色列表
         */
        async fetchRoleList() {
            try {
                console.log('📋 [USER] 开始获取角色列表...');
                const response = await fetch('/role/page?current=1&size=1000', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                console.log('✅ [USER] 获取角色列表成功:', response);

                if (response.code === 200) {
                    this.roleList = response.data.records || [];
                } else {
                    this.showError('获取角色列表失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [USER] 获取角色列表失败:', error);
                this.showError('获取角色列表失败: ' + error.message);
            }
        },

        /**
         * 获取组织列表
         */
        async fetchOrgList() {
            try {
                console.log('📋 [USER] 开始获取组织列表...');
                const response = await fetch('/organization/list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                console.log('✅ [USER] 获取组织列表成功:', response);

                if (response.code === 200) {
                    this.orgList = response.data || [];
                } else {
                    this.showError('获取组织列表失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [USER] 获取组织列表失败:', error);
                this.showError('获取组织列表失败: ' + error.message);
            }
        },

        /**
         * 获取用户列表
         */
        async fetchUserList() {
            this.loading = true;
            try {
                console.log('📋 [USER] 开始获取用户列表...', this.queryForm);
                const response = await fetch(`/user/page?current=${this.pagination.current}&size=${this.pagination.size}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.queryForm)
                });
                console.log('✅ [USER] 获取用户列表成功:', response);

                if (response.code === 200) {
                    this.userList = response.data.records || [];
                    this.pagination.total = response.data.total || 0;
                    this.pagination.pages = response.data.pages || 0;
                } else {
                    this.showError('获取用户列表失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [USER] 获取用户列表失败:', error);
                this.showError('获取用户列表失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * 搜索
         */
        handleSearch() {
            this.pagination.current = 1;
            this.fetchUserList();
        },

        /**
         * 重置搜索条件
         */
        handleReset() {
            this.queryForm = {
                username: '',
                displayName: '',
                roleId: null,
                status: null
            };
            this.pagination.current = 1;
            this.fetchUserList();
        },

        /**
         * 分页变化
         */
        handlePageChange(page) {
            this.pagination.current = page;
            this.fetchUserList();
        },

        /**
         * 打开新增用户弹窗
         */
        openAddModal() {
            this.userModalMode = 'add';
            this.userForm = {
                id: '',
                username: '',
                password: '',
                displayName: '',
                roleId: '',
                orgId: '',
                status: 1
            };
            this.showUserModal = true;
        },

        /**
         * 打开编辑用户弹窗
         */
        openEditModal(user) {
            this.userModalMode = 'edit';
            this.userForm = {
                id: user.id,
                username: user.username,
                password: '',
                displayName: user.displayName,
                roleId: user.roleId || '',
                orgId: user.orgId || '',
                status: user.status
            };
            this.showUserModal = true;
        },

        /**
         * 关闭用户弹窗
         */
        closeUserModal() {
            this.showUserModal = false;
            this.userForm = {
                id: '',
                username: '',
                password: '',
                displayName: '',
                roleId: '',
                orgId: '',
                status: 1
            };
        },

        /**
         * 提交用户表单
         */
        async handleUserSubmit() {
            // 验证必填字段
            if (!this.userForm.username.trim()) {
                this.showError('账号不能为空');
                return;
            }
            if (this.userModalMode === 'add' && !this.userForm.password.trim()) {
                this.showError('密码不能为空');
                return;
            }
            if (!this.userForm.displayName.trim()) {
                this.showError('用户名称不能为空');
                return;
            }
            if (this.userModalMode === 'add' && !this.userForm.roleId) {
                this.showError('请选择用户角色');
                return;
            }
            if (!this.userForm.orgId) {
                this.showError('请选择所属组织');
                return;
            }

            try {
                let response;
                if (this.userModalMode === 'add') {
                    console.log('➕ [USER] 新增用户:', this.userForm);
                    response = await fetch('/user/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(this.userForm)
                    });
                } else {
                    console.log('✏️ [USER] 更新用户:', this.userForm);
                    response = await fetch('/user/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(this.userForm)
                    });
                }

                console.log('✅ [USER] 操作成功:', response);

                if (response.code === 200) {
                    this.showSuccess(this.userModalMode === 'add' ? '新增用户成功' : '更新用户成功');
                    this.closeUserModal();
                    this.fetchUserList();
                } else {
                    this.showError((this.userModalMode === 'add' ? '新增' : '更新') + '用户失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [USER] 操作失败:', error);
                this.showError((this.userModalMode === 'add' ? '新增' : '更新') + '用户失败: ' + error.message);
            }
        },

        /**
         * 打开重置密码弹窗
         */
        openResetPasswordModal(user) {
            this.passwordForm = {
                id: user.id,
                username: user.username,
                password: '',
                confirmPassword: ''
            };
            this.showPasswordModal = true;
        },

        /**
         * 关闭密码弹窗
         */
        closePasswordModal() {
            this.showPasswordModal = false;
            this.passwordForm = {
                id: '',
                username: '',
                password: '',
                confirmPassword: ''
            };
        },

        /**
         * 提交重置密码
         */
        async handlePasswordSubmit() {
            // 验证必填字段
            if (!this.passwordForm.password.trim()) {
                this.showError('新密码不能为空');
                return;
            }
            if (this.passwordForm.password !== this.passwordForm.confirmPassword) {
                this.showError('两次输入的密码不一致');
                return;
            }

            try {
                console.log('🔑 [USER] 重置密码:', { id: this.passwordForm.id });
                const response = await fetch('/user/resetPassword', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: this.passwordForm.id,
                        password: this.passwordForm.password
                    })
                });
                console.log('✅ [USER] 重置密码成功:', response);
                
                if (response.code === 200) {
                    this.showSuccess('重置密码成功');
                    this.closePasswordModal();
                } else {
                    this.showError('重置密码失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [USER] 重置密码失败:', error);
                this.showError('重置密码失败: ' + error.message);
            }
        },

        /**
         * 删除用户
         */
        async handleDelete(user) {
            if (!confirm(`确定要删除用户 "${user.displayName}" 吗？`)) {
                return;
            }

            try {
                console.log('🗑️ [USER] 删除用户:', { id: user.id, displayName: user.displayName });
                const response = await fetch('/user/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: user.id })
                });
                console.log('✅ [USER] 删除用户成功:', response);
                
                if (response.code === 200) {
                    this.showSuccess('删除用户成功');
                    this.fetchUserList();
                } else {
                    this.showError('删除用户失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [USER] 删除用户失败:', error);
                this.showError('删除用户失败: ' + error.message);
            }
        },

        /**
         * 获取状态文本
         */
        getStatusText(status) {
            const statusMap = {
                1: '激活',
                2: '禁用',
                0: '已删除'
            };
            return statusMap[status] || '未知';
        },

        /**
         * 根据角色ID获取角色名称
         */
        getRoleName(roleId) {
            if (!roleId) {
                return '-';
            }
            const role = this.roleList.find(r => r.id === roleId);
            return role ? role.roleName : '-';
        },

        /**
         * 根据组织ID获取组织全路径
         */
        getOrgName(orgId) {
            if (!orgId) {
                return '-';
            }
            const org = this.orgList.find(o => o.id === orgId);
            return org ? org.fullPath : '-';
        },

        /**
         * 获取状态样式类
         */
        getStatusClass(status) {
            const classMap = {
                1: 'status-active',
                2: 'status-disabled',
                0: 'status-deleted'
            };
            return classMap[status] || 'status-unknown';
        },

        /**
         * 格式化日期时间
         */
        formatDateTime(dateStr) {
            if (!dateStr) return '-';
            try {
                const date = new Date(dateStr);
                return date.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            } catch (error) {
                console.error('日期格式化失败:', error);
                return dateStr;
            }
        },

        /**
         * 返回首页
         */
        goBack() {
            window.location.href = '/ems/common/pages/home.html';

        },

        /**
         * 显示成功消息
         */
        showSuccess(message) {
            alert('✅ ' + message);
        },

        /**
         * 显示错误消息
         */
        showError(message) {
            alert('❌ ' + message);
        },

        /**
         * 退出登录
         */
        handleLogout() {
            if (confirm('确定要退出登录吗？')) {
                Auth.logout();
            }
        },

        /**
         * 打开个人信息弹窗
         */
        openUserProfileModal() {
            const userInfo = Auth.getUserInfo();
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
                const response = await fetch('/user/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.userProfileForm.username,
                        displayName: this.userProfileForm.displayName
                    })
                });

                if (response.code === 200) {
                    // 如果修改了密码，调用重置密码接口
                    if (this.userProfileForm.newPassword) {
                        const passwordResponse = await fetch('/user/resetPassword', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                username: this.userProfileForm.username,
                                password: this.userProfileForm.newPassword
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
