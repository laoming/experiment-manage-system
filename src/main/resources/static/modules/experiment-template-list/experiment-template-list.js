/**
 * 实验模板管理列表逻辑
 */

const app = Vue.createApp({
    data() {
        return {
            loading: true,
            templateList: [],
            creatorList: [],
            queryForm: {
                templateName: ''
            },
            pagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            showViewModal: false,
            currentTemplate: {}
        };
    },

    mounted() {
        this.checkLogin();
        this.fetchCreatorList();
        this.fetchTemplateList();
    },

    methods: {
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
            console.error('[TEMPLATE-LIST] 检查登录状态失败:', error);
            window.location.href = '/ems/common/pages/index.html';
        }

        },

        /**
         * 获取创建者列表（用户列表）
         */
        async fetchCreatorList() {
            try {
                console.log('📋 [TEMPLATE-LIST] 开始获取创建者列表...');
                const result = await fetch('/user/page?current=1&size=1000', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                console.log('✅ [TEMPLATE-LIST] 获取创建者列表成功:', result);

                if (result.code === 200) {
                    this.creatorList = result.data.records || [];
                } else {
                    console.warn('获取创建者列表失败');
                }
            } catch (error) {
                console.error('❌ [TEMPLATE-LIST] 获取创建者列表失败:', error);
            }
        },

        /**
         * 获取模板列表
         */
        async fetchTemplateList() {
            this.loading = true;
            try {
                console.log('📋 [TEMPLATE-LIST] 开始获取模板列表...', this.queryForm);
                const result = await fetch(`/experimentTemplate/page?current=${this.pagination.current}&size=${this.pagination.size}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.queryForm)
                });
                console.log('✅ [TEMPLATE-LIST] 获取模板列表成功:', result);

                if (result.code === 200) {
                    this.templateList = result.data.records || [];
                    this.pagination.total = result.data.total || 0;
                    this.pagination.pages = result.data.pages || 0;
                } else {
                    this.showError('获取模板列表失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [TEMPLATE-LIST] 获取模板列表失败:', error);
                this.showError('获取模板列表失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * 搜索
         */
        handleSearch() {
            this.pagination.current = 1;
            this.fetchTemplateList();
        },

        /**
         * 重置搜索条件
         */
        handleReset() {
            this.queryForm = {
                templateName: ''
            };
            this.pagination.current = 1;
            this.fetchTemplateList();
        },

        /**
         * 分页变化
         */
        handlePageChange(page) {
            this.pagination.current = page;
            this.fetchTemplateList();
        },

        /**
         * 打开创建模板编辑器
         */
        openCreateEditor() {
            // 使用 TabsManager 打开新标签页
            TabsManager.openTabByPath('/ems/modules/experiment-template/experiment-template.html', '实验模板编辑');
        },

        /**
         * 打开编辑模板编辑器
         */
        openEditEditor(template) {
            // 使用 TabsManager 打开新标签页
            TabsManager.openTabByPath(`/ems/modules/experiment-template/experiment-template.html?templateId=${template.id}`, '实验模板编辑');
        },

        /**
         * 打开查看模板弹窗
         */
        async openViewModal(template) {
            try {
                console.log('👁️ [TEMPLATE-LIST] 获取模板详情:', template.id);
                const result = await fetch(`/experimentTemplate/get?templateId=${template.id}`, {
                    method: 'POST'
                });
                console.log('✅ [TEMPLATE-LIST] 获取模板详情成功:', result);

                if (result.code === 200) {
                    this.currentTemplate = result.data;
                    this.showViewModal = true;
                } else {
                    this.showError('获取模板详情失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [TEMPLATE-LIST] 获取模板详情失败:', error);
                this.showError('获取模板详情失败: ' + error.message);
            }
        },

        /**
         * 关闭查看弹窗
         */
        closeViewModal() {
            this.showViewModal = false;
            this.currentTemplate = {};
        },

        /**
         * 删除模板
         */
        async handleDelete(template) {
            if (!confirm(`确定要删除模板 "${template.templateName}" 吗？`)) {
                return;
            }

            try {
                console.log('🗑️ [TEMPLATE-LIST] 删除模板:', { id: template.id, templateName: template.templateName });
                const result = await fetch('/experimentTemplate/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: template.id })
                });
                console.log('✅ [TEMPLATE-LIST] 删除模板成功:', result);
                
                if (result.code === 200) {
                    this.showSuccess('删除模板成功');
                    this.fetchTemplateList();
                } else {
                    this.showError('删除模板失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('❌ [TEMPLATE-LIST] 删除模板失败:', error);
                this.showError('删除模板失败: ' + error.message);
            }
        },

        /**
         * 获取组件数量
         */
        getComponentCount(content) {
            if (!content) return 0;
            try {
                const components = JSON.parse(content);
                return Array.isArray(components) ? components.length : 0;
            } catch (error) {
                return 0;
            }
        },

        /**
         * 格式化 JSON 显示
         */
        formatJson(content) {
            if (!content) return '无';
            try {
                const json = JSON.parse(content);
                return JSON.stringify(json, null, 2);
            } catch (error) {
                return content;
            }
        },

        /**
         * 根据创建者ID获取创建者名称
         */
        getCreatorName(creatorId) {
            if (!creatorId) {
                return '-';
            }
            const creator = this.creatorList.find(c => c.id === creatorId);
            return creator ? creator.displayName : creatorId;
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
