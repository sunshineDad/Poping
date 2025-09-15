import React from 'react'

export type CardsProps = {
  items: any[]
  imageKey?: string
  titleKey?: string
  subtitleKey?: string
  tagKeys?: string[]
  fields?: string[]
  actions?: Array<{ label: string; tool?: string; inputTemplate?: Record<string, any> }>
}

function resolveTemplate(tpl: any, row: any): any {
  if (tpl == null) return tpl
  if (typeof tpl === 'string') return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => String(k.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), row) ?? ''))
  if (Array.isArray(tpl)) return tpl.map((v) => resolveTemplate(v, row))
  if (typeof tpl === 'object') { const out: Record<string, any> = {}; for (const k of Object.keys(tpl)) out[k] = resolveTemplate(tpl[k], row); return out }
  return tpl
}

export function Cards({ items, imageKey, titleKey, subtitleKey, tagKeys = [], fields = [], actions = [] }: CardsProps) {
  if (!items?.length) return <div className="text-sm text-muted-foreground">No items</div>
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it, idx) => {
        const image = imageKey ? it?.[imageKey] : undefined
        const title = titleKey ? it?.[titleKey] : undefined
        const subtitle = subtitleKey ? it?.[subtitleKey] : undefined
        const tags: any[] = tagKeys.flatMap((k) => (Array.isArray(it?.[k]) ? it[k] : (it?.[k] ? [it[k]] : [])))
        return (
          <div key={idx} className="border rounded-lg overflow-hidden bg-muted/20">
            {image && (
              <div className="aspect-video bg-muted/30">
                <img src={String(image)} alt={String(title || '')} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-3 space-y-2">
              {title && <div className="text-sm font-medium truncate">{String(title)}</div>}
              {subtitle && <div className="text-xs text-muted-foreground truncate">{String(subtitle)}</div>}
              {!!tags.length && (
                <div className="flex flex-wrap mt-1">
                  {tags.map((t, i) => (
                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-muted text-muted-foreground mr-1 mb-1">{String(t)}</span>
                  ))}
                </div>
              )}
              {!!fields.length && (
                <div className="mt-2 space-y-1">
                  {fields.map((f) => (
                    <div key={f} className="text-xs"><span className="text-muted-foreground mr-2">{f}:</span><span className="text-foreground">{String(it?.[f] ?? '')}</span></div>
                  ))}
                </div>
              )}
              {!!actions.length && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {actions.map((a, i) => (
                    <button
                      key={i}
                      className="px-2 py-1 text-xs border rounded hover:bg-muted"
                      onClick={() => {
                        const input = resolveTemplate(a.inputTemplate || {}, it)
                        const detail = { tool: a.tool, input, item: it }
                        window.dispatchEvent(new CustomEvent('mcpAction', { detail }))
                        try {
                          const title = titleKey ? it?.[titleKey] : (it?.name || '')
                          const label = a.label || 'Action'
                          window.dispatchEvent(new CustomEvent('toast', { detail: { message: `${label} • ${String(title || '')}`, type: 'success' } }))
                        } catch {}
                      }}
                    >{a.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
