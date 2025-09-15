import React from 'react'
import { formatBytes, formatDate, formatDateTime } from './format'

export type CellType = 'text' | 'number' | 'date' | 'datetime' | 'size' | 'tags' | 'url' | 'badge' | 'json' | 'code'

export type ColumnRenderer = (value: any, row: any) => React.ReactNode

export type ColumnDef = {
  key: string
  label?: string
  width?: number | string
  align?: 'left' | 'right' | 'center'
  type?: CellType
  render?: ColumnRenderer
}

function JsonBlock({ value }: { value: any }) {
  return (
    <div className="bg-neutral-950 rounded-md overflow-hidden">
      <pre className="m-0 p-2 text-neutral-100 text-[11px] whitespace-pre-wrap break-words">{JSON.stringify(value, null, 2)}</pre>
    </div>
  )
}

function Code({ value }: { value: any }) {
  return (
    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{String(value)}</code>
  )
}

function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-muted text-muted-foreground mr-1 mb-1">
      {children}
    </span>
  )
}

export function renderCell(value: any, row: any, col: ColumnDef): React.ReactNode {
  if (col.render) return col.render(value, row)
  const t = col.type || (typeof value === 'number' ? 'number' : 'text')
  switch (t) {
    case 'size':
      return <span>{formatBytes(Number(value))}</span>
    case 'date':
      return <span>{formatDate(value)}</span>
    case 'datetime':
      return <span>{formatDateTime(value)}</span>
    case 'url':
      return value ? (
        <a href={String(value)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{String(value)}</a>
      ) : (
        <span>-</span>
      )
    case 'badge':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] bg-blue-50 text-blue-700 border border-blue-200">
          {String(value)}
        </span>
      )
    case 'tags': {
      const arr: any[] = Array.isArray(value) ? value : (value ? [value] : [])
      if (!arr.length) return <span className="text-muted-foreground">-</span>
      return <div className="flex flex-wrap">{arr.map((v, i) => <TagPill key={i}>{String(v)}</TagPill>)}</div>
    }
    case 'json':
      return <JsonBlock value={value} />
    case 'code':
      return <Code value={value} />
    case 'number':
      return <span className="tabular-nums">{String(value)}</span>
    case 'text':
    default:
      return <span className="break-words">{String(value ?? '-') }</span>
  }
}

