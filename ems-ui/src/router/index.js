import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      // 系统管理
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'UserFilled' }
      },
      {
        path: 'organization',
        name: 'Organization',
        component: () => import('@/views/system/organization/index.vue'),
        meta: { title: '组织管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: { title: '菜单管理', icon: 'Menu' }
      },
      // 课程管理
      {
        path: 'course',
        name: 'Course',
        component: () => import('@/views/course/list/index.vue'),
        meta: { title: '课程管理', icon: 'Reading' }
      },
      {
        path: 'my-course',
        name: 'MyCourse',
        component: () => import('@/views/course/my/index.vue'),
        meta: { title: '我的课程', icon: 'Collection' }
      },
      // 实验管理
      {
        path: 'template-list',
        name: 'TemplateList',
        component: () => import('@/views/experiment/template-list/index.vue'),
        meta: { title: '实验模板', icon: 'Document' }
      },
      {
        path: 'template/edit/:id?',
        name: 'TemplateEdit',
        component: () => import('@/views/experiment/template/index.vue'),
        meta: { title: '模板编辑', icon: 'Edit', hidden: true }
      },
      {
        path: 'report',
        name: 'Report',
        component: () => import('@/views/experiment/report/index.vue'),
        meta: { title: '实验报告', icon: 'Tickets' }
      },
      // 消息公告
      {
        path: 'message',
        name: 'Message',
        component: () => import('@/views/message/index.vue'),
        meta: { title: '消息管理', icon: 'ChatDotRound' }
      },
      {
        path: 'notice',
        name: 'Notice',
        component: () => import('@/views/notice/index.vue'),
        meta: { title: '公告管理', icon: 'Bell' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - EMS` : 'EMS'
  
  // 检查登录状态
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/home')
  } else {
    next()
  }
})

export default router
