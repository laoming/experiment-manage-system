/**
 * 我的课程列表逻辑（学生视角）
 */

const app = Vue.createApp({
    data() {
        return {
            loading: true,
            courseList: [],
            creatorList: [],
            queryForm: {
                courseName: ''
            },
            pagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            // 查看弹窗
            showViewModal: false,
            currentCourse: {},
            // 课程详情缓存
            courseStudentCache: {},
            courseTemplateCache: {},
            // 页面加载状态
            pageError: null
        };
    },

    mounted() {
        this.$nextTick(function() {
            this.loadData();
        });
    },

    errorCaptured: function(err, vm, info) {
        console.error('Vue组件错误:', err, info);
        this.pageError = err.message || '页面加载失败';
        return false;
    },

    methods: {
        /**
         * 加载数据
         */
        loadData: async function() {
            this.pageError = null;
            var token = Auth.getToken();
            if (!token) {
                console.warn('未登录，不执行数据加载');
                return;
            }

            try {
                await Promise.all([
                    this.fetchCreatorList(),
                    this.fetchCourseList()
                ]);
            } catch (error) {
                console.error('加载数据失败:', error);
                this.pageError = '加载数据失败，请刷新页面重试';
            }
        },

        /**
         * 获取创建者列表
         */
        fetchCreatorList: async function() {
            try {
                var result = await fetch('/user/page?current=1&size=1000', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });

                if (result.code === 200) {
                    this.creatorList = result.data.records || [];
                }
            } catch (error) {
                console.error('获取创建者列表失败:', error);
            }
        },

        /**
         * 获取课程列表（作为学生参与的课程）
         */
        fetchCourseList: async function() {
            this.loading = true;
            try {
                // 我的课程菜单传递 userType=2（学生）
                var result = await fetch('/course/page?current=' + this.pagination.current + '&size=' + this.pagination.size + '&userType=2', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.queryForm)
                });

                if (result.code === 200) {
                    this.courseList = result.data.records || [];
                    this.pagination.total = result.data.total || 0;
                    this.pagination.pages = result.data.pages || 0;
                    
                    // 获取每个课程的学生和模板绑定情况
                    for (var i = 0; i < this.courseList.length; i++) {
                        var course = this.courseList[i];
                        this.fetchCourseStudentIds(course.id);
                        this.fetchCourseTemplateIds(course.id);
                    }
                } else {
                    this.showError('获取课程列表失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('获取课程列表失败:', error);
                this.showError('获取课程列表失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * 获取课程的学生ID列表
         */
        fetchCourseStudentIds: async function(courseId) {
            try {
                var result = await fetch('/course/getStudentIds?courseId=' + courseId, {
                    method: 'POST'
                });
                if (result.code === 200) {
                    this.courseStudentCache[courseId] = result.data || [];
                }
            } catch (error) {
                console.error('获取课程学生ID列表失败:', error);
            }
        },

        /**
         * 获取课程绑定的实验模板ID列表
         */
        fetchCourseTemplateIds: async function(courseId) {
            try {
                var result = await fetch('/course/getTemplateIds?courseId=' + courseId, {
                    method: 'POST'
                });
                if (result.code === 200) {
                    this.courseTemplateCache[courseId] = result.data || [];
                }
            } catch (error) {
                console.error('获取课程模板ID列表失败:', error);
            }
        },

        /**
         * 搜索
         */
        handleSearch: function() {
            this.pagination.current = 1;
            this.fetchCourseList();
        },

        /**
         * 重置搜索条件
         */
        handleReset: function() {
            this.queryForm = {
                courseName: ''
            };
            this.pagination.current = 1;
            this.fetchCourseList();
        },

        /**
         * 分页变化
         */
        handlePageChange: function(page) {
            this.pagination.current = page;
            this.fetchCourseList();
        },

        /**
         * 打开查看课程弹窗
         */
        openViewModal: async function(course) {
            try {
                var result = await fetch('/course/get?courseId=' + course.id, {
                    method: 'POST'
                });

                if (result.code === 200) {
                    this.currentCourse = result.data;
                    this.showViewModal = true;
                } else {
                    this.showError('获取课程详情失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('获取课程详情失败:', error);
                this.showError('获取课程详情失败: ' + error.message);
            }
        },

        /**
         * 关闭查看弹窗
         */
        closeViewModal: function() {
            this.showViewModal = false;
            this.currentCourse = {};
        },

        /**
         * 根据创建者ID获取创建者名称
         */
        getCreatorName: function(creatorId) {
            if (!creatorId) {
                return '-';
            }
            var creator = this.creatorList.find(function(c) { return c.id === creatorId; });
            return creator ? creator.displayName : creatorId;
        },

        /**
         * 获取学生人数
         */
        getStudentCount: function(courseId) {
            return (this.courseStudentCache[courseId] || []).length;
        },

        /**
         * 获取模板数量
         */
        getTemplateCount: function(courseId) {
            return (this.courseTemplateCache[courseId] || []).length;
        },

        /**
         * 格式化日期时间
         */
        formatDateTime: function(dateStr) {
            if (!dateStr) return '-';
            try {
                var date = new Date(dateStr);
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
        showSuccess: function(message) {
            alert('成功: ' + message);
        },

        /**
         * 显示错误消息
         */
        showError: function(message) {
            alert('错误: ' + message);
        }
    }
});

// 注册顶部导航栏组件
app.component('header-component', HeaderComponent);

// 挂载应用
app.mount('#app');
