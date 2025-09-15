<template>
  <div class="min-h-screen bg-gray-50 dark-theme">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-xl font-semibold text-black">
            Poping
          </router-link>
          <div class="flex items-center space-x-4">
            <router-link to="/dashboard" class="text-gray-600 hover:text-black transition-colors">
              仪表板
            </router-link>
            <button @click="handleLogout" class="text-gray-600 hover:text-black transition-colors flex items-center">
              <IconComponents name="logout" size="sm" class="mr-1" />
              退出登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mx-auto px-6 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 页面标题 -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900">个人中心</h1>
          <p class="mt-2 text-gray-600">管理您的账户信息和设置</p>
        </div>

        <!-- 标签页导航 -->
        <div class="border-b border-gray-200 mb-8">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- 个人信息标签页 -->
        <div v-if="activeTab === 'profile'" class="space-y-6">
          <!-- 基本信息卡片 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-gray-900">基本信息</h2>
              <button
                @click="isEditing = !isEditing"
                class="text-sm text-black hover:text-gray-700 transition-colors"
              >
                {{ isEditing ? '取消编辑' : '编辑信息' }}
              </button>
            </div>

            <form @submit.prevent="handleUpdateProfile" class="space-y-4">
              <!-- 头像 -->
              <div class="flex items-center space-x-4">
                <div class="relative">
                  <img
                    :src="profileForm.avatar || '/default-avatar.png'"
                    :alt="userDisplayName"
                    class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button
                    v-if="isEditing"
                    type="button"
                    @click="triggerAvatarUpload"
                    class="absolute -bottom-1 -right-1 bg-black text-white rounded-full p-1 hover:bg-gray-800 transition-colors"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <input
                    ref="avatarInput"
                    type="file"
                    accept="image/*"
                    @change="handleAvatarChange"
                    class="hidden"
                  />
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900">{{ userDisplayName }}</h3>
                  <p class="text-sm text-gray-500">{{ user?.email }}</p>
                </div>
              </div>

              <!-- 用户名 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <input
                  v-model="profileForm.username"
                  type="text"
                  :disabled="!isEditing"
                  class="input w-full disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="请输入用户名"
                />
              </div>

              <!-- 昵称 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  昵称
                </label>
                <input
                  v-model="profileForm.nickname"
                  type="text"
                  :disabled="!isEditing"
                  class="input w-full disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="请输入昵称"
                />
              </div>

              <!-- 邮箱 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址
                </label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  disabled
                  class="input w-full bg-gray-50 text-gray-500"
                />
                <p class="mt-1 text-xs text-gray-500">邮箱地址不可修改</p>
              </div>

              <!-- 保存按钮 -->
              <div v-if="isEditing" class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="btn btn-secondary"
                >
                  取消
                </button>
                <button
                  type="submit"
                  :disabled="isLoading"
                  class="btn btn-primary disabled:opacity-50"
                >
                  {{ isLoading ? '保存中...' : '保存更改' }}
                </button>
              </div>
            </form>
          </div>

          <!-- 账户统计 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">账户统计</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-black">{{ stats.agentCount }}</div>
                <div class="text-sm text-gray-600">创建的智能体</div>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-black">{{ stats.sessionCount }}</div>
                <div class="text-sm text-gray-600">对话会话</div>
              </div>
              <div class="text-center p-4 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-black">{{ stats.messageCount }}</div>
                <div class="text-sm text-gray-600">消息总数</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 订阅管理标签页 -->
        <div v-if="activeTab === 'subscription'" class="space-y-6">
          <!-- 当前订阅状态 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">当前订阅</h2>
            <div v-if="subscription" class="flex items-center justify-between">
              <div>
                <h3 class="text-xl font-medium text-gray-900">{{ subscription.planName }}</h3>
                <p class="text-gray-600">{{ subscription.description }}</p>
                <p class="text-sm text-gray-500 mt-2">
                  有效期至: {{ formatDate(subscription.endTime) }}
                </p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-black">¥{{ subscription.price }}</div>
                <div class="text-sm text-gray-500">/ 月</div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <p class="text-gray-500 mb-4">您还没有订阅任何计划</p>
              <router-link to="/pricing" class="btn btn-primary">
                查看订阅计划
              </router-link>
            </div>
          </div>

          <!-- 使用情况 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">使用情况</h2>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>智能体数量</span>
                  <span>{{ usage.agents }} / {{ limits.maxAgents === -1 ? '无限制' : limits.maxAgents }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-black h-2 rounded-full transition-all duration-300"
                    :style="{ width: getUsagePercentage(usage.agents, limits.maxAgents) + '%' }"
                  ></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>今日消息数</span>
                  <span>{{ usage.dailyMessages }} / {{ limits.dailyMessages === -1 ? '无限制' : limits.dailyMessages }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-black h-2 rounded-full transition-all duration-300"
                    :style="{ width: getUsagePercentage(usage.dailyMessages, limits.dailyMessages) + '%' }"
                  ></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>数据集存储</span>
                  <span>{{ formatFileSize(usage.datasetSize) }} / {{ limits.datasetSizeMb === -1 ? '无限制' : formatFileSize(limits.datasetSizeMb * 1024 * 1024) }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-black h-2 rounded-full transition-all duration-300"
                    :style="{ width: getUsagePercentage(usage.datasetSize, limits.datasetSizeMb * 1024 * 1024) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 安全设置标签页 -->
        <div v-if="activeTab === 'security'" class="space-y-6">
          <!-- 修改密码 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">修改密码</h2>
            <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-md">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  当前密码
                </label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  required
                  class="input w-full"
                  placeholder="请输入当前密码"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  required
                  class="input w-full"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  required
                  class="input w-full"
                  placeholder="请再次输入新密码"
                />
              </div>
              <button
                type="submit"
                :disabled="isLoading"
                class="btn btn-primary disabled:opacity-50"
              >
                {{ isLoading ? '修改中...' : '修改密码' }}
              </button>
            </form>
          </div>

          <!-- 登录历史 -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">最近登录记录</h2>
            <div class="space-y-3">
              <div v-for="record in loginHistory" :key="record.id" class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ record.location }}</p>
                  <p class="text-xs text-gray-500">{{ record.device }} • {{ record.browser }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-900">{{ formatDate(record.loginTime) }}</p>
                  <p class="text-xs text-gray-500">{{ record.ip }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccessMessage" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
      {{ successMessage }}
    </div>

    <!-- 错误提示 -->
    <div v-if="showErrorMessage" class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconComponents from '@/components/icons/IconComponents.vue'

// 路由和状态管理
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const activeTab = ref('profile')
const isEditing = ref(false)
const isLoading = ref(false)
const avatarInput = ref<HTMLInputElement>()

// 表单数据
const profileForm = reactive({
  username: '',
  nickname: '',
  email: '',
  avatar: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 统计数据
const stats = reactive({
  agentCount: 0,
  sessionCount: 0,
  messageCount: 0
})

// 订阅信息
const subscription = ref<any>(null)
const usage = reactive({
  agents: 0,
  dailyMessages: 0,
  datasetSize: 0
})

const limits = reactive({
  maxAgents: 3,
  dailyMessages: 100,
  datasetSizeMb: 100
})

// 登录历史
const loginHistory = ref<any[]>([])

// 消息提示
const showSuccessMessage = ref(false)
const successMessage = ref('')
const showErrorMessage = ref(false)
const errorMessage = ref('')

// 标签页配置
const tabs = [
  { id: 'profile', name: '个人信息' },
  { id: 'subscription', name: '订阅管理' },
  { id: 'security', name: '安全设置' }
]

// 计算属性
const user = computed(() => authStore.user)
const userDisplayName = computed(() => authStore.userDisplayName)

// 方法
const initializeData = () => {
  if (user.value) {
    profileForm.username = user.value.username || ''
    profileForm.nickname = user.value.nickname || ''
    profileForm.email = user.value.email
    profileForm.avatar = user.value.avatar || ''
  }
}

const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 这里应该上传文件到服务器
  // 暂时使用本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleUpdateProfile = async () => {
  isLoading.value = true
  
  try {
    const result = await authStore.updateUserProfile({
      username: profileForm.username,
      nickname: profileForm.nickname,
      avatar: profileForm.avatar
    })
    
    if (result.success) {
      isEditing.value = false
      showSuccess('个人信息更新成功')
    } else {
      showError(result.message || '更新失败')
    }
  } catch (error) {
    showError('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  initializeData() // 重置表单数据
}

const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showError('两次输入的密码不一致')
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    showError('新密码长度至少6位')
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch('/api/user/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      showSuccess('密码修改成功')
    } else {
      showError(data.message || '密码修改失败')
    }
  } catch (error) {
    showError('网络错误，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const loadUserStats = async () => {
  try {
    const response = await fetch('/api/user/stats', {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      Object.assign(stats, data.data)
    }
  } catch (error) {
    console.error('加载用户统计失败:', error)
  }
}

const loadSubscriptionInfo = async () => {
  try {
    const response = await fetch('/api/user/subscription', {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    const data = await response.json()
    if (data.success && data.data) {
      subscription.value = data.data.subscription
      Object.assign(usage, data.data.usage)
      Object.assign(limits, data.data.limits)
    }
  } catch (error) {
    console.error('加载订阅信息失败:', error)
  }
}

const loadLoginHistory = async () => {
  try {
    const response = await fetch('/api/user/login-history', {
      headers: {
        'Authorization': `Bearer ${authStore.accessToken}`
      }
    })
    
    const data = await response.json()
    if (data.success) {
      loginHistory.value = data.data
    }
  } catch (error) {
    console.error('加载登录历史失败:', error)
  }
}

const getUsagePercentage = (current: number, limit: number): number => {
  if (limit === -1) return 0 // 无限制
  return Math.min((current / limit) * 100, 100)
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const showSuccess = (message: string) => {
  successMessage.value = message
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

const showError = (message: string) => {
  errorMessage.value = message
  showErrorMessage.value = true
  setTimeout(() => {
    showErrorMessage.value = false
  }, 3000)
}

// 生命周期
onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  initializeData()
  loadUserStats()
  loadSubscriptionInfo()
  loadLoginHistory()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
}

.input:focus {
  outline: none;
  border-color: #000;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: #000;
  color: white;
}

.btn-primary:hover {
  background-color: #374151;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>