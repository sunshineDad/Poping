/**
 * [文件概览]
 * - 目的: 统一的 Provider 和 ProviderConfig 类型定义
 * - 数据流: API → 类型验证 → 组件使用
 * - 核心数据: Provider, ProviderConfig, Model
 * - 关系: 被所有 provider 相关组件引用
 */

export interface Provider {
  id: string
  name: string
  description?: string
  iconUrl?: string
}

export interface ProviderConfig {
  id?: string
  providerId: string
  name: string  // 必填字段 - 配置名称
  apiUrl: string
  apiKey: string
  description?: string
  status?: 'active' | 'inactive'
  availableModels?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Model {
  id: string
  name?: string
  description?: string
}

export interface TestResult {
  success: boolean
  message: string
  models?: Array<{ id: string; name?: string }>
}