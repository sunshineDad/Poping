import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Agent,
  AgentCreateRequest,
  ChatSession,
  ChatMessage,
  ApiResponse,
  AgentListResponse,
  ChatSessionListResponse,
  PlaygroundState
} from '@/types/agent'

export const useAgentStore = defineStore('agent', () => {
  // 状态
  const agents = ref<Agent[]>([])
  const currentAgent = ref<Agent | null>(null)
  const sessions = ref<ChatSession[]>([])
  const currentSession = ref<ChatSession | null>(null)
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const isTyping = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const activeAgents = computed(() => 
    agents.value.filter(agent => agent.status === 'active')
  )

  const currentSessionMessages = computed(() => 
    currentSession.value 
      ? messages.value.filter(msg => msg.sessionId === currentSession.value!.id)
      : []
  )

  const playgroundState = computed<PlaygroundState>(() => ({
    currentAgent: currentAgent.value || undefined,
    currentSession: currentSession.value || undefined,
    messages: currentSessionMessages.value,
    isLoading: isLoading.value,
    isTyping: isTyping.value
  }))

  // Actions
  
  /**
   * 获取智能体列表
   */
  async function fetchAgents(page = 1, size = 20): Promise<AgentListResponse> {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/agents?page=${page}&size=${size}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<AgentListResponse> = await response.json()
      
      if (result.code === 200) {
        agents.value = result.data.agents
        return result.data
      } else {
        throw new Error(result.message || '获取智能体列表失败')
      }
    } catch (err) {
      console.warn('API调用失败，使用模拟数据:', err)
      
      // 提供模拟数据以便开发和测试
      const mockAgents: Agent[] = [
        {
          id: 'mock-1',
          name: 'AI助手',
          description: '通用AI助手，可以帮助您解答各种问题',
          systemPrompt: '你是一个有用的AI助手。',
          config: {
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000,
            mcpConfig: {
              enabled: false,
              tools: []
            },
            datasetConfig: {
              enabled: false,
              datasetIds: []
            },
            memoryConfig: {
              enabled: false,
              type: 'short_term',
              maxMessages: 50
            }
          },
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          memoryEnabled: true,
          isPublic: true,
          usageCount: 0
        },
        {
          id: 'mock-2',
          name: '代码助手',
          description: '专门用于编程和代码相关任务的AI助手',
          systemPrompt: '你是一个专业的编程助手。',
          config: {
            model: 'gpt-3.5-turbo',
            temperature: 0.1,
            maxTokens: 4000,
            mcpConfig: {
              enabled: false,
              tools: []
            },
            datasetConfig: {
              enabled: false,
              datasetIds: []
            },
            memoryConfig: {
              enabled: false,
              type: 'short_term',
              maxMessages: 50
            }
          },
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          memoryEnabled: false,
          isPublic: true,
          usageCount: 0
        }
      ]
      
      agents.value = mockAgents
      error.value = null // 清除错误状态，使用模拟数据
      
      return {
        agents: mockAgents,
        total: mockAgents.length,
        page: 1,
        size: 20
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建智能体
   */
  async function createAgent(agentData: AgentCreateRequest): Promise<Agent> {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'User-Id': localStorage.getItem('userId') || ''
        },
        body: JSON.stringify(agentData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<Agent> = await response.json()
      
      if (result.code === 200) {
        agents.value.unshift(result.data)
        return result.data
      } else {
        throw new Error(result.message || '创建智能体失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建智能体失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 根据ID获取智能体
   */
  async function fetchAgentById(id: string): Promise<Agent | null> {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/agents/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<Agent> = await response.json()
      
      if (result.code === 200) {
        return result.data
      } else {
        throw new Error(result.message || '获取智能体失败')
      }
    } catch (err) {
      console.warn('API调用失败，从本地数据查找:', err)
      return agents.value.find(agent => agent.id === id) || null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 设置当前活跃的智能体
   */
  function setActiveAgent(agentId: string) {
    const agent = agents.value.find(a => a.id === agentId)
    if (agent) {
      currentAgent.value = agent
    }
  }

  /**
   * 获取会话列表
   */
  async function fetchSessions(agentId: string): Promise<ChatSessionListResponse> {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/agents/${agentId}/sessions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<ChatSessionListResponse> = await response.json()
      
      if (result.code === 200) {
        sessions.value = result.data.sessions
        return result.data
      } else {
        throw new Error(result.message || '获取会话列表失败')
      }
    } catch (err) {
      console.warn('API调用失败，使用模拟数据:', err)
      
      // 提供模拟会话数据
      const mockSessions: ChatSession[] = [
        {
          id: 'session-1',
          agentId: 1,
          userId: 1,
          title: '新对话',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0
        }
      ]
      
      sessions.value = mockSessions
      error.value = null
      
      return {
        sessions: mockSessions,
        total: mockSessions.length
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建新会话
   */
  async function createSession(agentId: string, title?: string): Promise<ChatSession> {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/agents/${agentId}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: title || '新对话' })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<ChatSession> = await response.json()
      
      if (result.code === 200) {
        sessions.value.unshift(result.data)
        currentSession.value = result.data
        return result.data
      } else {
        throw new Error(result.message || '创建会话失败')
      }
    } catch (err) {
      console.warn('API调用失败，创建模拟会话:', err)
      
      const agent = agents.value.find(a => a.id === agentId)
      
      // 创建模拟会话
      const newSession: ChatSession = {
        id: `session-${Date.now()}`,
        agentId: Number(agentId),
        userId: 1,
        title: title || `新对话 ${sessions.value.length + 1}`,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
        agentName: agent?.name
      }
      
      sessions.value.unshift(newSession)
      currentSession.value = newSession
      error.value = null
      
      return newSession
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 设置当前会话
   */
  function setCurrentSession(sessionId: string) {
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      currentSession.value = session
    }
  }

  /**
   * 发送消息
   */
  async function sendMessage(content: string): Promise<void> {
    if (!currentSession.value || !currentAgent.value) {
      throw new Error('没有选择智能体或会话')
    }

    try {
      isTyping.value = true
      error.value = null

      // 添加用户消息
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sessionId: currentSession.value.id,
        role: 'user',
        content,
        createdAt: new Date().toISOString()
      }
      
      messages.value.push(userMessage)

      const response = await fetch(`/api/sessions/${currentSession.value.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ApiResponse<ChatMessage> = await response.json()

      if (result.code === 200) {
        messages.value.push(result.data)
      } else {
        throw new Error(result.message || '发送消息失败')
      }
    } catch (err) {
      console.warn('API调用失败，使用模拟响应:', err)
      
      // 模拟AI响应
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sessionId: currentSession.value.id,
        role: 'assistant',
        content: '这是一个模拟的AI响应。实际部署时，这里会是真实的AI回复。',
        createdAt: new Date().toISOString()
      }
      
      // 模拟打字延迟
      setTimeout(() => {
        messages.value.push(aiMessage)
        isTyping.value = false
      }, 1000)
      
      error.value = null
      return
    } finally {
      if (!error.value) {
        isTyping.value = false
      }
    }
  }

  /**
   * 获取会话消息
   */
  async function fetchMessages(sessionId: string): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/sessions/${sessionId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<ChatMessage[]> = await response.json()
      
      if (result.code === 200) {
        messages.value = result.data
      } else {
        throw new Error(result.message || '获取消息失败')
      }
    } catch (err) {
      console.warn('API调用失败，清空消息列表:', err)
      messages.value = []
      error.value = null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 清除错误状态
   */
  function clearError() {
    error.value = null
  }

  /**
   * 重置状态
   */
  function reset() {
    agents.value = []
    currentAgent.value = null
    sessions.value = []
    currentSession.value = null
    messages.value = []
    isLoading.value = false
    isTyping.value = false
    error.value = null
  }

  return {
    // 状态
    agents,
    currentAgent,
    sessions,
    currentSession,
    messages,
    isLoading,
    isTyping,
    error,
    
    // 计算属性
    activeAgents,
    currentSessionMessages,
    playgroundState,
    
    // 方法
    fetchAgents,
    createAgent,
    fetchAgentById,
    setActiveAgent,
    fetchSessions,
    createSession,
    setCurrentSession,
    sendMessage,
    fetchMessages,
    clearError,
    reset
  }
})