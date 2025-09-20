<template>
  <div class="overview-page dark-theme">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">总览仪表板</h1>
        <p class="page-subtitle">管理您的API密钥和查看使用统计</p>
      </div>
    </div>

    <!-- 数据图表区域 -->
    <div class="charts-section">
      <div class="section-header">
        <h2 class="section-title">使用统计</h2>
        <div class="time-filter">
          <button 
            v-for="period in timePeriods" 
            :key="period.value"
            @click="selectedPeriod = period.value"
            :class="['filter-btn', { active: selectedPeriod === period.value }]"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">API 调用趋势</h3>
            <div class="chart-value">{{ getTotalApiCalls() }}</div>
          </div>
          <LineChart 
            :data="apiCallsData[selectedPeriod]" 
            :height="200"
          />
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">智能体使用情况</h3>
            <div class="chart-value">{{ getTotalAgentUsage() }}</div>
          </div>
          <LineChart 
            :data="agentUsageData[selectedPeriod]" 
            :height="200"
          />
        </div>
      </div>
    </div>

    <!-- API-Key管理模块 -->
    <div class="api-key-section">
      <div class="section-header">
        <h2 class="section-title">API 密钥管理</h2>
      </div>
      <div class="api-key-card card">
        <div class="api-key-header">
          <div class="api-key-info">
            <h3 class="card-title">您的 API 密钥</h3>
            <p class="card-description">用于访问平台 API 服务，请妥善保管</p>
          </div>
          <button @click="generateApiKey" class="btn btn-primary" :disabled="isGenerating">
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
              class="input api-key-input"
              placeholder="API密钥将在此显示"
            />
            <button @click="toggleApiKeyVisibility" class="btn btn-outline icon-btn" title="切换显示/隐藏">
              <svg v-if="showApiKey" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.94 17.94C16.2306 19.2719 14.1491 19.9993 12 20C5 20 1 12 1 12C2.24389 9.68192 4.02643 7.65663 6.17 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4282 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5718 9.14351 13.1984C8.99262 12.8251 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M1 1L23 23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button @click="copyApiKey" class="btn btn-outline icon-btn" title="复制API密钥">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="api-key-warning">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            请妥善保管您的 API 密钥，不要与他人分享
          </div>
        </div>
        
        <div v-else class="no-api-key">
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15L12 9M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>暂无API密钥，点击上方按钮生成</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 示例代码模块 -->
    <div class="code-examples-section">
      <div class="section-header">
        <h2 class="section-title">API 使用示例</h2>
      </div>
      <div class="code-examples-card card">
        <div class="language-tabs">
          <button 
            v-for="lang in codeLanguages" 
            :key="lang.id"
            @click="selectedLanguage = lang.id"
            :class="['tab-btn', { active: selectedLanguage === lang.id }]"
          >
            <span class="tab-icon">{{ lang.icon }}</span>
            {{ lang.name }}
          </button>
        </div>
        
        <div class="code-content">
          <div class="code-header">
            <div class="code-title-group">
              <span class="code-title">{{ getCurrentExample().title }}</span>
              <span class="code-language">{{ getCurrentLanguage().name }}</span>
            </div>
            <button @click="copyCode" class="btn btn-outline btn-sm">
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

    <!-- 成功提示 -->
    <div v-if="showSuccessMessage" class="success-toast">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LineChart from '@/components/charts/LineChart.vue'

const userStore = useAuthStore()

// 时间周期选择
const selectedPeriod = ref<'7d' | '30d' | '90d'>('7d')
const timePeriods = ref([
  { value: '7d' as const, label: '7天' },
  { value: '30d' as const, label: '30天' },
  { value: '90d' as const, label: '90天' }
])

// 成功提示
const showSuccessMessage = ref(false)
const successMessage = ref('')

// API Key 管理
const apiKey = ref('')
const showApiKey = ref(false)
const isGenerating = ref(false)

// 代码示例
const selectedLanguage = ref('curl')
const codeLanguages = ref([
  { id: 'curl', name: 'cURL', icon: '🌐' },
  { id: 'javascript', name: 'JavaScript', icon: '🟨' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' }
])

// 图表数据
const apiCallsData = ref({
  '7d': [
    { date: '2024-01-14', value: 1200 },
    { date: '2024-01-15', value: 1350 },
    { date: '2024-01-16', value: 1100 },
    { date: '2024-01-17', value: 1450 },
    { date: '2024-01-18', value: 1600 },
    { date: '2024-01-19', value: 1380 },
    { date: '2024-01-20', value: 1520 }
  ],
  '30d': [
    { date: '2023-12-22', value: 28000 },
    { date: '2023-12-29', value: 32000 },
    { date: '2024-01-05', value: 35000 },
    { date: '2024-01-12', value: 38000 },
    { date: '2024-01-20', value: 42000 }
  ],
  '90d': [
    { date: '2023-11-01', value: 85000 },
    { date: '2023-11-30', value: 92000 },
    { date: '2023-12-31', value: 105000 },
    { date: '2024-01-31', value: 118000 }
  ]
})

const agentUsageData = ref({
  '7d': [
    { date: '2024-01-14', value: 850 },
    { date: '2024-01-15', value: 920 },
    { date: '2024-01-16', value: 780 },
    { date: '2024-01-17', value: 1050 },
    { date: '2024-01-18', value: 1200 },
    { date: '2024-01-19', value: 980 },
    { date: '2024-01-20', value: 1100 }
  ],
  '30d': [
    { date: '2023-12-22', value: 18000 },
    { date: '2023-12-29', value: 21000 },
    { date: '2024-01-05', value: 24000 },
    { date: '2024-01-12', value: 26000 },
    { date: '2024-01-20', value: 29000 }
  ],
  '90d': [
    { date: '2023-11-01', value: 58000 },
    { date: '2023-11-30', value: 64000 },
    { date: '2023-12-31', value: 72000 },
    { date: '2024-01-31', value: 81000 }
  ]
})

// 代码示例数据
const codeExamples = ref({
  curl: {
    title: 'cURL 请求示例',
    code: `curl -X POST "https://api.poping.ai/v1/agents/chat" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "agent-123",
    "message": "你好，请帮我分析这个数据",
    "stream": false
  }'`
  },
  javascript: {
    title: 'JavaScript 调用示例',
    code: `const response = await fetch('https://api.poping.ai/v1/agents/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agentId: 'agent-123',
    message: '你好，请帮我分析这个数据',
    stream: false
  })
});

const data = await response.json();
console.log(data);`
  },
  python: {
    title: 'Python 调用示例',
    code: `import requests

url = "https://api.poping.ai/v1/agents/chat"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "agentId": "agent-123",
    "message": "你好，请帮我分析这个数据",
    "stream": False
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)`
  },
  java: {
    title: 'Java 调用示例',
    code: `import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.poping.ai/v1/agents/chat"))
    .header("Authorization", "Bearer YOUR_API_KEY")
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(
        "{\\"agentId\\": \\"agent-123\\", \\"message\\": \\"你好，请帮我分析这个数据\\", \\"stream\\": false}"
    ))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`
  }
})

// 计算属性
const getTotalApiCalls = () => {
  const data = apiCallsData.value[selectedPeriod.value]
  return data.reduce((sum, item) => sum + item.value, 0).toLocaleString()
}

const getTotalAgentUsage = () => {
  const data = agentUsageData.value[selectedPeriod.value]
  return data.reduce((sum, item) => sum + item.value, 0).toLocaleString()
}

const getCurrentLanguage = () => {
  return codeLanguages.value.find(lang => lang.id === selectedLanguage.value) || codeLanguages.value[0]
}

const getCurrentExample = () => {
  return codeExamples.value[selectedLanguage.value as keyof typeof codeExamples.value] || codeExamples.value.curl
}

// API Key 管理方法
const toggleApiKeyVisibility = () => {
  showApiKey.value = !showApiKey.value
}

const generateApiKey = async () => {
  isGenerating.value = true
  try {
    // 模拟API调用生成密钥
    await new Promise(resolve => setTimeout(resolve, 2000))
    apiKey.value = 'pk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    showSuccess('API密钥生成成功')
  } catch (error) {
    console.error('生成API密钥失败:', error)
  } finally {
    isGenerating.value = false
  }
}

const loadApiKey = async () => {
  try {
    // 模拟从后端加载现有API密钥
    // 实际项目中这里应该调用真实的API
    const existingKey = localStorage.getItem('user_api_key')
    if (existingKey) {
      apiKey.value = existingKey
    }
  } catch (error) {
    console.error('加载API密钥失败:', error)
  }
}

const loadChartData = async () => {
  try {
    // 模拟从后端加载图表数据
    // 实际项目中这里应该调用真实的API获取统计数据
    console.log('图表数据已加载')
  } catch (error) {
    console.error('加载图表数据失败:', error)
  }
}

// 显示成功提示
const showSuccess = (message: string) => {
  successMessage.value = message
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

const copyApiKey = async () => {
  try {
    await navigator.clipboard.writeText(apiKey.value)
    showSuccess('API密钥已复制到剪贴板')
    // 保存到本地存储
    localStorage.setItem('user_api_key', apiKey.value)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const copyCode = async () => {
  try {
    const code = getCurrentExample().code.replace(/YOUR_API_KEY/g, apiKey.value || 'YOUR_API_KEY')
    await navigator.clipboard.writeText(code)
    showSuccess('代码已复制到剪贴板')
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
  background: #3B82F6;
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
  color: #3B82F6;
  background: white;
  border-bottom-color: #3B82F6;
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