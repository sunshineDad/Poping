<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-content" @click.stop>
      <!-- 模态框头部 -->
      <div class="modal-header">
        <div class="header-info">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
            </svg>
          </div>
          <div class="header-text">
            <h2 class="modal-title">选择智能体</h2>
            <p class="modal-subtitle">选择一个智能体开始对话</p>
          </div>
        </div>
        <button class="close-btn" @click="handleClose">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="search-section">
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          <input
            :value="searchQuery"
            @input="handleSearch"
            type="text"
            class="search-input"
            placeholder="搜索智能体名称或描述..."
          />
        </div>
      </div>

      <!-- 智能体列表 -->
      <div class="agents-section">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <span class="loading-text">正在加载智能体...</span>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredAgents.length === 0" class="empty-state">
          <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <path d="M20 8v6M23 11h-6"/>
          </svg>
          <span class="empty-text">
            {{ searchQuery ? '未找到匹配的智能体' : '暂无可用智能体' }}
          </span>
          <p class="empty-description">
            {{ searchQuery ? '尝试使用其他关键词搜索' : '请先创建智能体' }}
          </p>
        </div>

        <!-- 智能体网格 -->
        <div v-else class="agents-grid">
          <div
            v-for="agent in filteredAgents"
            :key="agent.id"
            class="agent-card"
            @click="handleSelect(agent)"
          >
            <div class="agent-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
              </svg>
            </div>
            
            <div class="agent-info">
              <div class="agent-header">
                <h3 class="agent-name">{{ agent.name }}</h3>
                <div class="agent-badges">
                  <span v-if="agent.isPublic" class="badge public">公开</span>
                  <span v-if="agent.memoryEnabled" class="badge memory">记忆</span>
                </div>
              </div>
              
              <p class="agent-description">{{ agent.description }}</p>
              
              <div class="agent-meta">
                <div class="meta-item">
                  <svg class="meta-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                  </svg>
                  <span>{{ agent.usageCount || 0 }} 次使用</span>
                </div>
                
                <div class="meta-item">
                  <svg class="meta-icon" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span>已验证</span>
                </div>
              </div>
            </div>
            
            <div class="agent-action">
              <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 模态框底部 -->
      <div class="modal-footer">
        <div class="footer-info">
          <span class="agent-count">
            {{ filteredAgents.length }} 个智能体
          </span>
        </div>
        <div class="footer-actions">
          <button class="cancel-btn" @click="handleClose">
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Agent } from '@/types/agent'

// Props
interface Props {
  agents: Agent[]
  isLoading?: boolean
  searchQuery?: string
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  searchQuery: ''
})

// Emits
interface Emits {
  'select': [agent: Agent]
  'close': []
  'search': [query: string]
}

const emit = defineEmits<Emits>()

// 计算属性
const filteredAgents = computed(() => {
  if (!props.searchQuery.trim()) {
    return props.agents
  }
  
  const query = props.searchQuery.toLowerCase()
  return props.agents.filter(agent => 
    agent.name.toLowerCase().includes(query) ||
    (agent.description && agent.description.toLowerCase().includes(query))
  )
})

// 方法
function handleSelect(agent: Agent) {
  emit('select', agent)
}

function handleClose() {
  emit('close')
}

function handleSearch(event: Event) {
  const target = event.target as HTMLInputElement
  emit('search', target.value)
}
</script>

<style scoped>
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
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-icon svg {
  width: 24px;
  height: 24px;
}

.header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.search-section {
  padding: 0 32px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  color: #9ca3af;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 16px;
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

.agents-section {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #374151;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
}

.agents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.agent-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.agent-card:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.agent-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.agent-avatar svg {
  width: 24px;
  height: 24px;
}

.agent-info {
  flex: 1;
  min-width: 0;
}

.agent-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.agent-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.agent-badges {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.public {
  background: #f3f4f6;
  color: #374151;
}

.badge.memory {
  background: #e5e7eb;
  color: #1f2937;
}

.agent-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.agent-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  width: 14px;
  height: 14px;
}

.agent-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #f9fafb;
  color: #9ca3af;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.agent-card:hover .agent-action {
  background: #374151;
  color: white;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.footer-info {
  display: flex;
  align-items: center;
}

.agent-count {
  font-size: 14px;
  color: #6b7280;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    max-height: 95vh;
    margin: 0;
    border-radius: 12px;
  }
  
  .modal-header {
    padding: 20px 24px;
  }
  
  .search-section {
    padding: 0 24px 20px;
  }
  
  .agents-section {
    padding: 20px 24px;
  }
  
  .modal-footer {
    padding: 16px 24px;
  }
  
  .agents-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .agent-card {
    padding: 16px;
  }
  
  .header-info {
    gap: 12px;
  }
  
  .header-icon {
    width: 40px;
    height: 40px;
  }
  
  .header-icon svg {
    width: 20px;
    height: 20px;
  }
}
</style>