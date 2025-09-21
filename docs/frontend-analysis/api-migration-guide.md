# PC Client API 迁移详细指南

## 概述

本指南详细说明如何将 PC Client 的 API 接口从外部服务迁移到主项目后端，实现完整的前后端一体化。

## 一、基础配置迁移

### 1.1 Vite 代理配置修改

**文件**: `pc_client/vite.config.js`

#### 当前配置 (需要修改)
```javascript
// 🚨 问题配置
server: {
  port: 3000,
  host: true,
  open: true,
  proxy: {
    '/api': {
      target: 'http://8.163.17.82:8080',    // 外部服务器
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
},
```

#### 目标配置 (修改后)
```javascript
// ✅ 正确配置
server: {
  port: 3000,
  host: true,
  open: true,
  proxy: {
    // 主应用API代理
    '/api': {
      target: 'http://localhost:8080',       // 本地主项目后端
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
    // 静态资源代理
    '/profile': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
},
```

### 1.2 环境变量配置

**新增文件**: `pc_client/.env.development`
```bash
# 开发环境配置
VITE_API_BASE_URL=/api
VITE_APP_BASE_API=/api
VITE_SERVER_URL=http://localhost:8080

# 应用配置
VITE_APP_TITLE=小易AI助手
VITE_APP_VERSION=1.0.0
```

**新增文件**: `pc_client/.env.production`
```bash
# 生产环境配置
VITE_API_BASE_URL=/api
VITE_APP_BASE_API=/api
VITE_SERVER_URL=https://yourdomain.com

# 应用配置
VITE_APP_TITLE=小易AI助手
VITE_APP_VERSION=1.0.0
```

## 二、请求封装重构

### 2.1 request.js 全面重构

**文件**: `pc_client/src/utils/request.js`

#### 问题1: 响应格式处理
```javascript
// 🚨 当前问题代码
service.interceptors.response.use(
  response => {
    const { data } = response
    const code = data.code || 200
    
    // 直接返回data，格式不统一
    if (code !== 200) {
      message.error(msg)
      return Promise.reject(new Error('请求失败'))
    }
    return Promise.resolve(data)
  }
)
```

#### 解决方案: 统一R<T>响应处理
```javascript
// ✅ 修改后的正确代码
service.interceptors.response.use(
  response => {
    // 处理文件下载
    if (response.request.responseType === 'blob') {
      return response
    }
    
    const { data } = response
    const { code, msg, data: responseData } = data
    
    // 统一处理主项目R<T>响应格式
    if (code === 200) {
      return Promise.resolve({
        code,
        msg: msg || '操作成功',
        data: responseData
      })
    } else if (code === 401) {
      // Token失效处理
      clearAuth()
      router.push('/login')
      return Promise.reject(new Error(msg || '登录状态已过期'))
    } else {
      message.error(msg || '操作失败')
      return Promise.reject(new Error(msg || '操作失败'))
    }
  },
  error => {
    let { message: msg } = error
    if (msg === "Network Error") {
      msg = "网络连接异常"
    } else if (msg.includes("timeout")) {
      msg = "请求超时"
    }
    message.error(msg)
    return Promise.reject(error)
  }
)
```

### 2.2 Token 处理机制升级

**文件**: `pc_client/src/utils/auth.js`

#### 当前实现 (需要修改)
```javascript
// 🚨 简单的token处理
const TokenKey = 'Admin-Token'

export function getToken() {
  return localStorage.getItem(TokenKey)
}

export function setToken(token) {
  return localStorage.setItem(TokenKey, token)
}
```

#### Sa-Token 兼容处理
```javascript
// ✅ Sa-Token兼容的token处理
const TokenKey = 'satoken'
const RefreshTokenKey = 'refresh-token'
const UserInfoKey = 'user-info'
const PermissionsKey = 'permissions'

export function getToken() {
  return localStorage.getItem(TokenKey)
}

export function setToken(token) {
  localStorage.setItem(TokenKey, token)
}

export function getRefreshToken() {
  return localStorage.getItem(RefreshTokenKey)
}

export function setRefreshToken(refreshToken) {
  localStorage.setItem(RefreshTokenKey, refreshToken)
}

export function getUserInfo() {
  const userInfo = localStorage.getItem(UserInfoKey)
  return userInfo ? JSON.parse(userInfo) : null
}

export function setUserInfo(userInfo) {
  localStorage.setItem(UserInfoKey, JSON.stringify(userInfo))
}

export function getPermissions() {
  const permissions = localStorage.getItem(PermissionsKey)
  return permissions ? JSON.parse(permissions) : []
}

export function setPermissions(permissions) {
  localStorage.setItem(PermissionsKey, JSON.stringify(permissions))
}

export function clearAuth() {
  localStorage.removeItem(TokenKey)
  localStorage.removeItem(RefreshTokenKey)
  localStorage.removeItem(UserInfoKey)
  localStorage.removeItem(PermissionsKey)
}

// Token自动刷新
export async function refreshToken() {
  const refreshTokenValue = getRefreshToken()
  if (!refreshTokenValue) {
    throw new Error('Refresh token not found')
  }
  
  try {
    const response = await request({
      url: '/auth/refresh',
      method: 'post',
      data: { refreshToken: refreshTokenValue }
    })
    
    if (response.code === 200) {
      setToken(response.data.token)
      return response.data.token
    }
  } catch (error) {
    clearAuth()
    throw error
  }
}
```

## 三、API接口逐一迁移

### 3.1 认证模块迁移

**文件**: `pc_client/src/api/auth.js`

#### 登录接口迁移
```javascript
// 🚨 当前实现
export function login(data) {
  return request({
    url: '/login',                    // 错误路径
    headers: {
      isToken: false,
      repeatSubmit: false
    },
    method: 'post',
    data: data
  })
}

// ✅ 修改后实现
export function login(data) {
  // 构造符合主项目要求的登录数据
  const loginData = {
    clientId: 'e5cd7e4891bf95d1d19206ce24a7b32e',  // 从主项目获取
    grantType: 'password',
    tenantId: data.tenantId || '000000',           // 默认租户
    username: data.username,
    password: data.password,
    code: data.code,
    uuid: data.uuid
  }
  
  return request({
    url: '/auth/login',               // 正确路径
    method: 'post',
    data: loginData,
    headers: {
      isToken: false
    }
  }).then(response => {
    // 处理登录成功后的token存储
    if (response.code === 200) {
      const { token, user, permissions } = response.data
      setToken(token)
      setUserInfo(user)
      setPermissions(permissions || [])
    }
    return response
  })
}
```

#### 获取用户信息接口
```javascript
// ✅ 与主项目兼容的实现
export function getInfo() {
  return request({
    url: '/getInfo',                  // 路径保持不变
    method: 'get'
  }).then(response => {
    if (response.code === 200) {
      // 更新本地存储的用户信息
      setUserInfo(response.data.user)
      setPermissions(response.data.permissions || [])
    }
    return response
  })
}
```

#### 注销接口迁移
```javascript
// ✅ 修改后实现
export function logout() {
  return request({
    url: '/auth/logout',              // 修正路径
    method: 'post'
  }).then(response => {
    // 清除本地存储
    clearAuth()
    return response
  })
}
```

### 3.2 系统接口适配

**文件**: `pc_client/src/api/notification.js`

#### 通知接口适配
```javascript
// ✅ 已兼容主项目的实现
export function getNotificationList(params) {
  return request({
    url: '/system/notice/list',       // 与SysNoticeController匹配
    method: 'get',
    params: {
      pageNum: params.pageNum || 1,
      pageSize: params.pageSize || 10,
      noticeTitle: params.noticeTitle,
      noticeType: params.noticeType,
      status: params.status
    }
  })
}

export function getNotificationDetail(noticeId) {
  return request({
    url: `/system/notice/${noticeId}`, // RESTful风格
    method: 'get'
  })
}

// 新增：标记通知已读
export function markNotificationRead(noticeIds) {
  const ids = Array.isArray(noticeIds) ? noticeIds.join(',') : noticeIds
  return request({
    url: `/system/notice/read/${ids}`,
    method: 'put'
  })
}
```

### 3.3 AI模块接口设计

**文件**: `pc_client/src/api/agent.js` (需要后端新增对应Controller)

#### 智能体接口设计
```javascript
// ✅ 新设计的AI智能体接口
export function listAgents(query = {}) {
  return request({
    url: '/ai/agent/list',
    method: 'get',
    params: {
      pageNum: query.pageNum || 1,
      pageSize: query.pageSize || 20,
      agentName: query.agentName,
      agentType: query.agentType,
      status: query.status || 1        // 默认查询启用状态
    }
  })
}

export function getAgentDetail(agentId) {
  return request({
    url: `/ai/agent/${agentId}`,
    method: 'get'
  })
}

export function getAgentByCode(agentCode) {
  return request({
    url: `/ai/agent/code/${agentCode}`,
    method: 'get'
  })
}

// 检查用户对智能体的权限
export function checkAgentPermission(agentId) {
  return request({
    url: `/ai/agent/permission/${agentId}`,
    method: 'get'
  })
}
```

**对应后端Controller需要新增**: 

`AiAgentController.java` (需要开发)
```java
@RestController
@RequestMapping("/ai/agent")
public class AiAgentController {
    
    @GetMapping("/list")
    public TableDataInfo<AiAgentVo> list(AiAgentBo agentBo, PageQuery pageQuery) {
        // 实现智能体列表查询
    }
    
    @GetMapping("/{agentId}")
    public R<AiAgentVo> getInfo(@PathVariable Long agentId) {
        // 实现智能体详情查询
    }
    
    @GetMapping("/code/{agentCode}")
    public R<AiAgentVo> getByCode(@PathVariable String agentCode) {
        // 根据编码查询智能体
    }
    
    @GetMapping("/permission/{agentId}")
    public R<Boolean> checkPermission(@PathVariable Long agentId) {
        // 检查用户权限
    }
}
```

### 3.4 聊天接口重构

**文件**: `pc_client/src/api/chat.js`

#### 流式聊天接口
```javascript
// ✅ 重构后的流式聊天接口
export function sendMessage(data, onMessage, onError, onComplete) {
  const isStreaming = data.params?.response_mode === 'streaming'
  
  if (isStreaming && onMessage) {
    // 使用主项目的SSE端点
    return streamRequest('/ai/chat/stream', data, {
      onMessage,
      onError,
      onComplete
    })
  } else {
    return request({
      url: '/ai/chat/send',
      method: 'post',
      data: {
        agentId: data.agentId,
        conversationId: data.conversationId,
        message: data.message,
        messageType: data.messageType || 1,
        files: data.files || []
      }
    })
  }
}

// 新增：流式请求封装
function streamRequest(url, data, options = {}) {
  const { onMessage, onError, onComplete } = options
  
  return new Promise((resolve, reject) => {
    const token = getToken()
    const fullUrl = `${import.meta.env.VITE_SERVER_URL}${url}`
    
    fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      function readStream() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            onComplete && onComplete()
            resolve({ code: 200, msg: '流式响应完成' })
            return
          }
          
          // 解析SSE数据
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6).trim()
              if (data === '[DONE]') {
                continue
              }
              
              try {
                const eventData = JSON.parse(data)
                onMessage && onMessage(eventData)
              } catch (error) {
                console.warn('解析SSE数据失败:', error)
              }
            }
          }
          
          return readStream()
        })
      }
      
      return readStream()
    })
    .catch(error => {
      onError && onError(error)
      reject(error)
    })
  })
}
```

**对应后端Controller需要新增**:

`AiChatController.java` (需要开发)
```java
@RestController
@RequestMapping("/ai/chat")
public class AiChatController {
    
    @PostMapping("/send")
    public R<AiMessageVo> sendMessage(@RequestBody AiMessageBo messageBo) {
        // 实现普通消息发送
    }
    
    @PostMapping("/stream")
    public SseEmitter sendStreamMessage(@RequestBody AiMessageBo messageBo) {
        // 实现流式消息发送
        SseEmitter emitter = new SseEmitter();
        // 集成主项目SSE框架
        return emitter;
    }
    
    @PostMapping("/upload")
    public R<FileUploadVo> uploadFile(@RequestParam("file") MultipartFile file) {
        // 文件上传处理
    }
}
```

## 四、状态管理迁移

### 4.1 认证Store重构

**文件**: `pc_client/src/stores/auth.js`

```javascript
// ✅ 完整的认证Store实现
import { defineStore } from 'pinia'
import { 
  login as loginApi, 
  logout as logoutApi, 
  getInfo as getInfoApi,
  refreshToken as refreshTokenApi
} from '@/api/auth'
import { 
  getToken, 
  setToken, 
  getUserInfo, 
  setUserInfo,
  getPermissions,
  setPermissions,
  clearAuth 
} from '@/utils/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken() || '',
    userInfo: getUserInfo() || {},
    permissions: getPermissions() || [],
    roles: [],
    isLoggedIn: false
  }),
  
  getters: {
    // 检查是否已登录
    isAuthenticated: (state) => !!state.token && !!state.userInfo.userId,
    
    // 获取用户角色
    userRoles: (state) => state.userInfo.roles || [],
    
    // 检查权限
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    },
    
    // 检查角色
    hasRole: (state) => (role) => {
      return state.userRoles.includes(role)
    }
  },
  
  actions: {
    // 登录
    async login(loginForm) {
      try {
        const response = await loginApi(loginForm)
        if (response.code === 200) {
          this.token = response.data.token
          this.userInfo = response.data.user || {}
          this.permissions = response.data.permissions || []
          this.isLoggedIn = true
          
          return { success: true, message: '登录成功' }
        } else {
          return { success: false, message: response.msg }
        }
      } catch (error) {
        return { 
          success: false, 
          message: error.message || '登录失败' 
        }
      }
    },
    
    // 获取用户信息
    async getUserInfo() {
      try {
        const response = await getInfoApi()
        if (response.code === 200) {
          this.userInfo = response.data.user || {}
          this.permissions = response.data.permissions || []
          this.roles = response.data.roles || []
          
          return { success: true }
        }
      } catch (error) {
        return { success: false, message: error.message }
      }
    },
    
    // 注销
    async logout() {
      try {
        await logoutApi()
      } catch (error) {
        console.error('注销请求失败:', error)
      } finally {
        this.resetState()
      }
    },
    
    // 刷新Token
    async refreshToken() {
      try {
        const newToken = await refreshTokenApi()
        this.token = newToken
        setToken(newToken)
        return true
      } catch (error) {
        this.resetState()
        return false
      }
    },
    
    // 从本地存储恢复状态
    restoreAuthState() {
      this.token = getToken() || ''
      this.userInfo = getUserInfo() || {}
      this.permissions = getPermissions() || []
      this.isLoggedIn = !!this.token && !!this.userInfo.userId
    },
    
    // 重置状态
    resetState() {
      this.token = ''
      this.userInfo = {}
      this.permissions = []
      this.roles = []
      this.isLoggedIn = false
      clearAuth()
    }
  }
})
```

### 4.2 路由守卫集成

**文件**: `pc_client/src/router/permission.js`

```javascript
// ✅ 与主项目兼容的路由守卫
import router from './index'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'

// 白名单路由
const whiteList = ['/login', '/register', '/404', '/401']

export function setupRouterGuard() {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    
    if (authStore.token) {
      if (to.path === '/login') {
        // 已登录跳转到首页
        next({ path: '/' })
      } else {
        // 检查是否有用户信息
        if (!authStore.userInfo.userId) {
          try {
            await authStore.getUserInfo()
            next()
          } catch (error) {
            console.error('获取用户信息失败:', error)
            authStore.resetState()
            next(`/login?redirect=${to.path}`)
          }
        } else {
          // 检查路由权限
          if (hasRoutePermission(to, authStore.permissions)) {
            next()
          } else {
            message.error('您没有访问权限')
            next({ path: '/401' })
          }
        }
      }
    } else {
      // 未登录
      if (whiteList.includes(to.path)) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
      }
    }
  })
}

// 检查路由权限
function hasRoutePermission(route, permissions) {
  // 如果路由没有定义权限要求，则允许访问
  if (!route.meta?.permission) {
    return true
  }
  
  // 检查用户是否有对应权限
  return permissions.includes(route.meta.permission)
}
```

## 五、错误处理统一化

### 5.1 全局错误处理

**文件**: `pc_client/src/utils/errorHandler.js` (新增)

```javascript
// ✅ 统一错误处理
import { message, Modal } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'

// 错误码映射
const ERROR_MESSAGES = {
  400: '请求参数错误',
  401: '登录状态已过期',
  403: '没有访问权限',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂不可用',
  504: '网关超时'
}

// 业务错误码映射 (与主项目保持一致)
const BUSINESS_ERROR_CODES = {
  601: '业务逻辑错误',
  602: '参数验证失败',
  603: '数据不存在',
  604: '操作失败'
}

export function handleError(error, showMessage = true) {
  let errorMessage = '未知错误'
  let errorCode = 500
  
  if (error.response) {
    // HTTP错误
    errorCode = error.response.status
    errorMessage = ERROR_MESSAGES[errorCode] || `请求失败 (${errorCode})`
    
    // 处理401错误
    if (errorCode === 401) {
      handleUnauthorized()
      return
    }
  } else if (error.code) {
    // 业务错误
    errorCode = error.code
    errorMessage = BUSINESS_ERROR_CODES[errorCode] || error.message || '操作失败'
  } else if (error.message) {
    errorMessage = error.message
  }
  
  // 显示错误消息
  if (showMessage) {
    if (errorCode >= 500) {
      message.error(errorMessage)
    } else {
      message.warning(errorMessage)
    }
  }
  
  // 记录错误日志
  console.error('API Error:', {
    code: errorCode,
    message: errorMessage,
    originalError: error
  })
  
  return {
    code: errorCode,
    message: errorMessage
  }
}

// 处理401未授权错误
function handleUnauthorized() {
  const authStore = useAuthStore()
  
  Modal.confirm({
    title: '登录状态已过期',
    content: '您的登录状态已过期，请重新登录',
    okText: '重新登录',
    cancelText: '取消',
    onOk() {
      authStore.resetState()
      window.location.href = '/login'
    }
  })
}

// 网络错误处理
export function handleNetworkError(error) {
  let message = '网络连接异常'
  
  if (error.code === 'ECONNABORTED') {
    message = '请求超时，请检查网络连接'
  } else if (error.message === 'Network Error') {
    message = '网络连接失败，请检查网络设置'
  }
  
  return handleError({ message }, true)
}
```

## 六、测试验证

### 6.1 API接口测试清单

#### 认证模块测试
- [ ] 登录接口 (`/auth/login`)
- [ ] 获取用户信息 (`/getInfo`)
- [ ] 注销接口 (`/auth/logout`)
- [ ] Token刷新 (`/auth/refresh`)

#### 系统模块测试  
- [ ] 通知列表 (`/system/notice/list`)
- [ ] 通知详情 (`/system/notice/{id}`)
- [ ] 标记已读 (`/system/notice/read/{ids}`)

#### AI模块测试 (需要后端开发)
- [ ] 智能体列表 (`/ai/agent/list`)
- [ ] 智能体详情 (`/ai/agent/{id}`)
- [ ] 聊天消息 (`/ai/chat/send`)
- [ ] 流式聊天 (`/ai/chat/stream`)

### 6.2 前端功能测试

#### 基础功能
- [ ] 登录/注销流程
- [ ] 用户信息显示
- [ ] 权限控制
- [ ] 路由跳转

#### 错误处理
- [ ] 网络错误提示
- [ ] 业务错误提示
- [ ] Token过期处理
- [ ] 权限不足提示

## 七、部署配置

### 7.1 生产环境配置

**文件**: `pc_client/.env.production`
```bash
# 生产环境API配置
VITE_API_BASE_URL=/api
VITE_SERVER_URL=https://your-domain.com
VITE_APP_BASE_API=/api

# 应用信息
VITE_APP_TITLE=小易AI助手
VITE_APP_VERSION=1.0.0

# 构建配置
VITE_DROP_CONSOLE=true
VITE_DROP_DEBUGGER=true
```

### 7.2 Nginx配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态资源
    location / {
        root /usr/share/nginx/html/pc-client;
        try_files $uri $uri/ /index.html;
    }
    
    # API代理到后端
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 文件上传
    location /profile/ {
        proxy_pass http://localhost:8080/profile/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 八、迁移时间表

### 第一阶段 (1-2天): 基础设施
- [x] 修改Vite代理配置
- [x] 重构request.js
- [x] 更新认证机制

### 第二阶段 (2-3天): 核心接口
- [x] 认证接口迁移
- [x] 系统接口适配
- [x] 状态管理重构

### 第三阶段 (3-4天): AI功能
- [ ] 后端AI Controller开发
- [ ] 前端AI接口适配
- [ ] 流式响应集成

### 第四阶段 (1-2天): 测试优化
- [ ] 功能测试
- [ ] 性能优化
- [ ] 部署配置

**总预计时间**: 7-11天

## 九、注意事项

### 9.1 兼容性考虑
1. **保持向下兼容**: 改造过程中确保现有功能不受影响
2. **渐进式升级**: 分模块逐步迁移，避免全面停服
3. **回滚准备**: 每个阶段完成后做好回滚准备

### 9.2 性能优化
1. **请求合并**: 减少不必要的API调用
2. **缓存策略**: 实施前端缓存机制
3. **懒加载**: 大型组件实施懒加载

### 9.3 安全注意
1. **敏感信息**: 确保不在前端暴露敏感配置
2. **HTTPS**: 生产环境强制使用HTTPS
3. **CSRF防护**: 配置CSRF防护机制

通过以上详细的迁移指南，可以确保PC Client项目与主项目后端的完美整合，实现统一的技术架构和开发体验。