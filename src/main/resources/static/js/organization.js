/**
 * 组织管理逻辑
 */
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            loading: false,
            organizationList: [],
            queryForm: {
                orgName: '',
                orgCode: ''
            },
            pagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            showOrgModal: false,
            orgModalMode: 'add', // 'add' or 'edit'
            orgForm: {
                id: '',
                orgName: '',
                orgCode: '',
                description: ''
            },
            showUserProfileModal: false,
            userProfileForm: {
                username: '',
                displayName: '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            }
        };
    },

    mounted() {
        this.checkLogin();
        this.fetchOrganizationList();
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
         * 获取组织列表
         */
        async fetchOrganizationList() {
            this.loading = true;
            try {
                console.log('📋 [ORG] 开始获取组织列表...', this.queryForm);
                const response = await API.getOrganizationPage(
                    this.pagination.current,
                    this.pagination.size,
                    this.queryForm
                );
                console.log('✅ [ORG] 获取组织列表成功:', response);
                
                if (response.code === 200) {
                    this.organizationList = response.data.records || [];
                    this.pagination.total = response.data.total || 0;
                    this.pagination.pages = response.data.pages || 0;
                } else {
                    this.showError('获取组织列表失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ORG] 获取组织列表失败:', error);
                this.showError('获取组织列表失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * 搜索
         */
        handleSearch() {
            this.pagination.current = 1;
            this.fetchOrganizationList();
        },

        /**
         * 重置搜索条件
         */
        handleReset() {
            this.queryForm = {
                orgName: '',
                orgCode: ''
            };
            this.pagination.current = 1;
            this.fetchOrganizationList();
        },

        /**
         * 分页变化
         */
        handlePageChange(page) {
            this.pagination.current = page;
            this.fetchOrganizationList();
        },

        /**
         * 打开新增组织弹窗
         */
        openAddModal() {
            this.orgModalMode = 'add';
            this.orgForm = {
                id: '',
                orgName: '',
                orgCode: '',
                description: ''
            };
            this.showOrgModal = true;
        },

        /**
         * 打开编辑组织弹窗
         */
        openEditModal(org) {
            this.orgModalMode = 'edit';
            this.orgForm = {
                id: org.id,
                orgName: org.orgName,
                orgCode: org.orgCode,
                description: org.description || ''
            };
            this.showOrgModal = true;
        },

        /**
         * 关闭组织弹窗
         */
        closeOrgModal() {
            this.showOrgModal = false;
            this.orgForm = {
                id: '',
                orgName: '',
                orgCode: '',
                description: ''
            };
        },

        /**
         * 提交组织表单
         */
        async handleOrgSubmit() {
            // 验证必填字段
            if (!this.orgForm.orgName.trim()) {
                this.showError('组织名称不能为空');
                return;
            }
            if (!this.orgForm.orgCode.trim()) {
                this.showError('组织编码不能为空');
                return;
            }

            try {
                let response;
                if (this.orgModalMode === 'add') {
                    console.log('➕ [ORG] 新增组织:', this.orgForm);
                    response = await API.addOrganization(this.orgForm);
                } else {
                    console.log('✏️ [ORG] 更新组织:', this.orgForm);
                    response = await API.updateOrganization(this.orgForm);
                }

                console.log('✅ [ORG] 操作成功:', response);

                if (response.code === 200) {
                    this.showSuccess(this.orgModalMode === 'add' ? '新增组织成功' : '更新组织成功');
                    this.closeOrgModal();
                    this.fetchOrganizationList();
                } else {
                    this.showError((this.orgModalMode === 'add' ? '新增' : '更新') + '组织失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ORG] 操作失败:', error);
                this.showError((this.orgModalMode === 'add' ? '新增' : '更新') + '组织失败: ' + error.message);
            }
        },

        /**
         * 删除组织
         */
        async handleDelete(org) {
            if (!confirm(`确定要删除组织 "${org.orgName}" 吗？`)) {
                return;
            }

            try {
                console.log('🗑️ [ORG] 删除组织:', { id: org.id, orgName: org.orgName });
                const response = await API.deleteOrganization({ id: org.id });
                console.log('✅ [ORG] 删除组织成功:', response);
                
                if (response.code === 200) {
                    this.showSuccess('删除组织成功');
                    this.fetchOrganizationList();
                } else {
                    this.showError('删除组织失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ORG] 删除组织失败:', error);
                this.showError('删除组织失败: ' + error.message);
            }
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
