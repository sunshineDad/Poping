<template>
  <div class="mcp-integration">
    <div v-if="integrations.length === 0" class="empty-state">
      <div class="empty-icon">
        <ServerIcon class="icon" />
      </div>
      <h4 class="empty-title">暂无集成</h4>
      <p class="empty-description">添加MCP集成来扩展智能体功能</p>
    </div>
    
    <div v-else class="integration-list">
      <div
        v-for="integration in integrations"
        :key="integration.id"
        class="integration-item"
      >
        <div class="integration-header">
          <div class="integration-info">
            <div class="integration-name">
              <h4 class="name-text">{{ integration.name }}</h4>
              <span class="version-badge">v{{ integration.version }}</span>
            </div>
            <p class="integration-description">{{ integration.description }}</p>
          </div>
          
          <div class="integration-status">
            <div class="status-indicator" :class="`status-${integration.status}`">
              <div class="status-dot"></div>
              <span class="status-text">{{ getStatusText(integration.status) }}</span>
            </div>
          </div>
        </div>
        
        <div class="integration-details">
          <div class="detail-row">
            <span class="detail-label">最后同步</span>
            <span class="detail-value">{{ formatLastSync(integration.lastSync) }}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">配置项</span>
            <span class="detail-value">{{ Object.keys(integration.config).length }} 项</span>
          </div>
        </div>
        
        <div class="integration-actions">
          <button
            class="action-btn secondary"
            @click="testConnection(integration.id)"
            :disabled="testing === integration.id"
          >
            <RefreshIcon v-if="testing === integration.id" class="action-icon spinning" />
            <CheckIcon v-else class="action-icon" />
            {{ testing === integration.id ? '测试中...' : '测试连接' }}
          </button>
          
          <button
            class="action-btn primary"
            @click="openConfig(integration.id)"
          >
            <SettingsIcon class="action-icon" />
            配置
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add Integration Button -->
    <div class="add-integration">
      <button class="add-btn" @click="addIntegration">
        <PlusIcon class="add-icon" />
        添加新集成
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { McpIntegration } from '@/types/overview'
import {
  ServerIcon,
  RefreshIcon,
  CheckIcon,
  SettingsIcon,
  PlusIcon
} from '@/components/icons'

interface Props {
  integrations: McpIntegration[]
}

interface Emits {
  test: [integrationId: string]
  configure: [integrationId: string]
  add: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const testing = ref<string | null>(null)

// Methods
const getStatusText = (status: string): string => {
  const statusMap = {
    connected: '已连接',
    disconnected: '未连接',
    error: '连接错误'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const formatLastSync = (lastSync?: string): string => {
  if (!lastSync) return '从未同步'
  
  const date = new Date(lastSync)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffMinutes < 1) return '刚刚'
  if (diffMinutes < 60) return `${diffMinutes}分钟前`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}小时前`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}天前`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

const testConnection = async (integrationId: string) => {
  testing.value = integrationId
  
  try {
    emit('test', integrationId)
    // Simulate test delay
    await new Promise(resolve => setTimeout(resolve, 2000))
  } catch (error) {
    console.error('测试连接失败:', error)
  } finally {
    testing.value = null
  }
}

const openConfig = (integrationId: string) => {
  emit('configure', integrationId)
}

const addIntegration = () => {
  emit('add')
}
</script>

<style scoped>
.mcp-integration {
  width: 100%;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  background: var(--color-gray-100);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon .icon {
  width: 24px;
  height: 24px;
  color: var(--color-gray-400);
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 4px 0;
}

.empty-description {
  font-size: 14px;
  color: var(--color-gray-600);
  margin: 0;
}

/* Integration List */
.integration-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.integration-item {
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  padding: 16px;
  background: white;
  transition: all 0.2s;
}

.integration-item:hover {
  border-color: var(--color-gray-300);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.integration-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.integration-info {
  flex: 1;
}

.integration-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.name-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.version-badge {
  padding: 2px 6px;
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
}

.integration-description {
  font-size: 13px;
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.4;
}

.integration-status {
  flex-shrink: 0;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.status-connected {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-semantic-success);
}

.status-disconnected {
  background: rgba(156, 163, 175, 0.1);
  color: var(--color-gray-600);
}

.status-error {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-text {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Integration Details */
.integration-details {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-top: 1px solid var(--color-gray-100);
  border-bottom: 1px solid var(--color-gray-100);
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-gray-900);
}

/* Integration Actions */
.integration-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
}

.action-btn.primary {
  background: var(--color-brand-primary);
  color: white;
  border-color: var(--color-brand-primary);
}

.action-btn.primary:hover {
  background: var(--color-brand-primary-hover);
  border-color: var(--color-brand-primary-hover);
}

.action-btn.secondary {
  background: white;
  color: var(--color-gray-700);
  border-color: var(--color-gray-200);
}

.action-btn.secondary:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-300);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-icon {
  width: 14px;
  height: 14px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Add Integration */
.add-integration {
  border-top: 1px solid var(--color-gray-200);
  padding-top: 16px;
}

.add-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: var(--color-gray-50);
  color: var(--color-gray-700);
  border: 2px dashed var(--color-gray-200);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: var(--color-gray-100);
  border-color: var(--color-gray-300);
  color: var(--color-gray-800);
}

.add-icon {
  width: 16px;
  height: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .integration-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .integration-status {
    align-self: flex-start;
  }
  
  .integration-details {
    flex-direction: column;
    gap: 8px;
  }
  
  .integration-actions {
    justify-content: stretch;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>