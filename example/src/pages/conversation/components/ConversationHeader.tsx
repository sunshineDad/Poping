import React, { useState, useEffect } from 'react'
import { ArrowLeft, Check, X, FolderOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '@services'
import { Button, Input, Tooltip, TooltipProvider } from '@shared/ui'

interface ConversationHeaderProps {
  title: string
  sessionId?: string
  isArchived?: boolean
  isPinned?: boolean
  subtitle?: {
    date?: string
    repo?: string
    commitSHA?: string
    changes?: { additions: number; deletions: number }
  }
  onTitleUpdate?: (newTitle: string) => void
  onPinToggle?: (isPinned: boolean) => void
  onBack?: () => void
  onResourcesToggle?: () => void
}

export function ConversationHeader({
  title,
  sessionId,
  isArchived = false,
  isPinned = false,
  subtitle,
  onTitleUpdate,
  onPinToggle,
  onBack,
  onResourcesToggle,
}: ConversationHeaderProps) {
  const navigate = useNavigate()
  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState(title)
  const [localTitle, setLocalTitle] = useState(title)

  useEffect(() => {
    setLocalTitle(title)
    if (!isRenaming) setNewTitle(title)
  }, [title, isRenaming])

  const handleBack = () => (onBack ? onBack() : navigate('/'))

  const handleRenameSubmit = async () => {
    if (newTitle.trim() && newTitle !== localTitle && sessionId) {
      try {
        const trimmedTitle = newTitle.trim()
        setLocalTitle(trimmedTitle)
        onTitleUpdate?.(trimmedTitle)
        const result = await api.updateSessionTitle(sessionId, trimmedTitle)
        if (!result.success) {
          setLocalTitle(localTitle)
          onTitleUpdate?.(localTitle)
        }
      } catch (error) {
        console.error('Failed to rename session:', error)
      }
    }
    setIsRenaming(false)
  }

  const handleRenameCancel = () => {
    setIsRenaming(false)
    setNewTitle(localTitle)
  }

  const handlePinToggle = async (pinned: boolean) => {
    if (!sessionId) return
    onPinToggle?.(pinned)
  }

  return (
    <TooltipProvider>
      <div className="flex justify-between items-center gap-3 p-3 border-b border-border/50 bg-background transition-colors relative z-50">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <Tooltip content="返回" side="bottom">
            <Button variant="ghost" size="sm" onClick={handleBack} aria-label="返回" className="flex items-center justify-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <ArrowLeft size={20} />
            </Button>
          </Tooltip>
          <div className="w-px h-4 bg-border mx-1" />
          <div className="flex flex-col min-w-0 gap-0.5">
            <div className="flex items-center gap-3">
              {isRenaming ? (
                <div className="flex items-center gap-1.5 flex-1">
                  <Input
                    value={newTitle}
                    onChange={(e: any) => setNewTitle(e.target.value)}
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter') handleRenameSubmit()
                      else if (e.key === 'Escape') handleRenameCancel()
                    }}
                    className="h-8 px-3 text-sm flex-1 font-medium max-w-md focus:outline-none focus:ring-0 focus:border-border"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" onClick={handleRenameSubmit} className="h-7 w-7 rounded-full hover:bg-muted/50">
                    <Check size={16} strokeWidth={2.5} className="text-foreground" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleRenameCancel} className="h-7 w-7 rounded-full hover:bg-muted/50">
                    <X size={16} strokeWidth={2.5} className="text-foreground" />
                  </Button>
                </div>
              ) : (
                <button onClick={() => setIsRenaming(true)} className="font-medium text-sm text-foreground overflow-hidden text-ellipsis whitespace-nowrap hover:text-blue-600 transition-colors cursor-pointer text-left relative z-50" title="Click to rename">
                  {localTitle}
                </button>
              )}
            </div>
            {subtitle && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {subtitle.date && <span className="overflow-hidden text-ellipsis whitespace-nowrap">{subtitle.date}</span>}
                {subtitle.repo && <span className="overflow-hidden text-ellipsis whitespace-nowrap">{subtitle.repo}</span>}
                {subtitle.commitSHA && <span className="overflow-hidden text-ellipsis whitespace-nowrap">{subtitle.commitSHA.slice(0, 7)}</span>}
                {subtitle.changes && (
                  <span className="flex gap-2 font-medium">
                    <span className="text-green-600">+{subtitle.changes.additions}</span>
                    <span className="text-red-600">-{subtitle.changes.deletions}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onResourcesToggle && (
            <Tooltip content="查看资源" side="bottom">
              <Button variant="ghost" size="sm" onClick={onResourcesToggle} aria-label="查看资源" className="flex items-center justify-center px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <FolderOpen size={18} />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

