import request from '@/utils/request'

/**
 * 获取会话列表
 * @param {Object} query 查询参数
 * @param {number} query.agentId 智能体ID
 * @param {number} query.pageNum 页码
 * @param {number} query.pageSize 每页大小
 * @returns {Promise} 会话列表
 */
export function getConversationList(data) {
  return request({
    url: '/ai/dify/call/auto',
    method: 'post',
    data: data
  })
}

/**
 * 获取会话历史消息
 * @param {Object} query 查询参数
 * @param {string} query.conversationId 会话ID
 * @param {number} query.agentId 智能体ID
 * @param {string} query.user 用户标识
 * @param {number} query.limit 消息数量限制
 * @returns {Promise} 消息列表
 */
export function getConversationMessages(data) {
  return request({
    url: '/ai/dify/call/auto',
    method: 'post',
    data: data
  })
}

/**
 * 修改会话名称
 * @param {Object} data 请求数据
 * @param {string} data.conversationId 会话ID
 * @param {string} data.newTitle 新标题
 * @param {number} data.agentId 智能体ID
 * @returns {Promise} 修改结果
 */
export function renameConversation(data) {
  return request({
    url: '/ai/conversation/rename',
    method: 'put',
    data: data
  })
}

/**
 * 删除会话
 * @param {Object} data 请求数据
 * @param {string} data.conversationId 会话ID
 * @param {number} data.agentId 智能体ID
 * @returns {Promise} 删除结果
 */
export function deleteConversation(data) {
  return request({
    url: '/ai/conversation/delete',
    method: 'delete',
    data: data
  })
}

/**
 * 创建新会话（注意：实际上会话是在发送第一条消息时自动创建的）
 * 这个函数主要用于前端逻辑，实际创建会通过sendMessage接口完成
 * @param {Object} data 会话创建参数
 * @param {number} data.agentId 智能体ID
 * @param {string} data.title 会话标题
 * @returns {Promise} 创建结果
 */
export function createConversation(data) {
  // 实际上不需要单独的创建会话接口
  // 会话会在发送第一条消息时自动创建
  return Promise.resolve({
    code: 200,
    msg: '会话将在发送第一条消息时创建',
    data: {
      conversationId: null, // 新会话ID为null，会在发送消息时生成
      title: data.title || '新对话',
      agentId: data.agentId,
      createTime: new Date().toISOString()
    }
  })
}

