import React from 'react'
import ReactMarkdown from 'react-markdown'

type SmartMarkdownProps = {
  text: string
  components?: any
}

// Very small, dependency‑free parser for simple GitHub‑style pipe tables.
// Detects blocks shaped like:
// | h1 | h2 |
// | --- | --- |
// | c1 | c2 |
function isSeparatorRow(line: string): boolean {
  const cleaned = line.trim()
  if (!cleaned.includes('|')) return false
  // allow ":---", "---:", or "---" segments separated by pipes
  const segs = cleaned.split('|').map((s) => s.trim()).filter(Boolean)
  if (segs.length < 1) return false
  return segs.every((s) => /^:?-{3,}:?$/.test(s))
}

function splitCells(line: string): string[] {
  // remove leading/trailing pipes and split
  const trimmed = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '')
  return trimmed.split('|').map((c) => c.trim())
}

function parseTable(lines: string[], start: number) {
  const header = splitCells(lines[start])
  // skip separator at start+1
  const rows: string[][] = []
  let i = start + 2
  for (; i < lines.length; i++) {
    const l = lines[i]
    if (!l.includes('|') || l.trim() === '') break
    rows.push(splitCells(l))
  }
  return { end: i, header, rows }
}

export const SmartMarkdown: React.FC<SmartMarkdownProps> = ({ text, components }) => {
  const lines = text.split(/\r?\n/)
  const parts: Array<React.ReactNode> = []
  let i = 0
  let acc: string[] = []

  const flushAcc = () => {
    if (acc.length) {
      parts.push(<ReactMarkdown key={`md-${parts.length}`} components={components}>{acc.join('\n')}</ReactMarkdown>)
      acc = []
    }
  }

  while (i < lines.length) {
    const l = lines[i]
    const next = lines[i + 1]
    if (l.includes('|') && next && isSeparatorRow(next)) {
      flushAcc()
      const { end, header, rows } = parseTable(lines, i)
      parts.push(
        <div key={`tbl-${parts.length}`} className="overflow-x-auto custom-scrollbar">
          <div>
            <table className="min-w-full text-sm border-y border-gray-300">
              <thead className="border-b border-gray-300">
                <tr className="bg-white">
                  {header.map((h, idx) => (
                    <th key={idx} className="px-3 py-2 font-medium text-gray-600 text-left">{h || '-'}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, ri) => (
                  <tr key={ri} className="bg-white">
                    {header.map((_, ci) => (
                      <td key={ci} className="px-3 py-2 text-foreground break-words">{r[ci] ?? '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
      i = end
      continue
    }
    acc.push(l)
    i++
  }
  flushAcc()
  return <>{parts}</>
}
