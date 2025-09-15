<template>
  <div class="agent-create-form">
    <div class="form-header">
      <h2 class="form-title">创建智能体</h2>
      <p class="form-description">配置您的专属智能体，开始智能对话</p>
    </div>

    <form @submit.prevent="handleSubmit" class="form-content">
      <!-- 基础信息 -->
      <div class="form-section">
        <h3 class="section-title">基础信息</h3>
        
        <div class="form-group">
          <label for="name" class="form-label">智能体名称 *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="请输入智能体名称"
            :class="{ 'error': errors.name }"
            required
          />
          <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">描述</label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-textarea"
            placeholder="请描述智能体的功能和特点"
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="systemPrompt" class="form-label">系统提示词 *</label>
          <textarea
            id="systemPrompt"
            v-model="formData.systemPrompt"
            class="form-textarea"
            placeholder="请输入系统提示词，定义智能体的行为和角色"
            rows="5"
            :class="{ 'error': errors.systemPrompt }"
            required
          ></textarea>
          <span v-if="errors.systemPrompt" class="error-text">{{ errors.systemPrompt }}</span>
        </div>
      </div>

      <!-- 模型配置 -->
      <div class="form-section">
        <h3 class="section-title">模型配置</h3>
        
        <div class="form-group">
          <label for="model" class="form-label">选择模型 *</label>
          <select
            id="model"
            v-model="formData.config.model"
            class="form-select"
            :class="{ 'error': errors.model }"
            required
          >
            <option value="">请选择模型</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
          </select>
          <span v-if="errors.model" class="error-text">{{ errors.model }}</span>
        </div>

        <div class="form-group">
          <label for="temperature" class="form-label">温度 ({{ formData.config.temperature }})</label>
          <input
            id="temperature"
            v-model.number="formData.config.temperature"
            type="range"
            min="0"
            max="2"
            step="0.1"
            class="form-range"
          />
          <div class="range-labels">
            <span>保守</span>
            <span>创造</span>
          </div>
        </div>

        <div class="form-group">
          <label for="maxTokens" class="form-label">最大令牌数</label>
          <input
            id="maxTokens"
            v-model.number="formData.config.maxTokens"
            type="number"
            class="form-input"
            placeholder="4096"
            min="1"
            max="32768"
          />
        </div>
      </div>

      <!-- MCP 配置 -->
      <div class="form-section">
        <h3 class="section-title">MCP 配置</h3>
        
        <div class="form-group">
          <div class="checkbox-group">
            <input
              id="enableMcp"
              v-model="formData.config.mcpConfig.enabled"
              type="checkbox"
              class="form-checkbox"
            />
            <label for="enableMcp" class="checkbox-label">启用 MCP 协议</label>
          </div>
        </div>

        <div v-if="formData.config.mcpConfig.enabled" class="mcp-config">
          <div class="form-group">
            <label for="mcpEndpoint" class="form-label">MCP 端点</label>
            <input
              id="mcpEndpoint"
              v-model="formData.config.mcpConfig.endpoint"
              type="url"
              class="form-input"
              placeholder="https://api.example.com/mcp"
            />
          </div>

          <div class="form-group">
            <label for="mcpApiKey" class="form-label">API 密钥</label>
            <input
              id="mcpApiKey"
              v-model="formData.config.mcpConfig.apiKey"
              type="password"
              class="form-input"
              placeholder="请输入 MCP API 密钥"
            />
          </div>

          <div class="form-group">
            <label class="form-label">可用工具</label>
            <div class="tools-grid">
              <div
                v-for="tool in availableTools"
                :key="tool.id"
                class="tool-item"
              >
                <input
                  :id="`tool-${tool.id}`"
                  v-model="formData.config.mcpConfig.tools"
                  :value="tool.id"
                  type="checkbox"
                  class="form-checkbox"
                />
                <label :for="`tool-${tool.id}`" class="tool-label">
                  <span class="tool-name">{{ tool.name }}</span>
                  <span class="tool-description">{{ tool.description }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据集配置 -->
      <div class="form-section">
        <h3 class="section-title">数据集配置</h3>
        
        <div class="form-group">
          <div class="checkbox-group">
            <input
              id="enableDataset"
              v-model="formData.config.datasetConfig.enabled"
              type="checkbox"
              class="form-checkbox"
            />
            <label for="enableDataset" class="checkbox-label">启用数据集</label>
          </div>
        </div>

        <div v-if="formData.config.datasetConfig.enabled" class="dataset-config">
          <div class="form-group">
            <label class="form-label">选择数据集</label>
            <div class="dataset-list">
              <div
                v-for="dataset in availableDatasets"
                :key="dataset.id"
                class="dataset-item"
                :class="{ 'selected': formData.config.datasetConfig.datasetIds.includes(dataset.id) }"
                @click="toggleDataset(dataset.id)"
              >
                <div class="dataset-info">
                  <h4 class="dataset-name">{{ dataset.name }}</h4>
                  <p class="dataset-description">{{ dataset.description }}</p>
                  <div class="dataset-meta">
                    <span class="dataset-size">{{ dataset.size }} 条记录</span>
                    <span class="dataset-type">{{ dataset.type }}</span>
                  </div>
                </div>
                <div class="dataset-checkbox">
                  <input
                    :checked="formData.config.datasetConfig.datasetIds.includes(dataset.id)"
                    type="checkbox"
                    class="form-checkbox"
                    @click.stop
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 记忆功能 -->
      <div class="form-section">
        <h3 class="section-title">记忆功能</h3>
        
        <div class="form-group">
          <div class="checkbox-group">
            <input
              id="enableMemory"
              v-model="formData.config.memoryConfig.enabled"
              type="checkbox"
              class="form-checkbox"
            />
            <label for="enableMemory" class="checkbox-label">启用记忆功能</label>
          </div>
          <p class="form-help">启用后，智能体将记住对话历史，提供更连贯的交互体验</p>
        </div>

        <div v-if="formData.config.memoryConfig.enabled" class="memory-config">
          <div class="form-group">
            <label for="memoryType" class="form-label">记忆类型</label>
            <select
              id="memoryType"
              v-model="formData.config.memoryConfig.type"
              class="form-select"
            >
              <option value="short_term">短期记忆</option>
              <option value="long_term">长期记忆</option>
              <option value="hybrid">混合记忆</option>
            </select>
          </div>

          <div class="form-group">
            <label for="memoryLimit" class="form-label">记忆限制 (条消息)</label>
            <input
              id="memoryLimit"
              v-model.number="formData.config.memoryConfig.maxMessages"
              type="number"
              class="form-input"
              placeholder="100"
              min="1"
              max="1000"
            />
          </div>
        </div>
      </div>

      <!-- 表单操作 -->
      <div class="form-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="$emit('cancel')"
          :disabled="isSubmitting"
        >
          取消
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isSubmitting || !isFormValid"
        >
          <span v-if="isSubmitting" class="loading-spinner"></span>
          {{ isSubmitting ? '创建中...' : '创建智能体' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import type { Agent, AgentCreateRequest } from '@/types/agent'

// Props
interface Props {
  initialData?: Agent | null
  isSubmitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialData: null,
  isSubmitting: false
})

// Emits
interface Emits {
  submit: [data: AgentCreateRequest]
  cancel: []
}

const emit = defineEmits<Emits>()

// 表单数据
const formData = reactive<AgentCreateRequest>({
  name: '',
  description: '',
  systemPrompt: '',
  config: {
    model: '',
    temperature: 0.7,
    maxTokens: 4096,
    mcpConfig: {
      enabled: false,
      endpoint: '',
      apiKey: '',
      tools: []
    },
    datasetConfig: {
      enabled: false,
      datasetIds: []
    },
    memoryConfig: {
      enabled: true,
      type: 'short_term',
      maxMessages: 100
    }
  }
})

// 表单验证错误
const errors = ref<Record<string, string>>({})

// 可用工具列表
const availableTools = ref([
  {
    id: 'web_search',
    name: '网络搜索',
    description: '搜索互联网获取最新信息'
  },
  {
    id: 'code_interpreter',
    name: '代码解释器',
    description: '执行和解释代码'
  },
  {
    id: 'file_manager',
    name: '文件管理',
    description: '读取和管理文件'
  },
  {
    id: 'image_generator',
    name: '图像生成',
    description: '生成和编辑图像'
  }
])

// 可用数据集列表
const availableDatasets = ref([
  {
    id: '1',
    name: '通用知识库',
    description: '包含各领域的通用知识和常见问题解答',
    size: 10000,
    type: 'QA'
  },
  {
    id: '2',
    name: '技术文档',
    description: '编程、开发相关的技术文档和教程',
    size: 5000,
    type: 'Document'
  },
  {
    id: '3',
    name: '产品手册',
    description: '产品使用说明和操作指南',
    size: 2000,
    type: 'Manual'
  }
])

// 计算属性
const isFormValid = computed(() => {
  return formData.name.trim() !== '' && 
         formData.systemPrompt.trim() !== '' && 
         formData.config.model !== ''
})

// 方法
function validateForm(): boolean {
  errors.value = {}
  
  if (!formData.name.trim()) {
    errors.value.name = '请输入智能体名称'
  }
  
  if (!formData.systemPrompt.trim()) {
    errors.value.systemPrompt = '请输入系统提示词'
  }
  
  if (!formData.config.model) {
    errors.value.model = '请选择模型'
  }
  
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validateForm()) {
    return
  }
  
  emit('submit', { ...formData })
}

function toggleDataset(datasetId: string) {
  const index = formData.config.datasetConfig.datasetIds.indexOf(datasetId)
  if (index > -1) {
    formData.config.datasetConfig.datasetIds.splice(index, 1)
  } else {
    formData.config.datasetConfig.datasetIds.push(datasetId)
  }
}
</script>

<style scoped>
.agent-create-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 32px;
  text-align: center;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
}

.form-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea,
.form-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  color: #1f2937;
  background: #ffffff;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-textarea.error,
.form-select.error {
  border-color: #ef4444;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.form-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
}

.checkbox-label {
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.form-help {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.error-text {
  font-size: 12px;
  color: #ef4444;
}

.mcp-config,
.dataset-config,
.memory-config {
  margin-left: 24px;
  padding-left: 16px;
  border-left: 2px solid #e5e7eb;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.tool-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.tool-label {
  flex: 1;
  cursor: pointer;
}

.tool-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 4px;
}

.tool-description {
  display: block;
  font-size: 12px;
  color: #6b7280;
}

.dataset-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dataset-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dataset-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.dataset-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.dataset-info {
  flex: 1;
}

.dataset-name {
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.dataset-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.dataset-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
}

.dataset-checkbox {
  margin-left: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.btn-primary {
  background: #3b82f6;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .agent-create-form {
    padding: 16px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>