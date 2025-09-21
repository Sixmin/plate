/**
 * 错误码映射模块
 * 功能：将后端返回的错误码映射为用户友好的错误信息
 * 参考管理端的errorCode.js，保持一致性
 */

export const ERROR_CODES = {
  200: '操作成功',
  401: '认证失败，无法访问系统资源',
  403: '当前操作没有权限',
  404: '访问资源不存在',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  601: '业务逻辑错误',
  // 登录相关错误码
  'LOGIN_ERROR': '用户名或密码错误',
  'USER_NOT_FOUND': '用户不存在或密码错误',
  'PASSWORD_ERROR': '密码错误',
  'USER_DISABLED': '用户已被禁用，请联系管理员',
  'USER_LOCKED': '用户已被锁定，请联系管理员',
  'CAPTCHA_ERROR': '验证码错误',
  'LOGIN_TIMEOUT': '登录超时，请重试',
  default: '系统未知错误，请反馈给管理员'
}

/**
 * 根据错误码获取错误信息
 * @param {number|string} code - 错误码
 * @returns {string} 错误信息
 */
export function getErrorMessage(code) {
  return ERROR_CODES[code] || ERROR_CODES.default
}

/**
 * 根据错误信息内容判断登录相关错误并返回友好提示
 * @param {string} message - 错误信息
 * @returns {string} 友好的错误提示
 */
export function getLoginErrorMessage(message) {
  if (!message) return ERROR_CODES.default
  
  const msg = message.toLowerCase()
  
  // 根据错误信息关键词判断具体错误类型
  if (msg.includes('用户名') || msg.includes('username')) {
    return '用户名或密码错误'
  }
  if (msg.includes('密码') || msg.includes('password')) {
    return '用户名或密码错误'  
  }
  if (msg.includes('验证码') || msg.includes('captcha') || msg.includes('code')) {
    return '验证码错误，请重新输入'
  }
  if (msg.includes('禁用') || msg.includes('disabled')) {
    return '账户已被禁用，请联系管理员'
  }
  if (msg.includes('锁定') || msg.includes('locked')) {
    return '账户已被锁定，请联系管理员'
  }
  if (msg.includes('超时') || msg.includes('timeout')) {
    return '登录超时，请重试'
  }
  if (msg.includes('网络') || msg.includes('network')) {
    return '网络连接失败，请检查网络后重试'
  }
  
  // 对于包含登录、认证等关键词的通用错误，返回友好提示
  if (msg.includes('登录') || msg.includes('login') || 
      msg.includes('认证') || msg.includes('auth') ||
      msg.includes('凭证') || msg.includes('credential')) {
    return '用户名或密码错误'
  }
  
  // 对于500等服务器错误，返回友好提示
  if (msg.includes('500') || msg.includes('服务器') || msg.includes('server')) {
    return '服务器繁忙，请稍后重试'
  }
  
  // 其他情况返回原错误信息或默认提示
  return message || ERROR_CODES.default
} 