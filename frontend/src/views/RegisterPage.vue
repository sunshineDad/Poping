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

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo区域 -->
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-black">
          注册 Poping 账户
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          已有账户？
          <router-link to="/login" class="font-medium text-black hover:text-gray-700">
            立即登录
          </router-link>
        </p>
      </div>

      <!-- 注册表单 -->
      <div class="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- 用户名输入 -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              用户名 <span class="text-gray-400">(可选)</span>
            </label>
            <div class="mt-1">
              <input
                id="username"
                v-model="form.username"
                name="username"
                type="text"
                autocomplete="username"
                :class="[
                  'input',
                  errors.username ? 'border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="请输入用户名"
              />
              <p v-if="errors.username" class="mt-1 text-sm text-red-600">
                {{ errors.username }}
              </p>
            </div>
          </div>

          <!-- 邮箱输入 -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              邮箱地址 <span class="text-red-500">*</span>
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                :class="[
                  'input',
                  errors.email ? 'border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="your@example.com"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">
                {{ errors.email }}
              </p>
            </div>
          </div>

          <!-- 密码输入 -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              密码 <span class="text-red-500">*</span>
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                :class="[
                  'input pr-10',
                  errors.password ? 'border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="请输入密码（至少6位）"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  v-if="showPassword"
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg
                  v-else
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                {{ errors.password }}
              </p>
            </div>
            <!-- 密码强度指示器 -->
            <div class="mt-2">
              <div class="flex space-x-1">
                <div 
                  v-for="i in 4" 
                  :key="i"
                  :class="[
                    'h-1 flex-1 rounded-full transition-colors duration-200',
                    getPasswordStrengthColor(i)
                  ]"
                ></div>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                密码强度: {{ getPasswordStrengthText() }}
              </p>
            </div>
          </div>

          <!-- 确认密码输入 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              确认密码 <span class="text-red-500">*</span>
            </label>
            <div class="mt-1 relative">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                :class="[
                  'input pr-10',
                  errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                ]"
                placeholder="请再次输入密码"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  v-if="showConfirmPassword"
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg
                  v-else
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              </button>
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>

          <!-- 服务条款同意 -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="agree-terms"
                v-model="form.agreeTerms"
                name="agree-terms"
                type="checkbox"
                required
                :class="[
                  'h-4 w-4 text-black focus:ring-black border-gray-300 rounded',
                  errors.agreeTerms ? 'border-red-500' : ''
                ]"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="agree-terms" class="text-gray-700">
                我同意
                <router-link to="/terms" class="font-medium text-black hover:text-gray-700">
                  服务条款
                </router-link>
                和
                <router-link to="/privacy" class="font-medium text-black hover:text-gray-700">
                  隐私政策
                </router-link>
                <span class="text-red-500">*</span>
              </label>
              <p v-if="errors.agreeTerms" class="mt-1 text-sm text-red-600">
                {{ errors.agreeTerms }}
              </p>
            </div>
          </div>

          <!-- 注册按钮 -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="btn btn-primary w-full flex justify-center py-3 px-4 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isLoading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                注册中...
              </span>
              <span v-else>创建账户</span>
            </button>
          </div>

          <!-- 错误提示 -->
          <div v-if="errors.general" class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  注册失败
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ errors.general }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 成功提示 -->
          <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">
                  注册成功
                </h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>{{ successMessage }}</p>
                </div>
              </div>
            </div>
          </div>
        </form>

        <!-- 分割线 -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">或者</span>
            </div>
          </div>
        </div>

        <!-- 第三方注册 -->
        <div class="mt-6 grid grid-cols-2 gap-3">
          <button
            @click="registerWithGoogle"
            type="button"
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
          >
            <svg class="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="ml-2">Google</span>
          </button>

          <button
            @click="registerWithGithub"
            type="button"
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors duration-200"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span class="ml-2">GitHub</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

// 类型定义
interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
  agreeTerms?: string
  general?: string
}

// 路由
const router = useRouter()

// 响应式数据
const form = reactive<RegisterForm>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

const errors = reactive<FormErrors>({})
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref('')

// 密码强度计算
const passwordStrength = computed(() => {
  const password = form.password
  let strength = 0
  
  if (password.length >= 6) strength++
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^\w\s]/.test(password)) strength++
  
  return Math.min(strength, 4)
})

// 密码强度颜色
const getPasswordStrengthColor = (index: number): string => {
  if (passwordStrength.value >= index) {
    if (passwordStrength.value <= 1) return 'bg-red-500'
    if (passwordStrength.value <= 2) return 'bg-yellow-500'
    if (passwordStrength.value <= 3) return 'bg-blue-500'
    return 'bg-green-500'
  }
  return 'bg-gray-200'
}

// 密码强度文本
const getPasswordStrengthText = (): string => {
  if (passwordStrength.value <= 1) return '弱'
  if (passwordStrength.value <= 2) return '一般'
  if (passwordStrength.value <= 3) return '良好'
  return '强'
}

// 表单验证
const validateForm = (): boolean => {
  // 清除之前的错误
  Object.keys(errors).forEach(key => {
    delete errors[key as keyof FormErrors]
  })

  let isValid = true

  // 用户名验证（可选）
  if (form.username && form.username.length > 50) {
    errors.username = '用户名长度不能超过50位'
    isValid = false
  }

  // 邮箱验证
  if (!form.email) {
    errors.email = '请输入邮箱地址'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '请输入有效的邮箱地址'
    isValid = false
  }

  // 密码验证
  if (!form.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = '密码长度至少6位'
    isValid = false
  } else if (form.password.length > 20) {
    errors.password = '密码长度不能超过20位'
    isValid = false
  }

  // 确认密码验证
  if (!form.confirmPassword) {
    errors.confirmPassword = '请确认密码'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
    isValid = false
  }

  // 服务条款同意验证
  if (!form.agreeTerms) {
    errors.agreeTerms = '请同意服务条款和隐私政策'
    isValid = false
  }

  return isValid
}

// 注册处理
const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  errors.general = ''
  successMessage.value = ''

  try {
    // 调用注册API
    const response = await fetch('/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        username: form.username || undefined,
      }),
    })

    const data = await response.json()

    if (data.success) {
      successMessage.value = '注册成功！正在跳转到登录页面...'
      
      // 延迟跳转到登录页面
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errors.general = data.message || '注册失败，请稍后重试'
    }
  } catch (error) {
    console.error('注册错误:', error)
    errors.general = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// Google注册
const registerWithGoogle = () => {
  // 实现Google OAuth注册
  console.log('Google注册')
  // window.location.href = '/api/v1/auth/google'
}

// GitHub注册
const registerWithGithub = () => {
  // 实现GitHub OAuth注册
  console.log('GitHub注册')
  // window.location.href = '/api/v1/auth/github'
}
</script>

<style scoped>
/* 自定义样式 */
.container {
  max-width: 1200px;
}

/* 输入框焦点样式 */
.input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

/* 复选框样式 */
input[type="checkbox"]:checked {
  background-color: #000;
  border-color: #000;
}

input[type="checkbox"]:focus {
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

/* 密码强度指示器动画 */
.h-1 {
  transition: background-color 0.3s ease;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .sm\:mx-auto {
    margin-left: 1rem;
    margin-right: 1rem;
  }
}
</style>