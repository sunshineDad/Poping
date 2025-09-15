// 智能体相关类型定义

export interface Agent {
  id: string | number
  name: string
  description?: string
  avatar?: string
  systemPrompt: string
  config?: AgentConfig  // 修改为对象类型
  category?: string
  tags?: string
  creatorId: number
  isPublic: boolean
  status: 'active' | 'inactive'
  usageCount: number
  createTime: string
  updateTime: string
  createdAt: string     // 添加缺失字段
  updatedAt: string     // 添加缺失字段
  memoryEnabled?: boolean // 添加缺失字段
}

export interface AgentCreateRequest {
  name: string
  description?: string
  avatar?: string
  systemPrompt: string
  config?: AgentConfig  // 修改为对象类型
  isPublic?: boolean
}

export interface AgentConfig {
  model?: {
    provider: string
    name: string
    temperature?: number
    maxTokens?: number
  }
  mcpConfig?: {
    enabled: boolean
    endpoint?: string
    apiKey?: string
    tools?: string[]
  }
  datasetConfig?: {
    enabled: boolean
    datasetIds: string[]
  }
  memoryConfig?: {
    enabled: boolean
    type?: 'short' | 'long'
    maxMessages?: number
  }
  features: {
    memories: boolean
    events: boolean
    docs: boolean
    texts: boolean
    images: boolean
    retrieval: boolean
  }
  customMcpServers?: Record<string, any>
  system: {
    systemPrompt: string
  }
}

export interface ChatSession {
  id: string
  agentId: number
  userId: number
  title: string
  status: 'active' | 'archived' | 'deleted'
  createdAt: string
  updatedAt: string
  messageCount?: number
  lastMessage?: string
  agentName?: string  // 添加缺失字段
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, any>
  createdAt: string
  isStreaming?: boolean  // 添加缺失字段
  toolCalls?: ToolCall[] // 添加缺失字段
}

// 工具调用接口
export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, any>
  result?: any
}

// API响应类型
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface AgentListResponse {
  agents: Agent[]
  total: number
  page: number
  size: number
}

export interface ChatSessionListResponse {
  sessions: ChatSession[]
  total: number
}

// 数据集相关类型
export interface Dataset {
  id: string
  name: string
  description?: string
  status: 'active' | 'processing' | 'error'
  createdAt: string
}

// MCP工具相关类型
export interface McpTool {
  id: string
  name: string
  description: string
  provider: string
  version: string
  config?: Record<string, any>
}

export interface McpProvider {
  id: string
  name: string
  description: string
  tools: McpTool[]
}

// 模型相关类型
export interface ModelProvider {
  id: string
  name: string
  description: string
  models: Model[]
}

export interface Model {
  id: string
  name: string
  description: string
  provider: string
  maxTokens: number
  supportedFeatures: string[]
}

// 游乐场相关类型
export interface PlaygroundState {
  currentAgent?: Agent
  currentSession?: ChatSession
  messages: ChatMessage[]
  isLoading: boolean
  isTyping: boolean
}

// 表单相关类型
export interface AgentFormData {
  name: string
  description: string
  systemPrompt: string
  features: {
    memories: boolean
    events: boolean
    docs: boolean
    texts: boolean
    images: boolean
    retrieval: boolean
  }
  model?: {
    provider: string
    name: string
    temperature: number
    maxTokens: number
  }
  dataset?: {
    id: string
    name: string
  }
  mcpTools: string[]
}

export interface AgentFormErrors {
  name?: string
  description?: string
  systemPrompt?: string
  model?: string
  dataset?: string
}