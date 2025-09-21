<template>
  <a-modal
    :open="open"
    @update:open="handleOpenChange"
    title="关于小易AI助手"
    :footer="null"
    width="360px"
    :closable="true"
    :mask-closable="true"
    centered
  >
    <div class="about-content">
      <div class="about-header">
        <img class="about-logo" src="/src/assets/logo/xiaoyi.jpg" alt="小易AI助手" @error="handleLogoError" />
        <div class="about-title">小易AI助手</div>
      </div>
      <div class="about-divider"></div>
      <div class="about-info-row">
        <span>版本号：</span>
        <span>{{ version }}</span>
      </div>
      <div class="about-info-row">
        <span>构建时间：</span>
        <span>{{ buildTime }}</span>
      </div>
      <div class="about-divider"></div>
      <div class="about-footer">
        <div>© 2025 小易AI助手. 版权所有.</div>
        <div>基于小易助手快速开发平台构建</div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
/**
 * 关于模态框组件
 * 功能：显示项目版本信息、功能特性、版权信息等
 * 作用：为用户提供项目相关信息展示
 */

import { computed } from 'vue'
import { PROJECT_INFO, TECH_STACK, FEATURES, getBuildTime } from '@/utils/version'

// ========== Props 定义 ==========

/**
 * 模态框显示状态
 * @type {Boolean} 控制模态框的显示/隐藏
 */
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

// ========== Emits 定义 ==========

/**
 * 更新模态框显示状态
 * @type {Function} 向父组件发送状态更新事件
 */
const emit = defineEmits(['update:open'])

// ========== 计算属性 ==========

/**
 * 项目版本号
 * 从版本信息工具中获取版本信息
 * @type {String} 当前项目版本号
 */
const version = computed(() => {
  return PROJECT_INFO.version
})

/**
 * 构建时间
 * 显示当前构建的时间信息
 * @type {String} 构建时间字符串
 */
const buildTime = computed(() => {
  return getBuildTime()
})

/**
 * 技术栈信息
 * @type {String} 技术栈描述
 */
const techStack = computed(() => {
  return TECH_STACK.frontend
})

/**
 * 功能特性列表
 * @type {Array} 功能特性数组
 */
const features = computed(() => {
  return FEATURES
})

/**
 * 版权信息
 * @type {String} 版权信息
 */
const copyright = computed(() => {
  return PROJECT_INFO.copyright
})

/**
 * 框架信息
 * @type {String} 框架信息
 */
const framework = computed(() => {
  return PROJECT_INFO.framework
})

// ========== 事件处理 ==========

/**
 * 处理模态框显示状态变化
 * 功能：当模态框打开/关闭状态改变时触发
 * @param {Boolean} value 新的显示状态
 */
function handleOpenChange(value) {
  emit('update:open', value)
}

/**
 * 处理Logo加载错误
 * 功能：当Logo加载失败时触发
 * @param {Event} event 错误事件对象
 */
function handleLogoError(event) {
  // 设置默认的占位符或隐藏图片
  event.target.style.display = 'none'
}
</script>

<style scoped>
/**
 * 关于模态框样式
 * 功能：定义关于页面的外观和布局样式
 */

.about-content {
  max-width: 340px;
  margin: 0 auto;
  padding: 10px 0 0 0;
}

.about-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 6px;
}

.about-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  margin-bottom: 4px;
}

.about-title {
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 2px;
}

.about-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 10px 0;
}

.about-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #333;
  margin: 0 0 2px 0;
  padding: 0 2px;
}

.about-footer {
  text-align: center;
  font-size: 11px;
  color: #bbb;
  margin-top: 8px;
  line-height: 1.3;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .about-content {
    padding: 16px 0;
  }
  
  .about-logo {
    width: 60px;
    height: 60px;
  }
  
  .about-title {
    font-size: 20px;
  }
  
  .about-info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style> 