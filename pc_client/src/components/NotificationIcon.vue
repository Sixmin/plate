<template>
  <div class="notification-icon-container">
    <!-- 通知图标 -->
    <a-dropdown
      v-model:open="panelVisible"
      placement="bottomRight"
      trigger="hover"
      :overlay-class-name="'notification-dropdown'"
      :mouse-enter-delay="0.3"
      :mouse-leave-delay="0.5"
    >
      <div 
        class="notification-icon-wrapper" 
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <!-- <a-badge 
          :count="displayUnreadCount" 
          :show-zero="false"
          :dot="hasUnread && !displayUnreadCount"
        > -->
        <a-badge 
          :show-zero="false"
          :dot="hasUnread && !displayUnreadCount"
        >
          <BellOutlined class="notification-icon" />
        </a-badge>
      </div>

      <!-- 通知面板 -->
      <template #overlay>
        <div 
          class="notification-panel" 
          @click.stop
          @mouseenter="handlePanelEnter"
          @mouseleave="handlePanelLeave"
        >
          <!-- 面板头部 -->
          <div class="notification-header">
            <div class="header-title">
              <span>消息通知</span>
              <!-- <a-badge 
                :count="unreadCount" 
                :show-zero="false"
                class="header-badge"
              /> -->
              <a-badge 
                :show-zero="false"
                class="header-badge"
              />
            </div>
            <div class="header-actions">
              <a-button 
                type="link" 
                size="small" 
                @click="handleMarkAllRead"
                :disabled="!hasUnread"
              >
                全部已读
              </a-button>
            </div>
          </div>

          <!-- 通知列表 -->
          <div class="notification-content">
            <a-spin :spinning="loading">
              <div v-if="notifications.length === 0" class="empty-state">
                <InboxOutlined class="empty-icon" />
                <p class="empty-text">暂无通知消息</p>
              </div>
              
              <div v-else class="notification-list">
                <div
                  v-for="notification in notifications"
                  :key="notification.noticeId"
                  class="notification-item"
                  :class="{ 'unread': notification.status === '0' }"
                  @click="handleNotificationClick(notification)"
                >
                  <!-- 通知图标 -->
                  <div class="item-icon">
                    <component :is="getNotificationIcon(notification.noticeType)" />
                  </div>
                  
                  <!-- 通知内容 -->
                  <div class="item-content">
                    <div class="item-title">{{ notification.noticeTitle }}</div>
                    <div class="item-summary">{{ getNotificationSummary(notification.noticeContent) }}</div>
                    <div class="item-time">{{ formatTime(notification.createTime) }}</div>
                  </div>
                  
                  <!-- 操作按钮 -->
                  <div class="item-actions">
                    <a-dropdown placement="bottomRight" trigger="click">
                      <EllipsisOutlined class="action-icon" @click.stop />
                      <template #overlay>
                        <a-menu>
                          <a-menu-item 
                            v-if="notification.status === '0'"
                            @click="handleMarkRead(notification.noticeId)"
                          >
                            <CheckOutlined /> 标记已读
                          </a-menu-item>
                          <a-menu-item @click="handleViewDetail(notification)">
                            <EyeOutlined /> 查看详情
                          </a-menu-item>
                          <a-menu-item 
                            danger 
                            @click="handleDelete(notification.noticeId)"
                          >
                            <DeleteOutlined /> 删除
                          </a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown>
                  </div>
                </div>
              </div>
            </a-spin>
          </div>

          <!-- 面板底部 -->
          <div class="notification-footer">
            <a-button type="link" block @click="handleViewMore">
              查看更多通知
            </a-button>
          </div>
        </div>
      </template>
    </a-dropdown>

    <!-- 通知详情模态框 -->
    <a-modal
      v-model:open="detailModalVisible"
      title="通知详情"
      :footer="null"
      width="600px"
    >
      <div v-if="currentNotification" class="notification-detail">
        <div class="detail-header">
          <h3>{{ currentNotification.noticeTitle }}</h3>
          <div class="detail-meta">
            <a-tag :color="getNotificationTypeColor(currentNotification.noticeType)">
              {{ getNotificationTypeName(currentNotification.noticeType) }}
            </a-tag>
            <span class="detail-time">{{ formatTime(currentNotification.createTime) }}</span>
          </div>
        </div>
        <div class="detail-content" v-html="currentNotification.noticeContent"></div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { 
  BellOutlined,
  InboxOutlined,
  EllipsisOutlined,
  CheckOutlined,
  EyeOutlined,
  DeleteOutlined,
  NotificationOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons-vue'
import { Modal, message } from 'ant-design-vue'

// ===== 基础设置 =====
const router = useRouter()
const notificationStore = useNotificationStore()

// ===== 响应式数据 =====
const detailModalVisible = ref(false)
const currentNotification = ref(null)

// ===== 响应式状态 =====
const { 
  notifications, 
  unreadCount, 
  loading, 
  panelVisible, 
  hasUnread, 
  displayUnreadCount 
} = storeToRefs(notificationStore)

// ===== 事件处理 =====

/**
 * 鼠标进入通知图标区域
 */
const handleMouseEnter = () => {
  // 鼠标悬停时自动加载最新通知
  if (!panelVisible.value) {
    notificationStore.fetchRecentNotifications(10)
  }
}

/**
 * 鼠标离开通知图标区域
 */
const handleMouseLeave = () => {
  // 可以在这里添加延迟关闭逻辑，但由于使用了 hover trigger，Ant Design 会自动处理
}

/**
 * 鼠标进入通知面板
 */
const handlePanelEnter = () => {
  // 鼠标进入面板时，保持面板打开状态
  // Ant Design 的 hover trigger 会自动处理这个逻辑
}

/**
 * 鼠标离开通知面板
 */
const handlePanelLeave = () => {
  // 鼠标离开面板时，允许面板关闭
  // Ant Design 的 hover trigger 会自动处理这个逻辑
}

/**
 * 点击通知项
 */
const handleNotificationClick = (notification) => {
  // 如果是未读状态，标记为已读
  if (notification.status === '0') {
    notificationStore.markAsRead(notification.noticeId)
  }
  
  // 显示详情
  handleViewDetail(notification)
}

/**
 * 标记单个通知已读
 */
const handleMarkRead = (noticeId) => {
  notificationStore.markAsRead(noticeId)
}

/**
 * 标记全部已读
 */
const handleMarkAllRead = () => {
  console.log('unreadCount===>',unreadCount)
  notificationStore.markAllAsRead()
  console.log('unreadCount===>',unreadCount)
}

/**
 * 查看通知详情
 */
const handleViewDetail = (notification) => {
  currentNotification.value = notification
  detailModalVisible.value = true
}

/**
 * 删除通知
 */
const handleDelete = (noticeId) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这条通知吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      notificationStore.removeNotification(noticeId)
    }
  })
}

/**
 * 查看更多通知
 */
const handleViewMore = () => {
  notificationStore.closePanel()
  // 这里可以跳转到通知管理页面
  // router.push('/system/notice')
  message.info('跳转到通知管理页面')
}

// ===== 工具函数 =====

/**
 * 获取通知类型图标
 */
const getNotificationIcon = (noticeType) => {
  const iconMap = {
    '1': NotificationOutlined,    // 通知
    '2': InfoCircleOutlined,      // 公告
    '3': WarningOutlined,         // 警告
    '4': ExclamationCircleOutlined // 紧急
  }
  return iconMap[noticeType] || NotificationOutlined
}

/**
 * 获取通知类型名称
 */
const getNotificationTypeName = (noticeType) => {
  const typeMap = {
    '1': '通知',
    '2': '公告',
    '3': '警告',
    '4': '紧急'
  }
  return typeMap[noticeType] || '通知'
}

/**
 * 获取通知类型颜色
 */
const getNotificationTypeColor = (noticeType) => {
  const colorMap = {
    '1': 'blue',
    '2': 'green',
    '3': 'orange',
    '4': 'red'
  }
  return colorMap[noticeType] || 'blue'
}

/**
 * 获取通知内容摘要
 */
const getNotificationSummary = (content) => {
  if (!content) return ''
  // 去除HTML标签
  const text = content.replace(/<[^>]*>/g, '')
  return text.length > 50 ? text.substring(0, 50) + '...' : text
}

/**
 * 格式化时间
 */
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  
  const time = new Date(timeStr)
  const now = new Date()
  const diff = now - time
  
  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }
  
  // 小于24小时
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }
  
  // 小于7天
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }
  
  // 超过7天显示具体日期
  return time.toLocaleDateString()
}

// ===== 生命周期 =====
onMounted(() => {
  // 初始化通知数据
  notificationStore.initializeNotifications()
  
  // 定期更新未读数量（每30秒）
  const timer = setInterval(() => {
    notificationStore.fetchUnreadCount()
  }, 30000)
  
  // 保存定时器ID用于清理
  window.notificationTimer = timer
})

onUnmounted(() => {
  // 清理定时器
  if (window.notificationTimer) {
    clearInterval(window.notificationTimer)
    window.notificationTimer = null
  }
})
</script>

<style lang="scss" scoped>
.notification-icon-container {
  position: relative;
  display: inline-block;
}

.notification-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
}

.notification-icon {
  font-size: 18px;
  color: #666;
  transition: color 0.3s;

  &:hover {
    color: #1890ff;
  }
}

// 通知面板样式
.notification-panel {
  width: 360px;
  max-height: 480px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: #262626;
  }

  .header-badge {
    :deep(.ant-badge-count) {
      background: #ff4d4f;
    }
  }
}

.notification-content {
  max-height: 320px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 2px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #8c8c8c;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: #d9d9d9;
  }

  .empty-text {
    margin: 0;
    font-size: 14px;
  }
}

.notification-list {
  .notification-item {
    display: flex;
    align-items: flex-start;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      // background-color: #fafafa;
      background-color: #bceae7;
      color: #40a9ff;
      transform: translateY(-1px);
      boxShadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &.unread {
      // background-color: #f6ffed;
      // border-left: 3px solid #52c41a;

      .item-title {
        font-weight: 500;
      }
    }

    &:last-child {
      border-bottom: none;
    }
  }

  .item-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    margin-right: 12px;
    margin-top: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    border-radius: 50%;
    color: #1890ff;
  }

  .item-content {
    flex: 1;
    min-width: 0;

    .item-title {
      font-size: 14px;
      color: #262626;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-summary {
      font-size: 12px;
      color: #8c8c8c;
      line-height: 1.4;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .item-time {
      font-size: 12px;
      color: #bfbfbf;
    }
  }

  .item-actions {
    flex-shrink: 0;
    margin-left: 8px;

    .action-icon {
      padding: 4px;
      color: #bfbfbf;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        color: #1890ff;
        background-color: rgba(24, 144, 255, 0.1);
      }
    }
  }
}

.notification-footer {
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;

  :deep(.ant-btn-link) {
    color: #1890ff;
    font-size: 14px;
    height: auto;
    padding: 8px 0;

    &:hover {
      color: #40a9ff;
    }
  }
}

// 通知详情模态框样式
.notification-detail {
  .detail-header {
    margin-bottom: 20px;

    h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 500;
      color: #262626;
    }

    .detail-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .detail-time {
        color: #8c8c8c;
        font-size: 14px;
      }
    }
  }

  .detail-content {
    line-height: 1.6;
    color: #595959;

    :deep(p) {
      margin-bottom: 12px;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
}

// 全局样式覆盖
:global(.notification-dropdown .ant-dropdown-menu) {
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
</style> 