/**
 * 应用程序入口文件
 * 功能：初始化Vue应用、配置插件、设置路由守卫等
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 引入Ant Design Vue样式
import 'ant-design-vue/dist/reset.css'

// 引入代码高亮样式
import 'highlight.js/styles/github.css'

// 引入全局样式
import './styles/global.css'

// 引入路由权限控制
import { setupRouterGuard } from '@/router/permission'

// 引入认证store，用于初始化状态
import { useAuthStore } from '@/stores/auth'

/**
 * 创建Vue应用实例
 */
const app = createApp(App)

/**
 * 配置Pinia状态管理
 */
const pinia = createPinia()
app.use(pinia)

/**
 * 配置Vue Router
 */
app.use(router)

/**
 * 设置路由守卫
 * 必须在router配置完成后调用
 */
setupRouterGuard()

/**
 * 初始化认证状态
 * 从localStorage恢复登录状态
 */
const authStore = useAuthStore()
authStore.restoreAuthState()

/**
 * 挂载应用到DOM
 */
app.mount('#app')

/**
 * 全局错误处理
 */
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
  // 可以在这里添加错误上报逻辑
} 