import React from 'react'
import { MessageList } from '@features/message-list'
import type { ChatMessage } from '@shared/types'

interface Props {
  title?: string
  messages: ChatMessage[]
  sessionId?: string
  style: React.CSSProperties
  loading?: boolean
  isOpen?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function SessionPreviewPanel({
  title,
  messages,
  style,
  loading,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  sessionId,
}: Props) {
  if (!isOpen) return null
  return (
    <div
      className="session-preview-panel bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 smooth-transition"
      style={{
        ...style,
        willChange: 'transform, opacity',
        transform: 'translateZ(0)',
        zIndex: 2147483647,
        // Softer, lighter, more elegant asymmetric shadow
        // Left: very subtle separation; Right: gentle, diffused depth
        boxShadow: '-2px 0 6px rgba(0,0,0,0.05), 10px 0 24px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Scoped styles for thin black scrollbar */}
      <style>{`
        .session-preview-panel .preview-scroll { scrollbar-width: thin; scrollbar-color: #00000022 transparent; }
        .session-preview-panel .preview-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .session-preview-panel .preview-scroll::-webkit-scrollbar-track { background: transparent; }
        .session-preview-panel .preview-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.6); border-radius: 2px; }
        .session-preview-panel .preview-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.8); }
      `}</style>
      <div className="h-full flex flex-col">
        <div className="p-3">
          <div className="text-sm font-medium truncate">{title || 'No recent activity'}</div>
          {/* Lighter, shorter divider under title */}
          <div className="mt-2 h-px bg-border/20 w-2/3" />
        </div>
        <div className="flex-1 overflow-y-auto preview-scroll">
          {loading ? (
            <div className="p-3 text-sm text-muted-foreground">Loading…</div>
          ) : messages && messages.length > 0 ? (
            <div className="max-h-full">
              <MessageList
                messages={messages}
                isLoading={false}
                isStreaming={false}
                enableStreamAnimation={false}
                sessionId={sessionId}
                useStructuredContent={true}
              />
            </div>
          ) : (
            <div className="p-3 text-sm text-muted-foreground">No messages yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
