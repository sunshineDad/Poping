import React, { useState } from 'react'
import { Table } from './components/Table'
import { Timeline } from './components/Timeline'
import type { ColumnDef } from './components/Cell'
import { showToast } from '@shared/ui/Toast'
import ReactMarkdown from 'react-markdown'
import { Highlight, themes } from 'prism-react-renderer'
import { useTheme } from '@/shared/hooks'

export type MCPRenderer = (opts: { result: any; input: any; toolName: string }) => React.ReactNode

export function toBlocks(result?: any): any[] {
  if (!result) return []
  if (Array.isArray(result)) return result
  if (typeof result === 'string') {
    try { const parsed = JSON.parse(result); return Array.isArray(parsed) ? parsed : [parsed] } catch { return [{ type: 'text', text: result }] }
  }
  if (typeof result === 'object') return [result]
  return []
}

function safeJson(s: string): any { try { return JSON.parse(s) } catch { return {} } }

export function Markdown({ text }: { text: string }) {
  // Simple, robust renderer based on react-markdown only
  return (
    <div className="max-w-none font-sans text-foreground">
      <ReactMarkdown
        components={{
          h1({ children, ...props }) {
            return (
              <h1 className="text-2xl font-semibold mb-3" {...props}>{children}</h1>
            )
          },
          h2({ children, ...props }) {
            return (
              <h2 className="text-xl font-semibold mt-4 mb-2" {...props}>{children}</h2>
            )
          },
          h3({ children, ...props }) {
            return (
              <h3 className="text-lg font-semibold mt-3 mb-2" {...props}>{children}</h3>
            )
          },
          p({ children, ...props }) {
            return (
              <p className="text-[15px] leading-7 mb-3" {...props}>{children}</p>
            )
          },
          ul({ children, ...props }) {
            return (
              <ul className="list-disc pl-5 space-y-1 mb-3" {...props}>{children}</ul>
            )
          },
          ol({ children, ...props }) {
            return (
              <ol className="list-decimal pl-5 space-y-1 mb-3" {...props}>{children}</ol>
            )
          },
          code({ inline, className, children, ...props }) {
            const content = String(children)
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[12px]" {...props}>
                  {content}
                </code>
              )
            }
            // Fenced code with prism-react-renderer, no background.
            const match = /language-(\w+)/.exec(className || '')
            const lang = (match && match[1]) ? match[1] : 'text'
            // Pick a pleasant token theme; ignore container background.
            const ThemeAware: React.FC<{ code: string }> = ({ code }) => {
              const { mode } = useTheme()
              const theme = mode === 'dark' ? themes.nightOwl : themes.github
              return (
                <Highlight theme={theme as any} code={code.replace(/\n+$/, '')} language={lang as any}>
                  {({ tokens, getLineProps, getTokenProps }) => (
                    <div className="my-2 border-t border-b border-neutral-200 dark:border-neutral-700 py-2 overflow-x-auto">
                      <code className="block font-mono text-sm leading-relaxed whitespace-pre">
                        {tokens.map((line, i) => (
                          <div key={i} {...getLineProps({ line, key: i })}>
                            {line.map((token, key) => (
                              <span key={key} {...getTokenProps({ token, key })} />
                            ))}
                          </div>
                        ))}
                      </code>
                    </div>
                  )}
                </Highlight>
              )
            }
            return <ThemeAware code={content} />
          },
        }}
      >
        {text || ''}
      </ReactMarkdown>
    </div>
  )
}

export function PreText({ text }: { text: string }) {
  return (<div className="bg-neutral-950 rounded-xl overflow-hidden"><pre className="m-0 p-3 text-neutral-100 text-xs whitespace-pre-wrap break-words">{text}</pre></div>)
}

export function KV({ data }: { data: any }) {
  const obj = typeof data === 'object' && data !== null ? data : safeJson(String(data ?? ''))
  return (<div className="bg-neutral-950 rounded-xl overflow-hidden"><pre className="m-0 p-3 text-neutral-100 text-xs whitespace-pre-wrap break-words">{JSON.stringify(obj, null, 2)}</pre></div>)
}

export function SimpleList({ items, fields }: { items: any[]; fields: string[] }) {
  if (!items?.length) return <div className="text-sm text-muted-foreground">No items</div>
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="border border-border rounded-lg p-3 bg-muted/30">
          {fields.map((f) => (
            <div key={f} className="text-xs"><span className="text-muted-foreground mr-2">{f}:</span><span className="text-foreground">{String(it?.[f] ?? '')}</span></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function RetrievalList({ results }: { results: any[] }) {
  if (!results?.length) return <div className="text-sm text-muted-foreground">No results</div>
  return (
    <div className="space-y-3">
      {results.map((r: any, i: number) => (
        <div key={i} className="border border-border rounded-lg p-3 bg-muted/30">
          <div className="text-sm font-medium">{r.resource_id} • {r.resource_type} • score {typeof r.score === 'number' ? r.score.toFixed(3) : r.score}</div>
          {r.text && <PreText text={r.text} />}
        </div>
      ))}
    </div>
  )
}

// Indented, subtle list for retrieval results (compact, gray, supports image/text)
export function RetrievalIndented({ items }: { items: any[] }) {
  if (!items?.length) return <div className="text-sm text-muted-foreground">No results</div>
  return (
    <div className="relative pl-4 border-l border-dashed border-border space-y-3 mt-1">
      {items.map((r: any, i: number) => {
        const score = (typeof r.score === 'number') ? r.score.toFixed(2) : (r.score_display || r.score)
        const type = r.resource_type || r.type
        const preview = r.preview || r.text || ''
        const isImage = String(type).toLowerCase() === 'images'
        return (
          <div key={i} className="space-y-1">
            <div className="text-[11px] text-muted-foreground">
              <span className="mr-2">{r.resource_id || r.id}</span>
              <span className="mr-2">• {type}</span>
              {score !== undefined && <span>• score {score}</span>}
            </div>
            {isImage ? (
              r.image_b64 ? (
                <img src={`data:image/png;base64,${r.image_b64}`} alt="result" className="max-h-28 rounded border border-border" />
              ) : (
                <div className="text-xs text-muted-foreground">Image result</div>
              )
            ) : (
              preview ? (
                <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">{preview}</div>
              ) : null
            )}
          </div>
        )
      })}
    </div>
  )
}

function extractStructured(result: any): any {
  // Accept: object, JSON string, or content blocks with a text block containing JSON
  if (!result) return {}
  if (typeof result === 'object' && !Array.isArray(result)) return result
  if (typeof result === 'string') return safeJson(result)
  if (Array.isArray(result)) {
    const textBlock = result.find((b) => b && typeof b === 'object' && b.type === 'text' && typeof b.text === 'string') as any
    if (textBlock && textBlock.text) {
      const parsed = safeJson(textBlock.text)
      if (parsed && typeof parsed === 'object') return parsed
    }
  }
  return {}
}

export const registry: Record<string, MCPRenderer> = {
  // images
  'images:get_image': ({ result }) => {
    const blocks = toBlocks(result)
    const img = blocks.find((b) => b?.type === 'image' && (b?.source?.type === 'base64' || b?.data))
    if (!img) return <div className="text-xs text-muted-foreground">No image content</div>
    const src = img.source?.data ? `data:${img.source?.media_type || 'image/png'};base64,${img.source.data}` : `data:${img.mimeType || 'image/png'};base64,${img.data}`
    return <img src={src} alt="image" className="max-w-full h-auto rounded border border-border" style={{ maxHeight: '400px' }} />
  },
  'images:get_image_info': ({ result }) => <KV data={result} />,
  'images:list_images': ({ result }) => {
    const data = typeof result === 'string' ? safeJson(result) : result
    const items = data?.images || []
    const columns: ColumnDef[] = [
      { key:'id', label:'ID' },
      { key:'name', label:'Name' },
      { key:'format', label:'Format', type:'badge' },
      { key:'tags', label:'Tags', type:'tags' },
    ]
    return <Table items={items} columns={columns} />
  },
  'images:search_images': ({ result }) => {
    const items = Array.isArray(result) ? result : (typeof result === 'string' ? safeJson(result) : [])
    const columns: ColumnDef[] = [
      { key:'id', label:'ID' },
      { key:'name', label:'Name' },
      { key:'format', label:'Format', type:'badge' },
      { key:'size', label:'Size', type:'size', align:'right' },
      { key:'created', label:'Created', type:'datetime' },
      { key:'tags', label:'Tags', type:'tags' },
    ]
    return <Table items={Array.isArray(items) ? items : []} columns={columns} />
  },

  // docs
  'docs:save_doc': ({ result }) => {
    // Render the saved markdown content as Markdown
    if (typeof result === 'string') return <Markdown text={result} />
    if (Array.isArray(result)) {
      const textBlock = result.find((b: any) => b?.type === 'text')
      return <Markdown text={textBlock?.text || ''} />
    }
    if (typeof result === 'object' && result) {
      const text = (result as any).text || ''
      return <Markdown text={text} />
    }
    return <div className="text-xs text-muted-foreground">No content</div>
  },
  'docs:get_doc': ({ result }) => <Markdown text={typeof result === 'string' ? result : ''} />,
  'docs:get_doc_info': ({ result }) => <KV data={result} />,
  'docs:list_docs': ({ result }) => {
    const data = typeof result === 'string' ? safeJson(result) : result
    const items = data?.documents || []
    const columns: ColumnDef[] = [
      { key:'id', label:'ID' },
      { key:'title', label:'Title' },
      { key:'category', label:'Category', type:'badge' },
      { key:'tags', label:'Tags', type:'tags' },
    ]
    return <Table items={items} columns={columns} />
  },
  'docs:search_docs': ({ result }) => {
    const items = Array.isArray(result) ? result : (typeof result === 'string' ? safeJson(result) : [])
    const columns: ColumnDef[] = [
      { key:'id', label:'ID' },
      { key:'title', label:'Title' },
      { key:'category', label:'Category', type:'badge' },
      { key:'updated', label:'Updated', type:'datetime' },
      { key:'tags', label:'Tags', type:'tags' },
    ]
    return <Table items={Array.isArray(items) ? items : []} columns={columns} />
  },

  // texts
  'texts:get_text': ({ result }) => <PreText text={typeof result === 'string' ? result : ''} />,
  'texts:get_text_info': ({ result }) => <KV data={result} />,
  'texts:list_texts': ({ result }) => {
    const data = typeof result === 'string' ? safeJson(result) : result
    const items = data?.texts || []
    const columns: ColumnDef[] = [
      { key:'id', label:'ID' },
      { key:'name', label:'Name' },
      { key:'line_count', label:'Lines', align:'right', type:'number' },
      { key:'word_count', label:'Words', align:'right', type:'number' },
      { key:'tags', label:'Tags', type:'tags' },
    ]
    return <Table items={items} columns={columns} />
  },
  'texts:search_texts': ({ result }) => {
    const list = Array.isArray(result) ? result : (typeof result === 'string' ? safeJson(result) : [])
    const items = Array.isArray(list) ? list : []
    return <SimpleList items={items} fields={["id","name","line_count","word_count"]} />
  },

  // memories
  'memories:get_memory': ({ result }) => <Markdown text={typeof result === 'string' ? result : ''} />,
  'memories:get_memory_info': ({ result }) => <KV data={result} />,
  'memories:list_memories': ({ result }) => {
    const data = typeof result === 'string' ? safeJson(result) : result
    const items = data?.memories || []
    const columns: ColumnDef[] = [
      { key:'id', label:'ID' },
      { key:'title', label:'Title' },
      { key:'category', label:'Category', type:'badge' },
      { key:'priority', label:'Priority', type:'badge' },
      { key:'tags', label:'Tags', type:'tags' },
    ]
    return <Table items={items} columns={columns} />
  },

  // retrieval
  'retrieval:search': ({ result }) => {
    // Normalize result: could be a JSON string, a blocks array with a single text block, or an object
    let data: any
    if (typeof result === 'string') {
      data = safeJson(result)
    } else if (Array.isArray(result)) {
      // Find a text block carrying JSON
      const textBlock = result.find((b: any) => b && b.type === 'text' && typeof b.text === 'string') as any
      data = textBlock ? safeJson(textBlock.text) : {}
    } else if (result && typeof result === 'object') {
      data = result
    } else {
      data = {}
    }
    const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data?.results) ? data.results : [])
    return <RetrievalIndented items={items} />
  },

  // image_ai
  'image_ai:text_to_image': ({ result }) => {
    const blocks = toBlocks(result)
    const text = blocks.find((b) => b?.type === 'text')?.text
    const imgBlock: any = blocks.find((b) => b?.type === 'image')
    let src: string | null = null
    if (imgBlock) {
      if (imgBlock.source?.type === 'base64' && imgBlock.source?.data) {
        src = `data:${imgBlock.source?.media_type || 'image/png'};base64,${imgBlock.source.data}`
      } else if (imgBlock.data) {
        src = `data:${imgBlock.mimeType || 'image/png'};base64,${imgBlock.data}`
      }
    }
    return (
      <div className="space-y-2">
        {text && <div className="text-sm text-muted-foreground">{text}</div>}
        {src && <img src={src} alt="generated" className="max-w-full h-auto rounded border border-border" style={{ maxHeight: '512px' }} />}
      </div>
    )
  },
  'image_ai:image_to_image': ({ result }) => registry['image_ai:text_to_image']({ result, input: null as any, toolName: '' }),
  'image_ai:list_styles': ({ result }) => {
    // Normalize to data with ui + items when FastMCP returned TextContent JSON
    let data: any
    if (typeof result === 'string') {
      data = safeJson(result)
    } else if (Array.isArray(result)) {
      const blocks = toBlocks(result)
      if (blocks.length === 1 && blocks[0]?.type === 'text' && (blocks[0] as any).text) {
        data = safeJson((blocks[0] as any).text)
      } else {
        data = {}
      }
    } else {
      data = result
    }
    const items = (data && Array.isArray(data.items)) ? data.items : []
    const StylesCards: React.FC = () => {
      const [selected, setSelected] = useState<string | null>(null)
      const [page, setPage] = useState<number>(1)
      const perPage = 16 // 4 x 4 per page
      const total = items?.length || 0
      const pages = Math.max(1, Math.ceil(total / perPage))
      const start = (page - 1) * perPage
      const paged = items.slice(start, start + perPage)
      if (!items?.length) return <div className="text-sm text-muted-foreground">No styles</div>
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paged.map((style: any, index: number) => (
              <div
                key={style.id || `${start + index}`}
                onClick={() => {
                  setSelected(style.name)
                  window.dispatchEvent(new CustomEvent('selectStyle', { detail: { styleId: style.id, styleName: style.name } }))
                }}
                className={`cursor-pointer group border rounded-lg overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02] ${selected === style.name ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}
              >
                <div className="aspect-square bg-muted/30 overflow-hidden relative">
                  <img src={style.preview} alt={style.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" style={{ width: '256px', height: '256px' }} />
                  {selected === style.name && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg></div>
                  )}
                </div>
                <div className="p-3"><div className="font-medium text-sm line-clamp-2">{style.name}</div></div>
              </div>
            ))}
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>Page {page} of {pages} • {total} styles</div>
              <div className="space-x-2">
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >Prev</button>
                <button
                  className="px-2 py-1 border rounded disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                >Next</button>
              </div>
            </div>
          )}
        </div>
      )
    }
    return <StylesCards />
  },

  // events
  'events:list_events': ({ result }) => {
    const data = extractStructured(result)
    const root = (data && typeof data === 'object' && 'data' in data) ? (data as any).data : data
    const items = Array.isArray(root) ? root : (root?.events || root?.items || [])
    const Status = ({ v }: { v: string }) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] ${v==='completed'?'bg-green-50 text-green-700 border border-green-200': v==='in_progress'?'bg-amber-50 text-amber-700 border border-amber-200': v==='failed'?'bg-red-50 text-red-700 border border-red-200':'bg-muted text-muted-foreground'}`}>{v}</span>
    )
    const ErrorPill = ({ v }: { v: boolean }) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] ${v?'bg-red-50 text-red-700 border border-red-200':'bg-muted text-muted-foreground'}`}>{String(v)}</span>
    )
    const columns: ColumnDef[] = [
      { key:'id', label:'ID' },
      { key:'title', label:'Title' },
      { key:'type', label:'Type', type:'badge' },
      { key:'status', label:'Status', render: (v) => <Status v={String(v)} /> },
      { key:'timestamp', label:'Time', type:'datetime' },
      { key:'message_count', label:'Msgs', type:'number', align:'right' },
      { key:'has_error', label:'Error', render: (v) => <ErrorPill v={!!v} /> },
    ]
    return <Table items={items} columns={columns} />
  },
  'events:search_events': ({ result }) => {
    const data = typeof result === 'string' ? safeJson(result) : result
    const items = data?.items || (Array.isArray(result) ? result : [])
    const Status = ({ v }: { v: string }) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] ${v==='completed'?'bg-green-50 text-green-700 border border-green-200': v==='in_progress'?'bg-amber-50 text-amber-700 border border-amber-200': v==='failed'?'bg-red-50 text-red-700 border border-red-200':'bg-muted text-muted-foreground'}`}>{v}</span>
    )
    const ErrorPill = ({ v }: { v: boolean }) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-[11px] ${v?'bg-red-50 text-red-700 border border-red-200':'bg-muted text-muted-foreground'}`}>{String(v)}</span>
    )
    const columns: ColumnDef[] = [
      { key:'id', label:'ID' },
      { key:'title', label:'Title' },
      { key:'type', label:'Type', type:'badge' },
      { key:'status', label:'Status', render: (v) => <Status v={String(v)} /> },
      { key:'timestamp', label:'Time', type:'datetime' },
      { key:'message_count', label:'Msgs', type:'number', align:'right' },
      { key:'has_error', label:'Error', render: (v) => <ErrorPill v={!!v} /> },
    ]
    return <Table items={items} columns={columns} />
  },
  'events:search_messages': ({ result }) => {
    const data = typeof result === 'string' ? safeJson(result) : result
    const items = data?.items || (Array.isArray(result) ? result : [])
    return <Table items={items} columns={[{key:'timestamp',label:'Time'},{key:'type',label:'Type'},{key:'content_preview',label:'Preview'},{key:'event_id',label:'Event'}]} />
  },
  'events:search_messages_in_event': ({ result }) => {
    const data = typeof result === 'string' ? safeJson(result) : result
    const items = data?.items || (Array.isArray(result) ? result : [])
    return <Table items={items} columns={[{key:'timestamp',label:'Time'},{key:'type',label:'Type'},{key:'content_preview',label:'Preview'}]} />
  },
  'events:get_event': ({ result }) => <KV data={result} />,
  'events:get_event_messages': ({ result }) => {
    const data = typeof result === 'string' ? safeJson(result) : result
    const items = data?.messages || []
    return <Table items={items} columns={[{key:'timestamp',label:'Time'},{key:'type',label:'Type'},{key:'message.role',label:'Role'}]} />
  },
  'events:get_timeline': ({ result }) => {
    const data = typeof result === 'string' ? safeJson(result) : result
    const items = data?.timeline || []
    return <Timeline items={items} />
  },
}
