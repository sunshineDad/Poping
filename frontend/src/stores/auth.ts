import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * [文件概览]
 * - 目的: 管理用户认证状态和用户信息
 * - 数据流: 登录/注册 → 存储token和用户信息 → 全局状态管理
 * - 核心数据: 用户信息、认证token、登录状态
 * - 关系: 被所有需要认证的组件使用
 */

interface User {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  role: 'user' | 'admin'
  status: 'active' | 'inactive' | 'banned'
  createTime: string
  updateTime: string
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  username?: string
  email: string
  password: string
  confirmPassword: string
}

interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  
  // 计算属性
  const isAuthenticated = computed(() => {
    return !!accessToken.value && !!user.value
  })
  
  const isAdmin = computed(() => {
    return user.value?.role === 'admin'
  })
  
  const userDisplayName = computed(() => {
    if (!user.value) return ''
    return user.value.nickname || user.value.username || user.value.email
  })
  
  /**
   * [函数: login]
   * - 输入: LoginRequest - 登录请求数据
   * - 输出: Promise<boolean> - 登录是否成功
   * - 角色: 处理用户登录逻辑
   * - 逻辑: 1. 发送登录请求 2. 存储认证信息 3. 更新用户状态
   */
  const login = async (credentials: LoginRequest): Promise<{ success: boolean; message?: string }> => {
    isLoading.value = true
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })
      
      const data = await response.json()
      
      if (data.success) {
        const authData: AuthResponse = data.data
        
        // 存储认证信息
        user.value = authData.user
        accessToken.value = authData.accessToken
        refreshToken.value = authData.refreshToken
        
        // 持久化存储
        localStorage.setItem('access_token', authData.accessToken)
        localStorage.setItem('refresh_token', authData.refreshToken)
        localStorage.setItem('user_info', JSON.stringify(authData.user))
        
        return { success: true }
      } else {
        return { success: false, message: data.message || '登录失败' }
      }
    } catch (error) {
      console.error('登录错误:', error)
      return { success: false, message: '网络错误，请稍后重试' }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * [函数: register]
   * - 输入: RegisterRequest - 注册请求数据
   * - 输出: Promise<{success: boolean, message?: string}> - 注册结果
   * - 角色: 处理用户注册逻辑
   * - 逻辑: 1. 验证输入 2. 发送注册请求 3. 自动登录
   */
  const register = async (userData: RegisterRequest): Promise<{ success: boolean; message?: string }> => {
    isLoading.value = true
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 注册成功后自动登录
        return await login({
          email: userData.email,
          password: userData.password,
        })
      } else {
        return { success: false, message: data.message || '注册失败' }
      }
    } catch (error) {
      console.error('注册错误:', error)
      return { success: false, message: '网络错误，请稍后重试' }
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * [函数: logout]
   * - 输入: 无
   * - 输出: void
   * - 角色: 处理用户登出逻辑
   * - 逻辑: 1. 清除本地状态 2. 清除持久化存储 3. 可选调用后端登出接口
   */
  const logout = async () => {
    try {
      // 调用后端登出接口（可选）
      if (accessToken.value) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken.value}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      // 清除状态
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      
      // 清除持久化存储
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_info')
    }
  }
  
  /**
   * [函数: refreshAccessToken]
   * - 输入: 无
   * - 输出: Promise<boolean> - 刷新是否成功
   * - 角色: 刷新访问令牌
   * - 逻辑: 1. 使用refresh token获取新的access token 2. 更新存储
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken.value) {
      return false
    }
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken.value,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        accessToken.value = data.data.accessToken
        localStorage.setItem('access_token', data.data.accessToken)
        return true
      } else {
        // refresh token也过期了，需要重新登录
        await logout()
        return false
      }
    } catch (error) {
      console.error('刷新token失败:', error)
      await logout()
      return false
    }
  }
  
  /**
   * [函数: initializeAuth]
   * - 输入: 无
   * - 输出: void
   * - 角色: 从本地存储初始化认证状态
   * - 逻辑: 1. 读取本地存储 2. 验证token有效性 3. 恢复用户状态
   */
  const initializeAuth = () => {
    const storedAccessToken = localStorage.getItem('access_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')
    const storedUserInfo = localStorage.getItem('user_info')
    
    if (storedAccessToken && storedRefreshToken && storedUserInfo) {
      try {
        accessToken.value = storedAccessToken
        refreshToken.value = storedRefreshToken
        user.value = JSON.parse(storedUserInfo)
      } catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }
  
  /**
   * [函数: updateUserProfile]
   * - 输入: Partial<User> - 用户信息更新数据
   * - 输出: Promise<boolean> - 更新是否成功
   * - 角色: 更新用户个人信息
   * - 逻辑: 1. 发送更新请求 2. 更新本地用户信息 3. 同步持久化存储
   */
  const updateUserProfile = async (updates: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    if (!accessToken.value) {
      return { success: false, message: '未登录' }
    }
    
    isLoading.value = true
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken.value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 更新本地用户信息
        if (user.value) {
          user.value = { ...user.value, ...data.data }
          localStorage.setItem('user_info', JSON.stringify(user.value))
        }
        return { success: true }
      } else {
        return { success: false, message: data.message || '更新失败' }
      }
    } catch (error) {
      console.error('更新用户信息错误:', error)
      return { success: false, message: '网络错误，请稍后重试' }
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    // 状态
    user,
    accessToken,
    refreshToken,
    isLoading,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    userDisplayName,
    
    // 方法
    login,
    register,
    logout,
    refreshAccessToken,
    initializeAuth,
    updateUserProfile,
  }
})