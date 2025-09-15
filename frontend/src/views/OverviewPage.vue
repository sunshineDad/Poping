<template>
  <div class="overview-page dark-theme">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">总览仪表板</h1>
    </div>

    <!-- 数据图表 -->
    <div class="charts-section">
      <div class="charts-grid">
        <LineChart 
          title="API 调用趋势" 
          :data="apiCallsData['7d']" 
        />
        <LineChart 
          title="智能体使用情况" 
          :data="agentUsageData['7d']" 
        />
      </div>
    </div>

    <!-- API-Key管理模块 -->
    <div class="api-key-section">
      <h2 class="section-title">API-Key 管理</h2>
      <div class="api-key-card">
        <div class="api-key-header">
          <div class="api-key-info">
            <h3>您的 API 密钥</h3>
            <p>用于访问平台 API 服务</p>
          </div>
          <button @click="generateApiKey" class="generate-btn" :disabled="isGenerating">
            <svg v-if="!isGenerating" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div v-else class="loading-spinner"></div>
            {{ isGenerating ? '生成中...' : '生成新密钥' }}
          </button>
        </div>
        
        <div v-if="apiKey" class="api-key-display">
          <div class="key-input-group">
            <input 
              :type="showApiKey ? 'text' : 'password'" 
              :value="apiKey" 
              readonly 
              class="api-key-input"
            />
            <button @click="toggleApiKeyVisibility" class="toggle-btn">
              <svg v-if="showApiKey" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.94 17.94C16.2306 19.2719 14.1491 19.9993 12 20C5 20 1 12 1 12C2.24389 9.68192 4.02643 7.65663 6.17 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4282 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5718 9.14351 13.1984C8.99262 12.8251 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1 1L23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button @click="copyApiKey" class="copy-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <p class="api-key-warning">⚠️ 请妥善保管您的 API 密钥，不要与他人分享</p>
        </div>
      </div>
    </div>

    <!-- 示例代码模块 -->
    <div class="code-examples-section">
      <h2 class="section-title">示例代码</h2>
      <div class="code-examples-card">
        <div class="language-tabs">
          <button 
            v-for="lang in codeLanguages" 
            :key="lang.id"
            @click="selectedLanguage = lang.id"
            :class="['tab-btn', { active: selectedLanguage === lang.id }]"
          >
            {{ lang.name }}
          </button>
        </div>
        
        <div class="code-content">
          <div class="code-header">
            <span class="code-title">{{ getCurrentExample().title }}</span>
            <button @click="copyCode" class="copy-code-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              复制代码
            </button>
          </div>
          <pre class="code-block"><code>{{ getCurrentExample().code }}</code></pre>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LineChart from '@/components/charts/LineChart.vue'

const userStore = useAuthStore()

// 图表数据
const apiCallsData = ref({
  '7d': [
    { label: '1/15', value: 120 },
    { label: '1/16', value: 150 },
    { label: '1/17', value: 180 },
    { label: '1/18', value: 220 },
    { label: '1/19', value: 190 },
    { label: '1/20', value: 280 },
    { label: '1/21', value: 320 }
  ],
  '30d': [
    { label: '12/23', value: 1200 },
    { label: '12/30', value: 1500 },
    { label: '1/6', value: 1800 },
    { label: '1/13', value: 2200 },
    { label: '1/20', value: 2800 }
  ],
  '90d': [
    { label: '10月', value: 8500 },
    { label: '11月', value: 12000 },
    { label: '12月', value: 15600 },
    { label: '1月', value: 18200 }
  ]
})

const agentUsageData = ref({
  '7d': [
    { label: '1/15', value: 8 },
    { label: '1/16', value: 12 },
    { label: '1/17', value: 15 },
    { label: '1/18', value: 18 },
    { label: '1/19', value: 14 },
    { label: '1/20', value: 22 },
    { label: '1/21', value: 25 }
  ],
  '30d': [
    { label: '12/23', value: 45 },
    { label: '12/30', value: 52 },
    { label: '1/6', value: 68 },
    { label: '1/13', value: 75 },
    { label: '1/20', value: 82 }
  ],
  '90d': [
    { label: '10月', value: 120 },
    { label: '11月', value: 180 },
    { label: '12月', value: 220 },
    { label: '1月', value: 280 }
  ]
})

// API-Key 管理
const apiKey = ref('')
const showApiKey = ref(false)
const isGenerating = ref(false)

// 示例代码
const selectedLanguage = ref('curl')
const codeLanguages = ref([
  { id: 'curl', name: 'cURL' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' }
])

const codeExamples = ref({
  curl: {
    title: '调用智能体 API',
    code: `curl -X POST "https://api.poping.ai/v1/agents/chat" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "agent_123",
    "message": "Hello, how can you help me?",
    "stream": false
  }'`
  },
  javascript: {
    title: '使用 JavaScript SDK',
    code: `import { PopingAI } from '@poping/sdk';

const client = new PopingAI({
  apiKey: 'YOUR_API_KEY'
});

const response = await client.agents.chat({
  agentId: 'agent_123',
  message: 'Hello, how can you help me?'
});

console.log(response.message);`
  },
  python: {
    title: '使用 Python SDK',
    code: `from poping_ai import PopingAI

client = PopingAI(api_key="YOUR_API_KEY")

response = client.agents.chat(
    agent_id="agent_123",
    message="Hello, how can you help me?"
)

print(response.message)`
  },
  java: {
    title: '使用 Java SDK',
    code: `import ai.poping.PopingAI;
import ai.poping.models.ChatRequest;

PopingAI client = new PopingAI("YOUR_API_KEY");

ChatRequest request = ChatRequest.builder()
    .agentId("agent_123")
    .message("Hello, how can you help me?")
    .build();

ChatResponse response = client.agents().chat(request);
System.out.println(response.getMessage());`
  }
})

// 加载图表数据
const loadChartData = async () => {
  try {
    // TODO: 实现实际的API调用获取图表数据
    // 当前使用模拟数据
    console.log('图表数据已加载')
  } catch (error) {
    console.error('加载图表数据失败:', error)
  }
}

// 加载用户的API Key
const loadApiKey = async () => {
  try {
    // TODO: 调用实际的API
    // const response = await fetch('/api/user/api-key')
    // const data = await response.json()
    
    // 模拟已有的API Key
    apiKey.value = 'pk_test_1234567890abcdef1234567890abcdef'
  } catch (error) {
    console.error('加载API Key失败:', error)
  }
}

// 生成新的API Key
const generateApiKey = async () => {
  isGenerating.value = true
  try {
    // TODO: 调用实际的API
    // const response = await fetch('/api/user/api-key', { method: 'POST' })
    // const data = await response.json()
    
    // 模拟生成新的API Key
    await new Promise(resolve => setTimeout(resolve, 1500))
    apiKey.value = 'pk_live_' + Math.random().toString(36).substring(2, 34)
  } catch (error) {
    console.error('生成API Key失败:', error)
  } finally {
    isGenerating.value = false
  }
}

// 切换API Key显示/隐藏
const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value
}

// 复制API Key
const copyApiKey = async () => {
  try {
    await navigator.clipboard.writeText(apiKey.value)
    // TODO: 显示成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 获取当前选中语言的示例代码
const getCurrentExample = () => {
  const example = codeExamples.value[selectedLanguage.value as keyof typeof codeExamples.value]
  return example || codeExamples.value.curl
}

// 复制示例代码
const copyCode = async () => {
  try {
    const code = getCurrentExample().code.replace(/YOUR_API_KEY/g, apiKey.value || 'YOUR_API_KEY')
    await navigator.clipboard.writeText(code)
    // TODO: 显示成功提示
  } catch (error) {
    console.error('复制代码失败:', error)
  }
}

onMounted(() => {
  loadChartData()
  loadApiKey()
})
</script>

<style scoped>
.overview-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 8px 0;
}



.charts-section {
  margin-bottom: 32px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

/* 统计卡片样式已移除，使用折线图替代 */



/* API-Key 管理样式 */
.api-key-section {
  margin-bottom: 32px;
}

.api-key-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.api-key-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.api-key-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
}

.api-key-info p {
  margin: 0;
  color: #6B7280;
  font-size: 14px;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #000000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.generate-btn:hover:not(:disabled) {
  background: #1F2937;
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.api-key-display {
  margin-top: 16px;
}

.key-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.api-key-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  background: #F9FAFB;
}

.toggle-btn,
.copy-btn {
  padding: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-btn:hover,
.copy-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.api-key-warning {
  margin: 0;
  font-size: 12px;
  color: #F59E0B;
}

/* 示例代码样式 */
.code-examples-section {
  margin-bottom: 32px;
}

.code-examples-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.language-tabs {
  display: flex;
  border-bottom: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background: transparent;
  color: #6B7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: #1F2937;
  background: #F3F4F6;
}

.tab-btn.active {
  color: #000000;
  background: white;
  border-bottom-color: #000000;
}

.code-content {
  padding: 0;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.code-title {
  font-size: 14px;
  font-weight: 500;
  color: #1F2937;
}

.copy-code-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  background: white;
  color: #6B7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-code-btn:hover {
  background: #F9FAFB;
  color: #1F2937;
}

.code-block {
  margin: 0;
  padding: 20px;
  background: #1F2937;
  color: #F9FAFB;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
}

@media (max-width: 768px) {
  .overview-page {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .api-key-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .language-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1;
    min-width: 80px;
  }
  
  .code-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>