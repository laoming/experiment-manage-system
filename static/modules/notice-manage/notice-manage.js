/**
 * 公告管理逻辑
 */

const app = Vue.createApp({
    data() {
        return {
            pageError: null,
            noticeLoading: true,
            noticeList: [],
            showNoticeModal: false,
            noticeForm: {
                title: '',
                content: ''
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
                await this.fetchNoticeList();
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

        async fetchNoticeList() {
            this.noticeLoading = true;
            try {
                const result = await fetch('/notice/latest?limit=20', {
                    method: 'GET'
                });
                if (result.code === 200) {
                    this.noticeList = result.data || [];
                } else {
                    this.showError('获取公告失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[NOTICE] 获取公告失败:', error);
                this.showError('获取公告失败: ' + error.message);
            } finally {
                this.noticeLoading = false;
            }
        },

        openNoticeModal() {
            this.noticeForm = { title: '', content: '' };
            this.showNoticeModal = true;
        },

        closeNoticeModal() {
            this.showNoticeModal = false;
            this.noticeForm = { title: '', content: '' };
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
