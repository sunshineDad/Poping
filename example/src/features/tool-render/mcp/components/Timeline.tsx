import React from 'react'

type TimelineItem = {
  id: string
  title?: string
  type?: string
  status?: string
  timestamp?: string
  end_timestamp?: string | null
  duration_ms?: number | null
  message_count?: number
  has_error?: boolean
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  if (!items?.length) return <div className="text-sm text-muted-foreground">No events</div>
  return (
    <div className="relative pl-4">
      <div className="absolute left-1 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-3">
        {items.map((e) => (
          <div key={e.id} className="relative">
            <div className="absolute left-0 -ml-1 w-2 h-2 rounded-full bg-foreground" />
            <div className="ml-3 p-3 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium truncate">{e.title || e.type || e.id}</div>
                <div className="text-xs text-muted-foreground">{e.timestamp}</div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground flex gap-3">
                {e.type && <span>Type: {e.type}</span>}
                {e.status && <span>Status: {e.status}</span>}
                {typeof e.duration_ms === 'number' && <span>Duration: {e.duration_ms}ms</span>}
                {typeof e.message_count === 'number' && <span>Msgs: {e.message_count}</span>}
                {typeof e.has_error === 'boolean' && <span className={e.has_error ? 'text-red-600' : ''}>Error: {String(e.has_error)}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

