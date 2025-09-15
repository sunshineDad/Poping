// Overview页面相关类型定义

export interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed?: string
  status: 'active' | 'inactive'
  usage: {
    total: number
    thisMonth: number
  }
}

export interface StatsData {
  id: string
  title: string
  value: number | string
  change: number
  trend: 'up' | 'down' | 'stable'
  icon: string
  format?: 'number' | 'currency' | 'percentage'
}

export interface ChartDataPoint {
  date: string
  value: number
  label?: string
}

export interface ChartData {
  id: string
  name: string
  data: ChartDataPoint[]
  color: string
}

export interface McpIntegration {
  id: string
  name: string
  description: string
  status: 'connected' | 'disconnected' | 'error'
  version: string
  lastSync?: string
  config: Record<string, any>
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: string
  disabled?: boolean
}

// API响应类型 - 使用统一的响应格式
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  timestamp?: string
}

// API请求类型
export interface ApiKeyListResponse {
  success: boolean
  data: ApiKey[]
  message?: string
}

export interface GenerateApiKeyRequest {
  name: string
  description?: string
}

export interface GenerateApiKeyResponse {
  success: boolean
  data: ApiKey
  message?: string
}

// MCP集成相关类型
export interface McpIntegrationListResponse {
  success: boolean
  data: McpIntegration[]
  message?: string
}

export interface TestConnectionRequest {
  integrationId: string
}

export interface TestConnectionResponse {
  success: boolean
  data: {
    status: 'connected' | 'disconnected' | 'error'
    message?: string
  }
  message?: string
}

// 代码示例相关类型
export interface CodeExample {
  id: string
  title: string
  description: string
  language: string
  code: string
  notes?: string[]
}

export interface Language {
  key: string
  name: string
  icon: any
}

export interface CodeExamplesResponse {
  success: boolean
  data: CodeExample[]
  message?: string
}

export interface UsageChartRequest {
  timeRange: '7d' | '30d' | '90d'
  granularity?: 'hour' | 'day' | 'week'
}

// 统计数据类型
export interface OverviewStats {
  apiCalls: {
    total: number
    thisMonth: number
    change: number
  }
  activeKeys: {
    total: number
    change: number
  }
  integrations: {
    total: number
    connected: number
  }
  usage: {
    bandwidth: number
    requests: number
  }
}

// 图表配置类型
export interface ChartConfig {
  type: 'line' | 'bar' | 'area'
  timeRange: string
  showGrid: boolean
  showTooltip: boolean
  colors: string[]
}