/**
 * 认证相关API模块
 * 功能：封装所有与用户认证相关的接口调用
 * 参考管理端login.js，适配PC端需求
 */

import request from '@/utils/request'

/**
 * 用户登录（企业级认证版本，对齐client项目）
 * @param {Object} data 登录数据
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @param {string} data.code 验证码
 * @param {string} data.uuid 验证码UUID
 * @param {string} data.tenantId 租户ID（可选，优先使用传入值）
 * @returns {Promise} 登录结果，包含token信息
 */
export function login(data) {
  // 企业级登录参数，对齐client项目标准格式
  const loginData = {
    username: data.username,
    password: data.password,
    // 授权类型，固定为密码模式
    grantType: 'password',
    // 租户ID：优先使用传入值，否则使用环境变量默认值
    tenantId: data.tenantId || import.meta.env.VITE_DEFAULT_TENANT_ID || '000000',
    // 客户端ID：从环境变量获取，与主项目保持一致
    clientId: import.meta.env.VITE_GLOB_APP_CLIENT_ID,
    // 可选参数：只在有值时添加
    ...(data.code && { code: data.code }),
    ...(data.uuid && { uuid: data.uuid })
  }
  
  console.log('PC Client 登录参数:', loginData)
  
  return request({
    url: '/auth/login',               // 与client项目路径一致
    headers: {
      isToken: false,                 // 登录接口不需要token
      repeatSubmit: false            // 允许重复提交（用户可能多次点击）
    },
    method: 'post',
    data: loginData,
    encrypt: true
  })
}

/**
 * 用户注册
 * @param {Object} data 注册数据
 * @param {string} data.username 用户名
 * @param {string} data.password 密码
 * @param {string} data.confirmPassword 确认密码
 * @param {string} data.code 验证码
 * @param {string} data.uuid 验证码UUID
 * @returns {Promise} 注册结果
 */
export function register(data) {
  return request({
    url: '/auth/register',
    headers: {
      isToken: false  // 注册接口不需要token
    },
    method: 'post',
    data: data
  })
}

/**
 * 获取用户信息
 * @returns {Promise} 用户信息，包含用户详情、角色、权限等
 */
export function getUserInfo() {
  return request({
    url: '/system/user/getInfo',      // 修正：与后端实际接口路径一致 /system/user/getInfo
    method: 'get'
  })
}

/**
 * 获取用户信息（向后兼容的别名）
 * @returns {Promise} 用户信息，包含用户详情、角色、权限等
 */
export function getInfo() {
  return getUserInfo()
}

/**
 * 用户注销
 * @returns {Promise} 注销结果
 */
export function logout() {
  return request({
    url: '/auth/logout',              // 修正：与主项目AuthController路径一致
    method: 'post'
  })
}

/**
 * 获取验证码
 * @returns {Promise} 验证码信息，包含图片和UUID
 */
export function getCaptcha() {
  return request({
    url: '/auth/code',                // 修正：与后端实际接口路径一致 /auth/code
    headers: {
      isToken: false                  // 获取验证码不需要token
    },
    method: 'get',
    timeout: 20000                    // 验证码生成可能需要较长时间
  })
}

/**
 * 刷新Token
 * @param {string} refreshToken 刷新token
 * @returns {Promise} 新的token信息
 */
export function refreshToken(refreshToken) {
  return request({
    url: '/auth/refresh',             // 修正：与主项目路径规范保持一致
    method: 'post',
    data: { refreshToken }
  })
}

/**
 * 修改密码（旧版本接口，已废弃）
 * @param {Object} data 密码修改数据
 * @param {string} data.oldPassword 旧密码
 * @param {string} data.newPassword 新密码
 * @param {string} data.confirmPassword 确认新密码
 * @returns {Promise} 修改结果
 */
export function updatePasswordOld(data) {
  return request({
    url: '/auth/updatePassword',
    method: 'put',
    data: data
  })
}

/**
 * 重置密码
 * @param {Object} data 重置密码数据
 * @param {string} data.username 用户名
 * @param {string} data.email 邮箱地址
 * @param {string} data.code 验证码
 * @returns {Promise} 重置结果
 */
export function resetPassword(data) {
  return request({
    url: '/auth/resetPassword',
    headers: {
      isToken: false  // 重置密码不需要token
    },
    method: 'post',
    data: data
  })
}

/**
 * 发送邮箱验证码
 * @param {string} email 邮箱地址
 * @returns {Promise} 发送结果
 */
export function sendEmailCode(email) {
  return request({
    url: '/auth/sendEmailCode',
    headers: {
      isToken: false  // 发送验证码不需要token
    },
    method: 'post',
    data: {
      email: email
    }
  })
}

/**
 * 验证Token有效性
 * @returns {Promise} 验证结果
 */
export function validateToken() {
  return request({
    url: '/auth/validateToken',
    method: 'post'
  })
}

// ========== 个人中心相关API ==========

/**
 * 获取个人资料
 * @returns {Promise} 个人资料详情
 */
export function getProfile() {
  return request({
    url: '/system/user/profile',
    method: 'get'
  })
}

/**
 * 修改个人资料
 * @param {Object} data 个人资料数据
 * @param {string} data.nickName 用户昵称
 * @param {string} data.email 邮箱
 * @param {string} data.phonenumber 手机号
 * @param {string} data.sex 性别 (0=男 1=女 2=未知)
 * @returns {Promise} 修改结果
 */
export function updateProfile(data) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data: data
  })
}

/**
 * 修改密码
 * @param {Object} data 密码修改数据
 * @param {string} data.oldPassword 旧密码
 * @param {string} data.newPassword 新密码
 * @returns {Promise} 修改结果
 */
export function updatePassword(data) {
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    data: data
  })
}

/**
 * 上传头像
 * @param {FormData} formData 包含头像文件的表单数据
 * @returns {Promise} 上传结果，包含头像URL
 */
export function uploadAvatar(formData) {
  return request({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ========== 企业级多租户相关API ==========

/**
 * 获取租户列表（用于登录页面租户选择）
 * @returns {Promise} 租户列表，包含租户信息
 */
export function getTenantList() {
  return request({
    url: '/auth/tenant/list',
    headers: {
      isToken: false  // 获取租户列表不需要token
    },
    method: 'get'
  })
}

/**
 * 获取租户信息（根据域名自动识别）
 * @returns {Promise} 当前域名对应的租户信息
 */
export function getTenantInfo() {
  return request({
    url: '/auth/tenant/info',
    headers: {
      isToken: false  // 获取租户信息不需要token
    },
    method: 'get',
    params: {
      domain: window.location.host
    }
  })
} 