<template>
  <div class="chat-interface">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="agent-info">
        <div class="agent-avatar">
          <svg class="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
          </svg>
        </div>
        <div class="agent-details">
          <h3 class="agent-name">{{ currentAgent?.name || '选择智能体' }}</h3>
          <p class="agent-model">{{ currentAgent?.config?.model || '未配置模型' }}</p>
        </div>
      </div>
      
      <div class="chat-actions">
        <button
          v-if="currentSession"
          class="action-btn"
          @click="handleNewSession"
          title="新建对话"
        >
          <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <button
          v-if="currentSession && messages.length > 0"
          class="action-btn"
          @click="handleClearChat"
          title="清空对话"
        >
          <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 聊天内容区域 -->
    <div class="chat-content" ref="chatContentRef">
      <!-- 空状态 -->
      <div v-if="!currentAgent" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
        <h3 class="empty-title">选择智能体开始对话</h3>
        <p class="empty-description">从左侧选择一个智能体，或创建新的智能体</p>
      </div>

      <!-- 欢迎消息 -->
      <div v-else-if="messages.length === 0" class="welcome-state">
        <div class="welcome-avatar">
          <svg class="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
          </svg>
        </div>
        <h3 class="welcome-title">你好！我是 {{ currentAgent.name }}</h3>
        <p class="welcome-description">{{ currentAgent.description || '我是您的智能助手，有什么可以帮助您的吗？' }}</p>
        
        <!-- 快速开始建议 -->
        <div class="quick-start">
          <h4 class="quick-title">快速开始</h4>
          <div class="suggestion-grid">
            <button
              v-for="suggestion in quickSuggestions"
              :key="suggestion.id"
              class="suggestion-btn"
              @click="handleSuggestionClick(suggestion.text)"
            >
              <svg class="suggestion-icon" viewBox="0 0 20 20" fill="currentColor">
                <path :d="suggestion.icon" />
              </svg>
              <span>{{ suggestion.text }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="message-list">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-wrapper"
          :class="message.role"
        >
          <div class="message-avatar">
            <svg v-if="message.role === 'user'" class="avatar-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
            </svg>
          </div>
          
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">
                {{ message.role === 'user' ? '您' : currentAgent?.name }}
              </span>
              <span class="message-time">
                {{ formatMessageTime(message.createdAt) }}
              </span>
            </div>
            
            <div class="message-body">
              <div v-if="message.role === 'assistant' && message.isStreaming" class="message-text streaming">
                {{ message.content }}
                <span class="cursor">|</span>
              </div>
              <div v-else class="message-text" v-html="formatMessageContent(message.content)"></div>
              
              <!-- 工具调用结果 -->
              <div v-if="message.toolCalls && message.toolCalls.length > 0" class="tool-calls">
                <div
                  v-for="toolCall in message.toolCalls"
                  :key="toolCall.id"
                  class="tool-call"
                >
                  <div class="tool-header">
                    <svg class="tool-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                    </svg>
                    <span class="tool-name">{{ toolCall.function.name }}</span>
                  </div>
                  <div class="tool-result">
                    {{ toolCall.result || '执行中...' }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 消息操作 -->
            <div v-if="message.role === 'assistant' && !message.isStreaming" class="message-actions">
              <button class="message-action-btn" @click="copyMessage(message.content)" title="复制">
                <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                </svg>
              </button>
              
              <button class="message-action-btn" @click="regenerateMessage(message)" title="重新生成">
                <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 正在输入指示器 -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="typing-avatar">
            <svg class="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
            </svg>
          </div>
          <div class="typing-content">
            <div class="typing-text">
              <span class="typing-sender">{{ currentAgent?.name }}</span>
              <span class="typing-message">正在输入</span>
            </div>
            <div class="typing-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input" v-if="currentAgent">
      <div class="input-container">
        <div class="input-wrapper">
          <textarea
            ref="inputRef"
            v-model="inputMessage"
            class="message-input"
            placeholder="输入消息..."
            rows="1"
            :disabled="isTyping || isLoading"
            @keydown="handleKeyDown"
            @input="handleInputResize"
          ></textarea>
          
          <div class="input-actions">
            <button
              class="attach-btn"
              @click="handleAttachFile"
              title="附加文件"
              :disabled="isTyping || isLoading"
            >
              <svg class="attach-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <button
              class="send-btn"
              @click="handleSendMessage"
              :disabled="!canSend"
              title="发送消息 (Ctrl+Enter)"
            >
              <svg class="send-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="input-footer">
          <div class="input-hint">
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> 发送消息
          </div>
          
          <div class="input-status">
            <span v-if="inputMessage.length > 0" class="char-count">
              {{ inputMessage.length }}/2000
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import type { Agent, ChatSession, ChatMessage } from '@/types/agent'
import { confirmDialog } from '@/utils/confirm'

// Props
interface Props {
  currentAgent?: Agent | null
  currentSession?: ChatSession | null
  messages: ChatMessage[]
  isLoading?: boolean
  isTyping?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  currentAgent: null,
  currentSession: null,
  isLoading: false,
  isTyping: false
})

// Emits
interface Emits {
  'send-message': [content: string]
  'new-session': []
  'clear-chat': []
  'regenerate-message': [message: ChatMessage]
  'attach-file': []
}

const emit = defineEmits<Emits>()

// 响应式数据
const inputMessage = ref('')
const chatContentRef = ref<HTMLElement>()
const inputRef = ref<HTMLTextAreaElement>()

// 快速建议
const quickSuggestions = ref([
  {
    id: 1,
    text: '你好，介绍一下自己',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    id: 2,
    text: '帮我分析一下数据',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    id: 3,
    text: '写一段代码',
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
  },
  {
    id: 4,
    text: '解释一个概念',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
  }
])

// 计算属性
const canSend = computed(() => {
  return inputMessage.value.trim().length > 0 && 
         !props.isTyping && 
         !props.isLoading &&
         inputMessage.value.length <= 2000
})

// 监听消息变化，自动滚动到底部
watch(
  () => props.messages,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  },
  { deep: true }
)

// 监听正在输入状态
watch(
  () => props.isTyping,
  (isTyping) => {
    if (isTyping) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  }
)

// 方法
function handleSendMessage() {
  if (!canSend.value) return
  
  const content = inputMessage.value.trim()
  if (content) {
    emit('send-message', content)
    inputMessage.value = ''
    resetInputHeight()
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      handleSendMessage()
    } else if (!event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }
}

function handleInputResize() {
  const textarea = inputRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

function resetInputHeight() {
  const textarea = inputRef.value
  if (textarea) {
    textarea.style.height = 'auto'
  }
}

function handleSuggestionClick(text: string) {
  inputMessage.value = text
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleNewSession() {
  emit('new-session')
}

async function handleClearChat() {
  if (await confirmDialog('确定要清空当前对话吗？')) {
    emit('clear-chat')
  }
}

function handleAttachFile() {
  emit('attach-file')
}

function copyMessage(content: string) {
  navigator.clipboard.writeText(content).then(() => {
    // 可以添加复制成功的提示
  })
}

function regenerateMessage(message: ChatMessage) {
  emit('regenerate-message', message)
}

function scrollToBottom() {
  const container = chatContentRef.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatMessageContent(content: string): string {
  // 简单的 Markdown 渲染
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}
</script>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-avatar {
  width: 40px;
  height: 40px;
  background: #1f2937;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.agent-details {
  display: flex;
  flex-direction: column;
}

.agent-name {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.01em;
}

.agent-model {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.action-icon {
  width: 18px;
  height: 18px;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.empty-state,
.welcome-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-title,
.welcome-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;
}

.empty-description,
.welcome-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.welcome-avatar {
  width: 80px;
  height: 80px;
  background: #1f2937;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.welcome-avatar .avatar-icon {
  width: 40px;
  height: 40px;
}

.quick-start {
  margin-top: 40px;
  width: 100%;
  max-width: 640px;
}

.quick-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px 0;
  text-align: left;
  letter-spacing: -0.01em;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.suggestion-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  color: #374151;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.suggestion-btn:hover {
  border-color: #374151;
  background: #f9fafb;
  color: #1f2937;
}

.suggestion-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.message-list {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.message-wrapper {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.message-wrapper.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.message-wrapper.user .message-avatar {
  background: #f3f4f6;
  color: #6b7280;
}

.message-wrapper.assistant .message-avatar {
  background: #1f2937;
  color: #ffffff;
}

.message-content {
  flex: 1;
  max-width: calc(100% - 48px);
}

.message-wrapper.user .message-content {
  text-align: right;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.message-wrapper.user .message-header {
  justify-content: flex-end;
}

.message-sender {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.message-time {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.message-body {
  margin-bottom: 12px;
}

.message-text {
  padding: 16px 20px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
}

.message-wrapper.user .message-text {
  background: #1f2937;
  color: #ffffff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-wrapper.assistant .message-text {
  background: #f9fafb;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-text.streaming {
  position: relative;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.tool-calls {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-call {
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.tool-icon {
  width: 14px;
  height: 14px;
  color: #374151;
}

.tool-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.tool-result {
  font-size: 12px;
  color: #374151;
  font-family: monospace;
  background: #ffffff;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.message-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.message-wrapper:hover .message-actions {
  opacity: 1;
}

.message-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.message-action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.typing-indicator {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 0 24px 24px;
}

.typing-avatar {
  width: 36px;
  height: 36px;
  background: #1f2937;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.typing-content {
  flex: 1;
}

.typing-text {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.typing-sender {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.typing-message {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  width: fit-content;
}

.dot {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.chat-input {
  padding: 20px 32px;
  border-top: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 16px;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  background: #ffffff;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.input-wrapper:focus-within {
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message-input {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  font-size: 14px;
  line-height: 1.5;
  color: #1f2937;
  background: transparent;
  min-height: 20px;
  max-height: 120px;
}

.message-input::placeholder {
  color: #9ca3af;
}

.input-actions {
  display: flex;
  gap: 4px;
}

.attach-btn,
.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.attach-btn {
  background: #f9fafb;
  color: #6b7280;
}

.attach-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #374151;
}

.send-btn {
  background: #1f2937;
  color: #ffffff;
}

.send-btn:hover:not(:disabled) {
  background: #374151;
}

.send-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

.attach-icon,
.send-icon {
  width: 16px;
  height: 16px;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.input-hint kbd {
  padding: 2px 6px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 11px;
  font-family: inherit;
}

.input-status {
  font-size: 12px;
  color: #9ca3af;
}

.char-count {
  color: #6b7280;
}

@media (max-width: 768px) {
  .chat-header {
    padding: 12px 16px;
  }
  
  .message-list {
    padding: 16px;
    gap: 16px;
  }
  
  .chat-input {
    padding: 12px 16px;
  }
  
  .suggestion-grid {
    grid-template-columns: 1fr;
  }
  
  .input-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>