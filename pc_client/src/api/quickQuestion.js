/**
 * 常见问题API接口
 */
import request from '@/utils/request'

/**
 * 获取所有快捷问题列表（按分类组织）
 * @returns {Promise} 快捷问题列表（含分类）
 */
export function getAllQuickQuestions() {
  return request({
    url: '/ai/quick-question/list',
    method: 'get'
  })
}

/**
 * 获取所有快捷问题分类
 * @returns {Promise} 分类列表
 */
export function getQuickQuestionCategories() {
  return request({
    url: '/ai/quick-question/categories',
    method: 'get'
  })
}

/**
 * 根据分类ID获取问题列表
 * @param {number} categoryId 分类ID
 * @returns {Promise} 问题列表
 */
export function getQuestionsByCategory(categoryId) {
  return request({
    url: `/ai/quick-question/category/${categoryId}`,
    method: 'get'
  })
}

/**
 * 搜索快捷问题
 * @param {string} keyword 关键词
 * @returns {Promise} 匹配问题列表
 */
export function searchQuickQuestions(keyword) {
  return request({
    url: '/ai/quick-question/search',
    method: 'get',
    params: { keyword }
  })
}

/**
 * 记录问题使用（增加使用次数）
 * @param {number} questionId 问题ID
 * @returns {Promise} 操作结果
 */
export function recordQuestionUsage(questionId) {
  return request({
    url: `/ai/quickQuestion/usage/${questionId}`,
    method: 'post'
  })
}

/**
 * 查询AI快捷问题列表
 * @param {Object} params 查询参数
 * @returns {Promise} 快捷问题列表
 */
export function listQuickQuestions(params) {
  return request({
    url: '/ai/quickQuestion/list',
    method: 'get',
    params
  })
}

/**
 * 获取AI快捷问题详细信息
 * @param {number} questionId 问题ID
 * @returns {Promise} 问题详情
 */
export function getQuickQuestion(questionId) {
  return request({
    url: `/ai/quickQuestion/${questionId}`,
    method: 'get'
  })
}

/**
 * 新增AI快捷问题
 * @param {Object} data 问题数据
 * @returns {Promise} 操作结果
 */
export function addQuickQuestion(data) {
  return request({
    url: '/ai/quickQuestion',
    method: 'post',
    data: data
  })
}

/**
 * 修改AI快捷问题
 * @param {Object} data 问题数据
 * @returns {Promise} 操作结果
 */
export function updateQuickQuestion(data) {
  return request({
    url: '/ai/quickQuestion',
    method: 'put',
    data: data
  })
}

/**
 * 删除AI快捷问题
 * @param {Array|number} questionIds 问题ID数组或单个ID
 * @returns {Promise} 操作结果
 */
export function delQuickQuestion(questionIds) {
  return request({
    url: `/ai/quickQuestion/${questionIds}`,
    method: 'delete'
  })
} 