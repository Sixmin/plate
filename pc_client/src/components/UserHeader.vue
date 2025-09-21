<template>
  <div class="user-header">
    <!-- 未登录状态：显示登录按钮 -->
    <a-button 
      v-if="!authStore.isLoggedIn" 
      type="primary" 
      @click="showLoginModal"
      class="login-btn"
    >
      登录
    </a-button>
    
    <!-- 已登录状态：显示通知图标和用户下拉菜单 -->
    <div v-else class="user-actions">
      <!-- 通知图标 -->
      <NotificationIcon />
      
      <!-- 用户下拉菜单 -->
      <a-dropdown placement="bottomRight" :trigger="['click']">
        <div class="user-info" @click.prevent>
          <a-avatar 
            :src="authStore.avatar" 
            :size="32"
            class="user-avatar"
          >
            {{ (authStore.userInfo?.nickName || authStore.userName).charAt(0) }}
          </a-avatar>
          <span class="user-name">{{ authStore.userInfo?.nickName || authStore.userName }}</span>
          <DownOutlined class="dropdown-icon" />
        </div>
      
      <template #overlay>
        <a-menu>
          <a-menu-item key="profile" @click="handleProfile">
            <UserOutlined />
            个人中心
          </a-menu-item>
          <a-menu-item key="about" @click="handleAbout">
            <InfoCircleOutlined />
            关于
          </a-menu-item>
          <a-menu-divider />
          <a-menu-item key="logout" @click="handleLogout">
            <LogoutOutlined />
            退出登录
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    </div>
    
    <!-- 登录模态框 -->
    <LoginModal 
      v-model:open="loginModalVisible" 
      @success="handleLoginSuccess"
    />
    
    <!-- 个人中心模态框 -->
    <UserProfile 
      v-model:open="profileModalVisible"
    />
    
    <!-- 关于模态框 -->
    <AboutModal 
      v-model:open="aboutModalVisible"
    />
  </div>
</template>

<script setup>
/**
 * 用户头部组件
 * 功能：显示登录按钮或用户下拉菜单，处理登录/注销逻辑
 * 作用：为主界面提供用户认证相关的UI交互
 */

import { ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { 
  DownOutlined, 
  UserOutlined, 
  LogoutOutlined,
  InfoCircleOutlined
} from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'
import LoginModal from './LoginModal.vue'
import UserProfile from './UserProfile.vue'
import AboutModal from './AboutModal.vue'
import NotificationIcon from './NotificationIcon.vue'

// ========== 状态管理 ==========

/**
 * 认证状态管理
 * 用于获取用户登录状态、用户信息等
 */
const authStore = useAuthStore()

// ========== 响应式数据 ==========

/**
 * 登录模态框显示状态
 * @type {Boolean} 控制登录弹窗的显示/隐藏
 */
const loginModalVisible = ref(false)

/**
 * 个人中心模态框显示状态
 * @type {Boolean} 控制个人中心弹窗的显示/隐藏
 */
const profileModalVisible = ref(false)

/**
 * 关于模态框显示状态
 * @type {Boolean} 控制关于弹窗的显示/隐藏
 */
const aboutModalVisible = ref(false)

// ========== 事件处理方法 ==========

/**
 * 显示登录模态框
 * 功能：当用户点击登录按钮时触发
 */
function showLoginModal() {
  loginModalVisible.value = true
}

/**
 * 登录成功回调
 * 功能：登录成功后关闭模态框并显示欢迎信息
 */
function handleLoginSuccess() {
  loginModalVisible.value = false
  message.success('欢迎回来！')
}

/**
 * 处理个人中心点击
 * 功能：显示个人中心模态框
 */
function handleProfile() {
  profileModalVisible.value = true
}

/**
 * 处理关于点击
 * 功能：显示关于模态框
 */
function handleAbout() {
  aboutModalVisible.value = true
}

/**
 * 处理注销点击
 * 功能：弹出确认对话框，确认后执行注销操作
 */
function handleLogout() {
  Modal.confirm({
    title: '确认退出',
    content: '您确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await authStore.logoutAction()
        setTimeout(() => {
          location.reload()
        }, 500)
      } catch (error) {
        console.error('注销失败:', error)
        message.error('注销失败，请重试')
      }
    }
  })
}
</script>

<style scoped>
/**
 * 用户头部组件样式
 * 功能：定义组件的外观和交互样式
 */

.user-header {
  display: flex;
  align-items: center;
  height: 100%;
}

/* 登录按钮样式 */
.login-btn {
  font-size: 14px;
  height: 32px;
  border-radius: 6px;
  transition: all 0.3s;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

/* 用户操作区域样式 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 用户信息区域样式 */
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
  min-width: 120px;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* 用户头像样式 */
.user-avatar {
  margin-right: 8px;
  border: 1px solid #f0f0f0;
}

/* 用户名样式 */
.user-name {
  font-size: 14px;
  color: #333;
  margin-right: 4px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

/* 下拉箭头样式 */
.dropdown-icon {
  font-size: 12px;
  color: #999;
  transition: transform 0.2s;
}

.user-info:hover .dropdown-icon {
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .user-name {
    display: none; /* 移动端隐藏用户名，只显示头像 */
  }
  
  .user-info {
    min-width: auto;
  }
}
</style> 