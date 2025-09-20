<template>
  <div class="profile-page">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <router-link to="/" class="brand-link">
            <IconComponents name="logo" class="brand-icon" />
            <span class="brand-text">智能体服务平台</span>
          </router-link>
        </div>
        <div class="navbar-nav">
          <router-link to="/agents" class="nav-link">智能体</router-link>
          <router-link to="/datasets" class="nav-link">数据集</router-link>
          <router-link to="/market" class="nav-link">市场</router-link>
          <router-link to="/playground" class="nav-link">对话</router-link>
          <router-link to="/profile" class="nav-link active">个人中心</router-link>
        </div>
      </div>
    </nav>

    <!-- 主容器 -->
    <div class="main-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <h1 class="page-title">个人中心</h1>
            <p class="page-subtitle">管理您的个人信息、订阅和安全设置</p>
          </div>
          <div class="header-actions">
            <button @click="handleLogout" class="btn btn-secondary">
              <IconComponents name="logout" class="btn-icon" />
              退出登录
            </button>
          </div>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- 标签页内容 -->
      <div class="tabs-content">
        <!-- 个人信息标签页 -->
        <div v-if="activeTab === 'profile'" class="tab-panel">
          <!-- 基本信息卡片 -->
          <div class="info-card">
            <div class="card-header">
              <h2 class="card-title">基本信息</h2>
              <button
                v-if="!isEditing"
                @click="isEditing = true"
                class="btn btn-secondary btn-sm"
              >
                <IconComponents name="edit" class="btn-icon" />
                编辑
              </button>
            </div>

            <div class="card-content">
              <!-- 头像上传 -->
              <div class="avatar-section">
                <div class="avatar-container">
                  <img
                    :src="profileForm.avatar || '/default-avatar.png'"
                    :alt="userDisplayName"
                    class="avatar-image"
                  />
                  <button
                    v-if="isEditing"
                    @click="triggerAvatarUpload"
                    class="avatar-upload-btn"
                  >
                    <IconComponents name="camera" class="upload-icon" />
                  </button>
                </div>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  @change="handleAvatarChange"
                  class="hidden"
                />
              </div>

              <!-- 表单 -->
              <form @submit.prevent="handleUpdateProfile" class="profile-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">用户名</label>
                    <input
                      v-model="profileForm.username"
                      type="text"
                      :disabled="!isEditing"
                      class="form-input"
                      placeholder="请输入用户名"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">昵称</label>
                    <input
                      v-model="profileForm.nickname"
                      type="text"
                      :disabled="!isEditing"
                      class="form-input"
                      placeholder="请输入昵称"
                    />
                  </div>

                  <div class="form-group full-width">
                    <label class="form-label">邮箱</label>
                    <input
                      v-model="profileForm.email"
                      type="email"
                      disabled
                      class="form-input"
                      placeholder="邮箱地址"
                    />
                  </div>
                </div>

                <div v-if="isEditing" class="form-actions">
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
                    class="btn btn-primary"
                  >
                    <IconComponents v-if="isLoading" name="loading" class="btn-icon animate-spin" />
                    {{ isLoading ? '保存中...' : '保存更改' }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- 账户统计 -->
          <div class="stats-card">
            <h2 class="card-title">账户统计</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ stats.agentCount }}</div>
                <div class="stat-label">创建的智能体</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.sessionCount }}</div>
                <div class="stat-label">对话会话</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.messageCount }}</div>
                <div class="stat-label">消息总数</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 订阅管理标签页 -->
        <div v-if="activeTab === 'subscription'" class="tab-panel">
          <!-- 当前订阅状态 -->
          <div class="subscription-card">
            <h2 class="card-title">当前订阅</h2>
            <div v-if="subscription" class="subscription-info">
              <div class="subscription-details">
                <h3 class="subscription-name">{{ subscription.planName }}</h3>
                <p class="subscription-description">{{ subscription.description }}</p>
                <p class="subscription-expiry">
                  有效期至: {{ formatDate(subscription.endTime) }}
                </p>
              </div>
              <div class="subscription-price">
                <div class="price-amount">¥{{ subscription.price }}</div>
                <div class="price-period">/ 月</div>
              </div>
            </div>
            <div v-else class="no-subscription">
              <IconComponents name="subscription" class="no-subscription-icon" />
              <p class="no-subscription-text">您还没有订阅任何计划</p>
              <router-link to="/pricing" class="btn btn-primary">
                查看订阅计划
              </router-link>
            </div>
          </div>

          <!-- 使用情况 -->
          <div class="usage-card">
            <h2 class="card-title">使用情况</h2>
            <div class="usage-list">
              <div class="usage-item">
                <div class="usage-header">
                  <span class="usage-name">智能体数量</span>
                  <span class="usage-count">{{ usage.agents }} / {{ limits.maxAgents === -1 ? '无限制' : limits.maxAgents }}</span>
                </div>
                <div class="usage-bar">
                  <div 
                    class="usage-progress"
                    :style="{ width: getUsagePercentage(usage.agents, limits.maxAgents) + '%' }"
                  ></div>
                </div>
              </div>
              <div class="usage-item">
                <div class="usage-header">
                  <span class="usage-name">今日消息数</span>
                  <span class="usage-count">{{ usage.dailyMessages }} / {{ limits.dailyMessages === -1 ? '无限制' : limits.dailyMessages }}</span>
                </div>
                <div class="usage-bar">
                  <div 
                    class="usage-progress"
                    :style="{ width: getUsagePercentage(usage.dailyMessages, limits.dailyMessages) + '%' }"
                  ></div>
                </div>
              </div>
              <div class="usage-item">
                <div class="usage-header">
                  <span class="usage-name">数据集存储</span>
                  <span class="usage-count">{{ formatFileSize(usage.datasetSize) }} / {{ limits.datasetSizeMb === -1 ? '无限制' : formatFileSize(limits.datasetSizeMb * 1024 * 1024) }}</span>
                </div>
                <div class="usage-bar">
                  <div 
                    class="usage-progress"
                    :style="{ width: getUsagePercentage(usage.datasetSize, limits.datasetSizeMb * 1024 * 1024) + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 安全设置标签页 -->
        <div v-if="activeTab === 'security'" class="tab-panel">
          <!-- 修改密码 -->
          <div class="security-card">
            <h2 class="card-title">修改密码</h2>
            <form @submit.prevent="handleChangePassword" class="password-form">
              <div class="form-group">
                <label class="form-label">当前密码</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  required
                  class="form-input"
                  placeholder="请输入当前密码"
                />
              </div>
              <div class="form-group">
                <label class="form-label">新密码</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  required
                  class="form-input"
                  placeholder="请输入新密码（至少6位）"
                />
              </div>
              <div class="form-group">
                <label class="form-label">确认新密码</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  required
                  class="form-input"
                  placeholder="请再次输入新密码"
                />
              </div>
              <button
                type="submit"
                :disabled="isLoading"
                class="btn btn-primary"
              >
                <IconComponents v-if="isLoading" name="loading" class="btn-icon animate-spin" />
                {{ isLoading ? '修改中...' : '修改密码' }}
              </button>
            </form>
          </div>

          <!-- 登录历史 -->
          <div class="history-card">
            <h2 class="card-title">最近登录记录</h2>
            <div class="history-list">
              <div v-for="record in loginHistory" :key="record.id" class="history-item">
                <div class="history-info">
                  <p class="history-location">{{ record.location }}</p>
                  <p class="history-device">{{ record.device }} • {{ record.browser }}</p>
                </div>
                <div class="history-time">
                  <p class="history-date">{{ formatDate(record.loginTime) }}</p>
                  <p class="history-ip">{{ record.ip }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示 -->
    <div v-if="showSuccessMessage" class="toast toast-success">
      <IconComponents name="check" class="toast-icon" />
      {{ successMessage }}
    </div>

    <!-- 错误提示 -->
    <div v-if="showErrorMessage" class="toast toast-error">
      <IconComponents name="alert" class="toast-icon" />
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
/* 页面容器 */
.profile-page {
  min-height: 100vh;
  background-color: #F9FAFB;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 导航栏 */
.navbar {
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  height: 72px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand .brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #111827;
}

.brand-icon {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.brand-text {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.navbar-nav {
  display: flex;
  gap: 32px;
}

.nav-link {
  text-decoration: none;
  color: #4B5563;
  font-weight: 500;
  font-size: 16px;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  color: #111827;
  background-color: #F3F4F6;
}

.nav-link.active {
  color: #3B82F6;
  background-color: #EFF6FF;
}

/* 主容器 */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 页面头部 */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 36px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 18px;
  color: #4B5563;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 16px;
}

/* 标签页导航 */
.tabs-nav {
  display: flex;
  background-color: #FFFFFF;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 32px;
  border: 1px solid #E5E7EB;
}

.tab-button {
  flex: 1;
  padding: 12px 24px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #111827;
  background-color: #F3F4F6;
}

.tab-button.active {
  color: #FFFFFF;
  background-color: #111827;
}

/* 标签页内容 */
.tabs-content {
  min-height: 400px;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 卡片样式 */
.info-card,
.stats-card,
.subscription-card,
.usage-card,
.security-card,
.history-card {
  background-color: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* 头像部分 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.avatar-container {
  position: relative;
}

.avatar-image {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #E5E7EB;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  background-color: #111827;
  border: none;
  border-radius: 50%;
  color: #FFFFFF;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.avatar-upload-btn:hover {
  background-color: #374151;
}

.upload-icon {
  width: 16px;
  height: 16px;
}

.hidden {
  display: none;
}

/* 表单样式 */
.profile-form,
.password-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  padding: 12px 16px;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 16px;
  color: #111827;
  background-color: #FFFFFF;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  background-color: #F3F4F6;
  color: #9CA3AF;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #9CA3AF;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-primary {
  background-color: #3B82F6;
  color: #FFFFFF;
}

.btn-primary:hover {
  background-color: #2563EB;
}

.btn-primary:disabled {
  background-color: #9CA3AF;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #F3F4F6;
  color: #374151;
  border: 1px solid #E5E7EB;
}

.btn-secondary:hover {
  background-color: #E5E7EB;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-item {
  text-align: center;
  padding: 24px;
  background-color: #F9FAFB;
  border-radius: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #4B5563;
}

/* 订阅信息 */
.subscription-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.subscription-details {
  flex: 1;
}

.subscription-name {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
}

.subscription-description {
  font-size: 16px;
  color: #4B5563;
  margin: 0 0 8px 0;
}

.subscription-expiry {
  font-size: 14px;
  color: #9CA3AF;
  margin: 0;
}

.subscription-price {
  text-align: right;
}

.price-amount {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.price-period {
  font-size: 14px;
  color: #9CA3AF;
}

.no-subscription {
  text-align: center;
  padding: 48px 24px;
}

.no-subscription-icon {
  width: 64px;
  height: 64px;
  color: #9CA3AF;
  margin-bottom: 16px;
}

.no-subscription-text {
  font-size: 16px;
  color: #4B5563;
  margin: 0 0 24px 0;
}

/* 使用情况 */
.usage-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.usage-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.usage-name {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}

.usage-count {
  font-size: 14px;
  color: #9CA3AF;
}

.usage-bar {
  width: 100%;
  height: 8px;
  background-color: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.usage-progress {
  height: 100%;
  background-color: #3B82F6;
  transition: width 0.3s ease;
}

/* 登录历史 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #E5E7EB;
}

.history-item:last-child {
  border-bottom: none;
}

.history-location {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  margin: 0 0 4px 0;
}

.history-device {
  font-size: 14px;
  color: #4B5563;
  margin: 0;
}

.history-time {
  text-align: right;
}

.history-date {
  font-size: 14px;
  color: #111827;
  margin: 0 0 4px 0;
}

.history-ip {
  font-size: 12px;
  color: #9CA3AF;
  margin: 0;
}

/* 提示消息 */
.toast {
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.toast-success {
  background-color: #10B981;
  color: #FFFFFF;
}

.toast-error {
  background-color: #EF4444;
  color: #FFFFFF;
}

.toast-icon {
  width: 20px;
  height: 20px;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 16px;
  }

  .navbar-nav {
    display: none;
  }

  .main-container {
    padding: 24px 16px;
  }

  .page-title {
    font-size: 28px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .tabs-nav {
    flex-direction: column;
  }

  .tab-button {
    text-align: left;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .subscription-info {
    flex-direction: column;
    gap: 16px;
  }

  .subscription-price {
    text-align: left;
  }

  .history-item {
    flex-direction: column;
    gap: 8px;
  }

  .history-time {
    text-align: left;
  }

  .toast {
    left: 16px;
    right: 16px;
    top: 16px;
  }
}

@media (max-width: 480px) {
  .main-container {
    padding: 16px 12px;
  }

  .info-card,
  .stats-card,
  .subscription-card,
  .usage-card,
  .security-card,
  .history-card {
    padding: 16px;
  }

  .page-title {
    font-size: 24px;
  }

  .card-title {
    font-size: 18px;
  }

  .avatar-image {
    width: 80px;
    height: 80px;
  }

  .stat-value {
    font-size: 24px;
  }

  .subscription-name {
    font-size: 20px;
  }

  .price-amount {
    font-size: 24px;
  }
}
</style>