import React, { useRef, useEffect } from 'react'
import { MessageItem } from './MessageItem'
import type { ChatMessage, ToolResult } from '@/types'

export interface MessageListProps {
  messages: ChatMessage[]
  toolResults?: Record<string, ToolResult>
  childrenMessages?: Record<string, ChatMessage[]>
  expandedTasks?: Set<string>
  onToggleTaskExpanded?: (toolUseId: string) => void
  isLoading?: boolean
  isStreaming?: boolean
  enableStreamAnimation?: boolean
  sessionId?: string
  useStructuredContent?: boolean
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  toolResults = {},
  childrenMessages = {},
  expandedTasks = new Set(),
  onToggleTaskExpanded,
  isLoading,
  isStreaming,
  enableStreamAnimation = false,
  sessionId,
  useStructuredContent = true,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollToBottom = () => {
      let scrollContainer = containerRef.current?.parentElement
      while (scrollContainer && !scrollContainer.classList.contains('overflow-y-auto')) {
        scrollContainer = scrollContainer.parentElement
      }
      if (scrollContainer) {
        const { scrollHeight, clientHeight } = scrollContainer
        scrollContainer.scrollTo({ top: scrollHeight - clientHeight, behavior: 'smooth' })
      } else if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current
        containerRef.current.scrollTo({ top: scrollHeight - clientHeight, behavior: 'smooth' })
      }
    }
    if (isStreaming) {
      const timeoutId = setTimeout(scrollToBottom, 200)
      return () => clearTimeout(timeoutId)
    }
  }, [messages.length, isStreaming])

  const displayMessages = messages.filter((message) => {
    if (message.type === 'user' && Array.isArray(message.content)) {
      const allToolResults = message.content.every((block: any) => block.type === 'tool_result')
      if (allToolResults) return false
    }
    return true
  })

  const messageGroups: Array<{
    type: 'user' | 'assistant' | 'error' | 'system' | 'tool_call' | 'tool_result'
    messages: ChatMessage[]
  }> = []
  displayMessages.forEach((message) => {
    const lastGroup = messageGroups[messageGroups.length - 1]
    if (message.type === 'tool_call' || message.type === 'tool_result') {
      messageGroups.push({ type: message.type, messages: [message] })
    } else if (lastGroup && lastGroup.type === message.type) {
      lastGroup.messages.push(message)
    } else {
      messageGroups.push({ type: message.type, messages: [message] })
    }
  })

  if (displayMessages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="text-center p-8 text-muted-foreground">
          <p>No messages yet. Start by typing a message below.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background pl-2" ref={containerRef}>
      <div className="flex flex-col py-6 max-w-[54rem] mx-auto w-full box-border">
        {messageGroups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`} className="flex flex-col gap-6 px-4 box-border mb-4">
            {group.messages.map((message, messageIndex) => (
              <div key={message.messageId} className={enableStreamAnimation ? 'message-appear' : ''}>
                <MessageItem
                  message={message}
                  toolResults={toolResults}
                  childrenMessages={childrenMessages}
                  expandedTasks={expandedTasks}
                  onToggleTaskExpanded={onToggleTaskExpanded}
                  isFirstInGroup={messageIndex === 0}
                  isLastInGroup={messageIndex === group.messages.length - 1}
                  isStreaming={isStreaming}
                  sessionId={sessionId}
                  allMessages={messages}
                  useStructuredContent={useStructuredContent}
                />
              </div>
            ))}
            {((
              groupIndex < messageGroups.length - 1 && group.type === 'user' && messageGroups[groupIndex + 1].type === 'assistant'
            ) ||
              (group.type === 'user' && groupIndex === messageGroups.length - 1 && isStreaming)) && (
                <div className="h-px bg-border/20 w-full" />
              )}
          </div>
        ))}

        {!isLoading && isStreaming && messageGroups.length > 0 && (() => {
          const hasLoadingToolUse = displayMessages.some((message) => {
            if (message.type === 'assistant' && Array.isArray(message.content)) {
              return message.content.some((block: any) => {
                if (block.type === 'tool_use') {
                  const toolResult = toolResults[block.id]
                  return !toolResult || toolResult.status === 'pending'
                }
                return false
              })
            }
            return false
          })

          return !hasLoadingToolUse ? (
            <div className="flex items-start px-4 mt-2">
              <div className="w-4 h-5 flex-shrink-0 flex items-center justify-center text-foreground relative">
                <div className="w-2.5 h-2.5 bg-foreground rounded-full mt-3.5 animate-pulse" aria-label="Streaming indicator" />
                <div className="absolute left-1.5 -top-3 w-px h-5 bg-border hidden" />
              </div>
            </div>
          ) : null
        })()}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
