/**
 * 用户管理逻辑
 */
const app = Vue.createApp({
    data() {
        return {
            loading: true,
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
            userModalMode: 'add',
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

    methods: {
        async initPage() {
            try {
                await Promise.all([
                    this.fetchRoleList(),
                    this.fetchOrgList(),
                    this.fetchUserList()
                ]);
            } catch (error) {
                console.error('[USER] 初始化页面失败:', error);
                this.pageError = '初始化页面失败: ' + (error.message || '未知错误');
            }
        },

        checkLogin() {
            try {
                const token = Auth.getToken();
                if (!token) {
                    window.location.href = '/ems/common/pages/index.html';
                }
            } catch (error) {
                console.error('[USER] 检查登录状态失败:', error);
                window.location.href = '/ems/common/pages/index.html';
            }
        },

        async fetchRoleList() {
            try {
                const result = await fetch('/role/page?current=1&size=1000', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                if (result.code === 200) {
                    this.roleList = result.data.records || [];
                }
            } catch (error) {
                console.error('❌ [USER] 获取角色列表失败:', error);
            }
        },

        async fetchOrgList() {
            try {
                const result = await fetch('/organization/list', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                if (result.code === 200) {
                    this.orgList = result.data || [];
                }
            } catch (error) {
                console.error('❌ [USER] 获取组织列表失败:', error);
            }
        },

        async fetchUserList() {
            this.loading = true;
            try {
                const result = await fetch(`/user/page?current=${this.pagination.current}&size=${this.pagination.size}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.queryForm)
                });
                if (result.code === 200) {
                    this.userList = result.data.records || [];
                    this.pagination.total = result.data.total || 0;
                    this.pagination.pages = result.data.pages || 0;
                } else {
                    this.showError('获取用户列表失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [USER] 获取用户列表失败:', error);
                this.showError('获取用户列表失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        handleSearch() {
            this.pagination.current = 1;
            this.fetchUserList();
        },

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

        handlePageChange(page) {
            this.pagination.current = page;
            this.fetchUserList();
        },

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

        async handleUserSubmit() {
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
                const url = this.userModalMode === 'add' ? '/user/add' : '/user/update';
                const result = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.userForm)
                });
                if (result.code === 200) {
                    this.showSuccess(this.userModalMode === 'add' ? '新增用户成功' : '更新用户成功');
                    this.closeUserModal();
                    this.fetchUserList();
                } else {
                    this.showError((this.userModalMode === 'add' ? '新增' : '更新') + '用户失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [USER] 操作失败:', error);
                this.showError((this.userModalMode === 'add' ? '新增' : '更新') + '用户失败: ' + error.message);
            }
        },

        openResetPasswordModal(user) {
            this.passwordForm = {
                id: user.id,
                username: user.username,
                password: '',
                confirmPassword: ''
            };
            this.showPasswordModal = true;
        },

        closePasswordModal() {
            this.showPasswordModal = false;
            this.passwordForm = {
                id: '',
                username: '',
                password: '',
                confirmPassword: ''
            };
        },

        async handlePasswordSubmit() {
            if (!this.passwordForm.password.trim()) {
                this.showError('新密码不能为空');
                return;
            }
            if (this.passwordForm.password !== this.passwordForm.confirmPassword) {
                this.showError('两次输入的密码不一致');
                return;
            }

            try {
                const result = await fetch('/user/resetPassword', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: this.passwordForm.id,
                        password: this.passwordForm.password
                    })
                });
                if (result.code === 200) {
                    this.showSuccess('重置密码成功');
                    this.closePasswordModal();
                } else {
                    this.showError('重置密码失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [USER] 重置密码失败:', error);
                this.showError('重置密码失败: ' + error.message);
            }
        },

        async handleDelete(user) {
            if (!confirm(`确定要删除用户 "${user.displayName}" 吗？`)) {
                return;
            }

            try {
                const result = await fetch('/user/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: user.id })
                });
                if (result.code === 200) {
                    this.showSuccess('删除用户成功');
                    this.fetchUserList();
                } else {
                    this.showError('删除用户失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [USER] 删除用户失败:', error);
                this.showError('删除用户失败: ' + error.message);
            }
        },

        getStatusText(status) {
            const statusMap = { 1: '激活', 2: '禁用', 0: '已删除' };
            return statusMap[status] || '未知';
        },

        getRoleName(roleId) {
            if (!roleId) return '-';
            const role = this.roleList.find(r => r.id === roleId);
            return role ? role.roleName : '-';
        },

        getOrgName(orgId) {
            if (!orgId) return '-';
            const org = this.orgList.find(o => o.id === orgId);
            return org ? org.fullPath : '-';
        },

        getStatusClass(status) {
            const classMap = {
                1: 'status-active',
                2: 'status-disabled',
                0: 'status-deleted'
            };
            return classMap[status] || 'status-unknown';
        },

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
                return dateStr;
            }
        },

        showSuccess(message) {
            alert('✅ ' + message);
        },

        showError(message) {
            alert('❌ ' + message);
        }
    }
});

// 注册顶部导航栏组件
app.component('header-component', HeaderComponent);

// 挂载应用
app.mount('#app');
