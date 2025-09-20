import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import ProfilePage from '@/views/ProfilePage.vue'
import AgentManagePage from '@/views/AgentManagePage.vue'
import PlaygroundPage from '@/views/PlaygroundPage.vue'
import DatasetPage from '@/views/DatasetPage.vue'
import ProviderConfigPage from '@/views/ProviderConfigPage.vue'
import McpConfigPage from '@/views/McpConfigPage.vue'
import MarketPage from '@/views/MarketPage.vue'
import McpToolDetail from '@/views/McpToolDetail.vue'
import TestNotificationsPage from '@/views/TestNotificationsPage.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage,
      meta: {
        title: 'Poping - 智能体服务平台'
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
      meta: {
        title: '登录 - Poping',
        requiresGuest: true
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterPage,
      meta: {
        title: '注册 - Poping',
        requiresGuest: true
      }
    },
    {
      path: '/docs',
      name: 'Docs',
      component: () => import('@/views/DocsPage.vue'),
      meta: {
        title: '文档中心 - Poping'
      }
    },
    {
      path: '/pricing',
      name: 'Pricing',
      component: () => import('@/views/PricingPage.vue'),
      meta: {
        title: '定价 - Poping'
      }
    },
    {
      path: '/market',
      redirect: '/dashboard/marketplace'
    },
    {
      path: '/datasets',
      redirect: '/dashboard/dataset'
    },
    // 重定向 /overview 到 /dashboard
    {
      path: '/overview',
      redirect: '/dashboard'
    },
    // 需要布局的页面
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: '',
          name: 'Overview',
          component: () => import('@/views/OverviewPage.vue'),
          meta: {
            title: '概览 - Poping',
            requiresAuth: true
          }
        },
        {
          path: 'provider-config',
          name: 'ProviderConfig',
          component: ProviderConfigPage,
          meta: {
            title: '模型配置 - Poping',
            requiresAuth: true
          }
        },
        {
          path: 'marketplace',
          name: 'MarketPage',
          component: MarketPage,
          meta: {
            title: 'MCP市场 - Poping',
            requiresAuth: true
          }
        },
        {
          path: 'marketplace/tool/:id',
          name: 'McpToolDetail',
          component: McpToolDetail,
          meta: {
            title: '工具详情 - Poping',
            requiresAuth: true
          }
        },
        {
          path: 'admin/mcp-config',
          name: 'McpConfig',
          component: McpConfigPage,
          meta: {
            title: 'MCP配置管理 - Poping',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'overview',
          redirect: ''
        },
        {
          path: 'profile',
          name: 'Profile',
          component: ProfilePage,
          meta: {
            title: '个人中心 - Poping',
            requiresAuth: true
          }
        },
        {
          path: 'dataset',
          name: 'DatasetManage',
          component: DatasetPage,
          meta: {
            title: '数据集管理 - Poping',
            requiresAuth: true
          }
        },
        {
          path: 'agents',
          name: 'AgentManage',
          component: AgentManagePage,
          meta: {
            title: '智能体管理 - Poping',
            requiresAuth: true
          }
        },
        {
          path: 'marketplace',
          name: 'Marketplace',
          component: () => import('@/views/MarketPage.vue'),
          meta: {
            title: 'MCP市场 - Poping',
            requiresAuth: true
          }
        },
        {
          path: 'model-providers',
          name: 'ModelProviders',
          component: () => import('@/views/ModelProvidersPage.vue'),
          meta: {
            title: '模型供应商管理 - Poping',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'admin/users',
          name: 'AdminUsers',
          component: () => import('@/views/AdminUsersPage.vue'),
          meta: {
            title: '用户管理 - Poping',
            requiresAuth: true,
            requiresAdmin: true
          }
        },
        {
          path: 'playground',
          name: 'Playground',
          component: PlaygroundPage,
          meta: {
            title: '游乐场 - Poping',
            requiresAuth: true
          }
        },
        {
          path: 'test-notifications',
          name: 'TestNotifications',
          component: TestNotificationsPage,
          meta: {
            title: '通知组件测试 - Poping',
            requiresAuth: true
          }
        },
        {
          path: 'subscription',
          name: 'Subscription',
          component: () => import('@/views/ProfilePage.vue'),
          meta: {
            title: '订阅管理 - Poping',
            requiresAuth: true
          }
        }
      ]
    },
    // 404页面
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundPage.vue'),
      meta: {
        title: '页面未找到 - Poping'
      }
    }
  ],
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // 动态导入 auth store 以避免循环依赖
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()
  
  // 初始化认证状态
  authStore.initializeAuth()
  
  // 如果路由需要游客状态（如登录、注册页面）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }
  
  // 如果路由需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // 如果路由需要管理员权限
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/dashboard') // 重定向到概览页面
    return
  }
  
  next()
})

export default router
