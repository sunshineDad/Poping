import React, { useState } from 'react'
import { CornerDownRight } from 'lucide-react'
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages/messages'
import type { ChatMessage, ToolResult } from '@shared/types'
import { ReadTool } from './tools/ReadTool'
import { EditTool } from './tools/EditTool'
import { WriteTool } from './tools/WriteTool'
import { BashTool } from './tools/BashTool'
import { SearchTool } from './tools/SearchTool'
import { TodoTool } from './tools/TodoTool'
import { WebTool } from './tools/WebTool'
import { TaskTool } from './tools/TaskTool'
import { PlanTool } from './tools/PlanTool'
import { FallbackTool } from './tools/FallbackTool'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@shared/ui'
import { MCPTool } from './mcp'

interface ToolContentProps {
  toolName: string
  toolInput: any
  toolResult?: ToolResult
  workingDirectory?: string
  toolUseId?: string
  childrenMessages?: Record<string, ChatMessage[]>
  toolResults?: Record<string, any>
}

export function ToolContent({ toolName, toolInput, toolResult, workingDirectory, toolUseId, childrenMessages, toolResults }: ToolContentProps) {
  const [isErrorExpanded, setIsErrorExpanded] = useState(false)

  const getResultContent = (): string => {
    if (!toolResult?.result) return ''
    if (typeof toolResult.result === 'string') return toolResult.result
    if (Array.isArray(toolResult.result)) {
      return toolResult.result
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n')
    }
    return ''
  }

  const resultContent = getResultContent()
  const isError = toolResult?.is_error === true
  const isPending = toolResult?.status === 'pending'

  if (isPending) {
    return (
      <div className="flex flex-col gap-1 -mt-0.5">
        <div className="text-sm text-muted-foreground flex items-center gap-1">
          <CornerDownRight size={12} className="animate-pulse" />
          {toolName} running...
        </div>
      </div>
    )
  }

  if (isError) {
    const errorMessage = resultContent || 'Tool execution failed'
    const firstLine = errorMessage.split('\n')[0].trim()
    return (
      <div className="flex flex-col gap-1 -mt-0.5">
        <Collapsible open={isErrorExpanded} onOpenChange={setIsErrorExpanded}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-red-600 cursor-pointer select-none hover:text-red-700 font-medium" aria-label="Toggle error details">
            <CornerDownRight size={12} className={`transition-transform duration-200 ${isErrorExpanded ? 'rotate-90' : ''}`} />
            Error: {firstLine}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="text-red-700 bg-red-50 rounded-lg p-3 border border-red-200 text-sm font-mono mt-2">{errorMessage}</div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  const safeToolName = typeof toolName === 'string' && toolName.length > 0 ? toolName : 'Tool'

  switch (toolName) {
    case 'Read':
      return <ReadTool input={toolInput} result={resultContent} workingDirectory={workingDirectory} />
    case 'Edit':
    case 'MultiEdit':
      return <EditTool input={toolInput} result={resultContent} isMultiEdit={toolName === 'MultiEdit'} workingDirectory={workingDirectory} />
    case 'Write':
      return <WriteTool input={toolInput} result={resultContent} workingDirectory={workingDirectory} />
    case 'Bash':
      return <BashTool input={toolInput} result={resultContent} />
    case 'Grep':
    case 'Glob':
    case 'LS':
      return <SearchTool input={toolInput} result={resultContent} toolType={toolName} />
    case 'TodoRead':
    case 'TodoWrite':
      return <TodoTool input={toolInput} result={resultContent} isWrite={toolName === 'TodoWrite'} />
    case 'WebSearch':
    case 'WebFetch':
      return <WebTool input={toolInput} result={resultContent} toolType={toolName} />
    case 'Task':
      return <TaskTool input={toolInput} result={resultContent} toolUseId={toolUseId} childrenMessages={childrenMessages} toolResults={toolResults} />
    case 'exit_plan_mode':
      return <PlanTool input={toolInput} result={resultContent} />
    default:
      if (typeof toolName === 'string' && toolName.startsWith('mcp__')) {
        return (
          <MCPTool
            toolName={toolName}
            toolInput={toolInput}
            toolResult={toolResult}
          />
        )
      }
      if (toolResult && toolResult.status === 'completed' && resultContent) return <FallbackTool toolName={safeToolName} input={toolInput} result={resultContent} />
      if (toolResult && (toolResult.status === 'success' || toolResult.status === 'completed'))
        return (
          <div className="flex flex-col gap-1 -mt-0.5">
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <CornerDownRight size={12} />
              {safeToolName} completed successfully
            </div>
          </div>
        )
      return <FallbackTool toolName={safeToolName} input={toolInput} result={resultContent} />
  }
}
