import request from '@/utils/request'

/**
 * 获取智能体列表（带分页和权限控制）
 * 根据接口文档：/ai/agent/list
 * @param {Object} query 查询参数
 * @returns {Promise} 智能体列表
 */
export function listAgents(query = {}) {
  return request({
    url: '/ai/agent/list',
    method: 'get',
    params: query
  })
}

/**
 * 获取用户可用的智能体列表（只返回启用状态的智能体）
 * @param {Object} query 查询参数
 * @returns {Promise} 智能体列表
 */
export function getAvailableAgents(query = {}) {
  // 使用统一的/ai/agent/list接口，但只查询启用状态的智能体
  const params = {
    status: 1, // 只查询启用状态
    pageNum: 1,
    pageSize: 100, // 获取足够多的数据
    orderByColumn: 'sortOrder',
    isAsc: 'asc',
    ...query
  }
  
  return request({
    url: '/ai/agent/list',
    method: 'get',
    params: params
  })
}

/**
 * 根据智能体编码获取智能体信息
 * @param {string} agentCode 智能体编码
 * @returns {Promise} 智能体信息
 */
export function getAgentByCode(agentCode) {
  return request({
    url: `/ai/agent/code/${agentCode}`,
    method: 'get'
  })
}

/**
 * 根据ID获取智能体详情
 * @param {number} agentId 智能体ID
 * @returns {Promise} 智能体详情
 */
export function getAgent(agentId) {
  return request({
    url: `/ai/agent/${agentId}`,
    method: 'get'
  })
}

/**
 * 检查用户对智能体的权限
 * @param {number} agentId 智能体ID
 * @returns {Promise} 权限检查结果
 */
export function checkAgentPermission(agentId) {
  return request({
    url: `/ai/agent/checkPermission/${agentId}`,
    method: 'get'
  })
} 