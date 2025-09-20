/**
 * [文件概览]
 * - 目的: AI接口相关的TypeScript类型定义
 * - 数据流: 前端组件 ← 类型约束 → AI服务层
 * - 核心数据: Session, Message, StreamEvent, Config
 * - 关系: @/services/aiService.ts → 接口实现, @/stores/agent.ts → 状态管理
 */

/**
 * API响应基础结构
 */
export interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp?: string
}

/**
 * AI会话信息
 */
export interface AISession {
  session_id: string
  created_at: string
  last_accessed: string
  metadata: {
    title?: string
    [key: string]: any
  }
  title: string  // 从metadata提取或生成的标题
  preview?: string  // 最近消息预览
}

/**
 * AI消息
 */
export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: string
  metadata?: {
    [key: string]: any
  }
}

/**
 * 会话配置
 */
export interface SessionConfig {
  features: {
    memories?: boolean
    events?: boolean
    docs?: boolean
    texts?: boolean
    images?: boolean
    retrieval?: boolean
    [key: string]: boolean | undefined
  }
  custom_mcp_servers?: {
    [key: string]: any
  }
  system?: {
    system_prompt?: string
    [key: string]: any
  }
  permission_control_mode?: 'ask' | 'auto' | 'yolo'
  permission_policies?: {
    mode: 'auto'
    auto: {
      allow: string[]
      prompt: string[]
    }
  }
  continue_conversation?: boolean
}

/**
 * 会话创建请求
 */
export interface SessionCreateRequest {
  config?: SessionConfig
  metadata?: {
    title?: string
    [key: string]: any
  }
}

/**
 * 查询请求
 */
export interface QueryRequest {
  query: string
  context?: {
    language?: string
    [key: string]: any
  }
}

/**
 * 流式事件类型
 */
export type AIStreamEventType = 'start' | 'message' | 'result' | 'complete' | 'error'

/**
 * 流式事件
 */
export interface AIStreamEvent {
  type: AIStreamEventType
  data: any
}

/**
 * 开始事件数据
 */
export interface StartEventData {
  event_id: string
}

/**
 * 消息事件数据
 */
export interface MessageEventData {
  role: 'user' | 'assistant' | 'tool'
  content: string
  metadata?: {
    [key: string]: any
  }
}

/**
 * 结果事件数据
 */
export interface ResultEventData {
  status: 'success' | 'error'
  duration_ms: number
  error?: string
}

/**
 * 完成事件数据
 */
export interface CompleteEventData {
  event_id: string
}

/**
 * 错误事件数据
 */
export interface ErrorEventData {
  error: string
  event_id?: string
}

/**
 * 资源信息
 */
export interface AIResource {
  id: string
  type: 'images' | 'texts' | 'docs' | 'codes' | 'pdf_resources'
  name: string
  size?: number
  created_at: string
  tags?: string[]
}

/**
 * 功能信息
 */
export interface FeatureInfo {
  description: string
  tools: string[]
}

/**
 * 服务器信息
 */
export interface ServerInfo {
  capabilities: string[]
  styles?: {
    [key: string]: any
  }
  resume_token?: string
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  detail: string
  type?: string
  code?: string
}

/**
 * HTTP验证错误
 */
export interface HTTPValidationError {
  detail: Array<{
    loc: (string | number)[]
    msg: string
    type: string
  }>
}

/**
 * 上传文件请求体
 */
export interface UploadFileRequest {
  file: File
  resource_type?: string
  tags?: string
}

/**
 * 会话状态枚举
 */
export enum SessionStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

/**
 * 消息角色枚举
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool'
}

/**
 * 权限控制模式枚举
 */
export enum PermissionMode {
  ASK = 'ask',
  AUTO = 'auto',
  YOLO = 'yolo'
}

/**
 * 资源类型枚举
 */
export enum ResourceType {
  IMAGES = 'images',
  TEXTS = 'texts',
  DOCS = 'docs',
  CODES = 'codes',
  PDF_RESOURCES = 'pdf_resources'
}

/**
 * AI服务配置
 */
export interface AIServiceConfig {
  baseURL: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

/**
 * 默认会话配置
 */
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  features: {
    memories: true,
    events: true,
    docs: true,
    texts: true,
    images: true,
    retrieval: false
  },
  permission_control_mode: 'auto',
  permission_policies: {
    mode: 'auto',
    auto: {
      allow: ['image_*'],
      prompt: ['delete_*']
    }
  },
  continue_conversation: true
}

/**
 * 默认AI服务配置
 */
export const DEFAULT_AI_SERVICE_CONFIG: AIServiceConfig = {
  baseURL: 'http://localhost:8000',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
}