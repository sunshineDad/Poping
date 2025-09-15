import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { api } from '@services'
import { AIGents, type StreamEvent, type Message as AIGentsMessage, type ContentBlock, type PermissionRequest } from '@/lib/aigents'
import { MessageList } from '@features/message-list'
import { ConversationHeader } from './components/ConversationHeader'
import { ComposerCore as Composer, type ComposerRef } from '@features/composer/core'
import { ModeSelector } from '@shared/ui'
import { PermissionDialog } from '@shared/ui'
import { Toaster } from '@shared/ui/Toast'
import { ResourceSidebar } from './components/ResourceSidebar'
import type { ChatMessage, ToolResult } from '@shared/types'
import { TagManager } from '@shared/utils'

interface ConversationMessage extends AIGentsMessage { timestamp: string; workingDirectory?: string }

export function ConversationView() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const composerRef = useRef<ComposerRef>(null)
  const { cuiSessionId, workingDirectory: initialWorkingDirectory, initialPrompt, pendingFiles, model, permissionMode, isNewConversation } = (location.state as any) || {}
  const [client, setClient] = useState<AIGents | null>(null)
  const initialMessageSentRef = useRef(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [conversationTitle, setConversationTitle] = useState('New Conversation')
  const [workingDirectory, setWorkingDirectory] = useState(initialWorkingDirectory || './')
  const [chatMode, setChatMode] = useState<'conversation' | 'canvas'>('conversation')
  const [toolResults, setToolResults] = useState<Record<string, ToolResult>>({})
  const [currentPermissionRequest, setCurrentPermissionRequest] = useState<PermissionRequest | null>(null)
  const [isResourceSidebarOpen, setIsResourceSidebarOpen] = useState(false)
  const [showConversationContent, setShowConversationContent] = useState(false)
  const firstAssistantIndexRef = useRef<number | null>(null)

  useEffect(() => {
    const initializeConversation = async () => {
      try {
        const aigentsClient = await api.getOrCreateAIGentsClient(sessionId, permissionMode as 'yolo' | 'auto' | 'ask')
        setClient(aigentsClient)
        if (!isNewConversation && sessionId) {
          const saved = localStorage.getItem(`messages_${sessionId}`)
          if (saved) {
            const parsed = JSON.parse(saved)
            setMessages(parsed.map((msg: any) => ({ id: msg.id || `msg_${Date.now()}_${Math.random()}`, messageId: msg.messageId || msg.id, type: msg.role || msg.type, content: msg.content, timestamp: msg.timestamp || new Date().toISOString(), workingDirectory: msg.workingDirectory })))
            if (parsed.length > 0 && parsed[0].role === 'user') {
              const first = parsed[0].content
              if (typeof first === 'string') setConversationTitle(first.substring(0, 50) + (first.length > 50 ? '...' : ''))
              else if (Array.isArray(first) && first.length > 0) {
                const t = first.find((i: any) => typeof i === 'string' || i.text)
                if (t) { const text = typeof t === 'string' ? t : t.text; setConversationTitle(text.substring(0, 50) + (text.length > 50 ? '...' : '')) }
              }
            }
          }
        }
        setIsLoading(false)
        setTimeout(() => setShowConversationContent(true), 300)
        return aigentsClient
      } catch (error) {
        console.error('Failed to initialize conversation:', error)
        setIsLoading(false)
      }
    }
    initializeConversation().then((aigentsClient) => {
      if (isNewConversation && initialPrompt && aigentsClient && !initialMessageSentRef.current) {
        initialMessageSentRef.current = true
        setTimeout(() => { sendInitialMessage(aigentsClient, initialPrompt) }, 100)
      }
    })
  }, [sessionId])

  // Subscribe to permission SSE events (can_use_tool flow)
  useEffect(() => {
    if (!sessionId) return
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
    const es = new EventSource(`${baseUrl}/api/sessions/${sessionId}/permissions/events`)
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data)
        if (data?.type === 'permission_request') {
          const req = data.data
          setCurrentPermissionRequest({
            id: req.id,
            streamingId: sessionId,
            toolName: req.tool_name,
            toolInput: req.tool_input,
            timestamp: req.timestamp,
            status: req.status,
          } as any)
        } else if (data?.type === 'permission_update') {
          // Close dialog on update
          setCurrentPermissionRequest(null)
        }
      } catch (e) {
        // ignore malformed events
      }
    }
    es.onerror = () => {
      // network hiccups are fine; browser will try to reconnect
    }
    return () => { es.close() }
  }, [sessionId])

  // Handle MCP UI events: actions and pagination
  useEffect(() => {
    const onMcpAction = (e: Event) => {
      const ce = e as CustomEvent
      const detail = ce.detail || {}
      const tool: string | undefined = detail.tool
      const input: Record<string, any> | undefined = detail.input
      if (!tool) return
      // Build a clear instruction to the Agent to use the tool with provided input
      const payload = input ? JSON.stringify(input) : '{}'
      const message = `请使用工具 ${tool}，参数：${payload}`
      handleSendMessage(message, workingDirectory, undefined, permissionMode)
    }

    const onMcpPage = (e: Event) => {
      const ce = e as CustomEvent
      const detail = ce.detail || {}
      const toolName: string | undefined = detail.toolName
      const page = detail.page
      const perPage = detail.perPage
      if (!toolName || !page) return
      const paging: any = { page }
      if (perPage) paging.per_page = perPage
      const message = `请使用工具 ${toolName}，参数：${JSON.stringify(paging)} 来获取更多结果。`
      handleSendMessage(message, workingDirectory, undefined, permissionMode)
    }

    window.addEventListener('mcpAction', onMcpAction as EventListener)
    window.addEventListener('mcpPageRequest', onMcpPage as EventListener)
    return () => {
      window.removeEventListener('mcpAction', onMcpAction as EventListener)
      window.removeEventListener('mcpPageRequest', onMcpPage as EventListener)
    }
  }, [workingDirectory, permissionMode])

  useEffect(() => {
    if (sessionId && messages.length > 0) {
      const save = messages.map((m) => ({ id: m.id, messageId: m.messageId, role: m.type, type: m.type, content: m.content, timestamp: m.timestamp, workingDirectory: m.workingDirectory }))
      localStorage.setItem(`messages_${sessionId}`, JSON.stringify(save))
      const conversations = JSON.parse(localStorage.getItem('conversations') || '[]')
      const idx = conversations.findIndex((c: any) => c.id === sessionId)
      const conv = { id: sessionId, title: conversationTitle, timestamp: new Date().toISOString(), preview: typeof messages[0]?.content === 'string' ? (messages[0].content as string).substring(0, 100) : undefined }
      if (idx >= 0) conversations[idx] = conv; else conversations.unshift(conv)
      localStorage.setItem('conversations', JSON.stringify(conversations))
    }
  }, [messages, sessionId, conversationTitle])

  const sendInitialMessage = async (aigentsClient: AIGents, text: string) => {
    if (!text.trim()) return
    let processedText = text
    if (sessionId && (text.includes('@image://tmp_') || text.includes('[cmd:'))) {
      try {
        await api.getOrCreateAIGentsClient(sessionId)
        const editorContent = TagManager.parseText(text)
        processedText = await TagManager.exportForSubmission(editorContent, sessionId)
      } catch (error) {
        console.error('Failed to process pending resources:', error)
        processedText = text
      }
    }
    const userMessage: ChatMessage = { id: `msg_${Date.now()}_user`, messageId: `msg_${Date.now()}_user`, type: 'user', content: processedText, timestamp: new Date().toISOString(), workingDirectory }
    setMessages([userMessage])
    setIsStreaming(true)
    try {
      for await (const event of aigentsClient.streamChat(processedText)) handleStreamEvent(event, `session_${Date.now()}`)
    } catch (error) {
      console.error('Failed to send initial message:', error)
      const errMsg: ChatMessage = { id: `error_${Date.now()}`, messageId: `error_${Date.now()}`, type: 'error', content: `Error: ${error}`, timestamp: new Date().toISOString(), workingDirectory }
      setMessages((prev) => [...prev, errMsg])
    } finally { setIsStreaming(false) }
  }

  const handleSendMessage = async (text: string, workingDir?: string, model?: string, permissionMode?: string) => {
    if (!client || !text.trim() || isStreaming) return
    const effectiveWorkingDir = workingDir || workingDirectory
    const userMessage: ChatMessage = { id: `msg_${Date.now()}_user`, messageId: `msg_${Date.now()}_user`, type: 'user', content: text, timestamp: new Date().toISOString(), workingDirectory: effectiveWorkingDir }
    setMessages((prev) => [...prev, userMessage])
    setIsStreaming(true)
    try { for await (const event of client.streamChat(text)) handleStreamEvent(event, `session_${Date.now()}`) }
    catch (error) { console.error('Failed to send message:', error); setMessages((prev) => [...prev, { id: `error_${Date.now()}`, messageId: `error_${Date.now()}`, type: 'error', content: `Error: ${error}`, timestamp: new Date().toISOString(), workingDirectory: effectiveWorkingDir }]) }
    finally { setIsStreaming(false) }
  }

  const handleStreamEvent = (event: StreamEvent, messageId: string) => {
    switch (event.type) {
      case 'start': {
        // Reset timeline anchor for this query
        firstAssistantIndexRef.current = null
        break
      }
      case 'message': {
        const { role, content, tool_uses, tool_results } = event.data || {}
        if (role === 'assistant' && (Array.isArray(content) || typeof content === 'string')) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.type === 'assistant' && m.content === content)
            if (!exists) {
              const next = [...prev, { id: `assistant_${Date.now()}_${Math.random()}`, messageId: `assistant_${Date.now()}_${Math.random()}`, type: 'assistant', content, timestamp: new Date().toISOString(), workingDirectory } as any]
              if (firstAssistantIndexRef.current === null) firstAssistantIndexRef.current = next.length - 1
              return next
            }
            return prev
          })
        } else if (content) {
          // Non-assistant text content
          setMessages((prev) => {
            const exists = prev.some((m) => m.type === 'assistant' && m.content === content)
            if (!exists) return [...prev, { id: `assistant_${Date.now()}_${Math.random()}`, messageId: `assistant_${Date.now()}_${Math.random()}`, type: 'assistant', content, timestamp: new Date().toISOString(), workingDirectory }]
            return prev
          })
        }
        if (tool_uses && Array.isArray(tool_uses)) {
          for (const toolUse of tool_uses) {
            setToolResults((prev) => ({ ...prev, [toolUse.id]: { id: toolUse.id, status: 'pending', output: null } }))
            setMessages((prev) => {
              if (!prev.some((m) => m.type === 'tool_call' && (m as any).toolUseId === toolUse.id)) {
                return [
                  ...prev,
                  {
                    id: `tool_call_${toolUse.id}_${Date.now()}`,
                    messageId: `tool_call_${toolUse.id}_${Date.now()}`,
                    type: 'tool_call',
                    content: '',
                    timestamp: new Date().toISOString(),
                    workingDirectory,
                    toolUseId: toolUse.id,
                    toolName: toolUse.name || toolUse.id || 'Tool',
                    toolInput: toolUse.input,
                  } as any,
                ]
              }
              return prev
            })
          }
        }
        if (tool_results && Array.isArray(tool_results)) {
          for (const result of tool_results) {
            setToolResults((prev) => ({ ...prev, [result.tool_use_id]: { id: result.tool_use_id, status: result.is_error ? 'error' : 'success', output: result.content, error: result.is_error ? String(result.content) : undefined, result: result.content } }))
            setMessages((prev) => {
              if (!prev.some((m) => m.type === 'tool_result' && (m as any).toolResultId === result.tool_use_id)) {
                return [...prev, { id: `tool_result_${result.tool_use_id}_${Date.now()}`, messageId: `tool_result_${result.tool_use_id}_${Date.now()}`, type: 'tool_result', content: result.content || 'No result', timestamp: new Date().toISOString(), workingDirectory, toolResultId: result.tool_use_id, isError: result.is_error || false } as any]
              }
              return prev
            })
          }
        }
        break
      }
      case 'result': {
        const data: any = event.data || {}
        const timeline = data.timeline
        if (timeline && Array.isArray(timeline)) {
          setMessages((prev) => {
            if (firstAssistantIndexRef.current !== null && prev[firstAssistantIndexRef.current]) {
              const updated = [...prev]
              updated[firstAssistantIndexRef.current] = { ...updated[firstAssistantIndexRef.current], timeline }
              return updated
            }
            return prev
          })
        }
        break
      }
      case 'permission_request': { setCurrentPermissionRequest(event.data) ; break }
      case 'error': {
        setMessages((prev) => [...prev, { id: `error_${Date.now()}`, messageId: `error_${Date.now()}`, type: 'error', content: String(event.data?.error || 'Unknown error'), timestamp: new Date().toISOString(), workingDirectory }])
        break
      }
    }
  }

  const handlePermissionDecision = async (approved: boolean, options?: { modified_input?: Record<string, any>; deny_reason?: string }) => {
    try {
      if (!sessionId || !currentPermissionRequest) return
      await api.handlePermissionDecision(sessionId, currentPermissionRequest.id, approved, options)
      setCurrentPermissionRequest(null)
    } catch (e) { console.error('Failed to handle permission decision:', e) }
  }

  const handleFileUpload = async (files: FileList): Promise<string[]> => {
    try {
      if (!sessionId) return []
      const results = await Promise.all(Array.from(files).map((file) => api.uploadFileToSession(sessionId, file, [])))
      return results.map((r) => r.resourceTag)
    } catch (e) { console.error('File upload failed:', e); return [] }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-3 w-3 border border-transparent border-t-gray-300 mx-auto" style={{ borderWidth: '0.5px' }} />
          <p className="mt-4 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <Toaster />
      <div className={`relative z-50 ${showConversationContent ? 'conversation-fade-in stagger-delay-1' : 'opacity-0'}`}>
        <ConversationHeader title={conversationTitle} sessionId={sessionId} subtitle={{ date: new Date().toLocaleDateString(), repo: sessionId }} onTitleUpdate={setConversationTitle} onBack={() => navigate('/')} onResourcesToggle={() => setIsResourceSidebarOpen(!isResourceSidebarOpen)} />
      </div>
      <div className={`flex-1 overflow-y-auto ${showConversationContent ? 'conversation-fade-in stagger-delay-2' : 'opacity-0'}`}>
        <MessageList messages={messages} toolResults={toolResults} isLoading={false} isStreaming={isStreaming} enableStreamAnimation={true} sessionId={sessionId} />
      </div>
      <div className={`w-full px-4 pb-4 ${showConversationContent ? 'conversation-fade-in stagger-delay-3' : 'opacity-0'}`}>
        <div className="max-w-3xl mx-auto">
          <Composer ref={composerRef} workingDirectory={workingDirectory} onSubmit={handleSendMessage} isLoading={isStreaming} placeholder="Type your message..." showDirectorySelector={false} showModelSelector={false} enableFileAutocomplete={true} useStructuredEditor={false} useUnifiedEditor={true} recentDirectories={{}} getMostRecentWorkingDirectory={() => workingDirectory} sessionSelector={<ModeSelector mode={chatMode} onModeChange={setChatMode} />} onFetchFileSystem={async (directory: string) => { const response = await api.listDirectory({ path: directory, recursive: true, respectGitignore: true }); return response.entries.map((e: any) => ({ ...e, type: e.type as 'file' | 'directory', depth: 0 })) }} onFetchCommands={async (wd?: string) => { const response = await api.getCommands(wd || './'); return response.commands }} enableFileUpload={true} currentSessionId={sessionId} onFileUpload={handleFileUpload} showStopButton={isStreaming} onStop={() => client?.interrupt()} disabled={isStreaming} useConversationEditor={true} />
        </div>
      </div>
      {currentPermissionRequest && (
        <PermissionDialog
          request={{
            id: currentPermissionRequest.id,
            streamingId: sessionId || '',
            toolName: (currentPermissionRequest as any).toolName ?? (currentPermissionRequest as any).tool_name,
            toolInput: (currentPermissionRequest as any).toolInput ?? (currentPermissionRequest as any).tool_input,
            timestamp: currentPermissionRequest.timestamp,
            status: currentPermissionRequest.status,
          } as any}
          onDecision={(decision) => {
            handlePermissionDecision(decision.action === 'approve', {
              modified_input: (decision as any).modifiedInput,
              deny_reason: (decision as any).denyReason,
            })
          }}
        />
      )}
      <ResourceSidebar isOpen={isResourceSidebarOpen} onClose={() => setIsResourceSidebarOpen(false)} sessionId={sessionId} />
    </div>
  )
}
