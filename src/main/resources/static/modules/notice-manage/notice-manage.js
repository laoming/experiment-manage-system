/**
 * 通知与公告管理逻辑
 */

const app = Vue.createApp({
    data() {
        return {
            activeTab: 'notice',
            pageError: null,
            noticeLoading: true,
            todoLoading: true,
            noticeList: [],
            todoList: [],
            userOptions: [],
            noticeQueryForm: {
                title: ''
            },
            todoQueryForm: {
                title: '',
                receiverId: '',
                status: null
            },
            noticePagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            todoPagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            showNoticeModal: false,
            showTodoModal: false,
            noticeForm: {
                title: '',
                content: ''
            },
            todoForm: {
                title: '',
                content: '',
                receiverId: ''
            }
        };
    },

    mounted() {
        this.checkLogin();
        this.initPage();
    },

    errorCaptured(err, vm, info) {
        console.error('[NOTICE] Vue组件错误:', err, info);
        this.pageError = err.message || '页面加载失败';
        return false;
    },

    methods: {
        async initPage() {
            try {
                await this.fetchUserOptions();
                await this.fetchNoticeList();
                await this.fetchTodoList();
            } catch (error) {
                console.error('[NOTICE] 初始化页面失败:', error);
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
                console.error('[NOTICE] 检查登录状态失败:', error);
                window.location.href = '/ems/common/pages/index.html';
            }
        },

        switchTab(tab) {
            this.activeTab = tab;
        },

        async fetchUserOptions() {
            try {
                const result = await fetch('/user/simpleList', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                if (result.code === 200) {
                    this.userOptions = result.data || [];
                } else {
                    this.showError('获取用户列表失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE] 获取用户列表失败:', error);
                this.showError('获取用户列表失败: ' + error.message);
            }
        },

        async fetchNoticeList() {
            this.noticeLoading = true;
            try {
                const result = await fetch(`/notice/page?current=${this.noticePagination.current}&size=${this.noticePagination.size}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.noticeQueryForm)
                });
                if (result.code === 200) {
                    this.noticeList = result.data.records || [];
                    this.noticePagination.total = result.data.total || 0;
                    this.noticePagination.pages = result.data.pages || 0;
                } else {
                    this.showError('获取公告列表失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE] 获取公告列表失败:', error);
                this.showError('获取公告列表失败: ' + error.message);
            } finally {
                this.noticeLoading = false;
            }
        },

        async fetchTodoList() {
            this.todoLoading = true;
            try {
                const result = await fetch(`/todo/page?current=${this.todoPagination.current}&size=${this.todoPagination.size}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.todoQueryForm)
                });
                if (result.code === 200) {
                    this.todoList = result.data.records || [];
                    this.todoPagination.total = result.data.total || 0;
                    this.todoPagination.pages = result.data.pages || 0;
                } else {
                    this.showError('获取待办列表失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE] 获取待办列表失败:', error);
                this.showError('获取待办列表失败: ' + error.message);
            } finally {
                this.todoLoading = false;
            }
        },

        handleNoticeSearch() {
            this.noticePagination.current = 1;
            this.fetchNoticeList();
        },

        handleNoticeReset() {
            this.noticeQueryForm = { title: '' };
            this.noticePagination.current = 1;
            this.fetchNoticeList();
        },

        handleNoticePageChange(page) {
            this.noticePagination.current = page;
            this.fetchNoticeList();
        },

        handleTodoSearch() {
            this.todoPagination.current = 1;
            this.fetchTodoList();
        },

        handleTodoReset() {
            this.todoQueryForm = {
                title: '',
                receiverId: '',
                status: null
            };
            this.todoPagination.current = 1;
            this.fetchTodoList();
        },

        handleTodoPageChange(page) {
            this.todoPagination.current = page;
            this.fetchTodoList();
        },

        openNoticeModal() {
            this.noticeForm = { title: '', content: '' };
            this.showNoticeModal = true;
        },

        closeNoticeModal() {
            this.showNoticeModal = false;
            this.noticeForm = { title: '', content: '' };
        },

        openTodoModal() {
            this.todoForm = { title: '', content: '', receiverId: '' };
            this.showTodoModal = true;
        },

        closeTodoModal() {
            this.showTodoModal = false;
            this.todoForm = { title: '', content: '', receiverId: '' };
        },

        async handleNoticeSubmit() {
            if (!this.noticeForm.title.trim()) {
                this.showError('公告标题不能为空');
                return;
            }
            if (!this.noticeForm.content.trim()) {
                this.showError('公告内容不能为空');
                return;
            }
            const userInfo = Auth.getUserInfo();
            if (!userInfo || !userInfo.id) {
                this.showError('无法获取当前用户信息');
                return;
            }

            try {
                const result = await fetch('/notice/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: this.noticeForm.title,
                        content: this.noticeForm.content,
                        creatorId: userInfo.id,
                        creatorName: userInfo.displayName || userInfo.username
                    })
                });
                if (result.code === 200) {
                    this.showSuccess('发布公告成功');
                    this.closeNoticeModal();
                    this.fetchNoticeList();
                } else {
                    this.showError('发布公告失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE] 发布公告失败:', error);
                this.showError('发布公告失败: ' + error.message);
            }
        },

        async handleTodoSubmit() {
            if (!this.todoForm.title.trim()) {
                this.showError('待办标题不能为空');
                return;
            }
            if (!this.todoForm.receiverId) {
                this.showError('请选择接收人');
                return;
            }
            if (!this.todoForm.content.trim()) {
                this.showError('待办内容不能为空');
                return;
            }
            const userInfo = Auth.getUserInfo();
            if (!userInfo || !userInfo.id) {
                this.showError('无法获取当前用户信息');
                return;
            }

            try {
                const result = await fetch('/todo/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: this.todoForm.title,
                        content: this.todoForm.content,
                        receiverId: this.todoForm.receiverId,
                        creatorId: userInfo.id,
                        creatorName: userInfo.displayName || userInfo.username
                    })
                });
                if (result.code === 200) {
                    this.showSuccess('创建待办成功');
                    this.closeTodoModal();
                    this.fetchTodoList();
                } else {
                    this.showError('创建待办失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE] 创建待办失败:', error);
                this.showError('创建待办失败: ' + error.message);
            }
        },

        async handleDeleteNotice(notice) {
            if (!confirm(`确定要删除公告 "${notice.title}" 吗？`)) {
                return;
            }
            try {
                const result = await fetch('/notice/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: notice.id })
                });
                if (result.code === 200) {
                    this.showSuccess('删除公告成功');
                    this.fetchNoticeList();
                } else {
                    this.showError('删除公告失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE] 删除公告失败:', error);
                this.showError('删除公告失败: ' + error.message);
            }
        },

        async handleDeleteTodo(todo) {
            if (!confirm(`确定要删除待办 "${todo.title}" 吗？`)) {
                return;
            }
            try {
                const result = await fetch('/todo/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: todo.id })
                });
                if (result.code === 200) {
                    this.showSuccess('删除待办成功');
                    this.fetchTodoList();
                } else {
                    this.showError('删除待办失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE] 删除待办失败:', error);
                this.showError('删除待办失败: ' + error.message);
            }
        },

        getTodoStatusText(status) {
            const map = { 0: '未完成', 1: '已完成' };
            return map[status] || '未知';
        },

        getTodoStatusClass(status) {
            const map = { 0: 'status-pending', 1: 'status-done' };
            return map[status] || 'status-unknown';
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
                console.error('日期格式化失败:', error);
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

app.component('header-component', HeaderComponent);
app.mount('#app');
