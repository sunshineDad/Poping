<template>
  <div class="dashboard-layout dark-theme">
    <!-- 左侧导航栏 -->
    <aside 
      :class="[
        'sidebar',
        { 'sidebar-collapsed': sidebarCollapsed }
      ]"
    >
      <!-- 菜单头部 -->
      <div class="sidebar-header">
        <div class="logo-area">
          <div class="logo-icon">P</div>
          <span v-if="!sidebarCollapsed" class="logo-text">Poping</span>
        </div>
        <button 
          @click="toggleSidebar"
          class="collapse-btn"
          :title="sidebarCollapsed ? '展开菜单' : '收起菜单'"
        >
          <IconComponents name="menu" size="md" />
        </button>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <!-- 主要功能区 -->
        <div class="nav-section">
          <div v-if="!sidebarCollapsed" class="nav-section-title">主要功能</div>
          <router-link
            v-for="item in mainMenuItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === item.path }"
            :title="sidebarCollapsed ? item.title : ''"
          >
            <IconComponents :name="item.icon" size="md" class="nav-icon" />
            <span v-if="!sidebarCollapsed" class="nav-text">{{ item.title }}</span>
          </router-link>
        </div>

        <!-- 管理员专属区 -->
        <div v-if="isAdmin" class="nav-section">
          <div v-if="!sidebarCollapsed" class="nav-section-title">系统管理</div>
          <router-link
            v-for="item in adminMenuItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'nav-item-active': $route.path === item.path }"
            :title="sidebarCollapsed ? item.title : ''"
          >
            <IconComponents :name="item.icon" size="md" class="nav-icon" />
            <span v-if="!sidebarCollapsed" class="nav-text">{{ item.title }}</span>
            <span v-if="!sidebarCollapsed" class="admin-badge">Admin</span>
          </router-link>
        </div>
      </nav>

      <!-- 用户区域 - 固定在底部 -->
      <div class="sidebar-user">
        <div class="user-profile" @click="toggleUserMenu">
          <div class="user-avatar">
            <span>{{ userInitial }}</span>
          </div>
          <div v-if="!sidebarCollapsed" class="user-info">
            <div class="user-name">{{ userName }}</div>
            <div class="user-role">{{ userRole }}</div>
          </div>
          <IconComponents 
            v-if="!sidebarCollapsed" 
            name="chevron-down" 
            size="sm" 
            :class="userMenuOpen ? 'user-menu-icon rotated' : 'user-menu-icon'"
          />
        </div>
        
        <!-- 用户下拉菜单 -->
        <Transition name="user-menu-slide">
          <div v-if="userMenuOpen && !sidebarCollapsed" class="user-dropdown">
            <!-- 个人信息管理 - 所有用户可见 -->
            <router-link to="/dashboard/profile" class="dropdown-item" @click="userMenuOpen = false">
              <IconComponents name="profile" size="sm" class="dropdown-icon" />
              <span>个人信息管理</span>
            </router-link>
            <router-link to="/dashboard/subscription" class="dropdown-item" @click="userMenuOpen = false">
              <IconComponents name="settings" size="sm" class="dropdown-icon" />
              <span>订阅管理</span>
            </router-link>
            <router-link to="/dashboard/provider-config" class="dropdown-item" @click="userMenuOpen = false">
              <IconComponents name="settings" size="sm" class="dropdown-icon" />
              <span>供应商配置</span>
            </router-link>
            
            <!-- 管理员专用菜单 -->
            <template v-if="isAdmin">
              <div class="dropdown-divider"></div>
              <div class="dropdown-section-title">管理员功能</div>
              <router-link to="/dashboard/admin/model-providers" class="dropdown-item admin-item" @click="userMenuOpen = false">
                <IconComponents name="settings" size="sm" class="dropdown-icon" />
                <span>模型供应商管理</span>
                <span class="admin-badge-small">Admin</span>
              </router-link>
              <router-link to="/dashboard/admin/users" class="dropdown-item admin-item" @click="userMenuOpen = false">
                <IconComponents name="users" size="sm" class="dropdown-icon" />
                <span>用户管理</span>
                <span class="admin-badge-small">Admin</span>
              </router-link>
              <router-link to="/dashboard/admin/mcp-config" class="dropdown-item admin-item" @click="userMenuOpen = false">
                <IconComponents name="settings" size="sm" class="dropdown-icon" />
                <span>MCP配置管理</span>
                <span class="admin-badge-small">Admin</span>
              </router-link>
            </template>
            
            <div class="dropdown-divider"></div>
            <button @click="handleLogout" class="dropdown-item logout-btn">
              <IconComponents name="logout" size="sm" class="dropdown-icon" />
              <span>退出登录</span>
            </button>
          </div>
        </Transition>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 页面头部 -->
      <header class="page-header">
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
          <p v-if="pageSubtitle" class="page-subtitle">{{ pageSubtitle }}</p>
        </div>
        <div class="header-right">
          <!-- 通知按钮 -->
          <button class="notification-btn" @click="toggleNotifications">
            <IconComponents name="help" size="md" />
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>
        </div>
      </header>

      <!-- 页面内容 -->
      <div class="page-content">
        <router-view />
      </div>
    </main>

    <!-- 通知面板 -->
    <div v-if="notificationsOpen" class="notifications-panel">
      <div class="notifications-header">
        <h3>通知</h3>
        <button @click="toggleNotifications" class="close-btn">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="notifications-content">
        <div v-if="notifications.length === 0" class="no-notifications">
          <p>暂无通知</p>
        </div>
        <div v-else>
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="notification-item"
            :class="{ 'unread': !notification.read }"
          >
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
              <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import IconComponents from '@/components/icons/IconComponents.vue'

// 注册组件
const components = {
  IconComponents
}

// 类型定义
interface MenuItem {
  path: string
  title: string
  icon: string
}

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  timestamp: string
}

// 路由和状态
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const sidebarCollapsed = ref(false)
const userMenuOpen = ref(false)
const notificationsOpen = ref(false)
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)

// 主菜单项
const mainMenuItems: MenuItem[] = [
  {
    path: '/dashboard',
    title: '总览仪表板',
    icon: 'dashboard'
  },
  {
    path: '/dashboard/playground',
    title: '游乐场',
    icon: 'playground'
  },
  {
    path: '/dashboard/dataset',
    title: '数据集管理',
    icon: 'dataset'
  },
  {
    path: '/dashboard/marketplace',
    title: 'MCP市场',
    icon: 'marketplace'
  }
]

// 管理员菜单项
const adminMenuItems: MenuItem[] = [
  {
    path: '/dashboard/admin/users',
    title: '用户管理',
    icon: 'users'
  },
  {
    path: '/dashboard/admin/settings',
    title: '系统配置',
    icon: 'settings'
  }
]

// 计算属性
const isAdmin = computed(() => {
  return authStore.user?.role === 'admin'
})

const userName = computed(() => {
  if (!authStore.user) return '用户'
  return authStore.user.nickname || authStore.user.username || authStore.user.email || '用户'
})

const userInitial = computed(() => {
  const name = userName.value
  return name.charAt(0).toUpperCase()
})

const userRole = computed(() => {
  const role = authStore.user?.role || 'user'
  return role === 'admin' ? '管理员' : '普通用户'
})

const pageTitle = computed(() => {
  const currentItem = [...mainMenuItems, ...adminMenuItems].find(item => item.path === route.path)
  return currentItem?.title || '智能体服务平台'
})

const pageSubtitle = computed(() => {
  switch (route.path) {
    case '/overview':
      return '查看平台使用情况和关键指标'
    case '/playground':
      return '与智能体进行实时对话交互'
    case '/dataset':
      return '管理和处理您的数据集'
    case '/marketplace':
      return '发现和使用MCP组件'
    default:
      return ''
  }
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
  if (notificationsOpen.value) {
    notificationsOpen.value = false
  }
}

const toggleNotifications = () => {
  notificationsOpen.value = !notificationsOpen.value
  if (userMenuOpen.value) {
    userMenuOpen.value = false
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.user-profile') && !target.closest('.user-dropdown')) {
    userMenuOpen.value = false
  }
  if (!target.closest('.notification-btn') && !target.closest('.notifications-panel')) {
    notificationsOpen.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 加载通知数据
  // loadNotifications()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* 布局容器 */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-gray-50);
}

/* 左侧导航栏 */
.sidebar {
  width: 240px;
  background: var(--color-white);
  border-right: 1px solid var(--color-gray-200);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 64px;
}

/* 菜单头部 */
.sidebar-header {
  height: 64px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-gray-200);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--color-gray-900);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
}

.collapse-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--color-gray-600);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.collapse-btn:hover {
  background: var(--color-gray-100);
}

/* 导航菜单 */
.sidebar-nav {
  padding: 16px 0;
  flex: 1;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-section-title {
  font-size: 12px;
  color: var(--color-gray-600);
  margin: 24px 16px 8px 16px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-item {
  display: flex;
  align-items: center;
  height: 44px;
  padding: 12px 16px;
  color: var(--color-gray-600);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}

.sidebar-collapsed .nav-item {
  justify-content: center;
  padding: 12px 8px;
}

.nav-item:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-900);
}

.nav-item-active {
  background: var(--color-gray-100);
  color: var(--color-gray-900);
}

.nav-item-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-gray-900);
}

.nav-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 16px;
}

.sidebar-collapsed .nav-icon {
  margin-right: 0;
}

.sidebar-collapsed .nav-text,
.sidebar-collapsed .admin-badge {
  display: none;
}

.nav-text {
  flex: 1;
}

.admin-badge {
  background: var(--color-gray-900);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
}

/* 侧边栏用户区域 */
.sidebar-user {
  border-top: 1px solid var(--color-gray-200);
  padding: 16px;
  position: relative;
}

.user-profile {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.user-profile:hover {
  background: var(--color-gray-100);
}

.sidebar-user .user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-gray-900);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin-right: 12px;
}

.sidebar-collapsed .sidebar-user .user-avatar {
  margin-right: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.sidebar-user .user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900);
  line-height: 1.2;
  margin-bottom: 2px;
}

.user-role {
  font-size: 12px;
  color: var(--color-gray-600);
  line-height: 1.2;
}

.user-menu-icon {
  transition: transform 0.2s ease;
}

.user-menu-icon.rotated {
  transform: rotate(180deg);
}

.sidebar-user .user-dropdown {
  position: absolute;
  bottom: 100%;
  left: 16px;
  right: 16px;
  margin-bottom: 8px;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 1001;
}

.sidebar-user .dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  color: var(--color-gray-700);
  text-decoration: none;
  font-size: 14px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sidebar-user .dropdown-item:hover {
  background: var(--color-gray-100);
}

.dropdown-icon {
  margin-right: 8px;
  width: 16px;
  height: 16px;
}

.sidebar-user .dropdown-divider {
  height: 1px;
  background: var(--color-gray-200);
  margin: 8px 0;
}

.sidebar-user .logout-btn {
  color: var(--color-semantic-warning);
}

.dropdown-section-title {
  font-size: 11px;
  color: var(--color-gray-500);
  margin: 8px 16px 4px 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.admin-item {
  position: relative;
}

.admin-badge-small {
  background: var(--color-gray-900);
  color: white;
  font-size: 9px;
  padding: 2px 4px;
  border-radius: 6px;
  font-weight: 600;
  margin-left: auto;
}

/* 用户菜单动画 */
.user-menu-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-menu-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-menu-slide-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}

.user-menu-slide-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.98);
}

.user-menu-slide-enter-to,
.user-menu-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
  display: flex;
  flex-direction: column;
}

.dashboard-layout:has(.sidebar-collapsed) .main-content {
  margin-left: 64px;
}

/* 页面头部 */
.page-header {
  height: 64px;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-gray-600);
  margin: 4px 0 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 通知按钮 */
.notification-btn {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--color-gray-600);
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.notification-btn:hover {
  background: var(--color-gray-100);
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-semantic-warning);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
}

/* 用户菜单 */
.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.user-menu:hover {
  background: var(--color-gray-100);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--color-gray-900);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-gray-900);
}



/* 页面内容 */
.page-content {
  padding: 24px;
  min-height: calc(100vh - 64px);
}

/* 通知面板 */
.notifications-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: var(--color-white);
  border-left: 1px solid var(--color-gray-200);
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

.notifications-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notifications-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--color-gray-600);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: var(--color-gray-100);
}

.notifications-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.no-notifications {
  text-align: center;
  padding: 40px 20px;
  color: var(--color-gray-600);
}

.notification-item {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-gray-100);
  transition: background-color 0.2s ease;
}

.notification-item:hover {
  background: var(--color-gray-50);
}

.notification-item.unread {
  background: var(--color-brand-primary-light);
}

.notification-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-gray-900);
}

.notification-content p {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--color-gray-600);
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: var(--color-gray-500);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  
  .sidebar.sidebar-open {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .notifications-panel {
    width: 100%;
  }
}
</style>