<template>
  <div class="session-history">
    <!-- 历史记录头部 -->
    <div class="history-header">
      <h3 class="history-title">对话历史</h3>
      <button
        v-if="sessions.length > 0"
        class="clear-all-btn"
        @click="handleClearAll"
        title="清空所有历史"
      >
        <svg class="clear-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- 搜索框 -->
    <div v-if="sessions.length > 0" class="search-container">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索对话..."
        />
      </div>
    </div>

    <!-- 会话列表 -->
    <div class="session-list">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span class="loading-text">加载中...</span>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span class="error-text">{{ error }}</span>
        <button class="retry-btn" @click="handleRetry">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredSessions.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        <span class="empty-text">
          {{ searchQuery ? '未找到匹配的对话' : '暂无对话历史' }}
        </span>
        <p class="empty-description">
          {{ searchQuery ? '尝试使用其他关键词搜索' : '开始新对话后，历史记录将显示在这里' }}
        </p>
      </div>

      <!-- 会话项目 -->
      <div v-else class="session-items">
        <!-- 按日期分组 -->
        <div
          v-for="group in groupedSessions"
          :key="group.date"
          class="session-group"
        >
          <div class="group-header">
            <span class="group-date">{{ group.label }}</span>
            <span class="group-count">{{ group.sessions.length }}</span>
          </div>
          
          <div class="group-sessions">
            <div
              v-for="session in group.sessions"
              :key="session.id"
              class="session-item"
              :class="{ active: session.id === selectedSessionId }"
              @click="handleSelectSession(session)"
            >
              <div class="session-content">
                <div class="session-header">
                  <h4 class="session-title">{{ getSessionTitle(session) }}</h4>
                  <span class="session-time">{{ formatTime(session.updatedAt) }}</span>
                </div>
                
                <p class="session-preview">{{ getSessionPreview(session) }}</p>
                
                <div class="session-meta">
                  <span class="message-count">
                    <svg class="meta-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                      <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                    </svg>
                    {{ session.messageCount || 0 }} 条消息
                  </span>
                  
                  <span v-if="session.agentName" class="agent-name">
                    <svg class="meta-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
                    </svg>
                    {{ session.agentName }}
                  </span>
                </div>
              </div>
              
              <div class="session-actions">
                <button
                  class="action-btn"
                  @click.stop="handleRenameSession(session)"
                  title="重命名"
                >
                  <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                  </svg>
                </button>
                
                <button
                  class="action-btn delete-btn"
                  @click.stop="handleDeleteSession(session)"
                  title="删除对话"
                >
                  <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 重命名模态框 -->
    <div v-if="showRenameModal" class="modal-overlay" @click="handleCloseRenameModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">重命名对话</h3>
          <button class="modal-close" @click="handleCloseRenameModal">
            <svg class="close-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="rename-form">
            <label class="form-label">对话标题</label>
            <input
              ref="renameInputRef"
              v-model="renameTitle"
              type="text"
              class="form-input"
              placeholder="输入新的对话标题"
              @keydown.enter="handleConfirmRename"
              @keydown.escape="handleCloseRenameModal"
            />
            
            <div class="form-actions">
              <button class="cancel-btn" @click="handleCloseRenameModal">
                取消
              </button>
              <button
                class="confirm-btn"
                @click="handleConfirmRename"
                :disabled="!renameTitle.trim()"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { ChatSession } from '@/types/agent'
import { confirmDialog } from '@/utils/confirm'

// Props
interface Props {
  sessions: ChatSession[]
  selectedSessionId?: string | null
  isLoading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedSessionId: null,
  isLoading: false,
  error: null
})

// Emits
interface Emits {
  'select-session': [session: ChatSession]
  'rename-session': [sessionId: string, title: string]
  'delete-session': [session: ChatSession]
  'clear-all': []
  'retry': []
}

const emit = defineEmits<Emits>()

// 响应式数据
const searchQuery = ref('')
const showRenameModal = ref(false)
const renamingSession = ref<ChatSession | null>(null)
const renameTitle = ref('')
const renameInputRef = ref<HTMLInputElement>()

// 计算属性
const filteredSessions = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.sessions
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.sessions.filter(session => 
    (session.title && session.title.toLowerCase().includes(query)) ||
    (session.agentName && session.agentName.toLowerCase().includes(query)) ||
    (session.lastMessage && session.lastMessage.toLowerCase().includes(query))
  )
})

const groupedSessions = computed(() => {
  const groups: Record<string, ChatSession[]> = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  filteredSessions.value.forEach(session => {
    const sessionDate = new Date(session.updatedAt)
    const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())
    
    let groupKey: string
    if (sessionDay.getTime() === today.getTime()) {
      groupKey = 'today'
    } else if (sessionDay.getTime() === yesterday.getTime()) {
      groupKey = 'yesterday'
    } else if (sessionDay.getTime() >= weekAgo.getTime()) {
      groupKey = 'thisWeek'
    } else {
      groupKey = sessionDay.toISOString().split('T')[0]
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(session)
  })
  
  // 排序并格式化
  const sortedGroups = Object.entries(groups)
    .map(([key, sessions]) => {
      let label: string
      switch (key) {
        case 'today':
          label = '今天'
          break
        case 'yesterday':
          label = '昨天'
          break
        case 'thisWeek':
          label = '本周'
          break
        default:
          label = new Date(key).toLocaleDateString('zh-CN', {
            month: 'long',
            day: 'numeric'
          })
      }
      
      return {
        date: key,
        label,
        sessions: sessions.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      }
    })
    .sort((a, b) => {
      // 自定义排序：今天 > 昨天 > 本周 > 其他日期（按时间倒序）
      const order = ['today', 'yesterday', 'thisWeek']
      const aIndex = order.indexOf(a.date)
      const bIndex = order.indexOf(b.date)
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      } else if (aIndex !== -1) {
        return -1
      } else if (bIndex !== -1) {
        return 1
      } else {
        return b.date.localeCompare(a.date)
      }
    })
  
  return sortedGroups
})

// 方法
function handleSelectSession(session: ChatSession) {
  emit('select-session', session)
}

function handleRenameSession(session: ChatSession) {
  renamingSession.value = session
  renameTitle.value = session.title || getSessionTitle(session)
  showRenameModal.value = true
  
  nextTick(() => {
    renameInputRef.value?.focus()
    renameInputRef.value?.select()
  })
}

async function handleDeleteSession(session: ChatSession) {
  const title = session.title || getSessionTitle(session)
  if (await confirmDialog(`确定要删除对话 "${title}" 吗？此操作不可撤销。`)) {
    emit('delete-session', session)
  }
}

async function handleClearAll() {
  if (await confirmDialog('确定要清空所有对话历史吗？此操作不可撤销。')) {
    emit('clear-all')
  }
}

function handleConfirmRename() {
  if (renamingSession.value && renameTitle.value.trim()) {
    emit('rename-session', renamingSession.value.id, renameTitle.value.trim())
    handleCloseRenameModal()
  }
}

function handleCloseRenameModal() {
  showRenameModal.value = false
  renamingSession.value = null
  renameTitle.value = ''
}

function handleRetry() {
  emit('retry')
}

function getSessionTitle(session: ChatSession): string {
  if (session.title) {
    return session.title
  }
  
  if (session.lastMessage) {
    return session.lastMessage.length > 30 
      ? session.lastMessage.substring(0, 30) + '...'
      : session.lastMessage
  }
  
  return '新对话'
}

function getSessionPreview(session: ChatSession): string {
  if (session.lastMessage) {
    return session.lastMessage.length > 60
      ? session.lastMessage.substring(0, 60) + '...'
      : session.lastMessage
  }
  return '暂无消息'
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.session-history {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.history-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-all-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.clear-icon {
  width: 16px;
  height: 16px;
}

.search-container {
  padding: 0 24px 16px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 16px;
  color: #9ca3af;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: #ffffff;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #374151;
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text,
.error-text,
.empty-text {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.error-icon,
.empty-icon {
  width: 48px;
  height: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  border-color: #374151;
  color: #374151;
}

.session-items {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.session-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.group-date {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.group-count {
  font-size: 11px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 10px;
}

.group-sessions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.session-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.session-item:hover {
  border-color: #e5e7eb;
  background: #f9fafb;
}

.session-item.active {
  border-color: #374151;
  background: rgba(55, 65, 81, 0.05);
  box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
}

.session-content {
  flex: 1;
  min-width: 0;
}

.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.session-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  truncate: true;
}

.session-time {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
}

.session-preview {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: #9ca3af;
}

.message-count,
.agent-name {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  width: 12px;
  height: 12px;
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

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.delete-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.action-icon {
  width: 12px;
  height: 12px;
}

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
  padding: 16px;
}

.modal-content {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-icon {
  width: 16px;
  height: 16px;
}

.modal-body {
  padding: 24px;
}

.rename-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: #ffffff;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn {
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #374151;
}

.cancel-btn:hover {
  background: #f9fafb;
}

.confirm-btn {
  border: 1px solid #1f2937;
  background: #1f2937;
  color: #ffffff;
}

.confirm-btn:hover:not(:disabled) {
  background: #111827;
  border-color: #111827;
}

.confirm-btn:disabled {
  background: #e5e7eb;
  border-color: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .history-header {
    padding: 16px 20px 12px;
  }
  
  .search-container {
    padding: 0 20px 12px;
  }
  
  .session-list {
    padding: 0 20px 20px;
  }
  
  .session-item {
    padding: 10px;
  }
  
  .session-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .modal-overlay {
    padding: 8px;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
}
</style>