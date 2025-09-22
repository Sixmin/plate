import request from '@/utils/request'
import { getToken } from '@/stores/auth'

/**
 * 发送聊天消息
 * @param {Object} data 请求数据
 * @param {number} data.agentId 智能体ID
 * @param {string} data.conversationId 会话ID（可选，新对话时不传）
 * @param {string} data.message 消息内容
 * @param {number} data.messageType 消息类型（1-文本 2-图片 3-文件 4-语音）
 * @param {Array} data.files 附件文件列表（可选）
 * @param {boolean} data.streaming 是否流式响应（默认false）
 * @param {Function} onMessage 流式消息回调函数（可选）
 * @param {Function} onError 错误回调函数（可选）
 * @param {Function} onComplete 完成回调函数（可选）
 * @returns {Promise} 返回Promise对象
 */
export function sendMessage(data, onMessage, onError, onComplete) {
  console.log('🚀 发送消息API调用:', data)
  
  // 检查是否为流式响应
  const isStreaming = data.params?.response_mode === 'streaming'
  
  if (isStreaming && onMessage) {
    // 流式响应处理
    return new Promise((resolve, reject) => {
      // 使用与request.js相同的baseURL配置
      const baseURL = '/api'
      const url = `${baseURL}/ai/dify/call/auto`
      
      // 获取token - 使用与request.js一致的方式
      const token = getToken()
      
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        
        function readStream() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              console.log('📡 流式响应完成')
              if (onComplete) {
                onComplete()
              }
              resolve({ code: 200, msg: '流式响应完成' })
              return
            }
            
            // 解码数据块
            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk
            
            // 处理SSE事件
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // 保留可能不完整的最后一行
            
            let currentEvent = {}
            
            for (const line of lines) {
              const trimmedLine = line.trim()
              
              if (trimmedLine === '') {
                // 空行表示事件结束，处理当前事件
                if (currentEvent.data) {
                  try {
                    const eventData = JSON.parse(currentEvent.data)
                    console.log('📥 收到流式数据:', eventData)
                    
                    // 调用消息回调
                    if (onMessage) {
                      onMessage(eventData)
                    }
                  } catch (parseError) {
                    console.warn('⚠️ 解析流式数据失败:', parseError, '原始数据:', currentEvent.data)
                  }
                }
                currentEvent = {} // 重置事件对象
                continue
              }
              
              if (trimmedLine.startsWith('data:')) {
                // 提取data字段
                const dataValue = trimmedLine.substring(5).trim()
                if (dataValue === '[DONE]') {
                  console.log('📡 收到结束标记')
                  continue
                }
                currentEvent.data = dataValue
              } else if (trimmedLine.startsWith('event:')) {
                // 提取event字段
                currentEvent.event = trimmedLine.substring(6).trim()
              } else if (trimmedLine.startsWith('id:')) {
                // 提取id字段
                currentEvent.id = trimmedLine.substring(3).trim()
              }
              // 忽略其他字段如retry:等
            }
            
            // 处理可能没有以空行结尾的最后一个事件
            if (currentEvent.data) {
              try {
                const eventData = JSON.parse(currentEvent.data)
                console.log('📥 收到流式数据(最后):', eventData)
                
                if (onMessage) {
                  onMessage(eventData)
                }
              } catch (parseError) {
                console.warn('⚠️ 解析最后流式数据失败:', parseError, '原始数据:', currentEvent.data)
              }
            }
            
            // 继续读取下一个数据块
            return readStream()
          })
        }
        
        return readStream()
      })
      .catch(error => {
        console.error('💥 流式请求失败:', error)
        if (onError) {
          onError(error)
        }
        reject(error)
      })
    })
  } else {
    // 非流式响应，使用原有方式
    return request({
      url: '/ai/dify/call/auto',
      method: 'post',
      data: data
    })
  }
}

/**
 * 上传文件
 * @param {FormData} formData 包含文件的FormData对象
 * @returns {Promise} 上传结果
 */
export function uploadFile(formData) {
  return request({
    url: '/ai/chat/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取会话状态
 * @param {string} conversationId 会话ID
 * @returns {Promise} 会话状态信息
 */
export function getConversationStatus(conversationId) {
  return request({
    url: `/ai/chat/status/${conversationId}`,
    method: 'get'
  })
}

/**
 * 停止AI回复
 * @param {string} conversationId 会话ID
 * @returns {Promise} 停止结果
 */
export function stopAIReply(conversationId) {
  return request({
    url: `/ai/chat/stop/${conversationId}`,
    method: 'post'
  })
}

/**
 * 上传文件到Dify平台
 * @param {File} file 要上传的文件
 * @param {string} agentType 智能体类型（可选）
 * @param {string} user 用户标识（可选）
 * @returns {Promise} 上传结果
 */
export function uploadFileToDify(file, agentType, agentId) {
  const formData = new FormData()
  formData.append('file', file)
  if (agentType) {
    formData.append('agentType', agentType)
  }
  if (agentId) {
    formData.append('agentId', agentId)
  }
  
  return request({
    url: '/ai/dify/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000 // 文件上传可能需要更长时间
  })
}

/**
 * 批量上传文件到Dify平台
 * @param {Array<File>} files 要上传的文件数组
 * @param {string} agentType 智能体类型（可选）
 * @param {string} user 用户标识（可选）
 * @param {Function} onProgress 上传进度回调（可选）
 * @returns {Promise<Array>} 上传结果数组
 */
export async function uploadMultipleFilesToDify(files, agentType, agentId, onProgress = null) {
  const uploadResults = []
  const totalFiles = files.length
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    try {
      console.log(`📤 上传文件 ${i + 1}/${totalFiles}: ${file.name}`)
      
      // 调用进度回调
      if (onProgress) {
        onProgress({
          currentFile: i + 1,
          totalFiles: totalFiles,
          fileName: file.name,
          status: 'uploading'
        })
      }
      
      const result = await uploadFileToDify(file, agentType, agentId)
      
      if (result.code === 200) {
        console.log(`✅ 文件上传成功: ${file.name}`)
        uploadResults.push({
          file: file,
          success: true,
          data: result.data,
          fileId: result.data?.file_id || result.data?.id,
          fileName: file.name,
          index: i
        })
        
        // 调用进度回调
        if (onProgress) {
          onProgress({
            currentFile: i + 1,
            totalFiles: totalFiles,
            fileName: file.name,
            status: 'success'
          })
        }
      } else {
        console.error(`❌ 文件上传失败: ${file.name}`, result.msg)
        uploadResults.push({
          file: file,
          success: false,
          error: result.msg || '上传失败',
          fileName: file.name,
          index: i
        })
        
        // 调用进度回调
        if (onProgress) {
          onProgress({
            currentFile: i + 1,
            totalFiles: totalFiles,
            fileName: file.name,
            status: 'error',
            error: result.msg || '上传失败'
          })
        }
      }
    } catch (error) {
      console.error(`💥 文件上传异常: ${file.name}`, error)
      uploadResults.push({
        file: file,
        success: false,
        error: error.message || '上传异常',
        fileName: file.name,
        index: i
      })
      
      // 调用进度回调
      if (onProgress) {
        onProgress({
          currentFile: i + 1,
          totalFiles: totalFiles,
          fileName: file.name,
          status: 'error',
          error: error.message || '上传异常'
        })
      }
    }
  }
  
  console.log(`📦 批量上传完成: ${uploadResults.filter(r => r.success).length}/${totalFiles} 成功`)
  return uploadResults
} 