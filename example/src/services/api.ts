// API service for AIGents integration
import { AIGents, type SessionInfo, type Resource, type Event, type Memory, type StreamEvent, type ContentBlock } from '../lib/aigents'

export interface SessionConfig {
  sessionId: string;
  name: string;
  workingDirectory: string;
  description?: string;
  lastConversationId?: string;
  conversationCount: number;
  lastAccessedAt: string;
  createdAt?: string;
  preview?: string;
}

export interface ConversationDetailsResponse {
  messages: Array<{
    uuid: string;
    type: 'user' | 'assistant' | 'system';
    message: any;
    timestamp: string;
    cwd?: string;
    isSidechain?: boolean;
  }>;
}

// Global AIGents client manager
class AIGentsManager {
  private clients: Map<string, AIGents> = new Map()
  private currentClient: AIGents | null = null
  
  async getOrCreateClient(sessionId?: string, permissionMode?: 'yolo' | 'auto' | 'ask'): Promise<AIGents> {
    if (sessionId && this.clients.has(sessionId)) {
      this.currentClient = this.clients.get(sessionId)!
      return this.currentClient
    }
    
    const storedMode = localStorage.getItem('aigents_permission_mode') as ('yolo' | 'auto' | 'ask' | 'disabled' | null)
    const effectivePermissionMode = (permissionMode
      || (storedMode === 'disabled' ? 'ask' : storedMode)
      || 'auto') as ('yolo' | 'auto' | 'ask')
    
    // Load default features for new sessions (from Settings → MCPs)
    let defaultFeatures: Record<string, boolean> | undefined
    try {
      const stored = localStorage.getItem('aigents_default_features')
      if (stored) defaultFeatures = JSON.parse(stored)
    } catch {}

    const client = new AIGents({
      sessionId,
      features: defaultFeatures || { events: true, images: true, image_ai: true, retrieval: true },
      permissionControlMode: effectivePermissionMode
    })
    
    await client.connect()
    const clientSessionId = client.getSessionId()
    if (clientSessionId) {
      this.clients.set(clientSessionId, client)
      this.currentClient = client
    }
    
    return client
  }
  
  getCurrentClient(): AIGents | null {
    return this.currentClient
  }
  
  getAllSessions(): SessionConfig[] {
    const sessions: SessionConfig[] = []
    const storedSessions = JSON.parse(localStorage.getItem('aigents_sessions') || '[]')
    
    for (const session of storedSessions) {
      sessions.push({
        sessionId: session.id,
        name: session.name || 'New Session',
        workingDirectory: session.workingDirectory || './',
        description: session.description,
        lastConversationId: session.lastConversationId,
        conversationCount: session.conversationCount || 0,
        lastAccessedAt: session.lastAccessedAt || session.createdAt || new Date().toISOString(),
        createdAt: session.createdAt,
        preview: session.preview
      })
    }
    
    return sessions.sort((a, b) => 
      new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
    )
  }
  
  saveSession(sessionConfig: SessionConfig): void {
    const sessions = JSON.parse(localStorage.getItem('aigents_sessions') || '[]')
    const existingIndex = sessions.findIndex((s: any) => s.id === sessionConfig.sessionId)
    
    const sessionData = {
      id: sessionConfig.sessionId,
      name: sessionConfig.name,
      workingDirectory: sessionConfig.workingDirectory,
      description: sessionConfig.description,
      lastConversationId: sessionConfig.lastConversationId,
      conversationCount: sessionConfig.conversationCount,
      lastAccessedAt: sessionConfig.lastAccessedAt,
      createdAt: sessionConfig.createdAt || new Date().toISOString(),
      preview: sessionConfig.preview
    }
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = sessionData
    } else {
      sessions.unshift(sessionData)
    }
    
    localStorage.setItem('aigents_sessions', JSON.stringify(sessions))
  }
  
  deleteSession(sessionId: string): void {
    const sessions = JSON.parse(localStorage.getItem('aigents_sessions') || '[]')
    const filtered = sessions.filter((s: any) => s.id !== sessionId)
    localStorage.setItem('aigents_sessions', JSON.stringify(filtered))
    
    // Also delete the client
    if (this.clients.has(sessionId)) {
      const client = this.clients.get(sessionId)!
      client.destroy()
      this.clients.delete(sessionId)
      
      if (this.currentClient === client) {
        this.currentClient = null
      }
    }
  }
}

const aigentsManager = new AIGentsManager()

export const api = {
  // Session management
  async getSessions(search?: string) {
    // 1) Try backend API for real sessions
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

      const parseBody = (body: any): any[] => (
        Array.isArray(body) ? body
        : Array.isArray(body?.data?.sessions) ? body.data.sessions
        : Array.isArray(body?.data) ? body.data
        : Array.isArray(body?.sessions) ? body.sessions
        : []
      )

      type Attempt = { url: string; init?: RequestInit }
      const attempts: Attempt[] = [
        { url: `${baseUrl}/api/sessions` },
        { url: `${baseUrl}/api/sessions/list` },
        { url: `${baseUrl}/api/sessions/list`, init: { method: 'POST' } },
        { url: `${baseUrl}/api/sessions`, init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'list' }) } },
        { url: `${baseUrl}/api/cui/sessions` },
      ]

      let raw: any[] | null = null
      for (const a of attempts) {
        try {
          const res = await fetch(a.url, a.init)
          if (!res.ok) continue
          const body = await res.json().catch(() => ({}))
          const arr = parseBody(body)
          raw = arr
          break
        } catch {
          // ignore and try next
        }
      }

      if (Array.isArray(raw)) {
        const fromBackend: SessionConfig[] = raw.map((s: any) => ({
          sessionId: s.session_id || s.id || s.sessionId,
          name: s.name || s.title || `Session ${s.session_id || s.id || s.sessionId}`,
          workingDirectory: s.working_directory || s.cwd || s.workingDirectory || './',
          description: s.description,
          lastConversationId: s.last_conversation_id || s.lastConversationId,
          conversationCount: s.conversation_count ?? s.conversationCount ?? 0,
          lastAccessedAt: s.last_accessed_at || s.updated_at || s.lastAccessedAt || s.created_at || new Date().toISOString(),
          createdAt: s.created_at || s.createdAt,
          preview: s.preview || s.summary,
        })).filter((s: SessionConfig) => !!s.sessionId)

        let filtered = fromBackend
        if (search) {
          const q = search.toLowerCase()
          filtered = fromBackend.filter(session =>
            (session.name || '').toLowerCase().includes(q) ||
            (session.preview || '').toLowerCase().includes(q) ||
            (session.workingDirectory || '').toLowerCase().includes(q)
          )
        }
        return { data: { sessions: filtered } }
      }
    } catch (error) {
      console.warn('Backend sessions discovery failed, falling back to local cache:', error)
    }

    // 2) Fallback to local cache (existing behavior)
    try {
      const sessions = aigentsManager.getAllSessions()
      let filtered = sessions
      if (search) {
        const q = search.toLowerCase()
        filtered = sessions.filter(session =>
          session.name.toLowerCase().includes(q) ||
          session.preview?.toLowerCase().includes(q) ||
          session.workingDirectory.toLowerCase().includes(q)
        )
      }
      return { data: { sessions: filtered } }
    } catch (error) {
      console.error('Failed to get sessions from local cache:', error)
      return { data: { sessions: [] } }
    }
  },

  // Permissions config
  async getPermissionsConfig(sessionId: string) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const res = await fetch(`${baseUrl}/api/sessions/${sessionId}/permissions/config`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json().catch(() => ({}))
    return body?.data || {}
  },

  // MCP feature config
  async getAvailableFeatures(): Promise<Record<string, { description?: string; tools?: string[] }>> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const res = await fetch(`${baseUrl}/api/sessions/features`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json().catch(() => ({}))
    // body.data is a dictionary { featureKey: description }
    const data = body?.data || {}
    return data as Record<string, { description?: string; tools?: string[] }>
  },

  async getSessionConfig(sessionId: string) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const res = await fetch(`${baseUrl}/api/sessions/${sessionId}/config`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json().catch(() => ({}))
    return body?.data || {}
  },

  async updateSessionConfig(sessionId: string, config: { features: Record<string, boolean> }) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const res = await fetch(`${baseUrl}/api/sessions/${sessionId}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: config.features })
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json().catch(() => ({}))
    return body?.data || {}
  },

  async updatePermissionsConfig(sessionId: string, config: { mode?: 'ask'|'auto'|'yolo'; auto?: any; overrides?: Record<string, 'allow'|'prompt'> }) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const res = await fetch(`${baseUrl}/api/sessions/${sessionId}/permissions/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const body = await res.json().catch(() => ({}))
    return body?.data || {}
  },

  async updatePermissionMode(sessionId: string, mode: 'ask'|'auto'|'yolo') {
    return api.updatePermissionsConfig(sessionId, { mode })
  },

  async getSessionInfo(sessionId: string) {
    try {
      const sessions = aigentsManager.getAllSessions()
      const session = sessions.find(s => s.sessionId === sessionId)
      
      if (!session) {
        // Try to get from AIGents backend
        const client = await aigentsManager.getOrCreateClient(sessionId)
        const sessionInfo = {
          sessionId: client.getSessionId() || sessionId,
          name: `Session ${sessionId}`,
          workingDirectory: './',
          conversationCount: 0,
          lastAccessedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
        aigentsManager.saveSession(sessionInfo)
        return { data: sessionInfo }
      }
      
      return { data: session }
    } catch (error) {
      console.error('Failed to get session info:', error)
      throw error
    }
  },

  async createSession(config: Partial<SessionConfig>) {
    try {
      const client = await aigentsManager.getOrCreateClient()
      const sessionId = client.getSessionId()
      
      if (!sessionId) throw new Error('Failed to create session')
      
      const newSession: SessionConfig = {
        sessionId,
        name: config.name || 'New Session',
        workingDirectory: config.workingDirectory || './',
        description: config.description,
        conversationCount: 0,
        lastAccessedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      
      aigentsManager.saveSession(newSession)
      return { data: newSession }
    } catch (error) {
      console.error('Failed to create session:', error)
      throw error
    }
  },

  async deleteSessionInfo(sessionId: string) {
    try {
      // Delete from AIGents backend
      const client = await aigentsManager.getOrCreateClient(sessionId)
      await client.deleteSession()
      
      // Delete from local storage
      aigentsManager.deleteSession(sessionId)
      
      return { success: true }
    } catch (error) {
      console.error('Failed to delete session:', error)
      // Even if backend fails, delete from local storage
      aigentsManager.deleteSession(sessionId)
      return { success: true }
    }
  },

  // Conversation management
  async startConversation(config: {
    workingDirectory: string
    initialPrompt: string
    model?: string
    permissionMode?: string
    cuiSessionId?: string
  }) {
    try {
      // Get or create client for the session
      const client = await aigentsManager.getOrCreateClient(config.cuiSessionId)
      const sessionId = client.getSessionId()
      
      if (!sessionId) throw new Error('Failed to get session ID')
      
      // Update session info
      const sessions = aigentsManager.getAllSessions()
      const session = sessions.find(s => s.sessionId === sessionId)
      if (session) {
        session.lastAccessedAt = new Date().toISOString()
        session.conversationCount = (session.conversationCount || 0) + 1
        aigentsManager.saveSession(session)
      }
      
      return {
        sessionId,
        streamingId: `stream_${sessionId}_${Date.now()}`,
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
      throw error
    }
  },

  async getConversationDetails(conversationId: string): Promise<ConversationDetailsResponse> {
    try {
      // Get conversation messages from localStorage if available
      const messages = JSON.parse(localStorage.getItem(`messages_${conversationId}`) || '[]')
      
      if (messages.length > 0) {
        return {
          messages: messages.map((msg: any, index: number) => ({
            uuid: msg.id || `msg_${index}`,
            type: msg.role || msg.type,
            message: { content: msg.content },
            timestamp: msg.timestamp || new Date().toISOString(),
            cwd: msg.workingDirectory,
            isSidechain: false
          }))
        }
      }
      
      // Return empty if no messages found
      return { messages: [] }
    } catch (error) {
      console.error('Failed to get conversation details:', error)
      return { messages: [] }
    }
  },

  // File system
  async listDirectory(options: { path: string; recursive?: boolean; respectGitignore?: boolean }) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      entries: [
        { name: 'src', type: 'directory', path: `${options.path}/src` },
        { name: 'package.json', type: 'file', path: `${options.path}/package.json` },
        { name: 'README.md', type: 'file', path: `${options.path}/README.md` },
        { name: 'tsconfig.json', type: 'file', path: `${options.path}/tsconfig.json` },
      ]
    };
  },

  // Commands
  async getCommands(workingDirectory: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      commands: [
        { name: 'npm install', description: 'Install dependencies' },
        { name: 'npm run dev', description: 'Start development server' },
        { name: 'npm run build', description: 'Build for production' },
      ]
    };
  },

  // File upload
  async uploadFileToSession(sessionId: string, file: File, tags: string[]) {
    try {
      const client = await aigentsManager.getOrCreateClient(sessionId)
      const resource = await client.uploadFile(file, tags)
      
      // Determine resource type based on file extension
      const fileExtension = resource.name.split('.').pop()?.toLowerCase()
      let resourceType = 'doc' // default
      
      if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExtension || '')) {
        resourceType = 'image'
      } else if (['txt', 'md', 'json', 'csv'].includes(fileExtension || '')) {
        resourceType = 'text'
      }
      
      return {
        resourceId: resource.id,
        filename: resource.name,
        size: resource.size,
        tags: resource.tags,
        // Return the formatted resource tag directly
        resourceTag: `@${resourceType}://${resource.id}`
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      throw error
    }
  },

  // Start streaming conversation 
  async startStreamingConversation(request: {
    cuiSessionId?: string
    workingDirectory: string
    initialPrompt: string
    model?: string
    permissionMode?: string
  }) {
    return api.startConversation(request)
  },

  // Send message to streaming
  async sendMessageToStreaming(streamingId: string, message: string | ContentBlock[]) {
    try {
      const client = aigentsManager.getCurrentClient()
      if (!client) throw new Error('No active client')
      
      // Stream will be handled by streamChat method
      console.log(`Message queued for streaming: ${streamingId}`)
      return { success: true }
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  },
  
  // Stream chat messages
  async *streamChat(prompt: string | ContentBlock[], context?: Record<string, any>): AsyncGenerator<StreamEvent> {
    const client = aigentsManager.getCurrentClient()
    if (!client) throw new Error('No active client')
    
    for await (const event of client.streamChat(prompt, context)) {
      yield event
    }
  },

  // Conversation CRUD
  async getConversation(sessionId: string) {
    try {
      const messages = JSON.parse(localStorage.getItem(`messages_${sessionId}`) || '[]')
      const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
      const conversation = conversations.find((c: any) => c.id === sessionId)
      
      return {
        data: {
          messages,
          title: conversation?.title || 'New Conversation',
          conversationSummary: conversation?.preview || null
        }
      }
    } catch (error) {
      console.error('Failed to get conversation:', error)
      return {
        data: {
          messages: [],
          title: 'New Conversation',
          conversationSummary: null
        }
      }
    }
  },
  
  // Get AIGents client
  getAIGentsClient(): AIGents | null {
    return aigentsManager.getCurrentClient()
  },
  
  // Get or create AIGents client
  async getOrCreateAIGentsClient(sessionId?: string, permissionMode?: 'yolo' | 'auto' | 'ask'): Promise<AIGents> {
    return aigentsManager.getOrCreateClient(sessionId, permissionMode)
  },

  // Send permission decision to backend
  async handlePermissionDecision(sessionId: string, requestId: string, approved: boolean, options?: { modified_input?: Record<string, any>; deny_reason?: string }) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const url = `${baseUrl}/api/sessions/${sessionId}/permissions/${requestId}/decision`
    const body = {
      action: approved ? 'approve' : 'deny',
      ...(options?.modified_input ? { modified_input: options.modified_input } : {}),
      ...(options?.deny_reason ? { deny_reason: options.deny_reason } : {}),
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json().catch(() => ({}))
  },

  // Audio transcription
  async transcribeAudio(audioBase64: string, mimeType: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      text: "This is a mock transcription of the audio."
    };
  },

  // Resource management
  async getSessionResources(sessionId: string) {
    try {
      const client = await aigentsManager.getOrCreateClient(sessionId)
      const resources = await client.listResources()
      
      return {
        success: true,
        data: resources
      }
    } catch (error) {
      console.error('Failed to get session resources:', error)
      return {
        success: false,
        error: String(error)
      }
    }
  },

  async getSessionMemories(sessionId: string) {
    try {
      const client = await aigentsManager.getOrCreateClient(sessionId)
      const memories = await client.listMemories()
      
      return {
        success: true,
        data: memories
      }
    } catch (error) {
      console.error('Failed to get session memories:', error)
      return {
        success: false,
        error: String(error)
      }
    }
  },

  async getSessionEvents(sessionId: string) {
    try {
      const client = await aigentsManager.getOrCreateClient(sessionId)
      const events = await client.getEvents()
      
      return {
        success: true,
        data: events
      }
    } catch (error) {
      console.error('Failed to get session events:', error)
      return {
        success: false,
        error: String(error)
      }
    }
  },

  // Update session title
  async updateSessionTitle(sessionId: string, newTitle: string) {
    try {
      // Call backend API to update session title
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/sessions/${sessionId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Update local session data
      const sessions = aigentsManager.getAllSessions()
      const session = sessions.find(s => s.sessionId === sessionId)
      
      if (session) {
        const updatedSession = {
          ...session,
          name: newTitle,
          lastAccessedAt: new Date().toISOString()
        }
        
        aigentsManager.saveSession(updatedSession)
        
        // Also update conversations list
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
        const existingIndex = conversations.findIndex((c: any) => c.id === sessionId)
        
        if (existingIndex >= 0) {
          conversations[existingIndex].title = newTitle
          localStorage.setItem('conversations', JSON.stringify(conversations))
        }
      }
      
      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('Failed to update session title:', error)
      return {
        success: false,
        error: String(error)
      }
    }
  },

  async getResourceContent(resourceId: string, sessionId?: string) {
    try {
      let response;
      let url;
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      
      // Try session-specific endpoint first if sessionId provided
      if (sessionId) {
        url = `${baseUrl}/api/sessions/${sessionId}/resources/${resourceId}/content`;
        console.log('Fetching resource content from session endpoint:', url);
        response = await fetch(url);
      } else {
        // Fallback to global resource endpoint
        url = `${baseUrl}/api/resources/${resourceId}/content`;
        console.log('Fetching resource content from global endpoint:', url);
        response = await fetch(url);
      }
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
      }
      
      const result = await response.json()
      console.log('API response data:', result);
      
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Failed to fetch resource content:', error)
      return { success: false, error }
    }
  },

  // Image AI styles
  async getImageStyles() {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/image-ai/styles`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return {
        success: true,
        data: result.data?.styles || []
      };
    } catch (error) {
      console.error('Failed to get image styles:', error);
      return {
        success: false,
        error: String(error),
        data: []
      };
    }
  }
};
