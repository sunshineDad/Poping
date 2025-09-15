import React, { forwardRef } from 'react'
import { ComposerCore, type ComposerRef } from '@/features/composer/core'
import { ModeSelector } from '@shared/ui'
import { api } from '@/services/api'

interface Props {
  workingDirectory: string
  onSubmit: (text: string, workingDirectory?: string, model?: string, permissionMode?: string) => void
  isLoading?: boolean
  recentDirectories: Record<string, { lastDate: string; shortname: string }>
  getMostRecentWorkingDirectory?: () => string
  mode: 'conversation' | 'canvas'
  onModeChange: (m: 'conversation' | 'canvas') => void
}

export const HomeComposer = forwardRef<ComposerRef, Props>(function HomeComposer(
  {
    workingDirectory,
    onSubmit,
    isLoading,
    recentDirectories,
    getMostRecentWorkingDirectory,
    mode,
    onModeChange,
  },
  ref
) {
  return (
    <ComposerCore
      ref={ref}
      workingDirectory={workingDirectory}
      onSubmit={onSubmit}
      isLoading={isLoading}
      placeholder="Describe your task"
      showDirectorySelector={false}
      showModelSelector={false}
      enableFileAutocomplete={true}
      useStructuredEditor={false}
      useUnifiedEditor={true}
      recentDirectories={recentDirectories}
      getMostRecentWorkingDirectory={getMostRecentWorkingDirectory}
      sessionSelector={<ModeSelector mode={mode} onModeChange={onModeChange} />}
      onFetchFileSystem={async (directory: string) => {
        const response = await api.listDirectory({
          path: directory,
          recursive: true,
          respectGitignore: true,
        })
        return response.entries.map((entry) => ({
          ...entry,
          type: entry.type as 'file' | 'directory',
          depth: 0,
        }))
      }}
      onFetchCommands={async (wd?: string) => {
        const response = await api.getCommands(wd || './')
        return response.commands
      }}
      enableFileUpload={true}
    />
  )
})
