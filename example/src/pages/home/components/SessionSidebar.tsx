import React from 'react'
import { Trash2, Clock, Hash } from 'lucide-react'
import type { SessionConfig } from '@/services/api'

interface Props {
  sessions: (SessionConfig & { displayName?: string })[]
  loading?: boolean
  error?: string | null
  selectedSessionId: string | null
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  onReload: () => void
  onSelect: (sessionId: string | null) => void
  onDelete: (sessionId: string) => void
  onHoverStart?: (sessionId: string, rect: DOMRect) => void
  onHoverEnd?: () => void
}

export function SessionSidebar({
  sessions,
  loading,
  error,
  selectedSessionId,
  searchQuery,
  onSearchQueryChange,
  onReload,
  onSelect,
  onDelete,
  onHoverStart,
  onHoverEnd,
}: Props) {
  return (
    <div className="h-full flex flex-col bg-white/95 backdrop-blur-sm border-gray-200/60">
      <div className="px-4 py-3 animate-slideUp delay-100">
        <div className="relative flex items-center ml-3">
          <svg width="16" height="16" viewBox="0 0 24 24" className="absolute left-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="w-full text-center pl-8 pr-8 py-2 text-sm bg-transparent border-0 border-b border-gray-200 focus:outline-none focus:border-gray-400 rounded-none placeholder-gray-400 transition-colors"
            style={{ borderBottomWidth: '1px' }}
          />
        </div>
      </div>

      {loading && (
        <div className="p-3 text-sm text-muted-foreground">Loading…</div>
      )}
      {error && (
        <div className="p-3 text-sm text-red-500">{error}</div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar animate-slideUp delay-200">
        {sessions.length === 0 && !loading ? (
          <div className="px-4 py-4 text-center text-gray-500 text-sm">No sessions found</div>
        ) : (
          <div className="space-y-1 px-2">
            {sessions.map((session, index) => (
              <div
                key={session.sessionId}
                onClick={() => onSelect(session.sessionId)}
                onMouseEnter={(e) => {
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                  onHoverStart?.(session.sessionId, rect)
                }}
                onMouseLeave={() => onHoverEnd?.()}
                className={`group p-3 ml-3 rounded-xl cursor-pointer transition-all duration-200 relative session-item-enter session-delay-${Math.min(index + 1, 10)} ${
                  selectedSessionId === session.sessionId
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100/60 border border-blue-200/60'
                    : 'hover:bg-gray-50/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-medium text-gray-800 truncate text-sm">{formatTitle(session.name, session.sessionId)}</h3>
                      {session.conversationCount > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100/80 px-1.5 py-0.5 rounded-md">
                          <Hash className="h-3 w-3" />
                          {session.conversationCount}
                        </span>
                      )}
                    </div>
                    {session.preview && session.preview !== 'No preview available' && session.preview.trim() && (
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">{session.preview}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(session.lastAccessedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        if (confirm(`Are you sure you want to delete session "${session.name || 'Unnamed Session'}"?`)) {
                          onDelete(session.sessionId)
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600"
                      title="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {selectedSessionId === session.sessionId && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer controls removed per request (no refresh, no divider) */}
    </div>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function formatTitle(name?: string, sessionId?: string) {
  if (name && !name.startsWith('New Chat') && !name.startsWith('Session ')) {
    let clean = name
    if (clean.startsWith('Query: ')) clean = clean.substring(7)
    else if (clean.startsWith('Query：')) clean = clean.substring(6)
    return clean
  }
  return sessionId || 'Unnamed Session'
}
