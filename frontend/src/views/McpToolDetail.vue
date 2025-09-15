<template>
  <div class="mcp-tool-detail">
    <!-- 顶部导航 -->
    <div class="detail-header">
      <button class="back-btn" @click="goBack">
        <svg class="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回市场
      </button>
      
      <div class="header-actions">
        <button 
          v-if="tool"
          class="install-btn"
          :class="{ installed: tool.status === 'installed', installing: tool.status === 'installing' }"
          :disabled="tool.status === 'installing'"
          @click="installTool"
        >
          {{ tool.status === 'installed' ? '已安装' : tool.status === 'installing' ? '安装中...' : '安装工具' }}
        </button>
      </div>
    </div>

    <!-- 工具信息 -->
    <div class="tool-info" v-if="tool">
      <div class="tool-header">
        <div class="tool-icon">
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        
        <div class="tool-meta">
          <h1 class="tool-name">{{ tool.name }}</h1>
          <p class="tool-provider">由 {{ tool.provider }} 提供</p>
          
          <div class="tool-stats">
            <div class="stat">
              <span class="stat-value">{{ formatNumber(tool.usage) }}</span>
              <span class="stat-label">使用量</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ tool.rating }}</span>
              <span class="stat-label">评分</span>
            </div>
            <div class="stat">
              <span class="stat-value">{{ tool.version }}</span>
              <span class="stat-label">版本</span>
            </div>
          </div>
          
          <div class="tool-tags">
            <span v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <div class="tool-description">
        <h2 class="section-title">工具描述</h2>
        <p class="description-text">{{ tool.description }}</p>
      </div>

      <!-- 功能特性 -->
      <div class="tool-features">
        <h2 class="section-title">主要功能</h2>
        <div class="features-grid">
          <div v-for="feature in tool.features" :key="feature.title" class="feature-card">
            <div class="feature-icon">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div class="feature-content">
              <h3 class="feature-title">{{ feature.title }}</h3>
              <p class="feature-description">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 配置参数 -->
      <div class="tool-config">
        <h2 class="section-title">配置参数</h2>
        <div class="config-table">
          <div class="config-header">
            <div class="config-col">参数名</div>
            <div class="config-col">类型</div>
            <div class="config-col">必填</div>
            <div class="config-col">说明</div>
          </div>
          <div v-for="param in tool.parameters" :key="param.name" class="config-row">
            <div class="config-col">
              <code class="param-name">{{ param.name }}</code>
            </div>
            <div class="config-col">
              <span class="param-type">{{ param.type }}</span>
            </div>
            <div class="config-col">
              <span :class="['param-required', { required: param.required }]">
                {{ param.required ? '是' : '否' }}
              </span>
            </div>
            <div class="config-col">
              <span class="param-description">{{ param.description }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用示例 -->
      <div class="tool-examples">
        <h2 class="section-title">使用示例</h2>
        <div class="example-code">
          <pre><code>{{ tool.example }}</code></pre>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载工具详情...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 定义工具类型接口
interface McpTool {
  id: string
  name: string
  provider: string
  description: string
  tags: string[]
  usage: number
  rating: number
  version: string
  status: string
  features: Array<{
    title: string
    description: string
  }>
  parameters: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  example: string
}

const router = useRouter()
const route = useRoute()

const tool = ref<McpTool | null>(null)
const isLoading = ref(false)

const goBack = () => {
  router.push('/dashboard/marketplace')
}

const installTool = async () => {
  if (!tool.value || tool.value.status === 'installed' || tool.value.status === 'installing') return

  try {
    tool.value.status = 'installing'
    
    // 模拟安装过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    tool.value.status = 'installed'
    tool.value.usage += 1
  } catch (error) {
    console.error('安装工具失败:', error)
    if (tool.value) {
      tool.value.status = 'available'
    }
  }
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const loadToolDetail = async () => {
  isLoading.value = true
  try {
    const toolId = route.params.id as string
    
    // 模拟API调用获取工具详情
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟工具详情数据
    const toolsData: Record<string, McpTool> = {
      '1': {
        id: '1',
        name: 'Fetch网页内容提取器',
        provider: 'ModelContextProtocol',
        description: '强大的网页内容提取工具，支持智能解析HTML结构，提取关键信息用于AI分析。该工具能够处理各种复杂的网页结构，包括动态加载的内容，并提供多种提取模式以满足不同的使用场景。',
        tags: ['网页抓取', '内容提取', '数据分析'],
        usage: 15420,
        rating: 4.8,
        version: '1.2.0',
        status: 'available',
        features: [
          {
            title: '智能HTML解析',
            description: '自动识别网页结构，提取标题、正文、链接等关键信息'
          },
          {
            title: '动态内容支持',
            description: '支持JavaScript渲染的动态内容抓取'
          },
          {
            title: '多格式输出',
            description: '支持JSON、XML、纯文本等多种输出格式'
          },
          {
            title: '反爬虫处理',
            description: '内置多种反爬虫策略，提高抓取成功率'
          }
        ],
        parameters: [
          {
            name: 'url',
            type: 'string',
            required: true,
            description: '要抓取的网页URL地址'
          },
          {
            name: 'selector',
            type: 'string',
            required: false,
            description: 'CSS选择器，用于指定要提取的元素'
          },
          {
            name: 'format',
            type: 'string',
            required: false,
            description: '输出格式：json、xml、text'
          },
          {
            name: 'timeout',
            type: 'number',
            required: false,
            description: '请求超时时间（秒），默认30秒'
          }
        ],
        example: `{
  "tool": "fetch",
  "parameters": {
    "url": "https://example.com",
    "selector": ".content",
    "format": "json",
    "timeout": 30
  }
}`
      },
      '2': {
        id: '2',
        name: 'SQLite数据库管理器',
        provider: 'MCP Community',
        description: '轻量级SQLite数据库管理工具，提供数据查询、更新、备份等完整功能。支持复杂SQL查询、事务处理、数据导入导出等高级功能，是处理结构化数据的理想选择。',
        tags: ['数据库', 'SQLite', '数据管理'],
        usage: 8930,
        rating: 4.6,
        version: '2.1.3',
        status: 'installed',
        features: [
          {
            title: 'SQL查询执行',
            description: '支持完整的SQL语法，包括复杂的联表查询'
          },
          {
            title: '事务管理',
            description: '提供事务控制，确保数据一致性'
          },
          {
            title: '数据导入导出',
            description: '支持CSV、JSON等格式的数据导入导出'
          },
          {
            title: '数据库备份',
            description: '自动备份功能，保障数据安全'
          }
        ],
        parameters: [
          {
            name: 'database',
            type: 'string',
            required: true,
            description: '数据库文件路径'
          },
          {
            name: 'query',
            type: 'string',
            required: true,
            description: '要执行的SQL查询语句'
          },
          {
            name: 'transaction',
            type: 'boolean',
            required: false,
            description: '是否使用事务，默认false'
          }
        ],
        example: `{
  "tool": "sqlite",
  "parameters": {
    "database": "./data.db",
    "query": "SELECT * FROM users WHERE age > 18",
    "transaction": false
  }
}`
      }
    }
    
    tool.value = toolsData[toolId] || null
  } catch (error) {
    console.error('加载工具详情失败:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadToolDetail()
})
</script>

<style scoped>
.mcp-tool-detail {
  min-height: 100vh;
  background: #FFFFFF;
  color: #1F2937;
}

/* 顶部导航 */
.detail-header {
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: transparent;
  color: #374151;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: #000000;
  color: #000000;
}

.back-icon {
  width: 16px;
  height: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.install-btn {
  padding: 12px 24px;
  background: #000000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.install-btn:hover:not(:disabled) {
  background: #1F2937;
}

.install-btn.installed {
  background: #10B981;
}

.install-btn.installing {
  background: #9CA3AF;
  cursor: not-allowed;
}

.install-btn:disabled {
  cursor: not-allowed;
}

/* 工具信息 */
.tool-info {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px;
}

.tool-header {
  display: flex;
  gap: 24px;
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid #E5E7EB;
}

.tool-icon {
  width: 80px;
  height: 80px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-icon .icon {
  width: 40px;
  height: 40px;
  color: #374151;
}

.tool-meta {
  flex: 1;
}

.tool-name {
  font-size: 36px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
}

.tool-provider {
  font-size: 16px;
  color: #6B7280;
  margin: 0 0 24px 0;
}

.tool-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6B7280;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  background: #F9FAFB;
  color: #000000;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  font-size: 14px;
}

/* 工具描述 */
.tool-description {
  margin-bottom: 48px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 16px 0;
}

.description-text {
  font-size: 16px;
  color: #4B5563;
  line-height: 1.6;
  margin: 0;
}

/* 功能特性 */
.tool-features {
  margin-bottom: 48px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.feature-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  background: #000000;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon .icon {
  width: 20px;
  height: 20px;
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 8px 0;
}

.feature-description {
  font-size: 14px;
  color: #4B5563;
  line-height: 1.5;
  margin: 0;
}

/* 配置参数 */
.tool-config {
  margin-bottom: 48px;
}

.config-table {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.config-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}

.config-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 2fr;
  border-bottom: 1px solid #E5E7EB;
}

.config-row:last-child {
  border-bottom: none;
}

.config-col {
  padding: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.config-header .config-col {
  font-weight: 600;
  color: #000000;
}

.param-name {
  background: #F3F4F6;
  color: #000000;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;
  font-size: 13px;
}

.param-type {
  color: #059669;
  font-weight: 500;
}

.param-required.required {
  color: #DC2626;
  font-weight: 500;
}

.param-description {
  color: #4B5563;
}

/* 使用示例 */
.tool-examples {
  margin-bottom: 48px;
}

.example-code {
  background: #1F2937;
  color: #F9FAFB;
  border-radius: 12px;
  padding: 24px;
  overflow-x: auto;
}

.example-code pre {
  margin: 0;
  font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.example-code code {
  color: #F9FAFB;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top: 3px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .tool-info {
    padding: 16px;
  }
  
  .tool-header {
    flex-direction: column;
    text-align: center;
  }
  
  .tool-stats {
    justify-content: center;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .config-header,
  .config-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .config-col {
    padding: 8px 16px;
    border-bottom: 1px solid #E5E7EB;
  }
  
  .config-row .config-col:last-child {
    border-bottom: none;
  }
}
</style>