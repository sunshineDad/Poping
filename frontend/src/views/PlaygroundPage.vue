<template>
  <div class="playground-page">
    <div class="playground-content">
      <!-- 左侧边栏 -->
      <aside class="sidebar">
        <!-- 智能体选择器 -->
        <AgentSelector
          :agents="availableAgents"
          :selected-agent-id="selectedAgent?.id ? String(selectedAgent.id) : null"
          :is-loading="isLoadingAgents"
          @select-agent="handleSelectAgent"
          @create-agent="handleCreateAgent"
        />
        
        <!-- 会话历史 -->
        <SessionHistory
          :sessions="sessions"
          :selected-session-id="currentSessionId"
          :is-loading="isLoadingSessions"
          :error="sessionError"
          @select-session="handleSelectSession"
          @rename-session="handleRenameSession"
          @delete-session="handleDeleteSession"
          @clear-all="handleClearAllSessions"
          @retry="loadSessions"
        />
      </aside>


      <!-- 主聊天区域 -->
      <main class="chat-area">
        <!-- 聊天界面 -->
        <ChatInterface
          :agent="selectedAgent"
          :session="currentSession"
          :messages="messages"
          :is-loading="isLoadingMessages"
          :is-sending="isSending"
          :error="messageError"
          @send-message="handleSendMessage"
          @clear-session="handleClearSession"
          @export-session="handleExportSession"
          @retry="loadMessages"
        />
      </main>
    </div>


    <!-- 智能体选择模态框 -->
    <AgentSelectorModal
      v-if="showAgentSelector"
      :agents="availableAgents"
      :is-loading="isLoadingAgents"
      :search-query="agentSearchQuery"
      @select="handleSelectAgent"
      @close="showAgentSelector = false"
      @search="handleSearchAgents"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAgentStore } from '@/stores/agent'
import type { Agent, ChatSession, AgentCreateRequest } from '@/types/agent'
import AgentSelector from '@/components/AgentSelector.vue'
import SessionHistory from '@/components/SessionHistory.vue'
import ChatInterface from '@/components/ChatInterface.vue'
import AgentSelectorModal from '@/components/AgentSelectorModal.vue'

// Store
const agentStore = useAgentStore()

// 响应式数据
const showAgentSelector = ref(false)
const agentSearchQuery = ref('')
const isLoadingAgents = ref(false)
const isLoadingSessions = ref(false)
const isLoadingMessages = ref(false)
const isSending = ref(false)
const sessionError = ref<string | null>(null)
const messageError = ref<string | null>(null)

// 计算属性
const selectedAgent = computed(() => agentStore.currentAgent)
const availableAgents = computed(() => agentStore.agents)
const sessions = computed(() => agentStore.sessions)
const currentSession = computed(() => agentStore.currentSession)
const currentSessionId = computed(() => agentStore.currentSession?.id || null)
const messages = computed(() => agentStore.currentSessionMessages)

// 生命周期
onMounted(async () => {
  await loadInitialData()
})

// 方法
async function loadInitialData() {
  try {
    isLoadingAgents.value = true
    await agentStore.fetchAgents()
    
    if (agentStore.agents.length > 0 && !agentStore.currentAgent) {
      // 设置第一个智能体为当前智能体
      await agentStore.setActiveAgent(agentStore.agents[0].id)
    }
    
    await loadSessions()
  } catch (error) {
    console.error('初始化数据失败:', error)
  } finally {
    isLoadingAgents.value = false
  }
}

async function loadSessions() {
  if (!selectedAgent.value) return
  
  try {
    isLoadingSessions.value = true
    sessionError.value = null
    await agentStore.fetchSessions(selectedAgent.value.id)
  } catch (error) {
    console.error('加载会话失败:', error)
    sessionError.value = '加载会话失败'
  } finally {
    isLoadingSessions.value = false
  }
}

async function loadMessages() {
  if (!currentSession.value) return
  
  try {
    isLoadingMessages.value = true
    // 使用现有的 fetchMessages 方法
    await agentStore.fetchMessages(currentSession.value.id)
  } catch (error) {
    console.error('加载消息失败:', error)
    messageError.value = '加载消息失败'
  } finally {
    isLoadingMessages.value = false
  }
}

// 智能体相关处理
async function handleSelectAgent(agent: Agent) {
  try {
    await agentStore.setActiveAgent(agent.id)
    showAgentSelector.value = false
    await loadSessions()
  } catch (error) {
    console.error('选择智能体失败:', error)
  }
}

async function handleCreateAgent(agentData: AgentCreateRequest) {
  try {
    const newAgent = await agentStore.createAgent(agentData)
    await agentStore.setActiveAgent(newAgent.id)
    showAgentSelector.value = false
    await loadSessions()
  } catch (error) {
    console.error('创建智能体失败:', error)
    throw error
  }
}

function handleSearchAgents(query: string) {
  agentSearchQuery.value = query
  // TODO: 实现搜索逻辑
}

// 会话相关处理
async function handleSelectSession(session: ChatSession) {
  try {
    agentStore.setCurrentSession(session.id)
    await loadMessages()
  } catch (error) {
    console.error('选择会话失败:', error)
  }
}

async function handleRenameSession(sessionId: string, title: string) {
  try {
    // 简单的本地重命名
    const sessionIndex = agentStore.sessions.findIndex(s => s.id === sessionId)
    if (sessionIndex !== -1) {
      agentStore.sessions[sessionIndex].title = title
    }
  } catch (error) {
    console.error('重命名会话失败:', error)
  }
}

async function handleDeleteSession(session: ChatSession) {
  try {
    // 从 store 中删除会话
    agentStore.sessions = agentStore.sessions.filter(s => s.id !== session.id)
    // 如果删除的是当前会话，清空当前会话
    if (agentStore.currentSession?.id === session.id) {
      agentStore.currentSession = null
    }
  } catch (error) {
    console.error('删除会话失败:', error)
  }
}

async function handleClearAllSessions() {
  try {
    // 清空所有会话
    agentStore.sessions = []
    agentStore.currentSession = null
  } catch (error) {
    console.error('清空所有会话失败:', error)
  }
}

// 消息相关处理
async function handleSendMessage(content: string) {
  if (!selectedAgent.value) {
    throw new Error('请先选择一个智能体')
  }
  
  try {
    isSending.value = true
    messageError.value = null
    
    // 如果没有当前会话，创建一个新会话
    if (!currentSession.value) {
      const newSession = await agentStore.createSession(
        selectedAgent.value.id,
        content.length > 30 ? content.substring(0, 30) + '...' : content
      )
      agentStore.setCurrentSession(newSession.id)
    }
    
    await agentStore.sendMessage(content)
  } catch (error) {
    console.error('发送消息失败:', error)
    messageError.value = '发送消息失败'
    throw error
  } finally {
    isSending.value = false
  }
}

async function handleClearSession() {
  if (!currentSession.value) return
  
  try {
    // 清空当前会话的消息 - 通过 store 的 messages 状态
    agentStore.messages = agentStore.messages.filter(msg => msg.sessionId !== currentSession.value!.id)
  } catch (error) {
    console.error('清空会话失败:', error)
  }
}

function handleExportSession() {
  if (!currentSession.value || messages.value.length === 0) {
    throw new Error('没有可导出的对话内容')
  }
  
  // TODO: 实现导出功能
  const exportData = {
    session: currentSession.value,
    messages: messages.value,
    agent: selectedAgent.value,
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `conversation-${currentSession.value.id}-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}


</script>

<style scoped>
.playground-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

.playground-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-area {
  flex: 1;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 280px;
  }
}

@media (max-width: 768px) {
  .playground-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    overflow-y: auto;
  }
}

@media (max-width: 480px) {
  .sidebar {
    max-height: 35vh;
  }
}
</style>