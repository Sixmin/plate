/**
 * 认证状态管理模块
 * 功能：基于Pinia管理用户认证状态，包括登录、注销、权限检查等
 * 参考管理端user.js，适配PC端需求
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

// 导入认证相关工具函数
import { 
  getToken, 
  setToken, 
  removeToken,
  getUserInfo, 
  setUserInfo, 
  removeUserInfo,
  clearAuth 
} from '@/utils/auth'

// 导入认证相关API
import { 
  login, 
  logout, 
  getInfo,
  refreshToken 
} from '@/api/auth'

// 导入错误处理工具
import { getLoginErrorMessage } from '@/utils/errorCode'

/**
 * 认证状态管理Store
 * 功能：管理用户登录状态、用户信息、权限等
 */
export const useAuthStore = defineStore('auth', () => {
  // ========== 状态定义 ==========
  
  /**
   * 用户访问token
   * @type {string|null}
   */
  const token = ref(getToken())
  
  /**
   * 用户基本信息
   * @type {Object|null}
   */
  const userInfo = ref(getUserInfo())
  
  /**
   * 用户角色列表
   * @type {Array}
   */
  const roles = ref([])
  
  /**
   * 用户权限列表
   * @type {Array}
   */
  const permissions = ref([])

  // ========== 计算属性 ==========
  
  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  const isLoggedIn = computed(() => {
    return !!token.value && !!userInfo.value
  })

  /**
   * 获取用户头像
   * @returns {string} 头像URL
   */
  const avatar = computed(() => {
    const avatarPath = userInfo.value?.avatar
    if (!avatarPath) {
      return '/default-avatar.png'
    }
    
    // 如果已经是完整的URL（http/https开头），直接返回
    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
      return avatarPath
    }
    
    // 如果是相对路径，需要拼接API前缀
    // 后端返回的头像路径通常是 /profile/avatar/xxx.jpg 格式
    if (avatarPath.startsWith('/profile/')) {
      return `/api${avatarPath}`
    }
    
    // 如果路径不是以/开头，则添加/api/前缀
    if (!avatarPath.startsWith('/')) {
      return `/api/${avatarPath}`
    }
    
    // 其他情况，添加/api前缀
    return `/api${avatarPath}`
  })

  /**
   * 获取用户昵称
   * @returns {string} 用户昵称
   */
  const userName = computed(() => {
    return userInfo.value?.userName || userInfo.value?.nickName || '游客'
  })

  // ========== 方法定义 ==========

  /**
   * 用户登录
   * @param {Object} loginForm 登录表单数据
   * @param {string} loginForm.username 用户名
   * @param {string} loginForm.password 密码
   * @param {string} loginForm.code 验证码
   * @param {string} loginForm.uuid 验证码UUID
   * @returns {Promise} 登录结果
   */
  async function loginAction(loginForm) {
    try {
      const response = await login(loginForm)
      
      // 后端返回的token信息，根据实际后端响应格式调整
      const tokenValue = response.token || response.data?.token
      
      if (tokenValue) {
        // 保存token到状态和本地存储
        token.value = tokenValue
        setToken(tokenValue)
        
        // message.success('登录成功')
        return Promise.resolve()
      } else {
        // 登录接口调用成功但没有返回token，通常是业务逻辑错误
        const errorMsg = response.msg || '用户名或密码错误'
        const friendlyMsg = getLoginErrorMessage(errorMsg)
        message.error(friendlyMsg)
        return Promise.reject(new Error(errorMsg))
      }
    } catch (error) {
      console.error('登录失败完整错误对象:', error)
      console.error('error.response:', error.response)
      console.error('error.message:', error.message)
      console.error('error.msg:', error.msg)
      console.error('error.code:', error.code)
      console.error('error对象的所有属性:', Object.keys(error))
      
      // 默认错误信息
      let errorMessage = '用户名或密码错误'
      
      // 处理不同类型的错误对象
      if (error.response) {
        // HTTP错误响应（axios标准格式）
        console.error('HTTP错误响应 - status:', error.response.status, 'data:', error.response.data)
        const { status, data } = error.response
        if (data && data.msg) {
          errorMessage = getLoginErrorMessage(data.msg)
        } else if (status === 401) {
          errorMessage = '用户名或密码错误'
        } else if (status === 500) {
          errorMessage = '服务器繁忙，请稍后重试'
        } else {
          errorMessage = '用户名或密码错误'
        }
      } else if (error.msg) {
        // 后端返回的业务错误（直接的错误对象）
        console.error('业务错误 - msg:', error.msg)
        errorMessage = getLoginErrorMessage(error.msg)
      } else if (error.code) {
        // 根据错误码判断
        console.error('错误码 - code:', error.code)
        if (error.code === 401 || error.code === '401') {
          errorMessage = '用户名或密码错误'
        } else if (error.code === 500 || error.code === '500') {
          errorMessage = '服务器繁忙，请稍后重试'
        }
      } else if (error.message) {
        // 其他类型的错误（网络错误、超时等）
        console.error('其他错误 - message:', error.message)
        if (error.message.toLowerCase().includes('network')) {
          errorMessage = '网络连接失败，请检查网络后重试'
        } else if (error.message.toLowerCase().includes('timeout')) {
          errorMessage = '请求超时，请重试'
        } else {
          // 对于其他未知错误，也统一显示用户名或密码错误
          errorMessage = '用户名或密码错误'
        }
      }
      
      // 显示友好的错误提示
      message.error(errorMessage)
      
      return Promise.reject(error)
    }
  }

  /**
   * 获取用户信息
   * @returns {Promise} 用户信息
   */
  async function getUserInfoAction() {
    try {
      const response = await getInfo()
      
      if (response && response.user) {
        // 保存用户信息
        userInfo.value = response.user
        setUserInfo(response.user)
        
        // 保存角色和权限
        roles.value = response.roles || []
        permissions.value = response.permissions || []
        
        return Promise.resolve(response)
      } else {
        return Promise.reject(new Error('获取用户信息失败'))
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return Promise.reject(error)
    }
  }

  /**
   * 用户注销
   * @returns {Promise} 注销结果
   */
  async function logoutAction() {
    try {
      // 调用后端注销接口
      await logout()
    } catch (error) {
      console.error('注销接口调用失败:', error)
      // 即使后端接口失败，也要清理本地状态
    } finally {
      // 清理所有认证状态
      resetAuthState()
      message.success('已退出登录')
    }
  }

  /**
   * 重置认证状态
   * 功能：清除所有认证相关的状态和本地存储
   */
  function resetAuthState() {
    // 清理状态
    token.value = null
    userInfo.value = null
    roles.value = []
    permissions.value = []
    
    // 清理本地存储
    clearAuth()
  }

  /**
   * 检查用户是否有指定权限
   * @param {string} permission 权限标识
   * @returns {boolean} 是否有权限
   */
  function hasPermission(permission) {
    return permissions.value.includes(permission)
  }

  /**
   * 检查用户是否有任一权限
   * @param {Array} permissionList 权限列表
   * @returns {boolean} 是否有任一权限
   */
  function hasAnyPermission(permissionList) {
    return permissionList.some(permission => hasPermission(permission))
  }

  /**
   * 检查用户是否有所有权限
   * @param {Array} permissionList 权限列表
   * @returns {boolean} 是否有所有权限
   */
  function hasAllPermissions(permissionList) {
    return permissionList.every(permission => hasPermission(permission))
  }

  /**
   * 检查用户是否有指定角色
   * @param {string} role 角色标识
   * @returns {boolean} 是否有角色
   */
  function hasRole(role) {
    return roles.value.includes(role)
  }

  /**
   * 检查用户是否有任一角色
   * @param {Array} roleList 角色列表
   * @returns {boolean} 是否有任一角色
   */
  function hasAnyRole(roleList) {
    return roleList.some(role => hasRole(role))
  }

  /**
   * 检查用户是否是管理员
   * @returns {boolean} 是否是管理员
   */
  function isAdmin() {
    return hasRole('admin') || hasRole('ROLE_ADMIN')
  }

  /**
   * 从本地存储恢复登录状态
   * 功能：页面刷新时从localStorage恢复状态
   */
  function restoreAuthState() {
    const cachedToken = getToken()
    const cachedUserInfo = getUserInfo()
    
    if (cachedToken && cachedUserInfo) {
      token.value = cachedToken
      userInfo.value = cachedUserInfo
      
      // 恢复后可以尝试获取最新的用户信息
      getUserInfoAction().catch(() => {
        // 如果获取失败，可能token已过期，清理状态
        resetAuthState()
      })
    }
  }

  /**
   * 刷新用户信息
   * 功能：手动刷新当前用户的最新信息
   * @returns {Promise} 刷新结果
   */
  async function refreshUserInfo() {
    try {
      const response = await getUserInfoAction()
      return Promise.resolve(response)
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      return Promise.reject(error)
    }
  }

  // ========== 返回状态和方法 ==========
  return {
    // 状态
    token,
    userInfo,
    roles,
    permissions,
    
    // 计算属性
    isLoggedIn,
    avatar,
    userName,
    
    // 方法
    loginAction,
    getUserInfoAction,
    logoutAction,
    resetAuthState,
    restoreAuthState,
    refreshUserInfo,
    
    // 权限检查方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isAdmin
  }
})

/**
 * 在setup外部使用的工具函数
 * 功能：在非Vue组件中也能使用store
 */
export function useAuthStoreOutside() {
  return useAuthStore()
} 