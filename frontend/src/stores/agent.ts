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
            model: {
              provider: 'openai',
              name: 'gpt-4',
              temperature: 0.7,
              maxTokens: 2000
            },
            features: {
              memories: true,
              events: false,
              docs: false,
              texts: false,
              images: false,
              retrieval: false
            },
            system: {
              systemPrompt: '你是一个有用的AI助手。'
            }
          },
          creatorId: 1,
          isPublic: true,
          status: 'active' as const,
          usageCount: 0,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          memoryEnabled: true
        },
        {
          id: 'mock-2',
          name: '代码助手',
          description: '专门用于编程和代码相关任务的AI助手',
          systemPrompt: '你是一个专业的编程助手。',
          config: {
            model: {
              provider: 'openai',
              name: 'gpt-3.5-turbo',
              temperature: 0.1,
              maxTokens: 4000
            },
            features: {
              memories: false,
              events: false,
              docs: false,
              texts: false,
              images: false,
              retrieval: false
            },
            system: {
              systemPrompt: '你是一个专业的编程助手。'
            }
          },
          creatorId: 1,
          isPublic: true,
          status: 'active' as const,
          usageCount: 0,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          memoryEnabled: false
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
   * 获取智能体详情
   */
  async function fetchAgentById(id: number): Promise<Agent> {
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
        throw new Error(result.message || '获取智能体详情失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取智能体详情失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 设置当前智能体
   */
  function setCurrentAgent(agent: Agent | null) {
    currentAgent.value = agent
    // 切换智能体时清空当前会话
    currentSession.value = null
    messages.value = []
  }

  /**
   * 通过ID设置活跃智能体
   */
  async function setActiveAgent(agentId: number) {
    try {
      const agent = agents.value.find(a => a.id === agentId)
      if (agent) {
        setCurrentAgent(agent)
      } else {
        // 如果本地没有找到，尝试从服务器获取
        const fetchedAgent = await fetchAgentById(agentId)
        setCurrentAgent(fetchedAgent)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '设置智能体失败'
      throw err
    }
  }

  /**
   * 获取会话列表
   */
  async function fetchSessions(agentId?: number) {
    try {
      isLoading.value = true
      error.value = null
      
      const url = agentId 
        ? `/api/playground/sessions?agentId=${agentId}`
        : '/api/playground/sessions'
      
      const response = await fetch(url, {
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
      error.value = err instanceof Error ? err.message : '获取会话列表失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建新会话
   */
  async function createSession(agentId: number, title?: string): Promise<ChatSession> {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch('/api/playground/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          agentId,
          title: title || `与 ${currentAgent.value?.name || '智能体'} 的对话`
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<ChatSession> = await response.json()
      
      if (result.code === 200) {
        sessions.value.unshift(result.data)
        return result.data
      } else {
        throw new Error(result.message || '创建会话失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建会话失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 设置当前会话
   */
  function setCurrentSession(session: ChatSession | null) {
    currentSession.value = session
    if (session) {
      // 加载会话消息
      fetchSessionMessages(session.id)
    } else {
      messages.value = []
    }
  }

  /**
   * 获取会话消息
   */
  async function fetchSessionMessages(sessionId: string) {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`/api/playground/sessions/${sessionId}/messages`, {
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
        // 更新消息列表，保留其他会话的消息
        messages.value = messages.value.filter(msg => msg.sessionId !== sessionId)
        messages.value.push(...result.data)
        return result.data
      } else {
        throw new Error(result.message || '获取消息失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取消息失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 发送消息
   */
  async function sendMessage(content: string): Promise<ChatMessage> {
    if (!currentSession.value || !currentAgent.value) {
      throw new Error('请先选择智能体和会话')
    }

    try {
      isTyping.value = true
      error.value = null
      
      // 添加用户消息到本地状态
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId: currentSession.value.id,
        role: 'user',
        content,
        createdAt: new Date().toISOString()
      }
      messages.value.push(userMessage)
      
      const response = await fetch(`/api/playground/sessions/${currentSession.value.id}/messages`, {
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
        // 替换临时消息
        const index = messages.value.findIndex(msg => msg.id === userMessage.id)
        if (index !== -1) {
          messages.value[index] = result.data
        }
        return result.data
      } else {
        throw new Error(result.message || '发送消息失败')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发送消息失败'
      throw err
    } finally {
      isTyping.value = false
    }
  }

  /**
   * 添加助手消息（用于流式响应）
   */
  function addAssistantMessage(message: ChatMessage) {
    messages.value.push(message)
  }

  /**
   * 更新消息内容（用于流式响应）
   */
  function updateMessage(messageId: string, content: string) {
    const message = messages.value.find(msg => msg.id === messageId)
    if (message) {
      message.content = content
    }
  }

  /**
   * 清空错误状态
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
    
    // Actions
    fetchAgents,
    createAgent,
    fetchAgentById,
    setCurrentAgent,
    setActiveAgent,
    fetchSessions,
    createSession,
    setCurrentSession,
    fetchSessionMessages,
    sendMessage,
    addAssistantMessage,
    updateMessage,
    clearError,
    reset
  }
})