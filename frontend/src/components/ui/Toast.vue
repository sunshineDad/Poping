<template>
  <Teleport to="body">
    <Transition
      enter-active-class="animate-in slide-in-from-top-2 fade-in-0 duration-300"
      leave-active-class="animate-out slide-out-to-top-2 fade-out-0 duration-200"
    >
      <div
        v-if="visible"
        :class="toastClasses"
        class="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border max-w-md"
        role="alert"
      >
        <!-- 图标 -->
        <div class="flex-shrink-0">
          <svg v-if="type === 'success'" class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="type === 'error'" class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="type === 'warning'" class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>

        <!-- 消息内容 -->
        <div class="flex-1 min-w-0">
          <p v-if="title" class="text-sm font-medium text-gray-900 dark:text-white">
            {{ title }}
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300" :class="{ 'mt-1': title }">
            {{ message }}
          </p>
        </div>

        <!-- 关闭按钮 -->
        <button
          v-if="closable"
          @click="close"
          class="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'

/**
 * [文件概览]
 * - 目的: 统一的消息提示组件
 * - 数据流: 组件调用 → Toast显示 → 自动隐藏/手动关闭
 * - 核心数据: 消息类型、内容、显示状态
 * - 关系: 全局消息提示系统的核心组件
 */

export interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  closable?: boolean
  visible?: boolean
}

const props = withDefaults(defineProps<ToastProps>(), {
  type: 'info',
  duration: 4000,
  closable: true,
  visible: true
})

const emit = defineEmits<{
  close: []
}>()

let timer: number | null = null

/**
 * [函数: toastClasses]
 * - 输入: 无
 * - 输出: string[] - CSS类名数组
 * - 角色: 根据消息类型生成对应的样式类
 * - 逻辑: 根据type属性返回不同的背景和边框颜色
 */
const toastClasses = computed(() => {
  const baseClasses = 'bg-white/90 dark:bg-gray-800/90'
  
  switch (props.type) {
    case 'success':
      return `${baseClasses} border-green-200 dark:border-green-800`
    case 'error':
      return `${baseClasses} border-red-200 dark:border-red-800`
    case 'warning':
      return `${baseClasses} border-yellow-200 dark:border-yellow-800`
    default:
      return `${baseClasses} border-blue-200 dark:border-blue-800`
  }
})

/**
 * [函数: close]
 * - 输入: 无
 * - 输出: void
 * - 角色: 关闭Toast提示
 * - 逻辑: 1. 清除定时器 2. 触发关闭事件
 */
const close = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  emit('close')
}

/**
 * [函数: startTimer]
 * - 输入: 无
 * - 输出: void
 * - 角色: 启动自动关闭定时器
 * - 逻辑: 如果设置了duration且大于0，则启动定时器
 */
const startTimer = () => {
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
.animate-in {
  animation-fill-mode: forwards;
}

.animate-out {
  animation-fill-mode: forwards;
}

.slide-in-from-top-2 {
  animation-name: slideInFromTop;
}

.slide-out-to-top-2 {
  animation-name: slideOutToTop;
}

.fade-in-0 {
  animation-name: fadeIn;
}

.fade-out-0 {
  animation-name: fadeOut;
}

.duration-300 {
  animation-duration: 300ms;
}

.duration-200 {
  animation-duration: 200ms;
}

@keyframes slideInFromTop {
  from {
    transform: translateY(-8px);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideOutToTop {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-8px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>