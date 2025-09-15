import React from 'react'
import type { ColumnDef } from './Cell'
import { renderCell } from './Cell'

export type TableProps = {
  items: any[]
  columns?: ColumnDef[]
  emptyText?: string
  dense?: boolean
  page?: number
  perPage?: number
  total?: number
  onPageChange?: (page: number) => void
}

function formatValue(v: any): string {
  if (v === null || v === undefined) return '-'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  try { return JSON.stringify(v) } catch { return String(v) }
}

export function Table({ items, columns, emptyText = 'No data', dense = true, page, perPage, total, onPageChange }: TableProps) {
  if (!items || items.length === 0) return <div className="text-sm text-muted-foreground">{emptyText}</div>

  const derivedColumns: ColumnDef[] = columns && columns.length > 0
    ? columns
    : Object.keys(items[0] || {}).map((k) => ({ key: k, label: k }))

  const cellPadding = dense ? 'px-3 py-2' : 'px-4 py-3'
  const headerPadding = dense ? 'px-3 py-2' : 'px-4 py-3'

  const alignClass = (align?: 'left'|'right'|'center') => align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  const getNested = (obj: any, path: string): any => {
    if (!obj) return undefined
    if (!path) return obj
    const parts = path.split('.')
    let cur = obj
    for (const p of parts) {
      if (cur == null) return undefined
      cur = cur[p]
    }
    return cur
  }

  return (
    <div className="space-y-2">
      {/* Minimal three-line table: top line, header separator, bottom line. No side borders or rounded corners. */}
      <div className="overflow-x-auto custom-scrollbar">
        <div>
          <table className="min-w-full text-sm border-y border-gray-300">
            <thead className="border-b border-gray-300">
              <tr className="bg-white">
                {derivedColumns.map((c) => (
                  <th
                    key={c.key}
                    className={`${headerPadding} font-medium text-gray-600 ${alignClass(c.align)}`}
                    style={{ width: c.width }}
                  >
                    {c.label || c.key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={idx} className="bg-white">
                  {derivedColumns.map((c) => {
                    const value = getNested(row, c.key)
                    return (
                      <td key={c.key} className={`${cellPadding} ${alignClass(c.align)} text-foreground break-words`}>{renderCell(value, row, c)}</td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {(typeof page === 'number' && typeof perPage === 'number' && typeof total === 'number') && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>Page {page} of {Math.max(1, Math.ceil(total / perPage))} • {total} items</div>
          <div className="space-x-2">
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => onPageChange && page! > 1 && onPageChange(page! - 1)}
              disabled={page! <= 1}
            >Prev</button>
            <button
              className="px-2 py-1 border rounded disabled:opacity-50"
              onClick={() => onPageChange && page! < Math.ceil(total! / perPage!) && onPageChange(page! + 1)}
              disabled={page! >= Math.ceil(total! / perPage!)}
            >Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
