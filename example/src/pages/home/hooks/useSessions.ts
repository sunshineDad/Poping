import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, type SessionConfig } from '@/services/api'

export function useSessions() {
  const [sessions, setSessions] = useState<(SessionConfig & { displayName?: string })[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const loadSessions = useCallback(async (search?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.getSessions(search)
      const enhanced = response.data.sessions.map((s) => ({ ...s }))
      setSessions(enhanced)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  // initial load
  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => loadSessions(searchQuery), 250)
    return () => clearTimeout(t)
  }, [searchQuery, loadSessions])

  const deleteSession = useCallback(async (id: string) => {
    await api.deleteSessionInfo(id)
    // reload list with current filter
    await loadSessions(searchQuery)
  }, [searchQuery, loadSessions])

  return {
    sessions,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    loadSessions,
    deleteSession,
  }
}

