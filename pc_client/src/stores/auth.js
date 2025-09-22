/**
 * 认证状态管理模块
 * 功能：基于Pinia管理用户认证状态，包括登录、注销、权限检查等
 * 集成localStorage操作，统一认证管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

// 导入认证相关API
import { 
  login, 
  logout, 
  getUserInfo as getUserInfoAPI,
  refreshToken 
} from '@/api/auth'

// 导入错误处理工具
import { getLoginErrorMessage } from '@/utils/errorCode'

// ========== localStorage 操作常量和函数 ==========
// 存储key的常量定义
const TOKEN_KEY = 'PC-Client-Token'              // 访问token的存储key
const REFRESH_TOKEN_KEY = 'PC-Client-Refresh-Token'  // 刷新token的存储key  
const USER_INFO_KEY = 'PC-Client-User-Info'      // 用户信息的存储key

/**
 * 获取访问token
 * @returns {string|null} token字符串或null
 */
function getTokenFromStorage() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置访问token
 * @param {string} token - 要存储的token
 */
function setTokenToStorage(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除访问token
 */
function removeTokenFromStorage() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取刷新token
 * @returns {string|null} refresh token字符串或null
 */
function getRefreshTokenFromStorage() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 设置刷新token
 * @param {string} token - 要存储的refresh token
 */
function setRefreshTokenToStorage(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/**
 * 移除刷新token
 */
function removeRefreshTokenFromStorage() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * 获取缓存的用户信息
 * @returns {Object|null} 用户信息对象或null
 */
function getUserInfoFromStorage() {
  const info = localStorage.getItem(USER_INFO_KEY)
  try {
    return info ? JSON.parse(info) : null
  } catch (error) {
    console.error('解析用户信息失败:', error)
    return null
  }
}

/**
 * 设置用户信息到缓存
 * @param {Object} userInfo - 用户信息对象
 */
function setUserInfoToStorage(userInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 移除用户信息缓存
 */
function removeUserInfoFromStorage() {
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 清空所有认证相关信息
 * 用于用户注销时彻底清理本地存储
 */
function clearAuthFromStorage() {
  removeTokenFromStorage()
  removeRefreshTokenFromStorage()
  removeUserInfoFromStorage()
}

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
  const token = ref(getTokenFromStorage())
  
  /**
   * 用户基本信息
   * @type {Object|null}
   */
  const userInfo = ref(getUserInfoFromStorage())
  
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
   * 用户登录（企业级认证版本，对齐client项目）
   * @param {Object} loginForm 登录表单数据
   * @param {string} loginForm.username 用户名
   * @param {string} loginForm.password 密码
   * @param {string} loginForm.code 验证码
   * @param {string} loginForm.uuid 验证码UUID
   * @param {string} loginForm.tenantId 租户ID（可选）
   * @returns {Promise} 登录结果
   */
  async function loginAction(loginForm) {
    try {
      const response = await login(loginForm)
      
      // 企业级Token获取逻辑，对齐client项目格式
      // client项目使用 access_token，pc_client之前使用 accessToken
      const accessToken = response.access_token || response.accessToken
      const refreshToken = response.refresh_token || response.refreshToken
      const clientId = response.client_id || response.clientId
      const expireIn = response.expire_in || response.expireIn
      
      console.log('PC Client 登录响应:', response)
      console.log('提取的token信息:', { accessToken, refreshToken, clientId, expireIn })
      
      if (accessToken) {
        // 保存token到状态和本地存储
        token.value = accessToken
        setTokenToStorage(accessToken)
        
        // 保存refreshToken（如果有）
        if (refreshToken) {
          setRefreshTokenToStorage(refreshToken)
        }
        
        // 登录成功后获取用户信息（参考client项目版本）
        try {
          await getUserInfoAction()
          console.log('用户信息获取成功')
        } catch (userInfoError) {
          console.warn('获取用户信息失败，但登录成功:', userInfoError)
          // 用户信息获取失败不影响登录流程，但要记录错误
        }
        
        message.success('登录成功')
        return Promise.resolve(response)
      } else {
        // 登录接口调用成功但没有返回token，通常是业务逻辑错误
        const errorMsg = response.msg || response.message || '用户名或密码错误'
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
   * 获取用户信息（企业级认证版本，对齐client项目）
   * @returns {Promise} 用户信息
   */
  async function getUserInfoAction() {
    try {
      const response = await getUserInfoAPI()
      
      console.log('PC Client 用户信息响应:', response)
      
      // 企业级用户信息处理，对齐client项目格式
      if (response) {
        let userData = null
        let userRoles = []
        let userPermissions = []
        
        // 适配不同的响应格式
        if (response.user) {
          // 格式1: { user: {...}, roles: [...], permissions: [...] }
          userData = response.user
          userRoles = response.roles || []
          userPermissions = response.permissions || []
        } else if (response.data && response.data.user) {
          // 格式2: { data: { user: {...}, roles: [...], permissions: [...] } }
          userData = response.data.user
          userRoles = response.data.roles || []
          userPermissions = response.data.permissions || []
        } else if (response.userName || response.nickName) {
          // 格式3: 直接的用户对象
          userData = response
          userRoles = response.roles || []
          userPermissions = response.permissions || []
        } else {
          // 格式4: 其他格式，尝试直接使用
          userData = response
          userRoles = []
          userPermissions = []
        }
        
        if (userData) {
          // 保存用户信息
          userInfo.value = userData
          setUserInfoToStorage(userData)
          
          // 保存角色和权限
          roles.value = userRoles
          permissions.value = userPermissions
          
          console.log('保存的用户信息:', {
            user: userData,
            roles: userRoles,
            permissions: userPermissions
          })
          
          return Promise.resolve(response)
        }
      }
      
      return Promise.reject(new Error('获取用户信息失败：响应格式不正确'))
    } catch (error) {
      console.error('获取用户信息失败:', error)
      
      // 如果是401错误，可能是token过期
      if (error.response && error.response.status === 401) {
        console.warn('用户信息获取失败：可能是token过期')
        resetAuthState()
      }
      
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
    clearAuthFromStorage()
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
    const cachedToken = getTokenFromStorage()
    const cachedUserInfo = getUserInfoFromStorage()
    
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

// ========== 兼容性导出函数 ==========
// 提供与原utils/auth.js相同的API，保持向后兼容

/**
 * 获取访问token (兼容性函数)
 * @returns {string|null} token字符串或null
 */
export function getToken() {
  return getTokenFromStorage()
}

/**
 * 设置访问token (兼容性函数)
 * @param {string} token - 要存储的token
 */
export function setToken(token) {
  setTokenToStorage(token)
}

/**
 * 移除访问token (兼容性函数)
 */
export function removeToken() {
  removeTokenFromStorage()
}

/**
 * 获取刷新token (兼容性函数)
 * @returns {string|null} refresh token字符串或null
 */
export function getRefreshToken() {
  return getRefreshTokenFromStorage()
}

/**
 * 设置刷新token (兼容性函数)
 * @param {string} token - 要存储的refresh token
 */
export function setRefreshToken(token) {
  setRefreshTokenToStorage(token)
}

/**
 * 移除刷新token (兼容性函数)
 */
export function removeRefreshToken() {
  removeRefreshTokenFromStorage()
}

/**
 * 获取缓存的用户信息 (兼容性函数)
 * @returns {Object|null} 用户信息对象或null
 */
export function getUserInfo() {
  return getUserInfoFromStorage()
}

/**
 * 设置用户信息到缓存 (兼容性函数)
 * @param {Object} userInfo - 用户信息对象
 */
export function setUserInfo(userInfo) {
  setUserInfoToStorage(userInfo)
}

/**
 * 移除用户信息缓存 (兼容性函数)
 */
export function removeUserInfo() {
  removeUserInfoFromStorage()
}

/**
 * 清空所有认证相关信息 (兼容性函数)
 * 用于用户注销时彻底清理本地存储
 */
export function clearAuth() {
  clearAuthFromStorage()
} 