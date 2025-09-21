/**
 * 路由权限控制模块
 * 功能：实现路由级权限控制，包括登录验证、权限检查等
 * 参考管理端permission.js，适配PC端需求
 */

import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { getToken } from '@/utils/auth'
import { message } from 'ant-design-vue'

/**
 * 白名单路由配置
 * 这些路由不需要登录即可访问
 */
const whiteList = [
  '/',           // 首页
  '/login',      // 登录页
  '/register',   // 注册页
  '/404',        // 404页面
  '/403'         // 403页面
]

/**
 * 检查路径是否在白名单中
 * @param {string} path 路由路径
 * @returns {boolean} 是否在白名单中
 */
function isWhiteList(path) {
  return whiteList.includes(path)
}

/**
 * 检查用户是否有访问指定路由的权限
 * @param {Object} route 路由对象
 * @param {Object} authStore 认证store
 * @returns {boolean} 是否有权限
 */
function hasRoutePermission(route, authStore) {
  // 如果路由没有权限要求，允许访问
  if (!route.meta?.requiresAuth) {
    return true
  }

  // 检查是否需要特定权限
  if (route.meta.permissions) {
    return authStore.hasAnyPermission(route.meta.permissions)
  }

  // 检查是否需要特定角色
  if (route.meta.roles) {
    return authStore.hasAnyRole(route.meta.roles)
  }

  // 默认需要登录即可访问
  return authStore.isLoggedIn
}

/**
 * 设置路由守卫
 * 功能：在每次路由跳转前进行权限检查
 */
export function setupRouterGuard() {
  /**
   * 全局前置守卫
   * 在每个路由跳转之前执行
   */
  router.beforeEach(async (to, from, next) => {
    // 设置页面标题
    if (to.meta && to.meta.title) {
      document.title = `${to.meta.title} - 小易AI助手`
    }

    // 获取认证store
    const authStore = useAuthStore()
    
    // 获取当前token
    const hasToken = getToken()

    if (hasToken) {
      // 已登录用户的处理逻辑
      if (to.path === '/login') {
        // 已登录用户访问登录页，重定向到首页
        next({ path: '/' })
      } else {
        // 检查是否已获取用户信息
        if (!authStore.userInfo) {
          try {
            // 获取用户信息
            await authStore.getUserInfoAction()
            
            // 检查路由权限
            if (hasRoutePermission(to, authStore)) {
              next()
            } else {
              // 没有权限，跳转到403页面
              message.error('您没有权限访问该页面')
              next({ path: '/403' })
            }
          } catch (error) {
            console.error('获取用户信息失败:', error)
            // 获取用户信息失败，清除token并跳转到登录页
            authStore.resetAuthState()
            message.error('登录状态异常，请重新登录')
            next(`/login?redirect=${to.path}`)
          }
        } else {
          // 已有用户信息，直接检查权限
          if (hasRoutePermission(to, authStore)) {
            next()
          } else {
            message.error('您没有权限访问该页面')
            next({ path: '/403' })
          }
        }
      }
    } else {
      // 未登录用户的处理逻辑
      if (isWhiteList(to.path)) {
        // 在白名单中，直接访问
        next()
      } else {
        // 不在白名单中，跳转到登录页并记录目标路径
        next(`/login?redirect=${to.path}`)
      }
    }
  })

  /**
   * 全局后置钩子
   * 在每个路由跳转之后执行
   */
  router.afterEach((to, from) => {
    // 可以在这里执行一些后置处理
    // 比如：页面访问统计、埋点等
    console.log(`路由跳转: ${from.path} -> ${to.path}`)
  })

  /**
   * 路由错误处理
   */
  router.onError((error) => {
    console.error('路由错误:', error)
    message.error('页面跳转失败，请重试')
  })
}

/**
 * 动态添加路由权限检查
 * @param {Array} routes 路由配置数组
 * @returns {Array} 处理后的路由配置
 */
export function addRoutePermission(routes) {
  return routes.map(route => {
    // 为每个路由添加权限元信息
    if (route.meta) {
      route.meta.requiresAuth = route.meta.requiresAuth !== false
    } else {
      route.meta = { requiresAuth: true }
    }

    // 递归处理子路由
    if (route.children && route.children.length > 0) {
      route.children = addRoutePermission(route.children)
    }

    return route
  })
}

/**
 * 检查页面权限（组件内使用）
 * @param {string|Array} permission 权限标识或权限数组
 * @returns {boolean} 是否有权限
 */
export function checkPermission(permission) {
  const authStore = useAuthStore()
  
  if (typeof permission === 'string') {
    return authStore.hasPermission(permission)
  } else if (Array.isArray(permission)) {
    return authStore.hasAnyPermission(permission)
  }
  
  return false
}

/**
 * 检查角色权限（组件内使用）
 * @param {string|Array} role 角色标识或角色数组
 * @returns {boolean} 是否有角色
 */
export function checkRole(role) {
  const authStore = useAuthStore()
  
  if (typeof role === 'string') {
    return authStore.hasRole(role)
  } else if (Array.isArray(role)) {
    return authStore.hasAnyRole(role)
  }
  
  return false
} 