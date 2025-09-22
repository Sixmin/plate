<template>
  <div :style="styles.layout">
    <!-- 顶部用户头部区域 -->
    <div :style="styles.header">
      <div :style="styles.headerLeft">
        <!-- 展开状态：显示 Logo 和 折叠按钮 -->
        <template v-if="!sidebarCollapsed">
          <!-- Logo 和 折叠按钮区域 -->
          <div :style="styles.headerLogo">
            <img
              src="../assets/logo/xiaoyi.jpg"
              :draggable="false"
              alt="小易AI助手"
              :style="styles.headerLogoImg"
            />
            <span :style="styles.headerLogoText">小易AI助手</span>
          </div>
          <div :style="styles.headerActions">
            <a-button
              type="text"
              :style="styles.headerCollapseBtn"
              @click="toggleSidebar"
              :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
            >
              <template #icon>
                <MenuUnfoldOutlined v-if="sidebarCollapsed" />
                <MenuFoldOutlined v-else />
              </template>
            </a-button>
          </div>
        </template>
        
                <!-- 收起状态：只显示展开按钮和新建会话按钮 -->
        <template v-else>
          <div 
            :style="styles.collapsedHeaderActions"
            @mouseenter="handleHoverAreaEnter"
            @mouseleave="handleHoverAreaLeave"
          >
            <a-button
              type="text"
              :style="styles.collapsedExpandBtn"
              @click="toggleSidebar"
              :title="'展开侧边栏'"
            >
              <template #icon>
                <MenuUnfoldOutlined />
              </template>
            </a-button>
            <a-button
              type="text"
              :style="[styles.collapsedNewChatHeaderBtn, newChatBtnHovered ? styles.collapsedNewChatHeaderBtnHover : {}]"
              @click="onAddConversation"
              @mouseenter="handleNewChatBtnHover(true)"
              @mouseleave="handleNewChatBtnHover(false)"
              :title="'新建对话'"
            >
              <PlusOutlined :style="[styles.collapsedNewChatIcon, newChatBtnHovered ? styles.collapsedNewChatIconHover : {}]" />
              <span :style="[styles.collapsedNewChatText, newChatBtnHovered ? styles.collapsedNewChatTextHover : {}]">新对话</span>
            </a-button>
          </div>
        </template>
      </div>
      <div :style="styles.headerRight">
        <UserHeader />
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div :style="styles.content">
      <!-- 收起状态下的工具栏 -->
      <!-- <div v-if="sidebarCollapsed" :style="styles.collapsedToolbar">
        <a-button
          type="text"
          :style="styles.collapsedExpandBtn"
          @click="toggleSidebar"
          @mouseenter="handleExpandBtnHover"
          @mouseleave="handleExpandBtnLeave"
          title="展开侧边栏"
        >
          <template #icon>
            <MenuUnfoldOutlined />
          </template>
        </a-button>
        <a-button
          type="text"
          :style="styles.collapsedNewChatBtn"
          @click="onAddConversation"
          title="新建对话"
        >
          <template #icon>
            <PlusOutlined />
          </template>
        </a-button>
      </div> -->
      
      <div 
        v-show="!sidebarCollapsed || sidebarHoverVisible" 
        :style="styles.menu"
        @mouseenter="handleHoverAreaEnter"
        @mouseleave="handleHoverAreaLeave"
      >
      
      
      <!-- 智能体列表区域 -->
      <div :style="styles.agentListContainer">
        <!-- 收起状态显示 -->
        <div v-if="sidebarCollapsed && !sidebarHoverVisible" :style="styles.collapsedSection" @click="toggleSidebar">
          <RobotOutlined :style="styles.collapsedIcon" />
        </div>
        <!-- 展开状态显示（包括悬停时） -->
        <template v-else>
          <!-- 新对话按钮卡片 -->
          <div 
            :style="[
              styles.newConversationCard,
              hoveredNewConversation ? styles.newConversationCardHover : {}
            ]"
            @click="onAddConversation"
            @mouseenter="hoveredNewConversation = true"
            @mouseleave="hoveredNewConversation = false"
          >
            <div :style="[styles.agentAvatar, { backgroundColor: token?.value?.colorPrimary || '#ffffff' }]">
              <PlusOutlined :style="styles.agentAvatarIcon" />
            </div>
            <div :style="styles.agentInfo">
              <div :style="styles.agentName">新对话</div>
            </div>
          </div>
          
          <div v-show="agentListExpanded" :style="styles.agentSectionContent">
            <div v-if="agentLoading" :style="styles.loadingContainer">
              <a-spin size="small" />
              <span :style="styles.loadingText">加载中...</span>
            </div>
            <div v-else-if="agentList.length === 0" :style="styles.emptyContainer">
              <span :style="styles.emptyText">暂无可用智能体</span>
            </div>
            <template v-else>
              <!-- 智能体卡片列表 -->
              <div :style="styles.agentCardContainer">
                <div 
                  v-for="(agent, index) in displayedAgents" 
                  :key="agent.agentId"
                  :style="[
                    styles.agentCard, 
                    currentAgentId === agent.agentId ? styles.agentCardActive : {},
                    hoveredAgentId === agent.agentId ? styles.agentCardHover : {}
                  ]"
                  @click="onAgentChange(agent,index)"
                  @mouseenter="hoveredAgentId = agent.agentId"
                  @mouseleave="hoveredAgentId = null"
                  :title="agent.remark"
                >
                  <!-- 智能体图标 -->
                  <div :style="[styles.agentAvatar]">
                    <component :is="getAgentIcon(agent, index)" :style="styles.agentAvatarIcon" />
                  </div>
                  
                  <!-- 智能体信息 -->
                  <div :style="styles.agentInfo">
                    <div :style="styles.agentName">{{ agent.agentName }}</div>
                  </div>
                </div>
              </div>
              
              <!-- 显示更多按钮 -->
              <div v-if="hasMoreAgents" :style="styles.showMoreContainer">
                <a-button 
                  type="text" 
                  size="small"
                  :style="styles.showMoreBtn"
                  @click="toggleShowAllAgents"
                >
                  {{ showAllAgents ? '收起' : `查看更多 (${hiddenAgentsCount})` }}
                  <template #icon>
                    <UpOutlined v-if="showAllAgents" />
                    <DownOutlined v-else />
                  </template>
                </a-button>
              </div>
            </template>
          </div>
        </template>
      </div>
      
      <!-- 工作台区域 -->
      <div :style="styles.workbenchContainer">
        <!-- 收起状态显示 -->
        <div v-if="sidebarCollapsed && !sidebarHoverVisible" :style="styles.collapsedSection" @click="toggleSidebar">
          <AppstoreOutlined :style="styles.collapsedIcon" />
        </div>
        <!-- 展开状态显示（包括悬停时） -->
        <template v-else>
          <div :style="styles.sectionHeader" @click="toggleWorkbench">
            <div :style="styles.sectionHeaderContent">
              <!-- <div :style="styles.sectionHeaderIcon">
                <AppstoreOutlined :style="styles.sectionHeaderIconInner" />
              </div> -->
              <span :style="{ fontSize: '15px' }">工作台</span>
            </div>
          </div>
          <div v-show="workbenchExpanded" :style="styles.sectionContent">
            <WorkbenchModule @navigate="handleWorkbenchNavigate" />
          </div>
        </template>
      </div>
      
      <!-- 历史对话区域 -->
      <div :style="styles.conversationsContainer">
        <!-- 收起状态显示 -->
        <div v-if="sidebarCollapsed && !sidebarHoverVisible" :style="styles.collapsedSection" @click="toggleSidebar">
          <MessageOutlined :style="styles.collapsedIcon" />
        </div>
        <!-- 展开状态显示（包括悬停时） -->
        <template v-else>
          <div :style="styles.conversationsHeader">
            <div :style="styles.sectionHeaderContent">
              <!-- <MessageOutlined :style="styles.sectionHeaderIcon" /> -->
              <span :style="{ fontSize: '15px' }">历史对话</span>
            </div>
          </div>
          <div :style="styles.conversationsContent" class="conversationsContent">
            <!-- 会话加载状态 -->
            <div v-if="conversationLoading" :style="styles.loadingContainer">
              <a-spin size="small" />
              <span :style="styles.loadingText">加载会话中...</span>
            </div>
            <!-- 无会话状态 -->
            <div v-else-if="conversationList.length === 0" :style="styles.emptyContainer">
              <span :style="styles.emptyText">暂无历史会话</span>
            </div>
            <!-- 会话列表 -->
            <div v-else :style="styles.conversationListContainer">
                            <div 
                v-for="conversation in displayedConversations" 
                :key="conversation.conversationId"
                :style="[
                  styles.conversationCard, 
                  currentConversationId === conversation.conversationId ? styles.conversationCardActive : {},
                  hoveredConversationId === conversation.conversationId ? styles.conversationCardHover : {}
                ]"
                @click="onConversationSelect(conversation)"
                @mouseenter="hoveredConversationId = conversation.conversationId"
                @mouseleave="hoveredConversationId = null"
              >
                <!-- 会话信息 -->
                <div :style="styles.conversationInfo">
                  <!-- 短信图标 -->
                  <div :style="styles.conversationIcon">
                    <MessageOutlined :style="styles.conversationIconSvg" />
                  </div>
                  
                  <!-- 编辑状态 -->
                  <div v-if="editingConversationId === conversation.conversationId" :style="styles.editTitleContainer">
                    <a-input
                      ref="editTitleInput"
                      v-model:value="editTitle"
                      :style="styles.editTitleInput"
                      size="small"
                      @blur="saveConversationTitle"
                      @keydown.enter="saveConversationTitle"
                      @keydown.esc="cancelEditTitle"
                    />
                  </div>
                  <!-- 正常显示状态 -->
                  <div v-else :style="styles.conversationTitleWrapper">
                    <div 
                      :style="styles.conversationTitle" 
                      @dblclick="startEditTitle(conversation)"
                      :title="conversation.conversationTitle || conversation.title || `会话 ${conversation.conversationId.slice(-8)}`"
                    >
                      {{ conversation.conversationTitle || conversation.title || `会话 ${conversation.conversationId.slice(-8)}` }}
                    </div>
                    <div :style="styles.conversationTime">
                      {{ formatConversationTime(conversation.updateTime || conversation.lastMessageTime || conversation.createTime) }}
                    </div>
                  </div>
                </div>
                
                <!-- 会话操作 -->
                <div :style="styles.conversationActions" @click.stop>
                  <a-dropdown>
                    <a-button type="text" size="small" :style="styles.conversationActionButton">
                      <template #icon>
                        <MoreOutlined />
                      </template>
                    </a-button>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item @click="startEditTitle(conversation)">
                          <EditOutlined />
                          重命名
                        </a-menu-item>
                        <a-menu-item @click="confirmDeleteConversation(conversation)" danger>
                          <DeleteOutlined />
                          删除
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 显示更多历史对话按钮 -->
          <div v-if="hasMoreConversations" :style="styles.showMoreContainer">
            <a-button 
              type="text" 
              size="small"
              :style="styles.showMoreBtn"
              @click="toggleShowAllConversations"
            >
              {{ showAllConversations ? '收起' : `查看更多 (${hiddenConversationsCount})` }}
              <template #icon>
                <UpOutlined v-if="showAllConversations" />
                <DownOutlined v-else />
              </template>
            </a-button>
          </div>
        </template>
      </div>
    </div>
    
      <div :style="styles.chat">
        <!-- 自定义聊天消息区域 -->
        <div :style="styles.messagesContainer">
          <!-- 调试信息 -->
          <div v-if="false" style="background: #f0f0f0; padding: 10px; margin: 10px; border-radius: 4px; font-size: 12px;">
            <div>消息数组长度: {{ messages.length }}</div>
            <div>当前会话ID: {{ currentConversationId }}</div>
            <div>当前智能体ID: {{ currentAgentId }}</div>
            <div v-if="messages.length > 0">最新消息: {{ messages[messages.length - 1]?.message?.substring(0, 50) }}...</div>
          </div>
          
          <!-- 当没有消息时显示欢迎界面 -->
          <div v-if="messages.length === 0" :style="styles.welcomeContainer">
            <div :style="styles.welcomeContent">
              <div :style="styles.welcomeIcon">
                <img 
                  src="../assets/logo/xiaoyi.jpg" 
                  :style="styles.welcomeAvatar"
                  alt="小易AI助手"
                />
              </div>
              <h3 :style="styles.welcomeTitle">您好，我是{{ currentAgent?.agentName || '小易AI助手' }}</h3>
              <p :style="styles.welcomeDesc">{{ getAgentWelcomeDesc(currentAgent) }}</p>
            </div>
          </div>
          
          <!-- 消息列表 -->
          <div v-else :style="styles.messagesList" ref="messagesContainer" class="messagesList">
            <div 
              v-for="message in messages" 
              :key="message.id"
              :style="styles.messageWrapper"
            >
              <!-- AI消息 -->
              <div v-if="message.status !== 'local'" :style="styles.aiMessageContainer">
                <!-- 移除AI头像和图标 -->
                <!-- <div :style="styles.aiAvatar">
                  <img 
                    src="../assets/logo/xiaoyi.jpg" 
                    :style="styles.avatarImage"
                    alt="小易AI助手"
                  />
                </div> -->
                <div :style="styles.aiMessageContent">
                  <div :style="styles.aiMessageBubble">
                    <!-- 加载状态 -->
                    <div v-if="message.status === 'loading'" :style="styles.loadingContainer">
                      <div :style="styles.typingIndicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span :style="styles.loadingText">正在思考中...</span>
                    </div>
                    <!-- 流式消息状态 -->
                    <div v-else-if="message.status === 'streaming'" :style="styles.messageText">
                      <AiMessageRenderer :message="message.message" />
                      <div :style="styles.streamingIndicator">
                        <span :style="styles.streamingCursor">|</span>
                      </div>
                    </div>
                    <!-- 错误状态 -->
                    <div v-else-if="message.status === 'error'" :style="[styles.messageText, styles.errorText]">
                      <AiMessageRenderer :message="message.message" />
                    </div>
                    <!-- 正常消息 -->
                    <div v-else :style="styles.messageText">
                      <AiMessageRenderer :message="message.message" />
                    </div>
                  </div>
                  <!-- 消息时间和操作 -->
                  <div v-if="message.status !== 'loading'" :style="styles.messageFooter">
                    <span :style="styles.messageTime">{{ formatTime(message.createTime) }}</span>
                    <div :style="styles.messageActions">
                      <a-button 
                        type="text" 
                        size="small" 
                        :style="styles.actionButton"
                        @click="copyMessage(message.message)"
                        title="复制"
                      >
                        <template #icon>
                          <CopyOutlined />
                        </template>
                      </a-button>
                      <a-button 
                        type="text" 
                        size="small" 
                        :style="styles.actionButton"
                        @click="regenerateMessage(message)"
                        title="重新生成"
                      >
                        <template #icon>
                          <ReloadOutlined />
                        </template>
                      </a-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 用户消息 -->
              <div v-else :style="styles.userMessageContainer">
                <div :style="styles.userMessageContent">
                  <div :style="styles.userMessageBubble">
                    <!-- 文本内容 -->
                    <div v-if="message.message" :style="styles.userMessageText">
                      {{ message.message }}
                    </div>
                    <!-- 附件显示 -->
                    <div v-if="message.files && message.files.length > 0" :style="styles.userMessageFiles">
                      <div 
                        v-for="(file, index) in message.files" 
                        :key="index"
                        :style="styles.userAttachedFile"
                      >
                        <component 
                          :is="getFileIcon(file.type)" 
                          :style="styles.userFileIcon" 
                        />
                        <div :style="styles.userFileInfo">
                          <div :style="styles.userFileName" :title="file.name">{{ file.name }}</div>
                          <div :style="styles.userFileSize">{{ formatFileSize(file.size) }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div :style="styles.userMessageFooter">
                    <!-- 错误状态 -->
                    <div v-if="message.status === 'error'" :style="styles.errorMessageContainer">
                      <ExclamationCircleOutlined :style="styles.errorIcon" :title="message.error" />
                      <span :style="styles.errorText">发送失败</span>
                      <a-button 
                        type="link" 
                        size="small" 
                        :style="styles.retryButton"
                        @click="retrySendMessage(message)"
                        title="重新发送"
                      >
                        <template #icon>
                          <ReloadOutlined />
                        </template>
                      </a-button>
                    </div>
                    <span :style="styles.messageTime">{{ formatTime(message.createTime) }}</span>
                  </div>
                </div>
                <!-- 移除用户头像 -->
                <!-- <div :style="styles.userAvatar">
                  <a-avatar :size="32" :src="authStore.avatar">
                      <template v-if="!authStore.avatar">
                          {{ (authStore.userInfo?.nickName || authStore.userName || '用户').charAt(0).toUpperCase() }}
                      </template>
                  </a-avatar>
                </div> -->
              </div>
            </div>
          </div>
        </div>
        
        <!-- 自定义输入区域 -->
        <div :style="styles.inputContainer">
          <!-- 常见问题栏 -->
          <div v-if="currentAgent && faqList.length > 0" :style="styles.faqContainer">
            <div :style="styles.faqScrollContainer" ref="faqScrollContainer">
              <div :style="styles.faqListWrapper">
                <div 
                  v-for="faq in faqList" 
                  :key="faq.questionId"
                  :style="[
                    styles.faqItem,
                    hoveredFaqId === faq.questionId ? styles.faqItemHover : {}
                  ]"
                  @click="handleFaqClick(faq)"
                  @mouseenter="hoveredFaqId = faq.questionId"
                  @mouseleave="hoveredFaqId = null"
                  :title="faq.question"
                >
                  {{ faq.question }}
                </div>
              </div>
            </div>
            <!-- 左右滑动按钮 -->
            <div v-if="showFaqScrollButtons" :style="styles.faqScrollButtons">
              <a-button 
                type="text" 
                :style="styles.faqScrollButton"
                @click="scrollFaqList('left')"
                :disabled="!canScrollLeft"
              >
                <template #icon>
                  <LeftOutlined />
                </template>
              </a-button>
              <a-button 
                type="text" 
                :style="styles.faqScrollButton"
                @click="scrollFaqList('right')"
                :disabled="!canScrollRight"
              >
                <template #icon>
                  <ArrowUpOutlined :style="{ transform: 'rotate(90deg)' }" />
                </template>
              </a-button>
            </div>
          </div>
          
          <!-- 当前智能体显示 -->
          <!-- <div v-if="currentAgent" :style="styles.currentAgentDisplay">
            <div :style="[styles.currentAgentAvatar, { backgroundColor: getAgentColor(currentAgent.agentType) }]">
              <component :is="currentAgentAvatarIcon" :style="styles.currentAgentAvatarIcon" />
            </div>
            <span :style="styles.currentAgentName">{{ currentAgent.agentName }}</span>
          </div> -->
          
          <!-- 文件列表显示 -->
          <div v-if="selectedFiles.length > 0" :style="styles.fileListContainer">
            <div 
              v-for="(file, index) in selectedFiles" 
              :key="index"
              :style="styles.fileItem"
            >
              <component 
                :is="getFileIcon(file.type)" 
                :style="styles.fileIcon" 
              />
              <div :style="styles.fileInfo">
                <div :style="styles.fileName" :title="file.name">{{ file.name }}</div>
                <div :style="styles.fileSize">{{ formatFileSize(file.size) }}</div>
              </div>
              <a-button 
                type="text" 
                :style="styles.fileRemoveBtn"
                @click="removeFile(index)"
                title="删除文件"
              >
                <template #icon>
                  <CloseOutlined />
                </template>
              </a-button>
            </div>
          </div>
          
          <!-- 文件上传进度显示 -->
          <div v-if="fileUploadLoading" :style="styles.uploadProgressContainer">
            <div :style="styles.uploadProgressHeader">
              <LoadingOutlined :style="styles.uploadProgressIcon" />
              <span :style="styles.uploadProgressText">
                正在上传文件 {{ fileUploadProgress.currentFile }} / {{ fileUploadProgress.totalFiles }}
              </span>
            </div>
            <div v-if="fileUploadProgress.fileName" :style="styles.uploadProgressFileName">
              {{ fileUploadProgress.fileName }}
            </div>
            <div :style="styles.uploadProgressBar">
              <div 
                :style="[
                  styles.uploadProgressBarFill, 
                  { 
                    width: `${(fileUploadProgress.currentFile / fileUploadProgress.totalFiles) * 100}%`,
                    backgroundColor: fileUploadProgress.status === 'error' ? '#ff4d4f' : '#1890ff'
                  }
                ]"
              ></div>
            </div>
            <div v-if="fileUploadProgress.status === 'error'" :style="styles.uploadErrorText">
              {{ fileUploadProgress.error || '上传失败' }}
            </div>
          </div>
          
          <!-- 隐藏的文件输入框 -->
          <input
            ref="fileInputRef"
            type="file"
            multiple
            :style="styles.hiddenFileInput"
            @change="handleFileSelect"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.webp"
          />
          
          <div :style="styles.inputWrapper">
            <a-textarea
              v-model:value="content"
              :style="styles.textInput"
              :auto-size="{ minRows: 1, maxRows: 8 }"
              :maxlength="550"
              placeholder="发消息，输入 @ 或选择技能"
              @keydown="handleKeydown"
              @input="handleInputChange"
            />
            <div :style="styles.inputActions">
              <!-- 左侧按钮：上传附件 -->
              <div :style="styles.inputActionsLeft">
                <a-button 
                  type="text" 
                  :style="styles.attachButton"
                  @click="triggerFileSelect"
                  title="附件"
                >
                  <template #icon>
                    <PaperClipOutlined />
                  </template>
                </a-button>
              </div>
              <!-- 右侧按钮：语音输入、发送 -->
              <div :style="styles.inputActionsRight">
                <a-button 
                  type="text" 
                  :style="[styles.voiceButton, isRecording ? { backgroundColor: '#e6f7ff', color: '#1890ff' } : {}]"
                  title="语音输入"
                  @click="handleVoiceInput"
                  :disabled="!speechSupported || speechNetworkError"
                >
                  <template #icon>
                    <AudioOutlined />
                  </template>
                </a-button>
                <a-button 
                  type="text" 
                  :style="[styles.sendButton, (content.trim() || selectedFiles.length > 0) ? styles.sendButtonActive : styles.sendButtonInactive]"
                  :loading="agentRequestLoading"
                  @click="handleSend"
                  :disabled="(!content.trim() && selectedFiles.length === 0) || agentRequestLoading"
                >
                  <template #icon>
                    <UpCircleOutlined :style="[styles.sendButtonIcon, { color: (content.trim() || selectedFiles.length > 0) ? '#ffffff' : '#d9d9d9' }]" />
                  </template>
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <LoginModal v-model:open="loginModalVisible" />
  </div>
</template>

<script setup>
import { computed, ref, watch, h, onMounted, onUnmounted, nextTick, shallowRef } from 'vue'
import { Button as AButton, Space, Badge, theme, Spin as ASpin, Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem, Textarea as ATextarea, Input as AInput, Modal, Avatar as AAvatar, message } from 'ant-design-vue'
import {
  Conversations
} from 'ant-design-x-vue'
import {
  HeartOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ReloadOutlined,
  UpOutlined,
  DownOutlined,
  MoreOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  RobotOutlined,
  AppstoreOutlined,
  MessageOutlined,
  CopyOutlined,
  SwapOutlined,
  EditOutlined,
  DeleteOutlined,
  AudioOutlined,
  CloseOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileOutlined,
  // 基于FontAwesome的智能体图标池
  CustomerServiceOutlined,
  MedicineBoxOutlined,
  BookOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  StarOutlined,
  BulbOutlined,
  ToolOutlined,
  SafetyOutlined,
  HeartFilled,
  DatabaseOutlined,
  FundOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TeamOutlined,
  SendOutlined,
  LeftOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  ArrowUpOutlined,
  UpCircleOutlined,
  // 新增FontAwesome风格图标
  ApiOutlined,
  BugOutlined,
  CodeOutlined,
  RocketOutlined,
  SlidersOutlined,
  ScanOutlined,
  DeploymentUnitOutlined,
  GatewayOutlined,
  AlertOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  FileProtectOutlined,

} from '@ant-design/icons-vue'
import { getAvailableAgents } from '@/api/agent'
import { getConversationList, getConversationMessages, renameConversation, deleteConversation, createConversation } from '@/api/conversation'
import { sendMessage, uploadMultipleFilesToDify } from '@/api/chat'
import { getAllQuickQuestions } from '@/api/quickQuestion'
import UserHeader from '@/components/UserHeader.vue'
import AiMessageRenderer from '@/components/AiMessageRenderer.vue'
import WorkbenchModule from '@/components/WorkbenchModule.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import LoginModal from '@/components/LoginModal.vue'

// 获取认证状态
const authStore = useAuthStore()

// 路由对象
const router = useRouter()

// 工作台导航处理
const handleWorkbenchNavigate = (path) => {
  console.log('工作台导航:', path)
  // 这里可以根据需要添加路由跳转或其他处理逻辑
  // 例如：router.push(path)
}

// 样式
const { token } = theme.useToken()

// 安全获取token值的辅助函数
const getTokenValue = (path, defaultValue) => {
  try {
    return token?.value?.[path] || defaultValue
  } catch (error) {
    console.warn('Token access error:', error)
    return defaultValue
  }
}

const styles = computed(() => {
  return {
    layout: {
      width: '100%',
      height: '100vh',
      borderRadius: `${getTokenValue('borderRadius', 4)}px`,
      display: 'flex',
      flexDirection: 'column',
      background: `${getTokenValue('colorBgContainer', '#fff')}`,
      fontFamily: `AlibabaPuHuiTi, ${getTokenValue('fontFamily', 'sans-serif')}, sans-serif`,
      overflow: 'auto', // 允许整体滚动
    },
    // 顶部头部样式
    header: {
      height: '60px',
      background: getTokenValue('colorBgContainer', '#fff'),
      borderBottom: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 1000,
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
    },
    // 头部左侧样式
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
    },
    // 头部标题样式
    headerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: getTokenValue('colorText', '#333'),
      marginLeft: '16px',
    },
    // 头部右侧样式
    headerRight: {
      display: 'flex',
      alignItems: 'center',
    },
    // 主要内容区域样式
    content: {
      flex: 1,
      display: 'flex',
      height: 'calc(100vh - 60px)',
      overflow: 'hidden',
      position: 'relative',
      minWidth: 0, // 允许收缩
    },
    collapsedToolbar: {
      position: 'absolute',
      top: '16px',
      left: '16px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: getTokenValue('colorBgContainer', '#fff'),
      padding: '8px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    collapsedExpandBtn: {
      width: '40px',
      height: '40px',
      padding: '0',
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: getTokenValue('colorText', '#333'),
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: getTokenValue('colorBgTextHover', '#f5f5f5'),
      },
    },
    menu: {
      // background: sidebarHoverVisible.value ? getTokenValue('colorBgContainer', '#fff') : `${getTokenValue('colorBgLayout', '#f5f5f5')}80`,
      backgroundColor: '#F3F4F6',
      width: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '60px' : '360px', // 进一步增加宽度
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: sidebarHoverVisible.value ? 'none' : 'width 0.3s ease',
      padding: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '16px 0' : '16px',
      position: sidebarHoverVisible.value ? 'absolute' : 'relative',
      left: sidebarHoverVisible.value ? '0' : 'auto',
      top: sidebarHoverVisible.value ? '0' : 'auto',
      zIndex: sidebarHoverVisible.value ? 1001 : 'auto',
      boxShadow: sidebarHoverVisible.value ? '2px 0 8px rgba(0, 0, 0, 0.15)' : 'none',
      borderRight: sidebarHoverVisible.value ? `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}` : 'none',
      flexShrink: 0, // 防止收缩
      overflowY: 'auto', // 添加滚动条
    },
    logo: {
      display: 'flex',
      height: '72px',
      alignItems: 'center',
      justifyContent: sidebarCollapsed.value ? 'center' : 'start',
      padding: sidebarCollapsed.value ? '0 8px' : '0 24px',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
    },
    'logo-img': {
      width: '45px',
      height: '45px',
      display: 'inline-block',
      borderRadius: '50%',
    },
    'logo-span': {
      display: sidebarCollapsed.value ? 'none' : 'inline-block',
      margin: '0 8px',
      fontWeight: 'bold',
      color: getTokenValue('colorText', '#333'),
      fontSize: '16px',
      transition: 'all 0.3s ease',
    },
    // Logo容器
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '72px',
      padding: sidebarCollapsed.value ? '0 8px' : '0 0 0 8px',
      borderBottom: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      transition: 'all 0.3s ease',
      marginBottom: '16px',
    },
    // Logo操作区域
    logoActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    // 折叠按钮
    collapseBtn: {
      padding: '4px',
      minWidth: 'auto',
      height: 'auto',
      display: sidebarCollapsed.value ? 'none' : 'flex',
    },
    // 收起状态下的新建对话容器
    collapsedNewChatContainer: {
      padding: '8px',
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '16px',
    },
    // 收起状态下的新建对话按钮
    collapsedNewChatBtn: {
      width: '40px',
      height: '40px',
      padding: '0',
      borderRadius: '8px',
      backgroundColor: getTokenValue('colorPrimary', '#1890ff'),
      color: 'white',
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: getTokenValue('colorPrimaryHover', '#40a9ff'),
      },
    },
    // 收起状态下的区块样式
    collapsedSection: {
      height: sidebarCollapsed.value ? '48px' : 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      margin: '8px 12px',
      borderRadius: '12px',
      // 移除背景色和边框
      backgroundColor: 'transparent',
      boxShadow: 'none',
      border: 'none',
      '&:hover': {
        backgroundColor: 'transparent',
        boxShadow: 'none',
        transform: 'translateY(-1px)',
      },
    },
    // 收起状态下的图标样式
    collapsedIcon: {
      fontSize: '20px',
      color: getTokenValue('colorPrimary', '#1890ff'),
    },
    // 智能体列表容器
    agentListContainer: {
      height: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '48px' : 'auto',
      maxHeight: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '48px' : 'none',
      margin: '0',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      transition: sidebarHoverVisible.value ? 'none' : 'all 0.3s ease',
      borderBottom: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? 'none' : `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      // paddingBottom: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '0' : '16px',
      // marginBottom: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '0' : '16px',
    },
    // 工作台容器
    workbenchContainer: {
      height: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '48px' : 'auto',
      maxHeight: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '48px' : 'none',
      margin: '0',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      // flex: 1, // 占用剩余空间
      transition: sidebarHoverVisible.value ? 'none' : 'all 0.3s ease',
      borderBottom: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? 'none' : `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      // paddingBottom: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '0' : '16px',
      // marginBottom: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '0' : '16px',
    },
    // 历史对话容器
    conversationsContainer: {
      flexShrink: 0, // 不允许收缩
      height: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '48px' : 'auto',
      margin: '0',
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      minHeight: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '48px' : '150px', // 设置最小高度
      transition: sidebarHoverVisible.value ? 'none' : 'all 0.3s ease',
      borderBottom: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? 'none' : `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      paddingBottom: (sidebarCollapsed.value && !sidebarHoverVisible.value) ? '0' : '16px',
    },
    // 通用区块标题
    sectionHeader: {
      height: '38px', // 统一行高38px
      padding: '0',
      borderBottom: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      fontSize: '14px',
      // 灰色显示
      color: '#888888',
      backgroundColor: 'transparent',
    },
    sectionHeaderContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    sectionHeaderIcon: {
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      // 移除边框和背景色
      border: 'none',
      backgroundColor: 'transparent',
    },
    sectionHeaderIconInner: {
      fontSize: '16px',
      color: '#333333',
    },
    // 通用区块内容
    sectionContent: {
      flex: 1,
      padding: '0',
      overflow: 'visible',
    },
    // 智能体区块内容
    agentSectionContent: {
      flex: 1,
      padding: '0 0 8px 0',
      overflow: 'visible',
    },
    // 标题操作按钮
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    refreshBtn: {
      padding: '2px 4px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    expandBtn: {
      padding: '2px 4px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    // 对话区域特殊样式
    conversationsHeader: {
      height: '38px', // 统一行高38px
      padding: '0',
      borderBottom: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontWeight: '500',
      fontSize: '14px',
      // 灰色显示
      color: '#888888',
      backgroundColor: 'transparent',
      cursor: 'pointer',
    },
    conversationsContent: {
      flex: 1,
      padding: '0',
      overflowY: 'auto',
      maxHeight: '400px',
    },
    newChatBtn: {
      fontSize: '12px',
      height: '24px',
      padding: '0 8px',
    },
    // 智能体相关样式
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60px',
      gap: '8px',
    },
    loadingText: {
      fontSize: '12px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    emptyContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60px',
    },
    emptyText: {
      fontSize: '12px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },

    // 工作台样式已移至WorkbenchModule组件
    // 聊天区域样式
    chat: {
      flex: 1,
      height: '100%',
      width: '100%',
      maxWidth: '924px', // 最大宽度800px
      margin: '0 auto',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      padding: `${getTokenValue('paddingLG', 24)}px`,
      gap: '16px',
      overflow: 'visible', // 移除聊天区域的滚动条
    },
    messages: {
      flex: 1,
    },
    placeholder: {
      paddingTop: '32px',
    },
    sender: {
      boxShadow: getTokenValue('boxShadow', '0 2px 8px rgba(0, 0, 0, 0.1)'),
    },
    messagesContainer: {
      flex: 1,
      padding: '16px',
      overflow: 'auto', // 启用滚动条
      display: 'flex',
      flexDirection: 'column',
    },
    welcomeContainer: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    },
    welcomeContent: {
      textAlign: 'center',
      maxWidth: '400px',
    },
    welcomeIcon: {
      marginBottom: '20px',
    },
    welcomeAvatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    },
    welcomeTitle: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '8px',
      color: getTokenValue('colorText', '#333'),
      margin: '0 0 8px 0',
    },
    welcomeDesc: {
      fontSize: '16px',
      color: getTokenValue('colorTextSecondary', '#666'),
      lineHeight: '1.5',
      margin: '0',
    },
    messagesList: {
      flex: 1,
      padding: '0 20px',
      overflow: 'auto', // 启用滚动条
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    messageWrapper: {
      animation: 'fadeInUp 0.3s ease-out',
    },
    aiMessageContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      maxWidth: '85%',
    },
    aiAvatar: {
      flexShrink: 0,
    },
    avatarImage: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      objectFit: 'cover',
    },
    aiMessageContent: {
      flex: 1,
    },
    aiMessageBubble: {
      background: '#f6f8fa',
      border: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      borderRadius: '16px 16px 16px 4px',
      padding: '12px 16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'relative',
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    typingIndicator: {
      display: 'flex',
      gap: '3px',
      '& span': {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: getTokenValue('colorPrimary', '#1890ff'),
        animation: 'typing 1.4s infinite ease-in-out',
      },
      '& span:nth-child(1)': {
        animationDelay: '0s',
      },
      '& span:nth-child(2)': {
        animationDelay: '0.2s',
      },
      '& span:nth-child(3)': {
        animationDelay: '0.4s',
      },
    },
    loadingText: {
      fontSize: '14px',
      color: getTokenValue('colorTextSecondary', '#666'),
      fontStyle: 'italic',
    },
    messageText: {
      fontSize: '14px',
      color: getTokenValue('colorText', '#333'),
      lineHeight: '1.6',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
    },
    messageFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '8px',
      opacity: 0,
      transition: 'opacity 0.2s ease',
    },
    messageTime: {
      fontSize: '12px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    messageActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    actionButton: {
      padding: '4px',
      minWidth: 'auto',
      height: 'auto',
      color: getTokenValue('colorTextSecondary', '#666'),
      fontSize: '12px',
      border: 'none',
      background: 'transparent',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: getTokenValue('colorPrimary', '#1890ff'),
        backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')}10`,
      },
    },
    userMessageContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      justifyContent: 'flex-end',
      maxWidth: '85%',
      marginLeft: 'auto',
    },
    userMessageContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
    },
    userMessageBubble: {
      background: getTokenValue('colorPrimary', '#1890ff'),
      borderRadius: '16px 16px 4px 16px',
      padding: '12px 16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    userMessageText: {
      fontSize: '14px',
      color: 'white',
      lineHeight: '1.6',
      wordBreak: 'break-word',
      whiteSpace: 'pre-wrap',
    },
    userMessageFiles: {
      marginTop: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    userAttachedFile: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '6px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    userFileIcon: {
      fontSize: '14px',
      color: 'white',
      flexShrink: 0,
    },
    userFileInfo: {
      flex: 1,
      overflow: 'hidden',
    },
    userFileName: {
      fontSize: '12px',
      color: 'white',
      fontWeight: '500',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    userFileSize: {
      fontSize: '11px',
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: '2px',
    },
    userMessageFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      marginTop: '8px',
      opacity: 0,
      transition: 'opacity 0.2s ease',
    },
    userAvatar: {
      flexShrink: 0,
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userAvatarIcon: {
      fontSize: '16px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    inputContainer: {
      backgroundColor: getTokenValue('colorBgContainer', '#fff'),
      padding: '16px',
    },
    inputWrapper: {
      position: 'relative',
      background: getTokenValue('colorBgContainer', '#fff'),
      border: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      borderRadius: '12px',
      padding: '12px 16px 40px 16px',
      transition: 'all 0.2s ease',
    },
    currentAgentDisplay: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
      padding: '4px 12px',
      backgroundColor: 'transparent',
      borderRadius: '6px',
      border: 'none',
    },
    currentAgentAvatar: {
      width: '16px',
      height: '16px',
      borderRadius: '3px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      border: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
    },
    currentAgentAvatarText: {
      fontSize: '8px',
      fontWeight: '500',
      color: 'white',
    },
    currentAgentAvatarIcon: {
      fontSize: '8px',
      color: '#333333',
    },
    currentAgentName: {
      fontSize: '11px',
      color: getTokenValue('colorTextSecondary', '#666'),
      fontWeight: '400',
    },
    textInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      resize: 'none',
      fontSize: '14px',
      lineHeight: '20px',
      color: getTokenValue('colorText', '#333'),
      backgroundColor: 'transparent',
      minHeight: '20px',
      maxHeight: '160px', // 8行 * 20px行高
      '&::placeholder': {
        color: getTokenValue('colorTextSecondary', '#666'),
      },
    },
    inputActions: {
      position: 'absolute',
      bottom: '8px',
      right: '8px',
      left: '8px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: '8px',
      flexShrink: 0,
      pointerEvents: 'none',
    },
    inputActionsLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      pointerEvents: 'auto',
    },
    inputActionsRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      pointerEvents: 'auto',
    },
    attachButton: {
      padding: '6px 8px',
      color: getTokenValue('colorTextSecondary', '#666'),
      border: 'none',
      background: 'transparent',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: getTokenValue('colorPrimary', '#1890ff'),
        backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')}10`,
      },
    },
    voiceButton: {
      padding: '6px 8px',
      color: getTokenValue('colorTextSecondary', '#666'),
      border: 'none',
      background: 'transparent',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: getTokenValue('colorPrimary', '#1890ff'),
        backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')}10`,
      },
    },
    skillsButton: {
      padding: '6px 12px',
      color: getTokenValue('colorTextSecondary', '#666'),
      border: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      background: 'transparent',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: getTokenValue('colorPrimary', '#1890ff'),
        borderColor: getTokenValue('colorPrimary', '#1890ff'),
        backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')}10`,
      },
    },
    sendButton: {
      width: '32px',
      height: '32px',
      padding: '0',
      border: 'none',
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:disabled': {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    sendButtonActive: {
      backgroundColor: getTokenValue('colorPrimary', '#1890ff'),
      borderRadius: '50%',
      '&:hover': {
        backgroundColor: getTokenValue('colorPrimary', '#1890ff'),
        opacity: 0.8,
      },
    },
    sendButtonInactive: {
      '&:hover': {
        backgroundColor: 'rgba(217, 217, 217, 0.1)',
      },
    },
    sendButtonIcon: {
      fontSize: '24px',
      color: 'inherit',
    },
    // 智能体卡片相关样式
    agentCardContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    newConversationCard: {
      height: '38px', // 与智能体卡片统一高度
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      // padding: '8px',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      boxSizing: 'border-box',
      marginBottom: '12px',
    },
    newConversationCardHover: {
      backgroundColor: `${getTokenValue('colorWhite', '#ffffff')}10`,
      transform: 'translateY(-1px)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    agentCard: {
      // height: '38px', // 设置高度38px
      lineHeight: '38px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      // padding: '8px',
      marginTop: '3px',
      borderRadius: '9px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      boxSizing: 'border-box',
    },
    agentCardHover: {
      background: '#E5E7EB',
      boxShadow: '0 0px 0px rgba(0, 0, 0, 0.15)',
    },
    agentCardActive: {
      backgroundColor: '#ffffff',
      boxShadow: '0 0px 0px rgba(0, 0, 0, 0.15)',
    },
    agentAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      border: 'none',
    },
    agentAvatarText: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: 'white',
    },
    agentAvatarIcon: {
      fontSize: '16px',
      color: '#333333',
    },
    agentInfo: {
      flex: 1,
      minWidth: 0,
    },
    agentName: {
      fontSize: '15px',
      fontWeight: '500',
      color: getTokenValue('colorText', '#333'),
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    agentType: {
      fontSize: '11px',
      color: getTokenValue('colorTextSecondary', '#666'),
      marginTop: '2px',
    },
    agentStatus: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      flexShrink: 0,
    },
    showMoreContainer: {
      marginTop: '8px',
      paddingTop: '0',
      borderTop: 'none',
    },
    showMoreBtn: {
      fontSize: '12px',
      height: '32px',
      border: 'none',
      color: getTokenValue('colorTextSecondary', '#666'),
      justifyContent: 'flex-start',
      paddingLeft: '12px',
    },
    // 当前智能体相关样式
    currentAgentBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')}05`,
      borderBottom: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      borderTop: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      borderRadius: '8px 8px 0 0',
    },
    currentAgentInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    currentAgentAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      // border: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      border: 'none'
    },
    currentAgentAvatarText: {
      fontSize: '13px',
      fontWeight: 'bold',
      color: 'white',
    },
    currentAgentAvatarIcon: {
      fontSize: '16px',
      color: '#333333',
    },
    currentAgentName: {
      fontSize: '14px',
      fontWeight: '500',
      color: getTokenValue('colorText', '#333'),
      lineHeight: '18px',
    },
    currentAgentDesc: {
      fontSize: '11px',
      color: getTokenValue('colorTextSecondary', '#666'),
      lineHeight: '14px',
    },
    currentAgentActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    switchAgentBtn: {
      padding: '4px 8px',
      minWidth: 'auto',
      height: '24px',
      color: getTokenValue('colorTextSecondary', '#666'),
      border: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      backgroundColor: getTokenValue('colorBgContainer', '#fff'),
      borderRadius: '4px',
      fontSize: '11px',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: getTokenValue('colorPrimary', '#1890ff'),
        borderColor: getTokenValue('colorPrimary', '#1890ff'),
        backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')}10`,
      },
    },
    // 会话列表相关样式
    conversationListContainer: {
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      paddingRight: '4px',
    },
    conversationCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 12px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: `1px solid transparent`,
      backgroundColor: 'transparent',
      position: 'relative',
    },
    conversationCardHover: {
      // backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')}10`,
      backgroundColor: '#E5E7EB',
      boxShadow: `0 0 0 1px ${getTokenValue('colorPrimary', '#1890ff')}20`,
    },
    conversationCardActive: {
      // backgroundColor: `${getTokenValue('colorPrimary', '#ffffff')}10`,
      backgroundColor: '#FFFFFF',
      boxShadow: `0 0 0 1px ${getTokenValue('colorPrimary', '#1890ff')}20`,
    },
    conversationInfo: {
      cursor: 'pointer',
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    conversationIcon: {
      flexShrink: 0,
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    conversationIconSvg: {
      fontSize: '14px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    conversationTitleWrapper: {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
    },
    conversationTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: getTokenValue('colorText', '#333'),
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      lineHeight: '20px',
      cursor: 'text',
      width: '100%',
    },
    conversationTime: {
      fontSize: '11px',
      color: getTokenValue('colorTextSecondary', '#666'),
      marginTop: '2px',
      lineHeight: '14px',
    },
    conversationMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',

    },
    conversationTime: {
      fontSize: '12px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    conversationCount: {
      fontSize: '12px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    conversationActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      flexShrink: 0,
      opacity: 1, // 始终显示，不再隐藏
      transition: 'opacity 0.2s ease',
    },
    conversationActionButton: {
      padding: '4px',
      minWidth: 'auto',
      height: 'auto',
      color: getTokenValue('colorTextSecondary', '#666'),
      fontSize: '16px',
      border: 'none',
      background: 'transparent',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: getTokenValue('colorPrimary', '#1890ff'),
        backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')}10`,
      },
    },
    editTitleContainer: {
      flex: 1,
      minWidth: 0,
    },
    editTitleInput: {
      fontSize: '14px',
      padding: '2px 8px',
      height: '24px',
      lineHeight: '20px',
    },
    headerLogo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    headerLogoImg: {
      width: '45px',
      height: '45px',
      borderRadius: '50%',
    },
    headerLogoText: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: getTokenValue('colorText', '#333'),
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginLeft: '16px',
    },
    headerCollapseBtn: {
      marginLeft: '140px',
      padding: '4px',
      minWidth: 'auto',
      height: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      backgroundColor: 'transparent',
      color: getTokenValue('colorText', '#333'),
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: getTokenValue('colorBgTextHover', '#f5f5f5'),
      },
    },
    // 收起状态头部操作区域
    collapsedHeaderActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    // 收起状态展开按钮
    collapsedExpandBtn: {
      width: '40px',
      height: '40px',
      padding: '0',
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: getTokenValue('colorText', '#333'),
      fontSize: '16px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: getTokenValue('colorBgTextHover', '#f5f5f5'),
      },
    },
    // 收起状态新建会话按钮（头部）
    collapsedNewChatHeaderBtn: {
      // width: 'auto !important',
      // height: '32px !important',
      // padding: '0 16px !important',
      // borderRadius: '20px !important', // 椭圆形圆角
      // backgroundColor: 'white !important', // 白色背景
      // border: `1px solid ${getTokenValue('colorPrimary', '#1890ff')} !important`, // 蓝色边框
      // fontSize: '14px !important',
      // fontWeight: '500 !important',
      // display: 'flex !important',
      // alignItems: 'center !important',
      // justifyContent: 'center !important',
      width: 'auto !important',
      height: '32px !important',
      padding: '0 16px !important',
      borderRadius: '20px !important', // 椭圆形圆角
      backgroundColor: 'white !important', // 白色背景
      border: `1px solid ${getTokenValue('colorPrimary', '#1890ff')} !important`, // 蓝色边框
      fontSize: '14px !important',
      fontWeight: '500 !important',
      display: 'flex !important',
      alignItems: 'center !important',
      justifyContent: 'center !important',

      gap: '4px',
      // transition: 'all 0.3s ease !important',
      // boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15) !important',
      transition: 'all 0.3s ease !important',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15) !important',

      '&:hover': {
        // backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')} !important`, // 悬停时蓝色背景
        backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')} !important`, // 悬停时蓝色背景
        transform: 'scale(1.05)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2) !important',
      },
    },
    collapsedNewChatIcon: {
      fontSize: '12px',
      color: getTokenValue('colorPrimary', '#1890ff'), // 默认蓝色
      transition: 'color 0.3s ease',
    },
    collapsedNewChatIconHover: {
      color: 'white', // 悬停时白色

    },
    collapsedNewChatText: {
      fontSize: '14px',
      color: getTokenValue('colorPrimary', '#1890ff'), // 默认蓝色
      fontWeight: '500',
      transition: 'color 0.3s ease',
    },
    collapsedNewChatTextHover: {
      color: 'white', // 悬停时白色
    },
    collapsedNewChatHeaderBtnHover: {
      backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')} !important`, // 悬停时蓝色背景
      borderColor: `${getTokenValue('colorPrimary', '#1890ff')} !important`,
    },
    // 文件上传相关样式
    fileListContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      marginBottom: '12px',
      maxHeight: '120px',
      overflowY: 'auto',
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: getTokenValue('colorBgContainer', '#fff'),
      border: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      borderRadius: '8px',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: getTokenValue('colorPrimary', '#1890ff'),
        backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')}05`,
      },
    },
    fileIcon: {
      fontSize: '16px',
      color: getTokenValue('colorPrimary', '#1890ff'),
      flexShrink: 0,
    },
    fileInfo: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
    },
    fileName: {
      fontSize: '13px',
      fontWeight: '500',
      color: getTokenValue('colorText', '#333'),
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    fileSize: {
      fontSize: '11px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    fileRemoveBtn: {
      padding: '4px',
      minWidth: 'auto',
      height: 'auto',
      color: getTokenValue('colorTextSecondary', '#666'),
      border: 'none',
      background: 'transparent',
      borderRadius: '4px',
      flexShrink: 0,
      fontSize: '12px',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: getTokenValue('colorError', '#ff4d4f'),
        backgroundColor: `${getTokenValue('colorError', '#ff4d4f')}10`,
      },
    },
    hiddenFileInput: {
      display: 'none',
    },
    // 流式消息指示器
    streamingIndicator: {
      display: 'inline-block',
      marginLeft: '2px',
    },
    streamingCursor: {
      display: 'inline-block',
      animation: 'blink 1s infinite',
      fontSize: '16px',
      color: getTokenValue('colorPrimary', '#1890ff'),
      fontWeight: 'bold',
    },
    // 错误消息样式
    errorText: {
      color: getTokenValue('colorError', '#ff4d4f'),
      fontStyle: 'italic',
    },
    errorMessageContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: getTokenValue('colorError', '#ff4d4f'),
      fontSize: '12px',
    },
    errorIcon: {
      fontSize: '14px',
    },
    retryButton: {
      padding: '0',
      height: 'auto',
      fontSize: '12px',
      marginLeft: '4px',
      color: getTokenValue('colorError', '#ff4d4f'),
    },
    // 常见问题栏样式
    faqContainer: {
      position: 'relative',
      marginBottom: '12px',
      padding: '0',
    },
    faqScrollContainer: {
      overflowX: 'auto',
      overflowY: 'hidden',
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      paddingBottom: '4px',
    },
    faqListWrapper: {
      display: 'flex',
      gap: '8px',
      paddingRight: '40px', // 为滚动按钮留出空间
    },
    faqItem: {
      flexShrink: 0,
      padding: '6px 12px',
      backgroundColor: getTokenValue('colorBgContainer', '#fff'),
      // border: `1px solid ${getTokenValue('colorBorder', '#d9d9d9')}`,
      borderRadius: '16px',
      fontSize: '13px',
      color: getTokenValue('colorText', '#333'),
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      maxWidth: '200px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      userSelect: 'none',
    },
    faqItemHover: {
      backgroundColor: getTokenValue('colorBgContainer', '#fff'),
      color: getTokenValue('colorPrimary', '#1890ff'),
      // boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    faqScrollButtons: {
      position: 'absolute',
      right: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      gap: '2px',
      backgroundColor: getTokenValue('colorBgContainer', '#fff'),
      borderRadius: '6px',
      padding: '2px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    faqScrollButton: {
      width: '24px',
      height: '24px',
      padding: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: getTokenValue('colorTextSecondary', '#666'),
      border: 'none',
      background: 'transparent',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      '&:hover': {
        color: getTokenValue('colorPrimary', '#1890ff'),
        backgroundColor: `${getTokenValue('colorPrimary', '#1890ff')}10`,
      },
      '&:disabled': {
        opacity: 0.4,
        cursor: 'not-allowed',
      },
    },
    uploadProgressContainer: {
      marginTop: '16px',
      padding: '8px',
      borderRadius: '4px',
      backgroundColor: getTokenValue('colorBgContainer', '#fff'),
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    },
    uploadProgressHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px',
    },
    uploadProgressIcon: {
      fontSize: '16px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    uploadProgressText: {
      fontSize: '12px',
      color: getTokenValue('colorText', '#333'),
    },
    uploadProgressFileName: {
      fontSize: '12px',
      color: getTokenValue('colorTextSecondary', '#666'),
    },
    uploadProgressBar: {
      height: '4px',
      borderRadius: '2px',
      backgroundColor: getTokenValue('colorBgLayout', '#f5f5f5'),
    },
    uploadProgressBarFill: {
      height: '4px',
      borderRadius: '2px',
    },
    uploadErrorText: {
      fontSize: '12px',
      color: getTokenValue('colorError', '#ff4d4f'),
      marginTop: '4px',
    },
  }
})

// 状态
const content = ref('')
const agentRequestLoading = ref(false)

// 文件上传相关状态
const selectedFiles = ref([])
const fileInputRef = ref(null)
const fileUploadLoading = ref(false)
const fileUploadProgress = ref({
  currentFile: 0,
  totalFiles: 0,
  fileName: '',
  status: 'idle' // idle, uploading, success, error
})

// 消息容器引用
const messagesContainer = ref(null)

// 会话相关状态
const conversationList = ref([])
const conversationLoading = ref(false)
const currentConversationId = ref(null)
const editingConversationId = ref(null)
const editTitle = ref('')
const editTitleInput = ref(null)

// 智能体相关状态
const agentListExpanded = ref(true)
const agentList = ref([])
const agentLoading = ref(false)
const currentAgentId = ref(1)
const currentAgentKey = ref('agent-1')
const currentAgentAvatarIcon = shallowRef(RobotOutlined)
const showAllAgents = ref(false)
const maxVisibleAgents = ref(4) // 修改为默认显示4个智能体
const currentAgentType = ref('') //当前agentType

// 工作台状态
const workbenchExpanded = ref(true)

// 历史对话状态
const showAllConversations = ref(false)
const maxVisibleConversations = ref(2) // 默认显示2条历史对话


// 侧边栏收起展开状态
const sidebarCollapsed = ref(false)
// 悬停显示侧边栏状态
const sidebarHoverVisible = ref(false)
// 延迟隐藏定时器
const hoverHideTimer = ref(null)
// 会话卡片悬停状态
const hoveredConversationId = ref(null)
// 智能体卡片悬停状态
const hoveredAgentId = ref(null)
// 新建对话按钮悬停状态
const newChatBtnHovered = ref(false)
// 新对话按钮悬停状态
const hoveredNewConversation = ref(false)

// 常见问题相关状态
const faqList = ref([])
const faqLoading = ref(false)
const hoveredFaqId = ref(null)
const faqScrollContainer = ref(null)
const showFaqScrollButtons = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// 登录模态框显示状态
const loginModalVisible = ref(false)

// 新增计算属性
const displayedAgents = computed(() => {
  if (showAllAgents.value) {
    return agentList.value
  }
  return agentList.value.slice(0, maxVisibleAgents.value)
})

const currentAgent = computed(() => {
  return agentList.value.find(agent => agent.agentId === currentAgentId.value)
})

const hasMoreAgents = computed(() => {
  return agentList.value.length > maxVisibleAgents.value
})

const hiddenAgentsCount = computed(() => {
  return agentList.value.length - maxVisibleAgents.value
})

// 消息管理 - 优化响应式更新
const messages = ref([])

// 优化的消息设置方法
const setMessages = (newMessages) => {
  console.log(`🔄 设置消息数组: ${newMessages.length} 条消息`)
  
  // 使用浅拷贝确保响应式更新
  messages.value = [...newMessages]
  
  // 使用nextTick确保DOM更新完成后再执行后续操作
  nextTick(() => {
    console.log(`✅ 消息已设置，当前显示: ${messages.value.length} 条消息`)
  })
}

// 新增：实时更新特定消息的方法
const updateMessageById = (messageId, updates) => {
  const messageIndex = messages.value.findIndex(m => m.id === messageId)
  if (messageIndex !== -1) {
    // 直接修改响应式数组中的对象属性
    Object.assign(messages.value[messageIndex], updates)
    
    // 强制触发响应式更新
    messages.value = [...messages.value]
    
    // 确保DOM更新后滚动
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 新增：防抖的滚动方法
let scrollTimer = null
const debouncedScrollToBottom = () => {
  if (scrollTimer) {
    clearTimeout(scrollTimer)
  }
  scrollTimer = setTimeout(() => {
    scrollToBottom()
    scrollTimer = null
  }, 50) // 50ms 防抖
}

// 历史对话显示控制
const displayedConversations = computed(() => {
  if (showAllConversations.value) {
    return conversationList.value
  }
  return conversationList.value.slice(0, maxVisibleConversations.value)
})

const hasMoreConversations = computed(() => {
  return conversationList.value.length > maxVisibleConversations.value
})

const hiddenConversationsCount = computed(() => {
  return conversationList.value.length - maxVisibleConversations.value
})

// 监听器
watch(currentConversationId, (newConversationId, oldConversationId) => {
  console.log(`🔄 currentConversationId 发生变化: ${oldConversationId} -> ${newConversationId}`)
})

watch(messages, (newMessages, oldMessages) => {
  // 当消息数量增加或最后一条消息内容变化时都要滚动
  const shouldScroll = newMessages.length > (oldMessages?.length || 0) || 
    (newMessages.length > 0 && oldMessages?.length > 0 && 
     newMessages[newMessages.length - 1]?.message !== oldMessages[oldMessages.length - 1]?.message)
  
  if (shouldScroll) {
    scrollToBottom()
  }
}, { deep: true })

// 监听用户登录状态变化，登录成功后自动刷新智能体列表
watch(() => authStore.isLoggedIn, async (newLoginStatus, oldLoginStatus) => {
  console.log(`🔑 用户登录状态发生变化: ${oldLoginStatus} -> ${newLoginStatus}`)
  
  // 当用户从未登录状态变为已登录状态时，自动刷新智能体列表
  if (!oldLoginStatus && newLoginStatus) {
    console.log('🔄 用户登录成功，开始自动刷新智能体列表...')
    
    try {
      await loadAgents()
      console.log('✅ 智能体列表刷新成功')
    } catch (error) {
      console.error('❌ 智能体列表刷新失败:', error)
    }
    try{
      // 等待会话列表加载完成后，自动选择最新的历史对话
      if (conversationList.value.length > 0) {
        console.log('🎯 自动选择最新对话:', conversationList.value[0])
        await onConversationSelect(conversationList.value[0])
      }
    }catch (error) {
      console.error('❌ 历史消息加载失败:', error)
    }
  }
}, { immediate: false })

// 生命周期
onMounted(async () => {
  await loadAgents()
  
  // 检查是否需要显示登录模态框（来自路由重定向）
  if (router.currentRoute.value.query.showLogin === 'true') {
    loginModalVisible.value = true
    // 清除 query 参数，避免刷新页面时重复显示
    router.replace({ path: '/', query: {} })
  }
  
  // 如果有智能体，默认选择第一个并加载最新对话
  if (agentList.value.length > 0) {
    // console.log('🎯 页面加载完成，自动选择第一个智能体:', agentList.value[0])
    // await onAgentChange(agentList.value[0],0)
    
    // 等待会话列表加载完成后，自动选择最新的历史对话
    if (conversationList.value.length > 0) {
      console.log('🎯 自动选择最新对话:', conversationList.value[0])
      await onConversationSelect(conversationList.value[0])
    }
  }
  
  // 添加响应式监听
  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('resize', handleFaqResize)
  
  // 监听常见问题滚动容器的滚动事件
  nextTick(() => {
    if (faqScrollContainer.value) {
      faqScrollContainer.value.addEventListener('scroll', updateScrollButtonStates)
    }
  })

  // 检查浏览器是否支持Web Speech API
  speechSupported.value = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
})

onUnmounted(() => {
  // 清理定时器
  if (hoverHideTimer.value) {
    clearTimeout(hoverHideTimer.value)
    hoverHideTimer.value = null
  }
  
  
  // 移除响应式监听
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('resize', handleFaqResize)
  
  // 移除常见问题滚动监听
  if (faqScrollContainer.value) {
    faqScrollContainer.value.removeEventListener('scroll', updateScrollButtonStates)
  }
})

// 响应式处理
const handleResize = () => {
  const windowWidth = window.innerWidth
  // 当窗口宽度小于 1200px 时自动收起侧边栏
  if (windowWidth < 1200) {
    sidebarCollapsed.value = true
  } else if (windowWidth >= 1400) {
    // 当窗口宽度大于 1400px 时自动展开侧边栏
    sidebarCollapsed.value = false
  }
}

// 事件处理

// 新建对话按钮悬停处理
const handleNewChatBtnHover = (isHovered) => {
  newChatBtnHovered.value = isHovered
}

const onAddConversation = async () => {
  if (!currentAgentId.value) {
    console.warn('请先选择智能体')
    return
  }
  
  try {
    console.log('🆕 准备创建新会话...')
    
    // 清空当前会话和消息
    currentConversationId.value = null
    setMessages([])
    
    console.log('✅ 新会话准备完成，等待用户发送第一条消息时自动创建')
    
    // 显示欢迎消息
    const welcomeMessage = {
      id: Date.now(),
      message: getAgentWelcomeDesc(currentAgent.value),
      status: 'success',
      createTime: Date.now()
    }
    
    setMessages([welcomeMessage])
    
  } catch (error) {
    console.error('准备新会话失败:', error)
  }
}



// 侧边栏相关方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  // 切换时清除悬停状态
  sidebarHoverVisible.value = false
}

// 悬停相关方法
// 统一的悬停区域进入处理
const handleHoverAreaEnter = () => {
  if (sidebarCollapsed.value) {
    // 清除之前的隐藏定时器
    if (hoverHideTimer.value) {
      clearTimeout(hoverHideTimer.value)
      hoverHideTimer.value = null
    }
    sidebarHoverVisible.value = true
  }
}

// 统一的悬停区域离开处理
const handleHoverAreaLeave = () => {
  // 只有在侧边栏收起状态下才处理离开事件
  if (sidebarCollapsed.value) {
    // 延迟隐藏，给用户时间移动到侧边栏区域
    hoverHideTimer.value = setTimeout(() => {
      sidebarHoverVisible.value = false
      hoverHideTimer.value = null
    }, 100) // 100ms 延迟，足够用户移动鼠标
  }
}

// 保留原有方法以防兼容性问题
const handleExpandBtnHover = () => {
  handleHoverAreaEnter()
}

const handleExpandBtnLeave = () => {
  // 不立即隐藏，让用户有时间移动到侧边栏区域
  // 实际的隐藏逻辑由统一的 handleHoverAreaLeave 处理
}

const handleSidebarHover = () => {
  handleHoverAreaEnter()
}

const handleSidebarLeave = () => {
  handleHoverAreaLeave()
}

// 智能体相关方法
const toggleAgentList = () => {
  agentListExpanded.value = !agentListExpanded.value
}

// 工作台相关方法
const toggleWorkbench = () => {
  workbenchExpanded.value = !workbenchExpanded.value
}


// 智能体选择处理
const onAgentChange = async (agent,index) => {
  console.log('🔄 开始切换智能体:', agent)
  currentAgentType.value= agent.agentType
  console.log('currentAgentType======>',currentAgentType.value)
  // 如果选择的是当前智能体，则不做任何操作
  if (currentAgentId.value === agent.agentId) {
    console.log('⚠️ 选择的是当前智能体，不执行切换')
    return
  }

  // 更新当前智能体
  const previousAgentId = currentAgentId.value
  currentAgentKey.value = `agent-${agent.agentId}`
  currentAgentId.value = agent.agentId
  currentAgentAvatarIcon.value = getAgentIcon(agent, index)
  
  // 清空当前对话和会话选择
  setMessages([])
  currentConversationId.value = null
  
  // 加载该智能体的会话列表
  console.log(`📋 正在加载智能体${agent.agentId}的会话列表...`)
  await loadConversationList(agent.agentId)
  
  // 加载该智能体的常见问题
  console.log(`❓ 正在加载智能体${agent.agentId}的常见问题...`)
  await loadAgentFaqs(agent.agentId)
  
  // 自动选择最新的历史会话
  if (conversationList.value.length > 0) {
    console.log('🎯 自动选择最新会话:', conversationList.value[0])
    await onConversationSelect(conversationList.value[0])
  }
  
  // 显示切换提示
  console.log(`✅ 智能体已切换: ${agent.agentName} (${getAgentTypeText(agent.agentType)})，加载到 ${conversationList.value.length} 个历史会话，${faqList.value.length} 个常见问题`)
}

// 新增方法
const toggleShowAllAgents = () => {
  showAllAgents.value = !showAllAgents.value
}

const toggleShowAllConversations = () => {
  showAllConversations.value = !showAllConversations.value
}

const scrollToAgentList = () => {
  // 如果侧边栏已收起，则展开
  if (sidebarCollapsed.value) {
    sidebarCollapsed.value = false
  }
  
  // 如果智能体列表已收起，则展开
  if (!agentListExpanded.value) {
    agentListExpanded.value = true
  }
  
  // 滚动到智能体列表区域（可选实现）
  // 这里可以添加滚动逻辑
}

// 智能体列表错误提示只弹一次
let agentListErrorNotified = false

const loadAgents = async () => {
  agentListErrorNotified = false // 每次加载前重置
  try {
    agentLoading.value = true
    // 调用真实的API接口获取智能体列表
    const response = await getAvailableAgents()
    if (response.code === 200) {
      // 根据接口文档，数据在rows字段中
      const agents = response.rows || []
      
      // 格式化智能体数据，确保数据结构一致
      agentList.value = agents.map(agent => ({
        agentId: agent.agentId,
        agentName: agent.agentName || '未命名智能体',
        agentCode: agent.agentCode,
        agentType: agent.agentType || 'chatbot',
        status: agent.status || 1,
        remark: agent.remark || '',
        sortOrder: agent.sortOrder || 0,
        difyAppId: agent.difyAppId,
        difyBaseUrl: agent.difyBaseUrl,
        createTime: agent.createTime,
        updateTime: agent.updateTime
      })).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) // 按排序字段排序
      
      // 设置默认选中第一个智能体
      if (agentList.value.length > 0) {
        currentAgentId.value = agentList.value[0].agentId
        currentAgentKey.value = `agent-${agentList.value[0].agentId}`
        currentAgentType.value = agentList.value[0].agentType
        // 加载默认智能体的会话列表
        await loadConversationList(agentList.value[0].agentId)
        
        // 加载默认智能体的常见问题
        await loadAgentFaqs(agentList.value[0].agentId)
      }
      
      console.log('智能体列表加载成功:', agentList.value.length + '个智能体')
    } else {
      // 优化错误提示
      if (!agentListErrorNotified) {
        agentListErrorNotified = true
        let msg = response.msg || ''
        if (msg.includes('timeout')) {
          message.error('请求超时，请检查网络连接后重试')
        } else if (msg.includes('denied') || msg.includes('unauthorized') || response.code === 401) {
          message.error('无权限访问智能体列表，请重新登录')
        } else if (msg.includes('not found') || response.code === 404) {
          message.error('未找到智能体服务，请联系管理员')
        } else if (msg.includes('服务器') || msg.includes('server') || response.code === 500) {
          message.error('智能体服务暂时不可用，请稍后重试或联系管理员')
        } else {
          message.error('获取智能体列表失败，请稍后重试或联系管理员')
        }
      }
      // 显示空状态而不是使用模拟数据
      agentList.value = []
    }
  } catch (error) {
    if (!agentListErrorNotified) {
      agentListErrorNotified = true
      if (error.message && (error.message.includes('timeout') || error.message.includes('Network'))) {
        message.error('网络连接异常，请检查您的网络后重试')
      } else if (error.message && error.message.includes('401')) {
        message.error('登录状态已失效，请重新登录')
      } else {
        message.error('获取智能体列表失败，请稍后重试或联系管理员')
      }
    }
    // 网络错误时使用少量模拟数据作为降级方案
    agentList.value = [
      { 
        agentId: 1, 
        agentName: '小易AI助手', 
        agentCode: 'xiaoyi-default',
        agentType: 'chatbot', 
        status: 1, 
        remark: '通用医疗咨询助手',
        sortOrder: 1
      },
      { 
        agentId: 2, 
        agentName: '医疗政策助手', 
        agentCode: 'medical-policy',
        agentType: 'chatbot', 
        status: 1, 
        remark: '专业政策解读',
        sortOrder: 2
      },
      { 
        agentId: 3, 
        agentName: '文档分析助手', 
        agentCode: 'document-analysis',
        agentType: 'workflow', 
        status: 1, 
        remark: '文档智能分析工作流',
        sortOrder: 3
      }
    ]
    currentAgentKey.value = 'agent-1'
    currentAgentId.value = 1
  } finally {
    agentLoading.value = false
  }
}

const getAgentColor = (agentType) => {
  // 返回白色背景，配合黑色图标
  return '#ffffff'
}

const getAgentTypeText = (agentType) => {
  // 支持数字类型（兼容模拟数据）
  const numericTypes = {
    1: '聊天型',
    2: '工作流型',
  }
  
  // 支持字符串类型（真实接口数据）
  const stringTypes = {
    'chatbot': '聊天型',
    'workflow': '工作流型',
    'completion': '文本生成型',
    'agent': '智能体型',
  }
  
  return stringTypes[agentType] || numericTypes[agentType] || '未知类型'
}

const getAgentWelcomeDesc = (agent) => {
  if (!agent) {
    return '基于先进的AI技术，为您提供专业的医疗咨询服务'
  }
  
  // 根据智能体名称提供个性化描述
  const agentName = agent.agentName || ''
  
  // 根据智能体名称匹配个性化描述
  if (agentName.includes('医疗') || agentName.includes('医生') || agentName.includes('护士')) {
    return '专业的医疗智能助手，为您提供健康咨询和医疗指导服务'
  } else if (agentName.includes('政策') || agentName.includes('制度')) {
    return '专业的政策解读助手，为您提供医院制度和规定的详细说明'
  } else if (agentName.includes('诊断') || agentName.includes('病理')) {
    return '专业的诊断分析助手，协助医生进行病情分析和诊断建议'
  } else if (agentName.includes('V2.0') || agentName.includes('升级')) {
    return '全新升级的智能助手，具备更强的理解能力和专业知识'
  } else if (agentName.includes('小易')) {
    return '您的贴心智能助手，随时为您提供专业的医疗咨询服务'
  } else {
    // 根据智能体类型提供描述
    const agentType = getAgentTypeText(agent.agentType)
    switch (agentType) {
      case '聊天型':
        return '智能对话助手，通过自然语言交流为您提供专业服务'
      case '工作流型':
        return '智能流程助手，帮助您高效完成各种工作任务'
      case '文本生成型':
        return '智能写作助手，为您提供专业的文档生成和编辑服务'
      case '智能体型':
        return '多功能智能助手，具备强大的推理和解决问题的能力'
      default:
        return '基于先进的AI技术，为您提供专业的智能服务'
    }
  }
}

// 已移除原有的onWorkbenchItemClick方法，现在使用WorkbenchModule组件处理

// 输入处理方法
const handleKeydown = (event) => {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Shift+Enter 换行，检查行数限制
      event.preventDefault()
      const lines = content.value.split('\n')
      if (lines.length < 8) {
        content.value += '\n'
      }
    } else {
      // 单独 Enter 发送消息
      event.preventDefault()
      if (content.value.trim()) {
        handleSend()
      }
    }
  }
}

const handleEnterKey = () => {
  if (!content.value.trim()) return
  handleSend()
}

const handleShiftEnter = () => {
  // Shift+Enter 换行，检查行数限制
  const lines = content.value.split('\n')
  if (lines.length < 8) {
    content.value += '\n'
  }
}

const handleInputChange = () => {
  // 限制最大行数为8行
  const lines = content.value.split('\n')
  if (lines.length > 8) {
    content.value = lines.slice(0, 8).join('\n')
  }
}

const handleSend = async () => {
  if ((!content.value.trim() && selectedFiles.value.length === 0) || agentRequestLoading.value) return
  // 检查是否登录
  if (!authStore.isLoggedIn) {
    message.warning('请先登录后再发送消息')
    loginModalVisible.value = true
    return
  }
  
  // 检查是否选择了智能体
  if (!currentAgentId.value) {
    console.warn('请先选择智能体')
    return
  }
  
  const messageContent = content.value.trim()
  const filesToSend = [...selectedFiles.value]
  content.value = ''
  selectedFiles.value = []
  agentRequestLoading.value = true
  
  try {
    console.log('📤 开始发送消息:', {
      agentId: currentAgentId.value,
      conversationId: currentConversationId.value,
      message: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : ''),
      filesCount: filesToSend.length
    })
    
    // 处理文件上传
    let uploadedFiles = []
    if (filesToSend.length > 0) {
      console.log('📁 检测到附件，开始上传文件...')
      fileUploadLoading.value = true
      
      try {
        // 获取当前用户信息用于文件上传
        const currentUser = authStore.userInfo
        const userId = currentUser?.userId || currentUser?.userName || 'anonymous'
        
        console.log('agentid=======>',currentAgentId.value)
        // 批量上传文件
        const uploadResults = await uploadMultipleFilesToDify(
          filesToSend, 
          currentAgentType.value, 
          currentAgentId.value,
          // 上传进度回调
          (progress) => {
            fileUploadProgress.value = progress
            console.log('📊 文件上传进度:', progress)
          }
        )
        
        // 筛选上传成功的文件
        uploadedFiles = uploadResults
          .filter(result => result.success)
          .map(result => ({
            file_id: result.fileId,
            name: result.fileName,
            type: result.file.type,
            size: result.file.size,
            url: result.data?.url || '',
            original_data: result.data
          }))
        
        console.log(`✅ 文件上传完成: ${uploadedFiles.length}/${filesToSend.length} 成功`)
        
        // 检查是否有上传失败的文件
        const failedFiles = uploadResults.filter(result => !result.success)
        if (failedFiles.length > 0) {
          console.warn('⚠️ 部分文件上传失败:', failedFiles.map(f => f.fileName))
          // 显示用户友好的错误提示
          Modal.warning({
            title: '文件上传提醒',
            content: `${failedFiles.length} 个文件上传失败：${failedFiles.map(f => f.fileName).join(', ')}。已成功上传的文件将正常发送。`,
            okText: '知道了'
          })
        }
        
      } catch (uploadError) {
        console.error('💥 文件上传失败:', uploadError)
        // 文件上传失败但仍然可以发送文本消息
        uploadedFiles = []
        
        // 显示用户友好的错误提示
        Modal.error({
          title: '文件上传失败',
          content: `文件上传过程中发生错误：${uploadError.message || '网络连接异常'}。您的文本消息将正常发送，请稍后重试上传文件。`,
          okText: '知道了'
        })
      } finally {
        fileUploadLoading.value = false
        fileUploadProgress.value = {
          currentFile: 0,
          totalFiles: 0,
          fileName: '',
          status: 'idle'
        }
      }
    }
    
    // 添加用户消息到界面
    const userMessageId = Date.now() + Math.random();
    const userMessage = {
      id: userMessageId,
      message: messageContent,
      status: 'local',
      createTime: Date.now(),
      files: uploadedFiles.length > 0 ? uploadedFiles : null // 添加文件信息
    }
    
    const currentMessages = [...messages.value, userMessage]
    setMessages(currentMessages)
    
    // 滚动到底部显示用户消息
    scrollToBottom()
    
    // 添加AI消息占位符（用于流式更新）
    const aiMessageId = Date.now() + Math.random() + 1
    const aiMessage = {
      id: aiMessageId,
      message: '',
      status: 'loading',
      createTime: Date.now()
    }
    
    setMessages([...currentMessages, aiMessage])
    
    
    // 滚动到底部显示AI消息占位符
    scrollToBottom()
    
    // 获取当前用户信息
    const currentUser = authStore.userInfo
    const userId = currentUser?.userId || currentUser?.userName || 'anonymous'
    
    // 用于累积流式响应的消息内容
    let accumulatedMessage = ''
    let responseConversationId = null
    let responseMessageId = null
    
    // 发送流式消息
    await sendMessage({
      interfaceName: "chat-messages",
      agentType: currentAgentType.value,
      agentId: currentAgentId.value,
      params:{
        inputs: {}, 
        query: messageContent, 
        response_mode: "streaming", 
        // response_mode: "blocking", 
        conversation_id: currentConversationId.value, 
        user: userId, 
        files: uploadedFiles // 传递上传成功的文件
      }
    }, 
    // onMessage 回调 - 处理流式数据
    (eventData) => {
      console.log('📥 处理流式数据:', eventData)
      
      try {
        // 处理会话ID
        if (eventData.conversation_id && !currentConversationId.value) {
          responseConversationId = eventData.conversation_id
          console.log('🆕 获取到会话ID:', responseConversationId)
        }
        
        // 处理消息ID
        if (eventData.message_id && !responseMessageId) {
          responseMessageId = eventData.message_id
        }
        
        // 处理流式内容
        let deltaContent = ''
        
        // 多种方式提取增量内容
        if (eventData.answer) {
          deltaContent = eventData.answer
        } else if (eventData.data && eventData.data.answer) {
          deltaContent = eventData.data.answer
        } else if (eventData.delta && eventData.delta.answer) {
          deltaContent = eventData.delta.answer
        } else if (eventData.content) {
          deltaContent = eventData.content
        } else if (eventData.text) {
          deltaContent = eventData.text
        }
        
        if (deltaContent) {
          
          // 累积内容
          accumulatedMessage += deltaContent
          console.log('🔄 累积流式内容，当前长度:', accumulatedMessage.length, '增量:', deltaContent.substring(0, 50))
          
          // 使用优化的更新方法实时更新AI消息内容
          updateMessageById(aiMessageId, {
            message: accumulatedMessage,
            status: 'streaming'
          })
        }
        
        // 处理其他事件类型
        if (eventData.event === 'message' && eventData.data) {
          const data = eventData.data
          let eventDeltaContent = ''
          
          if (data.answer) {
            eventDeltaContent = data.answer
          } else if (data.content) {
            eventDeltaContent = data.content
          } else if (data.text) {
            eventDeltaContent = data.text
          }
          
          if (eventDeltaContent) {
            accumulatedMessage += eventDeltaContent
            console.log('🔄 处理事件消息，累积长度:', accumulatedMessage.length)
            
            // 使用优化的更新方法更新消息显示
            updateMessageById(aiMessageId, {
              message: accumulatedMessage,
              status: 'streaming'
            })
          }
        }
        
      } catch (parseError) {
        console.warn('⚠️ 处理流式数据失败:', parseError)
      }
    },
    // onError 回调 - 处理错误
    (error) => {
      console.error('💥 流式响应错误:', error)
      
      
      // 更新AI消息为错误状态
      const updatedMessages = [...messages.value]
      const aiMessageIndex = updatedMessages.findIndex(m => m.id === aiMessageId)
      
      if (aiMessageIndex !== -1) {
        updatedMessages[aiMessageIndex] = {
          ...updatedMessages[aiMessageIndex],
          message: accumulatedMessage || '抱歉，获取回复时出现错误，请稍后再试。',
          status: 'error'
        }
        setMessages(updatedMessages)
      }
    },
    // onComplete 回调 - 处理完成
    () => {
      console.log('✅ 流式响应完成，累积消息长度:', accumulatedMessage.length)
      
      
      // 更新AI消息为成功状态
      const updatedMessages = [...messages.value]
      const aiMessageIndex = updatedMessages.findIndex(m => m.id === aiMessageId)
      
      if (aiMessageIndex !== -1) {
        // 只有在确实有内容时才更新，避免覆盖已有内容
        if (accumulatedMessage.trim()) {
          updatedMessages[aiMessageIndex] = {
            ...updatedMessages[aiMessageIndex],
            message: accumulatedMessage,
            status: 'success',
            messageId: responseMessageId
          }
        } else {
          // 如果没有累积消息但已有内容，只更新状态
          updatedMessages[aiMessageIndex] = {
            ...updatedMessages[aiMessageIndex],
            status: 'success',
            messageId: responseMessageId
          }
        }
        setMessages(updatedMessages)
        scrollToBottom()
      }
      
      // 处理新会话创建
      if (responseConversationId && !currentConversationId.value) {
        currentConversationId.value = responseConversationId
        console.log('🆕 新会话已创建:', currentConversationId.value)
        
        // 添加新会话到会话列表
        const newConversation = {
          conversationId: responseConversationId,
          conversationTitle: messageContent.length > 20 ? messageContent.substring(0, 20) + '...' : messageContent,
          title: messageContent.length > 20 ? messageContent.substring(0, 20) + '...' : messageContent,
          agentId: currentAgentId.value,
          agentName: currentAgent.value?.agentName || '智能体',
          messageCount: 2,
          status: 1,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          lastMessageTime: new Date().toISOString()
        }
        
        // 添加到会话列表顶部
        conversationList.value.unshift(newConversation)
      }
      
      // 更新现有会话的信息
      if (currentConversationId.value) {
        const conversation = conversationList.value.find(c => c.conversationId === currentConversationId.value)
        if (conversation) {
          conversation.updateTime = new Date().toISOString()
          conversation.lastMessageTime = new Date().toISOString()
          conversation.messageCount = (conversation.messageCount || 0) + 2 // 用户消息 + AI消息
        }
      }
    })
    
    console.log('📡 流式消息发送完成')
    
  } catch (error) {
    console.error('💥 发送消息异常:', error)
    
    const updatedMessages = [...messages.value]
    
    // 定位用户消息并更新状态
    const userMessageIndex = updatedMessages.findIndex(m => m.id === userMessageId);
    if (userMessageIndex !== -1) {
        updatedMessages[userMessageIndex] = {
            ...updatedMessages[userMessageIndex],
            status: 'error',
            error: error.message || '发送失败，请检查网络连接'
        };
    }

    // 移除AI加载占位符并触发更新
    const finalMessages = updatedMessages.filter(m => m.status !== 'loading' && m.status !== 'streaming');
    setMessages(finalMessages);

  } finally {
    agentRequestLoading.value = false
  }
}

// 重新发送消息
const retrySendMessage = async (message) => {
  console.log('🔄 准备重试发送消息:', message.id)

  // 1. 将原错误消息从列表中移除
  const newMessages = messages.value.filter(m => m.id !== message.id)
  setMessages(newMessages)

  // 2. 重新整理要发送的内容和文件
  content.value = message.message
  selectedFiles.value = message.files || []

  // 3. 调用 handleSend 重新发送
  await handleSend()
}

// 时间格式化
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 如果是今天
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  // 如果是昨天
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  if (date.getDate() === yesterday.getDate()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  // 其他情况显示完整日期
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 复制消息
const copyMessage = async (message) => {
  try {
    await navigator.clipboard.writeText(message)
    console.log('消息已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = message
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      console.log('消息已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
    document.body.removeChild(textArea)
  }
}

// 重新生成消息
const regenerateMessage = async (message) => {
  // 找到用户的上一条消息
  const messageIndex = messages.value.findIndex(m => m.id === message.id)
  if (messageIndex > 0) {
    const userMessage = messages.value[messageIndex - 1]
    if (userMessage && userMessage.status === 'local') {
      // 移除当前AI消息
      const newMessages = messages.value.filter(m => m.id !== message.id)
      setMessages(newMessages)
      
      // 重新发送用户消息
      content.value = userMessage.message
      await handleSend()
    }
  }
}

// 会话相关方法
/**
 * 加载指定智能体的会话列表
 * @param {number} agentId - 智能体ID
 */
const loadConversationList = async (agentId) => {
  // 参数校验：如果没有智能体ID，直接返回
  if (!agentId) return
  
  try {
    // 设置加载状态为true，显示加载中UI
    conversationLoading.value = true
    
    // 获取当前登录用户信息，用于API请求
    const currentUser = authStore.userInfo
    const userId = currentUser?.userId || currentUser?.userName || 'anonymous'
    console.log('🔄 当前agentType:', currentAgentType.value)
    
    // 调用API获取会话列表
    const response = await getConversationList({
      interfaceName: "conversations",    // 接口名称
      agentType: currentAgentType.value, // 智能体类型（chatbot/workflow等）
      agentId: agentId,                  // 智能体ID
      params: {
        user: userId,     // 用户ID
        last_id: "",      // 分页参数（最后一条记录的ID）
        limit: 20         // 每页显示数量
      }
    })
    
    // 检查API响应是否成功
    if (response.code === 200) {
      // 从响应中提取会话数据，兼容多种数据结构
      const conversationsData = response.data?.data?.data || response.data?.conversations || response.rows || []
      console.log('📥 原始会话数据:', conversationsData)
      
      // 将后端数据转换为前端需要的格式
      conversationList.value = conversationsData.map(conv => {
        // 步骤1：尝试从多个字段中获取第一个用户问题
        let firstQuestion = ''
        if (conv.first_user_message) {
          // 优先使用后端直接提供的第一个用户消息
          firstQuestion = conv.first_user_message
        } else if (conv.inputs && conv.inputs.query) {
          // 其次使用inputs中的query字段
          firstQuestion = conv.inputs.query
        } else if (conv.name && conv.name !== 'New conversation') {
          // 最后使用会话名称（排除默认的"New conversation"）
          firstQuestion = conv.name
        }
        
        // 步骤2：处理会话标题的长度和脱敏
        let displayTitle = ''
        if (firstQuestion && typeof firstQuestion === 'string') {
          // 如果有第一个问题且是字符串，则截取前15个字符
          displayTitle = firstQuestion.length > 15 ? firstQuestion.slice(0, 15) + '...' : firstQuestion
        } else {
          // 如果没有第一个问题，则使用默认格式：会话 + ID后8位
          displayTitle = `会话 ${conv.id.slice(-8)}`
        }
        
        // 步骤3：构造前端需要的会话对象
        return {
          conversationId: conv.id,                                    // 会话ID
          conversationTitle: displayTitle,                            // 显示标题
          title: displayTitle,                                        // 兼容性字段
          agentId: agentId,                                          // 所属智能体ID
          agentName: currentAgent.value?.agentName || '智能体',        // 智能体名称
          messageCount: 0,                                           // 消息数量（暂时设为0）
          status: conv.status === 'normal' ? 1 : 0,                  // 会话状态
          createTime: new Date(conv.created_at * 1000).toISOString(), // 创建时间（转换为ISO格式）
          updateTime: new Date(conv.updated_at * 1000).toISOString(), // 更新时间
          lastMessageTime: new Date(conv.updated_at * 1000).toISOString(), // 最后消息时间
          introduction: conv.introduction || '',                      // 会话介绍
          inputs: conv.inputs || {},                                 // 输入参数
          originalData: conv                                         // 保存原始数据供调试使用
        }
      })
      
      // 按创建时间倒序排列，确保最新的会话在前面
      conversationList.value.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      
      // 【核心功能】异步补全会话名：如果会话名是默认格式，则加载第一个用户消息作为会话名
      conversationList.value.forEach(async (conv) => {
        // 判断条件：会话名以"会话 "开头或以"..."开头（说明是默认生成的，需要补全）
        if (conv.conversationTitle.startsWith('会话 ') || conv.conversationTitle.startsWith('...')) {
          try {
            // 异步获取该会话的历史消息（只取前10条以提高性能）
            const msgResp = await getConversationMessages({
              interfaceName: "messages",
              agentType: currentAgentType.value,
              agentId: agentId,
              params: {
                user: userId,
                conversation_id: conv.conversationId,
                first_id: "",
                limit: 5  // 只取前10条消息，足够找到第一个用户消息
              }
            });
            
            // 从响应中提取消息数据，兼容多种数据结构
            let messageData = null;
            if (msgResp.data?.data?.data) {
              messageData = msgResp.data.data.data;
            } else if (msgResp.data?.data) {
              messageData = msgResp.data.data;
            } else if (msgResp.data?.messages) {
              messageData = msgResp.data.messages;
            } else if (msgResp.data) {
              messageData = msgResp.data;
            } else if (msgResp.rows) {
              messageData = msgResp.rows;
            }
            
            // 如果成功获取到消息数组
            if (Array.isArray(messageData)) {
              // 查找第一个用户消息（兼容多种消息格式）
              const firstUserMsg = messageData.find(m => {
                if (m.role === 'user' && m.content) return true;  // 标准格式：role为user且有content
                if (m.query) return true;                         // 有query字段
                if (m.input) return true;                         // 有input字段
                if (m.question) return true;                      // 有question字段
                if (m.content) return true;                       // 有content字段
                return false;
              });
              
              // 提取用户消息的文本内容
              let userText = '';
              if (firstUserMsg) {
                if (firstUserMsg.content) userText = firstUserMsg.content;
                else if (firstUserMsg.query) userText = firstUserMsg.query;
                else if (firstUserMsg.input) userText = firstUserMsg.input;
                else if (firstUserMsg.question) userText = firstUserMsg.question;
              }
              
              // 如果找到了用户消息文本，则更新会话标题
              if (userText) {
                // 同样截取前15个字符，超出部分用...表示
                const newTitle = userText.length > 15 ? userText.slice(0, 15) + '...' : userText;
                // 更新会话对象的标题字段
                conv.conversationTitle = newTitle;
                conv.title = newTitle;
              }
            }
          } catch (e) {
            // 如果获取消息失败，忽略异常，保持原有标题不变
            // 这样不会影响整体的会话列表加载
          }
        }
      });
      
      console.log(`✅ 加载智能体${agentId}的会话列表成功:`, conversationList.value.length + '个会话')
      console.log('转换后的会话列表数据:', conversationList.value)
    } else {
      // API响应失败，打印警告并清空列表
      console.warn('❌ 获取会话列表失败:', response.msg)
      conversationList.value = []
    }
  } catch (error) {
    // 网络错误或其他异常，打印错误并清空列表
    console.error('加载会话列表失败:', error)
    conversationList.value = []
  } finally {
    // 无论成功失败，都要关闭加载状态
    conversationLoading.value = false
  }
}

// 选择会话
const onConversationSelect = async (conversation) => {
  console.log('🔄 开始切换会话:', conversation)
  
  // 如果选择的是当前会话，则不做任何操作
  if (currentConversationId.value === conversation.conversationId) {
    console.log('⚠️ 选择的是当前会话，不执行切换')
    return
  }
  
  // 更新当前会话
  const previousConversationId = currentConversationId.value
  currentConversationId.value = conversation.conversationId
  
  console.log(`🔄 会话ID已更新: ${previousConversationId} -> ${conversation.conversationId}`)
  
  // 加载会话历史消息
  console.log(`📋 开始加载会话历史消息...`)
  await loadConversationMessages(conversation.conversationId,conversation.agentId)
  
  console.log(`✅ 会话已切换: ${conversation.conversationTitle || conversation.title || conversation.conversationId}`)
}

// 加载会话历史消息
const loadConversationMessages = async (conversationId, agentId) => {
  console.log(`📋 开始加载会话消息: ${conversationId}, agentId: ${agentId}`)
  
  if (!conversationId) {
    console.warn('⚠️ 会话ID为空，跳过加载消息')
    return
  }
  
  try {
    // 获取当前用户信息
    const currentUser = authStore.userInfo
    const userId = currentUser?.userId || currentUser?.userName || 'anonymous'
    
    const requestParams = {
      interfaceName: "messages",
      agentType: currentAgentType.value,
      agentId: agentId || currentAgentId.value,
      params: {
        user: userId, 
        conversation_id: conversationId, 
        first_id: "", 
        limit: 20
      }
    }

    console.log('📤 消息请求参数:', requestParams)
    
    const response = await getConversationMessages(requestParams)
    
    console.log('📥 消息API完整响应:', JSON.stringify(response, null, 2))
    
    if (response.code === 200) {
      // 多层级数据结构兼容处理
      let messageData = null
      
      // 尝试不同的数据路径
      if (response.data?.data?.data) {
        messageData = response.data.data.data
        console.log('📝 使用路径 response.data.data.data 获取消息数据')
      } else if (response.data?.data) {
        messageData = response.data.data
        console.log('📝 使用路径 response.data.data 获取消息数据')
      } else if (response.data?.messages) {
        messageData = response.data.messages
        console.log('📝 使用路径 response.data.messages 获取消息数据')
      } else if (response.data) {
        messageData = response.data
        console.log('📝 使用路径 response.data 获取消息数据')
      } else if (response.rows) {
        messageData = response.rows
        console.log('📝 使用路径 response.rows 获取消息数据')
      }
      
      console.log('📝 解析后的消息数据:', messageData)
      console.log('📝 消息数据类型:', typeof messageData, '是否为数组:', Array.isArray(messageData))
      
      if (Array.isArray(messageData) && messageData.length > 0) {
        console.log(`📨 找到 ${messageData.length} 条消息记录`)
        
        // 处理消息数据
        const formattedMessages = []
        
        messageData.forEach((msg, index) => {
          console.log(`🔄 处理第 ${index + 1} 条消息:`, JSON.stringify(msg, null, 2))
          
          // 生成消息ID
          const messageId = msg.messageId || msg.id || msg.message_id || `${conversationId}-${index}`
          
          // 处理时间戳
          let createTime = Date.now()
          if (msg.createTime) {
            createTime = new Date(msg.createTime).getTime()
          } else if (msg.timestamp) {
            createTime = typeof msg.timestamp === 'number' ? 
              (msg.timestamp > 1000000000000 ? msg.timestamp : msg.timestamp * 1000) : 
              new Date(msg.timestamp).getTime()
          } else if (msg.created_at) {
            createTime = typeof msg.created_at === 'number' ? 
              (msg.created_at > 1000000000000 ? msg.created_at : msg.created_at * 1000) : 
              new Date(msg.created_at).getTime()
          }
          
          console.log(`⏰ 消息时间戳处理: 原始=${msg.createTime || msg.timestamp || msg.created_at}, 处理后=${createTime}`)
          
          // 1. 处理用户消息
          let userContent = ''
          if (msg.content) {
            userContent = msg.content
          } else if (msg.query) {
            userContent = msg.query
          } else if (msg.input) {
            userContent = msg.input
          } else if (msg.question) {
            userContent = msg.question
          }
          
          if (userContent && userContent.trim()) {
            console.log(`👤 添加用户消息: ${userContent.substring(0, 100)}${userContent.length > 100 ? '...' : ''}`)
            formattedMessages.push({
              id: `${messageId}_user`,
              message: userContent.trim(),
              status: 'local',
              createTime: createTime,
              messageType: 1,
              sender: 'user'
            })
          }
          
          // 2. 处理AI回复消息
          let aiContent = ''
          
          // 多种方式获取AI回复内容
          if (msg.answer) {
            aiContent = msg.answer
          } else if (msg.response) {
            aiContent = msg.response
          } else if (msg.reply) {
            aiContent = msg.reply
          } else if (msg.output) {
            aiContent = msg.output
          } else if (msg.metadata?.answer) {
            aiContent = msg.metadata.answer
          } else if (msg.metadata?.difyOriginal?.answer) {
            aiContent = msg.metadata.difyOriginal.answer
          } else if (msg.ai_response) {
            aiContent = msg.ai_response
          }
          
          if (aiContent && aiContent.trim()) {
            console.log(`🤖 添加AI回复: ${aiContent.substring(0, 100)}${aiContent.length > 100 ? '...' : ''}`)
            formattedMessages.push({
              id: `${messageId}_ai`,
              message: aiContent.trim(),
              status: 'success',
              createTime: createTime + 1, // AI消息稍微晚一点，确保顺序
              messageType: 2,
              sender: 'ai'
            })
          }
          
          // 3. 如果是单条消息包含完整对话，尝试其他解析方式
          if (!userContent && !aiContent && msg.messages && Array.isArray(msg.messages)) {
            console.log('🔄 尝试解析嵌套消息结构')
            msg.messages.forEach((subMsg, subIndex) => {
              if (subMsg.role === 'user' && subMsg.content) {
                formattedMessages.push({
                  id: `${messageId}_${subIndex}_user`,
                  message: subMsg.content.trim(),
                  status: 'local',
                  createTime: createTime,
                  messageType: 1,
                  sender: 'user'
                })
              } else if (subMsg.role === 'assistant' && subMsg.content) {
                formattedMessages.push({
                  id: `${messageId}_${subIndex}_ai`,
                  message: subMsg.content.trim(),
                  status: 'success',
                  createTime: createTime + 1,
                  messageType: 2,
                  sender: 'ai'
                })
              }
            })
          }
        })
        
        console.log(`📨 格式化后的消息数组长度: ${formattedMessages.length}`)
        console.log('📨 格式化后的消息数组:', formattedMessages)
        
        if (formattedMessages.length > 0) {
          // 按时间排序，确保消息顺序正确
          formattedMessages.sort((a, b) => a.createTime - b.createTime)
          
          console.log(`📨 排序后准备设置消息: ${formattedMessages.length} 条`)
          
          // 设置消息到界面
          setMessages(formattedMessages)
          
          // 更新当前会话的消息数量
          const currentConversation = conversationList.value.find(c => c.conversationId === conversationId)
          if (currentConversation) {
            currentConversation.messageCount = formattedMessages.length
          }
          
          console.log(`✅ 会话 ${conversationId} 的消息加载完成: ${formattedMessages.length} 条消息`)
          
          // 延迟滚动到底部，确保DOM更新完成
          setTimeout(() => {
            scrollToBottom()
          }, 100)
        } else {
          console.log(`⚠️ 格式化后消息数组为空，原始数据可能格式不正确`)
          setMessages([])
        }
      } else {
        console.log(`📭 会话 ${conversationId} 暂无消息记录或数据格式错误`)
        console.log('📭 原始响应数据结构:', {
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : [],
          dataType: typeof response.data
        })
        setMessages([])
      }
    } else {
      console.warn('❌ 获取会话消息失败:', response.msg || '未知错误')
      setMessages([])
    }
  } catch (error) {
    console.error('💥 加载会话消息异常:', error)
    console.error('💥 错误详情:', error.message, error.stack)
    setMessages([])
  }
}

// 开始编辑会话标题
const startEditTitle = (conversation) => {
  editingConversationId.value = conversation.conversationId
  editTitle.value = conversation.conversationTitle || conversation.title || `会话 ${conversation.conversationId.slice(-8)}`
  
  // 下一帧聚焦输入框
  nextTick(() => {
    if (editTitleInput.value && editTitleInput.value[0]) {
      editTitleInput.value[0].focus()
      editTitleInput.value[0].select()
    }
  })
}

// 保存会话标题
const saveConversationTitle = async () => {
  if (!editingConversationId.value || !editTitle.value.trim()) {
    cancelEditTitle()
    return
  }
  
  try {
    // 获取当前用户信息
    const currentUser = authStore.userInfo
    const userId = currentUser?.userId || currentUser?.userName || 'anonymous'
    
    const response = await getConversationList({
      interfaceName: "Rename",
      agentType: currentAgentType.value,
      agentId: currentAgentId.value,
      conversationId: editingConversationId.value,
      params:{
        name: editTitle.value.trim(),
        auto_generate: false,
        user: userId,
        conversationId: editingConversationId.value,
      }
      
    })
    
    if (response.code === 200) {
      // 更新本地会话列表中的标题
      const conversation = conversationList.value.find(c => c.conversationId === editingConversationId.value)
      if (conversation) {
        conversation.conversationTitle = editTitle.value.trim()
        conversation.title = editTitle.value.trim() // 兼容性
      }
      
      console.log('会话标题修改成功')
    } else {
      console.warn('修改会话标题失败:', response.msg)
    }
  } catch (error) {
    console.error('修改会话标题失败:', error)
  } finally {
    cancelEditTitle()
  }
}

// 取消编辑标题
const cancelEditTitle = () => {
  editingConversationId.value = null
  editTitle.value = ''
}

// 确认删除会话
const confirmDeleteConversation = (conversation) => {
  Modal.confirm({
    title: '删除会话',
    content: `确定要删除会话"${conversation.conversationTitle || conversation.title || conversation.conversationId.slice(-8)}"吗？此操作不可恢复。`,
    okText: '确定',
    cancelText: '取消',
    okType: 'danger',
    onOk: () => deleteConversationHandler(conversation)
  })
}

// 删除会话处理
const deleteConversationHandler = async (conversation) => {
  try {
    // 获取当前用户信息
    const currentUser = authStore.userInfo
    const userId = currentUser?.userId || currentUser?.userName || 'anonymous'
    
    const response = await deleteConversation({
      conversationId: conversation.conversationId,
      agentId: currentAgentId.value,
      user: userId
    })
    
    if (response.code === 200) {
      // 从本地会话列表中移除
      const index = conversationList.value.findIndex(c => c.conversationId === conversation.conversationId)
      if (index !== -1) {
        conversationList.value.splice(index, 1)
      }
      
      // 如果删除的是当前会话，清空消息
      if (currentConversationId.value === conversation.conversationId) {
        currentConversationId.value = null
        setMessages([])
      }
      
      console.log('会话删除成功')
    } else {
      console.warn('删除会话失败:', response.msg)
    }
  } catch (error) {
    console.error('删除会话失败:', error)
  }
}

// 格式化会话时间
const formatConversationTime = (timestamp) => {
  if (!timestamp) return ''
  
  let date
  
  // 处理不同格式的时间戳
  if (typeof timestamp === 'number') {
    // Unix时间戳（秒）需要转换为毫秒
    date = timestamp > 1000000000000 ? new Date(timestamp) : new Date(timestamp * 1000)
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp)
  } else {
    return ''
  }
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return ''
  }
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // 如果是今天
  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  // 如果是昨天
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  if (date.getDate() === yesterday.getDate()) {
    return '昨天'
  }
  
  // 如果是本周
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('zh-CN', { weekday: 'short' })
  }
  
  // 其他情况显示月日
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

// 文件处理相关方法
// 触发文件选择
const triggerFileSelect = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files || [])
  
  if (files.length === 0) return
  
  // 检查文件大小限制（单个文件最大10MB）
  const maxSize = 10 * 1024 * 1024 // 10MB
  const validFiles = []
  
  for (const file of files) {
    if (file.size > maxSize) {
      console.warn(`文件 ${file.name} 超过大小限制（最大10MB）`)
      // 这里可以添加用户提示
      continue
    }
    validFiles.push(file)
  }
  
  // 添加到已选文件列表
  selectedFiles.value = [...selectedFiles.value, ...validFiles]
  
  // 清空input以允许重复选择同一文件
  event.target.value = ''
  
  console.log('已选择文件:', selectedFiles.value.map(f => ({ name: f.name, size: f.size, type: f.type })))
}

// 移除文件
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 滚动到消息列表底部 - 优化版本
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      const container = messagesContainer.value
      
      // 使用requestAnimationFrame确保在下一帧渲染后滚动
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
        
        // 二次确认滚动（处理内容可能还在渲染的情况）
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight
        })
      })
    }
  })
}

// 根据文件类型获取图标
const getFileIcon = (fileType) => {
  if (!fileType) return FileOutlined
  
  const type = fileType.toLowerCase()
  
  if (type.includes('pdf')) {
    return FilePdfOutlined
  } else if (type.includes('word') || type.includes('document')) {
    return FileWordOutlined
  } else if (type.includes('sheet') || type.includes('excel')) {
    return FileExcelOutlined
  } else if (type.includes('presentation') || type.includes('powerpoint')) {
    return FilePptOutlined
  } else if (type.includes('image')) {
    return FileImageOutlined
  } else {
    return FileOutlined
  }
}

// 调试相关方法
const enableDebugMode = () => {
  console.log('🐛 启用调试模式')
  console.log('🐛 当前消息列表:', messages.value)
  console.log('🐛 当前会话ID:', currentConversationId.value)
  console.log('🐛 当前智能体ID:', currentAgentId.value)
  console.log('🐛 会话列表:', conversationList.value)
  
  // 临时显示调试信息
  const debugDiv = document.querySelector('.messagesList')
  if (debugDiv) {
    const debugInfo = document.createElement('div')
    debugInfo.style.cssText = 'background: #f0f0f0; padding: 10px; margin: 10px; border-radius: 4px; font-size: 12px;'
    debugInfo.innerHTML = `
      <div>消息数组长度: ${messages.value.length}</div>
      <div>当前会话ID: ${currentConversationId.value}</div>
      <div>当前智能体ID: ${currentAgentId.value}</div>
      <div>会话列表长度: ${conversationList.value.length}</div>
    `
    debugDiv.appendChild(debugInfo)
    
    // 5秒后自动移除
    setTimeout(() => {
      if (debugDiv.contains(debugInfo)) {
        debugDiv.removeChild(debugInfo)
      }
    }, 5000)
  }
}

// 在开发环境下暴露调试方法到全局
if (import.meta.env.DEV) {
  window.enableDebugMode = enableDebugMode
  window.chatViewDebug = {
    messages: messages,
    currentConversationId: currentConversationId,
    currentAgentId: currentAgentId,
    conversationList: conversationList,
    loadConversationMessages: loadConversationMessages
  }
}

// 常见问题相关方法
// 加载智能体常见问题
const loadAgentFaqs = async (agentId) => {
  if (!agentId) {
    faqList.value = []
    return
  }
  try {
    faqLoading.value = true
    // 从后端获取所有快捷问题（按分类组织）
    const res = await getAllQuickQuestions()
    let allQuestions = []
    if (res && res.code === 200 && res.data && Array.isArray(res.data.categories)) {
      // 后端返回格式为 { categories: [ { categoryId, categoryName, questions: [...] } ] }
      res.data.categories.forEach(category => {
        if (Array.isArray(category.questions)) {
          allQuestions = allQuestions.concat(category.questions)
        }
      })
    }
    // 根据agentId筛选（如agentInfo.agentId为空或等于当前agentId）
    const filtered = allQuestions.filter(q => !q.agentInfo?.agentId || q.agentInfo.agentId === agentId)
    faqList.value = filtered.map(q => ({
      questionId: q.questionId,
      question: q.questionTitle,
      answer: q.questionContent,
      agentId: q.agentInfo?.agentId,
      sortOrder: q.sortOrder || 0
    }))
    // 检查是否需要显示滚动按钮
    nextTick(() => {
      checkFaqScrollButtons()
    })
  } catch (e) {
    faqList.value = []
  } finally {
    faqLoading.value = false
  }
}

// 点击常见问题处理
const handleFaqClick = async (faq) => {
  if (!faq.question || faqLoading.value || agentRequestLoading.value) return
  
  console.log('❓ 点击常见问题:', faq.question)
  
  // 填充问题到输入框
  content.value = faq.question
  
  // 自动发送消息
  await handleSend()
}

// 检查是否需要显示滚动按钮
const checkFaqScrollButtons = () => {
  if (!faqScrollContainer.value) {
    showFaqScrollButtons.value = false
    return
  }
  
  const container = faqScrollContainer.value
  const hasOverflow = container.scrollWidth > container.clientWidth
  
  showFaqScrollButtons.value = hasOverflow
  
  if (hasOverflow) {
    updateScrollButtonStates()
  }
}

// 更新滚动按钮状态
const updateScrollButtonStates = () => {
  if (!faqScrollContainer.value) return
  
  const container = faqScrollContainer.value
  const scrollLeft = container.scrollLeft
  const maxScrollLeft = container.scrollWidth - container.clientWidth
  
  canScrollLeft.value = scrollLeft > 0
  canScrollRight.value = scrollLeft < maxScrollLeft
}

// 滚动常见问题列表
const scrollFaqList = (direction) => {
  if (!faqScrollContainer.value) return
  
  const container = faqScrollContainer.value
  const scrollAmount = 200 // 每次滚动的像素
  
  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
  
  // 延迟更新按钮状态，等待滚动动画完成
  setTimeout(() => {
    updateScrollButtonStates()
  }, 300)
}

// 监听窗口大小变化，重新检查滚动按钮
const handleFaqResize = () => {
  checkFaqScrollButtons()
}

// 根据智能体类型和名称获取对应的图标
const getAgentIcon = (agent, index) => {
  if (!agent) return RobotOutlined
  
  // 基于FontAwesome图标库的多样化图标池，确保每个智能体图标都不同
  const iconPool = [
    // AI/Robot/Tech Icons
    RobotOutlined,           // 机器人
    ApiOutlined,             // API
    CodeOutlined,            // 代码
    RocketOutlined,          // 火箭
    ExperimentOutlined,      // 实验
    ThunderboltOutlined,     // 闪电 (代表快速)
    BulbOutlined,            // 灯泡 (代表点子、智能)
    ToolOutlined,            // 工具
    DatabaseOutlined,        // 数据库
    LineChartOutlined,       // 折线图
    SlidersOutlined,         // 控制面板
    ScanOutlined,            // 扫描
    DeploymentUnitOutlined,  // 部署单元
    GatewayOutlined,         // 网关
    BugOutlined,             // Bug (可用于调试、测试类智能体)
    
    // Hospital/Health Icons
    MedicineBoxOutlined,     // 医药箱
    HeartOutlined,           // 爱心
    SafetyOutlined,          // 安全
    AlertOutlined,           // 提醒
    ScheduleOutlined,        // 日程
    SolutionOutlined,        // 解决方案 (病历)
    TeamOutlined,            // 团队 (医生团队)
    CustomerServiceOutlined, // 客服
    FileProtectOutlined,     // 文件保护
  ]
  
  const agentName = agent.agentName || ''
  
  // 优先使用数组索引确保每个智能体都有不同的图标
  const iconIndex = (typeof index === 'number' && index >= 0) ? index % iconPool.length : 0
  return iconPool[iconIndex]
}

// 语音输入相关状态
const isRecording = ref(false)
const recognition = ref(null)
const speechSupported = ref(false)
const speechNetworkError = ref(false) // 新增，network错误后禁用按钮

// 检查浏览器是否支持Web Speech API
onMounted(() => {
  speechSupported.value = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
})

// 语音输入处理方法
const handleVoiceInput = () => {
  if (!speechSupported.value || speechNetworkError.value) {
    message.warning('当前浏览器不支持语音识别功能，或语音服务不可用')
    return
  }
  if (!recognition.value) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      message.warning('当前浏览器不支持语音识别功能')
      return
    }
    recognition.value = new SpeechRecognition()
    recognition.value.lang = 'zh-CN'
    recognition.value.continuous = false
    recognition.value.interimResults = true
    recognition.value.maxAlternatives = 1

    recognition.value.onresult = (event) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript
        }
      }
      if (finalTranscript) {
        content.value += finalTranscript
      }
    }
    recognition.value.onerror = (event) => {
      isRecording.value = false
      if (event.error === 'not-allowed' || event.error === 'denied') {
        message.error('未获得麦克风权限，无法进行语音识别')
      } else if (event.error === 'network') {
        console.log('语音识别出错: network')
        message.error('语音识别服务不可用，建议使用最新版Chrome并确保网络畅通，或联系管理员部署本地语音识别服务。')
        speechNetworkError.value = true
      } else {
        console.log('语音识别出错: ' + event.error)
        message.error('语音识别出错: ' + event.error)
      }
    }
    recognition.value.onend = () => {
      isRecording.value = false
    }
  }
  if (!isRecording.value) {
    try {
      recognition.value.start()
      isRecording.value = true
      message.info('请开始说话...')
    } catch (e) {
      message.error('语音识别启动失败: ' + e.message)
    }
  } else {
    recognition.value.stop()
    isRecording.value = false
  }
}

</script>

<style scoped>
/* 消息动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* 自定义滚动条 */
.messagesList::-webkit-scrollbar {
  width: 4px;
}

.messagesList::-webkit-scrollbar-track {
  background: transparent;
}

.messagesList::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 2px;
}

.messagesList::-webkit-scrollbar-thumb:hover {
  background-color: #bfbfbf;
}

/* 文件列表滚动条 */
.fileListContainer::-webkit-scrollbar {
  width: 4px;
}

.fileListContainer::-webkit-scrollbar-track {
  background: transparent;
}

.fileListContainer::-webkit-scrollbar-thumb {
  background-color: #d9d9d9;
  border-radius: 2px;
}

.fileListContainer::-webkit-scrollbar-thumb:hover {
  background-color: #bfbfbf;
}

/* 历史对话列表隐藏滚动条但保持滚动功能 */
.conversationsContent {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

.conversationsContent::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

/* 消息悬停效果 */
.messageWrapper:hover .messageFooter {
  opacity: 1 !important;
}

.messageWrapper:hover .userMessageFooter {
  opacity: 1 !important;
}

/* 会话卡片悬停效果 */
/* 三个点按钮现在始终显示，无需悬停控制 */

/* 全局样式覆盖 */

/* 智能体项悬停效果 */
.agentItem:hover {
  background-color: #f5f5f5 !important;
  transform: translateY(-1px);
}

/* 工作台项悬停效果 */
.workbenchItem:hover {
  background-color: #f5f5f5 !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 输入框样式 */
:deep(.ant-input) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

/* 按钮样式优化 */
:deep(.ant-btn-text) {
  box-shadow: none !important;
}

:deep(.ant-btn-primary) {
  box-shadow: none !important;
}
</style> 