import React from 'react'
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages/messages'
import type { ChatMessage, ToolResult } from '@shared/types'
import { ToolLabel } from './ToolLabel'
import { ToolContent } from './ToolContent'

interface ToolUseRendererProps {
  toolUse: ContentBlockParam
  result?: ToolResult
  workingDirectory?: string
  childrenMessages?: Record<string, ChatMessage[]>
  toolResults?: Record<string, any>
}

export function ToolUseRenderer({ toolUse, result, workingDirectory, childrenMessages, toolResults }: ToolUseRendererProps) {
  const name = (toolUse as any).name || 'Tool'
  const input = (toolUse as any).input || {}

  return (
    <div className="flex flex-col gap-1 -mt-0.5">
      <ToolLabel name={name} input={input} />
      <ToolContent
        toolName={name}
        toolInput={input}
        toolResult={result}
        workingDirectory={workingDirectory}
        toolUseId={(toolUse as any).id}
        childrenMessages={childrenMessages}
        toolResults={toolResults}
      />
    </div>
  )
}

