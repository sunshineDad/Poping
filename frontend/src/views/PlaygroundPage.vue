<template>
  <div class="playground-page">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-left">
          <router-link to="/" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            首页
          </router-link>
          <router-link to="/agents" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            智能体管理
          </router-link>
          <router-link to="/datasets" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            数据集
          </router-link>
          <router-link to="/market" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            MCP 市场
          </router-link>
          <router-link to="/playground" class="nav-link router-link-active">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            AI 对话
          </router-link>
        </div>
        <div class="nav-right">
          <router-link to="/profile" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            个人中心
          </router-link>
        </div>
      </div>
    </nav>

    <div class="playground-container">
      <!-- 左侧边栏 -->
      <div class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <!-- 侧边栏头部 -->
        <div class="sidebar-header">
          <button 
            @click="sidebarCollapsed = !sidebarCollapsed"
            class="collapse-btn"
          >
            <svg class="collapse-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    :d="sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
            </svg>
          </button>
          <h2 v-if="!sidebarCollapsed" class="sidebar-title">AI 对话</h2>
        </div>

        <!-- 智能体选择器 -->
        <div v-if="!sidebarCollapsed" class="agent-selector">
          <button 
            @click="showAgentModal = true"
            class="select-agent-btn"
          >
            <div class="agent-info">
              <span class="agent-avatar">{{ currentAgent?.avatar || '🤖' }}</span>
              <div class="agent-details">
                <span class="agent-name">{{ currentAgent?.name || '选择智能体' }}</span>
                <span class="agent-desc">{{ currentAgent?.description || '点击选择智能体' }}</span>
              </div>
            </div>
            <svg class="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <!-- 会话历史 -->
        <div v-if="!sidebarCollapsed" class="session-history">
          <div class="section-header">
            <h3 class="section-title">会话历史</h3>
            <button 
              @click="createNewSession"
              class="new-session-btn"
              :disabled="!currentAgent"
            >
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <div class="session-list">
            <div 
              v-for="session in sessions" 
              :key="session.id"
              @click="selectSession(session)"
              class="session-item"
              :class="{ 'active': currentSession?.id === session.id }"
            >
              <div class="session-content">
                <span class="session-title">{{ session.title }}</span>
                <span class="session-time">{{ formatTime(session.updatedAt) }}</span>
              </div>
              <div class="session-actions">
                <button @click.stop="renameSession(session)" class="action-btn">
                  <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button @click.stop="deleteSession(session)" class="action-btn delete">
                  <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主聊天区域 -->
      <div class="chat-area">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="chat-info">
            <span class="agent-avatar">{{ currentAgent?.avatar || '🤖' }}</span>
            <div class="chat-details">
              <h3 class="agent-name">{{ currentAgent?.name || '未选择智能体' }}</h3>
              <p class="session-title">{{ currentSession?.title || '新对话' }}</p>
            </div>
          </div>
          <div class="chat-actions">
            <button @click="clearMessages" class="action-btn" :disabled="!currentSession">
              <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              清空对话
            </button>
            <button @click="exportChat" class="action-btn" :disabled="!currentSession">
              <svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              导出对话
            </button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div class="messages-container" ref="messagesContainer">
          <div v-if="!currentAgent" class="empty-state">
            <div class="empty-icon">🤖</div>
            <h3 class="empty-title">欢迎使用 AI 对话</h3>
            <p class="empty-description">请先选择一个智能体开始对话</p>
            <button @click="showAgentModal = true" class="btn btn-primary">
              选择智能体
            </button>
          </div>

          <div v-else-if="currentSessionMessages.length === 0" class="empty-state">
            <div class="empty-icon">💬</div>
            <h3 class="empty-title">开始新对话</h3>
            <p class="empty-description">向 {{ currentAgent.name }} 发送消息开始对话</p>
          </div>

          <div v-else class="messages-list">
            <div 
              v-for="message in currentSessionMessages" 
              :key="message.id"
              class="message"
              :class="{ 'user': message.role === 'user', 'assistant': message.role === 'assistant' }"
            >
              <div class="message-avatar">
                <span v-if="message.role === 'user'">👤</span>
                <span v-else>{{ currentAgent?.avatar || '🤖' }}</span>
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.createdAt) }}</div>
              </div>
            </div>

            <!-- 打字指示器 -->
            <div v-if="isTyping" class="message assistant">
              <div class="message-avatar">
                <span>{{ currentAgent?.avatar || '🤖' }}</span>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="input-area">
          <div class="input-container">
            <textarea
              v-model="inputMessage"
              @keydown="handleKeyDown"
              placeholder="输入消息..."
              class="message-input"
              :disabled="!currentAgent || isLoading"
              rows="1"
              ref="messageInput"
            ></textarea>
            <button 
              @click="sendMessage"
              class="send-btn"
              :disabled="!inputMessage.trim() || !currentAgent || isLoading"
            >
              <svg v-if="!isLoading" class="send-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <div v-else class="loading-spinner"></div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 智能体选择模态框 -->
    <div v-if="showAgentModal" class="modal-overlay" @click="showAgentModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">选择智能体</h3>
          <button @click="showAgentModal = false" class="close-btn">
            <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="agents-grid">
            <div 
              v-for="agent in activeAgents" 
              :key="agent.id"
              @click="selectAgent(agent)"
              class="agent-card"
              :class="{ 'selected': currentAgent?.id === agent.id }"
            >
              <div class="agent-avatar">{{ agent.avatar || '🤖' }}</div>
              <div class="agent-info">
                <h4 class="agent-name">{{ agent.name }}</h4>
                <p class="agent-description">{{ agent.description }}</p>
                <div class="agent-meta">
                  <span class="agent-model">{{ agent.config?.model || 'GPT-4' }}</span>
                  <span class="agent-usage">{{ agent.usageCount || 0 }} 次使用</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useAgentStore } from '@/stores/agent'
import type { Agent, ChatSession } from '@/types/agent'

const agentStore = useAgentStore()

// 响应式数据
const sidebarCollapsed = ref(false)
const showAgentModal = ref(false)
const inputMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const messageInput = ref<HTMLTextAreaElement>()

// 计算属性
const { 
  agents, 
  currentAgent, 
  sessions, 
  currentSession, 
  currentSessionMessages,
  activeAgents,
  isLoading,
  isTyping,
  error,
  fetchAgents,
  selectAgent,
  fetchSessions,
  loadSession,
  sendMessage,
  clearError
} = agentStore

// 生命周期
onMounted(async () => {
  await loadInitialData()
})

// 监听消息变化，自动滚动到底部
watch(currentSessionMessages, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 方法
const loadInitialData = async () => {
  try {
    await fetchAgents()
  } catch (error) {
    console.error('加载初始数据失败:', error)
  }
}

const handleSelectAgent = async (agent: Agent) => {
  await selectAgent(agent)
  showAgentModal.value = false
}

const createNewSession = async () => {
  if (!currentAgent.value) return
  
  try {
    await selectAgent(currentAgent.value)
  } catch (error) {
    console.error('创建会话失败:', error)
  }
}

const selectSession = async (session: AISession) => {
  try {
    await loadSession(session.session_id)
  } catch (error) {
    console.error('加载会话失败:', error)
  }
}

const handleSendMessage = async () => {
  if (!inputMessage.value.trim() || !currentAgent.value) return
  
  const message = inputMessage.value.trim()
  inputMessage.value = ''
  
  // 自动调整输入框高度
  if (messageInput.value) {
    messageInput.value.style.height = 'auto'
  }
  
  try {
    // 如果没有当前会话，先创建一个
    if (!currentSession.value) {
      await selectAgent(currentAgent.value)
    }
    
    await sendMessage(message)
  } catch (error) {
    console.error('发送消息失败:', error)
    // 恢复输入内容
    inputMessage.value = message
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSendMessage()
  }
  
  // 自动调整输入框高度
  nextTick(() => {
    if (messageInput.value) {
      messageInput.value.style.height = 'auto'
      messageInput.value.style.height = messageInput.value.scrollHeight + 'px'
    }
  })
}

const clearMessages = () => {
  if (confirm('确定要清空当前对话吗？')) {
    // 实现清空消息逻辑
    console.log('清空对话')
  }
}

const exportChat = () => {
  if (!currentSession || currentSessionMessages.length === 0) return
  
  const chatData = {
    agent: currentAgent?.name,
    session: currentSession.title,
    messages: currentSessionMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
      time: msg.createdAt
    })),
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chat-${currentSession.title}-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const renameSession = (session: ChatSession) => {
  const newTitle = prompt('请输入新的会话标题:', session.title)
  if (newTitle && newTitle.trim()) {
    // 实现重命名逻辑
    console.log('重命名会话:', session.id, newTitle)
  }
}

const deleteSession = (session: ChatSession) => {
  if (confirm('确定要删除这个会话吗？')) {
    // 实现删除逻辑
    console.log('删除会话:', session.id)
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  
  return date.toLocaleDateString()
}
</script>

<style scoped>
/* 页面容器 */
.playground-page {
  min-height: 100vh;
  background-color: #F9FAFB;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.navbar {
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  padding: 0 24px;
  height: 72px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  color: #4B5563;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #F3F4F6;
  color: #1F2937;
}

.nav-link.router-link-active {
  background-color: #3B82F6;
  color: #FFFFFF;
}

.nav-icon {
  width: 20px;
  height: 20px;
}

/* 主容器 */
.playground-container {
  display: flex;
  flex: 1;
  height: calc(100vh - 72px);
}

/* 侧边栏 */
.sidebar {
  width: 320px;
  background-color: #FFFFFF;
  border-right: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background-color: #F3F4F6;
}

.collapse-icon {
  width: 20px;
  height: 20px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

/* 智能体选择器 */
.agent-selector {
  padding: 20px;
  border-bottom: 1px solid #E5E7EB;
}

.select-agent-btn {
  width: 100%;
  background-color: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-agent-btn:hover {
  background-color: #F3F4F6;
  border-color: #D1D5DB;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.agent-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.agent-name {
  font-weight: 500;
  color: #1F2937;
  font-size: 14px;
}

.agent-desc {
  font-size: 12px;
  color: #6B7280;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  color: #9CA3AF;
}

/* 会话历史 */
.session-history {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.new-session-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 4px;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.new-session-btn:hover:not(:disabled) {
  background-color: #F3F4F6;
}

.new-session-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.session-item:hover {
  background-color: #F3F4F6;
}

.session-item.active {
  background-color: #EBF8FF;
  border: 1px solid #3B82F6;
}

.session-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.session-title {
  font-weight: 500;
  color: #1F2937;
  font-size: 14px;
  margin-bottom: 4px;
}

.session-time {
  font-size: 12px;
  color: #6B7280;
}

.session-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.session-item:hover .session-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  padding: 4px;
  border-radius: 4px;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #E5E7EB;
  color: #1F2937;
}

.action-btn.delete:hover {
  background-color: #FEE2E2;
  color: #DC2626;
}

.action-icon {
  width: 14px;
  height: 14px;
}

/* 聊天区域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
}

.chat-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-details {
  display: flex;
  flex-direction: column;
}

.agent-name {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 4px 0;
}

.session-title {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

.chat-actions {
  display: flex;
  gap: 12px;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 16px;
  color: #6B7280;
  margin: 0 0 24px 0;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message {
  display: flex;
  gap: 12px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background-color: #3B82F6;
  color: #FFFFFF;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-text {
  background-color: #F3F4F6;
  padding: 12px 16px;
  border-radius: 12px;
  color: #1F2937;
  line-height: 1.5;
}

.message.user .message-text {
  background-color: #3B82F6;
  color: #FFFFFF;
}

.message-time {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background-color: #F3F4F6;
  border-radius: 12px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9CA3AF;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 输入区域 */
.input-area {
  padding: 24px;
  border-top: 1px solid #E5E7EB;
  background-color: #FFFFFF;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  color: #1F2937;
  background-color: #FFFFFF;
  resize: none;
  min-height: 48px;
  max-height: 120px;
  transition: border-color 0.2s ease;
}

.message-input:focus {
  outline: none;
  border-color: #3B82F6;
}

.message-input:disabled {
  background: #F9FAFB;
  color: #9CA3AF;
}

.send-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: #3b82f6;
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #2563eb;
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.send-icon {
  width: 20px;
  height: 20px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.close-btn {
  padding: 8px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-icon {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.agent-card {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  gap: 12px;
}

.agent-card:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.agent-card.selected {
  border-color: #3B82F6;
  background-color: #EBF8FF;
}

.agent-card .agent-avatar {
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.agent-info {
  flex: 1;
}

.agent-card .agent-name {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 4px 0;
}

.agent-description {
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.agent-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #9CA3AF;
}

.agent-model,
.agent-usage {
  background-color: #F3F4F6;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-left,
  .nav-right {
    gap: 16px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .nav-icon {
    width: 18px;
    height: 18px;
  }
  
  .sidebar {
    width: 280px;
  }
  
  .sidebar.collapsed {
    width: 60px;
  }
  
  .agents-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}

@media (max-width: 480px) {
  .playground-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #E5E7EB;
  }
  
  .sidebar.collapsed {
    height: 60px;
    overflow: hidden;
  }
  
  .chat-area {
    height: calc(100vh - 200px);
  }
}
</style>