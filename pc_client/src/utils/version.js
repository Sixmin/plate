/**
 * 版本信息工具
 * 功能：管理项目版本信息、构建信息等
 * 作用：为关于页面提供版本数据
 */

// ========== 版本信息配置 ==========

/**
 * 项目基本信息
 */
export const PROJECT_INFO = {
  name: '小易AI助手',
  description: '智能交互平台 PC端客户端',
  version: 'v 0.0.1',
  author: '小易AI助手团队',
  copyright: '© 2025 小易AI助手. 版权所有.',
  framework: '基于小易助手快速开发平台构建'
}

/**
 * 技术栈信息
 */
export const TECH_STACK = {
  frontend: 'Vue 3 + TypeScript + Ant Design Vue',
  backend: 'Spring Boot + PostgreSQL + Redis',
  ai: 'Dify平台集成',
  build: 'Vite + Pinia + Vue Router'
}

/**
 * 主要功能特性
 */
export const FEATURES = [
  '智能对话交互',
  '多模态消息支持',
  '知识库检索',
  '文件上传处理',
  '用户认证管理',
  '实时消息推送',
  '多端数据同步'
]

/**
 * 获取构建时间
 * @returns {String} 格式化的构建时间
 */
export function getBuildTime() {
  const now = new Date()
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 获取完整的版本信息
 * @returns {Object} 包含所有版本信息的对象
 */
export function getVersionInfo() {
  return {
    ...PROJECT_INFO,
    buildTime: getBuildTime(),
    techStack: TECH_STACK,
    features: FEATURES
  }
}

/**
 * 检查版本更新
 * @param {String} currentVersion 当前版本
 * @param {String} latestVersion 最新版本
 * @returns {Object} 版本比较结果
 */
export function checkVersionUpdate(currentVersion, latestVersion) {
  const current = currentVersion.split('.').map(Number)
  const latest = latestVersion.split('.').map(Number)
  
  for (let i = 0; i < Math.max(current.length, latest.length); i++) {
    const currentPart = current[i] || 0
    const latestPart = latest[i] || 0
    
    if (currentPart < latestPart) {
      return {
        hasUpdate: true,
        type: 'major',
        message: '发现新版本'
      }
    } else if (currentPart > latestPart) {
      return {
        hasUpdate: false,
        type: 'current',
        message: '当前版本'
      }
    }
  }
  
  return {
    hasUpdate: false,
    type: 'latest',
    message: '已是最新版本'
  }
}

/**
 * 格式化版本号
 * @param {String} version 版本号
 * @returns {String} 格式化后的版本号
 */
export function formatVersion(version) {
  return `v${version}`
}

export default {
  PROJECT_INFO,
  TECH_STACK,
  FEATURES,
  getBuildTime,
  getVersionInfo,
  checkVersionUpdate,
  formatVersion
} 