import React, { useState, useEffect } from 'react'
import { api } from '@services'

interface Style { name: string; preview: string }
interface StyleSelectorProps { onStyleSelect: (styleName: string) => void; sessionId?: string }

export function StyleSelector({ onStyleSelect, sessionId }: StyleSelectorProps) {
  const [styles, setStyles] = useState<Style[]>([])
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => { if (isOpen && sessionId) loadStyles() }, [isOpen, sessionId])

  const loadStyles = async () => {
    if (!sessionId) return
    setLoading(true); setError(null)
    try {
      const client = await api.getOrCreateAIGentsClient(sessionId)
      const result = await client.listStyles()
      setStyles(result || [])
    } catch (err) {
      console.error('Failed to load styles:', err)
      setError(err instanceof Error ? err.message : 'Failed to load styles')
    } finally { setLoading(false) }
  }

  const handleStyleClick = (style: Style) => { setSelectedStyle(style.name); onStyleSelect(style.name); setIsOpen(false) }

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 text-sm bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors" disabled={!sessionId}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        风格选择
        {selectedStyle && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{selectedStyle}</span>}
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg shadow-lg max-w-6xl max-h-[80vh] w-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold">选择风格模型</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading && (<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border border-transparent border-t-primary"></div><span className="ml-3 text-muted-foreground">加载风格中...</span></div>)}
              {error && (<div className="text-center py-12"><div className="text-red-500 mb-2">加载失败</div><div className="text-sm text-muted-foreground">{error}</div><button onClick={loadStyles} className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">重试</button></div>)}
              {!loading && !error && styles.length === 0 && (<div className="text-center py-12 text-muted-foreground">暂无可用风格</div>)}
              {!loading && !error && styles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {styles.map((style) => (
                    <div key={style.name} onClick={() => handleStyleClick(style)} className={`cursor-pointer group border rounded-lg overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] ${selectedStyle === style.name ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
                      <div className="aspect-square bg-muted/30 overflow-hidden">
                        <img src={style.preview} alt={style.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" style={{ width: '256px', height: '256px' }} onError={(e) => { const target = e.target as HTMLImageElement; target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMjggODBMMTQ0IDExMkgxMTJMMTI4IDgwWiIgZmlsbD0iIzlmYTNhOCIvPgo8cGF0aCBkPSJNMTI4IDE3NkMxNDQuNTY5IDE3NiAxNTggMTYyLjU2OSAxNTggMTQ2QzE1OCAxMjkuNDMxIDE0NC41NjkgMTE2IDEyOCAxMTZDMTExLjQzMSAxMTYgOTggMTI5LjQzMSA5OCAxNDZDOTggMTYyLjU2OSAxMTEuNDMxIDE3NiAxMjggMTc2WiIgZmlsbD0iIzlmYTNhOCIvPgo8L3N2Zz4K'; }} loading="lazy" />
                      </div>
                      <div className="p-3"><div className="font-medium text-sm line-clamp-2">{style.name}</div></div>
                      {selectedStyle === style.name && (<div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg></div>)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{styles.length > 0 ? `共 ${styles.length} 个风格` : ''}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedStyle(null); onStyleSelect('') }} className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/50">清除选择</button>
                  <button onClick={() => setIsOpen(false)} className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">确定</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

