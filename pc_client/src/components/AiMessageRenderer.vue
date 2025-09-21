<template>
  <div class="ai-message-renderer">
    <!-- Think 部分 -->
    <div v-if="thinkContent" class="think-section">
      <div class="think-header" @click="toggleThinkExpanded">
        <span class="think-label">🤔 思考过程</span>
        <a-button type="text" size="small" class="toggle-btn">
          <template #icon>
            <DownOutlined v-if="thinkExpanded" />
            <RightOutlined v-else />
          </template>
        </a-button>
      </div>
      <div v-if="thinkExpanded" class="think-content">
        <div v-html="renderedThinkContent"></div>
      </div>
    </div>
    
    <!-- 主要回复内容 -->
    <div v-if="mainContent" class="main-content">
      <div v-html="renderedMainContent" class="markdown-content"></div>
      
      <!-- 复制按钮 -->
      <div class="message-actions">
        <a-button 
          type="text" 
          size="small" 
          class="copy-btn"
          @click="copyContent"
          :title="copySuccess ? '已复制!' : '复制回复内容'"
        >
          <template #icon>
            <CheckOutlined v-if="copySuccess" class="success-icon" />
            <CopyOutlined v-else />
          </template>
          {{ copySuccess ? '已复制' : '复制' }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { DownOutlined, RightOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

// Markdown 配置
const md = new MarkdownIt({
  html: true,           // 允许HTML标签
  xhtmlOut: true,       // 使用 '/' 来闭合单标签
  breaks: true,         // 转换段落里的 '\n' 到 <br>
  linkify: true,        // 将类似URL的文本自动转换为链接
  typographer: true,    // 语言中性的替换 + 引号美化
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>'
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

// 启用表格插件
md.enable(['table'])

// 自定义渲染规则以优化显示
md.renderer.rules.paragraph_open = function(tokens, idx) {
  return '<p>'
}

md.renderer.rules.paragraph_close = function(tokens, idx) {
  return '</p>'
}

const props = defineProps({
  message: {
    type: String,
    required: true
  }
})

// 思考部分展开状态
const thinkExpanded = ref(false)
// 复制成功状态
const copySuccess = ref(false)

// 解析消息内容 - 修复响应式更新问题
const parsedMessage = computed(() => {
  const message = props.message || ''
  
  // 匹配 <think>...</think> 标签
  const thinkMatch = message.match(/<think>([\s\S]*?)<\/think>/i)
  
  if (thinkMatch) {
    const think = thinkMatch[1].trim()
    const main = message.replace(/<think>[\s\S]*?<\/think>/i, '').trim()
    
    return {
      thinkContent: think,
      mainContent: main
    }
  }
  
  return {
    thinkContent: null,
    mainContent: message
  }
})

// 从computed中提取内容
const thinkContent = computed(() => parsedMessage.value.thinkContent)
const mainContent = computed(() => parsedMessage.value.mainContent)

// 渲染Markdown内容
const renderedMainContent = computed(() => {
  if (!mainContent.value) return ''
  try {
    return md.render(mainContent.value)
  } catch (error) {
    console.warn('Markdown渲染失败:', error)
    // 降级到纯文本显示
    return `<pre>${mainContent.value}</pre>`
  }
})

const renderedThinkContent = computed(() => {
  if (!thinkContent.value) return ''
  try {
    return md.render(thinkContent.value)
  } catch (error) {
    console.warn('Think内容Markdown渲染失败:', error)
    // 降级到纯文本显示
    return `<pre>${thinkContent.value}</pre>`
  }
})

// 切换思考部分展开状态
const toggleThinkExpanded = () => {
  thinkExpanded.value = !thinkExpanded.value
}

// 复制内容功能
const copyContent = async () => {
  try {
    // 复制原始的markdown文本，而不是HTML
    const textToCopy = mainContent.value || props.message
    
    await navigator.clipboard.writeText(textToCopy)
    
    // 显示成功状态
    copySuccess.value = true
    message.success('回复内容已复制到剪贴板')
    
    // 2秒后恢复原状态
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
    
  } catch (err) {
    console.error('复制失败:', err)
    
    // 降级方案
    try {
      const textToCopy = mainContent.value || props.message
      const textArea = document.createElement('textarea')
      textArea.value = textToCopy
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      copySuccess.value = true
      message.success('回复内容已复制到剪贴板')
      
      setTimeout(() => {
        copySuccess.value = false
      }, 2000)
      
    } catch (fallbackErr) {
      console.error('降级复制也失败:', fallbackErr)
      message.error('复制失败，请手动选择文本复制')
    }
  }
}

// 监听thinkContent变化，自动展开思考部分
watch(thinkContent, (newThinkContent) => {
  if (newThinkContent && !thinkExpanded.value) {
    thinkExpanded.value = true
  }
}, { immediate: true })
</script>

<style scoped>
.ai-message-renderer {
  width: 100%;
}

.think-section {
  margin-bottom: 12px;
  border: 1px solid #e8f4fd;
  border-radius: 6px;
  background-color: #f8fbff;
  overflow: hidden;
}

.think-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  cursor: pointer;
  background-color: #e8f4fd;
  transition: background-color 0.2s;
}

.think-header:hover {
  background-color: #d6ebfa;
}

.think-label {
  font-size: 12px;
  color: #1890ff;
  font-weight: 500;
}

.toggle-btn {
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.think-content {
  padding: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: #666;
  border-top: 1px solid #e8f4fd;
  background-color: #fafcff;
}

.main-content {
  position: relative;
}

.markdown-content {
  font-size: 14px;
  line-height: 1.2;
  color: #333;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 复制按钮样式 */
.message-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #f0f0f0;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.copy-btn:hover {
  color: #1890ff;
  background-color: #f0f9ff;
  border-color: #d6ebfa;
}

.success-icon {
  color: #52c41a !important;
}

/* Markdown 样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 10px 0 5px 0;
  font-weight: 600;
  line-height: 1.5;
}

.markdown-content :deep(h1) { font-size: 20px; color: #262626; }
.markdown-content :deep(h2) { font-size: 18px; color: #262626; }
.markdown-content :deep(h3) { font-size: 16px; color: #262626; }
.markdown-content :deep(h4) { font-size: 15px; color: #262626; }
.markdown-content :deep(h5) { font-size: 14px; color: #262626; }
.markdown-content :deep(h6) { font-size: 13px; color: #595959; }

.markdown-content :deep(p) {
  margin: 2px 0 5px 0;
  line-height: 1.5;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 20px;
  margin: 0 0 -30px 0;
  line-height: 1.2;
}

.markdown-content :deep(li) {
  margin: 0 0 1px 0;
  line-height: 1.2;
}

.markdown-content :deep(blockquote) {
  margin: 8px 0;
  padding: 6px 12px;
  border-left: 3px solid #1890ff;
  background-color: #f8fbff;
  border-radius: 0 4px 4px 0;
}

.markdown-content :deep(blockquote p) {
  margin: 0;
  color: #595959;
  font-style: italic;
  line-height: 1.5;
}

.markdown-content :deep(code) {
  padding: 2px 6px;
  margin: 0 2px;
  background-color: #f6f8fa;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  color: #e74c3c;
}

.markdown-content :deep(pre) {
  margin: 6px 0;
  padding: 8px;
  background-color: #f6f8fa;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.2;
}

.markdown-content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  color: inherit;
  font-size: inherit;
}

.markdown-content :deep(table) {
  margin: 6px 0;
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;
  overflow: auto;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  font-size: 13px;
}

.markdown-content :deep(table th),
.markdown-content :deep(table td) {
  padding: 4px 8px;
  border: 1px solid #e8e8e8;
  text-align: left;
  line-height: 1.3;
}

.markdown-content :deep(table th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #262626;
}

.markdown-content :deep(table tr:nth-child(even)) {
  background-color: #fafafa;
}

.markdown-content :deep(a) {
  color: #1890ff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.markdown-content :deep(a:hover) {
  border-bottom-color: #1890ff;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 4px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.markdown-content :deep(hr) {
  margin: 12px 0;
  border: none;
  border-top: 1px solid #e8e8e8;
}

.markdown-content :deep(strong) {
  font-weight: 600;
  color: #262626;
}

.markdown-content :deep(em) {
  font-style: italic;
  color: #595959;
}

/* 代码高亮样式 */
.markdown-content :deep(.hljs) {
  background: #f6f8fa !important;
  color: #24292e;
}

.think-content :deep(.markdown-content) {
  font-size: 13px;
}

/* 动画效果 */
.think-content {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 500px;
    opacity: 1;
  }
}

/* 复制按钮动画 */
.copy-btn {
  transition: all 0.2s ease;
}

.copy-btn.success {
  color: #52c41a;
  background-color: #f6ffed;
  border-color: #b7eb8f;
}

/* 额外的紧凑样式 */
.markdown-content :deep(*:first-child) {
  margin-top: 0 !important;
}

.markdown-content :deep(*:last-child) {
  margin-bottom: 0 !important;
}

/* 内联代码更紧凑 */
.markdown-content :deep(code) {
  padding: 1px 4px;
  margin: 0 1px;
}

/* 数字列表和无序列表更紧凑 */
.markdown-content :deep(ol ol),
.markdown-content :deep(ul ul),
.markdown-content :deep(ol ul),
.markdown-content :deep(ul ol) {
  margin: 0;
  padding-left: 16px;
}
</style> 