/**
 * 认证工具模块
 * 功能：管理用户token、用户信息的存储和获取
 * 基于localStorage进行持久化存储，适合PC端应用
 */

// 存储key的常量定义
const TOKEN_KEY = 'PC-Client-Token'              // 访问token的存储key
const REFRESH_TOKEN_KEY = 'PC-Client-Refresh-Token'  // 刷新token的存储key  
const USER_INFO_KEY = 'PC-Client-User-Info'      // 用户信息的存储key

/**
 * 获取访问token
 * @returns {string|null} token字符串或null
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置访问token
 * @param {string} token - 要存储的token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除访问token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 获取刷新token
 * @returns {string|null} refresh token字符串或null
 */
export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 设置刷新token
 * @param {string} token - 要存储的refresh token
 */
export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/**
 * 移除刷新token
 */
export function removeRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * 获取缓存的用户信息
 * @returns {Object|null} 用户信息对象或null
 */
export function getUserInfo() {
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
export function setUserInfo(userInfo) {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 移除用户信息缓存
 */
export function removeUserInfo() {
  localStorage.removeItem(USER_INFO_KEY)
}

/**
 * 清空所有认证相关信息
 * 用于用户注销时彻底清理本地存储
 */
export function clearAuth() {
  removeToken()
  removeRefreshToken()
  removeUserInfo()
} 