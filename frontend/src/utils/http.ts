import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import toast from './toast'

/**
 * [文件概览]
 * - 目的: 统一HTTP请求处理和错误管理
 * - 数据流: 组件 → HTTP工具 → 后端API → 响应处理 → Toast提示
 * - 核心数据: 请求配置、响应数据、错误信息
 * - 关系: @/stores/auth.ts → 认证状态管理，集成Toast消息提示
 */

// 通用API响应接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp?: string
}

// 错误响应接口
export interface ErrorResponse {
  code: number
  message: string
  error?: string
  timestamp?: string
}

// HTTP客户端类
class HttpClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  /**
   * [函数: setupInterceptors]
   * - 输入: 无
   * - 输出: void
   * - 角色: 配置请求和响应拦截器
   * - 逻辑: 1. 请求拦截器添加认证头 2. 响应拦截器处理错误
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 直接从localStorage获取token，避免store初始化问题
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response
        
        // 检查业务状态码
        if (data.code !== 200) {
          this.handleBusinessError(data)
          return Promise.reject(new Error(data.message))
        }
        
        return response
      },
      (error: AxiosError<ErrorResponse>) => {
        this.handleHttpError(error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * [函数: handleBusinessError]
   * - 输入: ApiResponse - 业务错误响应
   * - 输出: void
   * - 角色: 处理业务逻辑错误
   * - 逻辑: 1. 根据错误码分类处理 2. 使用Toast显示用户友好的错误信息
   */
  private handleBusinessError(response: ApiResponse): void {
    const { code, message } = response
    
    switch (code) {
      case 401:
        toast.error({
          title: '认证失败',
          message: '登录已过期，请重新登录',
          duration: 5000
        })
        this.handleUnauthorized()
        break
      case 403:
        toast.error({
          title: '权限不足',
          message: '无法访问该资源',
          duration: 5000
        })
        break
      case 404:
        toast.error({
          title: '资源不存在',
          message: '请求的资源不存在',
          duration: 4000
        })
        break
      case 400:
        toast.error({
          title: '参数错误',
          message: message || '请求参数错误',
          duration: 5000
        })
        break
      case 500:
        toast.error({
          title: '服务器错误',
          message: '服务器内部错误，请稍后重试',
          duration: 5000
        })
        break
      default:
        toast.error({
          title: '操作失败',
          message: message || '操作失败，请重试',
          duration: 5000
        })
    }
  }

  /**
   * [函数: handleHttpError]
   * - 输入: AxiosError - HTTP错误对象
   * - 输出: void
   * - 角色: 处理HTTP层面错误
   * - 逻辑: 1. 网络错误处理 2. 超时错误处理 3. 使用Toast显示HTTP错误
   */
  private handleHttpError(error: AxiosError<ErrorResponse>): void {
    if (error.code === 'ECONNABORTED') {
      toast.error({
        title: '请求超时',
        message: '请求超时，请检查网络连接',
        duration: 5000
      })
      return
    }

    if (!error.response) {
      toast.error({
        title: '网络错误',
        message: '网络连接失败，请检查网络设置',
        duration: 5000
      })
      return
    }

    const { status, data } = error.response
    
    switch (status) {
      case 401:
        toast.error({
          title: '认证失败',
          message: '登录已过期，请重新登录',
          duration: 5000
        })
        this.handleUnauthorized()
        break
      case 403:
        toast.error({
          title: '权限不足',
          message: '权限不足',
          duration: 5000
        })
        break
      case 404:
        toast.error({
          title: '接口不存在',
          message: '请求的接口不存在',
          duration: 4000
        })
        break
      case 500:
        toast.error({
          title: '服务器错误',
          message: '服务器错误，请稍后重试',
          duration: 5000
        })
        break
      case 502:
      case 503:
      case 504:
        toast.error({
          title: '服务不可用',
          message: '服务暂时不可用，请稍后重试',
          duration: 5000
        })
        break
      default:
        toast.error({
          title: '请求失败',
          message: data?.message || `请求失败 (${status})`,
          duration: 5000
        })
    }
  }

  /**
   * [函数: handleUnauthorized]
   * - 输入: 无
   * - 输出: void
   * - 角色: 处理未授权错误
   * - 逻辑: 1. 清除认证信息 2. 跳转到登录页
   */
  private handleUnauthorized(): void {
    // 直接清除localStorage中的token，避免store初始化问题
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    
    this.showError('登录已过期，请重新登录')
    
    // 跳转到登录页
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  }

  /**
   * [函数: showError]
   * - 输入: string - 错误消息
   * - 输出: void
   * - 角色: 显示错误提示
   * - 逻辑: 使用Toast系统显示错误消息
   */
  private showError(message: string): void {
    toast.error({
      title: '错误',
      message,
      duration: 4000
    })
  }

  /**
   * [函数: showSuccess]
   * - 输入: string - 成功消息
   * - 输出: void
   * - 角色: 显示成功提示
   * - 逻辑: 使用Toast系统显示成功消息
   */
  private showSuccess(message: string): void {
    toast.success({
      title: '成功',
      message,
      duration: 3000
    })
  }

  // HTTP方法封装
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config)
    return response.data
  }

  // 文件上传
  async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const uploadConfig = {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers
      }
    }
    
    const response = await this.instance.post<ApiResponse<T>>(url, formData, uploadConfig)
    return response.data
  }

  // 下载文件
  async download(url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> {
    const downloadConfig = {
      ...config,
      responseType: 'blob' as const
    }
    
    const response = await this.instance.get(url, downloadConfig)
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }
}

// 导出HTTP客户端实例
export const http = new HttpClient()

// 导出便捷方法
export const { get, post, put, delete: del, patch, upload, download } = http

// 导出类型
export type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'