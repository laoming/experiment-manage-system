/**
 * 公告与消息页面逻辑
 */

const app = Vue.createApp({
    data() {
        return {
            noticeList: [],
            todoList: [],
            noticeLoading: true,
            todoLoading: true,
            pageError: null
        };
    },

    mounted() {
        this.checkLogin();
        this.fetchNotices();
        this.fetchTodos();
    },

    errorCaptured(err, vm, info) {
        console.error('[NOTICE-MESSAGE] Vue组件错误:', err, info);
        this.pageError = err.message || '页面加载失败';
        return false;
    },

    methods: {
        checkLogin() {
            try {
                const token = Auth.getToken();
                if (!token) {
                    window.location.href = '/ems/common/pages/index.html';
                }
            } catch (error) {
                console.error('[NOTICE-MESSAGE] 检查登录状态失败:', error);
                window.location.href = '/ems/common/pages/index.html';
            }
        },

        async fetchNotices() {
            this.noticeLoading = true;
            try {
                const result = await fetch('/notice/list?limit=20', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                if (result.code === 200) {
                    this.noticeList = result.data || [];
                } else {
                    this.showError('获取公告失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE-MESSAGE] 获取公告失败:', error);
                this.showError('获取公告失败: ' + error.message);
            } finally {
                this.noticeLoading = false;
            }
        },

        async fetchTodos() {
            this.todoLoading = true;
            try {
                const userId = Auth.getUserId();
                if (!userId) {
                    this.showError('无法获取当前用户信息');
                    return;
                }
                const result = await fetch(`/todo/listByUser?receiverId=${userId}&status=0&limit=20`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                if (result.code === 200) {
                    this.todoList = result.data || [];
                } else {
                    this.showError('获取待办失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE-MESSAGE] 获取待办失败:', error);
                this.showError('获取待办失败: ' + error.message);
            } finally {
                this.todoLoading = false;
            }
        },

        async completeTodo(todo) {
            if (!confirm(`确定完成待办 "${todo.title}" 吗？`)) {
                return;
            }
            try {
                const result = await fetch('/todo/complete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: todo.id })
                });
                if (result.code === 200) {
                    this.showSuccess('待办已完成');
                    this.fetchTodos();
                } else {
                    this.showError('完成待办失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE-MESSAGE] 完成待办失败:', error);
                this.showError('完成待办失败: ' + error.message);
            }
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
