/**
 * [文件概览]
 * - 目的: 统一的AI接口服务层，基于OpenAPI规范
 * - 数据流: 前端组件 → aiService → 后端API
 * - 核心数据: Session, Message, StreamEvent, Config
 * - 关系: @/stores/agent.ts → 状态管理, @/components/ChatInterface.vue → UI交互
 */

import { ref, computed } from 'vue'
import type { 
  AISession, 
  AIMessage, 
  AISessionConfig, 
  AIServiceConfig,
  QueryRequest, 
  StreamEvent
} from '@/types/ai'
import { DEFAULT_AI_SERVICE_CONFIG } from '@/types/ai'

// 服务配置
const AI_SERVICE_CONFIG: AIServiceConfig = DEFAULT_AI_SERVICE_CONFIG

/**
 * AI接口服务 - 统一的AI对话接口
 * 
 * [设计思想说明]
 * 1. 单一职责: 只负责AI接口调用，不处理UI状态
 * 2. 错误透明: 所有错误向上抛出，由调用方处理
 * 3. 接口标准: 严格遵循.trae/ai接口json规范
 * 4. 无状态: 不维护内部状态，所有状态由Store管理
 */
export class AIService {
  private readonly baseURL: string
  private readonly timeout: number

  constructor(baseURL = 'http://localhost:8080', timeout = 30000) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  /**
   * [函数: createSession]
   * - 输入: SessionCreateRequest (配置 + 元数据)
   * - 输出: AISession (会话信息)
   * - 角色: 创建新的AI会话
   * - 逻辑: 1. 调用POST /api/sessions 2. 返回会话信息
   */
  async createSession(request: SessionCreateRequest): Promise<AISession> {
    const response = await this.fetchWithTimeout('/api/chat/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    const result: APIResponse<AISession> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '创建会话失败')
    }

    return result.data
  }

  /**
   * [函数: listSessions]
   * - 输入: 无
   * - 输出: AISession[] (会话列表)
   * - 角色: 获取所有会话
   * - 逻辑: 1. 调用GET /api/sessions 2. 返回会话列表
   */
  async listSessions(): Promise<AISession[]> {
    const response = await this.fetchWithTimeout('/api/chat/sessions')
    const result: APIResponse<{ sessions: AISession[] }> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '获取会话列表失败')
    }

    return result.data.sessions
  }

  /**
   * [函数: getSession]
   * - 输入: sessionId (会话ID)
   * - 输出: AISession (会话信息)
   * - 角色: 获取单个会话详情
   * - 逻辑: 1. 调用GET /api/chat/sessions/{id} 2. 返回会话信息
   */
  async getSession(sessionId: string): Promise<AISession> {
    const response = await this.fetchWithTimeout(`/api/chat/sessions/${sessionId}`)
    const result: APIResponse<AISession> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '获取会话失败')
    }

    return result.data
  }

  /**
   * [函数: deleteSession]
   * - 输入: sessionId (会话ID)
   * - 输出: void
   * - 角色: 删除会话
   * - 逻辑: 1. 调用DELETE /api/sessions/{id} 2. 处理删除结果
   */
  async deleteSession(sessionId: string): Promise<void> {
    const response = await this.fetchWithTimeout(`/api/sessions/${sessionId}`, {
      method: 'DELETE'
    })

    const result: APIResponse<null> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '删除会话失败')
    }
  }

  /**
   * [函数: updateSessionConfig]
   * - 输入: sessionId, config (会话配置)
   * - 输出: SessionConfig (更新后的配置)
   * - 角色: 更新会话配置
   * - 逻辑: 1. 调用PUT /api/sessions/{id}/config 2. 返回新配置
   */
  async updateSessionConfig(sessionId: string, config: SessionConfig): Promise<SessionConfig> {
    const response = await this.fetchWithTimeout(`/api/sessions/${sessionId}/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    })

    const result: APIResponse<{ config: SessionConfig }> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '更新配置失败')
    }

    return result.data.config
  }

  /**
   * [函数: updateSessionTitle]
   * - 输入: sessionId, title (新标题)
   * - 输出: void
   * - 角色: 更新会话标题
   * - 逻辑: 1. 调用PUT /api/sessions/{id}/title 2. 处理更新结果
   */
  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const response = await this.fetchWithTimeout(`/api/sessions/${sessionId}/title`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    })

    const result: APIResponse<{ title: string, session_id: string }> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '更新标题失败')
    }
  }

  /**
   * [函数: queryStream]
   * - 输入: sessionId, query, callback (查询请求和回调)
   * - 输出: Promise<void>
   * - 角色: 发送查询并处理流式响应
   * - 逻辑: 1. 调用streamQuery 2. 处理每个事件 3. 调用回调函数
   */
  async queryStream(sessionId: string, query: QueryRequest, callback: (event: StreamEvent) => void): Promise<void> {
    try {
      const generator = this.streamQuery(sessionId, query)
      
      for await (const event of generator) {
        callback({
          type: 'message',
          data: {
            role: event.type === 'assistant_message' ? 'assistant' : 'user',
            content: event.data?.content || ''
          }
        })
      }
    } catch (error) {
      callback({
        type: 'error',
        data: {
          error: error instanceof Error ? error.message : '查询失败'
        }
      })
    }
  }

  /**
   * [函数: streamQuery]
   * - 输入: sessionId, query (查询请求)
   * - 输出: AsyncGenerator<AIStreamEvent> (流式事件)
   * - 角色: 发送查询并接收流式响应
   * - 逻辑: 1. 调用POST /api/chat/send 2. 解析SSE流 3. 生成事件
   */
  async* streamQuery(sessionId: string, query: QueryRequest): Promise<AsyncGenerator<AIStreamEvent>> {
    const response = await this.fetchWithTimeout(`/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        sessionId: sessionId,
        message: query.query
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            
            if (data === '[DONE]') {
              return
            }

            try {
              const event: AIStreamEvent = JSON.parse(data)
              yield event
            } catch (e) {
              console.warn('解析SSE事件失败:', data, e)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * [函数: interruptQuery]
   * - 输入: sessionId (会话ID)
   * - 输出: void
   * - 角色: 中断当前查询处理
   * - 逻辑: 1. 调用POST /api/sessions/{id}/interrupt 2. 处理中断结果
   */
  async interruptQuery(sessionId: string): Promise<void> {
    const response = await this.fetchWithTimeout(`/api/sessions/${sessionId}/interrupt`, {
      method: 'POST'
    })

    const result: APIResponse<null> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '中断处理失败')
    }
  }

  /**
   * [函数: uploadResource]
   * - 输入: sessionId, file, resourceType?, tags?
   * - 输出: string (资源ID)
   * - 角色: 上传文件资源到会话
   * - 逻辑: 1. 构建FormData 2. 调用POST /api/sessions/{id}/resources/upload 3. 返回资源ID
   */
  async uploadResource(
    sessionId: string, 
    file: File, 
    resourceType?: string, 
    tags?: string[]
  ): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (resourceType) {
      formData.append('resource_type', resourceType)
    }
    
    if (tags && tags.length > 0) {
      formData.append('tags', tags.join(','))
    }

    const response = await this.fetchWithTimeout(`/api/sessions/${sessionId}/resources/upload`, {
      method: 'POST',
      body: formData
    })

    const result: APIResponse<{ id: string }> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '上传资源失败')
    }

    return result.data.id
  }

  /**
   * [函数: listResources]
   * - 输入: sessionId, resourceType?, limit?
   * - 输出: Resource[] (资源列表)
   * - 角色: 获取会话资源列表
   * - 逻辑: 1. 构建查询参数 2. 调用GET /api/sessions/{id}/resources 3. 返回资源列表
   */
  async listResources(
    sessionId: string, 
    resourceType?: string, 
    limit = 50
  ): Promise<Array<{ id: string, type: string, name: string }>> {
    const params = new URLSearchParams()
    if (resourceType) params.append('resource_type', resourceType)
    params.append('limit', limit.toString())

    const response = await this.fetchWithTimeout(
      `/api/sessions/${sessionId}/resources?${params.toString()}`
    )

    const result: APIResponse<{ items: Array<{ id: string, type: string, name: string }> }> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '获取资源列表失败')
    }

    return result.data.items
  }

  /**
   * [函数: deleteResource]
   * - 输入: sessionId, resourceId
   * - 输出: void
   * - 角色: 删除会话资源
   * - 逻辑: 1. 调用DELETE /api/sessions/{id}/resources/{resourceId} 2. 处理删除结果
   */
  async deleteResource(sessionId: string, resourceId: string): Promise<void> {
    const response = await this.fetchWithTimeout(
      `/api/sessions/${sessionId}/resources/${resourceId}`, 
      { method: 'DELETE' }
    )

    const result: APIResponse<null> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '删除资源失败')
    }
  }

  /**
   * [函数: getAvailableFeatures]
   * - 输入: 无
   * - 输出: Record<string, FeatureInfo> (可用功能列表)
   * - 角色: 获取可用的MCP功能
   * - 逻辑: 1. 调用GET /api/sessions/features 2. 返回功能信息
   */
  async getAvailableFeatures(): Promise<Record<string, { description: string, tools: string[] }>> {
    const response = await this.fetchWithTimeout('/api/sessions/features')
    const result: APIResponse<Record<string, { description: string, tools: string[] }>> = await response.json()
    
    if (!result.success) {
      throw new Error(result.message || '获取功能列表失败')
    }

    return result.data
  }

  /**
   * [函数: healthCheck]
   * - 输入: 无
   * - 输出: boolean (健康状态)
   * - 角色: 检查AI服务健康状态
   * - 逻辑: 1. 调用GET /health 2. 返回是否健康
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout('/health')
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * [私有函数: fetchWithTimeout]
   * - 输入: url, options (请求参数)
   * - 输出: Response (HTTP响应)
   * - 角色: 带超时的HTTP请求
   * - 逻辑: 1. 设置超时控制 2. 发送请求 3. 处理超时
   */
  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        signal: controller.signal
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return response
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('请求超时')
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }
}

// 导出单例实例
export const aiService = new AIService()