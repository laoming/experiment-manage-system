/**
 * 菜单管理逻辑
 */

const app = Vue.createApp({
    data() {
        return {
            loading: false,
            menuList: [],
            parentMenus: [],
            queryForm: {
                menuName: '',
                menuType: null
            },
            pagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            showMenuModal: false,
            menuModalMode: 'add',
            menuForm: {
                id: '',
                parentId: '0',
                menuName: '',
                menuCode: '',
                path: '',
                menuType: 'M',
                sort: 0
            },
            pageError: null
        };
    },

    mounted() {
        console.log('📌 [MENU] 菜单管理页面开始加载...');
        this.checkLogin();
        this.initPage();
    },

    errorCaptured(err, vm, info) {
        console.error('[MENU] Vue组件错误:', err, info);
        console.error('[MENU] 错误堆栈:', err.stack);
        this.pageError = err.message || '页面加载失败';
        return false;
    },

    methods: {
        /**
         * 初始化页面
         */
        async initPage() {
            try {
                console.log('📌 [MENU] 开始加载页面数据...');
                await Promise.all([
                    this.fetchParentMenus(),
                    this.fetchMenuList()
                ]);
                console.log('✅ [MENU] 页面数据加载完成');
            } catch (error) {
                console.error('[MENU] 初始化页面失败:', error);
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
            console.error('[MENU] 检查登录状态失败:', error);
            window.location.href = '/ems/common/pages/index.html';
        }

        },

        /**
         * 获取父菜单列表（目录类型的菜单）
         */
        async fetchParentMenus() {
            try {
                console.log('📋 [MENU] 开始获取父菜单列表...');
                const response = await fetch('/menu/page?current=1&size=1000&menuType=D', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                console.log('✅ [MENU] 获取父菜单列表成功:', response);

                if (response.code === 200) {
                    this.parentMenus = response.data.records || [];
                } else {
                    this.showError('获取父菜单列表失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [MENU] 获取父菜单列表失败:', error);
                this.showError('获取父菜单列表失败: ' + error.message);
            }
        },

        /**
         * 获取菜单列表
         */
        async fetchMenuList() {
            this.loading = true;
            try {
                console.log('📋 [MENU] 开始获取菜单列表...', this.queryForm);
                const { menuName, menuType } = this.queryForm;
                let url = `/menu/page?current=${this.pagination.current}&size=${this.pagination.size}`;
                if (menuName) url += `&menuName=${encodeURIComponent(menuName)}`;
                if (menuType) url += `&menuType=${menuType}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                console.log('✅ [MENU] 获取菜单列表成功:', response);

                if (response.code === 200) {
                    this.menuList = response.data.records || [];
                    this.pagination.total = response.data.total || 0;
                    this.pagination.pages = response.data.pages || 0;
                } else {
                    this.showError('获取菜单列表失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [MENU] 获取菜单列表失败:', error);
                this.showError('获取菜单列表失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * 搜索
         */
        handleSearch() {
            this.pagination.current = 1;
            this.fetchMenuList();
        },

        /**
         * 重置搜索条件
         */
        handleReset() {
            this.queryForm = {
                menuName: '',
                menuType: null
            };
            this.pagination.current = 1;
            this.fetchMenuList();
        },

        /**
         * 分页变化
         */
        handlePageChange(page) {
            this.pagination.current = page;
            this.fetchMenuList();
        },

        /**
         * 打开新增菜单弹窗
         */
        openAddModal() {
            this.menuModalMode = 'add';
            this.menuForm = {
                id: '',
                parentId: '0',
                menuName: '',
                menuCode: '',
                path: '',
                menuType: 'M',
                sort: 0
            };
            this.showMenuModal = true;
        },

        /**
         * 打开编辑菜单弹窗
         */
        openEditModal(menu) {
            this.menuModalMode = 'edit';
            this.menuForm = {
                id: menu.id,
                parentId: menu.parentId || '0',
                menuName: menu.menuName,
                menuCode: menu.menuCode,
                path: menu.path || '',
                menuType: menu.menuType,
                sort: menu.sort || 0
            };
            this.showMenuModal = true;
        },

        /**
         * 关闭菜单弹窗
         */
        closeMenuModal() {
            this.showMenuModal = false;
            this.menuForm = {
                id: '',
                parentId: '0',
                menuName: '',
                menuCode: '',
                path: '',
                menuType: 'M',
                sort: 0
            };
        },

        /**
         * 提交菜单表单
         */
        async handleMenuSubmit() {
            // 验证必填字段
            if (!this.menuForm.menuName.trim()) {
                this.showError('菜单名称不能为空');
                return;
            }
            if (!this.menuForm.menuCode.trim()) {
                this.showError('菜单编码不能为空');
                return;
            }
            if (!this.menuForm.menuType) {
                this.showError('请选择菜单类型');
                return;
            }

            try {
                let response;
                if (this.menuModalMode === 'add') {
                    console.log('➕ [MENU] 新增菜单:', this.menuForm);
                    response = await fetch('/menu/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(this.menuForm)
                    });
                } else {
                    console.log('✏️ [MENU] 更新菜单:', this.menuForm);
                    response = await fetch('/menu/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(this.menuForm)
                    });
                }

                console.log('✅ [MENU] 操作成功:', response);

                if (response.code === 200) {
                    this.showSuccess(this.menuModalMode === 'add' ? '新增菜单成功' : '更新菜单成功');
                    this.closeMenuModal();
                    await Promise.all([
                        this.fetchParentMenus(),
                        this.fetchMenuList()
                    ]);
                } else {
                    this.showError((this.menuModalMode === 'add' ? '新增' : '更新') + '菜单失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [MENU] 操作失败:', error);
                this.showError((this.menuModalMode === 'add' ? '新增' : '更新') + '菜单失败: ' + error.message);
            }
        },

        /**
         * 删除菜单
         */
        async handleDelete(menu) {
            if (!confirm(`确定要删除菜单 "${menu.menuName}" 吗？`)) {
                return;
            }

            try {
                console.log('🗑️ [MENU] 删除菜单:', { id: menu.id, menuName: menu.menuName });
                const response = await fetch('/menu/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: menu.id })
                });
                console.log('✅ [MENU] 删除菜单成功:', response);

                if (response.code === 200) {
                    this.showSuccess('删除菜单成功');
                    await Promise.all([
                        this.fetchParentMenus(),
                        this.fetchMenuList()
                    ]);
                } else {
                    this.showError('删除菜单失败: ' + (response.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [MENU] 删除菜单失败:', error);
                this.showError('删除菜单失败: ' + error.message);
            }
        },

        /**
         * 获取菜单类型文本
         */
        getTypeText(menuType) {
            const typeMap = {
                'M': '菜单',
                'D': '目录'
            };
            return typeMap[menuType] || '未知';
        },

        /**
         * 获取菜单类型样式类
         */
        getTypeClass(menuType) {
            const classMap = {
                'M': 'type-menu',
                'D': 'type-directory'
            };
            return classMap[menuType] || 'type-unknown';
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
