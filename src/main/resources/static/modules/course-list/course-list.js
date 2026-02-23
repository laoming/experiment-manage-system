/**
 * 课程管理列表逻辑
 */

const app = Vue.createApp({
    data() {
        return {
            loading: true,
            courseList: [],
            creatorList: [],
            userList: [],
            templateList: [],
            queryForm: {
                courseName: ''
            },
            pagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            // 表单弹窗
            showFormModal: false,
            isEditMode: false,
            formData: {
                id: '',
                courseName: '',
                description: ''
            },
            // 查看弹窗
            showViewModal: false,
            currentCourse: {},
            // 绑定弹窗
            showBindModal: false,
            bindTab: 'user',
            currentBindCourse: null,
            selectedUserIds: [],
            boundUserIds: [],
            selectedTemplateIds: [],
            boundTemplateIds: [],
            // 缓存数据
            courseUserCache: {},
            courseTemplateCache: {}
        };
    },

    computed: {
        /**
         * 获取可用用户列表
         */
        availableUsers() {
            return (this.userList || []).filter(user => !this.boundUserIds.includes(user.id));
        },

        /**
         * 获取可用模板列表
         */
        availableTemplates() {
            return (this.templateList || []).filter(template => !this.boundTemplateIds.includes(template.id));
        }
    },

    mounted() {
        console.log('[COURSE] 课程管理页面开始加载...');
        this.checkLogin();
        this.initPage();
    },

    methods: {
        async initPage() {
            try {
                await Promise.all([
                    this.fetchCreatorList(),
                    this.fetchUserList(),
                    this.fetchTemplateList(),
                    this.fetchCourseList()
                ]);
            } catch (error) {
                console.error('[COURSE] 初始化页面失败:', error);
            }
        },

        checkLogin() {
            try {
                var token = Auth.getToken();
                if (!token) {
                    window.location.href = '/ems/common/pages/index.html';
                }
            } catch (error) {
                console.error('[COURSE] 检查登录状态失败:', error);
                window.location.href = '/ems/common/pages/index.html';
            }
        },

        /**
         * 获取创建者列表
         */
        async fetchCreatorList() {
            try {
                console.log('[COURSE-LIST] 开始获取创建者列表...');
                var result = await fetch('/user/page?current=1&size=1000', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                console.log('[COURSE-LIST] 获取创建者列表成功:', result);

                if (result.code === 200) {
                    this.creatorList = result.data.records || [];
                } else {
                    console.warn('获取创建者列表失败');
                }
            } catch (error) {
                console.error('[COURSE-LIST] 获取创建者列表失败:', error);
            }
        },

        /**
         * 获取用户列表（用于绑定学生）
         */
        async fetchUserList() {
            try {
                console.log('[COURSE-LIST] 开始获取用户列表...');
                var result = await fetch('/user/page?current=1&size=1000', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                console.log('[COURSE-LIST] 获取用户列表成功:', result);

                if (result.code === 200) {
                    this.userList = result.data.records || [];
                } else {
                    console.warn('获取用户列表失败');
                }
            } catch (error) {
                console.error('[COURSE-LIST] 获取用户列表失败:', error);
            }
        },

        /**
         * 获取实验模板列表（用于绑定）
         */
        async fetchTemplateList() {
            try {
                console.log('[COURSE-LIST] 开始获取实验模板列表...');
                var result = await fetch('/experimentTemplate/page?current=1&size=1000', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });
                console.log('[COURSE-LIST] 获取实验模板列表成功:', result);

                if (result.code === 200) {
                    this.templateList = result.data.records || [];
                } else {
                    console.warn('获取实验模板列表失败');
                }
            } catch (error) {
                console.error('[COURSE-LIST] 获取实验模板列表失败:', error);
            }
        },

        /**
         * 获取课程列表
         */
        async fetchCourseList() {
            this.loading = true;
            try {
                console.log('[COURSE-LIST] 开始获取课程列表...', this.queryForm);
                var result = await fetch('/course/page?current=' + this.pagination.current + '&size=' + this.pagination.size, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.queryForm)
                });
                console.log('[COURSE-LIST] 获取课程列表成功:', result);

                if (result.code === 200) {
                    this.courseList = result.data.records || [];
                    this.pagination.total = result.data.total || 0;
                    this.pagination.pages = result.data.pages || 0;
                    
                    // 获取每个课程的用户和模板绑定情况
                    for (var i = 0; i < this.courseList.length; i++) {
                        var course = this.courseList[i];
                        this.fetchCourseUserIds(course.id);
                        this.fetchCourseTemplateIds(course.id);
                    }
                } else {
                    this.showError('获取课程列表失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] 获取课程列表失败:', error);
                this.showError('获取课程列表失败: ' + error.message);
            } finally {
                this.loading = false;
            }
        },

        /**
         * 获取课程绑定的用户ID列表
         */
        async fetchCourseUserIds(courseId) {
            try {
                var result = await fetch('/course/getUserIds?courseId=' + courseId, {
                    method: 'POST'
                });
                if (result.code === 200) {
                    this.courseUserCache[courseId] = result.data || [];
                }
            } catch (error) {
                console.error('获取课程用户ID列表失败:', error);
            }
        },

        /**
         * 获取课程绑定的实验模板ID列表
         */
        async fetchCourseTemplateIds(courseId) {
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
        handleSearch() {
            this.pagination.current = 1;
            this.fetchCourseList();
        },

        /**
         * 重置搜索条件
         */
        handleReset() {
            this.queryForm = {
                courseName: ''
            };
            this.pagination.current = 1;
            this.fetchCourseList();
        },

        /**
         * 分页变化
         */
        handlePageChange(page) {
            this.pagination.current = page;
            this.fetchCourseList();
        },

        /**
         * 打开新增课程弹窗
         */
        openAddModal() {
            this.isEditMode = false;
            this.formData = {
                id: '',
                courseName: '',
                description: ''
            };
            this.showFormModal = true;
        },

        /**
         * 打开编辑课程弹窗
         */
        async openEditModal(course) {
            try {
                console.log('[COURSE-LIST] 获取课程详情:', course.id);
                var result = await fetch('/course/get?courseId=' + course.id, {
                    method: 'POST'
                });
                console.log('[COURSE-LIST] 获取课程详情成功:', result);

                if (result.code === 200) {
                    this.isEditMode = true;
                    this.formData = {
                        id: result.data.id,
                        courseName: result.data.courseName,
                        description: result.data.description
                    };
                    this.showFormModal = true;
                } else {
                    this.showError('获取课程详情失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] 获取课程详情失败:', error);
                this.showError('获取课程详情失败: ' + error.message);
            }
        },

        /**
         * 提交表单
         */
        async handleSubmit() {
            try {
                var url = this.isEditMode ? '/course/update' : '/course/add';
                console.log('[COURSE-LIST] ' + (this.isEditMode ? '更新' : '新增') + '课程:', this.formData);
                
                var result = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.formData)
                });
                console.log('[COURSE-LIST] ' + (this.isEditMode ? '更新' : '新增') + '课程成功:', result);
                
                if (result.code === 200) {
                    this.showSuccess((this.isEditMode ? '更新' : '新增') + '课程成功');
                    this.closeFormModal();
                    this.fetchCourseList();
                } else {
                    this.showError((this.isEditMode ? '更新' : '新增') + '课程失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] ' + (this.isEditMode ? '更新' : '新增') + '课程失败:', error);
                this.showError((this.isEditMode ? '更新' : '新增') + '课程失败: ' + error.message);
            }
        },

        /**
         * 关闭表单弹窗
         */
        closeFormModal() {
            this.showFormModal = false;
            this.formData = {
                id: '',
                courseName: '',
                description: ''
            };
        },

        /**
         * 打开查看课程弹窗
         */
        async openViewModal(course) {
            try {
                console.log('[COURSE-LIST] 获取课程详情:', course.id);
                var result = await fetch('/course/get?courseId=' + course.id, {
                    method: 'POST'
                });
                console.log('[COURSE-LIST] 获取课程详情成功:', result);

                if (result.code === 200) {
                    this.currentCourse = result.data;
                    this.showViewModal = true;
                } else {
                    this.showError('获取课程详情失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] 获取课程详情失败:', error);
                this.showError('获取课程详情失败: ' + error.message);
            }
        },

        /**
         * 关闭查看弹窗
         */
        closeViewModal() {
            this.showViewModal = false;
            this.currentCourse = {};
        },

        /**
         * 删除课程
         */
        async handleDelete(course) {
            if (!confirm('确定要删除课程 "' + course.courseName + '" 吗？')) {
                return;
            }

            try {
                console.log('[COURSE-LIST] 删除课程:', { id: course.id, courseName: course.courseName });
                var result = await fetch('/course/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ id: course.id })
                });
                console.log('[COURSE-LIST] 删除课程成功:', result);
                
                if (result.code === 200) {
                    this.showSuccess('删除课程成功');
                    this.fetchCourseList();
                } else {
                    this.showError('删除课程失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] 删除课程失败:', error);
                this.showError('删除课程失败: ' + error.message);
            }
        },

        /**
         * 打开绑定管理弹窗
         */
        async openBindModal(course) {
            this.currentBindCourse = course;
            this.bindTab = 'user';
            
            // 获取已绑定的用户和模板
            await this.fetchCourseUserIds(course.id);
            await this.fetchCourseTemplateIds(course.id);
            
            this.selectedUserIds = [];
            this.selectedTemplateIds = [];
            this.boundUserIds = [].concat(this.courseUserCache[course.id] || []);
            this.boundTemplateIds = [].concat(this.courseTemplateCache[course.id] || []);
            
            this.showBindModal = true;
        },

        /**
         * 关闭绑定管理弹窗
         */
        closeBindModal() {
            this.showBindModal = false;
            this.currentBindCourse = null;
            this.selectedUserIds = [];
            this.boundUserIds = [];
            this.selectedTemplateIds = [];
            this.boundTemplateIds = [];
        },

        /**
         * 切换用户选择
         */
        toggleUserSelection(userId) {
            var index = this.selectedUserIds.indexOf(userId);
            if (index > -1) {
                this.selectedUserIds.splice(index, 1);
            } else {
                this.selectedUserIds.push(userId);
            }
        },

        /**
         * 切换模板选择
         */
        toggleTemplateSelection(templateId) {
            var index = this.selectedTemplateIds.indexOf(templateId);
            if (index > -1) {
                this.selectedTemplateIds.splice(index, 1);
            } else {
                this.selectedTemplateIds.push(templateId);
            }
        },

        /**
         * 保存用户绑定
         */
        async saveUserBindings() {
            try {
                // 解除选中的用户
                if (this.selectedUserIds.length > 0) {
                    var unbindResult = await fetch('/course/unbindUsers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            courseId: this.currentBindCourse.id,
                            userIds: this.selectedUserIds
                        })
                    });
                    if (unbindResult.code !== 200) {
                        this.showError('解除用户绑定失败: ' + (unbindResult.message || '未知错误'));
                        return;
                    }
                }

                // 从已绑定列表中移除
                var self = this;
                this.boundUserIds = this.boundUserIds.filter(function(id) {
                    return !self.selectedUserIds.includes(id);
                });
                this.selectedUserIds = [];
                
                this.showSuccess('解除用户绑定成功');
                await this.fetchCourseList();
            } catch (error) {
                console.error('[COURSE-LIST] 保存用户绑定失败:', error);
                this.showError('保存用户绑定失败: ' + error.message);
            }
        },

        /**
         * 保存模板绑定
         */
        async saveTemplateBindings() {
            try {
                // 解除选中的模板
                if (this.selectedTemplateIds.length > 0) {
                    var unbindResult = await fetch('/course/unbindTemplates', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            courseId: this.currentBindCourse.id,
                            templateIds: this.selectedTemplateIds
                        })
                    });
                    if (unbindResult.code !== 200) {
                        this.showError('解除模板绑定失败: ' + (unbindResult.message || '未知错误'));
                        return;
                    }
                }

                // 从已绑定列表中移除
                var self = this;
                this.boundTemplateIds = this.boundTemplateIds.filter(function(id) {
                    return !self.selectedTemplateIds.includes(id);
                });
                this.selectedTemplateIds = [];
                
                this.showSuccess('解除模板绑定成功');
                await this.fetchCourseList();
            } catch (error) {
                console.error('[COURSE-LIST] 保存模板绑定失败:', error);
                this.showError('保存模板绑定失败: ' + error.message);
            }
        },

        /**
         * 移除用户
         */
        removeUser(userId) {
            this.selectedUserIds.push(userId);
        },

        /**
         * 移除模板
         */
        removeTemplate(templateId) {
            this.selectedTemplateIds.push(templateId);
        },



        /**
         * 根据创建者ID获取创建者名称
         */
        getCreatorName(creatorId) {
            if (!creatorId) {
                return '-';
            }
            var creator = this.creatorList.find(function(c) { return c.id === creatorId; });
            return creator ? creator.displayName : creatorId;
        },

        /**
         * 根据用户ID获取用户名称
         */
        getUserName(userId) {
            if (!userId) {
                return '-';
            }
            var user = this.userList.find(function(u) { return u.id === userId; });
            return user ? user.displayName : userId;
        },

        /**
         * 根据模板ID获取模板名称
         */
        getTemplateName(templateId) {
            if (!templateId) {
                return '-';
            }
            var template = this.templateList.find(function(t) { return t.id === templateId; });
            return template ? template.templateName : templateId;
        },

        /**
         * 获取学生人数
         */
        getStudentCount(courseId) {
            return (this.courseUserCache[courseId] || []).length;
        },

        /**
         * 获取模板数量
         */
        getTemplateCount(courseId) {
            return (this.courseTemplateCache[courseId] || []).length;
        },

        /**
         * 格式化日期时间
         */
        formatDateTime(dateStr) {
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
        showSuccess(message) {
            alert('成功: ' + message);
        },

        /**
         * 显示错误消息
         */
        showError(message) {
            alert('错误: ' + message);
        }
    }
});

// 注册顶部导航栏组件
app.component('header-component', HeaderComponent);

// 挂载应用
app.mount('#app');
