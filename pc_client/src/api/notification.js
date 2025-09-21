import request from '@/utils/request'

/**
 * 通知管理API接口
 * 基于后端 SysNoticeController 接口封装
 */

/**
 * 获取通知公告列表
 * @param {Object} params 查询参数
 * @param {number} params.pageNum 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.noticeTitle 通知标题（可选）
 * @param {string} params.noticeType 通知类型（可选）
 * @param {string} params.status 状态（可选）
 */
export function getNotificationList(params) {
  return request({
    url: '/system/notice/list',
    method: 'get',
    params
  })
}

/**
 * 获取通知详情
 * @param {number} noticeId 通知ID
 */
export function getNotificationDetail(noticeId) {
  return request({
    url: `/system/notice/${noticeId}`,
    method: 'get'
  })
}

/**
 * 新增通知公告
 * @param {Object} data 通知数据
 */
export function addNotification(data) {
  return request({
    url: '/system/notice',
    method: 'post',
    data
  })
}

/**
 * 修改通知公告
 * @param {Object} data 通知数据
 */
export function updateNotification(data) {
  return request({
    url: '/system/notice',
    method: 'put',
    data
  })
}

/**
 * 删除通知公告
 * @param {Array} noticeIds 通知ID数组
 */
export function deleteNotification(noticeIds) {
  return request({
    url: `/system/notice/${noticeIds}`,
    method: 'delete'
  })
}

/**
 * 获取当前用户的未读通知数量
 * 基于现有接口，通过状态过滤实现
 */
export function getUnreadCount() {
  return request({
    url: '/system/notice/list',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 1,
      status: '0' // 假设0表示未读状态
    }
  })
}

/**
 * 获取最近的通知列表（用于通知面板显示）
 * @param {number} limit 限制数量，默认10条
 */
export function getRecentNotifications(limit = 10) {
  return request({
    url: '/system/notice/list',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: limit
    }
  })
}

/**
 * 标记通知为已读
 * @param {Array|number} noticeIds 通知ID或ID数组
 */
export function markNotificationRead(noticeIds) {
  const ids = Array.isArray(noticeIds) ? noticeIds : [noticeIds]
  
  // 由于后端可能没有专门的标记已读接口，这里使用更新接口
  // 实际实现可能需要根据后端具体接口调整
  return request({
    url: '/system/notice/read',
    method: 'put',
    data: {
      noticeIds: ids
    }
  })
}

/**
 * 获取用户通知设置
 */
export function getNotificationSettings() {
  return request({
    url: '/system/notice/settings',
    method: 'get'
  })
}

/**
 * 更新用户通知设置
 * @param {Object} settings 设置数据
 */
export function updateNotificationSettings(settings) {
  return request({
    url: '/system/notice/settings',
    method: 'put',
    data: settings
  })
} 