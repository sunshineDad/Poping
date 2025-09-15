import React, { useState } from 'react'
import { Button } from '@shared/ui'
import { Download, ExternalLink, Eye, FileText, Image as ImageIcon, Calendar, Brain, Clock } from 'lucide-react'
import type { Resource, Memory, Event } from '@/lib/aigents'

export function ImageRenderer({ resource, onView }: { resource: Resource & { base64?: string }; onView?: (r: Resource) => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const handleView = () => { setIsLoading(true); onView?.(resource); setIsLoading(false) }
  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0"><ImageIcon className="w-5 h-5 text-blue-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2"><h4 className="font-medium text-foreground truncate">{resource.name}</h4><span className="text-xs text-muted-foreground">{formatFileSize(resource.size)}</span></div>
          {resource.metadata?.description && (<p className="text-sm text-muted-foreground mb-3">{resource.metadata.description}</p>)}
          {resource.base64 && (<div className="mb-3"><img src={resource.base64} alt={resource.name} className="max-w-full max-h-48 rounded border object-contain"/></div>)}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleView} disabled={isLoading} className="h-8 px-3 text-xs"><Eye className="w-3 h-3 mr-1" />查看</Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs"><Download className="w-3 h-3 mr-1" />下载</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DocsRenderer({ resource, onView }: { resource: Resource & { content?: string }; onView?: (r: Resource) => void }) {
  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-orange-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2"><h4 className="font-medium text-foreground truncate">{resource.name}</h4><span className="text-xs text-muted-foreground">{formatFileSize(resource.size)}</span></div>
          <div className="text-xs text-muted-foreground mb-2">{resource.mime_type}</div>
          {resource.content && (<div className="mb-3"><pre className="text-xs bg-background p-3 rounded border overflow-x-auto whitespace-pre-wrap">{resource.content.substring(0, 300)}{resource.content.length > 300 ? '...' : ''}</pre></div>)}
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onView?.(resource)} className="h-8 px-3 text-xs"><Eye className="w-3 h-3 mr-1" />查看</Button>
            <Button variant="ghost" size="sm" className="h-8 px-3 text-xs"><ExternalLink className="w-3 h-3 mr-1" />打开</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TextsRenderer({ resource, onView }: { resource: Resource & { content?: string }; onView?: (r: Resource) => void }) {
  const [showFullContent, setShowFullContent] = useState(false)
  const content = resource.content || ''
  const isLong = content.length > 300
  const display = showFullContent ? content : content.substring(0, 300)
  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-5 h-5 text-green-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2"><h4 className="font-medium text-foreground truncate">{resource.name}</h4><span className="text-xs text-muted-foreground">{formatFileSize(resource.size)}</span></div>
          {resource.metadata?.description && (<p className="text-sm text-muted-foreground mb-3">{resource.metadata.description}</p>)}
          {content && (
            <div className="mb-3">
              <pre className="text-xs bg-background p-3 rounded border overflow-x-auto whitespace-pre-wrap">{display}{isLong && !showFullContent && '...'}</pre>
              {isLong && (<button onClick={() => setShowFullContent(!showFullContent)} className="text-xs text-blue-600 hover:text-blue-800 mt-2">{showFullContent ? '收起' : '展开全部'}</button>)}
            </div>
          )}
          <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => onView?.(resource)} className="h-8 px-3 text-xs"><Eye className="w-3 h-3 mr-1" />查看</Button></div>
        </div>
      </div>
    </div>
  )
}

export function MemoryRenderer({ memory, onView }: { memory: Memory; onView?: (m: Memory) => void }) {
  const getPriorityColor = (priority: string) => (priority === 'High' ? 'text-red-600 bg-red-50' : priority === 'Medium' ? 'text-yellow-600 bg-yellow-50' : priority === 'Low' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50')
  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0"><Brain className="w-5 h-5 text-purple-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2"><h4 className="font-medium text-foreground truncate">{memory.title}</h4><span className="text-xs text-muted-foreground">Priority: <span className={`px-2 py-0.5 rounded ${getPriorityColor(memory.priority)}`}>{memory.priority}</span></span></div>
          <div className="text-sm text-muted-foreground mb-2">{memory.context}</div>
          {memory.tags?.length > 0 && (<div className="flex gap-2 flex-wrap mb-2">{memory.tags.map((t) => (<span key={t} className="px-2 py-0.5 bg-muted rounded text-xs">{t}</span>))}</div>)}
          <div className="text-xs text-muted-foreground flex items-center gap-2"><Clock className="w-3 h-3" /> Updated: {new Date(memory.updated).toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}

export function EventRenderer({ event, onView }: { event: Event; onView?: (e: Event) => void }) {
  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0"><Calendar className="w-5 h-5 text-indigo-600" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2"><h4 className="font-medium text-foreground truncate">{event.title}</h4><span className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</span></div>
          <div className="text-xs text-muted-foreground mb-2">{event.type} · {event.status}</div>
          <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => onView?.(event as any)} className="h-8 px-3 text-xs"><Eye className="w-3 h-3 mr-1" />查看</Button></div>
        </div>
      </div>
    </div>
  )
}

function formatFileSize(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB` }

