<template>
  <div class="provider-config-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">模型供应商配置</h1>
          <p class="page-description">管理您的AI模型供应商API配置，支持多种主流供应商</p>
        </div>
        <div class="header-right">
          <button @click="showAddModal = true" class="btn-primary">
            <IconComponents name="plus" size="sm" />
            添加配置
          </button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <IconComponents name="search" size="sm" class="search-icon" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索供应商配置..." 
            class="search-input"
          />
        </div>
      </div>
      <div class="search-actions">
        <button @click="showAddModal = true" class="btn-primary">
          <IconComponents name="plus" size="sm" />
          添加配置
        </button>
      </div>
    </div>

    <!-- Mock数据展示区域 -->
    <div v-if="showMockData" class="mock-data-section">
      <div class="mock-header">
        <h3 class="mock-title">
          <IconComponents name="dataset" size="sm" />
          Mock数据预览
        </h3>
        <button @click="showMockData = false" class="btn-close">
          <IconComponents name="delete" size="sm" />
        </button>
      </div>
      <div class="mock-content">
        <div class="mock-item" v-for="mock in mockData" :key="mock.id">
          <div class="mock-provider">{{ mock.provider }}</div>
          <div class="mock-models">{{ mock.models.join(', ') }}</div>
          <div class="mock-status" :class="mock.status">{{ mock.status }}</div>
        </div>
      </div>
      <button @click="showMockData = false" class="btn-secondary mock-toggle">
        隐藏Mock数据
      </button>
    </div>
    
    <!-- Mock数据切换按钮 -->
    <div v-else class="mock-toggle-section">
      <button @click="showMockData = true" class="btn-secondary">
        <IconComponents name="dataset" size="sm" />
        显示Mock数据
      </button>
    </div>

    <!-- 配置列表 -->
    <div class="config-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="configs.length === 0" class="empty-state">
        <div class="empty-icon">
          <IconComponents name="settings" size="lg" />
        </div>
        <h3 class="empty-title">暂无供应商配置</h3>
        <p class="empty-description">添加您的第一个AI模型供应商配置</p>
        <button @click="showAddModal = true" class="btn-primary">
          添加第一个配置
        </button>
      </div>
      
      <div v-else class="config-grid">
        <div 
          v-for="config in filteredConfigs" 
          :key="config.id" 
          class="config-card"
          :class="{ 'config-active': config.status === 'active' }"
        >
          <div class="config-header">
            <div class="config-info">
              <div class="provider-icon">
                <img 
                  v-if="getProviderIcon(config.providerId)" 
                  :src="getProviderIcon(config.providerId)" 
                  :alt="getProviderName(config.providerId)"
                />
                <IconComponents v-else name="settings" size="md" />
              </div>
              <div class="provider-details">
                <h3 class="provider-name">{{ getProviderName(config.providerId) }}</h3>
                <p class="config-name">{{ config.name }}</p>
              </div>
            </div>
            <div class="config-actions">
              <button @click="editConfig(config)" class="btn-icon" title="编辑">
                <IconComponents name="edit" size="sm" />
              </button>
              <button @click="deleteConfig(config.id)" class="btn-icon btn-danger" title="删除">
                <IconComponents name="trash" size="sm" />
              </button>
            </div>
          </div>
          
          <div class="config-details">
            <div class="config-meta">
              <div class="meta-item">
                <span class="meta-label">API Key</span>
                <span class="meta-value">{{ maskApiKey(config.apiKey) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">状态</span>
                <span class="meta-value status" :class="config.status || 'inactive'">
                  {{ (config.status || 'inactive') === 'active' ? '正常' : '异常' }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">创建时间</span>
                <span class="meta-value">{{ config.createdAt ? formatDate(config.createdAt) : '未知' }}</span>
              </div>
            </div>

            <div class="config-preview">
              <div class="preview-header">
                <span class="preview-title">可用模型</span>
                <span class="model-count">{{ config.availableModels?.length || 0 }} 个</span>
              </div>
              <div class="preview-content">
                <div class="model-tags">
                  <span 
                    v-for="model in config.availableModels?.slice(0, 3)" 
                    :key="model" 
                    class="model-tag"
                  >
                    {{ model }}
                  </span>
                  <span v-if="config.availableModels && config.availableModels.length > 3" class="model-tag more">
                    +{{ config.availableModels.length - 3 }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="config-footer">
            <div class="footer-actions">
              <button @click="testConnection(config)" class="btn-test" :disabled="!config.id || testingConfigs.has(config.id)">
                <IconComponents v-if="config.id && testingConfigs.has(config.id)" name="loading" size="sm" />
                <IconComponents v-else name="test" size="sm" />
                {{ config.id && testingConfigs.has(config.id) ? '测试中...' : '测试连接' }}
              </button>
              <button @click="installProvider(config)" class="btn-install" :disabled="!config.id || installingConfigs.has(config.id)">
                <IconComponents v-if="config.id && installingConfigs.has(config.id)" name="loading" size="sm" />
                <IconComponents v-else name="install" size="sm" />
                {{ config.id && installingConfigs.has(config.id) ? '安装中...' : '安装到系统' }}
              </button>
              <button @click="editConfig(config)" class="btn-edit">
                <IconComponents name="edit" size="sm" />
                编辑配置
              </button>
            </div>
            <!-- 测试结果显示 -->
            <div v-if="config.id && testResults[config.id]" class="test-result" :class="testResults[config.id!].success ? 'success' : 'error'">
              <div class="test-result-content">
                <IconComponents :name="testResults[config.id!].success ? 'check' : 'alert'" size="sm" />
                {{ testResults[config.id!].message }}
              </div>
              <div v-if="testResults[config.id!].models && testResults[config.id!].models!.length > 0" class="models-preview">
                <span class="models-count">发现 {{ testResults[config.id!].models!.length }} 个可用模型</span>
              </div>
            </div>
            <!-- 安装结果显示 -->
            <div v-if="config.id && installResults[config.id]" class="install-result" :class="installResults[config.id!].success ? 'success' : 'error'">
              <div class="install-result-content">
                <IconComponents :name="installResults[config.id!].success ? 'check' : 'alert'" size="sm" />
                {{ installResults[config.id!].message }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑配置弹窗 -->
    <ProviderConfigModal
      :visible="showAddModal || showEditModal"
      :providers="providers"
      :config="editingConfig || undefined"
      @close="closeModal"
      @save="handleConfigSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { http } from '@/utils/http'
import { toast } from '@/utils/toast'
import ProviderConfigModal from '@/components/ProviderConfigModal.vue'
import IconComponents from '@/components/IconComponents.vue'
import { confirmDialog } from '@/utils/confirm'
import type { Provider, ProviderConfig, Model } from '@/types/provider'

// 数据状态

const loading = ref(true)
const configs = ref<ProviderConfig[]>([])
const providers = ref<Provider[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingConfig = ref<ProviderConfig | null>(null)

// 搜索和过滤相关
const searchQuery = ref('')
const filteredConfigs = ref<ProviderConfig[]>([])

// Mock数据相关
const showMockData = ref(false)
const mockData = ref([
  {
    id: 'mock-1',
    provider: 'OpenAI GPT',
    models: ['gpt-4', 'gpt-3.5-turbo', 'text-davinci-003'],
    status: 'active'
  },
  {
    id: 'mock-2', 
    provider: 'Anthropic Claude',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-2'],
    status: 'active'
  },
  {
    id: 'mock-3',
    provider: 'Google Gemini',
    models: ['gemini-pro', 'gemini-pro-vision'],
    status: 'inactive'
  }
])

// 测试连接相关
const testingConfigs = ref(new Set<string>())
const testResults = ref<Record<string, { success: boolean; message: string; models?: any[] }>>({})

// 安装功能相关
const installingConfigs = ref(new Set<string>())
const installResults = ref<Record<string, { success: boolean; message: string }>>({})

// 搜索过滤功能
const filterConfigs = () => {
  if (!searchQuery.value.trim()) {
    filteredConfigs.value = configs.value
  } else {
    const query = searchQuery.value.toLowerCase()
    filteredConfigs.value = configs.value.filter(config => 
      config.name.toLowerCase().includes(query) ||
      getProviderName(config.providerId).toLowerCase().includes(query) ||
      config.description?.toLowerCase().includes(query)
    )
  }
}

// 监听搜索查询变化
watch(searchQuery, filterConfigs)
watch(configs, filterConfigs)

// 测试连接功能
const testConnection = async (config: ProviderConfig) => {
  if (!config?.id) return
  
  testingConfigs.value.add(config.id)
  
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟成功结果
    const mockModels = ['gpt-4', 'gpt-3.5-turbo', 'text-davinci-003']
    testResults.value[config.id] = {
      success: true,
      message: '连接成功！',
      models: mockModels
    }
    
    // 3秒后清除结果
    setTimeout(() => {
      if (config.id && testResults.value[config.id]) {
        delete testResults.value[config.id]
      }
    }, 3000)
    
  } catch (error) {
    if (config.id) {
      testResults.value[config.id] = {
        success: false,
        message: '连接失败，请检查配置信息'
      }
      
      setTimeout(() => {
        if (config.id && testResults.value[config.id]) {
          delete testResults.value[config.id]
        }
      }, 3000)
    }
  } finally {
    testingConfigs.value.delete(config.id)
  }
}

// 安装供应商到系统
const installProvider = async (config: ProviderConfig) => {
  if (!config?.id) return
  
  installingConfigs.value.add(config.id)
  
  try {
    // 模拟安装过程
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 模拟安装成功
    installResults.value[config.id] = {
      success: true,
      message: '安装成功！供应商已添加到系统配置'
    }
    
    // 更新配置状态为激活
    const configIndex = configs.value.findIndex(c => c?.id === config.id)
    if (configIndex !== -1 && configs.value[configIndex]) {
      configs.value[configIndex].status = 'active'
    }
    
    // 3秒后清除结果
    setTimeout(() => {
      if (config.id && installResults.value[config.id]) {
        delete installResults.value[config.id]
      }
    }, 3000)
    
  } catch (error) {
    if (config.id) {
      installResults.value[config.id] = {
        success: false,
        message: '安装失败，请检查配置信息'
      }
      
      setTimeout(() => {
        if (config.id && installResults.value[config.id]) {
          delete installResults.value[config.id]
        }
      }, 3000)
    }
  } finally {
    testingConfigs.value.delete(config.id)
  }
}

const fetchProviders = async () => {
  try {
    const response = await http.get('/api/providers')
    providers.value = response.data
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    // 使用Mock数据
    providers.value = [
      { id: 'openai', name: 'OpenAI', description: 'OpenAI GPT模型', iconUrl: '/icons/openai.png' },
      { id: 'anthropic', name: 'Anthropic', description: 'Claude模型', iconUrl: '/icons/anthropic.png' },
      { id: 'google', name: 'Google', description: 'Gemini模型', iconUrl: '/icons/google.png' }
    ]
  }
}

// 获取配置列表
const fetchConfigs = async () => {
  try {
    loading.value = true
    const response = await http.get('/api/provider-configs')
    configs.value = response.data
  } catch (error) {
    console.error('获取配置列表失败:', error)
    // 使用Mock数据
    configs.value = [
      {
        id: '1',
        providerId: 'openai',
        name: 'OpenAI 生产环境',
        apiUrl: 'https://api.openai.com/v1',
        apiKey: 'sk-1234567890abcdef',
        description: '生产环境OpenAI配置',
        status: 'active',
        availableModels: ['gpt-4', 'gpt-3.5-turbo'],
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        providerId: 'anthropic',
        name: 'Claude 测试环境',
        apiUrl: 'https://api.anthropic.com/v1',
        apiKey: 'sk-ant-1234567890abcdef',
        description: '测试环境Claude配置',
        status: 'inactive',
        availableModels: ['claude-3-opus', 'claude-3-sonnet'],
        createdAt: '2024-01-16T14:20:00Z'
      }
    ]
  } finally {
    loading.value = false
  }
}

// 获取供应商名称
const getProviderName = (providerId: string) => {
  const provider = providers.value.find(p => p.id === providerId)
  return provider?.name || '未知供应商'
}

// 获取供应商图标
const getProviderIcon = (providerId: string) => {
  const provider = providers.value.find(p => p.id === providerId)
  return provider?.iconUrl
}

// 掩码API Key
const maskApiKey = (apiKey: string) => {
  if (!apiKey) return ''
  return apiKey.substring(0, 8) + '****' + apiKey.substring(apiKey.length - 4)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 编辑配置
const editConfig = (config: ProviderConfig) => {
  if (!config) return
  editingConfig.value = { ...config }
  showEditModal.value = true
}

// 删除配置
const deleteConfig = async (configId: string | undefined) => {
  if (!configId || !(await confirmDialog('确定要删除这个配置吗？'))) return
  
  try {
    await http.delete(`/api/provider-configs/${configId}`)
    await fetchConfigs()
  } catch (error) {
    console.error('删除配置失败:', error)
    // Mock删除
    configs.value = configs.value.filter(c => c?.id !== configId)
  }
}

// 切换Mock数据显示
const toggleMockData = () => {
  showMockData.value = !showMockData.value
}

// 关闭弹窗
const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingConfig.value = null
}

// 保存配置
const handleConfigSave = async (configData: ProviderConfig) => {
  try {
    if (editingConfig.value?.id) {
      // 更新配置
      await http.put(`/api/provider-configs/${editingConfig.value.id}`, configData)
    } else {
      // 创建配置
      await http.post('/api/provider-configs', configData)
    }
    
    closeModal()
    await fetchConfigs()
  } catch (error) {
    console.error('保存配置失败:', error)
  }
}

onMounted(async () => {
  await fetchProviders()
  await fetchConfigs()
})
</script>

<style scoped>
.provider-config-page {
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

.header-left {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 16px;
  color: #6B7280;
  margin: 0;
}

.header-right {
  margin-left: 24px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #333333;
  border-color: #333333;
}

.config-list {
  min-height: 400px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #6B7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top: 3px solid #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 24px;
  color: #9CA3AF;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 16px;
  color: #6B7280;
  margin: 0 0 24px 0;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.config-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}

.config-card:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.config-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.provider-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.provider-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.provider-details {
  flex: 1;
}

.provider-name {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 4px 0;
}

.config-name {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

.config-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: 1px solid #E5E7EB;
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  border-color: #3B82F6;
  color: #3B82F6;
}

.btn-icon.btn-danger:hover {
  border-color: #EF4444;
  color: #EF4444;
}

.config-details {
  margin-bottom: 20px;
}

.config-meta {
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #F3F4F6;
}

.meta-item:last-child {
  border-bottom: none;
}

.meta-label {
  font-size: 14px;
  color: #6B7280;
  font-weight: 500;
}

.meta-value {
  font-size: 14px;
  color: #1F2937;
}

.meta-value.status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.meta-value.status.active {
  background: #D1FAE5;
  color: #065F46;
}

.meta-value.status.inactive {
  background: #FEE2E2;
  color: #991B1B;
}

.config-preview {
  background: #F9FAFB;
  border-radius: 8px;
  padding: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.model-count {
  font-size: 12px;
  color: #6B7280;
}

.model-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.model-tag {
  background: #E5E7EB;
  color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.model-tag.more {
  background: #3B82F6;
  color: white;
}

.config-footer {
  border-top: 1px solid #F3F4F6;
  padding-top: 16px;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  flex: 1;
  background: #ffffff;
  color: #000000;
  border: 1px solid #000000;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-test {
  background: #ffffff;
  color: #000000;
  border: 1px solid #000000;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-test:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn-test:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-edit {
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-edit:hover {
  background: #333333;
  border-color: #333333;
}

.config-footer .btn-primary {
  flex: 1;
  padding: 8px 16px;
  font-size: 14px;
}

/* 搜索框样式 */
.search-section {
  margin-bottom: 24px;
}

.search-bar {
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #666666;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #000000;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
  color: #000000;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #333333;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.search-input::placeholder {
  color: #666666;
}

/* Mock数据展示区域样式 */
.mock-data-section {
  background: #ffffff;
  border: 1px solid #000000;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.mock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mock-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-close {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #666666;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: #f5f5f5;
  color: #000000;
}

.mock-content {
  margin-bottom: 16px;
}

.mock-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.mock-item:last-child {
  border-bottom: none;
}

.mock-provider {
  font-weight: 600;
  color: #000000;
  flex: 1;
}

.mock-models {
  font-size: 12px;
  color: #666666;
  flex: 2;
  margin: 0 16px;
}

.mock-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: capitalize;
}

.mock-status.active {
  background: #d4edda;
  color: #155724;
}

.mock-status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.mock-toggle-section {
  margin-bottom: 24px;
}

/* 测试结果样式 */
.test-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid;
}

.test-result.success {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.test-result.error {
  background: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.test-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.models-preview {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.models-count {
  font-weight: 500;
}

/* 安装按钮样式 */
.btn-install {
  background: #10B981;
  color: #ffffff;
  border: 1px solid #10B981;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-install:hover:not(:disabled) {
  background: #059669;
  border-color: #059669;
}

.btn-install:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 安装结果样式 */
.install-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid;
}

.install-result.success {
  background: #d1fae5;
  border-color: #a7f3d0;
  color: #065f46;
}

.install-result.error {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

.install-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.models-preview {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.models-count {
  font-weight: 500;
}
</style>