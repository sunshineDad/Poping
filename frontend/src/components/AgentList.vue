<template>
  <div class="agent-list">
    <div class="list-header">
      <h3 class="list-title">我的智能体</h3>
      <button
        class="btn btn-primary btn-sm"
        @click="$emit('create')"
      >
        <svg class="icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        新建
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <svg class="error-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      <p class="error-message">{{ error }}</p>
      <button class="btn btn-secondary btn-sm" @click="$emit('retry')">
        重试
      </button>
    </div>

    <div v-else-if="agents.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <line x1="9" y1="9" x2="9.01" y2="9"/>
        <line x1="15" y1="9" x2="15.01" y2="9"/>
      </svg>
      <h4 class="empty-title">还没有智能体</h4>
      <p class="empty-description">创建您的第一个智能体，开始智能对话</p>
      <button class="btn btn-primary" @click="$emit('create')">
        创建智能体
      </button>
    </div>

    <div v-else class="agent-grid">
      <div
        v-for="agent in agents"
        :key="agent.id"
        class="agent-card"
        :class="{ 'active': currentAgent?.id === agent.id }"
        @click="$emit('select', agent)"
      >
        <div class="agent-header">
          <div class="agent-avatar">
            <svg class="avatar-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9M19 9H14V4H5V21H19V9Z"/>
            </svg>
          </div>
          <div class="agent-status">
            <span
              class="status-dot"
              :class="{
                'active': agent.status === 'active',
                'inactive': agent.status === 'inactive',
                'error': agent.status === 'error'
              }"
            ></span>
          </div>
        </div>

        <div class="agent-content">
          <h4 class="agent-name">{{ agent.name }}</h4>
          <p class="agent-description">{{ agent.description || '暂无描述' }}</p>
          
          <div class="agent-meta">
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
              </svg>
              <span class="meta-text">{{ formatDate(agent.createdAt) }}</span>
            </div>
            
            <div class="meta-item">
              <svg class="meta-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="meta-text">{{ agent.config?.model || '未配置' }}</span>
            </div>
          </div>

          <div class="agent-tags">
            <span v-if="agent.config?.mcpConfig?.enabled" class="tag tag-mcp">
              MCP
            </span>
            <span v-if="agent.config?.datasetConfig?.enabled" class="tag tag-dataset">
              数据集
            </span>
            <span v-if="agent.config?.memoryConfig?.enabled" class="tag tag-memory">
              记忆
            </span>
          </div>
        </div>

        <div class="agent-actions">
          <button
            class="action-btn"
            @click.stop="$emit('edit', agent)"
            title="编辑"
          >
            <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
          </button>
          
          <button
            class="action-btn action-btn-danger"
            @click.stop="$emit('delete', agent)"
            title="删除"
          >
            <svg class="action-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="pagination && pagination.totalPages > 1" class="pagination">
      <button
        class="pagination-btn"
        :disabled="pagination.currentPage <= 1"
        @click="$emit('page-change', pagination.currentPage - 1)"
      >
        <svg class="pagination-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        上一页
      </button>
      
      <div class="pagination-info">
        第 {{ pagination.currentPage }} 页，共 {{ pagination.totalPages }} 页
      </div>
      
      <button
        class="pagination-btn"
        :disabled="pagination.currentPage >= pagination.totalPages"
        @click="$emit('page-change', pagination.currentPage + 1)"
      >
        下一页
        <svg class="pagination-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Agent, AgentListPagination } from '@/types/agent'

// Props
interface Props {
  agents: Agent[]
  currentAgent?: Agent | null
  isLoading?: boolean
  error?: string | null
  pagination?: AgentListPagination
}

withDefaults(defineProps<Props>(), {
  currentAgent: null,
  isLoading: false,
  error: null,
  pagination: undefined
})

// Emits
interface Emits {
  create: []
  select: [agent: Agent]
  edit: [agent: Agent]
  delete: [agent: Agent]
  retry: []
  'page-change': [page: number]
}

defineEmits<Emits>()

// 方法
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return '今天'
  } else if (diffDays === 2) {
    return '昨天'
  } else if (diffDays <= 7) {
    return `${diffDays} 天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }
}
</script>

<style scoped>
.agent-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.list-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.icon {
  width: 16px;
  height: 16px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-icon,
.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #9ca3af;
}

.error-message {
  font-size: 14px;
  margin: 0 0 16px 0;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  margin: 0 0 24px 0;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  flex: 1;
}

.agent-card {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.agent-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.agent-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
}

.agent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.agent-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  width: 24px;
  height: 24px;
  color: #ffffff;
}

.agent-status {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
}

.status-dot.active {
  background: #10b981;
}

.status-dot.inactive {
  background: #6b7280;
}

.status-dot.error {
  background: #ef4444;
}

.agent-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.agent-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.agent-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.agent-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  width: 14px;
  height: 14px;
  color: #9ca3af;
}

.meta-text {
  font-size: 12px;
  color: #6b7280;
}

.agent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tag-mcp {
  background: #dbeafe;
  color: #1e40af;
}

.tag-dataset {
  background: #d1fae5;
  color: #065f46;
}

.tag-memory {
  background: #fef3c7;
  color: #92400e;
}

.agent-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
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

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.action-btn-danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.action-icon {
  width: 16px;
  height: 16px;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 4px;
  border-top: 1px solid #e5e7eb;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-icon {
  width: 16px;
  height: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

@media (max-width: 768px) {
  .agent-grid {
    grid-template-columns: 1fr;
  }
  
  .list-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .pagination-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>