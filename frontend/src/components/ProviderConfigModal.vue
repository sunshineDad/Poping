<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEdit ? '编辑供应商配置' : '添加供应商配置' }}</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="provider">供应商</label>
          <select 
            id="provider" 
            v-model="form.providerId" 
            :disabled="isEdit"
            required
            class="form-select"
          >
            <option value="">请选择供应商</option>
            <option 
              v-for="provider in providers" 
              :key="provider.id" 
              :value="provider.id"
            >
              {{ provider.name }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="configName">配置名称</label>
          <input 
            id="configName"
            v-model="form.name" 
            type="text" 
            placeholder="输入配置名称"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="apiUrl">API URL</label>
          <input 
            id="apiUrl"
            v-model="form.apiUrl" 
            type="url" 
            placeholder="https://api.openai.com/v1"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="apiKey">API Key</label>
          <input 
            id="apiKey"
            v-model="form.apiKey" 
            type="password" 
            placeholder="输入API密钥"
            required
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="description">描述（可选）</label>
          <textarea 
            id="description"
            v-model="form.description" 
            placeholder="供应商配置描述"
            rows="3"
            class="form-textarea"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button 
            type="button" 
            @click="emit('close')" 
            class="btn-secondary"
          >
            取消
          </button>
          <button 
            type="button" 
            @click="testConnection" 
            :disabled="testing || !form.providerId || !form.apiUrl || !form.apiKey"
            class="btn-test"
          >
            <IconComponents v-if="testing" name="loading" size="sm" />
            <IconComponents v-else name="wifi" size="sm" />
            {{ testing ? '测试中...' : '测试连接' }}
          </button>
          <button 
            type="submit" 
            :disabled="submitting"
            class="btn-primary"
          >
            <IconComponents v-if="submitting" name="loading" size="sm" />
            {{ submitting ? '保存中...' : '保存配置' }}
          </button>
        </div>
      </form>
      
      <!-- 测试结果 -->
      <div v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'error'">
        <div class="test-message">
          {{ testResult.message }}
        </div>
        <div v-if="testResult.models && testResult.models.length > 0" class="models-preview">
          <h4>可用模型 ({{ testResult.models.length }}个):</h4>
          <div class="models-list">
            <span v-for="model in testResult.models.slice(0, 5)" :key="model.id" class="model-tag">
              {{ model.name || model.id }}
            </span>
            <span v-if="testResult.models.length > 5" class="more-models">
              +{{ testResult.models.length - 5 }}个
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { http } from '@/utils/http'
import { toast } from '@/utils/toast'
import IconComponents from '@/components/IconComponents.vue'
import type { Provider, ProviderConfig, TestResult } from '@/types/provider'

const props = defineProps<{
  visible: boolean
  providers: Provider[]
  config?: ProviderConfig
}>()

const emit = defineEmits<{
  close: []
  save: [config: ProviderConfig]
}>()

const form = reactive<ProviderConfig>({
  providerId: '',
  name: '',  // 添加 name 字段
  apiUrl: '',
  apiKey: '',
  description: ''
})

const submitting = ref(false)
const testing = ref(false)
const testResult = ref<TestResult | null>(null)

const isEdit = computed(() => !!props.config?.id)

const resetForm = () => {
  Object.assign(form, {
    providerId: '',
    apiUrl: '',
    apiKey: '',
    description: ''
  })
}

// 监听配置变化，重置表单
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    Object.assign(form, newConfig)
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听弹窗显示状态
watch(() => props.visible, (visible) => {
  if (visible) {
    testResult.value = null
  }
})

const handleOverlayClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

const testConnection = async () => {
  if (!form.providerId || !form.apiUrl || !form.apiKey) {
    testResult.value = {
      success: false,
      message: '请填写完整的供应商信息'
    }
    return
  }
  
  testing.value = true
  testResult.value = null
  
  try {
    const response = await http.post('/providers/test', {
      providerId: form.providerId,
      apiUrl: form.apiUrl,
      apiKey: form.apiKey
    })
    
    if (response.code === 200) {
      testResult.value = {
        success: true,
        message: '连接测试成功！',
        models: response.data?.models || []
      }
    } else {
      testResult.value = {
        success: false,
        message: response.message || '连接测试失败'
      }
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: error.message || '连接测试失败'
    }
  } finally {
    testing.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  
  try {
    const response = await http.post('/providers/config', form)
    
    if (response.code === 200) {
      emit('save', response.data)
      emit('close')
    } else {
      throw new Error(response.message || '保存失败')
    }
  } catch (error: any) {
    console.error('保存供应商配置失败:', error)
    // 这里可以添加错误提示
  } finally {
    submitting.value = false
  }
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1F2937;
}

.close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6B7280;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #F3F4F6;
  color: #374151;
}

.modal-form {
  padding: 0 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  color: #1F2937;
  background: white;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.btn-primary,
.btn-secondary,
.btn-test {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: #000000;
  color: #ffffff;
  border: 1px solid #000000;
}

.btn-primary:hover:not(:disabled) {
  background: #333333;
  border-color: #333333;
}

.btn-primary:disabled {
  background: #666666;
  border-color: #666666;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #ffffff;
  color: #000000;
  border: 1px solid #000000;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-test {
  background: #ffffff;
  color: #000000;
  border: 1px solid #000000;
}

.btn-test:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn-test:disabled {
  background: #f5f5f5;
  color: #666666;
  border-color: #cccccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.test-result {
  margin: 20px 24px 0;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid;
}

.test-result.success {
  background: #F0FDF4;
  border-color: #10B981;
  color: #065F46;
}

.test-result.error {
  background: #FEF2F2;
  border-color: #EF4444;
  color: #991B1B;
}

.test-message {
  font-weight: 500;
  margin-bottom: 12px;
}

.models-preview h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.models-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.model-tag {
  background: rgba(16, 185, 129, 0.1);
  color: #065F46;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.more-models {
  background: rgba(107, 114, 128, 0.1);
  color: #4B5563;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
</style>