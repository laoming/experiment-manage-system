/**
 * 课程管理列表逻辑
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
            bindTab: 'admin',
            currentBindCourse: null,
            // 管理者相关
            selectedAdminIds: [],
            boundAdminIds: [],
            adminList: [],
            adminPagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            adminSearchKeyword: '',
            // 学生相关
            selectedStudentIds: [],
            boundStudentIds: [],
            studentList: [],
            studentPagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            studentSearchKeyword: '',
            // 模板相关
            selectedTemplateIds: [],
            boundTemplateIds: [],
            templateList: [],
            templatePagination: {
                current: 1,
                size: 10,
                total: 0,
                pages: 0
            },
            templateSearchKeyword: '',
            // 权限缓存
            courseCreatorCache: {},
            // 页面加载状态
            pageError: null
        };
    },

    computed: {
        /**
         * 获取可添加为管理者的用户列表
         */
        availableAdmins() {
            var self = this;
            return (this.adminList || []).filter(function(user) {
                return !self.boundAdminIds.includes(user.id);
            });
        },

        /**
         * 获取可绑定的学生列表
         */
        availableStudents() {
            var self = this;
            return (this.studentList || []).filter(function(user) {
                return !self.boundStudentIds.includes(user.id) && !self.boundAdminIds.includes(user.id);
            });
        },

        /**
         * 获取可用模板列表
         */
        availableTemplates() {
            var self = this;
            return (this.templateList || []).filter(function(template) {
                return !self.boundTemplateIds.includes(template.id);
            });
        }
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
         * 搜索管理者（分页）
         */
        searchAdmins: async function() {
            try {
                var params = 'current=' + this.adminPagination.current + '&size=' + this.adminPagination.size;
                var body = {};
                if (this.adminSearchKeyword) {
                    body.displayName = this.adminSearchKeyword;
                }
                var result = await fetch('/user/page?' + params, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (result.code === 200) {
                    this.adminList = result.data.records || [];
                    this.adminPagination.total = result.data.total || 0;
                    this.adminPagination.pages = result.data.pages || 0;
                }
            } catch (error) {
                console.error('[COURSE-LIST] 搜索管理者失败:', error);
            }
        },

        /**
         * 管理者分页变化
         */
        handleAdminPageChange: function(page) {
            this.adminPagination.current = page;
            this.searchAdmins();
        },

        /**
         * 管理者搜索
         */
        handleAdminSearch: function() {
            this.adminPagination.current = 1;
            this.searchAdmins();
        },

        /**
         * 搜索学生（分页）
         */
        searchStudents: async function() {
            try {
                var params = 'current=' + this.studentPagination.current + '&size=' + this.studentPagination.size;
                var body = {};
                if (this.studentSearchKeyword) {
                    body.displayName = this.studentSearchKeyword;
                }
                var result = await fetch('/user/page?' + params, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (result.code === 200) {
                    this.studentList = result.data.records || [];
                    this.studentPagination.total = result.data.total || 0;
                    this.studentPagination.pages = result.data.pages || 0;
                }
            } catch (error) {
                console.error('[COURSE-LIST] 搜索学生失败:', error);
            }
        },

        /**
         * 学生分页变化
         */
        handleStudentPageChange: function(page) {
            this.studentPagination.current = page;
            this.searchStudents();
        },

        /**
         * 学生搜索
         */
        handleStudentSearch: function() {
            this.studentPagination.current = 1;
            this.searchStudents();
        },

        /**
         * 搜索模板（分页）
         */
        searchTemplates: async function() {
            try {
                var params = 'current=' + this.templatePagination.current + '&size=' + this.templatePagination.size;
                var body = {};
                if (this.templateSearchKeyword) {
                    body.templateName = this.templateSearchKeyword;
                }
                var result = await fetch('/experimentTemplate/page?' + params, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (result.code === 200) {
                    this.templateList = result.data.records || [];
                    this.templatePagination.total = result.data.total || 0;
                    this.templatePagination.pages = result.data.pages || 0;
                }
            } catch (error) {
                console.error('[COURSE-LIST] 搜索模板失败:', error);
            }
        },

        /**
         * 模板分页变化
         */
        handleTemplatePageChange: function(page) {
            this.templatePagination.current = page;
            this.searchTemplates();
        },

        /**
         * 模板搜索
         */
        handleTemplateSearch: function() {
            this.templatePagination.current = 1;
            this.searchTemplates();
        },

        /**
         * 获取课程列表
         */
        fetchCourseList: async function() {
            this.loading = true;
            try {
                console.log('[COURSE-LIST] 开始获取课程列表...', this.queryForm);
                // 课程管理菜单传递 userType=1（管理者）
                var result = await fetch('/course/page?current=' + this.pagination.current + '&size=' + this.pagination.size + '&userType=1', {
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
                    
                    // 缓存创建者信息（不在此处查询管理者、学生和模板，延迟到查看/绑定时查询）
                    for (var i = 0; i < this.courseList.length; i++) {
                        var course = this.courseList[i];
                        this.courseCreatorCache[course.id] = course.creatorId;
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
         * 获取课程的管理者ID列表
         */
        fetchCourseAdminIds: async function(courseId) {
            try {
                var result = await fetch('/course/getAdminIds?courseId=' + courseId, {
                    method: 'POST'
                });
                if (result.code === 200) {
                    return result.data || [];
                }
            } catch (error) {
                console.error('获取课程管理者ID列表失败:', error);
            }
            return [];
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
                    return result.data || [];
                }
            } catch (error) {
                console.error('获取课程学生ID列表失败:', error);
            }
            return [];
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
                    return result.data || [];
                }
            } catch (error) {
                console.error('获取课程模板ID列表失败:', error);
            }
            return [];
        },

        /**
         * 获取课程绑定的实验模板信息列表（包含ID和名称）
         */
        fetchCourseTemplateInfos: async function(courseId) {
            try {
                var result = await fetch('/course/getTemplateInfos?courseId=' + courseId, {
                    method: 'POST'
                });
                if (result.code === 200) {
                    return result.data || [];
                }
            } catch (error) {
                console.error('获取课程模板信息列表失败:', error);
            }
            return [];
        },

        /**
         * 检查当前用户是否是课程创建者
         */
        isCourseCreator: function(course) {
            // 从缓存中获取创建者ID
            var creatorId = this.courseCreatorCache[course.id] || course.creatorId;
            // 这里假设当前用户ID可以从 Auth 模块获取
            // 由于前端没有直接获取用户ID的方法，我们通过接口来判断
            return true; // 暂时返回true，实际权限由后端控制
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
         * 打开新增课程弹窗
         */
        openAddModal: function() {
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
        openEditModal: async function(course) {
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
        handleSubmit: async function() {
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
        closeFormModal: function() {
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
        openViewModal: async function(course) {
            try {
                console.log('[COURSE-LIST] 获取课程详情:', course.id);
                var result = await fetch('/course/get?courseId=' + course.id, {
                    method: 'POST'
                });
                console.log('[COURSE-LIST] 获取课程详情成功:', result);

                if (result.code === 200) {
                    this.currentCourse = result.data;
                    // 加载管理者、学生和模板数据
                    this.currentCourse.adminIds = await this.fetchCourseAdminIds(course.id);
                    this.currentCourse.studentIds = await this.fetchCourseStudentIds(course.id);
                    // 获取模板信息列表，并存入templateList以便getTemplateName方法使用
                    var templateInfos = await this.fetchCourseTemplateInfos(course.id);
                    this.templateList = templateInfos;
                    this.currentCourse.templateIds = templateInfos.map(function(t) { return t.id; });
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
        closeViewModal: function() {
            this.showViewModal = false;
            this.currentCourse = {};
        },

        /**
         * 删除课程（只有创建者可以删除）
         */
        handleDelete: async function(course) {
            if (!confirm('确定要删除课程 "' + course.courseName + '" 吗？\n注意：只有课程创建者可以删除课程。')) {
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
                console.log('[COURSE-LIST] 删除课程结果:', result);
                
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
        openBindModal: async function(course) {
            this.currentBindCourse = course;
            this.bindTab = 'admin';

            // 获取已绑定的管理者、学生和模板
            var adminIds = await this.fetchCourseAdminIds(course.id);
            var studentIds = await this.fetchCourseStudentIds(course.id);
            var templateIds = await this.fetchCourseTemplateIds(course.id);

            this.selectedAdminIds = [];
            this.selectedStudentIds = [];
            this.selectedTemplateIds = [];
            this.boundAdminIds = adminIds;
            this.boundStudentIds = studentIds;
            this.boundTemplateIds = templateIds;

            // 重置分页和搜索状态
            this.adminSearchKeyword = '';
            this.adminPagination = { current: 1, size: 10, total: 0, pages: 0 };
            this.studentSearchKeyword = '';
            this.studentPagination = { current: 1, size: 10, total: 0, pages: 0 };
            this.templateSearchKeyword = '';
            this.templatePagination = { current: 1, size: 10, total: 0, pages: 0 };

            // 加载第一页数据
            await this.searchAdmins();
            await this.searchStudents();
            await this.searchTemplates();

            this.showBindModal = true;
        },

        /**
         * 关闭绑定管理弹窗
         */
        closeBindModal: function() {
            this.showBindModal = false;
            this.currentBindCourse = null;
            this.selectedAdminIds = [];
            this.selectedStudentIds = [];
            this.selectedTemplateIds = [];
            this.boundAdminIds = [];
            this.boundStudentIds = [];
            this.boundTemplateIds = [];
            this.adminList = [];
            this.studentList = [];
            this.templateList = [];
        },

        /**
         * 切换管理者选择
         */
        toggleAdminSelection: function(userId) {
            var index = this.selectedAdminIds.indexOf(userId);
            if (index > -1) {
                this.selectedAdminIds.splice(index, 1);
            } else {
                this.selectedAdminIds.push(userId);
            }
        },

        /**
         * 切换学生选择
         */
        toggleStudentSelection: function(userId) {
            var index = this.selectedStudentIds.indexOf(userId);
            if (index > -1) {
                this.selectedStudentIds.splice(index, 1);
            } else {
                this.selectedStudentIds.push(userId);
            }
        },

        /**
         * 切换模板选择
         */
        toggleTemplateSelection: function(templateId) {
            var index = this.selectedTemplateIds.indexOf(templateId);
            if (index > -1) {
                this.selectedTemplateIds.splice(index, 1);
            } else {
                this.selectedTemplateIds.push(templateId);
            }
        },

        /**
         * 添加管理者
         */
        addAdmins: async function() {
            if (this.selectedAdminIds.length === 0) {
                this.showError('请选择要添加的管理者');
                return;
            }
            try {
                var result = await fetch('/course/bindAdmins', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        courseId: this.currentBindCourse.id,
                        userIds: this.selectedAdminIds
                    })
                });
                if (result.code === 200) {
                    this.showSuccess('添加管理者成功');
                    // 刷新管理者列表
                    this.boundAdminIds = await this.fetchCourseAdminIds(this.currentBindCourse.id);
                    this.selectedAdminIds = [];
                    // 刷新课程列表（更新统计数据）
                    await this.fetchCourseList();
                    // 刷新可添加列表
                    await this.searchAdmins();
                } else {
                    this.showError('添加管理者失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] 添加管理者失败:', error);
                this.showError('添加管理者失败: ' + error.message);
            }
        },

        /**
         * 移除管理者
         */
        removeAdmins: async function() {
            if (this.selectedAdminIds.length === 0) {
                this.showError('请选择要移除的管理者');
                return;
            }
            try {
                var result = await fetch('/course/unbindUsers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        courseId: this.currentBindCourse.id,
                        userIds: this.selectedAdminIds
                    })
                });
                if (result.code === 200) {
                    this.showSuccess('移除管理者成功');
                    // 刷新管理者列表
                    this.boundAdminIds = await this.fetchCourseAdminIds(this.currentBindCourse.id);
                    this.selectedAdminIds = [];
                    // 刷新课程列表（更新统计数据）
                    await this.fetchCourseList();
                    // 刷新可添加列表
                    await this.searchAdmins();
                } else {
                    this.showError('移除管理者失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] 移除管理者失败:', error);
                this.showError('移除管理者失败: ' + error.message);
            }
        },

        /**
         * 添加学生
         */
        addStudents: async function() {
            if (this.selectedStudentIds.length === 0) {
                this.showError('请选择要添加的学生');
                return;
            }
            try {
                var result = await fetch('/course/bindUsers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        courseId: this.currentBindCourse.id,
                        userIds: this.selectedStudentIds
                    })
                });
                if (result.code === 200) {
                    this.showSuccess('添加学生成功');
                    // 刷新学生列表
                    this.boundStudentIds = await this.fetchCourseStudentIds(this.currentBindCourse.id);
                    this.selectedStudentIds = [];
                    // 刷新课程列表（更新统计数据）
                    await this.fetchCourseList();
                    // 刷新可添加列表
                    await this.searchStudents();
                } else {
                    this.showError('添加学生失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] 添加学生失败:', error);
                this.showError('添加学生失败: ' + error.message);
            }
        },

        /**
         * 移除学生
         */
        removeStudents: async function() {
            if (this.selectedStudentIds.length === 0) {
                this.showError('请选择要移除的学生');
                return;
            }
            try {
                var result = await fetch('/course/unbindUsers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        courseId: this.currentBindCourse.id,
                        userIds: this.selectedStudentIds
                    })
                });
                if (result.code === 200) {
                    this.showSuccess('移除学生成功');
                    // 刷新学生列表
                    this.boundStudentIds = await this.fetchCourseStudentIds(this.currentBindCourse.id);
                    this.selectedStudentIds = [];
                    // 刷新课程列表（更新统计数据）
                    await this.fetchCourseList();
                    // 刷新可添加列表
                    await this.searchStudents();
                } else {
                    this.showError('移除学生失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] 移除学生失败:', error);
                this.showError('移除学生失败: ' + error.message);
            }
        },

        /**
         * 添加模板绑定
         */
        addTemplates: async function() {
            if (this.selectedTemplateIds.length === 0) {
                this.showError('请选择要绑定的模板');
                return;
            }
            try {
                var result = await fetch('/course/bindTemplates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        courseId: this.currentBindCourse.id,
                        templateIds: this.selectedTemplateIds
                    })
                });
                if (result.code === 200) {
                    this.showSuccess('绑定模板成功');
                    // 刷新模板列表
                    this.boundTemplateIds = await this.fetchCourseTemplateIds(this.currentBindCourse.id);
                    this.selectedTemplateIds = [];
                    // 刷新课程列表（更新统计数据）
                    await this.fetchCourseList();
                    // 刷新可添加列表
                    await this.searchTemplates();
                } else {
                    this.showError('绑定模板失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] 绑定模板失败:', error);
                this.showError('绑定模板失败: ' + error.message);
            }
        },

        /**
         * 解除模板绑定
         */
        removeTemplates: async function() {
            if (this.selectedTemplateIds.length === 0) {
                this.showError('请选择要解除绑定的模板');
                return;
            }
            try {
                var result = await fetch('/course/unbindTemplates', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        courseId: this.currentBindCourse.id,
                        templateIds: this.selectedTemplateIds
                    })
                });
                if (result.code === 200) {
                    this.showSuccess('解除模板绑定成功');
                    // 刷新模板列表
                    this.boundTemplateIds = await this.fetchCourseTemplateIds(this.currentBindCourse.id);
                    this.selectedTemplateIds = [];
                    // 刷新课程列表（更新统计数据）
                    await this.fetchCourseList();
                    // 刷新可添加列表
                    await this.searchTemplates();
                } else {
                    this.showError('解除模板绑定失败: ' + (result.message || '未知错误'));
                }
            } catch (error) {
                console.error('[COURSE-LIST] 解除模板绑定失败:', error);
                this.showError('解除模板绑定失败: ' + error.message);
            }
        },

        /**
         * 移除模板
         */
        removeTemplate: function(templateId) {
            this.selectedTemplateIds.push(templateId);
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
         * 根据用户ID获取用户名称
         */
        getUserName: function(userId) {
            if (!userId) {
                return '-';
            }
            var user = this.userList.find(function(u) { return u.id === userId; });
            return user ? user.displayName : userId;
        },

        /**
         * 根据模板ID获取模板名称
         */
        getTemplateName: function(templateId) {
            if (!templateId) {
                return '-';
            }
            var template = this.templateList.find(function(t) { return t.id === templateId; });
            return template ? template.templateName : templateId;
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
