/**
 * HTTP请求封装模块
 * 功能：基于axios封装统一的请求方法，包含认证、错误处理、拦截器等
 * 参考管理端request.js，适配PC端需求
 */

import axios from 'axios'
import { message, Modal } from 'ant-design-vue'
import { getToken, clearAuth } from '@/utils/auth'
import { getErrorMessage } from '@/utils/errorCode'

// 重新登录控制标识，防止多次弹出登录对话框
export let isRelogin = { show: false }

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
 * 请求拦截器
 * 功能：在请求发送前进行统一处理
 * 1. 自动添加token到请求头
 * 2. 处理GET请求参数
 * 3. 防重复提交控制（后续可扩展）
 */
service.interceptors.request.use(
  config => {
    // 检查是否需要token，默认需要
    const isToken = (config.headers || {}).isToken === false
    
    // 如果有token且接口需要token，则添加到请求头
    if (getToken() && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }

    // GET请求参数处理：将params对象转为URL查询字符串
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + new URLSearchParams(config.params).toString()
      config.params = {}
      config.url = url
    }

    return config
  },
  error => {
    console.error('请求配置错误:', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 * 功能：统一处理响应结果
 * 1. 根据状态码判断请求结果
 * 2. 处理token失效情况
 * 3. 统一错误提示
 * 4. 返回处理后的数据
 */
service.interceptors.response.use(
  response => {
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

    // 调试信息：记录请求URL和是否为登录请求
    if (response.config.url && response.config.url.includes('login')) {
      console.log('检测到登录相关请求 - URL:', response.config.url, '是否为登录请求:', isLoginRequest)
    }

    // 处理各种状态码
    if (code === 401) {
      // 对于登录接口的401错误，直接返回让业务层处理
      if (isLoginRequest) {
        console.log('登录接口401错误，返回data:', data)
        return Promise.reject(data)
      }

      // token失效，需要重新登录
      // if (!isRelogin.show) {
      //   isRelogin.show = true
      //   Modal.confirm({
      //     title: '系统提示',
      //     content: '登录状态已过期，您可以继续留在该页面，或者重新登录',
      //     okText: '重新登录',
      //     cancelText: '取消',
      //     onOk: () => {
      //       isRelogin.show = false
      //       // 导入authStore需要在回调中动态导入，避免循环依赖
      //       import('@/stores/auth').then(({ useAuthStore }) => {
      //         const authStore = useAuthStore()
      //         authStore.logout().then(() => {
      //           window.location.reload()
      //         })
      //       })
      //     },
      //     onCancel: () => {
      //       isRelogin.show = false
      //     }
      //   })
      // }
      // return Promise.reject(new Error('无效的会话，或者会话已过期，请重新登录'))
    } else if (code === 500) {
      // 对于登录接口的500错误，让业务层处理
      if (isLoginRequest) {
        console.log('登录接口500错误，返回data:', data)
        return Promise.reject(data)
      }
      if(msg.includes('接口配置不存在: conversations')){
          message.error('该服务暂未开放，敬请期待~')
          return
      }
      if(msg.includes('接口配置不存在: messages')){
          return
      }
      // 服务器错误
      message.error(msg)
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      // 对于登录接口的业务错误，让业务层处理
      if (isLoginRequest) {
        console.log('登录接口601错误，返回data:', data)
        return Promise.reject(data)
      }
      // 业务逻辑错误，使用警告提示
      message.warning(msg)
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      // 对于登录接口的其他错误，让业务层处理
      if (isLoginRequest) {
        console.log('登录接口其他错误，code:', code, 'data:', data)
        return Promise.reject(data)
      }
      // 其他错误
      message.error(msg)
      return Promise.reject(new Error('请求失败'))
    } else {
      // 请求成功，返回数据
      return Promise.resolve(data)
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