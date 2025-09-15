/**
 * AIGents TypeScript Client
 * 
 * A clean TypeScript client for interacting with the AIGents API,
 * matching the simplified Python client design.
 */

// ============================
// Data Structures
// ============================

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
  request_id?: string
}

export interface SessionInfo {
  session_id: string
  status: 'active' | 'idle' | 'terminated'
  created_at: string
  last_activity: string
  config: Record<string, any>
  stats: {
    total_events: number
    total_conversations: number
    total_resources: number
  }
}

export interface Resource {
  id: string
  type: 'images' | 'texts' | 'docs' | 'codes'
  name: string
  mime_type: string
  size: number
  tags: string[]
  created_at: string
  metadata: Record<string, any>
}

export interface Event {
  id: string
  type: 'upload_resource' | 'update_resource' | 'user_query'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  title: string
  timestamp: string
  duration_ms?: number
  message_count: number
  has_error: boolean
}

export interface StreamEvent {
  type: 'start' | 'message' | 'complete' | 'error' | 'result' | 'permission_request'
  data?: any
  timestamp: string
}

export interface ToolUse {
  id: string
  name: string
  input: Record<string, any>
}

export interface ToolResult {
  tool_use_id: string
  content?: string | any[]
  is_error: boolean
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content?: string
  tool_uses?: ToolUse[]
  tool_results?: ToolResult[]
}

export interface ContentBlock {
  type: 'text' | 'image'
  text?: string
  image?: string  // base64, url, or resource_id
}

export interface Memory {
  id: string
  title: string
  category: string
  priority: 'High' | 'Medium' | 'Low'
  context: string
  key_info: string[]
  resources: string[]
  cross_refs: string[]
  usage: string
  tags: string[]
  status: 'Active' | 'Archived' | 'Deprecated'
  author: string
  version: number
  created: string
  updated: string
}

export interface DetailedResource extends Resource {
  content?: string  // Text content for text resources
  base64?: string   // Base64 data for images
  error?: string    // Error message if failed to load
}

export interface DetailedEvent extends Event {
  messages?: Message[]  // Event messages
  metadata?: Record<string, any>
  error?: string
}

export interface DetailedMemory extends Memory {
  metadata?: Record<string, any>
}

export interface SessionConfig {
  features?: {
    memories?: boolean
    docs?: boolean
    events?: boolean
    texts?: boolean
    images?: boolean
    image_ai?: boolean
    retrieval?: boolean
  }
  custom_mcp_servers?: Record<string, {
    url: string
    type: 'http' | 'sse' | 'stdio'
    headers?: Record<string, string>
  }>
  system?: {
    system_prompt?: string
  }
  permission_control_mode?: 'yolo' | 'auto' | 'ask' | 'disabled'
}

export interface PermissionRequest {
  id: string
  session_id: string
  tool_name: string
  tool_input: Record<string, any>
  timestamp: string
  status: 'pending' | 'approved' | 'denied' | 'timeout'
  auto_decision?: string  // AI的自动决定原因
}

export interface PermissionDecision {
  action: 'approve' | 'deny'
  modified_input?: Record<string, any>
  deny_reason?: string
}

export type PermissionHandler = (request: PermissionRequest) => Promise<{
  approved: boolean
  modified_input?: Record<string, any>
  deny_reason?: string
}>

// ============================
// Helper Functions
// ============================

/**
 * Extract data from API response with backward compatibility
 */
function extractResponseData<T>(response: any): T {
  // Handle new API response format
  if (response && typeof response === 'object' && 'success' in response) {
    if (response.success && response.data !== undefined) {
      return response.data
    } else if (!response.success) {
      const error = response.error || response.message || 'Unknown error'
      throw new Error(error)
    }
  }
  // Fallback for old format or direct data
  return response
}

// ============================
// Client Implementation
// ============================

export class AIGents {
  private baseUrl: string
  private sessionId?: string
  private sessionInfo?: SessionInfo
  private config?: SessionConfig
  private systemPrompt?: string
  private permissionHandler?: PermissionHandler
  private permissionPolling = false
  private permissionPollingInterval?: NodeJS.Timeout
  private permissionEventSource?: EventSource

  constructor(options: {
    baseUrl?: string
    sessionId?: string
    features?: SessionConfig['features']
    customMcpServers?: SessionConfig['custom_mcp_servers']
    systemPrompt?: string
    permissionControlMode?: 'yolo' | 'auto' | 'ask' | 'disabled'
    permissionHandler?: PermissionHandler
  } = {}) {
    this.baseUrl = options.baseUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    this.sessionId = options.sessionId
    this.systemPrompt = options.systemPrompt
    this.permissionHandler = options.permissionHandler

    // Build config if provided
    if (options.features || options.customMcpServers || options.systemPrompt || options.permissionControlMode) {
      this.config = {}
      if (options.features) {
        this.config.features = options.features
      }
      if (options.customMcpServers) {
        this.config.custom_mcp_servers = options.customMcpServers
      }
      if (options.systemPrompt) {
        this.config.system = { system_prompt: options.systemPrompt }
      }
      if (options.permissionControlMode) {
        this.config.permission_control_mode = options.permissionControlMode
      }
    }
  }

  /**
   * Connect to the API server and create/resume session
   */
  async connect(): Promise<SessionInfo> {
    if (this.sessionId) {
      // Try to resume existing session
      try {
        const res = await fetch(`${this.baseUrl}/api/sessions/${this.sessionId}`)
        if (res.ok) {
          const response = await res.json()
          // Handle new API response format
          if (response.success && response.data) {
            this.sessionInfo = response.data
          } else {
            this.sessionInfo = response // Fallback for old format
          }
          console.log(`Resumed session: ${this.sessionId}`)
          // Frontend UI handles permission SSE; disable internal polling
          return this.sessionInfo!
        }
      } catch (error) {
        console.warn('Failed to resume session, creating new one')
        this.sessionId = undefined
      }
    }

    // Create new session
    const requestData = this.config ? { config: this.config } : undefined
    const res = await fetch(`${this.baseUrl}/api/sessions`, {
      method: 'POST',
      headers: requestData ? { 'Content-Type': 'application/json' } : {},
      body: requestData ? JSON.stringify(requestData) : undefined
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || res.statusText
      throw new Error(`Failed to create session: ${errorMessage}`)
    }

    const response = await res.json()
    // Handle new API response format
    if (response.success && response.data) {
      this.sessionInfo = response.data
    } else {
      this.sessionInfo = response // Fallback for old format
    }
    this.sessionId = this.sessionInfo!.session_id
    console.log(`Created session: ${this.sessionId}`)
    // Frontend UI handles permission SSE; disable internal polling
    
    return this.sessionInfo!
  }

  /**
   * Get current session ID
   */
  getSessionId(): string | undefined {
    return this.sessionId
  }

  /**
   * Send a message and get the complete response
   * Now supports multimodal content
   */
  async chat(prompt: string | ContentBlock[], context?: Record<string, any>): Promise<string> {
    if (!this.sessionId) {
      await this.connect()
    }

    // Process multimodal content if needed
    const processedPrompt = await this.processMultimodalContent(prompt)
    
    const responseParts: string[] = []
    
    for await (const event of this.streamChat(processedPrompt, context)) {
      if (event.type === 'message' && event.data?.role === 'assistant' && event.data.content) {
        responseParts.push(event.data.content)
      }
    }

    return responseParts.join('')
  }

  /**
   * Stream messages from the AI agent
   * Now supports multimodal content
   */
  async *streamChat(
    prompt: string | ContentBlock[],
    context?: Record<string, any>
  ): AsyncGenerator<StreamEvent> {
    if (!this.sessionId) {
      await this.connect()
    }

    // Process multimodal content if needed
    const processedPrompt = await this.processMultimodalContent(prompt)
    
    const res = await fetch(`${this.baseUrl}/api/sessions/${this.sessionId}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: processedPrompt,
        context: context,
        stream: true
      })
    })

    if (!res.ok) {
      throw new Error(`Query failed: ${res.statusText}`)
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    const MAX_BUFFER_SIZE = 10 * 1024 * 1024 // 10MB max buffer

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        
        // Check buffer size to prevent memory issues
        if (buffer.length > MAX_BUFFER_SIZE) {
          console.error('SSE buffer exceeded maximum size')
          yield {
            type: 'error',
            data: { error: 'Response too large - buffer exceeded 10MB' },
            timestamp: new Date().toISOString()
          }
          break
        }

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim()
            
            // Skip empty data
            if (!jsonStr || jsonStr === '{}') {
              continue
            }
            
            try {
              // Handle special case for large JSON
              if (jsonStr.length > 1048576) {
                console.warn('Large SSE message detected:', jsonStr.length, 'bytes')
                
                // Try to parse anyway, but catch errors
                try {
                  const event = JSON.parse(jsonStr)
                  yield event
                  
                  // Exit on complete
                  if (event.type === 'complete') {
                    return
                  }
                } catch (parseError) {
                  console.error('Failed to parse large JSON message:', parseError)
                  // Skip this message but continue processing
                  yield {
                    type: 'error',
                    data: { 
                      error: 'Response too large to process. Try uploading smaller images or asking for less detailed responses.',
                      details: String(parseError)
                    },
                    timestamp: new Date().toISOString()
                  }
                }
              } else {
                // Normal size message
                const event = JSON.parse(jsonStr)
                
                // Validate event structure
                if (!event || typeof event !== 'object') {
                  console.warn('Invalid event structure:', event)
                  continue
                }
                
                // Do not auto-handle permissions here; UI consumes SSE events
                if (event.type === 'permission_request') {
                  continue
                }
                
                yield event
                
                // Exit on complete
                if (event.type === 'complete') {
                  return
                }
              }
            } catch (e) {
              console.error('Failed to parse SSE line:', e, 'Line:', line)
              // Only yield error for non-parsing issues
              if (jsonStr && jsonStr !== '{}') {
                yield {
                  type: 'error',
                  data: { 
                    error: 'Failed to parse server response',
                    details: String(e)
                  },
                  timestamp: new Date().toISOString()
                }
              }
            }
          }
        }
      }
    } catch (error) {
      yield {
        type: 'error',
        data: { error: String(error) },
        timestamp: new Date().toISOString()
      }
      throw error
    }
  }

  /**
   * Upload a file as a resource
   */
  async uploadFile(
    file: File,
    tags?: string[],
    metadata?: Record<string, any>
  ): Promise<Resource> {
    if (!this.sessionId) {
      await this.connect()
    }

    const formData = new FormData()
    formData.append('file', file)
    if (tags && tags.length > 0) {
      formData.append('tags', tags.join(','))
    }
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }

    const res = await fetch(`${this.baseUrl}/api/sessions/${this.sessionId}/resources/upload`, {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || res.statusText
      throw new Error(`Failed to upload file: ${errorMessage}`)
    }

    const response = await res.json()
    // Handle new API response format
    const data = response.success && response.data ? response.data : response
    
    // Convert response to Resource format
    return {
      id: data.resource_id,
      type: data.resource_type,
      name: file.name,
      mime_type: data.mime_type,
      size: data.size,
      tags: tags || [],
      created_at: new Date().toISOString(),
      metadata: data.metadata || {}
    }
  }

  /**
   * Upload text content as a resource
   */
  async uploadText(
    content: string,
    filename: string = 'text.txt',
    tags?: string[],
    metadata?: Record<string, any>
  ): Promise<Resource> {
    const blob = new Blob([content], { type: 'text/plain' })
    const file = new File([blob], filename, { type: 'text/plain' })
    return this.uploadFile(file, tags, metadata)
  }

  /**
   * List resources in the session
   */
  async listResources(options?: {
    resourceType?: 'images' | 'texts' | 'docs' | 'codes'
    tags?: string[]
    limit?: number
  }): Promise<Resource[]> {
    if (!this.sessionId) {
      await this.connect()
    }

    const params = new URLSearchParams()
    if (options?.resourceType) {
      params.append('type', options.resourceType)
    }
    if (options?.tags && options.tags.length > 0) {
      params.append('tags', options.tags.join(','))
    }
    params.append('limit', String(options?.limit || 100))

    const res = await fetch(
      `${this.baseUrl}/api/sessions/${this.sessionId}/resources?${params}`
    )

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || res.statusText
      throw new Error(`Failed to list resources: ${errorMessage}`)
    }

    const response = await res.json()
    // Handle new API response format
    const data = response.success && response.data ? response.data : response
    
    // Handle paginated response structure
    const resources = data.items || data.resources || []
    
    // Convert to Resource format
    return resources.map((res: any) => ({
      id: res.id,
      type: res.type,
      name: res.name,
      mime_type: res.mime_type || res.metadata?.content_type || '',
      size: res.size || 0,
      tags: res.tags || (res.metadata?.tags || []),
      created_at: res.created || new Date().toISOString(),
      metadata: res.metadata || {}
    }))
  }

  /**
   * Delete a resource
   */
  async deleteResource(resourceId: string): Promise<void> {
    if (!this.sessionId) {
      await this.connect()
    }

    const res = await fetch(
      `${this.baseUrl}/api/sessions/${this.sessionId}/resources/${resourceId}`,
      { method: 'DELETE' }
    )

    if (!res.ok) {
      throw new Error(`Failed to delete resource: ${res.statusText}`)
    }
  }

  /**
   * Get events from the session
   */
  async getEvents(limit: number = 100): Promise<Event[]> {
    if (!this.sessionId) {
      await this.connect()
    }

    const res = await fetch(
      `${this.baseUrl}/api/sessions/${this.sessionId}/events?limit=${limit}`
    )

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || res.statusText
      throw new Error(`Failed to get events: ${errorMessage}`)
    }

    const response = await res.json()
    // Handle new API response format
    const data = response.success && response.data ? response.data : response
    // Handle paginated response structure
    return data.items || data.events || []
  }

  /**
   * Delete the current session
   */
  async deleteSession(): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session')
    }

    const res = await fetch(`${this.baseUrl}/api/sessions/${this.sessionId}`, {
      method: 'DELETE'
    })

    if (!res.ok) {
      throw new Error(`Failed to delete session: ${res.statusText}`)
    }

    this.sessionId = undefined
    this.sessionInfo = undefined
  }

  /**
   * Interrupt current processing
   */
  async interrupt(): Promise<void> {
    if (!this.sessionId) {
      throw new Error('No active session')
    }

    await fetch(`${this.baseUrl}/api/sessions/${this.sessionId}/interrupt`, {
      method: 'POST'
    })
  }

  /**
   * List available AI image styles
   */
  async listStyles(): Promise<any[]> {
    if (!this.sessionId) {
      await this.connect()
    }

    const res = await fetch(
      `${this.baseUrl}/api/sessions/${this.sessionId}/tool`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'list_styles',
          arguments: {}
        })
      }
    )

    if (!res.ok) {
      throw new Error(`Failed to list styles: ${res.statusText}`)
    }

    const response = await res.json()
    return response.result || []
  }

  /**
   * Process multimodal content and convert to text prompt with resource references
   */
  async processMultimodalContent(content: string | ContentBlock[]): Promise<string> {
    if (typeof content === 'string') {
      return content
    }

    const textParts: string[] = []
    
    for (const block of content) {
      if (block.type === 'text') {
        textParts.push(block.text || '')
      } else if (block.type === 'image' && block.image) {
        // Check if it's already a resource ID or @image// reference
        if (block.image.startsWith('@image//')) {
          textParts.push(block.image)
        } else if (block.image.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)) {
          // Looks like a resource ID
          textParts.push(`@image//${block.image}`)
        } else if (block.image.startsWith('data:') || block.image.length > 1000) {
          // Looks like base64, upload it
          const resource = await this.uploadBase64Image(block.image)
          textParts.push(`@image//${resource.id}`)
        } else if (block.image.startsWith('http://') || block.image.startsWith('https://')) {
          // It's a URL, download and upload
          const resource = await this.uploadImageFromUrl(block.image)
          textParts.push(`@image//${resource.id}`)
        } else {
          // Assume it's a filename or unknown format
          console.warn('Unknown image format:', block.image)
        }
      }
    }

    return textParts.join(' ')
  }

  /**
   * Upload base64 image
   */
  async uploadBase64Image(base64Data: string): Promise<Resource> {
    // Remove data URL prefix if present
    let mimeType = 'image/png'
    let data = base64Data
    
    if (base64Data.includes(',')) {
      const [header, content] = base64Data.split(',', 2)
      data = content
      const match = header.match(/data:([^;]+);/)
      if (match) {
        mimeType = match[1]
      }
    }

    // Convert base64 to blob
    const byteCharacters = atob(data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: mimeType })
    
    // Create file from blob
    const ext = mimeType.split('/')[1] || 'png'
    const file = new File([blob], `image.${ext}`, { type: mimeType })
    
    return this.uploadFile(file)
  }

  /**
   * Upload image from URL
   */
  async uploadImageFromUrl(url: string): Promise<Resource> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg'
    const file = new File([blob], filename, { type: blob.type })
    
    return this.uploadFile(file)
  }

  /**
   * Get detailed resource with content
   * Note: This needs API endpoint implementation on server side
   */
  async getResource(resourceId: string): Promise<DetailedResource> {
    if (!this.sessionId) {
      await this.connect()
    }

    // For now, return basic resource info
    // TODO: Implement server endpoint to get resource content
    const resources = await this.listResources()
    const resource = resources.find(r => r.id === resourceId)
    
    if (!resource) {
      throw new Error('Resource not found')
    }

    return {
      ...resource,
      content: undefined,
      base64: undefined,
      error: 'Detailed resource view not yet implemented on server'
    }
  }

  /**
   * Get detailed event with messages
   * Note: This needs API endpoint implementation on server side
   */
  async getEvent(eventId: string): Promise<DetailedEvent> {
    if (!this.sessionId) {
      await this.connect()
    }

    // For now, return basic event info
    // TODO: Implement server endpoint to get event messages
    const events = await this.getEvents()
    const event = events.find(e => e.id === eventId)
    
    if (!event) {
      throw new Error('Event not found')
    }

    return {
      ...event,
      messages: [],
      metadata: {},
      error: 'Detailed event view not yet implemented on server'
    }
  }

  /**
   * List memories from the session
   */
  async listMemories(options?: {
    category?: string
    priority?: 'High' | 'Medium' | 'Low'
    status?: 'Active' | 'Archived' | 'Deprecated'
    tag?: string
    limit?: number
  }): Promise<Memory[]> {
    if (!this.sessionId) {
      await this.connect()
    }

    const params = new URLSearchParams()
    if (options?.category) {
      params.append('category', options.category)
    }
    if (options?.priority) {
      params.append('priority', options.priority)
    }
    if (options?.status) {
      params.append('status', options.status)
    }
    if (options?.tag) {
      params.append('tag', options.tag)
    }
    params.append('limit', String(options?.limit || 50))

    const res = await fetch(
      `${this.baseUrl}/api/sessions/${this.sessionId}/memories?${params}`
    )

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || res.statusText
      throw new Error(`Failed to list memories: ${errorMessage}`)
    }

    const response = await res.json()
    // Handle new API response format
    const data = response.success && response.data ? response.data : response
    // Handle paginated response structure
    return data.items || data.memories || []
  }

  /**
   * Get detailed memory
   */
  async getMemory(memoryId: string): Promise<DetailedMemory> {
    if (!this.sessionId) {
      await this.connect()
    }

    const res = await fetch(
      `${this.baseUrl}/api/sessions/${this.sessionId}/memories/${memoryId}`
    )

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || res.statusText
      throw new Error(`Failed to get memory: ${errorMessage}`)
    }

    const response = await res.json()
    // Handle new API response format
    return response.success && response.data ? response.data : response
  }

  // ============================
  // Permission Control Methods
  // ============================

  /**
   * 开始权限轮询检查
   */
  private startPermissionPolling(): void {
    // 检查是否需要权限控制
    if (this.permissionPolling || 
        !this.config?.permission_control_mode || 
        this.config.permission_control_mode === 'disabled' ||
        this.config.permission_control_mode === 'yolo') {
      return
    }

    this.permissionPolling = true
    
    // 使用HTTP轮询而不是SSE，避免连接问题
    const pollForPermissions = async () => {
      if (!this.permissionPolling || !this.sessionId) {
        return
      }

      try {
        const response = await fetch(`${this.baseUrl}/api/sessions/${this.sessionId}/permissions`)
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data.permissions) {
            // 检查是否有待处理的权限请求
            const pendingPermissions = result.data.permissions.filter((p: any) => p.status === 'pending')
            
            for (const permission of pendingPermissions) {
              // 转换格式为PermissionRequest
              const permissionRequest: PermissionRequest = {
                id: permission.id,
                tool_name: permission.tool_name,
                tool_input: permission.tool_input,
                timestamp: permission.timestamp,
                session_id: permission.session_id,
                status: permission.status || 'pending',
                auto_decision: undefined
              }
              console.log('Found pending permission request:', permissionRequest)
              await this.handlePermissionRequest(permissionRequest)
            }
          }
        }
      } catch (error) {
        console.error('Error polling for permissions:', error)
      }

      // 如果权限轮询仍在运行，安排下次轮询
      if (this.permissionPolling) {
        this.permissionPollingInterval = setTimeout(pollForPermissions, 2000) // 每2秒轮询一次
      }
    }

    // 开始轮询
    pollForPermissions()
  }

  /**
   * 停止权限轮询
   */
  private stopPermissionPolling(): void {
    this.permissionPolling = false
    if (this.permissionPollingInterval) {
      clearTimeout(this.permissionPollingInterval)
      this.permissionPollingInterval = undefined
    }
    if (this.permissionEventSource) {
      this.permissionEventSource.close()
      this.permissionEventSource = undefined
    }
  }

  /**
   * 处理权限请求
   */
  private async handlePermissionRequest(request: PermissionRequest): Promise<void> {
    try {
      let decision: { approved: boolean; modified_input?: any; deny_reason?: string }

      if (this.permissionHandler) {
        // 使用用户提供的权限处理器
        decision = await this.permissionHandler(request)
      } else {
        // 使用默认权限处理器
        decision = this.defaultPermissionHandler(request)
      }

      // 发送决定到新API端点
      const response = await fetch(`${this.baseUrl}/api/sessions/${this.sessionId}/permissions/${request.id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: decision.approved ? 'approve' : 'deny',
          deny_reason: decision.deny_reason,
          modified_input: decision.modified_input
        })
      })

      if (!response.ok) {
        console.error('Failed to send permission decision via new API:', response.statusText)
        // 回退到旧API
        try {
          const legacyResponse = await fetch(`${this.baseUrl}/api/sessions/${this.sessionId}/permissions/${request.id}/decision`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: decision.approved ? 'approve' : 'deny',
              deny_reason: decision.deny_reason,
              modified_input: decision.modified_input
            })
          })
          
          if (!legacyResponse.ok) {
            console.error('Failed to send permission decision via legacy API:', legacyResponse.statusText)
          }
        } catch (legacyError) {
          console.error('Legacy API fallback failed:', legacyError)
        }
      }
    } catch (error) {
      console.error('Permission handling failed:', error)
      // 失败时默认拒绝
      try {
        await fetch(`${this.baseUrl}/api/sessions/${this.sessionId}/permissions/${request.id}/decision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deny',
            deny_reason: `Permission handler error: ${error}`
          })
        })
      } catch {
        // 忽略发送失败
      }
    }
  }

  /**
   * 默认权限处理器
   */
  private defaultPermissionHandler(_request: PermissionRequest): { approved: boolean; deny_reason?: string } {
    // No-op: permissions are handled by the app's UI via SSE dialog
    return { approved: false, deny_reason: 'Handled by UI' }
  }

  /**
   * 设置权限处理器
   */
  setPermissionHandler(handler: PermissionHandler): void {
    this.permissionHandler = handler
  }

  /**
   * 获取权限配置 (从 localStorage 读取)
   */
  async getPermissionConfig(): Promise<{
    permission_control_mode: string
    permission_enabled: boolean
  }> {
    // 从 localStorage 读取权限模式
    const mode = localStorage.getItem('aigents_permission_mode') || 'auto'
    return { 
      permission_control_mode: mode,
      permission_enabled: mode !== 'disabled'
    }
  }

  /**
   * 更新权限配置 (保存到 localStorage)
   */
  async updatePermissionConfig(mode: 'yolo' | 'auto' | 'ask' | 'disabled'): Promise<void> {
    // 只更新 localStorage，因为权限模式在会话创建时已经确定
    localStorage.setItem('aigents_permission_mode', mode)
    
    // 如果要应用新的权限模式，需要重新创建会话
    console.log(`Permission mode updated to: ${mode}. Please create a new session to apply changes.`)

    // 更新本地配置
    if (!this.config) {
      this.config = {}
    }
    this.config.permission_control_mode = mode

    // 重新启动或停止权限轮询
    this.stopPermissionPolling()
    this.startPermissionPolling()
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stopPermissionPolling()
  }
}

// ============================
// Convenience Functions
// ============================

/**
 * Quick one-off chat without session management
 */
export async function quickChat(
  prompt: string,
  baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
): Promise<string> {
  const agent = new AIGents({ baseUrl })
  await agent.connect()
  try {
    return await agent.chat(prompt)
  } finally {
    // Don't delete session, just let it be reused later
  }
}
