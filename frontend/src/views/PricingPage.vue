<template>
  <div class="min-h-screen bg-white">
    <!-- Header 导航栏 -->
    <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div class="container mx-auto px-6">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-semibold text-black">
              Poping
            </router-link>
          </div>
          
          <!-- 导航菜单 -->
          <nav class="hidden md:flex items-center space-x-8">
            <router-link 
              to="/docs" 
              class="text-sm text-black hover:text-gray-600 transition-colors duration-200"
            >
              文档中心
            </router-link>
            <router-link 
              to="/pricing" 
              class="text-sm text-black hover:text-gray-600 transition-colors duration-200 border-b-2 border-black"
            >
              定价策略
            </router-link>
          </nav>
          
          <!-- 用户操作区 -->
          <div class="flex items-center space-x-3">
            <router-link 
              to="/login"
              class="px-4 py-2 text-sm text-black border border-gray-200 rounded hover:bg-gray-50 transition-colors duration-200"
            >
              登录
            </router-link>
            <router-link 
              to="/register"
              class="px-4 py-2 text-sm text-white bg-black rounded hover:bg-gray-800 transition-colors duration-200"
            >
              注册
            </router-link>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="pt-24 pb-12 bg-white">
      <div class="container mx-auto px-6 text-center">
        <h1 class="text-4xl font-bold text-black mb-4">
          选择适合您的计划
        </h1>
        <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          从免费计划开始，随着业务增长升级到更高级的功能
        </p>
        
        <!-- 计费周期切换 -->
        <div class="flex items-center justify-center mb-12">
          <div class="bg-gray-100 p-1 rounded-lg">
            <button 
              @click="billingCycle = 'monthly'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                billingCycle === 'monthly' 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-gray-600 hover:text-black'
              ]"
            >
              按月付费
            </button>
            <button 
              @click="billingCycle = 'yearly'"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                billingCycle === 'yearly' 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-gray-600 hover:text-black'
              ]"
            >
              按年付费
              <span class="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                省20%
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 定价卡片 -->
    <section class="pb-20">
      <div class="container mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <!-- 免费计划 -->
          <div class="card border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200">
            <div class="text-center">
              <h3 class="text-xl font-semibold text-black mb-2">
                免费计划
              </h3>
              <p class="text-gray-600 text-sm mb-6">
                适合个人开发者和小型项目
              </p>
              <div class="mb-6">
                <span class="text-4xl font-bold text-black">¥0</span>
                <span class="text-gray-600 ml-1">/月</span>
              </div>
              <button class="btn btn-secondary w-full mb-6">
                开始使用
              </button>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">1,000 API调用/月</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">1GB 存储空间</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">3个智能体</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">基础支持</span>
              </div>
            </div>
          </div>

          <!-- 专业计划 -->
          <div class="card border-2 border-black relative">
            <!-- 推荐标签 -->
            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span class="bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
                推荐
              </span>
            </div>
            
            <div class="text-center">
              <h3 class="text-xl font-semibold text-black mb-2">
                专业计划
              </h3>
              <p class="text-gray-600 text-sm mb-6">
                适合成长中的团队和企业
              </p>
              <div class="mb-6">
                <span class="text-4xl font-bold text-black">
                  ¥{{ billingCycle === 'monthly' ? '99' : '79' }}
                </span>
                <span class="text-gray-600 ml-1">/月</span>
                <div v-if="billingCycle === 'yearly'" class="text-sm text-green-600 mt-1">
                  年付节省 ¥240
                </div>
              </div>
              <button class="btn btn-primary w-full mb-6">
                开始免费试用
              </button>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">10,000 API调用/月</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">10GB 存储空间</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">10个智能体</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">优先支持</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">高级分析</span>
              </div>
            </div>
          </div>

          <!-- 企业计划 -->
          <div class="card border-2 border-gray-200 hover:border-gray-300 transition-colors duration-200">
            <div class="text-center">
              <h3 class="text-xl font-semibold text-black mb-2">
                企业计划
              </h3>
              <p class="text-gray-600 text-sm mb-6">
                适合大型企业和高级用户
              </p>
              <div class="mb-6">
                <span class="text-4xl font-bold text-black">
                  ¥{{ billingCycle === 'monthly' ? '299' : '239' }}
                </span>
                <span class="text-gray-600 ml-1">/月</span>
                <div v-if="billingCycle === 'yearly'" class="text-sm text-green-600 mt-1">
                  年付节省 ¥720
                </div>
              </div>
              <button class="btn btn-primary w-full mb-6">
                联系销售
              </button>
            </div>
            
            <div class="space-y-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">无限 API调用</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">100GB 存储空间</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">无限智能体</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">24/7 专属支持</span>
              </div>
              <div class="flex items-center">
                <svg class="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm text-gray-700">定制化部署</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-semibold text-black mb-4">
            常见问题
          </h2>
          <p class="text-lg text-gray-600">
            关于定价和功能的常见问题解答
          </p>
        </div>
        
        <div class="max-w-3xl mx-auto space-y-6">
          <div 
            v-for="(faq, index) in faqs"
            :key="index"
            class="bg-white rounded-lg border border-gray-200 p-6"
          >
            <button 
              @click="toggleFaq(index)"
              class="w-full text-left flex items-center justify-between"
            >
              <h3 class="text-lg font-medium text-black">
                {{ faq.question }}
              </h3>
              <svg 
                :class="[
                  'w-5 h-5 text-gray-400 transition-transform duration-200',
                  openFaq === index ? 'transform rotate-180' : ''
                ]"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div 
              v-if="openFaq === index"
              class="mt-4 text-gray-600 leading-relaxed"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 bg-gray-900 text-white">
      <div class="container mx-auto px-6">
        <div class="text-center">
          <h3 class="text-lg font-semibold mb-4">准备开始了吗？</h3>
          <p class="text-gray-400 mb-6">
            立即注册，开始使用 Poping 智能体服务平台
          </p>
          <router-link 
            to="/register"
            class="btn btn-primary px-8 py-3 text-base rounded-lg font-medium"
          >
            免费开始
          </router-link>
        </div>
        
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Poping. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 响应式数据
const billingCycle = ref<'monthly' | 'yearly'>('monthly')
const openFaq = ref<number | null>(null)

// FAQ数据
const faqs = [
  {
    question: '免费计划有什么限制？',
    answer: '免费计划包含每月1000次API调用、1GB存储空间和最多3个智能体。适合个人开发者和小型项目使用。'
  },
  {
    question: '可以随时升级或降级计划吗？',
    answer: '是的，您可以随时升级或降级您的计划。升级立即生效，降级将在当前计费周期结束后生效。'
  },
  {
    question: '支持哪些支付方式？',
    answer: '我们支持信用卡、支付宝、微信支付等多种支付方式。企业用户还可以选择银行转账。'
  },
  {
    question: '有免费试用期吗？',
    answer: '专业计划和企业计划都提供14天免费试用期，无需信用卡即可开始试用。'
  },
  {
    question: '如何取消订阅？',
    answer: '您可以在账户设置中随时取消订阅。取消后，您的服务将在当前计费周期结束后停止。'
  }
]

// 方法
const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>