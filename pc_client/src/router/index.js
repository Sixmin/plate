/**
 * 路由配置模块
 * 功能：定义应用的所有路由配置
 * 移除TypeScript语法，使用JavaScript
 */

import { createRouter, createWebHistory } from 'vue-router'

/**
 * 路由配置数组
 * 注意：这里的路由守卫逻辑已经移到 permission.js 中统一处理
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/ChatView.vue'),
    meta: {
      title: '小易AI助手',
      requiresAuth: false  // 首页暂时不需要登录
    }
  },
  {
    path: '/login',
    name: 'Login',
    redirect: () => {
      // 重定向到首页，并通过query参数标记需要显示登录模态框
      return { path: '/', query: { showLogin: 'true' } }
    },
    meta: {
      title: '用户登录',
      requiresAuth: false  // 登录页面不需要认证
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/ChatView.vue'),
    meta: {
      title: '对话助手',
      requiresAuth: true   // 聊天功能需要登录
    }
  },

  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/ChatView.vue'),  // 临时用ChatView，可以创建404页面
    meta: {
      title: '页面未找到',
      requiresAuth: false
    }
  },
  {
    path: '/403',
    name: 'Forbidden', 
    component: () => import('@/views/ChatView.vue'),  // 临时用ChatView，可以创建403页面
    meta: {
      title: '访问被拒绝',
      requiresAuth: false
    }
  },
  {
    // 404页面必须放在最后
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  // 路由切换时的滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router 