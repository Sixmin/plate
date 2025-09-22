/**
 * HTTP请求封装模块
 * 功能：基于axios封装统一的请求方法，包含认证、错误处理、拦截器等
 * 参考管理端request.js，适配PC端需求
 */

import axios from 'axios'
import { message, Modal } from 'ant-design-vue'
import { getToken, clearAuth, useAuthStoreOutside } from '@/stores/auth'
import { getErrorMessage } from '@/utils/errorCode'
import { generateAesKey, encryptBase64, encryptWithAes, decryptBase64, decryptWithAes } from '@/utils/encryption/crypto'
import { encrypt as encryptRsa, decrypt as decryptRsa } from '@/utils/encryption/jsencrypt'

// 重新登录控制标识，防止多次弹出登录对话框
export let isRelogin = { show: false }

/**
 * 重置登录状态标识
 * 用于在特定情况下手动重置，避免无限循环
 */
export function resetLoginStatus() {
  isRelogin.show = false
}

// 设置axios默认配置
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

// 创建axios实例
const service = axios.create({
  // 基础URL，从环境变量获取，生产环境和开发环境可以不同
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  // 请求超时时间10秒
  timeout: 10000
})

/**
 * 请求拦截器（企业级版本，对齐client项目）
 * 功能：在请求发送前进行统一处理
 * 1. 自动添加token到请求头
 * 2. 添加客户端ID到请求头
 * 3. 处理GET请求参数
 * 4. 添加语言信息到请求头
 * 5. 请求加密处理
 */
service.interceptors.request.use(
  config => {
    // 检查是否需要token，默认需要
    const isToken = (config.headers || {}).isToken === false
    
    // 如果有token且接口需要token，则添加到请求头
    if (getToken() && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }

    // 添加客户端ID到请求头（对齐client项目）
    const clientId = import.meta.env.VITE_GLOB_APP_CLIENT_ID
    if (clientId) {
      config.headers['ClientID'] = clientId
    }

    // 添加语言信息到请求头（对齐client项目）
    config.headers['Accept-Language'] = 'zh_CN'
    config.headers['Content-Language'] = 'zh_CN'

    // 加密处理逻辑（对齐主客户端实现）
    const enableEncrypt = import.meta.env.VITE_GLOB_ENABLE_ENCRYPT === 'true'
    const { encrypt } = config
    
    // 验证码等接口白名单（不需要加密）
    const encryptWhitelist = ['/auth/code', '/captchaImage', '/auth/tenant/list']
    const isWhitelisted = encryptWhitelist.some(path => config.url?.includes(path))
    
    // 全局开启请求加密功能 && 该请求开启 && 是post/put请求 && 不在白名单中
    if (
      enableEncrypt &&
      encrypt &&
      ['POST', 'PUT'].includes(config.method?.toUpperCase() || '') &&
      !isWhitelisted
    ) {
      try {
        const aesKey = generateAesKey()
        const encryptedAesKey = encryptRsa(encryptBase64(aesKey))
        
        if (encryptedAesKey) {
          config.headers['encrypt-key'] = encryptedAesKey
          
          // 加密请求数据
          const dataToEncrypt = typeof config.data === 'object' 
            ? JSON.stringify(config.data) 
            : config.data
          
          config.data = encryptWithAes(dataToEncrypt, aesKey)
          
          console.log('PC Client 请求已加密', {
            url: config.url,
            hasEncryptKey: !!config.headers['encrypt-key']
          })
        } else {
          console.error('RSA加密失败，使用原始数据')
        }
      } catch (error) {
        console.error('请求加密处理失败:', error)
      }
    }

    // GET请求参数处理：将params对象转为URL查询字符串
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + new URLSearchParams(config.params).toString()
      config.params = {}
      config.url = url
    }

    console.log('PC Client 请求配置:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      dataLength: config.data ? config.data.length : 0,
      isEncrypted: !!config.headers['encrypt-key']
    })

    return config
  },
  error => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 功能：统一处理响应结果，适配主项目R<T>格式
 * 1. 响应解密处理
 * 2. 标准化响应格式处理
 * 3. 统一错误码映射和处理
 * 4. Token失效自动处理
 * 5. 登录接口特殊处理
 */
service.interceptors.response.use(
  response => {
    // 响应解密处理（对齐主客户端实现）
    const encryptKey = (response.headers ?? {})['encrypt-key']
    if (encryptKey) {
      try {
        // RSA私钥解密 拿到解密秘钥的base64
        const base64Str = decryptRsa(encryptKey)
        if (base64Str) {
          // base64 解码 得到请求头的 AES 秘钥
          const aesSecret = decryptBase64(base64Str.toString())
          // 使用aesKey解密 responseData
          const decryptData = decryptWithAes(response.data, aesSecret)
          // 赋值 需要转为对象
          response.data = JSON.parse(decryptData)
          
          console.log('PC Client 响应已解密')
        } else {
          console.error('RSA解密失败')
        }
      } catch (error) {
        console.error('响应解密处理失败:', error)
      }
    }

    // 获取响应数据
    const { data } = response
    const code = data.code || 200
    const msg = data.msg || getErrorMessage(code) || getErrorMessage('default')

    // 处理文件下载等二进制数据，直接返回
    if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
      return data
    }

    // 检查是否为登录接口，登录相关错误由业务层处理
    const isLoginRequest = response.config.url && (
      response.config.url.includes('/login') ||
      response.config.url.includes('/auth/login') ||
      response.config.url.endsWith('/login')
    )

    // 简化响应处理，对齐playground版本
    if (code === 200) {
      // 成功响应，根据data存在情况决定返回格式
      return Promise.resolve(data.data || data)
    } else if (code === 401) {
      // 对于登录接口的401错误，直接返回让业务层处理
      if (isLoginRequest) {
        return Promise.reject(data)
      }
      
      // Token失效，清理状态，让路由守卫处理跳转
      if (!isRelogin.show) {
        isRelogin.show = true
        const authStore = useAuthStoreOutside()
        authStore.resetAuthState()
        // 不在这里显示错误消息，让路由守卫统一处理
        // 重置标记，允许后续请求正常处理
        setTimeout(() => {
          isRelogin.show = false
        }, 1000)
      }
      return Promise.reject(new Error(msg || '登录状态已过期'))
    } else if (code === 500) {
      // 对于登录接口的500错误，让业务层处理
      if (isLoginRequest) {
        return Promise.reject(data)
      }
      
      // 简化服务器错误处理
      const errorMsg = msg || '服务器繁忙，请稍后重试'
      if (!isLoginRequest) {
        message.error(errorMsg)
      }
      return Promise.reject(new Error(errorMsg))
    } else {
      // 对于登录接口的其他错误，让业务层处理
      if (isLoginRequest) {
        return Promise.reject(data)
      }
      
      // 其他错误统一处理
      const errorMsg = msg || '请求处理失败'
      message.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }
  },
  error => {
    console.error('请求响应错误:', error)
    
    // 检查是否为登录接口的网络错误，让业务层处理
    const isLoginRequest = error.config && error.config.url && (
      error.config.url.includes('/login') || 
      error.config.url.includes('/auth/login') ||
      error.config.url.endsWith('/login')
    )
    
    // 调试信息：记录网络错误的请求URL
    if (error.config && error.config.url && error.config.url.includes('login')) {
      console.log('登录请求网络错误 - URL:', error.config.url, '是否为登录请求:', isLoginRequest)
    }
    
    if (isLoginRequest) {
      console.log('登录接口网络错误，直接抛出error:', error)
      // 登录接口的网络错误直接抛出，让业务层处理
      return Promise.reject(error)
    }
    
    let { message: msg } = error
    
    // 根据错误类型提供友好的错误信息
    if (msg === "Network Error") {
      msg = "后端接口连接异常"
    } else if (msg.includes("timeout")) {
      msg = "系统接口请求超时"
    } else if (msg.includes("Request failed with status code")) {
      msg = "系统接口" + msg.substr(msg.length - 3) + "异常"
    }
    
    message.error(msg)
    return Promise.reject(error)
  }
)

/**
 * 导出封装好的axios实例
 * 使用方式：
 * import request from '@/utils/request'
 * request.get('/api/user')
 * request.post('/api/login', data)
 */
export default service 