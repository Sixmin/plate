import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getNotificationList, 
  getNotificationDetail, 
  getUnreadCount, 
  getRecentNotifications,
  deleteNotification
} from '@/api/notification'
import { message } from 'ant-design-vue'

/**
 * 通知状态管理Store
 */
export const useNotificationStore = defineStore('notification', () => {
  // ===== 状态定义 =====
  const notifications = ref([])           // 通知列表
  const unreadCount = ref(0)             // 未读总数
  const loading = ref(false)             // 加载状态
  const panelVisible = ref(false)        // 通知面板显示状态
  const currentPage = ref(1)             // 当前页码
  const pageSize = ref(10)               // 每页数量
  const total = ref(0)                   // 总记录数

  // ===== 计算属性 =====
  const hasUnread = computed(() => unreadCount.value > 0)
  
  const displayUnreadCount = computed(() => {
    if (unreadCount.value === 0) return ''
    if (unreadCount.value > 99) return '99+'
    return unreadCount.value.toString()
  })

  // ===== 方法定义 =====

  /**
   * 获取通知列表
   * @param {Object} params 查询参数
   */
  const fetchNotifications = async (params = {}) => {
    loading.value = true
    try {
      const queryParams = {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        ...params
      }
      
      const response = await getNotificationList(queryParams)
      
      if (response.code === 200) {
        notifications.value = response.rows || []
        total.value = response.total || 0
        return response
      } else {
        throw new Error(response.msg || '获取通知列表失败')
      }
    } catch (error) {
      console.error('获取通知列表失败:', error)
      message.error('获取通知列表失败')
      notifications.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取最近通知（用于面板显示）
   * @param {number} limit 限制数量
   */
  const fetchRecentNotifications = async (limit = 5) => {
    loading.value = true
    try {
      const response = await getRecentNotifications(limit)
      
      if (response.code === 200) {
        notifications.value = response.rows || []
        return response.rows || []
      } else {
        throw new Error(response.msg || '获取最近通知失败')
      }
    } catch (error) {
      console.error('获取最近通知失败:', error)
      message.error('获取最近通知失败')
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取未读消息数量
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount()
      
      if (response.code === 200) {
        unreadCount.value = response.total || 0
        return response.total || 0
      } else {
        throw new Error(response.msg || '获取未读数量失败')
      }
    } catch (error) {
      console.error('获取未读数量失败:', error)
      unreadCount.value = 0
      return 0
    }
  }

  /**
   * 获取通知详情
   * @param {number} noticeId 通知ID
   */
  const fetchNotificationDetail = async (noticeId) => {
    try {
      const response = await getNotificationDetail(noticeId)
      
      if (response.code === 200) {
        return response.data
      } else {
        throw new Error(response.msg || '获取通知详情失败')
      }
    } catch (error) {
      console.error('获取通知详情失败:', error)
      message.error('获取通知详情失败')
      return null
    }
  }

  /**
   * 标记通知为已读
   * @param {number|Array} notificationIds 通知ID或ID数组
   */
  const markAsRead = async (notificationIds) => {
    try {
      // 这里可以根据实际业务需求，调用相应的标记已读接口
      // 目前基于现有后端接口，可能需要通过更新接口来实现
      
      // 模拟标记已读操作
      if (Array.isArray(notificationIds)) {
        notificationIds.forEach(id => {
          const notification = notifications.value.find(n => n.noticeId === id)
          if (notification) {
            notification.status = '1' // 假设1表示已读
          }
        })
      } else {
        const notification = notifications.value.find(n => n.noticeId === notificationIds)
        if (notification) {
          notification.status = '1'
        }
      }
      
      // 更新未读数量
      await fetchUnreadCount()
      
      message.success('标记已读成功')
    } catch (error) {
      console.error('标记已读失败:', error)
      message.error('标记已读失败')
    }
  }

  /**
   * 删除通知
   * @param {number|Array} notificationIds 通知ID或ID数组
   */
  const removeNotification = async (notificationIds) => {
    try {
      const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds]
      const response = await deleteNotification(ids)
      
      if (response.code === 200) {
        // 从本地列表中移除
        notifications.value = notifications.value.filter(
          n => !ids.includes(n.noticeId)
        )
        
        // 更新未读数量
        await fetchUnreadCount()
        
        message.success('删除成功')
      } else {
        throw new Error(response.msg || '删除失败')
      }
    } catch (error) {
      console.error('删除通知失败:', error)
      message.error('删除通知失败')
    }
  }

  /**
   * 全部标记为已读
   */
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.value
        .filter(n => n.status === '0')
        .map(n => n.noticeId)
      
      if (unreadNotifications.length > 0) {
        await markAsRead(unreadNotifications)
      }
    } catch (error) {
      console.error('全部标记已读失败:', error)
      message.error('全部标记已读失败')
    }
  }

  /**
   * 切换通知面板显示状态
   */
  const togglePanel = () => {
    panelVisible.value = !panelVisible.value
    
    // 打开面板时自动加载最近通知
    if (panelVisible.value) {
      fetchRecentNotifications()
    }
  }

  /**
   * 关闭通知面板
   */
  const closePanel = () => {
    panelVisible.value = false
  }

  /**
   * 初始化通知数据
   */
  const initializeNotifications = async () => {
    try {
      // 获取未读数量
      await fetchUnreadCount()
    } catch (error) {
      console.error('初始化通知数据失败:', error)
    }
  }

  /**
   * 重置状态
   */
  const resetState = () => {
    notifications.value = []
    unreadCount.value = 0
    loading.value = false
    panelVisible.value = false
    currentPage.value = 1
    total.value = 0
  }

  return {
    // 状态
    notifications,
    unreadCount,
    loading,
    panelVisible,
    currentPage,
    pageSize,
    total,
    
    // 计算属性
    hasUnread,
    displayUnreadCount,
    
    // 方法
    fetchNotifications,
    fetchRecentNotifications,
    fetchUnreadCount,
    fetchNotificationDetail,
    markAsRead,
    removeNotification,
    markAllAsRead,
    togglePanel,
    closePanel,
    initializeNotifications,
    resetState
  }
}) 