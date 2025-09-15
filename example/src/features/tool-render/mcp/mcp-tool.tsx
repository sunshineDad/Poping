import React from 'react'
import type { ToolResult } from '@shared/types'
import { registry, toBlocks, Markdown, KV, SimpleList } from './registry'
import { Table } from './components/Table'
import { Cards } from './components/Cards'
import { Timeline } from './components/Timeline'

type MCPToolProps = { toolName: string; toolInput: any; toolResult?: ToolResult }

// Generic UI hints renderer (minimal initial version)
function GenericRenderer({ result }: { result: any }) {
  // If result advertises a ui spec at top-level
  const data = typeof result === 'string' ? safeJson(result) : result
  const ui = data?.ui
  if (!ui) return null
  const handlePageChange = (nextPage: number) => {
    const event = new CustomEvent('mcpPageRequest', { detail: { page: nextPage, perPage: ui.perPage, toolName } })
    window.dispatchEvent(event)
  }

  switch (ui.type) {
    case 'markdown':
      return <Markdown text={data.content || ''} />
    case 'kv':
      return <KV data={data.data || {}} />
    case 'cards': {
      const items = data.items || []
      return (
        <Cards
          items={items}
          imageKey={ui.imageKey}
          titleKey={ui.titleKey}
          subtitleKey={ui.subtitleKey}
          tagKeys={ui.tagKeys}
          fields={ui.fields}
        />
      )
    }
    case 'table': {
      const items = data.items || []
      const columns = (ui.columns || (ui.fields ? ui.fields.map((k: string) => ({ key: k })) : Object.keys(items?.[0] || {}).map((k) => ({ key: k })))) as Array<{ key: string; label?: string; width?: number | string; align?: 'left'|'right'|'center' }>
      return (
        <Table
          items={items}
          columns={columns as any}
          page={ui.page}
          perPage={ui.perPage}
          total={ui.total}
          onPageChange={handlePageChange}
        />
      )
    }
    case 'timeline': {
      const items = data.timeline || []
      return <Timeline items={items} />
    }
    default:
      return null
  }
}

function safeJson(s: string): any { try { return JSON.parse(s) } catch { return {} } }

export function MCPTool({ toolName, toolInput, toolResult }: MCPToolProps) {
  const [, service, method] = toolName.split('__') // mcp__{service}__{method}
  const result = toolResult?.result ?? toolResult?.output

  // Honor UI hints first, including when wrapped in a single text block
  if (Array.isArray(result)) {
    const textBlock = result.find((b: any) => b && b.type === 'text' && typeof b.text === 'string') as any
    if (textBlock && textBlock.text) {
      const parsed = safeJson(textBlock.text)
      if (parsed && typeof parsed === 'object' && parsed.ui) {
        return <GenericRenderer result={parsed} />
      }
    }
  } else if (typeof result === 'string') {
    const parsed = safeJson(result)
    if (parsed && typeof parsed === 'object' && parsed.ui) {
      return <GenericRenderer result={parsed} />
    }
  } else if (result && typeof result === 'object' && (result as any).ui) {
    return <GenericRenderer result={result} />
  }

  // Special-case: docs:save_doc should render as Markdown if no UI hints present
  if (service === 'docs' && method === 'save_doc') {
    let text = ''
    if (typeof result === 'string') text = result
    else if (Array.isArray(result)) {
      const textBlock = result.find((b: any) => b && b.type === 'text' && typeof b.text === 'string') as any
      text = textBlock?.text || ''
    } else if (result && typeof result === 'object') {
      text = (result as any).content || (result as any).text || ''
    }
    return <Markdown text={text} />
  }

  // 1) Registry mapping
  const key = `${service}:${method}`
  const renderer = registry[key] || registry[`${service}:*`]
  if (renderer) return <>{renderer({ result, input: toolInput, toolName })}</>

  // 2) UI hints-based rendering (already handled above)

  // 3) Heuristic: blocks (images/text)
  const blocks = toBlocks(result)
  if (blocks.length) {
    // Prefer image if any image block present (even if first block is text)
    const hasImage = blocks.find((b: any) => b?.type === 'image')
    if (hasImage) {
      const renderer = registry[`${service}:text_to_image`] || registry[`${service}:image_to_image`] || registry['images:get_image']
      if (renderer) return <>{renderer({ result, input: toolInput, toolName })}</>
    }
    // Otherwise, if first is text, show markdown
    const first = blocks[0]
    if (first?.type === 'text') {
      return <Markdown text={first.text || ''} />
    }
  }

  // 4) Fallback
  const fallbackText = typeof result === 'string' ? result : JSON.stringify(result ?? {}, null, 2)
  const looksLikeMarkdown = typeof fallbackText === 'string' && (/^\s*#\s+/m.test(fallbackText) || /```/.test(fallbackText) || /^\s*[-*]\s+/m.test(fallbackText))
  if (looksLikeMarkdown) {
    return <Markdown text={fallbackText} />
  }
  return (
    <div className="bg-neutral-950 rounded-xl overflow-hidden">
      <pre className="m-0 p-3 text-neutral-100 text-xs whitespace-pre-wrap break-words">{fallbackText || 'No result'}</pre>
    </div>
  )
}
