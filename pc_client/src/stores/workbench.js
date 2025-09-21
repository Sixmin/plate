/**
 * 工作台状态管理模块
 * 功能：管理工作台相关数据，包括公告通知、待办事项、快捷应用
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { message } from 'ant-design-vue'

// 导入API接口
import { 
  getAnnouncements, 
  getTodoList, 
  updateTodoStatus, 
  getQuickApps 
} from '@/api/workbench'

/**
 * 工作台状态管理Store
 */
export const useWorkbenchStore = defineStore('workbench', () => {
  // ========== 状态定义 ==========
  
  /**
   * 公告数据
   */
  const announcements = ref([])
  const announcementLoading = ref(false)
  const announcementTotal = ref(0)
  
  /**
   * 待办数据
   */
  const todoList = ref([])
  const todoLoading = ref(false)
  
  /**
   * 快捷应用数据
   */
  const quickApps = ref([])
  const quickAppsLoading = ref(false)

  // ========== 计算属性 ==========
  
  /**
   * 待办事项数量
   */
  const todoCount = computed(() => {
    return todoList.value.filter(item => item.status === 0).length
  })
  
  /**
   * 最新的公告列表（显示前3条）
   */
  const latestAnnouncements = computed(() => {
    return announcements.value.slice(0, 3)
  })
  
  /**
   * 最新的待办事项列表（显示前2条）
   */
  const latestTodos = computed(() => {
    return todoList.value.filter(item => item.status === 0).slice(0, 2)
  })

  // ========== 方法定义 ==========

  /**
   * 加载公告数据
   */
  async function loadAnnouncements(params = {}) {
    announcementLoading.value = true
    try {
      const defaultParams = {
        pageNum: 1,
        pageSize: 10,
        status: 1
      }
      
      const response = await getAnnouncements({ ...defaultParams, ...params })
      
      if (response && response.rows) {
        announcements.value = response.rows
        announcementTotal.value = response.total || 0
      }
      
      return response
    } catch (error) {
      console.error('加载公告失败:', error)
      // 使用模拟数据
      announcements.value = getDefaultAnnouncements()
      announcementTotal.value = announcements.value.length
      return { rows: announcements.value, total: announcementTotal.value }
    } finally {
      announcementLoading.value = false
    }
  }

  /**
   * 加载待办事项
   */
  async function loadTodoList() {
    todoLoading.value = true
    try {
      const response = await getTodoList()
      
      if (response && Array.isArray(response)) {
        todoList.value = response
      } else if (response && response.data && Array.isArray(response.data)) {
        todoList.value = response.data
      }
      
      return response
    } catch (error) {
      console.error('加载待办事项失败:', error)
      // 使用模拟数据
      todoList.value = getDefaultTodos()
      return todoList.value
    } finally {
      todoLoading.value = false
    }
  }

  /**
   * 更新待办状态
   */
  async function updateTodoStatusAction(id, status) {
    try {
      await updateTodoStatus(id, status)
      
      // 更新本地状态
      const todo = todoList.value.find(item => item.id === id)
      if (todo) {
        todo.status = status
        todo.updateTime = new Date().toISOString()
      }
      
      message.success(status === 1 ? '任务已完成' : '任务状态已更新')
      return Promise.resolve()
    } catch (error) {
      console.error('更新待办状态失败:', error)
      // 即使API失败，也允许更新本地状态（模拟模式）
      const todo = todoList.value.find(item => item.id === id)
      if (todo) {
        todo.status = status
        todo.updateTime = new Date().toISOString()
        message.success(status === 1 ? '任务已完成（模拟）' : '任务状态已更新（模拟）')
        return Promise.resolve()
      }
      message.error('更新失败')
      throw error
    }
  }

  /**
   * 加载快捷应用
   */
  async function loadQuickApps() {
    quickAppsLoading.value = true
    try {
      const response = await getQuickApps()
      
      if (response && Array.isArray(response)) {
        quickApps.value = response
      } else if (response && response.data && Array.isArray(response.data)) {
        quickApps.value = response.data
      } else {
        // 如果后端还没有接口，使用默认数据
        quickApps.value = getDefaultQuickApps()
      }
      
      return response
    } catch (error) {
      console.error('加载快捷应用失败:', error)
      // 加载失败时使用默认数据
      quickApps.value = getDefaultQuickApps()
      return getDefaultQuickApps()
    } finally {
      quickAppsLoading.value = false
    }
  }

  /**
   * 获取默认快捷应用数据
   */
  function getDefaultQuickApps() {
    return [
      {
        id: 1,
        name: '审查',
        icon: 'CheckCircleOutlined',
        bgColor: '#52c41a',
        path: '/system/audit',
        sort: 1,
        status: 1
      },
      {
        id: 2,
        name: '故障上报',
        icon: 'ExclamationCircleOutlined',
        bgColor: '#ff4d4f',
        path: '/system/report',
        sort: 2,
        status: 1
      },
      {
        id: 3,
        name: '工资条',
        icon: 'CreditCardOutlined',
        bgColor: '#1890ff',
        path: '/hr/salary',
        sort: 3,
        status: 1
      },
      {
        id: 4,
        name: '建设中',
        icon: 'ToolOutlined',
        bgColor: '#722ed1',
        path: '/system/construction',
        sort: 4,
        status: 1
      }
    ]
  }

  /**
   * 获取默认公告数据
   */
  function getDefaultAnnouncements() {
    const now = new Date()
    return [
      {
        noticeId: 1,
        noticeTitle: '小易AI助手正式上线，欢迎体验智能服务',
        noticeContent: '经过紧张的开发和测试，小易AI助手正式上线...',
        noticeType: 1,
        status: 1,
        createTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        noticeId: 2,
        noticeTitle: '系统维护通知：预计今晚22:00-24:00进行系统维护',
        noticeContent: '为了给大家提供更好的服务体验，系统将进行例行维护...',
        noticeType: 2,
        status: 1,
        createTime: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        noticeId: 3,
        noticeTitle: '新功能发布：支持文档智能分析和语音交互',
        noticeContent: '我们很高兴地宣布，小易AI助手新增了文档分析和语音交互功能...',
        noticeType: 1,
        status: 1,
        createTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  /**
   * 获取默认待办数据
   */
  function getDefaultTodos() {
    const now = new Date()
    return [
      {
        id: 1,
        title: '完成月度工作总结报告',
        description: '需要完成本月的工作总结，包括项目进展和个人成长',
        status: 0, // 0-待办，1-已完成
        priority: 1, // 1-高优先级，2-中优先级，3-低优先级
        createTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        title: '参加下周一的部门例会',
        description: '部门例会将讨论下季度的工作计划和目标',
        status: 0,
        priority: 2,
        createTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        title: '更新个人技能档案',
        description: '在系统中更新最近学习的新技能和证书信息',
        status: 1,
        priority: 3,
        createTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  /**
   * 初始化工作台数据
   */
  async function initWorkbench() {
    try {
      await Promise.all([
        loadAnnouncements(),
        loadTodoList(),
        loadQuickApps()
      ])
    } catch (error) {
      console.error('初始化工作台数据失败:', error)
    }
  }

  /**
   * 刷新所有数据
   */
  async function refreshAllData() {
    try {
      await initWorkbench()
      message.success('数据刷新成功')
    } catch (error) {
      message.error('数据刷新失败')
    }
  }

  // ========== 返回状态和方法 ==========
  return {
    // 状态
    announcements,
    announcementLoading,
    announcementTotal,
    todoList,
    todoLoading,
    quickApps,
    quickAppsLoading,
    
    // 计算属性
    todoCount,
    latestAnnouncements,
    latestTodos,
    
    // 方法
    loadAnnouncements,
    loadTodoList,
    updateTodoStatusAction,
    loadQuickApps,
    initWorkbench,
    refreshAllData
  }
}) 