import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

interface ToolResultBlock {
  type: string
  text?: string
  source?: { data: string; media_type: string; type: string }
  [key: string]: any
}

interface ToolResultRendererProps { content: string | any[] | ToolResultBlock[]; isError?: boolean }

export function ToolResultRenderer({ content, isError = false }: ToolResultRendererProps) {
  if (isError) {
    const errorText = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
    return (
      <div className="text-red-600 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
        <strong>Error:</strong> {errorText}
      </div>
    )
  }

  let actualContent = content
  if (Array.isArray(content) && content.length === 1 && (content[0] as any)?.type === 'text' && (content[0] as any)?.text) {
    try { const parsed = JSON.parse((content[0] as any).text); if (Array.isArray(parsed)) actualContent = parsed } catch {}
  }
  const isStylesList = Array.isArray(actualContent) && actualContent.length > 0 && (actualContent as any)[0]?.name && (actualContent as any)[0]?.preview
  if (isStylesList) return <StylesGridRenderer styles={actualContent as any[]} />

  let blocks: ToolResultBlock[] = []
  if (typeof content === 'string') {
    try { const parsed = JSON.parse(content); blocks = Array.isArray(parsed) ? parsed : [parsed] } catch { blocks = [{ type: 'text', text: content }] }
  } else if (Array.isArray(content)) { blocks = content as ToolResultBlock[] }
  else if (content && typeof content === 'object') { blocks = [content as ToolResultBlock] }
  else { blocks = [{ type: 'text', text: 'No result' }] }

  return <div className="space-y-3">{blocks.map((b, i) => (<ToolResultBlock key={i} block={b} />))}</div>
}

function SmartTextRenderer({ text }: { text: string }) {
  const [isJson, setIsJson] = useState(false)
  const [jsonData, setJsonData] = useState<any>(null)
  useEffect(() => { if (!text) return; try { const p = JSON.parse(text); setJsonData(p); setIsJson(true) } catch { setIsJson(false); setJsonData(null) } }, [text])
  if (isJson && jsonData !== null) {
    return (
      <div className="mt-2">
        <div className="border-t border-b border-gray-200 dark:border-gray-600">
          <AnimatedJsonDisplay jsonString={JSON.stringify(jsonData, null, 2)} startDelay={100} isExpanded={true} />
        </div>
      </div>
    )
  }
  return (<div className="prose prose-sm max-w-none dark:prose-invert"><ReactMarkdown>{text || ''}</ReactMarkdown></div>)
}

const AnimatedJsonDisplay: React.FC<{ jsonString: string; startDelay: number; isExpanded: boolean }> = ({ jsonString, startDelay, isExpanded }) => {
  const [revealProgress, setRevealProgress] = useState(0)
  const [fullHeight, setFullHeight] = useState(0)
  const hiddenRef = React.useRef<HTMLDivElement>(null)
  const animationRef = React.useRef<number | null>(null)
  useEffect(() => { if (hiddenRef.current) setFullHeight(hiddenRef.current.scrollHeight) }, [jsonString])
  useEffect(() => {
    if (animationRef.current) { cancelAnimationFrame(animationRef.current); animationRef.current = null }
    if (isExpanded) {
      setRevealProgress(0)
      const timer = setTimeout(() => {
        const duration = 800; const startTime = Date.now()
        const animate = () => { const elapsed = Date.now() - startTime; const progress = Math.min(elapsed / duration, 1); const eased = 1 - Math.pow(1 - progress, 4); setRevealProgress(eased); if (progress < 1) animationRef.current = requestAnimationFrame(animate); else animationRef.current = null }
        animationRef.current = requestAnimationFrame(animate)
      }, startDelay)
      return () => clearTimeout(timer)
    } else {
      const duration = 600; const startTime = Date.now(); const start = revealProgress
      const animate = () => { const elapsed = Date.now() - startTime; const progress = Math.min(elapsed / duration, 1); const eased = Math.pow(progress, 4); const current = start * (1 - eased); setRevealProgress(current); if (progress < 1) animationRef.current = requestAnimationFrame(animate); else animationRef.current = null }
      animationRef.current = requestAnimationFrame(animate)
    }
    return () => { if (animationRef.current) { cancelAnimationFrame(animationRef.current); animationRef.current = null } }
  }, [isExpanded, startDelay])
  return (
    <div className="relative">
      <div ref={hiddenRef} className="absolute opacity-0 pointer-events-none -z-10"><div className="bg-neutral-950 rounded-xl overflow-hidden"><pre className="m-0 p-3 text-neutral-100 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">{jsonString}</pre></div></div>
      <div className="overflow-hidden transition-none" style={{ height: `${fullHeight * revealProgress}px`, minHeight: revealProgress > 0 ? '1px' : '0px' }}><div className="bg-neutral-950 rounded-xl overflow-hidden"><pre className="m-0 p-3 text-neutral-100 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">{jsonString}</pre></div></div>
    </div>
  )
}

function ToolResultBlock({ block }: { block: ToolResultBlock }) {
  switch (block.type) {
    case 'text':
      return <SmartTextRenderer text={block.text || ''} />
    case 'image':
      if (block.source?.type === 'base64' && block.source?.data) {
        const src = `data:${block.source.media_type || 'image/png'};base64,${block.source.data}`
        return (<div className="max-w-full"><img src={src} alt="Tool result image" className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" style={{ maxHeight: '400px' }} /></div>)
      }
      if ((block as any)?.data) {
        const src = `data:${(block as any).mimeType || 'image/png'};base64,${(block as any).data}`
        return (<div className="max-w-full"><img src={src} alt="Tool result image" className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200 dark:border-gray-700" style={{ maxHeight: '400px' }} /></div>)
      }
      return <div className="text-gray-500 italic">Invalid image data</div>
    case 'resource': {
      // EmbeddedResource block from MCP
      const res: any = (block as any).resource
      if (!res) return (<div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400">Empty resource</div>)
      if (res.text && res.mimeType?.startsWith('text/')) {
        return (<div className="bg-neutral-950 rounded-xl overflow-hidden"><pre className="m-0 p-3 text-neutral-100 text-xs whitespace-pre-wrap break-words">{res.text}</pre></div>)
      }
      if (res.blob) {
        return (<div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400">Binary resource: {res.mimeType || 'application/octet-stream'}</div>)
      }
      return (<div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-400">Unsupported resource</div>)
    }
    case 'json':
      return (<div className="bg-neutral-950 rounded-xl overflow-hidden"><pre className="m-0 p-3 text-neutral-100 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">{JSON.stringify(block, null, 2)}</pre></div>)
    case 'code':
      return (<div className="bg-neutral-950 rounded-xl overflow-hidden"><pre className="m-0 p-3 text-neutral-100 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">{block.text || JSON.stringify(block, null, 2)}</pre></div>)
    case 'table':
    case 'chart':
    case 'file':
      return (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
          <div className="text-yellow-800 dark:text-yellow-200 text-sm"><strong>Unsupported content type:</strong> {block.type}</div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">{JSON.stringify(block, null, 2)}</div>
        </div>
      )
    default:
      return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3"><div className="text-gray-600 dark:text-gray-400 text-xs mb-2">Unknown block type: <code>{block.type}</code></div><div className="bg-neutral-950 rounded overflow-hidden"><pre className="m-0 p-3 text-neutral-100 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words">{JSON.stringify(block, null, 2)}</pre></div></div>
      )
  }
}

interface Style { id: string; name: string; preview: string }
function StylesGridRenderer({ styles }: { styles: Style[] }) {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const handleSelect = (style: Style) => { setSelectedStyle(style.name); window.dispatchEvent(new CustomEvent('selectStyle', { detail: { styleId: style.id, styleName: style.name } })) }
  if (!styles || styles.length === 0) return (<div className="text-center py-8 text-muted-foreground">暂无可用风格</div>)
  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-semibold">可用风格模型</h3><span className="text-sm text-muted-foreground">共 {styles.length} 个风格</span></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {styles.map((style, index) => (
          <div key={style.id || index} onClick={() => handleSelect(style)} className={`cursor-pointer group border rounded-lg overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] ${selectedStyle === style.name ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
            <div className="aspect-square bg-muted/30 overflow-hidden relative">
              <img src={style.preview} alt={style.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" style={{ width: '256px', height: '256px' }} onError={(e) => { const t = e.target as HTMLImageElement; t.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMjggODBMMTQ0IDExMkgxMTJMMTI4IDgwWiIgZmlsbD0iIzlmYTNhOCIvPgo8cGF0aCBkPSJNMTI4IDE3NkMxNDQuNTY5IDE3NiAxNTggMTYyLjU2OSAxNTggMTQ2QzE1OCAxMjkuNDMxIDE0NC41NjkgMTE2IDEyOCAxMTZDMTExLjQzMSAxMTYgOTggMTI5LjQzMSA5OCAxNDZDOTggMTYyLjU2OSAxMTEuNDMxIDE3NiAxMjggMTc2WiIgZmlsbD0iIzlmYTNhOCIvPgo8L3N2Zz4K'; }} loading="lazy" />
              {selectedStyle === style.name && (<div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg></div>)}
            </div>
            <div className="p-3"><div className="font-medium text-sm line-clamp-2">{style.name}</div></div>
          </div>
        ))}
      </div>
    </div>
  )
}
