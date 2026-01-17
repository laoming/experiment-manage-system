/**
 * 用户管理逻辑
 */
const { createApp } = Vue;

createApp({
    data() {
        return {
            loading: false,
            userList: [],
            queryForm: {
                username: '',
                displayName: '',
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
                status: 1
            },
            showPasswordModal: false,
            passwordForm: {
                id: '',
                username: '',
                password: '',
                confirmPassword: ''
            }
        };
    },

    mounted() {
        this.checkLogin();
        this.fetchUserList();
    },

    methods: {
        /**
         * 检查登录状态
         */
        checkLogin() {
            const token = API.getToken();
            if (!token) {
                window.location.href = '/ems/pages/index.html';
                return;
            }
        },

        /**
         * 获取用户列表
         */
        async fetchUserList() {
            this.loading = true;
            try {
                console.log('📋 [USER] 开始获取用户列表...', this.queryForm);
                const response = await API.getUserPage(
                    this.pagination.current,
                    this.pagination.size,
                    this.queryForm
                );
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

            try {
                let response;
                if (this.userModalMode === 'add') {
                    console.log('➕ [USER] 新增用户:', this.userForm);
                    response = await API.addUser(this.userForm);
                } else {
                    console.log('✏️ [USER] 更新用户:', this.userForm);
                    response = await API.updateUser(this.userForm);
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
                const response = await API.resetPassword({
                    id: this.passwordForm.id,
                    password: this.passwordForm.password
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
                const response = await API.deleteUser({ id: user.id });
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
            window.location.href = '/ems/pages/home.html';
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
        }
    }
}).mount('#app');
