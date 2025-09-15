<template>
  <div class="mcp-market-page">
    <!-- 顶部导航栏 -->
    <div class="top-navigation">
      <div class="nav-header">
        <h1 class="nav-title">MCP 工具市场</h1>
        <p class="nav-subtitle">发现和安装强大的 MCP 工具，扩展您的智能体能力</p>
      </div>
      <div class="nav-search">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索 MCP 工具..."
          class="search-input"
        />
        <button class="search-btn">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- MCP工具内容 -->
      <div class="mcp-content">
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在加载 MCP 工具...</p>
        </div>
        
        <div v-else-if="filteredMcpTools.length === 0" class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M7 8h10" />
          </svg>
          <h3 class="empty-title">未找到匹配的 MCP 工具</h3>
          <p class="empty-description">尝试调整搜索条件或浏览其他分类</p>
        </div>

        <div v-else class="mcp-grid">
          <div
            v-for="tool in filteredMcpTools"
            :key="tool.id"
            class="mcp-card"
            @click="viewDetails(tool)"
          >
            <div class="mcp-header">
              <div class="mcp-icon">
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div class="mcp-info">
                <h3 class="mcp-name">{{ tool.name }}</h3>
                <p class="mcp-provider">{{ tool.provider }}</p>
              </div>
              <div class="mcp-status">
                <span :class="['status-badge', tool.status]" v-if="tool.status">{{ tool.statusText || tool.status }}</span>
              </div>
            </div>

            <div class="mcp-content-body">
              <p class="mcp-description">{{ tool.description }}</p>
              
              <div class="mcp-tags">
                <span v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>

              <div class="mcp-stats">
                <div class="stat">
                  <span class="stat-label">使用量</span>
                  <span class="stat-value">{{ formatNumber(tool.usage) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">评分</span>
                  <span class="stat-value">{{ tool.rating }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">版本</span>
                  <span class="stat-value">{{ tool.version }}</span>
                </div>
              </div>
            </div>

            <div class="mcp-actions" @click.stop>
              <button
                :disabled="tool.status === 'installing'"
                class="install-btn"
                @click="installMcpTool(tool)"
                v-if="tool.status"
              >
                {{ tool.status === 'installed' ? '已安装' : tool.status === 'installing' ? '安装中...' : '安装' }}
              </button>
              <button class="details-btn" @click="viewDetails(tool)">详情</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">分类</h2>
        </div>
        
        <div class="category-tree">
          <div v-for="category in categories" :key="category.id" class="category-node">
            <div
              class="category-item"
              :class="{ active: selectedCategory === category.id }"
              @click="toggleCategory(category)"
            >
              <svg
                v-if="category.children && category.children.length > 0"
                class="expand-icon"
                :class="{ expanded: category.expanded }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">{{ category.count }}</span>
            </div>
            
            <div v-if="category.expanded && category.children" class="category-children">
              <div
                v-for="child in category.children"
                :key="child.id"
                class="category-child"
                :class="{ active: selectedCategory === child.id }"
                @click="selectCategory(child.id)"
              >
                <span class="child-name">{{ child.name }}</span>
                <span class="child-count">{{ child.count }}</span>
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
import { useRouter } from 'vue-router'

const router = useRouter()

// 定义工具类型接口
interface McpTool {
  id: string
  name: string
  provider: string
  description: string
  category: string
  tags: string[]
  usage: number
  rating: number
  version: string
  status: string
  statusText: string
}

// 定义分类类型接口
interface Category {
  id: string
  name: string
  count: number
  expanded?: boolean
  children?: Category[]
}

// 响应式数据
const searchQuery = ref('')
const selectedCategory = ref('all')
const mcpTools = ref<McpTool[]>([])
const isLoading = ref(false)

// 分类数据（树状结构）
const categories = ref<Category[]>([
  {
    id: 'all',
    name: '全部工具',
    count: 0,
    expanded: false,
    children: []
  },
  {
    id: 'data',
    name: '数据处理',
    count: 0,
    expanded: false,
    children: [
      { id: 'data-analysis', name: '数据分析', count: 0 },
      { id: 'data-transform', name: '数据转换', count: 0 },
      { id: 'data-storage', name: '数据存储', count: 0 }
    ]
  },
  {
    id: 'ai',
    name: 'AI 服务',
    count: 0,
    expanded: false,
    children: [
      { id: 'ai-llm', name: '大语言模型', count: 0 },
      { id: 'ai-vision', name: '计算机视觉', count: 0 },
      { id: 'ai-audio', name: '语音处理', count: 0 }
    ]
  },
  {
    id: 'integration',
    name: '系统集成',
    count: 0,
    expanded: false,
    children: [
      { id: 'integration-api', name: 'API 集成', count: 0 },
      { id: 'integration-database', name: '数据库连接', count: 0 },
      { id: 'integration-cloud', name: '云服务', count: 0 }
    ]
  },
  {
    id: 'utility',
    name: '实用工具',
    count: 0,
    expanded: false,
    children: [
      { id: 'utility-file', name: '文件处理', count: 0 },
      { id: 'utility-network', name: '网络工具', count: 0 },
      { id: 'utility-security', name: '安全工具', count: 0 }
    ]
  }
])

// 计算属性
const filteredMcpTools = computed(() => {
  let filtered = mcpTools.value

  // 按搜索关键词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 按分类过滤
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(tool => tool.category === selectedCategory.value)
  }

  return filtered
})

// 方法
const toggleCategory = (category: Category) => {
  if (category.children && category.children.length > 0) {
    category.expanded = !category.expanded
  } else {
    selectCategory(category.id)
  }
}

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
}

const installMcpTool = async (tool: McpTool) => {
  if (!tool || !tool.status || tool.status === 'installed' || tool.status === 'installing') return

  try {
    tool.status = 'installing'
    tool.statusText = '安装中...'
    
    // 模拟安装过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    tool.status = 'installed'
    tool.statusText = '已安装'
    tool.usage += 1
  } catch (error) {
    console.error('安装 MCP 工具失败:', error)
    if (tool) {
      tool.status = 'available'
      tool.statusText = '可用'
    }
  }
}

const viewDetails = (tool: McpTool) => {
  router.push(`/dashboard/marketplace/tool/${tool.id}`)
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const loadMcpTools = async () => {
  isLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    mcpTools.value = [
      {
        id: '1',
        name: 'Fetch网页内容提取器',
        provider: 'ModelContextProtocol',
        description: '强大的网页内容提取工具，支持智能解析HTML结构，提取关键信息用于AI分析',
        category: 'data-analysis',
        tags: ['网页抓取', '内容提取', '数据分析'],
        usage: 15420,
        rating: 4.8,
        version: '1.2.0',
        status: 'available',
        statusText: '可用'
      },
      {
        id: '2',
        name: 'SQLite数据库管理器',
        provider: 'MCP Community',
        description: '轻量级SQLite数据库管理工具，提供数据查询、更新、备份等完整功能',
        category: 'data-storage',
        tags: ['数据库', 'SQLite', '数据管理'],
        usage: 8930,
        rating: 4.6,
        version: '2.1.3',
        status: 'installed',
        statusText: '已安装'
      },
      {
        id: '3',
        name: 'GitHub代码分析器',
        provider: 'GitHub Inc.',
        description: '深度分析GitHub仓库代码结构，生成详细的代码质量报告和改进建议',
        category: 'integration-api',
        tags: ['代码分析', 'GitHub', 'API集成'],
        usage: 12650,
        rating: 4.7,
        version: '1.5.2',
        status: 'available',
        statusText: '可用'
      },
      {
        id: '4',
        name: 'PDF文档处理器',
        provider: 'DocumentAI',
        description: '智能PDF文档解析工具，支持文本提取、表格识别、图像分析等功能',
        category: 'utility-file',
        tags: ['PDF处理', '文档解析', '文本提取'],
        usage: 23100,
        rating: 4.9,
        version: '3.0.1',
        status: 'available',
        statusText: '可用'
      },
      {
        id: '5',
        name: 'OpenAI GPT集成器',
        provider: 'OpenAI',
        description: '官方OpenAI GPT模型集成工具，支持多种模型调用和参数配置',
        category: 'ai-llm',
        tags: ['GPT', 'OpenAI', '大语言模型'],
        usage: 45600,
        rating: 4.8,
        version: '2.3.0',
        status: 'available',
        statusText: '可用'
      },
      {
        id: '6',
        name: 'Slack消息机器人',
        provider: 'Slack Technologies',
        description: '强大的Slack集成工具，支持消息发送、频道管理、用户交互等功能',
        category: 'integration-api',
        tags: ['Slack', '消息机器人', '团队协作'],
        usage: 7820,
        rating: 4.5,
        version: '1.8.4',
        status: 'available',
        statusText: '可用'
      }
    ]

    // 更新分类计数
    updateCategoryCounts()
  } catch (error) {
    console.error('加载 MCP 工具失败:', error)
  } finally {
    isLoading.value = false
  }
}

const updateCategoryCounts = () => {
  // 重置计数
  categories.value.forEach(category => {
    category.count = 0
    if (category.children) {
      category.children.forEach(child => {
        child.count = 0
      })
    }
  })

  // 计算每个分类的工具数量
  mcpTools.value.forEach(tool => {
    categories.value.forEach(category => {
      if (category.children) {
        const child = category.children.find(c => c.id === tool.category)
        if (child) {
          child.count++
          category.count++
        }
      } else if (category.id === tool.category) {
        category.count++
      }
    })
  })

  // 设置全部工具的计数
  const allCategory = categories.value.find(c => c.id === 'all')
  if (allCategory) {
    allCategory.count = mcpTools.value.length
  }
}

// 生命周期
onMounted(() => {
  loadMcpTools()
})
</script>

<style scoped>
/* 黑白主题样式 */
.mcp-market-page {
  min-height: 100vh;
  background: #FFFFFF;
  color: #1F2937;
}

/* 顶部导航栏 */
.top-navigation {
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-header {
  flex: 1;
}

.nav-title {
  font-size: 32px;
  font-weight: 700;
  color: #000000;
  margin: 0 0 8px 0;
}

.nav-subtitle {
  font-size: 16px;
  color: #6B7280;
  margin: 0;
}

.nav-search {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  background: #FFFFFF;
  color: #1F2937;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #000000;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.search-btn {
  padding: 12px;
  background: #000000;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background: #1F2937;
}

.search-icon {
  width: 20px;
  height: 20px;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  gap: 32px;
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.mcp-content {
  flex: 1;
}

.loading-state {
  text-align: center;
  padding: 64px 24px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top: 3px solid #000000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mcp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

/* MCP工具卡片 */
.mcp-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.mcp-card:hover {
  border-color: #000000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mcp-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.mcp-icon {
  width: 48px;
  height: 48px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mcp-icon .icon {
  width: 24px;
  height: 24px;
  color: #374151;
}

.mcp-info {
  flex: 1;
}

.mcp-name {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  margin: 0 0 4px 0;
}

.mcp-provider {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

.mcp-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.available {
  background: #F3F4F6;
  color: #000000;
}

.status-badge.installed {
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.installing {
  background: #FEF3C7;
  color: #92400E;
}

.mcp-content-body {
  margin-bottom: 20px;
}

.mcp-description {
  font-size: 14px;
  color: #4B5563;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.mcp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag {
  padding: 4px 8px;
  background: #F9FAFB;
  color: #000000;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  font-size: 12px;
}

.mcp-stats {
  display: flex;
  gap: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
}

.mcp-actions {
  display: flex;
  gap: 12px;
}

.install-btn {
  flex: 1;
  padding: 10px 16px;
  background: #000000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.install-btn:hover:not(:disabled) {
  background: #1F2937;
}

.install-btn:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.details-btn {
  padding: 10px 16px;
  background: white;
  color: #374151;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.details-btn:hover {
  border-color: #000000;
  color: #000000;
}

/* 右侧边栏 */
.sidebar {
  width: 300px;
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: 24px;
}

.sidebar-title {
  font-size: 20px;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.category-tree {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.category-node {
  border-bottom: 1px solid #E5E7EB;
}

.category-node:last-child {
  border-bottom: none;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.category-item:hover {
  background: #F9FAFB;
}

.category-item.active {
  background: #F3F4F6;
  color: #000000;
  font-weight: 500;
}

.expand-icon {
  width: 16px;
  height: 16px;
  color: #6B7280;
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.category-name {
  flex: 1;
  font-size: 14px;
}

.category-count {
  font-size: 12px;
  color: #6B7280;
}

.category-children {
  background: #F9FAFB;
}

.category-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px 12px 44px;
  cursor: pointer;
  transition: background 0.2s;
}

.category-child:hover {
  background: #F3F4F6;
}

.category-child.active {
  background: #E5E7EB;
  color: #000000;
  font-weight: 500;
}

.child-name {
  font-size: 13px;
}

.child-count {
  font-size: 11px;
  color: #6B7280;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 64px 24px;
  grid-column: 1 / -1;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #9CA3AF;
  margin: 0 auto 16px;
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
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .category-tree {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background: transparent;
    border: none;
  }
  
  .category-node {
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    border-bottom: 1px solid #E5E7EB;
  }
}

@media (max-width: 768px) {
  .top-navigation {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .nav-search {
    max-width: none;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .mcp-grid {
    grid-template-columns: 1fr;
  }
}
</style>