import React, { useState, useEffect } from 'react'
import { X, Download, ExternalLink, Eye, FileText, Image, File } from 'lucide-react'
import { api } from '@services'

interface ResourceViewerProps {
  resource: any
  isOpen: boolean
  onClose: () => void
  type: 'resource' | 'memory'
  sessionId?: string
}

export function ResourceViewer({ resource, isOpen, onClose, type, sessionId }: ResourceViewerProps) {
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (isOpen && resource) loadResourceContent() }, [isOpen, resource])

  const loadResourceContent = async () => {
    if (!resource) return
    setLoading(true)
    try {
      if (type === 'memory') {
        setContent(resource.content || resource.context || '')
      } else {
        try {
          const response = await api.getResourceContent(resource.id, sessionId)
          if (response.success && response.data) {
            const apiContent = response.data.content
            const contentType = response.data.content_type
            const encoding = response.data.encoding
            if (encoding === 'base64' && contentType?.startsWith('image/')) {
              setContent(`data:${contentType};base64,${apiContent}`)
            } else {
              setContent(apiContent || '暂无内容')
            }
          } else {
            setContent(resource.preview || resource.metadata?.description || '暂无预览内容')
          }
        } catch (error) {
          console.error('Failed to load resource content:', error)
          setContent(resource.preview || resource.metadata?.description || '暂无预览内容')
        }
      }
    } catch (error) {
      console.error('Failed to load resource content:', error)
      setContent('加载内容失败')
    } finally {
      setLoading(false)
    }
  }

  const getResourceIcon = () => {
    if (type === 'memory') return <Eye className="h-5 w-5 text-purple-500" />
    switch (resource?.type) {
      case 'image': return <Image className="h-5 w-5 text-blue-500" />
      case 'code':
      case 'text': return <FileText className="h-5 w-5 text-green-500" />
      case 'document': return <FileText className="h-5 w-5 text-orange-500" />
      default: return <File className="h-5 w-5 text-gray-500" />
    }
  }
  const getTitle = () => (type === 'memory' ? resource?.content?.slice(0, 50) + '...' || '记忆详情' : resource?.name || '资源详情')
  const getSubtitle = () => (type === 'memory' ? `${resource?.importance || 'medium'} 重要性` : `${resource?.size || ''} • ${resource?.type || 'unknown'}`)
  const formatTime = (ts: string) => new Date(ts).toLocaleString('zh-CN')

  if (!isOpen || !resource) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {getResourceIcon()}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md">{getTitle()}</h2>
                <p className="text-sm text-gray-500">{getSubtitle()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {type === 'resource' && (
                <>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Download className="h-4 w-4 text-gray-600" /></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ExternalLink className="h-4 w-4 text-gray-600" /></button>
                </>
              )}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-1"><X className="h-4 w-4 text-gray-600" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-500" />
              </div>
            ) : (
              <div className="p-6">
                {type === 'resource' && resource.type === 'image' ? (
                  <div className="text-center">
                    {(content && content.startsWith('data:image/')) || resource.preview ? (
                      <img src={content && content.startsWith('data:image/') ? content : resource.preview} alt={resource.name} className="max-w-full h-auto rounded-xl shadow-sm mx-auto" style={{ maxHeight: '60vh' }} />
                    ) : (
                      <div className="w-full h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                        <div className="text-gray-400 text-center"><Image className="h-16 w-16 mx-auto mb-3 opacity-50" /><div className="text-sm">暂无预览</div></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-gray-50 rounded-xl p-6 border-0"><pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-mono overflow-x-auto">{content || '暂无内容'}</pre></div>
                    {type === 'memory' && resource.tags?.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                          {resource.tags.map((tag: string) => (<span key={tag} className="inline-block px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">{tag}</span>))}
                        </div>
                      </div>
                    )}
                    {type === 'resource' && resource.uploadTime && (
                      <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">上传时间: {formatTime(resource.uploadTime)}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

