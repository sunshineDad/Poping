<template>
  <div class="api-key-manager">
    <div v-if="apiKeys.length === 0" class="empty-state">
      <div class="empty-icon">
        <KeyIcon class="icon" />
      </div>
      <h3 class="empty-title">暂无API密钥</h3>
      <p class="empty-description">创建您的第一个API密钥来开始使用智能体服务</p>
    </div>
    
    <div v-else class="key-list">
      <div
        v-for="apiKey in apiKeys"
        :key="apiKey.id"
        class="key-item"
      >
        <div class="key-header">
          <div class="key-info">
            <h4 class="key-name">{{ apiKey.name }}</h4>
            <div class="key-meta">
              <span class="key-status" :class="`status-${apiKey.status}`">
                {{ apiKey.status === 'active' ? '活跃' : '未激活' }}
              </span>
              <span class="key-date">创建于 {{ formatDate(apiKey.createdAt) }}</span>
            </div>
          </div>
          <div class="key-actions">
            <button
              class="action-btn"
              @click="copyKey(apiKey.key)"
              :title="'复制API密钥'"
            >
              <CopyIcon class="action-icon" />
            </button>
            <button
              class="action-btn"
              @click="regenerateKey(apiKey.id)"
              :title="'重新生成'"
            >
              <RefreshIcon class="action-icon" />
            </button>
            <button
              class="action-btn danger"
              @click="deleteKey(apiKey.id)"
              :title="'删除密钥'"
            >
              <TrashIcon class="action-icon" />
            </button>
          </div>
        </div>
        
        <div class="key-display">
          <div class="key-value">
            <code class="key-code">{{ maskKey(apiKey.key) }}</code>
            <button
              class="toggle-btn"
              @click="toggleKeyVisibility(apiKey.id)"
            >
              <EyeIcon v-if="!visibleKeys.has(apiKey.id)" class="toggle-icon" />
              <EyeOffIcon v-else class="toggle-icon" />
            </button>
          </div>
        </div>
        
        <div class="key-usage">
          <div class="usage-stats">
            <div class="usage-item">
              <span class="usage-label">总调用</span>
              <span class="usage-value">{{ apiKey.usage.total.toLocaleString() }}</span>
            </div>
            <div class="usage-item">
              <span class="usage-label">本月调用</span>
              <span class="usage-value">{{ apiKey.usage.thisMonth.toLocaleString() }}</span>
            </div>
            <div class="usage-item">
              <span class="usage-label">最后使用</span>
              <span class="usage-value">{{ formatLastUsed(apiKey.lastUsed) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ApiKey } from '@/types/overview'
import {
  KeyIcon,
  CopyIcon,
  RefreshIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon
} from '@/components/icons'
import { confirmDialog } from '@/utils/confirm'

interface Props {
  apiKeys: ApiKey[]
}

interface Emits {
  regenerate: [keyId: string]
  delete: [keyId: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const visibleKeys = ref(new Set<string>())

// Methods
const maskKey = (key: string): string => {
  if (visibleKeys.value.has(getKeyId(key))) {
    return key
  }
  return key.slice(0, 8) + '•'.repeat(24) + key.slice(-4)
}

const getKeyId = (key: string): string => {
  return props.apiKeys.find(k => k.key === key)?.id || ''
}

const toggleKeyVisibility = (keyId: string) => {
  if (visibleKeys.value.has(keyId)) {
    visibleKeys.value.delete(keyId)
  } else {
    visibleKeys.value.add(keyId)
  }
}

const copyKey = async (key: string) => {
  try {
    await navigator.clipboard.writeText(key)
    // TODO: Show success toast
    console.log('API密钥已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const regenerateKey = async (keyId: string) => {
  if (await confirmDialog('确定要重新生成此API密钥吗？原密钥将失效。')) {
    emit('regenerate', keyId)
  }
}

const deleteKey = async (keyId: string) => {
  if (await confirmDialog('确定要删除此API密钥吗？此操作不可撤销。')) {
    emit('delete', keyId)
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatLastUsed = (lastUsed?: string): string => {
  if (!lastUsed) return '从未使用'
  
  const date = new Date(lastUsed)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return formatDate(lastUsed)
}
</script>

<style scoped>
.api-key-manager {
  width: 100%;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: var(--color-gray-100);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon .icon {
  width: 32px;
  height: 32px;
  color: var(--color-gray-400);
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.5;
}

/* Key List */
.key-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.key-item {
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  padding: 16px;
  background: var(--color-gray-50);
  transition: all 0.2s;
}

.key-item:hover {
  border-color: var(--color-gray-300);
  background: white;
}

.key-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.key-info {
  flex: 1;
}

.key-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 4px 0;
}

.key-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.key-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-semantic-success);
}

.status-inactive {
  background: rgba(156, 163, 175, 0.1);
  color: var(--color-gray-600);
}

.key-date {
  color: var(--color-gray-500);
}

.key-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-gray-200);
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: var(--color-gray-300);
  background: var(--color-gray-50);
}

.action-btn.danger:hover {
  border-color: #EF4444;
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.action-icon {
  width: 16px;
  height: 16px;
  color: var(--color-gray-600);
}

.action-btn.danger .action-icon {
  color: inherit;
}

/* Key Display */
.key-display {
  margin-bottom: 12px;
}

.key-value {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 6px;
}

.key-code {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--color-gray-800);
  background: none;
  border: none;
  outline: none;
}

.toggle-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background: var(--color-gray-100);
}

.toggle-icon {
  width: 16px;
  height: 16px;
  color: var(--color-gray-500);
}

/* Key Usage */
.key-usage {
  border-top: 1px solid var(--color-gray-200);
  padding-top: 12px;
}

.usage-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.usage-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.usage-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.usage-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900);
}

/* Responsive Design */
@media (max-width: 768px) {
  .key-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .key-actions {
    align-self: flex-end;
  }
  
  .usage-stats {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>