<template>
  <div class="min-h-screen bg-gray-50 dark-theme">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-xl font-semibold text-black">
            Poping
          </router-link>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/" 
              class="text-gray-600 hover:text-black transition-colors"
            >
              首页
            </router-link>
            <router-link 
              to="/pricing" 
              class="text-gray-600 hover:text-black transition-colors"
            >
              定价
            </router-link>
            <template v-if="isLoggedIn">
              <router-link 
                to="/dashboard" 
                class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                控制台
              </router-link>
            </template>
            <template v-else>
              <router-link 
                to="/login" 
                class="text-gray-600 hover:text-black transition-colors"
              >
                登录
              </router-link>
              <router-link 
                to="/register" 
                class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                注册
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex">
      <!-- 侧边栏导航 -->
      <aside class="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
        <div class="p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">文档导航</h2>
          
          <!-- 搜索框 -->
          <div class="relative mb-6">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索文档..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
            />
            <IconComponents name="search" size="sm" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          <!-- 导航菜单 -->
          <nav class="space-y-2">
            <div v-for="section in filteredSections" :key="section.id" class="mb-4">
              <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                {{ section.title }}
              </h3>
              <ul class="space-y-1">
                <li v-for="item in section.items" :key="item.id">
                  <button
                    @click="selectDoc(item)"
                    :class="[
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      activeDoc?.id === item.id
                        ? 'bg-gray-100 text-black font-medium'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    ]"
                  >
                    {{ item.title }}
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="flex-1 p-8">
        <div class="max-w-4xl mx-auto">
          <!-- 文档内容 -->
          <div v-if="activeDoc" class="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <!-- 文档头部 -->
            <div class="mb-8">
              <div class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span>{{ activeDoc.category }}</span>
                <IconComponents name="chevron-down" size="sm" />
                <span>{{ activeDoc.title }}</span>
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ activeDoc.title }}</h1>
              <p class="text-lg text-gray-600">{{ activeDoc.description }}</p>
            </div>

            <!-- 文档正文 -->
            <div class="prose prose-lg max-w-none">
              <div v-html="activeDoc.content"></div>
            </div>

            <!-- 文档底部导航 -->
            <div class="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
              <button
                v-if="previousDoc"
                @click="selectDoc(previousDoc)"
                class="flex items-center text-black hover:text-gray-700 transition-colors"
              >
                <IconComponents name="chevron-down" size="sm" class="mr-2" />
                <div class="text-left">
                  <div class="text-sm text-gray-500">上一篇</div>
                  <div class="font-medium">{{ previousDoc.title }}</div>
                </div>
              </button>
              <div v-else></div>
              
              <button
                v-if="nextDoc"
                @click="selectDoc(nextDoc)"
                class="flex items-center text-black hover:text-gray-700 transition-colors"
              >
                <div class="text-right">
                  <div class="text-sm text-gray-500">下一篇</div>
                  <div class="font-medium">{{ nextDoc.title }}</div>
                </div>
                <IconComponents name="chevron-down" size="sm" class="ml-2" />
              </button>
            </div>
          </div>

          <!-- 默认欢迎页面 -->
          <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div class="mb-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconComponents name="docs" size="lg" class="text-black" />
              </div>
              <h1 class="text-3xl font-bold text-gray-900 mb-4">欢迎使用 Poping 文档</h1>
              <p class="text-lg text-gray-600 mb-8">
                这里包含了使用 Poping 智能体服务平台的完整指南和API参考文档
              </p>
            </div>
            
            <!-- 快速开始卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div 
                v-for="quickStart in quickStartItems" 
                :key="quickStart.id"
                @click="selectDoc(quickStart.doc)"
                class="p-6 border border-gray-200 rounded-lg hover:border-gray-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <IconComponents :name="quickStart.icon" size="md" class="text-black" />
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ quickStart.title }}</h3>
                <p class="text-gray-600 text-sm">{{ quickStart.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconComponents from '@/components/icons/IconComponents.vue'

interface DocItem {
  id: string
  title: string
  description: string
  category: string
  content: string
  order: number
}

interface DocSection {
  id: string
  title: string
  items: DocItem[]
}

interface QuickStartItem {
  id: string
  title: string
  description: string
  icon: string
  doc: DocItem
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const searchQuery = ref('')
const activeDoc = ref<DocItem | null>(null)

const isLoggedIn = computed(() => authStore.isAuthenticated)

// 文档数据
const docSections = ref<DocSection[]>([
  {
    id: 'getting-started',
    title: '快速开始',
    items: [
      {
        id: 'introduction',
        title: '平台介绍',
        description: '了解 Poping 智能体服务平台的核心功能和优势',
        category: '快速开始',
        content: `
          <h2>什么是 Poping？</h2>
          <p>Poping 是一个强大的智能体服务平台，为开发者和企业提供完整的AI智能体解决方案。</p>
          
          <h3>核心功能</h3>
          <ul>
            <li><strong>智能体管理</strong> - 创建、配置和管理您的AI智能体</li>
            <li><strong>数据集处理</strong> - 上传和处理训练数据，提升智能体性能</li>
            <li><strong>MCP集成</strong> - 支持模型连接协议，接入第三方模型和工具</li>
            <li><strong>API服务</strong> - 提供RESTful API，轻松集成到您的应用中</li>
            <li><strong>实时交互</strong> - 游乐场功能，实时测试和调试智能体</li>
          </ul>
          
          <h3>平台优势</h3>
          <ul>
            <li>🚀 <strong>快速部署</strong> - 几分钟内创建和部署智能体</li>
            <li>🔧 <strong>灵活配置</strong> - 丰富的配置选项，满足不同需求</li>
            <li>📊 <strong>数据驱动</strong> - 完整的使用统计和性能分析</li>
            <li>🔒 <strong>安全可靠</strong> - 企业级安全保障和数据保护</li>
            <li>🌐 <strong>开放生态</strong> - 支持MCP协议，连接更多AI工具</li>
          </ul>
        `,
        order: 1
      },
      {
        id: 'getting-started',
        title: '快速开始',
        description: '5分钟内创建您的第一个智能体',
        category: '快速开始',
        content: `
          <h2>创建您的第一个智能体</h2>
          <p>按照以下步骤，您可以在几分钟内创建并部署您的第一个智能体。</p>
          
          <h3>步骤1：注册账户</h3>
          <ol>
            <li>访问 <a href="/register">注册页面</a></li>
            <li>填写基本信息并验证邮箱</li>
            <li>选择适合的订阅计划</li>
          </ol>
          
          <h3>步骤2：创建智能体</h3>
          <ol>
            <li>登录后进入 <a href="/dashboard/agents">智能体管理</a> 页面</li>
            <li>点击"创建智能体"按钮</li>
            <li>填写智能体基本信息：
              <ul>
                <li>名称：为您的智能体起一个有意义的名称</li>
                <li>描述：简要说明智能体的功能和用途</li>
                <li>类型：选择助手、创意、分析或自定义类型</li>
              </ul>
            </li>
            <li>配置智能体参数：
              <ul>
                <li>系统提示词：定义智能体的行为和角色</li>
                <li>模型选择：选择合适的AI模型</li>
                <li>参数调优：设置温度、最大长度等参数</li>
              </ul>
            </li>
          </ol>
          
          <h3>步骤3：测试智能体</h3>
          <ol>
            <li>创建完成后，点击"测试"按钮</li>
            <li>在游乐场中与智能体对话</li>
            <li>根据测试结果调整配置</li>
          </ol>
          
          <h3>步骤4：获取API密钥</h3>
          <ol>
            <li>进入 <a href="/dashboard">概览页面</a></li>
            <li>在"API Key管理"区域生成新的API密钥</li>
            <li>保存密钥，用于API调用</li>
          </ol>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 class="text-blue-800 font-semibold mb-2">💡 提示</h4>
            <p class="text-blue-700">建议先在游乐场中充分测试智能体，确保其行为符合预期后再集成到生产环境中。</p>
          </div>
        `,
        order: 2
      },
      {
        id: 'installation',
        title: '安装配置',
        description: '配置开发环境和SDK安装指南',
        category: '快速开始',
        content: `
          <h2>SDK安装</h2>
          <p>Poping 提供多种编程语言的SDK，方便您快速集成智能体服务。</p>
          
          <h3>JavaScript/Node.js</h3>
          <pre><code>npm install @poping/sdk
# 或
yarn add @poping/sdk</code></pre>
          
          <h3>Python</h3>
          <pre><code>pip install poping-sdk</code></pre>
          
          <h3>Java</h3>
          <pre><code>&lt;dependency&gt;
  &lt;groupId&gt;com.poping&lt;/groupId&gt;
  &lt;artifactId&gt;poping-sdk&lt;/artifactId&gt;
  &lt;version&gt;1.0.0&lt;/version&gt;
&lt;/dependency&gt;</code></pre>
          
          <h2>环境配置</h2>
          <p>安装SDK后，您需要配置API密钥和基础设置。</p>
          
          <h3>JavaScript示例</h3>
          <pre><code>import { PopingClient } from '@poping/sdk';

const client = new PopingClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.poping.ai' // 可选，默认为官方API地址
});</code></pre>
          
          <h3>Python示例</h3>
          <pre><code>from poping_sdk import PopingClient

client = PopingClient(
    api_key='your-api-key',
    base_url='https://api.poping.ai'  # 可选
)</code></pre>
          
          <h3>环境变量配置</h3>
          <p>为了安全起见，建议使用环境变量存储API密钥：</p>
          <pre><code># .env 文件
POPING_API_KEY=your-api-key
POPING_BASE_URL=https://api.poping.ai</code></pre>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <h4 class="text-yellow-800 font-semibold mb-2">⚠️ 安全提醒</h4>
            <p class="text-yellow-700">请妥善保管您的API密钥，不要在客户端代码中硬编码密钥，避免泄露风险。</p>
          </div>
        `,
        order: 3
      }
    ]
  },
  {
    id: 'api-reference',
    title: 'API参考',
    items: [
      {
        id: 'authentication',
        title: '身份认证',
        description: 'API密钥管理和认证方式',
        category: 'API参考',
        content: `
          <h2>身份认证</h2>
          <p>Poping API 使用API密钥进行身份认证。所有API请求都需要在请求头中包含有效的API密钥。</p>
          
          <h3>获取API密钥</h3>
          <ol>
            <li>登录 Poping 控制台</li>
            <li>进入概览页面</li>
            <li>在"API Key管理"区域生成新密钥</li>
            <li>复制并安全保存密钥</li>
          </ol>
          
          <h3>使用API密钥</h3>
          <p>在所有API请求的请求头中添加以下字段：</p>
          <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>
          
          <h3>请求示例</h3>
          <h4>cURL</h4>
          <pre><code>curl -X POST https://api.poping.ai/v1/agents/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "agent_123",
    "message": "Hello, how can you help me?"
  }'</code></pre>
          
          <h4>JavaScript</h4>
          <pre><code>const response = await fetch('https://api.poping.ai/v1/agents/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agent_id: 'agent_123',
    message: 'Hello, how can you help me?'
  })
});</code></pre>
          
          <h3>错误处理</h3>
          <p>当API密钥无效或缺失时，API将返回401错误：</p>
          <pre><code>{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}</code></pre>
          
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <h4 class="text-red-800 font-semibold mb-2">🔒 安全最佳实践</h4>
            <ul class="text-red-700 space-y-1">
              <li>定期轮换API密钥</li>
              <li>为不同环境使用不同的密钥</li>
              <li>监控API密钥使用情况</li>
              <li>发现异常时立即撤销密钥</li>
            </ul>
          </div>
        `,
        order: 1
      },
      {
        id: 'agents-api',
        title: '智能体API',
        description: '智能体创建、管理和对话接口',
        category: 'API参考',
        content: `
          <h2>智能体API</h2>
          <p>智能体API提供了创建、管理和与智能体对话的完整接口。</p>
          
          <h3>创建智能体</h3>
          <p><code>POST /v1/agents</code></p>
          
          <h4>请求参数</h4>
          <pre><code>{
  "name": "我的助手",
  "description": "一个有用的AI助手",
  "type": "assistant",
  "config": {
    "system_prompt": "你是一个有用的AI助手...",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "max_tokens": 2000
  }
}</code></pre>
          
          <h4>响应示例</h4>
          <pre><code>{
  "id": "agent_123",
  "name": "我的助手",
  "description": "一个有用的AI助手",
  "type": "assistant",
  "status": "active",
  "created_at": "2024-01-01T00:00:00Z",
  "config": {
    "system_prompt": "你是一个有用的AI助手...",
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "max_tokens": 2000
  }
}</code></pre>
          
          <h3>获取智能体列表</h3>
          <p><code>GET /v1/agents</code></p>
          
          <h4>查询参数</h4>
          <ul>
            <li><code>page</code> - 页码，默认为1</li>
            <li><code>limit</code> - 每页数量，默认为20</li>
            <li><code>type</code> - 智能体类型筛选</li>
            <li><code>status</code> - 状态筛选</li>
          </ul>
          
          <h3>与智能体对话</h3>
          <p><code>POST /v1/agents/{agent_id}/chat</code></p>
          
          <h4>请求参数</h4>
          <pre><code>{
  "message": "你好，请介绍一下自己",
  "conversation_id": "conv_456", // 可选，用于维持对话上下文
  "stream": false // 可选，是否流式返回
}</code></pre>
          
          <h4>响应示例</h4>
          <pre><code>{
  "id": "msg_789",
  "conversation_id": "conv_456",
  "message": "你好！我是您的AI助手...",
  "created_at": "2024-01-01T00:00:00Z",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 100,
    "total_tokens": 150
  }
}</code></pre>
          
          <h3>流式对话</h3>
          <p>设置 <code>stream: true</code> 可以获得流式响应：</p>
          <pre><code>data: {"type": "start", "conversation_id": "conv_456"}

data: {"type": "token", "content": "你好"}

data: {"type": "token", "content": "！"}

data: {"type": "end", "usage": {...}}</code></pre>
          
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
            <h4 class="text-green-800 font-semibold mb-2">💡 最佳实践</h4>
            <ul class="text-green-700 space-y-1">
              <li>使用conversation_id维持对话上下文</li>
              <li>对于实时应用，推荐使用流式响应</li>
              <li>合理设置temperature和max_tokens参数</li>
              <li>监控token使用量，避免超出限制</li>
            </ul>
          </div>
        `,
        order: 2
      }
    ]
  },
  {
    id: 'guides',
    title: '使用指南',
    items: [
      {
        id: 'agent-management',
        title: '智能体管理',
        description: '如何创建、配置和优化您的智能体',
        category: '使用指南',
        content: `
          <h2>智能体管理完整指南</h2>
          <p>本指南将详细介绍如何在Poping平台上创建、配置和优化您的智能体。</p>
          
          <h3>智能体类型选择</h3>
          <p>Poping支持多种智能体类型，每种类型都有其特定的用途和优化方向：</p>
          
          <h4>助手类型 (Assistant)</h4>
          <ul>
            <li><strong>适用场景</strong>：客服、问答、通用助理</li>
            <li><strong>特点</strong>：友好、有用、准确回答问题</li>
            <li><strong>推荐配置</strong>：temperature 0.3-0.7，注重准确性</li>
          </ul>
          
          <h4>创意类型 (Creative)</h4>
          <ul>
            <li><strong>适用场景</strong>：内容创作、文案写作、创意设计</li>
            <li><strong>特点</strong>：富有创造力、表达丰富</li>
            <li><strong>推荐配置</strong>：temperature 0.7-1.0，鼓励创新</li>
          </ul>
          
          <h4>分析类型 (Analysis)</h4>
          <ul>
            <li><strong>适用场景</strong>：数据分析、报告生成、逻辑推理</li>
            <li><strong>特点</strong>：逻辑严谨、数据驱动</li>
            <li><strong>推荐配置</strong>：temperature 0.1-0.5，注重准确性</li>
          </ul>
          
          <h3>系统提示词设计</h3>
          <p>系统提示词是定义智能体行为的核心，好的提示词应该：</p>
          
          <h4>结构化设计</h4>
          <pre><code>你是一个专业的[角色定义]。

你的主要职责包括：
1. [职责1]
2. [职责2]
3. [职责3]

在回答时，请遵循以下原则：
- [原则1]
- [原则2]
- [原则3]

回答格式：
[具体的格式要求]</code></pre>
          
          <h4>示例：客服助手</h4>
          <pre><code>你是一个专业的客服助手，代表Poping智能体服务平台。

你的主要职责包括：
1. 回答用户关于平台功能的问题
2. 协助用户解决技术问题
3. 提供友好、专业的服务体验

在回答时，请遵循以下原则：
- 保持友好和耐心的态度
- 提供准确、有用的信息
- 如果不确定答案，诚实说明并建议联系技术支持
- 使用简洁明了的语言

回答格式：
- 先确认理解用户问题
- 提供具体的解决方案或信息
- 询问是否还需要其他帮助</code></pre>
          
          <h3>参数调优指南</h3>
          
          <h4>Temperature（温度）</h4>
          <ul>
            <li><strong>0.0-0.3</strong>：高度确定性，适合事实性问答</li>
            <li><strong>0.3-0.7</strong>：平衡创造性和准确性，适合大多数场景</li>
            <li><strong>0.7-1.0</strong>：高创造性，适合创意写作</li>
          </ul>
          
          <h4>Max Tokens（最大长度）</h4>
          <ul>
            <li><strong>100-500</strong>：简短回答，适合问答场景</li>
            <li><strong>500-1500</strong>：中等长度，适合解释说明</li>
            <li><strong>1500+</strong>：长文本，适合内容创作</li>
          </ul>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 class="text-blue-800 font-semibold mb-2">🎯 优化建议</h4>
            <ul class="text-blue-700 space-y-1">
              <li>从简单的提示词开始，逐步优化</li>
              <li>使用A/B测试比较不同配置的效果</li>
              <li>收集用户反馈，持续改进</li>
              <li>定期检查智能体的表现指标</li>
            </ul>
          </div>
        `,
        order: 1
      },
      {
        id: 'dataset-management',
        title: '数据集管理',
        description: '数据上传、处理和训练指南',
        category: '使用指南',
        content: `
          <h2>数据集管理指南</h2>
          <p>高质量的数据集是训练优秀智能体的基础。本指南将帮助您有效管理和使用数据集。</p>
          
          <h3>支持的数据格式</h3>
          
          <h4>文本数据</h4>
          <ul>
            <li><strong>JSON</strong>：结构化对话数据</li>
            <li><strong>CSV</strong>：表格化数据</li>
            <li><strong>TXT</strong>：纯文本文档</li>
            <li><strong>JSONL</strong>：每行一个JSON对象</li>
          </ul>
          
          <h4>对话数据格式示例</h4>
          <pre><code>[
  {
    "input": "用户问题或输入",
    "output": "期望的智能体回答",
    "context": "可选的上下文信息"
  },
  {
    "input": "另一个用户问题",
    "output": "对应的回答",
    "context": "相关背景"
  }
]</code></pre>
          
          <h3>数据质量要求</h3>
          
          <h4>数据清洁</h4>
          <ul>
            <li>移除重复数据</li>
            <li>修正拼写错误</li>
            <li>统一格式和编码</li>
            <li>过滤低质量内容</li>
          </ul>
          
          <h4>数据标注</h4>
          <ul>
            <li>确保标注一致性</li>
            <li>提供充足的上下文</li>
            <li>覆盖各种使用场景</li>
            <li>平衡不同类型的样本</li>
          </ul>
          
          <h3>数据上传流程</h3>
          
          <h4>步骤1：准备数据</h4>
          <ol>
            <li>按照支持的格式整理数据</li>
            <li>验证数据质量和完整性</li>
            <li>压缩大文件（支持ZIP、RAR格式）</li>
          </ol>
          
          <h4>步骤2：上传数据</h4>
          <ol>
            <li>进入数据集管理页面</li>
            <li>点击"上传数据集"</li>
            <li>选择文件并填写描述信息</li>
            <li>设置数据集权限和标签</li>
          </ol>
          
          <h4>步骤3：数据处理</h4>
          <ol>
            <li>系统自动验证数据格式</li>
            <li>进行数据预处理和清洁</li>
            <li>生成数据统计报告</li>
            <li>创建可用的训练数据集</li>
          </ol>
          
          <h3>数据集使用</h3>
          
          <h4>训练智能体</h4>
          <ul>
            <li>选择合适的数据集</li>
            <li>配置训练参数</li>
            <li>监控训练进度</li>
            <li>评估训练效果</li>
          </ul>
          
          <h4>数据增强</h4>
          <ul>
            <li>同义词替换</li>
            <li>句式变换</li>
            <li>上下文扩展</li>
            <li>反向翻译</li>
          </ul>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
            <h4 class="text-yellow-800 font-semibold mb-2">📊 数据质量检查清单</h4>
            <ul class="text-yellow-700 space-y-1">
              <li>✅ 数据格式正确且一致</li>
              <li>✅ 无重复或冗余数据</li>
              <li>✅ 标注质量高且一致</li>
              <li>✅ 覆盖目标使用场景</li>
              <li>✅ 数据量充足（建议1000+样本）</li>
              <li>✅ 隐私和合规性检查通过</li>
            </ul>
          </div>
        `,
        order: 2
      }
    ]
  },
  {
    id: 'advanced',
    title: '高级功能',
    items: [
      {
        id: 'mcp-integration',
        title: 'MCP集成',
        description: '模型连接协议集成和第三方工具接入',
        category: '高级功能',
        content: `
          <h2>MCP集成指南</h2>
          <p>模型连接协议（MCP）允许您将第三方模型和工具集成到Poping平台中，扩展智能体的能力。</p>
          
          <h3>什么是MCP？</h3>
          <p>MCP（Model Connection Protocol）是一个开放的协议标准，用于连接不同的AI模型、工具和服务。通过MCP，您可以：</p>
          <ul>
            <li>接入第三方AI模型</li>
            <li>集成外部工具和API</li>
            <li>扩展智能体功能</li>
            <li>构建复合AI应用</li>
          </ul>
          
          <h3>支持的集成类型</h3>
          
          <h4>模型集成</h4>
          <ul>
            <li><strong>OpenAI模型</strong>：GPT-3.5、GPT-4系列</li>
            <li><strong>Anthropic模型</strong>：Claude系列</li>
            <li><strong>开源模型</strong>：Llama、Mistral等</li>
            <li><strong>自定义模型</strong>：您自己训练的模型</li>
          </ul>
          
          <h4>工具集成</h4>
          <ul>
            <li><strong>搜索工具</strong>：Google Search、Bing Search</li>
            <li><strong>数据库工具</strong>：SQL查询、NoSQL操作</li>
            <li><strong>API工具</strong>：RESTful API调用</li>
            <li><strong>文件工具</strong>：文档处理、图像分析</li>
          </ul>
          
          <h3>配置MCP集成</h3>
          
          <h4>步骤1：创建集成</h4>
          <ol>
            <li>进入MCP市场页面</li>
            <li>选择要集成的模型或工具</li>
            <li>点击"添加集成"</li>
            <li>填写集成配置信息</li>
          </ol>
          
          <h4>步骤2：配置参数</h4>
          <pre><code>{
  "name": "OpenAI GPT-4",
  "type": "model",
  "provider": "openai",
  "config": {
    "api_key": "your-openai-api-key",
    "model": "gpt-4",
    "base_url": "https://api.openai.com/v1"
  },
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 2000
  }
}</code></pre>
          
          <h4>步骤3：测试集成</h4>
          <ol>
            <li>使用测试功能验证连接</li>
            <li>检查响应格式和质量</li>
            <li>调整配置参数</li>
            <li>保存并激活集成</li>
          </ol>
          
          <h3>在智能体中使用MCP</h3>
          
          <h4>模型切换</h4>
          <p>在智能体配置中选择MCP集成的模型：</p>
          <pre><code>{
  "model": "mcp://openai-gpt4",
  "fallback_model": "gpt-3.5-turbo"
}</code></pre>
          
          <h4>工具调用</h4>
          <p>在系统提示词中启用工具使用：</p>
          <pre><code>你是一个智能助手，可以使用以下工具：
- search: 搜索互联网信息
- calculator: 进行数学计算
- weather: 查询天气信息

当需要使用工具时，请按照以下格式调用：
[TOOL:tool_name] 参数</code></pre>
          
          <h3>自定义MCP连接器</h3>
          
          <h4>连接器规范</h4>
          <pre><code>class CustomMCPConnector {
  async connect(config) {
    // 建立连接
  }
  
  async invoke(request) {
    // 处理请求
    return response;
  }
  
  async disconnect() {
    // 断开连接
  }
}</code></pre>
          
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-6">
            <h4 class="text-purple-800 font-semibold mb-2">🔧 开发提示</h4>
            <ul class="text-purple-700 space-y-1">
              <li>遵循MCP协议规范</li>
              <li>实现错误处理和重试机制</li>
              <li>添加适当的日志记录</li>
              <li>考虑性能和安全性</li>
              <li>提供详细的文档说明</li>
            </ul>
          </div>
        `,
        order: 1
      }
    ]
  }
])

// 计算属性
const filteredSections = computed(() => {
  if (!searchQuery.value) {
    return docSections.value
  }
  
  const query = searchQuery.value.toLowerCase()
  return docSections.value.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    )
  })).filter(section => section.items.length > 0)
})

// 获取所有文档项的扁平列表
const allDocs = computed(() => {
  return docSections.value.flatMap(section => section.items)
    .sort((a, b) => a.order - b.order)
})

// 获取上一篇和下一篇文档
const previousDoc = computed(() => {
  if (!activeDoc.value) return null
  const currentIndex = allDocs.value.findIndex(doc => doc.id === activeDoc.value!.id)
  return currentIndex > 0 ? allDocs.value[currentIndex - 1] : null
})

const nextDoc = computed(() => {
  if (!activeDoc.value) return null
  const currentIndex = allDocs.value.findIndex(doc => doc.id === activeDoc.value!.id)
  return currentIndex < allDocs.value.length - 1 ? allDocs.value[currentIndex + 1] : null
})

// 快速开始项目
const quickStartItems = computed<QuickStartItem[]>(() => [
  {
    id: 'quick-intro',
    title: '平台介绍',
    description: '了解Poping的核心功能和优势',
    icon: 'info',
    doc: allDocs.value.find(doc => doc.id === 'introduction')!
  },
  {
    id: 'quick-start',
    title: '快速开始',
    description: '5分钟创建您的第一个智能体',
    icon: 'rocket',
    doc: allDocs.value.find(doc => doc.id === 'getting-started')!
  },
  {
    id: 'quick-api',
    title: 'API参考',
    description: '查看完整的API文档和示例',
    icon: 'api',
    doc: allDocs.value.find(doc => doc.id === 'authentication')!
  }
])

// 方法
const selectDoc = (doc: DocItem) => {
  activeDoc.value = doc
  // 更新URL但不刷新页面
  router.replace({ path: '/docs', query: { doc: doc.id } })
}

// 组件挂载时的逻辑
onMounted(() => {
  // 从URL参数中获取要显示的文档
  const docId = route.query.doc as string
  if (docId) {
    const doc = allDocs.value.find(d => d.id === docId)
    if (doc) {
      activeDoc.value = doc
    }
  }
  
  // 如果没有指定文档，默认显示第一个文档
  if (!activeDoc.value && allDocs.value.length > 0) {
    activeDoc.value = allDocs.value[0]
  }
})
</script>

<style scoped>
.prose {
  color: #374151;
  line-height: 1.7;
}

.prose h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-top: 2rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.prose h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.prose p {
  margin-bottom: 1rem;
}

.prose ul, .prose ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose pre {
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', monospace;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
}

.prose a {
  color: #111827;
  text-decoration: underline;
}

.prose a:hover {
  color: #374151;
}

.prose strong {
  font-weight: 600;
  color: #111827;
}
</style>