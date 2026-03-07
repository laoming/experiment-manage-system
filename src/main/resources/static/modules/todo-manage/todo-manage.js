/**
 * 消息管理逻辑
 */

const app = Vue.createApp({
    data() {
        return {
            pageError: null,
            loading: true,
            todoList: [],
            userOptions: [],
            queryForm: {
                title: '',
                receiverId: '',
                status: null
            },
            pagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            showModal: false,
            form: {
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
        console.error('[TODO] Vue组件错误:', err, info);
        this.pageError = err.message || '页面加载失败';
        return false;
    },

    methods: {
        async initPage() {
            try {
                await this.fetchUserOptions();
                await this.fetchTodoList();
            } catch (error) {
                console.error('[TODO] 初始化页面失败:', error);
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
                console.error('[TODO] 检查登录状态失败:', error);
                window.location.href = '/ems/common/pages/index.html';
            }
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
                console.error('[TODO] 获取用户列表失败:', error);
                this.showError('获取用户列表失败: ' + error.message);
            }
        },

        async fetchTodoList() {
            this.loading = true;
            try {
                const result = await fetch(`/todo/page?current=${this.pagination.current}&size=${this.pagination.size}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.queryForm)
                });
                if (result.code === 200) {
                    this.todoList = result.data.records || [];
                    this.pagination.total = result.data.total || 0;
                    this.pagination.pages = result.data.pages || 0;
                } else {
                    this.showError('获取消息列表失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[TODO] 获取消息列表失败:', error);
                this.showError('获取消息列表失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        handleSearch() {
            this.pagination.current = 1;
            this.fetchTodoList();
        },

        handleReset() {
            this.queryForm = {
                title: '',
                receiverId: '',
                status: null
            };
            this.pagination.current = 1;
            this.fetchTodoList();
        },

        handlePageChange(page) {
            this.pagination.current = page;
            this.fetchTodoList();
        },

        openModal() {
            this.form = { title: '', content: '', receiverId: '' };
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.form = { title: '', content: '', receiverId: '' };
        },

        async handleSubmit() {
            if (!this.form.title.trim()) {
                this.showError('消息标题不能为空');
                return;
            }
            if (!this.form.receiverId) {
                this.showError('请选择接收人');
                return;
            }
            if (!this.form.content.trim()) {
                this.showError('消息内容不能为空');
                return;
            }
            const userInfo = Auth.getUserInfo();
            if (!userInfo || !userInfo.id) {
                this.showError('无法获取当前用户信息');
                return;
            }

            // 获取接收人名称
            const receiver = this.userOptions.find(u => u.id === this.form.receiverId);
            const receiverName = receiver ? (receiver.displayName || receiver.username) : '';

            try {
                const result = await fetch('/todo/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: this.form.title,
                        content: this.form.content,
                        receiverId: this.form.receiverId,
                        receiverName: receiverName,
                        creatorId: userInfo.id,
                        creatorName: userInfo.displayName || userInfo.username
                    })
                });
                if (result.code === 200) {
                    this.showSuccess('发送消息成功');
                    this.closeModal();
                    this.fetchTodoList();
                } else {
                    this.showError('发送消息失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[TODO] 发送消息失败:', error);
                this.showError('发送消息失败: ' + error.message);
            }
        },

        async handleDelete(todo) {
            if (!confirm(`确定要删除消息 "${todo.title}" 吗？`)) {
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
                    this.showSuccess('删除消息成功');
                    this.fetchTodoList();
                } else {
                    this.showError('删除消息失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[TODO] 删除消息失败:', error);
                this.showError('删除消息失败: ' + error.message);
            }
        },

        getStatusText(status) {
            const map = { 0: '未读', 1: '已读' };
            return map[status] || '未知';
        },

        getStatusClass(status) {
            const map = { 0: 'status-unread', 1: 'status-read' };
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
