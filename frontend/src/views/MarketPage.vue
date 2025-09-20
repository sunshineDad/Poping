<template>
  <div class="market-page">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-left">
          <router-link to="/" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            首页
          </router-link>
          <router-link to="/profile" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            个人中心
          </router-link>
          <router-link to="/playground" class="nav-link">
            <svg class="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Playground
          </router-link>
        </div>
      </div>
    </nav>

    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">MCP 工具市场</h1>
          <p class="page-subtitle">发现和安装强大的 MCP 工具，扩展您的智能体能力</p>
        </div>
        
        <!-- 搜索区域 -->
        <div class="search-section">
          <div class="search-container">
            <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索 MCP 工具..."
              class="search-input"
            />
          </div>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-layout">
        <!-- 左侧分类栏 -->
        <div class="sidebar">
          <div class="sidebar-header">
            <h3 class="sidebar-title">分类</h3>
          </div>
          
          <div class="category-list">
            <div v-for="category in categories" :key="category.id" class="category-group">
              <div
                class="category-item"
                :class="{ active: selectedCategory === category.id }"
                @click="toggleCategory(category)"
              >
                <div class="category-content">
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
                </div>
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

        <!-- 主内容区域 -->
        <div class="main-content">
          <!-- 加载状态 -->
          <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p class="loading-text">正在加载 MCP 工具...</p>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="filteredMcpTools.length === 0" class="empty-state">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M7 8h10" />
            </svg>
            <h3 class="empty-title">未找到匹配的 MCP 工具</h3>
            <p class="empty-description">尝试调整搜索条件或浏览其他分类</p>
          </div>

          <!-- 工具网格 -->
          <div v-else class="tools-grid">
            <div
              v-for="tool in filteredMcpTools"
              :key="tool.id"
              class="tool-card"
              @click="viewDetails(tool)"
            >
              <div class="tool-header">
                <div class="tool-icon">
                  <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div class="tool-info">
                  <h3 class="tool-name">{{ tool.name }}</h3>
                  <p class="tool-provider">{{ tool.provider }}</p>
                </div>
                <div class="tool-status">
                  <span :class="['status-badge', tool.status]" v-if="tool.status">
                    {{ tool.statusText || tool.status }}
                  </span>
                </div>
              </div>

              <div class="tool-body">
                <p class="tool-description">{{ tool.description }}</p>
                
                <div class="tool-tags">
                  <span v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</span>
                </div>

                <div class="tool-stats">
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

              <div class="tool-actions" @click.stop>
                <button
                  :disabled="tool.status === 'installing'"
                  class="btn btn-primary"
                  @click="installMcpTool(tool)"
                  v-if="tool.status"
                >
                  {{ tool.status === 'installed' ? '已安装' : tool.status === 'installing' ? '安装中...' : '安装' }}
                </button>
                <button class="btn btn-secondary" @click="viewDetails(tool)">详情</button>
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
/* 页面容器 */
.market-page {
  min-height: 100vh;
  background: #FFFFFF;
  color: #1F2937;
}

/* 导航栏 */
.navbar {
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  color: #4B5563;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  color: #1F2937;
  background: #F9FAFB;
}

.nav-link.router-link-active {
  color: #1F2937;
  background: #F3F4F6;
}

.nav-icon {
  width: 16px;
  height: 16px;
}

/* 主容器 */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 页面头部 */
.page-header {
  padding: 32px 0;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 32px;
}

.header-content {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6B7280;
  margin: 0;
}

/* 搜索区域 */
.search-section {
  display: flex;
  justify-content: center;
}

.search-container {
  position: relative;
  max-width: 400px;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9CA3AF;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  background: #FFFFFF;
  color: #1F2937;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #1F2937;
}

.search-input::placeholder {
  color: #9CA3AF;
}

/* 内容布局 */
.content-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: 16px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.category-list {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  overflow: hidden;
}

.category-group {
  border-bottom: 1px solid #E5E7EB;
}

.category-group:last-child {
  border-bottom: none;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.category-item:hover {
  background: #F9FAFB;
}

.category-item.active {
  background: #F3F4F6;
  color: #1F2937;
  font-weight: 500;
}

.category-content {
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-size: 14px;
  color: inherit;
}

.category-count {
  font-size: 12px;
  color: #9CA3AF;
  background: #F9FAFB;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.category-children {
  background: #F9FAFB;
}

.category-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px 8px 40px;
  cursor: pointer;
  transition: background 0.2s;
}

.category-child:hover {
  background: #F3F4F6;
}

.category-child.active {
  background: #E5E7EB;
  color: #1F2937;
  font-weight: 500;
}

.child-name {
  font-size: 13px;
}

.child-count {
  font-size: 11px;
  color: #9CA3AF;
  background: #FFFFFF;
  padding: 2px 6px;
  border-radius: 8px;
  min-width: 16px;
  text-align: center;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  min-width: 0;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 64px 24px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top: 3px solid #1F2937;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #6B7280;
  font-size: 16px;
  margin: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 64px 24px;
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

/* 工具网格 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

/* 工具卡片 */
.tool-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tool-card:hover {
  border-color: #1F2937;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tool-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.tool-icon {
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

.tool-icon .icon {
  width: 24px;
  height: 24px;
  color: #374151;
}

.tool-info {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 18px;
  font-weight: 600;
  color: #1F2937;
  margin: 0 0 4px 0;
  line-height: 1.3;
}

.tool-provider {
  font-size: 14px;
  color: #6B7280;
  margin: 0;
}

.tool-status {
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
  color: #1F2937;
}

.status-badge.installed {
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.installing {
  background: #FEF3C7;
  color: #92400E;
}

.tool-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.tool-description {
  font-size: 14px;
  color: #4B5563;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tool-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 8px;
  background: #F9FAFB;
  color: #1F2937;
  border: 1px solid #E5E7EB;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tool-stats {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: auto;
}

.stat {
  text-align: center;
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 4px;
  display: block;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
}

.tool-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

/* 按钮样式 */
.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: #1F2937;
  color: #FFFFFF;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background: #374151;
}

.btn-primary:disabled {
  background: #9CA3AF;
  cursor: not-allowed;
}

.btn-secondary {
  background: #FFFFFF;
  color: #374151;
  border: 1px solid #E5E7EB;
}

.btn-secondary:hover {
  border-color: #1F2937;
  color: #1F2937;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .category-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background: transparent;
    border: none;
    padding: 0;
  }
  
  .category-group {
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    border-bottom: 1px solid #E5E7EB;
    background: #FFFFFF;
  }
  
  .category-children {
    display: none;
  }
}

@media (max-width: 768px) {
  .main-container {
    padding: 0 16px;
  }
  
  .page-header {
    padding: 24px 0;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .content-layout {
    gap: 24px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .nav-container {
    padding: 0 16px;
  }
  
  .nav-left {
    gap: 16px;
  }
  
  .nav-link {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .nav-icon {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .tool-card {
    padding: 16px;
  }
  
  .tool-header {
    gap: 12px;
  }
  
  .tool-icon {
    width: 40px;
    height: 40px;
  }
  
  .tool-icon .icon {
    width: 20px;
    height: 20px;
  }
  
  .tool-name {
    font-size: 16px;
  }
  
  .tool-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>