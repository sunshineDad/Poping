<template>
  <div class="admin-users-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">用户管理</h1>
          <p class="page-description">管理平台用户账户、权限和订阅状态</p>
        </div>
        <div class="header-right">
          <div class="search-box">
            <IconComponents name="search" size="sm" class="search-icon" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索用户..."
              class="search-input"
            />
          </div>
          <button @click="showInviteModal = true" class="btn-primary">
            <IconComponents name="plus" size="sm" />
            邀请用户
          </button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <IconComponents name="users" size="lg" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ totalUsers }}</div>
          <div class="stat-label">总用户数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">
          <IconComponents name="users" size="lg" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ activeUsers }}</div>
          <div class="stat-label">活跃用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon premium">
          <IconComponents name="star" size="lg" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ premiumUsers }}</div>
          <div class="stat-label">付费用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon admin">
          <IconComponents name="shield" size="lg" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ adminUsers }}</div>
          <div class="stat-label">管理员</div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <div class="filter-group">
        <label>角色</label>
        <select v-model="roleFilter">
          <option value="">所有角色</option>
          <option value="admin">管理员</option>
          <option value="user">普通用户</option>
        </select>
      </div>
      <div class="filter-group">
        <label>状态</label>
        <select v-model="statusFilter">
          <option value="">所有状态</option>
          <option value="active">活跃</option>
          <option value="inactive">非活跃</option>
          <option value="suspended">已暂停</option>
        </select>
      </div>
      <div class="filter-group">
        <label>订阅</label>
        <select v-model="subscriptionFilter">
          <option value="">所有订阅</option>
          <option value="free">免费版</option>
          <option value="pro">专业版</option>
          <option value="enterprise">企业版</option>
        </select>
      </div>
    </div>

    <!-- 用户表格 -->
    <div class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>用户</th>
            <th>角色</th>
            <th>订阅</th>
            <th>状态</th>
            <th>注册时间</th>
            <th>最后活跃</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <td>
              <div class="user-info">
                <div class="user-avatar">
                  <img v-if="user.avatar" :src="user.avatar" :alt="user.username" />
                  <div v-else class="avatar-fallback">{{ user.username.charAt(0).toUpperCase() }}</div>
                </div>
                <div class="user-details">
                  <div class="user-name">{{ user.username }}</div>
                  <div class="user-email">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="role-badge" :class="getRoleClass(user.role)">
                {{ getRoleText(user.role) }}
              </span>
            </td>
            <td>
              <span class="subscription-badge" :class="getSubscriptionClass(user.subscription)">
                {{ getSubscriptionText(user.subscription) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(user.status)">
                {{ getStatusText(user.status) }}
              </span>
            </td>
            <td class="date-cell">{{ formatDate(user.createdAt) }}</td>
            <td class="date-cell">{{ formatDate(user.lastActiveAt) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="editUser(user)" class="btn-action" title="编辑">
                  <IconComponents name="edit" size="sm" />
                </button>
                <button 
                  @click="toggleUserStatus(user)" 
                  class="btn-action"
                  :class="{ 'btn-danger': user.status === 'active' }"
                  :title="user.status === 'active' ? '暂停' : '激活'"
                >
                  <IconComponents :name="user.status === 'active' ? 'pause' : 'play'" size="sm" />
                </button>
                <button @click="deleteUser(user)" class="btn-action btn-danger" title="删除">
                  <IconComponents name="trash" size="sm" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 邀请用户模态框 -->
    <div v-if="showInviteModal" class="modal-overlay" @click="showInviteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>邀请用户</h2>
          <button @click="showInviteModal = false" class="modal-close">
            <IconComponents name="delete" size="sm" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="inviteUser">
            <div class="form-group">
              <label>邮箱地址</label>
              <input v-model="inviteForm.email" type="email" placeholder="user@example.com" required />
            </div>
            <div class="form-group">
              <label>角色</label>
              <select v-model="inviteForm.role" required>
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div class="form-group">
              <label>初始订阅</label>
              <select v-model="inviteForm.subscription">
                <option value="free">免费版</option>
                <option value="pro">专业版</option>
                <option value="enterprise">企业版</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="showInviteModal = false" class="btn-secondary">
                取消
              </button>
              <button type="submit" class="btn-primary">
                发送邀请
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import IconComponents from '@/components/icons/IconComponents.vue'
import { confirmDialog } from '@/utils/confirm'

// 类型定义
interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
  subscription: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  lastActiveAt: string
}

// 响应式数据
const users = ref<User[]>([])
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const subscriptionFilter = ref('')
const showInviteModal = ref(false)
const inviteForm = ref({
  email: '',
  role: 'user' as 'admin' | 'user',
  subscription: 'free' as 'free' | 'pro' | 'enterprise'
})

// 计算属性
const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  if (subscriptionFilter.value) {
    filtered = filtered.filter(user => user.subscription === subscriptionFilter.value)
  }

  return filtered
})

const totalUsers = computed(() => users.value.length)
const activeUsers = computed(() => users.value.filter(u => u.status === 'active').length)
const premiumUsers = computed(() => users.value.filter(u => u.subscription !== 'free').length)
const adminUsers = computed(() => users.value.filter(u => u.role === 'admin').length)

// 方法
const loadUsers = async () => {
  // 模拟数据
  users.value = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@poping.ai',
      role: 'admin',
      subscription: 'enterprise',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      lastActiveAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      username: 'john_doe',
      email: 'john@example.com',
      role: 'user',
      subscription: 'pro',
      status: 'active',
      createdAt: '2024-01-05T00:00:00Z',
      lastActiveAt: '2024-01-14T15:20:00Z'
    },
    {
      id: '3',
      username: 'jane_smith',
      email: 'jane@example.com',
      role: 'user',
      subscription: 'free',
      status: 'inactive',
      createdAt: '2024-01-10T00:00:00Z',
      lastActiveAt: '2024-01-12T09:15:00Z'
    }
  ]
}

const getRoleClass = (role: string) => {
  return {
    'role-admin': role === 'admin',
    'role-user': role === 'user'
  }
}

const getRoleText = (role: string) => {
  return role === 'admin' ? '管理员' : '普通用户'
}

const getSubscriptionClass = (subscription: string) => {
  return {
    'subscription-free': subscription === 'free',
    'subscription-pro': subscription === 'pro',
    'subscription-enterprise': subscription === 'enterprise'
  }
}

const getSubscriptionText = (subscription: string) => {
  const map = {
    free: '免费版',
    pro: '专业版',
    enterprise: '企业版'
  }
  return map[subscription as keyof typeof map]
}

const getStatusClass = (status: string) => {
  return {
    'status-active': status === 'active',
    'status-inactive': status === 'inactive',
    'status-suspended': status === 'suspended'
  }
}

const getStatusText = (status: string) => {
  const map = {
    active: '活跃',
    inactive: '非活跃',
    suspended: '已暂停'
  }
  return map[status as keyof typeof map]
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const editUser = (user: User) => {
  console.log('编辑用户:', user.username)
}

const toggleUserStatus = (user: User) => {
  user.status = user.status === 'active' ? 'suspended' : 'active'
}

const deleteUser = async (user: User) => {
  if (await confirmDialog(`确定要删除用户 ${user.username} 吗？`)) {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
    }
  }
}

const inviteUser = () => {
  console.log('邀请用户:', inviteForm.value)
  showInviteModal.value = false
  
  // 重置表单
  inviteForm.value = {
    email: '',
    role: 'user',
    subscription: 'free'
  }
}

// 生命周期
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-right {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-400);
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-brand-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.active {
  background: var(--color-semantic-success);
  color: white;
}

.stat-icon.premium {
  background: var(--color-brand-primary);
  color: white;
}

.stat-icon.admin {
  background: var(--color-gray-900);
  color: white;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-gray-600);
}

.filters {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-gray-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
}

.users-table-container {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: var(--color-gray-50);
  padding: 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-gray-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--color-gray-200);
}

.users-table td {
  padding: 16px;
  border-bottom: 1px solid var(--color-gray-100);
}

.user-row:hover {
  background: var(--color-gray-50);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  background: var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-gray-600);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-900);
  margin-bottom: 2px;
}

.user-email {
  font-size: 12px;
  color: var(--color-gray-500);
}

.role-badge,
.subscription-badge,
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-admin {
  background: var(--color-gray-900);
  color: white;
}

.role-user {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.subscription-free {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.subscription-pro {
  background: var(--color-brand-primary);
  color: white;
}

.subscription-enterprise {
  background: var(--color-gray-900);
  color: white;
}

.status-active {
  background: var(--color-semantic-success);
  color: white;
}

.status-inactive {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.status-suspended {
  background: var(--color-semantic-warning);
  color: white;
}

.date-cell {
  font-size: 12px;
  color: var(--color-gray-500);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-gray-100);
  color: var(--color-gray-600);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-action:hover {
  background: var(--color-gray-200);
}

.btn-action.btn-danger {
  background: var(--color-semantic-warning);
  color: white;
}

.btn-action.btn-danger:hover {
  background: #dc2626;
}

/* 模态框样式复用之前的样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--color-gray-500);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background: var(--color-gray-100);
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-700);
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-brand-primary);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: var(--color-brand-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-brand-primary-hover);
}

.btn-secondary {
  padding: 12px 20px;
  background: transparent;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}
</style>