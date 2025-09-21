<!--
  工作台模块组件
  功能：集成公告通知、待办事项、快捷应用三大功能区域
-->
<template>
  <div :style="styles.container">
    
    <!-- 快捷应用区域 -->
    <div :style="styles.quickAppsSection">
      <div :style="styles.quickAppsGrid">
        <div 
          v-for="app in workbenchStore.quickApps" 
          :key="app.id"
          :style="[
            styles.quickAppItem,
            hoveredAppId === app.id ? styles.quickAppItemHover : {}
          ]"
          @click="onQuickAppClick(app)"
          @mouseenter="hoveredAppId = app.id"
          @mouseleave="hoveredAppId = null"
        >
          <div :style="styles.quickAppIcon">
            <component :is="getIconComponent(app.icon)" :style="styles.quickAppIconSvg" />
          </div>
          <span :style="styles.quickAppLabel">{{ app.name }}</span>
        </div>
      </div>
    </div>
    
    
   
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { 
  BellOutlined, 
  RightOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined,
  ToolOutlined
} from '@ant-design/icons-vue'

// 导入工作台Store
import { useWorkbenchStore } from '@/stores/workbench'

// 定义组件名称
defineOptions({
  name: 'WorkbenchModule'
})

// 定义事件
const emit = defineEmits(['navigate'])

// Store实例
const workbenchStore = useWorkbenchStore()

// 悬停状态
const hoveredAppId = ref(null)

// 图标组件映射
const iconComponents = {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined,
  ToolOutlined
}

/**
 * 获取图标组件
 */
function getIconComponent(iconName) {
  return iconComponents[iconName] || ToolOutlined
}

/**
 * 快捷应用点击处理
 */
function onQuickAppClick(app) {
  if (app.path === '/system/construction') {
    message.info('功能建设中，敬请期待')
  } else {
    emit('navigate', app.path)
  }
}

/**
 * 公告点击处理
 */
function onNoticeClick(notice) {
  // 这里可以打开公告详情弹窗或跳转到详情页
  message.info(`查看公告：${notice.noticeTitle}`)
  emit('navigate', `/system/notice/${notice.noticeId}`)
}

/**
 * 查看更多公告
 */
function onViewMoreNotices() {
  emit('navigate', '/system/notice')
}

/**
 * 待办状态变更处理
 */
async function onTodoStatusChange(todo) {
  try {
    const newStatus = todo.status === 1 ? 0 : 1
    await workbenchStore.updateTodoStatusAction(todo.id, newStatus)
  } catch (error) {
    console.error('更新待办状态失败:', error)
  }
}

/**
 * 格式化日期
 */
function formatDate(date) {
  if (!date) return ''
  
  const now = new Date()
  const targetDate = new Date(date)
  const diffTime = now.getTime() - targetDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return targetDate.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    })
  }
}

// 组件样式
const styles = reactive({
  container: {
    // padding: '8px 12px 8px 8px',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'transparent'
  },
  
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#262626',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f0f0f0'
  },
  
  // 快捷应用样式
  quickAppsSection: {
    // marginBottom: '20px'
  },
  
  quickAppsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  
  quickAppItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: '9px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    lineHeight: '38px',
    boxSizing: 'border-box',
    margin: '3px 0 0',
  },
  
  quickAppItemHover: {
    backgroundColor: '#E5E7EB',
    boxShadow: '0 0px 0px rgba(0, 0, 0, 0.15)',
    borderColor: '#1890ff',
  },
  
  quickAppIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    flexShrink: 0,
    // backgroundColor: '#ffffff',
    // border: '1px solid #d9d9d9',
  },

  
  quickAppIconSvg: {
    fontSize: '16px',
    color: '#333333'
  },
  
  quickAppLabel: {
    fontSize: '15px',
    color: '#262626',
    textAlign: 'left',
    fontWeight: '500',
  },
  
  // 公告通知样式
  noticeSection: {
    marginBottom: '20px'
  },
  
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#262626'
  },
  
  moreBtn: {
    fontSize: '12px',
    padding: '0'
  },
  
  sectionContent: {
    minHeight: '100px'
  },
  
  noticeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  noticeItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '8px',
    borderRadius: '6px',
    backgroundColor: '#fafafa',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#f0f0f0'
    }
  },
  
  noticeIcon: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
    marginTop: '2px'
  },
  
  noticeIconSvg: {
    fontSize: '14px',
    color: '#1890ff'
  },
  
  noticeContent: {
    flex: 1,
    minWidth: 0
  },
  
  noticeTitle: {
    fontSize: '13px',
    color: '#262626',
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    marginBottom: '2px'
  },
  
  noticeTime: {
    fontSize: '11px',
    color: '#8c8c8c'
  },
  
  // 待办事项样式
  todoSection: {},
  
  todoCount: {
    backgroundColor: '#ff4d4f',
    color: '#ffffff',
    fontSize: '11px',
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: '16px',
    textAlign: 'center'
  },
  
  todoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  
  todoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '8px',
    borderRadius: '6px',
    backgroundColor: '#fafafa'
  },
  
  todoCheckbox: {
    marginRight: '8px',
    marginTop: '2px'
  },
  
  todoContent: {
    flex: 1,
    minWidth: 0
  },
  
  todoTitle: {
    fontSize: '13px',
    color: '#262626',
    lineHeight: '1.4',
    marginBottom: '2px'
  },
  
  todoCompleted: {
    textDecoration: 'line-through',
    color: '#8c8c8c'
  },
  
  todoTime: {
    fontSize: '11px',
    color: '#8c8c8c'
  },
  
  // 通用样式
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    gap: '8px'
  },
  
  loadingText: {
    fontSize: '12px',
    color: '#8c8c8c'
  },
  
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  
  emptyText: {
    fontSize: '12px',
    color: '#bfbfbf'
  }
})

// 组件挂载时初始化数据
onMounted(() => {
  workbenchStore.initWorkbench()
})
</script>

<style scoped>
/* 响应式优化 */
@media (max-width: 1200px) {
  .quickAppsGrid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

/* 悬停效果 */
.quickAppItem:hover {
  background-color: #f0f0f0 !important;
  transform: translateY(-1px);
}

.noticeItem:hover,
.quickAppItem:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 滚动条样式 */
.container::-webkit-scrollbar {
  width: 4px;
}

.container::-webkit-scrollbar-track {
  background: transparent;
}

.container::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 2px;
}

.container::-webkit-scrollbar-thumb:hover {
  background-color: #bfbfbf;
}
</style> 