import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from './components/Header'
import { ComposerRef } from '@features/composer/core'
import { useConversations } from '@/contexts/ConversationsContext'
import { api } from '@/services/api'
import { SessionSidebar } from './components/SessionSidebar'
import { SessionPreviewPanel } from './components/SessionPreviewPanel'
import { useSessionPreview } from './hooks/useSessionPreview'
import { useSidebar } from './hooks/useSidebar'
import { useSessions } from './hooks/useSessions'
import { HomeComposer } from './components/HomeComposer'
import { SettingsModal } from './components/SettingsModal'

// Home page (refactor phase 1):
// - Page-scoped container under pages/home
// - Uses new SessionSidebar and a thin HomeComposer wrapper (via existing Composer)
// - Keeps original components available in src/components per request

export function HomePage() {
  const navigate = useNavigate()
  const composerRef = useRef<ComposerRef>(null)

  // Pull recent directories and helpers from existing context
  const { recentDirectories, getMostRecentWorkingDirectory } = useConversations()

  // Local state for sessions and UI state
  const { sessions, loading: sessionsLoading, error: sessionsError, searchQuery, setSearchQuery, loadSessions, deleteSession } = useSessions()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [currentWorkingDirectory, setCurrentWorkingDirectory] = useState<string>('')
  const [chatMode, setChatMode] = useState<'conversation' | 'canvas'>('conversation')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const preview = useSessionPreview(256)
  const { isOpen: isSidebarOpen, isClosing, panelRef: sessionPanelRef, toggle: toggleSidebar, close: closeSidebar } = useSidebar({ closeDelayMs: 400 })

  const recentWorkingDirectory = useMemo(
    () => getMostRecentWorkingDirectory?.() || './',
    [getMostRecentWorkingDirectory]
  )

  // note: useSessions handles initial and debounced loads

  // Select session and navigate to conversation
  const handleSessionSelect = async (sessionId: string | null) => {
    if (!sessionId) {
      setSelectedSessionId(null)
      setCurrentWorkingDirectory('')
      return
    }

    try {
      const response = await api.getSessionInfo(sessionId)
      setSelectedSessionId(sessionId)
      setCurrentWorkingDirectory(response.data.workingDirectory)
      // Navigate to conversation — let ConversationView handle empty vs existing
      navigate(`/c/${sessionId}`, {
        state: {
          cuiSessionId: sessionId,
          workingDirectory: response.data.workingDirectory,
          isExistingSession: response.data.conversationCount > 0,
        },
      })
    } catch (error) {
      // Fallback: still navigate using default working directory
      setSelectedSessionId(sessionId)
      setCurrentWorkingDirectory(`./sessions/${sessionId}`)
      navigate(`/c/${sessionId}`, {
        state: {
          cuiSessionId: sessionId,
          workingDirectory: `./sessions/${sessionId}`,
          isExistingSession: false,
        },
      })
    }
  }

  // Close preview when sidebar closes
  useEffect(() => {
    if (!isSidebarOpen) preview.onPreviewLeave()
  }, [isSidebarOpen])
  useEffect(() => {
    if (isClosing) preview.onPreviewLeave()
  }, [isClosing])

  // Map permission mode to AIGents API
  const mapPermissionMode = (composerMode?: string): 'yolo' | 'auto' | 'ask' | undefined => {
    switch (composerMode) {
      case 'bypassPermissions':
        return 'yolo'
      case 'acceptEdits':
        return 'auto'
      case 'default':
        return 'ask'
      default:
        return undefined
    }
  }

  // Submit handler: create/ensure session, pass through to ConversationView
  const handleComposerSubmit = async (
    text: string,
    workingDirectory?: string,
    model?: string,
    permissionMode?: string
  ) => {
    // Gather any pending files from composer before state changes
    let pendingFiles: any = null
    if (composerRef.current) {
      const composer = composerRef.current
      const pending = composer.getPendingFiles()
      if (pending?.sourceImage) {
        pendingFiles = {
          sourceImage: { file: pending.sourceImage, name: pending.sourceImage.name },
        }
      }
      composer.clearPendingFiles()
    }

    setIsSubmitting(true)

    try {
      // Ensure we have a session (reuse any existing client/session first)
      let sessionId = selectedSessionId
      if (!sessionId) {
        const existing = api.getAIGentsClient()
        const existingId = existing?.getSessionId()
        if (existingId) {
          sessionId = existingId
        }
      }
      let effectiveWD = currentWorkingDirectory || workingDirectory || recentWorkingDirectory || './'
      if (!effectiveWD || effectiveWD.trim() === '') effectiveWD = './'

      if (!sessionId) {
        const mapped = mapPermissionMode(permissionMode) || 'auto'
        const client = await api.getOrCreateAIGentsClient(undefined, mapped)
        const newId = client.getSessionId()
        if (!newId) throw new Error('Failed to create session')
        sessionId = newId
        setSelectedSessionId(sessionId)
        setCurrentWorkingDirectory(effectiveWD)
      }

      // Navigate to conversation; ConversationView can process pending tags
      navigate(`/c/${sessionId}`, {
        state: {
          cuiSessionId: sessionId,
          workingDirectory: effectiveWD,
          initialPrompt: text,
          pendingFiles,
          hasPendingFiles: !!pendingFiles,
          model: model === 'default' ? undefined : model,
          permissionMode: mapPermissionMode(permissionMode),
          isNewConversation: true,
        },
      })
    } catch (error) {
      alert(`Failed to start conversation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="relative z-50">
        <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} onOpenSettings={() => setShowSettings(true)} />
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* History panel (overlay) */}
        {(isSidebarOpen || isClosing) && (
          <div
            ref={sessionPanelRef}
            className={`absolute top-0 left-0 w-64 h-full bg-white/95 ${
              isClosing ? 'backdrop-blur-none border-transparent pointer-events-none sidebar-exit' : 'backdrop-blur-sm border-gray-200/60 sidebar-enter'
            } border-r z-30 flex flex-col overflow-hidden`}
            style={{ willChange: 'transform, opacity', transform: 'translateZ(0)', contain: 'layout paint style' as any }}
          >
            <SessionSidebar
              sessions={sessions}
              loading={sessionsLoading}
              error={sessionsError}
              selectedSessionId={selectedSessionId}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onReload={() => loadSessions(searchQuery)}
              onSelect={handleSessionSelect}
              onDelete={async (id) => {
                try {
                  await deleteSession(id)
                  if (selectedSessionId === id) setSelectedSessionId(null)
                } catch (e) {
                  alert('Failed to delete session')
                }
              }}
              onHoverStart={(id, rect) => preview.onItemEnter(id, rect)}
              onHoverEnd={() => preview.onItemLeave()}
            />
          </div>
        )}

        {/* Preview Panel overlay */}
        <SessionPreviewPanel
          isOpen={isSidebarOpen && !isClosing && preview.isOpen}
          title={preview.data?.title}
          messages={preview.data?.messages || []}
          loading={preview.loading}
          style={preview.style}
          sessionId={selectedSessionId || undefined}
          onMouseEnter={preview.onPreviewEnter}
          onMouseLeave={preview.onPreviewLeave}
        />

        {/* Main content: center composer */}
        <div className="z-0 mx-auto flex flex-col w-full max-w-2xl h-full justify-center -mt-20 pointer-events-auto">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center">
                <div className="w-[27px] h-[27px] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="4.5 5.2 11.7 13.3" fill="currentColor">
                    <circle cx="10.3613" cy="6.44531" r="1.03516" />
                    <circle cx="5.69336" cy="9.15039" r="1.03516" />
                    <circle cx="15.0195" cy="9.15039" r="1.03516" />
                    <circle cx="5.69336" cy="14.5801" r="1.03516" />
                    <circle cx="15.0195" cy="14.5801" r="1.03516" />
                    <circle cx="10.3613" cy="17.2754" r="1.03516" />
                    <path d="M10.3613 13.4961C11.2695 13.4961 11.9922 12.7734 11.9922 11.8652C11.9922 10.9668 11.25 10.2344 10.3613 10.2344C9.47266 10.2344 8.73047 10.9766 8.73047 11.8652C8.73047 12.7539 9.46289 13.4961 10.3613 13.4961Z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-semibold font-sans text-foreground">What is the next task?</h1>
            </div>
            <div className="w-full">
              <HomeComposer
                ref={composerRef}
                workingDirectory={currentWorkingDirectory || recentWorkingDirectory}
                onSubmit={handleComposerSubmit}
                isLoading={isSubmitting}
                recentDirectories={recentDirectories}
                getMostRecentWorkingDirectory={getMostRecentWorkingDirectory}
                mode={chatMode}
                onModeChange={setChatMode}
              />
            </div>
          </div>
        </div>
        <SettingsModal open={showSettings} onOpenChange={setShowSettings} sessionId={selectedSessionId} />
      </div>
    </div>
  )
}
