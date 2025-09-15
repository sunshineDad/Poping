<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="absolute top-0 left-0 right-0 z-10">
      <div class="container mx-auto px-6 py-4">
        <router-link to="/" class="text-xl font-semibold text-black">
          Poping
        </router-link>
      </div>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <!-- 404图标 -->
      <div class="mb-8">
        <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20a7.962 7.962 0 01-5.207-1.955c-2.18-2.008-2.18-5.3 0-7.308A7.962 7.962 0 0112 4a7.962 7.962 0 015.207 1.955c2.18 2.008 2.18 5.3 0 7.308z" />
          </svg>
        </div>
      </div>

      <!-- 错误信息 -->
      <div class="mb-8">
        <h1 class="text-6xl font-bold text-black mb-4">404</h1>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">
          页面未找到
        </h2>
        <p class="text-gray-600 mb-8">
          抱歉，您访问的页面不存在或已被移动。
        </p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link 
          to="/"
          class="btn btn-primary px-6 py-3 text-base rounded-lg font-medium"
        >
          返回首页
        </router-link>
        <button 
          @click="goBack"
          class="btn btn-secondary px-6 py-3 text-base rounded-lg font-medium"
        >
          返回上页
        </button>
      </div>

      <!-- 帮助链接 -->
      <div class="mt-8 text-sm text-gray-500">
        <p>
          需要帮助？
          <router-link to="/docs" class="text-black hover:text-gray-700 font-medium">
            查看文档
          </router-link>
          或
          <router-link to="/contact" class="text-black hover:text-gray-700 font-medium">
            联系我们
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
}
</style>