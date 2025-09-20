/**
 * [文件概览]
 * - 目的: 智能体状态管理，使用统一AI接口服务
 * - 数据流: 组件 → store → aiService → 后端API
 * - 核心数据: agents, sessions, messages, currentAgent
 * - 关系: @/services/aiService.ts → AI接口调用, @/components/ChatInterface.vue → UI交互
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { aiService } from '@/services/aiService'
import type { AISession, AIMessage } from '@/types/ai'

// 智能体信息接口
interface Agent {
  id: number
  name: string
  description: string
  avatar?: string
  category: string
  isActive: boolean
  capabilities: string[]
  sessionId?: string  // 当前会话ID
}

export const useAgentStore = defineStore('agent', () => {
  // 状态
  const agents = ref<Agent[]>([])
  const currentAgent = ref<Agent | null>(null)
  const sessions = ref<AISession[]>([])
  const currentSession = ref<AISession | null>(null)
  const messages = ref<AIMessage[]>([])
  const isLoading = ref(false)
  const isTyping = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const activeAgents = computed(() => 
    agents.value.filter(agent => agent.isActive)
  )

  const currentSessionMessages = computed(() => 
    currentSession.value 
      ? messages.value.filter(msg => msg.id.includes(currentSession.value!.session_id))
      : []
  )

  // Actions

  /**
   * [函数: fetchAgents]
   * - 输入: 无
   * - 输出: Promise<void>
   * - 角色: 获取智能体列表（模拟数据）
   * - 逻辑: 1. 设置加载状态 2. 返回模拟智能体数据 3. 清除错误状态
   */
  async function fetchAgents(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      
      // 模拟智能体数据
      agents.value = [
        {
          id: 1,
          name: 'Claude Assistant',
          description: '通用AI助手，擅长对话、分析和创作',
          avatar: '🤖',
          category: '通用助手',
          isActive: true,
          capabilities: ['对话', '分析', '创作', '编程']
        },
        {
          id: 2,
          name: 'Code Expert',
          description: '专业编程助手，精通多种编程语言',
          avatar: '💻',
          category: '编程助手',
          isActive: true,
          capabilities: ['编程', '调试', '代码审查', '架构设计']
        },
        {
          id: 3,
          name: 'Data Analyst',
          description: '数据分析专家，擅长数据处理和可视化',
          avatar: '📊',
          category: '数据分析',
          isActive: true,
          capabilities: ['数据分析', '可视化', '统计', '机器学习']
        }
      ]
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取智能体列表失败'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * [函数: selectAgent]
   * - 输入: Agent对象
   * - 输出: Promise<void>
   * - 角色: 选择智能体并创建会话
   * - 逻辑: 1. 设置当前智能体 2. 创建新会话 3. 关联会话ID
   */
  async function selectAgent(agent: Agent): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      
      currentAgent.value = agent
      
      // 创建新的AI会话
      const session = await aiService.createSession({
        metadata: {
          title: `与 ${agent.name} 的对话`,
          agentId: agent.id,
          agentName: agent.name
        }
      })
      
      // 更新智能体的会话ID
      agent.sessionId = session.session_id
      currentSession.value = session
      
      // 清空当前消息
      messages.value = []
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '选择智能体失败'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * [函数: fetchSessions]
   * - 输入: 无
   * - 输出: Promise<void>
   * - 角色: 获取会话列表
   * - 逻辑: 1. 调用AI服务获取会话 2. 更新会话列表 3. 处理错误
   */
  async function fetchSessions(): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      
      const sessionList = await aiService.listSessions()
      sessions.value = sessionList
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取会话列表失败'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * [函数: loadSession]
   * - 输入: 会话ID
   * - 输出: Promise<void>
   * - 角色: 加载指定会话及其消息
   * - 逻辑: 1. 获取会话信息 2. 加载会话消息 3. 设置当前会话
   */
  async function loadSession(sessionId: string): Promise<void> {
    try {
      isLoading.value = true
      error.value = null
      
      // 获取会话信息
      const session = await aiService.getSession(sessionId)
      currentSession.value = session
      
      // 加载会话消息（暂时使用空数组，因为API规范中没有获取历史消息的接口）
      messages.value = []
      
      // 根据会话元数据找到对应的智能体
      if (session.metadata?.agentId) {
        const agent = agents.value.find(a => a.id === session.metadata.agentId)
        if (agent) {
          currentAgent.value = agent
          agent.sessionId = sessionId
        }
      }
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载会话失败'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * [函数: sendMessage]
   * - 输入: 消息内容
   * - 输出: Promise<void>
   * - 角色: 发送消息并处理AI响应
   * - 逻辑: 1. 添加用户消息 2. 调用AI查询 3. 处理流式响应 4. 添加AI回复
   */
  async function sendMessage(content: string): Promise<void> {
    if (!currentSession.value) {
      throw new Error('没有活动会话')
    }

    try {
      isTyping.value = true
      error.value = null
      
      // 添加用户消息
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      }
      messages.value.push(userMessage)
      
      // 准备AI回复消息
      const assistantMessage: AIMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString()
      }
      messages.value.push(assistantMessage)
      
      // 发送查询并处理流式响应
      await aiService.queryStream(currentSession.value.session_id, {
        query: content
      }, (event) => {
        switch (event.type) {
          case 'message':
            if (event.data.role === 'assistant') {
              assistantMessage.content += event.data.content
            }
            break
          case 'error':
            error.value = event.data.error
            break
        }
      })
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发送消息失败'
      // 移除失败的消息
      messages.value = messages.value.filter(msg => !msg.id.startsWith('assistant-'))
    } finally {
      isTyping.value = false
    }
  }

  /**
   * [函数: updateSessionTitle]
   * - 输入: 会话ID, 新标题
   * - 输出: Promise<void>
   * - 角色: 更新会话标题
   * - 逻辑: 1. 调用AI服务更新标题 2. 更新本地会话数据
   */
  async function updateSessionTitle(sessionId: string, title: string): Promise<void> {
    try {
      error.value = null
      
      await aiService.updateSessionTitle(sessionId, title)
      
      // 更新本地会话数据
      const session = sessions.value.find(s => s.session_id === sessionId)
      if (session) {
        session.title = title
        session.metadata = { ...session.metadata, title }
      }
      
      if (currentSession.value?.session_id === sessionId) {
        currentSession.value.title = title
        currentSession.value.metadata = { ...currentSession.value.metadata, title }
      }
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新会话标题失败'
    }
  }

  /**
   * [函数: deleteSession]
   * - 输入: 会话ID
   * - 输出: Promise<void>
   * - 角色: 删除会话
   * - 逻辑: 1. 调用AI服务删除会话 2. 更新本地会话列表 3. 清理当前会话
   */
  async function deleteSession(sessionId: string): Promise<void> {
    try {
      error.value = null
      
      await aiService.deleteSession(sessionId)
      
      // 从本地列表中移除
      sessions.value = sessions.value.filter(s => s.session_id !== sessionId)
      
      // 如果删除的是当前会话，清理状态
      if (currentSession.value?.session_id === sessionId) {
        currentSession.value = null
        messages.value = []
        if (currentAgent.value) {
          currentAgent.value.sessionId = undefined
        }
      }
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除会话失败'
    }
  }

  /**
   * [函数: clearError]
   * - 输入: 无
   * - 输出: void
   * - 角色: 清除错误状态
   * - 逻辑: 1. 重置错误状态
   */
  function clearError(): void {
    error.value = null
  }

  /**
   * [函数: reset]
   * - 输入: 无
   * - 输出: void
   * - 角色: 重置所有状态
   * - 逻辑: 1. 清空所有状态数据
   */
  function reset(): void {
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
    
    // 方法
    fetchAgents,
    selectAgent,
    fetchSessions,
    loadSession,
    sendMessage,
    updateSessionTitle,
    deleteSession,
    clearError,
    reset
  }
})