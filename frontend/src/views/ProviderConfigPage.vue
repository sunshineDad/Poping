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

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-bar">
        <div class="search-input-wrapper">
          <IconComponents name="search" size="sm" class="search-icon-left" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索供应商配置..." 
            class="search-input"
            @input="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- 配置列表 -->
    <div class="config-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      
      <div v-else-if="paginatedConfigs.length === 0" class="empty-state">
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
          v-for="config in paginatedConfigs" 
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
                  <span 
                    v-if="config.availableModels && config.availableModels.length > 3" 
                    class="model-tag more"
                  >
                    +{{ config.availableModels.length - 3 }}
                  </span>
                </div>
              </div>
            </div>

            <div class="config-footer">
              <div class="footer-actions">
                <button 
                  @click="testConnection(config)" 
                  :disabled="testingConfigs.has(config.id)"
                  class="btn-secondary"
                >
                  <IconComponents 
                    :name="testingConfigs.has(config.id) ? 'loading' : 'check'" 
                    size="sm" 
                  />
                  {{ testingConfigs.has(config.id) ? '测试中...' : '测试连接' }}
                </button>
                <button 
                  @click="installProvider(config)" 
                  :disabled="installingConfigs.has(config.id)"
                  class="btn-primary"
                >
                  <IconComponents 
                    :name="installingConfigs.has(config.id) ? 'loading' : 'download'" 
                    size="sm" 
                  />
                  {{ installingConfigs.has(config.id) ? '安装中...' : '安装到系统' }}
                </button>
              </div>
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

      <!-- 分页控件 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage = 1" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          首页
        </button>
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          上一页
        </button>
        <span class="pagination-info">
          第 {{ currentPage }} 页，共 {{ totalPages }} 页
        </span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          下一页
        </button>
        <button 
          @click="currentPage = totalPages" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          末页
        </button>
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

// 搜索和分页相关
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// 计算属性
const filteredConfigs = computed(() => {
  if (!searchQuery.value.trim()) {
    return configs.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return configs.value.filter(config => 
    getProviderName(config.providerId).toLowerCase().includes(query) ||
    config.name.toLowerCase().includes(query) ||
    config.description?.toLowerCase().includes(query)
  )
})

const totalPages = computed(() => {
  return Math.ceil(filteredConfigs.value.length / pageSize.value)
})

const paginatedConfigs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredConfigs.value.slice(start, end)
})

// 测试连接相关
const testingConfigs = ref(new Set<string>())
const testResults = ref<Record<string, { success: boolean; message: string; models?: any[] }>>({})

// 安装功能相关
const installingConfigs = ref(new Set<string>())
const installResults = ref<Record<string, { success: boolean; message: string }>>({})

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1 // 搜索时重置到第一页
}

// 监听搜索变化
watch(searchQuery, () => {
  currentPage.value = 1
})

// 测试连接功能
const testConnection = async (config: ProviderConfig) => {
  if (!config?.id) return
  
  testingConfigs.value.add(config.id)
  
  try {
    const response = await http.post(`/api/provider-configs/${config.id}/test`)
    
    if (response.data.success) {
      testResults.value[config.id] = {
        success: true,
        message: '连接成功！',
        models: response.data.models || []
      }
    } else {
      testResults.value[config.id] = {
        success: false,
        message: response.data.message || '连接失败'
      }
    }
    
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
    const response = await http.post(`/api/provider-configs/${config.id}/install`)
    
    if (response.data.success) {
      installResults.value[config.id] = {
        success: true,
        message: '安装成功！供应商已添加到系统配置'
      }
      
      // 更新配置状态为激活
      const configIndex = configs.value.findIndex(c => c?.id === config.id)
      if (configIndex !== -1 && configs.value[configIndex]) {
        configs.value[configIndex].status = 'active'
      }
    } else {
      installResults.value[config.id] = {
        success: false,
        message: response.data.message || '安装失败'
      }
    }
    
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
    installingConfigs.value.delete(config.id)
  }
}

const fetchProviders = async () => {
  try {
    const response = await http.get('/api/providers')
    providers.value = response.data
  } catch (error) {
    console.error('获取供应商列表失败:', error)
    providers.value = []
  }
}

// 获取配置列表
const fetchConfigs = async () => {
  try {
    loading.value = true
    const response = await http.get('/api/provider-configs')
    configs.value = response.data || []
  } catch (error) {
    console.error('获取配置列表失败:', error)
    configs.value = []
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
    toast.success('配置删除成功')
  } catch (error) {
    console.error('删除配置失败:', error)
    toast.error('删除配置失败')
  }
}

// 关闭弹窗
const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  editingConfig.value = null
}

// 保存配置
const handleConfigSave = async (configData: any) => {
  try {
    if (editingConfig.value?.id) {
      await http.put(`/api/provider-configs/${editingConfig.value.id}`, configData)
      toast.success('配置更新成功')
    } else {
      await http.post('/api/provider-configs', configData)
      toast.success('配置添加成功')
    }
    
    await fetchConfigs()
    closeModal()
  } catch (error) {
    console.error('保存配置失败:', error)
    toast.error('保存配置失败')
  }
}

// 初始化
onMounted(async () => {
  await Promise.all([
    fetchProviders(),
    fetchConfigs()
  ])
})
</script>

<style scoped>
.provider-config-page {
  padding: 24px;
  background: #ffffff;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  margin-bottom: 24px; /* 调整与搜索框间距为24px */
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 28px; /* 更专业的字号 */
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
  line-height: 1.2;
  letter-spacing: -0.02em; /* 专业排版 */
}

.page-description {
  font-size: 16px;
  color: #666666;
  margin: 0;
  line-height: 1.5;
}

.header-right {
  margin-left: 24px;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 16px; /* 调整与配置列表间距为16px */
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px; /* 左侧留出图标空间 */
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  color: #000000;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-icon-left {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #000000; /* 黑色图标 */
  pointer-events: none;
  z-index: 1;
}

/* 配置列表 */
.config-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px; /* 8px基准 * 3 */
  margin-bottom: 32px;
}

.config-card {
  background: #ffffff;
  border: 2px solid #e5e7eb;
  border-radius: 16px; /* 增加圆角 */
  padding: 24px; /* 8px基准 * 3 */
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); /* 轻微阴影 */
  position: relative;
  overflow: hidden;
}

.config-card:hover {
  border-color: #000000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12); /* 悬停阴影 */
  transform: translateY(-2px); /* 轻微上浮效果 */
}

.config-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px; /* 8px基准 * 2 */
}

.config-info {
  flex: 1;
  min-width: 0;
}

.config-name {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0; /* 8px基准 */
  line-height: 1.3;
  word-break: break-word;
}

.config-provider {
  font-size: 14px;
  color: #666666;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.config-url {
  font-size: 13px;
  color: #999999;
  margin: 0;
  font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;
  word-break: break-all;
}

.config-status {
  flex-shrink: 0;
  margin-left: 16px; /* 8px基准 * 2 */
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px; /* 调整内边距 */
  border-radius: 8px; /* 8px基准 */
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.active {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.config-description {
  margin: 16px 0; /* 8px基准 * 2 */
  font-size: 14px;
  color: #666666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.config-actions {
  display: flex;
  gap: 12px; /* 调整按钮间距 */
  margin-top: 20px; /* 增加顶部间距 */
  padding-top: 16px; /* 8px基准 * 2 */
  border-top: 1px solid #f3f4f6; /* 添加分割线 */
}

.config-details {
  margin-bottom: 12px;
}

.config-meta {
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.meta-item:last-child {
  border-bottom: none;
}

.meta-label {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
}

.meta-value {
  font-size: 14px;
  color: #000000;
}

.meta-value.status {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.meta-value.status.active {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.meta-value.status.inactive {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.config-preview {
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-title {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
}

.model-count {
  font-size: 12px;
  color: #666666;
}

.model-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.model-tag {
  background: #ffffff;
  color: #000000;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

.model-tag.more {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
}

.config-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

/* 按钮样式 */
.btn-primary {
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-primary:hover {
  background: #1f2937;
  border-color: #1f2937;
}

.btn-primary:disabled {
  background: #d1d5db;
  border-color: #d1d5db;
  cursor: not-allowed;
}

.btn-secondary {
  flex: 1;
  background: #ffffff;
  color: #000000;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-secondary:hover {
  border-color: #000000;
  background: #f9fafb;
}

.btn-secondary:disabled {
  background: #f9fafb;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.btn-icon {
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #666666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #000000;
}

.btn-icon.btn-danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* 测试和安装结果 */
.test-result,
.install-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid;
}

.test-result.success,
.install-result.success {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0369a1;
}

.test-result.error,
.install-result.error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.test-result-content,
.install-result-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.models-preview {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.8;
}

/* 分页控件 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  padding: 24px 0;
}

.pagination-btn {
  background: #ffffff;
  color: #000000;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #000000;
  background: #f9fafb;
}

.pagination-btn:disabled {
  background: #f9fafb;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
  margin: 0 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .provider-config-page {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-right {
    margin-left: 0;
    align-self: stretch;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .search-input-wrapper {
    max-width: none;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .pagination-info {
    margin: 0 8px;
  }
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px; /* 8px基准 * 10 + 8px基准 * 3 */
  color: #666666;
}

.loading-spinner {
  width: 32px; /* 8px基准 * 4 */
  height: 32px; /* 8px基准 * 4 */
  border: 3px solid #f3f4f6;
  border-top: 3px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px; /* 8px基准 * 2 */
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
  padding: 80px 24px; /* 8px基准 * 10 + 8px基准 * 3 */
  text-align: center;
}

.empty-icon {
  margin-bottom: 24px; /* 8px基准 * 3 */
  color: #d1d5db;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0; /* 8px基准 */
}

.empty-description {
  font-size: 16px; /* 8px基准 * 2 */
  color: #666666;
  margin: 0 0 24px 0; /* 8px基准 * 3 */
}

/* 按钮样式优化 */
.btn-primary {
  background: #000000;
  color: #ffffff;
  border: 2px solid #000000;
  padding: 10px 16px; /* 调整为8px基准 */
  border-radius: 8px; /* 8px基准 */
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* 8px基准 */
  min-height: 40px; /* 8px基准 * 5 */
}

.btn-primary:hover {
  background: #333333;
  border-color: #333333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: #ffffff;
  color: #000000;
  border: 2px solid #e5e7eb;
  padding: 10px 16px; /* 调整为8px基准 */
  border-radius: 8px; /* 8px基准 */
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* 8px基准 */
  min-height: 40px; /* 8px基准 * 5 */
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #000000;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-secondary:active {
  transform: translateY(0);
  background: #f3f4f6;
}

.btn-outline {
  background: transparent;
  color: #666666;
  border: 1px solid #e5e7eb;
  padding: 8px 12px; /* 8px基准 */
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 32px; /* 8px基准 * 4 */
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #000000;
}

.btn-icon {
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #666666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #f3f4f6;
  color: #000000;
}

.btn-icon.btn-danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* 测试和安装结果 */
.test-result,
.install-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid;
}

.test-result.success,
.install-result.success {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0369a1;
}

.test-result.error,
.install-result.error {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.test-result-content,
.install-result-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.models-preview {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.8;
}

/* 分页控件 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
  padding: 24px 0;
}

.pagination-btn {
  background: #ffffff;
  color: #000000;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #000000;
  background: #f9fafb;
}

.pagination-btn:disabled {
  background: #f9fafb;
  color: #9ca3af;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #666666;
  font-weight: 500;
  margin: 0 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .provider-config-page {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-right {
    margin-left: 0;
    align-self: stretch;
  }
  
  .config-grid {
    grid-template-columns: 1fr;
  }
  
  .search-input-wrapper {
    max-width: none;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .pagination-info {
    margin: 0 8px;
  }
}
</style>