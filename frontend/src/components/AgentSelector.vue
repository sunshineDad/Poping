<template>
  <div class="agent-selector">
    <!-- 选择器头部 -->
    <div class="selector-header">
      <h3 class="selector-title">智能体</h3>
      <button
        class="create-btn"
        @click="handleCreateAgent"
        title="创建新智能体"
      >
        <svg class="create-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- 搜索框 -->
    <div class="search-container">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索智能体..."
        />
      </div>
    </div>

    <!-- 智能体列表 -->
    <div class="agent-list">
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
      <div v-else-if="filteredAgents.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
        <span class="empty-text">
          {{ searchQuery ? '未找到匹配的智能体' : '暂无智能体' }}
        </span>
        <button v-if="!searchQuery" class="create-first-btn" @click="handleCreateAgent">
          创建第一个智能体
        </button>
      </div>

      <!-- 智能体项目 -->
      <div v-else class="agent-items">
        <div
          v-for="agent in filteredAgents"
          :key="agent.id"
          class="agent-item"
          :class="{ active: agent.id === selectedAgentId }"
          @click="handleSelectAgent(agent)"
        >
          <div class="agent-avatar">
            <svg class="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
            </svg>
          </div>
          
          <div class="agent-info">
            <div class="agent-header">
              <div class="agent-title-section">
                <h4 class="agent-name">{{ agent.name }}</h4>
                <div class="agent-status">
                  <span
                    class="status-dot"
                    :class="agent.status"
                    :title="getStatusText(agent.status)"
                  ></span>
                </div>
              </div>
              
              <!-- 横向排列的元数据 -->
              <div class="agent-meta-inline">
                <span class="agent-model">
                  <svg class="meta-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                  </svg>
                  {{ agent.config?.model || '未配置' }}
                </span>
                
                <span class="meta-separator">•</span>
                
                <span class="agent-updated">
                  <svg class="meta-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                  </svg>
                  {{ formatTime(agent.updatedAt) }}
                </span>
              </div>
            </div>
            
            <!-- 描述文本单独一行，避免挤压 -->
            <div class="agent-description-wrapper">
              <p class="agent-description">{{ agent.description || '暂无描述' }}</p>
            </div>
          </div>
          
          <div class="agent-actions">
            <button
              class="action-btn"
              @click.stop="handleEditAgent(agent)"
              title="编辑智能体"
            >
              <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
            </button>
            
            <button
              class="action-btn delete-btn"
              @click.stop="handleDeleteAgent(agent)"
              title="删除智能体"
            >
              <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.415L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建智能体模态框 -->
    <div v-if="showCreateModal" class="modal-overlay" @click="handleCloseModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">{{ editingAgent ? '编辑智能体' : '创建智能体' }}</h3>
          <button class="modal-close" @click="handleCloseModal">
            <svg class="close-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <AgentCreateForm
            :initial-data="editingAgent"
            @submit="handleSubmitAgent"
            @cancel="handleCloseModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Agent } from '@/types/agent'
import AgentCreateForm from './AgentCreateForm.vue'
import { confirmDialog } from '@/utils/confirm'

// Props
interface Props {
  agents: Agent[]
  selectedAgentId?: string | null
  isLoading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  selectedAgentId: null,
  isLoading: false,
  error: null
})

// Emits
interface Emits {
  'select-agent': [agent: Agent]
  'create-agent': [agentData: any]
  'update-agent': [id: string, agentData: any]
  'delete-agent': [agent: Agent]
  'retry': []
}

const emit = defineEmits<Emits>()

// 响应式数据
const searchQuery = ref('')
const showCreateModal = ref(false)
const editingAgent = ref<Agent | null>(null)

// 计算属性
const filteredAgents = computed(() => {
  if (!searchQuery.value) return props.agents
  
  const query = searchQuery.value.toLowerCase()
  return props.agents.filter(agent => 
    agent.name.toLowerCase().includes(query) ||
    (agent.description && agent.description.toLowerCase().includes(query)) ||
    (agent.config?.model && agent.config.model.toLowerCase().includes(query))
  )
})

// 方法
function handleSelectAgent(agent: Agent) {
  emit('select-agent', agent)
}

function handleCreateAgent() {
  editingAgent.value = null
  showCreateModal.value = true
}

function handleEditAgent(agent: Agent) {
  editingAgent.value = agent
  showCreateModal.value = true
}

async function handleDeleteAgent(agent: Agent) {
  if (await confirmDialog(`确定要删除智能体 "${agent.name}" 吗？此操作不可撤销。`)) {
    emit('delete-agent', agent)
  }
}

function handleSubmitAgent(agentData: any) {
  if (editingAgent.value) {
    emit('update-agent', editingAgent.value.id, agentData)
  } else {
    emit('create-agent', agentData)
  }
  handleCloseModal()
}

function handleCloseModal() {
  showCreateModal.value = false
  editingAgent.value = null
}

function handleRetry() {
  emit('retry')
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    active: '活跃',
    inactive: '未激活',
    error: '错误',
    training: '训练中'
  }
  return statusMap[status] || '未知'
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped>
.agent-selector {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

.selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.selector-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #1f2937;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-btn:hover {
  background: #111827;
  transform: scale(1.05);
}

.create-icon {
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

.agent-list {
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
  border-top: 3px solid #374151;
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
  margin-bottom: 16px;
}

.error-icon,
.empty-icon {
  width: 48px;
  height: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.retry-btn,
.create-first-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover,
.create-first-btn:hover {
  border-color: #374151;
  color: #374151;
}

.create-first-btn {
  background: #1f2937;
  color: #ffffff;
  border-color: #1f2937;
}

.create-first-btn:hover {
  background: #111827;
  border-color: #111827;
  color: #ffffff;
}

.agent-items {
  display: flex;
  flex-direction: column;
  gap: 12px; /* 增加卡片间距从8px到12px */
  padding: 4px 0; /* 添加上下内边距，确保视觉平衡 */
}

/* 智能体卡片 */
.agent-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: #FFFFFF;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 120px;
}

.agent-item:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.agent-item.active {
  border-color: #3B82F6;
  background: #F8FAFF;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* 头像 */
.agent-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.avatar-icon {
  width: 24px;
  height: 24px;
}

/* 智能体信息区域 */
.agent-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 头部区域 - 包含标题和元数据 */
.agent-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 标题和状态横向排列 */
.agent-title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.agent-name {
  font-size: 16px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 状态指示器 */
.agent-status {
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.active {
  background-color: #10B981;
}

.status-dot.inactive {
  background-color: #9CA3AF;
}

.status-dot.error {
  background-color: #EF4444;
}

/* 横向排列的元数据 */
.agent-meta-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #6B7280;
  line-height: 1.4;
  flex-wrap: wrap;
}

.agent-model,
.agent-updated {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.meta-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.meta-separator {
  color: #D1D5DB;
  font-weight: 500;
  user-select: none;
}

/* 描述文本区域 */
.agent-description-wrapper {
  flex: 1;
}

.agent-description {
  font-size: 14px;
  color: #6B7280;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
}

/* 操作按钮 */
.agent-actions {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding-top: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6B7280;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #F3F4F6;
  color: #374151;
}

.action-icon {
  width: 16px;
  height: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .agent-item {
    padding: 16px;
    gap: 12px;
    min-height: 100px;
  }
  
  .agent-avatar {
    width: 40px;
    height: 40px;
  }
  
  .avatar-icon {
    width: 20px;
    height: 20px;
  }
  
  .agent-name {
    font-size: 15px;
  }
  
  .agent-meta-inline {
    font-size: 11px;
    gap: 6px;
  }
  
  .meta-icon {
    width: 12px;
    height: 12px;
  }
  
  .agent-description {
    font-size: 13px;
    -webkit-line-clamp: 1;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
  }
  
  .action-icon {
    width: 14px;
    height: 14px;
  }
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
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .selector-header {
    padding: 16px 20px 12px;
  }
  
  .search-container {
    padding: 0 20px 12px;
  }
  
  .agent-list {
    padding: 0 20px 20px;
  }
  
  .agent-item {
    padding: 16px;
    gap: 14px;
  }
  
  .agent-avatar {
    width: 40px;
    height: 40px;
  }
  
  .avatar-icon {
    width: 20px;
    height: 20px;
  }
  
  .agent-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .agent-actions {
    gap: 4px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
  }
  
  .action-icon {
    width: 14px;
    height: 14px;
  }
  
  .modal-overlay {
    padding: 8px;
  }
  
  .modal-header {
    padding: 16px 20px;
  }
}
</style>