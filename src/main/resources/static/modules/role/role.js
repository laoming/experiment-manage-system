/**
 * 角色管理逻辑
 */

const app = Vue.createApp({
    data() {
        return {
            loading: true,
            menuLoading: false,
            roleList: [],
            menuTree: [],
            selectedMenuIds: [],
            currentRole: null,
            queryForm: {
                roleName: '',
                roleCode: '',
                status: null
            },
            pagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            jumpPage: 1,
            showRoleModal: false,
            roleModalMode: 'add',
            roleForm: {
                id: '',
                roleName: '',
                roleCode: '',
                status: 1
            },
            showAssignModal: false,
            selectAll: false,
            pageError: null
        };
    },

    mounted() {
        console.log('📌 [ROLE] 角色管理页面开始加载...');
        this.checkLogin();
        this.initPage();
    },

    errorCaptured(err, vm, info) {
        console.error('[ROLE] Vue组件错误:', err, info);
        console.error('[ROLE] 错误堆栈:', err.stack);
        this.pageError = err.message || '页面加载失败';
        return false;
    },

    methods: {
        /**
         * 初始化页面
         */
        async initPage() {
            try {
                console.log('📌 [ROLE] 开始加载页面数据...');
                await this.fetchRoleList();
                console.log('✅ [ROLE] 页面数据加载完成');
            } catch (error) {
                console.error('[ROLE] 初始化页面失败:', error);
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
            console.error('[ROLE] 检查登录状态失败:', error);
            window.location.href = '/ems/common/pages/index.html';
        }

        },

        /**
         * 获取角色列表
         */
        async fetchRoleList() {
            this.loading = true;
            try {
                console.log('📋 [ROLE] 开始获取角色列表...', this.queryForm);
                const result = await fetch(`/role/page?current=${this.pagination.current}&size=${this.pagination.size}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.queryForm)
                });
                console.log('✅ [ROLE] 获取角色列表成功:', result);

                if (result.code === 200) {
                    this.roleList = result.data.records || [];
                    this.pagination.total = result.data.total || 0;
                    this.pagination.pages = result.data.pages || 0;
                } else {
                    this.showError('获取角色列表失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ROLE] 获取角色列表失败:', error);
                this.showError('获取角色列表失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * 获取菜单树
         */
        async fetchMenuTree() {
            this.menuLoading = true;
            try {
                console.log('📋 [ROLE] 开始获取菜单树...');
                const result = await fetch('/menu/tree', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                console.log('✅ [ROLE] 获取菜单树成功:', result);

                if (result.code === 200) {
                    this.menuTree = result.data || [];
                } else {
                    this.showError('获取菜单树失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ROLE] 获取菜单树失败:', error);
                this.showError('获取菜单树失败: ' + error.message);
            } finally {
                this.menuLoading = false;
            }
        },

        /**
         * 获取角色关联的菜单ID列表
         */
        async fetchRoleMenuIds(roleId) {
            try {
                console.log('📋 [ROLE] 开始获取角色菜单ID列表...', roleId);
                const result = await fetch(`/role/getMenuIds?roleId=${roleId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                console.log('✅ [ROLE] 获取角色菜单ID列表成功:', result);

                if (result.code === 200) {
                    this.selectedMenuIds = result.data || [];
                } else {
                    this.showError('获取角色菜单失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ROLE] 获取角色菜单失败:', error);
                this.showError('获取角色菜单失败: ' + error.message);
            }
        },

        /**
         * 搜索
         */
        handleSearch() {
            this.pagination.current = 1;
            this.fetchRoleList();
        },

        /**
         * 重置搜索条件
         */
        handleReset() {
            this.queryForm = {
                roleName: '',
                roleCode: '',
                status: null
            };
            this.pagination.current = 1;
            this.fetchRoleList();
        },

        /**
         * 分页变化
         */
        handlePageChange(page) {
            this.pagination.current = page;
            this.fetchRoleList();
        },

        /**
         * 跳转指定页
         */
        handleJumpPage() {
            const page = parseInt(this.jumpPage);
            if (isNaN(page) || page < 1 || page > this.pagination.pages) {
                alert('请输入有效的页码（1-' + this.pagination.pages + '）');
                return;
            }
            this.handlePageChange(page);
        },

        /**
         * 打开新增角色弹窗
         */
        openAddModal() {
            this.roleModalMode = 'add';
            this.roleForm = {
                id: '',
                roleName: '',
                roleCode: '',
                status: 1
            };
            this.showRoleModal = true;
        },

        /**
         * 打开编辑角色弹窗
         */
        openEditModal(role) {
            this.roleModalMode = 'edit';
            this.roleForm = {
                id: role.id,
                roleName: role.roleName,
                roleCode: role.roleCode,
                status: role.status
            };
            this.showRoleModal = true;
        },

        /**
         * 关闭角色弹窗
         */
        closeRoleModal() {
            this.showRoleModal = false;
            this.roleForm = {
                id: '',
                roleName: '',
                roleCode: '',
                status: 1
            };
        },

        /**
         * 提交角色表单
         */
        async handleRoleSubmit() {
            // 验证必填字段
            if (!this.roleForm.roleName.trim()) {
                this.showError('角色名称不能为空');
                return;
            }
            if (!this.roleForm.roleCode.trim()) {
                this.showError('角色编码不能为空');
                return;
            }

            try {
                let response;
                let result;
                if (this.roleModalMode === 'add') {
                    console.log('➕ [ROLE] 新增角色:', this.roleForm);
                    result = await fetch('/role/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(this.roleForm)
                    });
                } else {
                    console.log('✏️ [ROLE] 更新角色:', this.roleForm);
                    result = await fetch('/role/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(this.roleForm)
                    });
                }
                console.log('✅ [ROLE] 操作成功:', result);

                if (result.code === 200) {
                    this.showSuccess(this.roleModalMode === 'add' ? '新增角色成功' : '更新角色成功');
                    this.closeRoleModal();
                    this.fetchRoleList();
                } else {
                    this.showError((this.roleModalMode === 'add' ? '新增' : '更新') + '角色失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ROLE] 操作失败:', error);
                this.showError((this.roleModalMode === 'add' ? '新增' : '更新') + '角色失败: ' + error.message);
            }
        },

        /**
         * 打开分配权限弹窗
         */
        async openAssignModal(role) {
            this.currentRole = role;
            this.showAssignModal = true;
            this.selectAll = false;
            this.selectedMenuIds = [];
            await this.fetchMenuTree();
            await this.fetchRoleMenuIds(role.id);
            this.checkSelectAll();
        },

        /**
         * 关闭分配权限弹窗
         */
        closeAssignModal() {
            this.showAssignModal = false;
            this.currentRole = null;
            this.menuTree = [];
            this.selectedMenuIds = [];
            this.selectAll = false;
        },

        /**
         * 全选/取消全选
         */
        handleSelectAll() {
            const allMenuIds = this.menuTree.map(menu => menu.id);
            this.selectedMenuIds = this.selectAll ? allMenuIds : [];
        },

        /**
         * 检查是否全选
         */
        checkSelectAll() {
            const allMenuIds = this.menuTree.map(menu => menu.id);
            this.selectAll = allMenuIds.length > 0 && allMenuIds.every(id => this.selectedMenuIds.includes(id));
        },

        /**
         * 提交权限分配
         */
        async handleAssignSubmit() {
            try {
                console.log('🔐 [ROLE] 分配权限:', { roleId: this.currentRole.id, menuIds: this.selectedMenuIds.join(',') });
                const result = await fetch('/role/assignMenu', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: new URLSearchParams({
                        roleId: this.currentRole.id,
                        menuIds: this.selectedMenuIds.join(',')
                    })
                });
                console.log('✅ [ROLE] 分配权限成功:', result);

                if (result.code === 200) {
                    this.showSuccess('权限分配成功');
                    this.closeAssignModal();
                } else {
                    this.showError('权限分配失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ROLE] 权限分配失败:', error);
                this.showError('权限分配失败: ' + error.message);
            }
        },

        /**
         * 删除角色
         */
        async handleDelete(role) {
            if (!confirm(`确定要删除角色 "${role.roleName}" 吗？删除后将同时删除该角色关联的所有菜单权限！`)) {
                return;
            }

            try {
                console.log('🗑️ [ROLE] 删除角色:', { id: role.id, roleName: role.roleName });
                const result = await fetch('/role/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: role.id })
                });
                console.log('✅ [ROLE] 删除角色成功:', result);

                if (result.code === 200) {
                    this.showSuccess('删除角色成功');
                    this.fetchRoleList();
                } else {
                    this.showError('删除角色失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [ROLE] 删除角色失败:', error);
                this.showError('删除角色失败: ' + error.message);
            }
        },

        /**
         * 获取状态文本
         */
        getStatusText(status) {
            const statusMap = {
                1: '正常',
                0: '禁用'
            };
            return statusMap[status] || '未知';
        },

        /**
         * 获取状态样式类
         */
        getStatusClass(status) {
            const classMap = {
                1: 'status-active',
                0: 'status-disabled'
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
});

// 注册顶部导航栏组件
app.component('header-component', HeaderComponent);

// 挂载应用
app.mount('#app');
