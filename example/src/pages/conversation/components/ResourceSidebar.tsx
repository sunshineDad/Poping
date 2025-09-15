import { useState, useEffect } from 'react'
import { X, File, Image, FileText, Brain } from 'lucide-react'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui'
import { ResourceViewer } from './ResourceViewer'
import { api } from '@services'
import type { Resource, Memory, Event } from '@/lib/aigents'

interface DisplayResource { id: string; name: string; type: 'text' | 'image' | 'document' | 'code'; size?: string; uploadTime: string; path?: string; preview?: string }
interface DisplayMemory { id: string; content: string; timestamp: string; importance: 'high' | 'medium' | 'low'; tags: string[] }
interface DisplayEvent { id: string; type: 'message' | 'file_upload' | 'tool_use' | 'error'; description: string; timestamp: string; details?: any }

interface ResourceSidebarProps { isOpen: boolean; onClose: () => void; sessionId?: string }

export function ResourceSidebar({ isOpen, onClose, sessionId }: ResourceSidebarProps) {
  const [resources, setResources] = useState<DisplayResource[]>([])
  const [memories, setMemories] = useState<DisplayMemory[]>([])
  const [events, setEvents] = useState<DisplayEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [viewerType, setViewerType] = useState<'resource' | 'memory'>('resource')
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  useEffect(() => { if (isOpen && sessionId) loadResources() }, [isOpen, sessionId])

  const loadResources = async () => {
    if (!sessionId) return
    setLoading(true)
    try {
      await api.getOrCreateAIGentsClient(sessionId)
      const [resourcesResult, memoriesResult, eventsResult] = await Promise.all([
        api.getSessionResources(sessionId),
        api.getSessionMemories(sessionId),
        api.getSessionEvents(sessionId),
      ])
      if (resourcesResult.success && resourcesResult.data) {
        const display: DisplayResource[] = resourcesResult.data.map((r: Resource, i: number) => {
          const isImage = (
            r.type === 'images' || r.type === 'image' ||
            (r.mime_type ? r.mime_type.startsWith('image/') : false) ||
            /\.(png|jpe?g|gif|webp|bmp|svg|ico)$/i.test(r.name || '')
          )
          return {
            id: r.id || `resource_${i}`,
            name: r.name || '未知文件',
            type: isImage ? 'image' : mapResourceTypeToDisplay(r.type || 'text'),
            size: formatFileSize(r.size || 0),
            uploadTime: r.created_at || new Date().toISOString(),
            preview: r.metadata?.preview || r.metadata?.description,
          }
        })
        setResources(display)
      } else setResources([])

      if (memoriesResult.success && memoriesResult.data) {
        const display: DisplayMemory[] = memoriesResult.data.map((m: Memory, i: number) => ({
          id: m.id || `memory_${i}`,
          content: m.key_info && Array.isArray(m.key_info) && m.key_info.length > 0 ? m.key_info.join('; ') : m.context || m.title || '未知记忆',
          timestamp: m.updated || m.created || new Date().toISOString(),
          importance: (m.priority ? m.priority.toLowerCase() : 'medium') as 'high' | 'medium' | 'low',
          tags: m.tags || [],
        }))
        setMemories(display)
      } else setMemories([])

      if (eventsResult.success && eventsResult.data) {
        const display: DisplayEvent[] = eventsResult.data.map((e: Event, i: number) => ({
          id: e.id || `event_${i}`,
          type: mapEventTypeToDisplay(e.type || 'tool_use'),
          description: e.title || e.status || '未知事件',
          timestamp: e.timestamp || new Date().toISOString(),
          details: e,
        }))
        setEvents(display)
      } else setEvents([])
    } catch (e) {
      console.error('ResourceSidebar: Failed to load', e)
      setResources([]); setMemories([]); setEvents([])
    } finally { setLoading(false) }
  }

  const mapResourceTypeToDisplay = (t: string): DisplayResource['type'] => (t === 'images' ? 'image' : t === 'texts' ? 'text' : t === 'docs' ? 'document' : t === 'codes' ? 'code' : 'text')
  const mapEventTypeToDisplay = (t: string): DisplayEvent['type'] => (t === 'upload_resource' ? 'file_upload' : t === 'user_query' ? 'message' : t === 'error' ? 'error' : 'tool_use')
  const formatFileSize = (bytes: number): string => { if (bytes === 0) return '0B'; const k=1024; const sizes=['B','KB','MB','GB']; const i=Math.floor(Math.log(bytes)/Math.log(k)); return parseFloat((bytes/Math.pow(k,i)).toFixed(1))+sizes[i] }
  const getResourceIcon = (type: DisplayResource['type']) => type === 'image' ? <Image className="h-4 w-4 text-blue-500"/> : type === 'code' ? <FileText className="h-4 w-4 text-green-500"/> : type === 'document' ? <FileText className="h-4 w-4 text-orange-500"/> : <File className="h-4 w-4 text-gray-500"/>
  const getEventIcon = (type: DisplayEvent['type']) => type === 'message' ? <span className="w-2 h-2 bg-blue-500 rounded-full"/> : type === 'file_upload' ? <span className="w-2 h-2 bg-green-500 rounded-full"/> : type === 'tool_use' ? <span className="w-2 h-2 bg-purple-500 rounded-full"/> : type === 'error' ? <span className="w-2 h-2 bg-red-500 rounded-full"/> : <span className="w-2 h-2 bg-gray-400 rounded-full"/>
  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })

  return isOpen ? (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[420px] bg-background border-l border-border shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="font-semibold">Resources</div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4"/></Button>
        </div>
        <Tabs defaultValue="images" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-3 my-2">
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="docs">Docs</TabsTrigger>
            <TabsTrigger value="texts">Texts</TabsTrigger>
            <TabsTrigger value="memories">Memories</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          <TabsContent value="images" className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-2">
              {resources.filter(r => r.type === 'image').map((r) => (
                <button key={r.id} className="w-full text-left p-2 rounded hover:bg-muted/50 flex items-center gap-2" onClick={() => { setSelectedResource(r); setViewerType('resource'); setIsViewerOpen(true) }}>
                  {getResourceIcon(r.type)}
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.size} • {r.type}</div>
                  </div>
                </button>
              ))}
              {resources.filter(r => r.type === 'image').length === 0 && (
                <div className="text-xs text-muted-foreground px-3">No data</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="docs" className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-2">
              {resources.filter(r => r.type === 'document').map((r) => (
                <button key={r.id} className="w-full text-left p-2 rounded hover:bg-muted/50 flex items-center gap-2" onClick={() => { setSelectedResource(r); setViewerType('resource'); setIsViewerOpen(true) }}>
                  {getResourceIcon(r.type)}
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.size} • {r.type}</div>
                  </div>
                </button>
              ))}
              {resources.filter(r => r.type === 'document').length === 0 && (
                <div className="text-xs text-muted-foreground px-3">No data</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="texts" className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-2">
              {resources.filter(r => r.type === 'text').map((r) => (
                <button key={r.id} className="w-full text-left p-2 rounded hover:bg-muted/50 flex items-center gap-2" onClick={() => { setSelectedResource(r); setViewerType('resource'); setIsViewerOpen(true) }}>
                  {getResourceIcon(r.type)}
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.size} • {r.type}</div>
                  </div>
                </button>
              ))}
              {resources.filter(r => r.type === 'text').length === 0 && (
                <div className="text-xs text-muted-foreground px-3">No data</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="memories" className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-2">
              {memories.map((m) => (
                <button key={m.id} className="w-full text-left p-2 rounded hover:bg-muted/50 flex items-center gap-2" onClick={() => { setSelectedResource(m); setViewerType('memory'); setIsViewerOpen(true) }}>
                  <Brain className="h-4 w-4 text-purple-600" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.content}</div>
                    <div className="text-xs text-muted-foreground">{formatTime(m.timestamp)} • {m.importance}</div>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="events" className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-2">
              {events.map((e) => (
                <div key={e.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                  {getEventIcon(e.type)}
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{e.description}</div>
                    <div className="text-xs text-muted-foreground">{formatTime(e.timestamp)} • {e.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <ResourceViewer resource={selectedResource} isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} type={viewerType} sessionId={sessionId} />
    </div>
  ) : null
}
