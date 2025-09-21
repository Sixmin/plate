/**
 * 工作台相关API接口
 */
import request from '@/utils/request'

/**
 * 获取公告列表
 * @param {Object} params 查询参数
 * @returns {Promise} 公告列表
 */
export function getAnnouncements(params) {
  return request({
    url: '/system/notice/list',
    method: 'get',
    params
  })
}

/**
 * 获取公告详情
 * @param {number} id 公告ID
 * @returns {Promise} 公告详情
 */
export function getAnnouncementDetail(id) {
  return request({
    url: `/system/notice/${id}`,
    method: 'get'
  })
}

/**
 * 获取待办事项列表
 * @returns {Promise} 待办事项列表
 */
export function getTodoList() {
  // return request({
  //   url: '/system/todo/list',
  //   method: 'get'
  // })
}

/**
 * 更新待办事项状态
 * @param {number} id 待办事项ID
 * @param {number} status 状态：0-待办，1-已完成
 * @returns {Promise} 更新结果
 */
export function updateTodoStatus(id, status) {
  return request({
    url: `/system/todo/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 获取快捷应用列表
 * @returns {Promise} 快捷应用列表
 */
export function getQuickApps() {
  // return request({
  //   url: '/system/workbench/apps',
  //   method: 'get'
  // })
}

/**
 * 获取工作台数据汇总
 * @returns {Promise} 工作台汇总数据
 */
export function getWorkbenchSummary() {
  return request({
    url: '/system/workbench/summary',
    method: 'get'
  })
} 