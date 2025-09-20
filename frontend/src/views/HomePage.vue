<template>
  <div class="min-h-screen bg-white">
    <!-- Header 导航栏 -->
    <header
      class="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100"
    >
      <div class="max-w-7xl mx-auto px-8">
        <div class="flex items-center justify-between h-20">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold text-black tracking-tight">
              Poping
            </router-link>
          </div>

          <!-- 导航菜单 -->
          <nav class="hidden md:flex items-center space-x-10">
            <router-link
              to="/docs"
              class="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200"
            >
              文档
            </router-link>
            <router-link
              to="/pricing"
              class="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200"
            >
              定价
            </router-link>
          </nav>

          <!-- 用户操作区 -->
          <div class="flex items-center space-x-4">
            <!-- 未登录状态 -->
            <template v-if="!isLoggedIn">
              <!-- 登录按钮 -->
              <router-link
                to="/login"
                class="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200"
              >
                登录
              </router-link>

              <!-- 注册按钮 -->
              <router-link
                to="/register"
                class="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                开始使用
              </router-link>
            </template>

            <!-- 已登录状态 -->
            <template v-else>
              <!-- 用户名显示 -->
              <span class="text-sm font-medium text-gray-700"> 欢迎，{{ userName }} </span>

              <!-- 仪表板按钮 -->
              <button
                @click="goToDashboard"
                class="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200"
              >
                仪表板
              </button>

              <!-- 退出登录按钮 -->
              <button
                @click="handleLogout"
                class="px-6 py-2.5 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                退出登录
              </button>
            </template>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section 主视觉区 -->
    <section
      class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white"
    >
      <!-- 棋盤格背景 -->
      <div class="absolute inset-0 hero-grid-pattern opacity-60"></div>

      <!-- Hero装饰性气泡 -->
      <div class="hero-bubble hero-bubble-1"></div>
      <div class="hero-bubble hero-bubble-2"></div>
      <div class="hero-bubble hero-bubble-3"></div>

      <!-- 精致装饰元素 -->
      <div
        class="absolute top-1/4 left-8 w-2 h-2 bg-gray-400 rounded-full opacity-40 animate-pulse"
      ></div>
      <div class="absolute top-1/3 right-12 w-1 h-1 bg-gray-400 rounded-full opacity-60"></div>
      <div
        class="absolute bottom-1/3 left-16 w-1.5 h-1.5 bg-green-400 rounded-full opacity-50 animate-pulse"
        style="animation-delay: 1s"
      ></div>
      <div class="absolute bottom-1/4 right-8 w-1 h-1 bg-purple-400 rounded-full opacity-40"></div>

      <div class="relative z-10 max-w-7xl mx-auto px-8 text-center">
        <div class="mb-6">
          <span
            class="inline-block px-4 py-2 bg-gray-50 text-gray-900 text-sm font-medium rounded-full border border-gray-200"
          >
            🚀 下一代AI智能体平台
          </span>
        </div>

        <h1
          class="text-6xl md:text-8xl font-black text-black mb-10 tracking-tight leading-none futuristic-font"
        >
          <span class="block mb-2 relative">
            智能体
            <span class="popping-decoration">POPPING</span>
          </span>
          <span
            class="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"
          >
            新纪元
          </span>
        </h1>

        <!-- 像素点消息气泡 -->
        <div class="pixel-message-bubbles">
          <div class="pixel-bubble-msg pixel-bubble-1">
            <div class="pixel-dots">
              <span class="pixel-dot"></span>
              <span class="pixel-dot"></span>
              <span class="pixel-dot"></span>
            </div>
          </div>
          <div class="pixel-bubble-msg pixel-bubble-2">
            <div class="pixel-dots">
              <span class="pixel-dot"></span>
              <span class="pixel-dot"></span>
              <span class="pixel-dot"></span>
              <span class="pixel-dot"></span>
            </div>
          </div>
          <div class="pixel-bubble-msg pixel-bubble-3">
            <div class="pixel-dots">
              <span class="pixel-dot"></span>
              <span class="pixel-dot"></span>
            </div>
          </div>
        </div>

        <p
          class="text-xl md:text-2xl text-gray-600 mb-20 max-w-4xl mx-auto leading-relaxed font-light"
        >
          专业级AI智能体开发与部署平台<br class="hidden md:block" />
          <span class="text-lg text-gray-500">让每个想法都能成为智能解决方案</span>
        </p>

        <!-- 核心特性标签 -->
        <div class="flex flex-wrap justify-center gap-4 mb-16">
          <span
            class="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-lg border border-gray-200 shadow-sm"
          >
            ⚡ 极速部署
          </span>
          <span
            class="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-lg border border-gray-200 shadow-sm"
          >
            🎯 精准对话
          </span>
          <span
            class="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-lg border border-gray-200 shadow-sm"
          >
            🔧 灵活配置
          </span>
          <span
            class="px-4 py-2 bg-white/80 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-lg border border-gray-200 shadow-sm"
          >
            📊 数据洞察
          </span>
        </div>

        <!-- 滚动提示 -->
      </div>
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          @click="scrollToPlayground"
          class="group flex flex-col items-center space-y-2 hover:scale-105 transition-transform duration-300"
        >
          <div
            class="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
          >
            <svg
              class="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-300 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              ></path>
            </svg>
          </div>
          <span class="text-xs text-gray-500 font-medium">体验对话</span>
        </button>
      </div>
    </section>

    <!-- AI Chat Playground -->
    <section
      ref="playgroundSection"
      class="py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
    >
      <!-- 棋盘格背景 -->
      <div class="absolute inset-0 opacity-40">
        <div class="chat-grid-pattern"></div>
      </div>

      <!-- 像素风格消息气泡点缀 -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="chat-pixel-bubble bubble-1">
          <div class="bubble-content">
            <div class="pixel-dot"></div>
            <div class="pixel-dot"></div>
            <div class="pixel-dot"></div>
          </div>
        </div>
        <div class="chat-pixel-bubble bubble-2">
          <div class="bubble-content">
            <div class="pixel-dot"></div>
            <div class="pixel-dot"></div>
          </div>
        </div>
        <div class="chat-pixel-bubble bubble-3">
          <div class="bubble-content">
            <div class="pixel-dot"></div>
            <div class="pixel-dot"></div>
            <div class="pixel-dot"></div>
            <div class="pixel-dot"></div>
          </div>
        </div>
        <div class="chat-pixel-bubble bubble-4">
          <div class="bubble-content">
            <div class="pixel-dot"></div>
            <div class="pixel-dot"></div>
          </div>
        </div>
      </div>

      <!-- 交互式流程图区 -->
      <section class="flowchart-section">
        <div class="container">
          <InteractiveFlowChart />
        </div>
      </section>

      <div class="max-w-7xl mx-auto px-8 relative z-10">
        <div class="text-center mb-20">
          <!-- <div class="mb-6">
            <span
              class="inline-block px-4 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-full border border-blue-100"
            >
              💬 实时对话体验
            </span>
          </div> -->
          <h2 class="text-5xl md:text-6xl font-black text-black mb-8 tracking-tight">AI智能对话</h2>
          <p class="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            与AI智能体进行自然对话，体验前沿的人工智能交互技术<br class="hidden md:block" />
            <span class="text-lg text-gray-500">每一次对话都是智能的开始</span>
          </p>
        </div>

        <div class="max-w-5xl mx-auto">
          <div
            class="bg-white/95 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl overflow-hidden"
          >
            <!-- 聊天头部 -->
            <div
              class="bg-gradient-to-r from-white via-gray-50 to-white px-8 py-6 border-b border-gray-200/50"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <div
                      class="w-14 h-14 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg"
                    >
                      <svg
                        class="w-7 h-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        ></path>
                      </svg>
                    </div>
                    <div
                      class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                    ></div>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">AI智能助手</h3>
                    <p class="text-sm text-gray-500 flex items-center">
                      <span class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      在线 • 随时为您服务
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
            </div>

            <!-- 消息区域 -->
            <div
              class="h-96 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-gray-50/20 to-white/30 chat-grid-pattern"
            >
              <!-- 欢迎消息 -->
              <div class="flex justify-start">
                <div class="max-w-sm lg:max-w-lg">
                  <div
                    class="bg-white/90 border border-gray-200/50 text-gray-800 mr-4 shadow-gray-100 px-6 py-4 rounded-2xl shadow-sm backdrop-blur-sm"
                  >
                    <p class="text-sm leading-relaxed">
                      您好！我是您的AI智能助手，很高兴为您服务。请告诉我您需要什么帮助？
                    </p>
                  </div>
                  <p class="text-xs text-gray-500 mt-2 px-2 text-left">刚刚</p>
                </div>
              </div>

              <div
                v-for="message in chatMessages"
                :key="message.id"
                class="flex"
                :class="message.isUser ? 'justify-end' : 'justify-start'"
              >
                <div class="max-w-sm lg:max-w-lg">
                  <div
                    class="px-6 py-4 rounded-2xl shadow-sm backdrop-blur-sm"
                    :class="
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-4 shadow-blue-200'
                        : 'bg-white/90 border border-gray-200/50 text-gray-800 mr-4 shadow-gray-100'
                    "
                  >
                    <p class="text-sm leading-relaxed">{{ message.content }}</p>
                  </div>
                  <p
                    class="text-xs text-gray-500 mt-2 px-2"
                    :class="message.isUser ? 'text-right' : 'text-left'"
                  >
                    {{ message.time }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 输入区域 -->
            <div
              class="p-8 bg-gradient-to-r from-white via-gray-50 to-white border-t border-gray-200/50"
            >
              <div class="flex space-x-4">
                <input
                  v-model="currentMessage"
                  @keypress.enter="sendMessage"
                  type="text"
                  placeholder="输入您的问题，开始AI对话..."
                  class="flex-1 px-6 py-4 border border-gray-300/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm text-gray-900 placeholder-gray-500 transition-all duration-200"
                />
                <button
                  @click="sendMessage"
                  :disabled="!currentMessage.trim() || isTyping"
                  class="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium group"
                >
                  <svg
                    v-if="!isTyping"
                    class="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                  <svg
                    v-else
                    class="w-5 h-5 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-32 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div class="max-w-5xl mx-auto px-8 text-center">
        <h2 class="text-5xl font-black text-black mb-8 tracking-tight">开启AI智能体之旅</h2>
        <p class="text-xl text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
          加入数千名开发者，体验下一代AI智能体服务平台<br class="hidden md:block" />
          让AI为您的业务创造无限可能
        </p>

        <!-- 主要行动按钮 -->
        <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <!-- 未登录状态 -->
          <template v-if="!isLoggedIn">
            <router-link
              to="/register"
              class="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              立即体验
            </router-link>
            <router-link
              to="/login"
              class="px-8 py-4 bg-white text-gray-800 text-lg font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              登录账户
            </router-link>
          </template>

          <!-- 已登录状态 -->
          <template v-else>
            <button
              @click="goToDashboard"
              class="px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-lg font-semibold rounded-2xl hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
            >
              <IconComponents name="dashboard" size="sm" class="mr-2" />
              进入仪表板
            </button>
            <router-link
              to="/playground"
              class="px-8 py-4 bg-white text-gray-800 text-lg font-semibold rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md flex items-center"
            >
              <IconComponents name="playground" size="sm" class="mr-2" />
              AI 游乐场
            </router-link>
          </template>
        </div>

        <!-- 特色数据展示 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div class="text-center">
            <div class="text-4xl font-black text-black mb-2">50K+</div>
            <div class="text-sm text-gray-600 font-medium">活跃用户</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-black mb-2">1.2K+</div>
            <div class="text-sm text-gray-600 font-medium">智能体</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-black mb-2">2.5M+</div>
            <div class="text-sm text-gray-600 font-medium">API调用</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-16 bg-black text-white">
      <div class="max-w-6xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 class="text-xl font-semibold mb-6">Poping</h3>
            <p class="text-gray-400 leading-relaxed">
              智能体服务平台，为您的AI应用提供强大的数据处理和模型服务能力。
            </p>
          </div>
          <div>
            <h4 class="font-semibold mb-6">产品</h4>
            <ul class="space-y-3 text-gray-400">
              <li>
                <router-link to="/agents" class="hover:text-white transition-colors"
                  >智能体</router-link
                >
              </li>
              <li>
                <router-link to="/datasets" class="hover:text-white transition-colors"
                  >数据集</router-link
                >
              </li>
              <li>
                <router-link to="/playground" class="hover:text-white transition-colors"
                  >游乐场</router-link
                >
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-6">资源</h4>
            <ul class="space-y-3 text-gray-400">
              <li>
                <router-link to="/docs" class="hover:text-white transition-colors"
                  >文档</router-link
                >
              </li>
              <li>
                <router-link to="/api" class="hover:text-white transition-colors">API</router-link>
              </li>
              <li>
                <router-link to="/support" class="hover:text-white transition-colors"
                  >支持</router-link
                >
              </li>
            </ul>
          </div>
          <div>
            <h4 class="font-semibold mb-6">公司</h4>
            <ul class="space-y-3 text-gray-400">
              <li>
                <router-link to="/about" class="hover:text-white transition-colors"
                  >关于我们</router-link
                >
              </li>
              <li>
                <router-link to="/contact" class="hover:text-white transition-colors"
                  >联系我们</router-link
                >
              </li>
              <li>
                <router-link to="/privacy" class="hover:text-white transition-colors"
                  >隐私政策</router-link
                >
              </li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Poping. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import IconComponents from '@/components/icons/IconComponents.vue'
import InteractiveFlowChart from '@/components/InteractiveFlowChart.vue'

// 认证和路由
const authStore = useAuthStore()
const router = useRouter()

// 类型定义
interface PlatformStats {
  users_count: number
  agents_count: number
  api_calls_count: number
}

interface ChatMessage {
  id: number
  content: string
  isUser: boolean
  time: string
}

interface Feature {
  icon: string
  title: string
  description: string
}

// 响应式数据
const stats = ref<PlatformStats | null>(null)
const playgroundSection = ref<HTMLElement>()

// 登录状态检测
const isLoggedIn = computed(() => authStore.isAuthenticated)
const userName = computed(
  () => authStore.user?.nickname || authStore.user?.username || authStore.user?.email || '用户',
)

// 聊天功能相关数据
const currentMessage = ref('')
const chatMessages = ref<ChatMessage[]>([])
const isTyping = ref(false)
const messageIdCounter = ref(1)

// 游乐场操作选项
// 定义操作选项接口
interface PlaygroundAction {
  value: string
  label: string
}

const playgroundActions: PlaygroundAction[] = [
  { value: 'scrape', label: 'Scrape' },
  { value: 'search', label: 'Search' },
  { value: 'map', label: 'Map' },
  { value: 'crawl', label: 'Crawl' },
]

// 功能特性数据
const features: Feature[] = [
  {
    icon: 'dashboard',
    title: '智能体创建',
    description: '快速创建和配置AI智能体，支持多种模型和自定义参数设置',
  },
  {
    icon: 'dataset',
    title: '数据管理',
    description: '强大的数据集管理功能，支持多种格式的数据上传和预处理',
  },
  {
    icon: 'settings',
    title: 'MCP协议',
    description: '支持MCP协议，轻松集成第三方模型和工具，扩展平台能力',
  },
  {
    icon: 'api',
    title: '高性能API',
    description: '提供高性能的RESTful API接口，支持大规模并发调用',
  },
  {
    icon: 'playground',
    title: '交互式游乐场',
    description: '在线测试和调试智能体功能，实时查看处理结果',
  },
  {
    icon: 'analytics',
    title: '实时监控',
    description: '完整的监控和分析功能，实时掌握系统运行状态和性能指标',
  },
]

// 方法
const formatUserCount = (count: number): string => {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M'
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'K'
  }
  return count.toString()
}

const scrollToPlayground = () => {
  playgroundSection.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const fetchPlatformStats = async () => {
  try {
    // 模拟API调用获取平台统计信息
    await new Promise((resolve) => setTimeout(resolve, 1000))

    stats.value = {
      users_count: 56500,
      agents_count: 1200,
      api_calls_count: 2500000,
    }
  } catch (error) {
    console.error('获取平台统计失败:', error)
  }
}

// 聊天功能方法
const sendMessage = async () => {
  if (!currentMessage.value.trim() || isTyping.value) return

  const userMessage = {
    id: messageIdCounter.value++,
    content: currentMessage.value,
    isUser: true,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  }

  chatMessages.value.push(userMessage)
  const messageToSend = currentMessage.value
  currentMessage.value = ''
  isTyping.value = true

  // 模拟AI回复
  setTimeout(() => {
    const aiMessage = {
      id: messageIdCounter.value++,
      content: `感谢您的问题："${messageToSend}"。这是一个演示回复，展示了我们AI助手的对话能力。`,
      isUser: false,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }
    chatMessages.value.push(aiMessage)
    isTyping.value = false
  }, 1500)
}

// 退出登录方法
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 跳转到仪表板
const goToDashboard = () => {
  router.push('/dashboard')
}

// 生命周期
onMounted(() => {
  fetchPlatformStats()
})
</script>

<style scoped>
/* 自定义样式 */
.container {
  max-width: 1200px;
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 代码高亮样式 */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 未来感字体 */
.futuristic-font {
  font-family:
    'Avenir Next',
    'Futura',
    'Din Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* POPPING装饰文字 */
.popping-decoration {
  position: absolute;
  top: -20px;
  right: -80px;
  font-size: 0.25em;
  font-weight: 600;
  color: #3b82f6;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transform: rotate(-8deg);
  opacity: 0.8;
  letter-spacing: 0.1em;
  animation: poppingGlow 3s ease-in-out infinite;
}

/* 像素点消息气泡容器 */
.pixel-message-bubbles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

/* 像素消息气泡 */
.pixel-bubble-msg {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  padding: 12px 16px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
  animation: pixelBubbleFloat 6s ease-in-out infinite;
}

.pixel-bubble-1 {
  top: 25%;
  left: 15%;
  animation-delay: 0s;
}

.pixel-bubble-2 {
  top: 45%;
  right: 20%;
  animation-delay: 2s;
}

.pixel-bubble-3 {
  bottom: 35%;
  left: 25%;
  animation-delay: 4s;
}

/* 像素点容器 */
.pixel-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 像素点 */
.pixel-dot {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 1px;
  animation: pixelDotPulse 1.5s ease-in-out infinite;
}

.pixel-dot:nth-child(1) {
  animation-delay: 0s;
}
.pixel-dot:nth-child(2) {
  animation-delay: 0.3s;
}
.pixel-dot:nth-child(3) {
  animation-delay: 0.6s;
}
.pixel-dot:nth-child(4) {
  animation-delay: 0.9s;
}

/* 棋盘格背景 */
.grid-pattern {
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 24px 24px;
}

.hero-grid-pattern {
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Hero区域装饰性气泡 */
.hero-bubble {
  position: absolute;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.02);
  animation: heroFloat 12s ease-in-out infinite;
}

.hero-bubble-1 {
  width: 120px;
  height: 120px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.hero-bubble-2 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 15%;
  animation-delay: 4s;
}

.hero-bubble-3 {
  width: 60px;
  height: 60px;
  bottom: 30%;
  left: 20%;
  animation-delay: 8s;
}

/* 像素风格圆环气泡动画 */
.pixel-ring {
  position: absolute;
  border: 3px solid;
  border-radius: 50%;
  background: transparent;
  animation: pixelFloat 8s ease-in-out infinite;
}

/* 像素风格消息气泡 */
.chat-pixel-bubble {
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(59, 130, 246, 0.2);
  border-radius: 16px;
  padding: 8px 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: chatBubbleFloat 6s ease-in-out infinite;
}

.bubble-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.chat-pixel-bubble .pixel-dot {
  width: 6px;
  height: 6px;
  background: rgba(59, 130, 246, 0.6);
  border-radius: 1px;
  animation: chatDotPulse 2s ease-in-out infinite;
}

.bubble-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.bubble-1 .pixel-dot:nth-child(1) {
  animation-delay: 0s;
}
.bubble-1 .pixel-dot:nth-child(2) {
  animation-delay: 0.3s;
}
.bubble-1 .pixel-dot:nth-child(3) {
  animation-delay: 0.6s;
}

.bubble-2 {
  top: 60%;
  right: 15%;
  border-color: rgba(16, 185, 129, 0.2);
  animation-delay: 2s;
}

.bubble-2 .pixel-dot {
  background: rgba(16, 185, 129, 0.6);
}

.bubble-2 .pixel-dot:nth-child(1) {
  animation-delay: 0.2s;
}
.bubble-2 .pixel-dot:nth-child(2) {
  animation-delay: 0.5s;
}

.bubble-3 {
  bottom: 30%;
  left: 20%;
  border-color: rgba(245, 158, 11, 0.2);
  animation-delay: 4s;
}

.bubble-3 .pixel-dot {
  background: rgba(245, 158, 11, 0.6);
}

.bubble-3 .pixel-dot:nth-child(1) {
  animation-delay: 0.1s;
}
.bubble-3 .pixel-dot:nth-child(2) {
  animation-delay: 0.4s;
}
.bubble-3 .pixel-dot:nth-child(3) {
  animation-delay: 0.7s;
}
.bubble-3 .pixel-dot:nth-child(4) {
  animation-delay: 1s;
}

.bubble-4 {
  top: 40%;
  right: 25%;
  border-color: rgba(139, 92, 246, 0.2);
  animation-delay: 1s;
}

.bubble-4 .pixel-dot {
  background: rgba(139, 92, 246, 0.6);
}

.bubble-4 .pixel-dot:nth-child(1) {
  animation-delay: 0.3s;
}
.bubble-4 .pixel-dot:nth-child(2) {
  animation-delay: 0.6s;
}

.chat-grid-pattern {
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 16px 16px;
}

@keyframes heroFloat {
  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-30px) scale(1.05);
    opacity: 0.6;
  }
}

@keyframes pixelFloat {
  0%,
  100% {
    transform: translateY(0px) scale(1) rotate(0deg);
    opacity: 0.4;
  }
  33% {
    transform: translateY(-15px) scale(1.1) rotate(120deg);
    opacity: 0.8;
  }
  66% {
    transform: translateY(-25px) scale(0.9) rotate(240deg);
    opacity: 0.6;
  }
}

@keyframes poppingGlow {
  0%,
  100% {
    opacity: 0.8;
    transform: rotate(-8deg) scale(1);
  }
  50% {
    opacity: 1;
    transform: rotate(-8deg) scale(1.05);
  }
}

@keyframes pixelBubbleFloat {
  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-20px) scale(1.02);
    opacity: 1;
  }
}

@keyframes pixelDotPulse {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

@keyframes chatBubbleFloat {
  0%,
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-20px) scale(1.02);
    opacity: 1;
  }
}

@keyframes chatDotPulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.1);
  }
}

/* 流程图区域样式 */
.flowchart-section {
  background: #ffffff;
  padding: 80px 0;
  position: relative;
}

.flowchart-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  h1 {
    font-size: 2.5rem;
  }

  .section {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .grid-pattern,
  .hero-grid-pattern {
    background-size: 16px 16px;
  }

  .chat-grid-pattern {
    background-size: 12px 12px;
  }

  .hero-bubble {
    width: 60px !important;
    height: 60px !important;
  }

  .pixel-ring {
    width: 40px !important;
    height: 40px !important;
    border-width: 2px;
  }

  .hero-bubble-1,
  .hero-bubble-2,
  .hero-bubble-3 {
    width: 60px;
    height: 60px;
  }

  .ring-1,
  .ring-2,
  .ring-3,
  .ring-4,
  .ring-5 {
    width: 40px;
    height: 40px;
  }

  .chat-pixel-bubble {
    padding: 6px 8px !important;
    border-radius: 12px !important;
  }

  .chat-pixel-bubble .pixel-dot {
    width: 4px !important;
    height: 4px !important;
  }

  .bubble-content {
    gap: 3px !important;
  }

  .popping-decoration {
    font-size: 0.2em;
    top: -15px;
    right: -60px;
  }

  .pixel-bubble-msg {
    padding: 8px 12px;
    border-radius: 16px;
  }

  .pixel-dot {
    width: 4px;
    height: 4px;
  }

  .pixel-bubble-1 {
    top: 20%;
    left: 10%;
  }

  .pixel-bubble-2 {
    top: 50%;
    right: 15%;
  }

  .pixel-bubble-3 {
    bottom: 30%;
    left: 20%;
  }
}
</style>
