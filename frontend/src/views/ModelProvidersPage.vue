<template>
  <div class="model-providers-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">模型供应商管理</h1>
          <p class="page-description">配置和管理AI模型供应商，设置API密钥和模型参数</p>
        </div>
        <div class="header-right">
          <button @click="showAddModal = true" class="btn-primary">
            <IconComponents name="plus" size="sm" />
            添加供应商
          </button>
        </div>
      </div>
    </div>

    <!-- 供应商列表 -->
    <div class="providers-grid">
      <div 
        v-for="provider in providers" 
        :key="provider.id"
        class="provider-card"
        :class="{ 'provider-active': provider.enabled }"
      >
        <div class="provider-header">
          <div class="provider-info">
            <div class="provider-icon">
              <img v-if="provider.logo" :src="provider.logo" :alt="provider.name" />
              <div v-else class="provider-icon-fallback">{{ provider.name.charAt(0) }}</div>
            </div>
            <div class="provider-details">
              <h3 class="provider-name">{{ provider.name }}</h3>
              <p class="provider-description">{{ provider.description }}</p>
            </div>
          </div>
          <div class="provider-actions">
            <button 
              @click="toggleProvider(provider)"
              class="toggle-btn"
              :class="{ 'toggle-active': provider.enabled }"
            >
              <span class="toggle-slider"></span>
            </button>
          </div>
        </div>

        <div class="provider-models">
          <div class="models-header">
            <span class="models-title">可用模型 ({{ provider.models.length }})</span>
            <button @click="configureProvider(provider)" class="btn-secondary-sm">
              配置
            </button>
          </div>
          <div class="models-list">
            <div 
              v-for="model in provider.models.slice(0, 3)" 
              :key="model.id"
              class="model-tag"
            >
              {{ model.name }}
            </div>
            <div v-if="provider.models.length > 3" class="model-tag more-models">
              +{{ provider.models.length - 3 }} 更多
            </div>
          </div>
        </div>

        <div class="provider-stats">
          <div class="stat-item">
            <span class="stat-label">本月调用</span>
            <span class="stat-value">{{ formatNumber(provider.monthlyUsage) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">状态</span>
            <span class="stat-value" :class="getStatusClass(provider.status)">{{ provider.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加供应商模态框 -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>添加模型供应商</h2>
          <button @click="showAddModal = false" class="modal-close">
            <IconComponents name="delete" size="sm" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="addProvider">
            <div class="form-group">
              <label>供应商名称</label>
              <input v-model="newProvider.name" type="text" placeholder="如：OpenAI" required />
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="newProvider.description" placeholder="供应商描述信息"></textarea>
            </div>
            <div class="form-group">
              <label>API 端点</label>
              <input v-model="newProvider.apiEndpoint" type="url" placeholder="https://api.openai.com/v1" required />
            </div>
            <div class="form-group">
              <label>API 密钥</label>
              <input v-model="newProvider.apiKey" type="password" placeholder="输入API密钥" required />
            </div>
            <div class="form-actions">
              <button type="button" @click="showAddModal = false" class="btn-secondary">
                取消
              </button>
              <button type="submit" class="btn-primary">
                添加供应商
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IconComponents from '@/components/icons/IconComponents.vue'

// 类型定义
interface Model {
  id: string
  name: string
  type: string
  maxTokens: number
}

interface Provider {
  id: string
  name: string
  description: string
  logo?: string
  enabled: boolean
  status: 'active' | 'inactive' | 'error'
  apiEndpoint: string
  apiKey: string
  models: Model[]
  monthlyUsage: number
}

// 响应式数据
const providers = ref<Provider[]>([])
const showAddModal = ref(false)
const newProvider = ref({
  name: '',
  description: '',
  apiEndpoint: '',
  apiKey: ''
})

// 方法
const loadProviders = async () => {
  // 模拟数据
  providers.value = [
    {
      id: '1',
      name: 'OpenAI',
      description: '业界领先的AI模型供应商，提供GPT系列模型',
      enabled: true,
      status: 'active',
      apiEndpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-***',
      models: [
        { id: '1', name: 'GPT-4', type: 'chat', maxTokens: 8192 },
        { id: '2', name: 'GPT-3.5-turbo', type: 'chat', maxTokens: 4096 },
        { id: '3', name: 'text-davinci-003', type: 'completion', maxTokens: 4096 }
      ],
      monthlyUsage: 15420
    },
    {
      id: '2',
      name: 'Anthropic',
      description: '专注于AI安全的模型供应商，提供Claude系列模型',
      enabled: false,
      status: 'inactive',
      apiEndpoint: 'https://api.anthropic.com/v1',
      apiKey: '',
      models: [
        { id: '4', name: 'Claude-2', type: 'chat', maxTokens: 100000 },
        { id: '5', name: 'Claude-instant', type: 'chat', maxTokens: 100000 }
      ],
      monthlyUsage: 0
    }
  ]
}

const toggleProvider = (provider: Provider) => {
  provider.enabled = !provider.enabled
  provider.status = provider.enabled ? 'active' : 'inactive'
}

const configureProvider = (provider: Provider) => {
  // 跳转到配置页面或打开配置模态框
  console.log('配置供应商:', provider.name)
}

const addProvider = () => {
  const provider: Provider = {
    id: Date.now().toString(),
    name: newProvider.value.name,
    description: newProvider.value.description,
    enabled: false,
    status: 'inactive',
    apiEndpoint: newProvider.value.apiEndpoint,
    apiKey: newProvider.value.apiKey,
    models: [],
    monthlyUsage: 0
  }
  
  providers.value.push(provider)
  showAddModal.value = false
  
  // 重置表单
  newProvider.value = {
    name: '',
    description: '',
    apiEndpoint: '',
    apiKey: ''
  }
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const getStatusClass = (status: string) => {
  return {
    'status-active': status === 'active',
    'status-inactive': status === 'inactive',
    'status-error': status === 'error'
  }
}

// 生命周期
onMounted(() => {
  loadProviders()
})
</script>

<style scoped>
.model-providers-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: var(--color-gray-600);
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--color-brand-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-brand-primary-hover);
}

.providers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.provider-card {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}

.provider-card:hover {
  box-shadow: var(--shadow-lg);
}

.provider-active {
  border-color: var(--color-brand-primary);
}

.provider-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.provider-info {
  display: flex;
  gap: 12px;
}

.provider-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.provider-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.provider-icon-fallback {
  width: 100%;
  height: 100%;
  background: var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-gray-600);
}

.provider-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 4px 0;
}

.provider-description {
  font-size: 14px;
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.4;
}

.toggle-btn {
  width: 44px;
  height: 24px;
  background: var(--color-gray-300);
  border: none;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.toggle-active {
  background: var(--color-brand-primary);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle-active .toggle-slider {
  transform: translateX(20px);
}

.provider-models {
  margin-bottom: 20px;
}

.models-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.models-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-700);
}

.btn-secondary-sm {
  padding: 6px 12px;
  background: transparent;
  color: var(--color-brand-primary);
  border: 1px solid var(--color-brand-primary);
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary-sm:hover {
  background: var(--color-brand-primary);
  color: white;
}

.models-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.model-tag {
  padding: 4px 8px;
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.more-models {
  background: var(--color-brand-primary);
  color: white;
}

.provider-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--color-gray-500);
  font-weight: 500;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900);
}

.status-active {
  color: var(--color-semantic-success);
}

.status-inactive {
  color: var(--color-gray-500);
}

.status-error {
  color: var(--color-semantic-warning);
}

/* 模态框样式 */
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
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--color-gray-500);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background: var(--color-gray-100);
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-700);
  margin-bottom: 6px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-brand-primary);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-secondary {
  padding: 12px 20px;
  background: transparent;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}
</style>