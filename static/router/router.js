/**
 * 路由配置
 * 管理所有页面的路由信息
 */

const Router = {
    // 路由配置
    routes: {
        // 登录页
        login: {
            path: '/ems/common/pages/index.html',
            title: '登录'
        },

        // 首页
        home: {
            path: '/ems/common/pages/home.html',
            title: '首页',
            icon: '🏠'
        },

        // 用户管理
        user: {
            path: '/ems/modules/user/user.html',
            title: '用户管理',
            icon: '👤'
        },

        // 角色管理
        role: {
            path: '/ems/modules/role/role.html',
            title: '角色管理',
            icon: '👥'
        },

        // 组织管理
        organization: {
            path: '/ems/modules/organization/organization.html',
            title: '组织管理',
            icon: '🏢'
        },

        // 课程列表
        courseList: {
            path: '/ems/modules/course-list/course-list.html',
            title: '课程管理',
            icon: '📚'
        },

        // 我的课程
        myCourse: {
            path: '/ems/modules/my-course/my-course.html',
            title: '我的课程',
            icon: '📖'
        },

        // 实验模板列表
        experimentTemplateList: {
            path: '/ems/modules/experiment-template-list/experiment-template-list.html',
            title: '实验模板',
            icon: '🧪'
        },

        // 实验模板编辑
        experimentTemplate: {
            path: '/ems/modules/experiment-template/experiment-template.html',
            title: '模板编辑',
            icon: '📝'
        },

        // 实验报告
        experimentReport: {
            path: '/ems/modules/experiment-report/experiment-report.html',
            title: '实验报告',
            icon: '📋'
        },

        // 消息管理
        messageManage: {
            path: '/ems/modules/message-manage/message-manage.html',
            title: '消息管理',
            icon: '💬'
        },

        // 通知管理
        noticeManage: {
            path: '/ems/modules/notice-manage/notice-manage.html',
            title: '通知管理',
            icon: '📢'
        },

        // 菜单管理
        menu: {
            path: '/ems/modules/menu/menu.html',
            title: '菜单管理',
            icon: '📑'
        }
    },

    /**
     * 根据路由键获取路由信息
     * @param {string} key - 路由键
     * @returns {object|null} 路由信息
     */
    getRoute(key) {
        return this.routes[key] || null;
    },

    /**
     * 根据路径获取路由信息
     * @param {string} path - 路径
     * @returns {object|null} 路由信息
     */
    getRouteByPath(path) {
        return Object.values(this.routes).find(route => route.path === path) || null;
    },

    /**
     * 跳转到指定路由
     * @param {string} key - 路由键
     */
    navigate(key) {
        const route = this.getRoute(key);
        if (route) {
            window.location.href = route.path;
        }
    },

    /**
     * 根据权限过滤路由
     * @param {Array<string>} permissions - 权限列表
     * @returns {Array<object>} 过滤后的路由列表
     */
    filterRoutes(permissions) {
        return Object.entries(this.routes)
            .filter(([key, route]) => {
                // 这里可以根据实际的权限逻辑进行过滤
                // 暂时返回所有路由
                return true;
            })
            .map(([key, route]) => ({ key, ...route }));
    }
};

// 如果使用 ES6 模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}
