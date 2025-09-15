import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { ChatMessage } from '@/types'

interface PreviewData {
  sessionId: string
  title?: string
  messages: ChatMessage[]
}

export function useSessionPreview(sidebarWidth = 380) {
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null)
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null)
  const [data, setData] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const closeTimerRef = useRef<number | null>(null)

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const readLocalPreview = (sessionId: string): PreviewData | null => {
    try {
      const raw = localStorage.getItem(`messages_${sessionId}`)
      if (!raw || raw === '[]') return null
      const parsed = JSON.parse(raw)
      // Convert to ChatMessage to reuse the same renderers as Conversation
      const all: ChatMessage[] = parsed.map((m: any, idx: number) => ({
        id: m.id || `msg_${idx}`,
        messageId: m.messageId || m.id || `msg_${idx}`,
        type: m.role || m.type || 'assistant',
        content: m.content,
        timestamp: m.timestamp || new Date().toISOString(),
        workingDirectory: m.workingDirectory,
      }))
      // Select a recent window but keep preceding user for context
      const windowSize = 10
      let start = Math.max(0, all.length - windowSize)
      if (start > 0 && all[start].type === 'assistant' && all[start - 1].type === 'user') {
        start -= 1
      }
      const messages = all.slice(start)
      const title = extractTitleFromMessages(messages)
      return { sessionId, title, messages }
    } catch {
      return null
    }
  }

  const extractTitleFromMessages = (messages: ChatMessage[]): string | undefined => {
    const first = messages.find((m) => m.type === 'user') || messages[0]
    if (!first) return undefined
    if (typeof first.content === 'string') return first.content.slice(0, 80)
    if (Array.isArray(first.content)) {
      const t = first.content.find((b: any) => typeof b === 'string' || b?.text)
      const text = typeof t === 'string' ? t : t?.text
      return text ? String(text).slice(0, 80) : undefined
    }
    return undefined
  }

  const onItemEnter = useCallback((sessionId: string, rect: DOMRect) => {
    clearCloseTimer()
    setHoveredSessionId(sessionId)
    setHoverRect(rect)
    setOpen(true)
    setLoading(true)
    // Load preview from localStorage
    const local = readLocalPreview(sessionId)
    setData(local)
    setLoading(false)
  }, [])

  const onItemLeave = useCallback(() => {
    // small delay to allow moving into the preview
    clearCloseTimer()
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false)
      setHoveredSessionId(null)
      setHoverRect(null)
    }, 120)
  }, [])

  const onPreviewEnter = useCallback(() => {
    clearCloseTimer()
  }, [])

  const onPreviewLeave = useCallback(() => {
    setOpen(false)
    setHoveredSessionId(null)
    setHoverRect(null)
  }, [])

  const style = useMemo<React.CSSProperties>(() => {
    const width = 620 // wider preview
    const margin = 12
    const viewportH = window.innerHeight
    const maxHeight = Math.min(viewportH - margin * 2, 720) // keep fully visible in viewport
    const left = sidebarWidth + 12

    // Default position if we don't have a hover rect yet
    if (!hoverRect) {
      return { position: 'fixed', top: margin, left, width, height: maxHeight, zIndex: 2147483647 }
    }

    // Align vertically with the hovered item center, then clamp to keep fully visible
    const itemCenter = hoverRect.top + hoverRect.height / 2
    const desiredTop = itemCenter - maxHeight / 2
    const clampedTop = Math.max(margin, Math.min(desiredTop, viewportH - maxHeight - margin))

    return { position: 'fixed', top: clampedTop, left, width, height: maxHeight, zIndex: 2147483647 }
  }, [hoverRect, sidebarWidth])

  return {
    isOpen: open,
    data,
    loading,
    style,
    onItemEnter,
    onItemLeave,
    onPreviewEnter,
    onPreviewLeave,
  }
}
