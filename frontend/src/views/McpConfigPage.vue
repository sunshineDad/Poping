<template>
  <div class="mcp-config-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">MCP配置管理</h1>
          <p class="page-description">管理模型连接协议(MCP)配置，连接第三方工具和服务</p>
        </div>
        <div class="header-right">
          <button @click="showAddModal = true" class="btn-primary">
            <IconComponents name="plus" size="sm" />
            添加MCP配置
          </button>
        </div>
      </div>
    </div>

    <!-- 配置列表 -->
    <div class="config-list">
      <div v-if="configs.length === 0" class="empty-state">
        <div class="empty-icon">
          <IconComponents name="settings" size="lg" />
        </div>
        <h3 class="empty-title">暂无MCP配置</h3>
        <p class="empty-description">添加MCP配置来连接第三方工具和服务</p>
        <button @click="showAddModal = true" class="btn-primary">
          添加第一个配置
        </button>
      </div>

      <div v-else class="config-grid">
        <div 
          v-for="config in configs" 
          :key="config.id" 
          class="config-card"
          :class="{ 'config-active': config.status === 'active' }"
        >
          <div class="config-header">
            <div class="config-info">
              <h3 class="config-name">{{ config.name }}</h3>
              <p class="config-description">{{ config.description }}</p>
            </div>
            <div class="config-actions">
              <button 
                @click="toggleConfigStatus(config)" 
                class="btn-toggle"
                :class="{ 'active': config.status === 'active' }"
                :title="config.status === 'active' ? '禁用' : '启用'"
              >
                <IconComponents :name="config.status === 'active' ? 'info' : 'settings'" size="sm" />
              </button>
              <button @click="editConfig(config)" class="btn-action" title="编辑">
                <IconComponents name="edit" size="sm" />
              </button>
              <button @click="deleteConfig(config)" class="btn-action btn-danger" title="删除">
                <IconComponents name="trash" size="sm" />
              </button>
            </div>
          </div>

          <div class="config-details">
            <div class="config-meta">
              <div class="meta-item">
                <span class="meta-label">类型</span>
                <span class="meta-value">{{ getConfigTypeText(config.type) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">状态</span>
                <span class="status-badge" :class="getStatusClass(config.status)">
                  {{ getStatusText(config.status) }}
                </span>
              </div>
              <div class="meta-item">
                <span class="meta-label">最后测试</span>
                <span class="meta-value">{{ formatDate(config.lastTested) }}</span>
              </div>
            </div>

            <div class="config-preview">
              <div class="preview-header">
                <span class="preview-label">配置预览</span>
                <button @click="togglePreview(config.id)" class="btn-preview">
                  <IconComponents :name="expandedConfigs.includes(config.id) ? 'info' : 'chevron-down'" size="sm" />
                </button>
              </div>
              <div v-if="expandedConfigs.includes(config.id)" class="preview-content">
                <pre class="json-preview">{{ formatJsonPreview(config.config) }}</pre>
              </div>
            </div>

            <div class="config-footer">
              <button @click="testConfig(config)" class="btn-test" :disabled="config.testing">
                <IconComponents name="rocket" size="sm" />
                {{ config.testing ? '测试中...' : '测试连接' }}
              </button>
              <button @click="duplicateConfig(config)" class="btn-secondary">
                <IconComponents name="share" size="sm" />
                复制配置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑配置模态框 -->
    <div v-if="showAddModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ showEditModal ? '编辑MCP配置' : '添加MCP配置' }}</h2>
          <button @click="closeModal" class="modal-close">
            <IconComponents name="delete" size="sm" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveConfig">
            <div class="form-group">
              <label>配置名称 *</label>
              <input 
                v-model="configForm.name" 
                type="text" 
                placeholder="输入配置名称"
                required 
              />
            </div>
            
            <div class="form-group">
              <label>配置描述</label>
              <textarea 
                v-model="configForm.description" 
                placeholder="描述此配置的用途和功能"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label>配置类型 *</label>
              <select v-model="configForm.type" required>
                <option value="">选择配置类型</option>
                <option value="tool">工具连接</option>
                <option value="service">服务集成</option>
                <option value="database">数据库连接</option>
                <option value="api">API接口</option>
                <option value="custom">自定义配置</option>
              </select>
            </div>

            <div class="form-group">
              <label>MCP配置 (JSON格式) *</label>
              <div class="json-editor">
                <textarea 
                  v-model="configForm.config" 
                  placeholder="输入JSON格式的MCP配置"
                  rows="12"
                  class="json-input"
                  :class="{ 'json-error': jsonError }"
                  @input="validateJson"
                  required
                ></textarea>
                <div v-if="jsonError" class="json-error-message">
                  {{ jsonError }}
                </div>
                <div class="json-help">
                  <details>
                    <summary>配置示例</summary>
                    <div class="json-examples">
                      <div class="example-item">
                        <h4>工具连接示例</h4>
                        <pre>{
  "name": "搜索工具",
  "type": "search",
  "endpoint": "https://api.example.com/search",
  "auth": {
    "type": "bearer",
    "token": "your-api-token"
  },
  "parameters": {
    "timeout": 30000,
    "retries": 3
  }
}</pre>
                      </div>
                      <div class="example-item">
                        <h4>数据库连接示例</h4>
                        <pre>{
  "name": "MySQL数据库",
  "type": "database",
  "connection": {
    "host": "localhost",
    "port": 3306,
    "database": "mydb",
    "username": "user",
    "password": "password"
  },
  "options": {
    "ssl": false,
    "timeout": 10000
  }
}</pre>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                取消
              </button>
              <button type="submit" class="btn-primary" :disabled="!!jsonError || !configForm.name || !configForm.config">
                {{ showEditModal ? '更新配置' : '添加配置' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 测试结果模态框 -->
    <div v-if="showTestModal" class="modal-overlay" @click="showTestModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>连接测试结果</h2>
          <button @click="showTestModal = false" class="modal-close">
            <IconComponents name="delete" size="sm" />
          </button>
        </div>
        <div class="modal-body">
          <div class="test-result" :class="testResult.success ? 'test-success' : 'test-error'">
            <div class="test-icon">
              <IconComponents :name="testResult.success ? 'info' : 'delete'" size="lg" />
            </div>
            <div class="test-content">
              <h3>{{ testResult.success ? '连接成功' : '连接失败' }}</h3>
              <p>{{ testResult.message }}</p>
              <div v-if="testResult.details" class="test-details">
                <pre>{{ testResult.details }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import IconComponents from '@/components/icons/IconComponents.vue'
import { confirmDialog } from '@/utils/confirm'

// 类型定义
interface McpConfig {
  id: string
  name: string
  description: string
  type: 'tool' | 'service' | 'database' | 'api' | 'custom'
  config: string // JSON字符串
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
  lastTested?: string
  testing?: boolean
}

interface TestResult {
  success: boolean
  message: string
  details?: string
}

// 响应式数据
const configs = ref<McpConfig[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showTestModal = ref(false)
const expandedConfigs = ref<string[]>([])
const jsonError = ref('')
const testResult = ref<TestResult>({ success: false, message: '' })

const configForm = ref({
  id: '',
  name: '',
  description: '',
  type: '' as McpConfig['type'] | '',
  config: ''
})

// 计算属性
const activeConfigs = computed(() => configs.value.filter(c => c.status === 'active'))
const inactiveConfigs = computed(() => configs.value.filter(c => c.status === 'inactive'))

// 方法
const loadConfigs = async () => {
  // 模拟数据
  configs.value = [
    {
      id: '1',
      name: '搜索工具配置',
      description: '连接Google搜索API，提供实时搜索功能',
      type: 'tool',
      config: JSON.stringify({
        name: '搜索工具',
        type: 'search',
        endpoint: 'https://api.google.com/search',
        auth: {
          type: 'bearer',
          token: 'your-api-token'
        },
        parameters: {
          timeout: 30000,
          retries: 3
        }
      }, null, 2),
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      lastTested: '2024-01-15T15:30:00Z'
    },
    {
      id: '2',
      name: 'MySQL数据库',
      description: '生产环境MySQL数据库连接配置',
      type: 'database',
      config: JSON.stringify({
        name: 'MySQL数据库',
        type: 'database',
        connection: {
          host: 'prod-mysql.example.com',
          port: 3306,
          database: 'production_db',
          username: 'app_user',
          password: '****'
        },
        options: {
          ssl: true,
          timeout: 10000
        }
      }, null, 2),
      status: 'inactive',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-12T14:20:00Z',
      lastTested: '2024-01-12T14:25:00Z'
    }
  ]
}

const getConfigTypeText = (type: string) => {
  const typeMap = {
    tool: '工具连接',
    service: '服务集成',
    database: '数据库连接',
    api: 'API接口',
    custom: '自定义配置'
  }
  return typeMap[type as keyof typeof typeMap] || type
}

const getStatusClass = (status: string) => {
  return {
    'status-active': status === 'active',
    'status-inactive': status === 'inactive'
  }
}

const getStatusText = (status: string) => {
  return status === 'active' ? '已启用' : '已禁用'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '未测试'
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatJsonPreview = (jsonString: string) => {
  try {
    const parsed = JSON.parse(jsonString)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return jsonString
  }
}

const togglePreview = (configId: string) => {
  const index = expandedConfigs.value.indexOf(configId)
  if (index > -1) {
    expandedConfigs.value.splice(index, 1)
  } else {
    expandedConfigs.value.push(configId)
  }
}

const validateJson = () => {
  if (!configForm.value.config.trim()) {
    jsonError.value = ''
    return
  }
  
  try {
    JSON.parse(configForm.value.config)
    jsonError.value = ''
  } catch (error) {
    jsonError.value = 'JSON格式错误: ' + (error as Error).message
  }
}

const toggleConfigStatus = (config: McpConfig) => {
  config.status = config.status === 'active' ? 'inactive' : 'active'
  config.updatedAt = new Date().toISOString()
}

const editConfig = (config: McpConfig) => {
  configForm.value = {
    id: config.id,
    name: config.name,
    description: config.description,
    type: config.type,
    config: config.config
  }
  showEditModal.value = true
}

const deleteConfig = async (config: McpConfig) => {
  if (await confirmDialog(`确定要删除配置 "${config.name}" 吗？`)) {
    const index = configs.value.findIndex(c => c.id === config.id)
    if (index > -1) {
      configs.value.splice(index, 1)
    }
  }
}

const duplicateConfig = (config: McpConfig) => {
  const newConfig: McpConfig = {
    ...config,
    id: Date.now().toString(),
    name: config.name + ' (副本)',
    status: 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastTested: undefined
  }
  configs.value.push(newConfig)
}

const testConfig = async (config: McpConfig) => {
  config.testing = true
  
  // 模拟测试过程
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 模拟测试结果
  const success = Math.random() > 0.3 // 70%成功率
  
  testResult.value = {
    success,
    message: success ? '连接测试成功，配置有效' : '连接测试失败，请检查配置',
    details: success ? '响应时间: 245ms\n状态: 正常' : '错误: 连接超时\n建议: 检查网络连接和配置参数'
  }
  
  config.testing = false
  config.lastTested = new Date().toISOString()
  showTestModal.value = true
}

const saveConfig = () => {
  if (jsonError.value) return
  
  const now = new Date().toISOString()
  
  if (showEditModal.value) {
    // 更新现有配置
    const index = configs.value.findIndex(c => c.id === configForm.value.id)
    if (index > -1) {
      configs.value[index] = {
        ...configs.value[index],
        name: configForm.value.name,
        description: configForm.value.description,
        type: configForm.value.type as McpConfig['type'],
        config: configForm.value.config,
        updatedAt: now
      }
    }
  } else {
    // 添加新配置
    const newConfig: McpConfig = {
      id: Date.now().toString(),
      name: configForm.value.name,
      description: configForm.value.description,
      type: configForm.value.type as McpConfig['type'],
      config: configForm.value.config,
      status: 'inactive',
      createdAt: now,
      updatedAt: now
    }
    configs.value.push(newConfig)
  }
  
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  jsonError.value = ''
  configForm.value = {
    id: '',
    name: '',
    description: '',
    type: '',
    config: ''
  }
}

// 生命周期
onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.mcp-config-page {
  padding: 24px;
  max-width: 1400px;
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

.btn-primary:disabled {
  background: var(--color-gray-300);
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: var(--color-gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-400);
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 16px;
  color: var(--color-gray-600);
  margin: 0 0 24px 0;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.config-card {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease;
}

.config-card:hover {
  border-color: var(--color-gray-300);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.config-card.config-active {
  border-color: var(--color-brand-primary);
  background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.config-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 4px 0;
}

.config-description {
  font-size: 14px;
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.4;
}

.config-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-toggle {
  width: 40px;
  height: 24px;
  border: none;
  background: var(--color-gray-300);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-600);
}

.btn-toggle.active {
  background: var(--color-brand-primary);
  color: white;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: var(--color-gray-200);
}

.btn-action.btn-danger {
  background: var(--color-semantic-warning);
  color: white;
}

.btn-action.btn-danger:hover {
  background: #dc2626;
}

.config-details {
  border-top: 1px solid var(--color-gray-100);
  padding-top: 20px;
}

.config-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 14px;
  color: var(--color-gray-900);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background: var(--color-semantic-success);
  color: white;
}

.status-inactive {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.config-preview {
  margin-bottom: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-preview {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--color-gray-400);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.btn-preview:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-600);
}

.preview-content {
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: 6px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.json-preview {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-gray-700);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.config-footer {
  display: flex;
  gap: 12px;
}

.btn-test {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-semantic-success);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-test:hover {
  background: #059669;
}

.btn-test:disabled {
  background: var(--color-gray-300);
  cursor: not-allowed;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: transparent;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
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
  max-width: 800px;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-brand-primary);
}

.json-editor {
  position: relative;
}

.json-input {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.4;
  resize: vertical;
}

.json-input.json-error {
  border-color: var(--color-semantic-warning);
}

.json-error-message {
  color: var(--color-semantic-warning);
  font-size: 12px;
  margin-top: 4px;
}

.json-help {
  margin-top: 12px;
}

.json-help summary {
  font-size: 12px;
  color: var(--color-gray-600);
  cursor: pointer;
  padding: 8px 0;
}

.json-examples {
  margin-top: 12px;
}

.example-item {
  margin-bottom: 16px;
}

.example-item h4 {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-gray-700);
  margin: 0 0 6px 0;
}

.example-item pre {
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: 4px;
  padding: 8px;
  font-size: 11px;
  margin: 0;
  overflow-x: auto;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.test-result {
  display: flex;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
}

.test-result.test-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.test-result.test-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
}

.test-icon {
  flex-shrink: 0;
}

.test-success .test-icon {
  color: var(--color-semantic-success);
}

.test-error .test-icon {
  color: var(--color-semantic-warning);
}

.test-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.test-success .test-content h3 {
  color: #166534;
}

.test-error .test-content h3 {
  color: #991b1b;
}

.test-content p {
  font-size: 14px;
  margin: 0 0 12px 0;
}

.test-success .test-content p {
  color: #15803d;
}

.test-error .test-content p {
  color: #dc2626;
}

.test-details {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  padding: 8px;
}

.test-details pre {
  font-family: var(--font-mono);
  font-size: 12px;
  margin: 0;
  white-space: pre-wrap;
}
</style>