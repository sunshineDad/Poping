import React, { useEffect, useMemo, useState } from 'react'
import { api } from '@/services'
import { Button } from '@shared/ui'

interface MCPSettingsProps {
  sessionId?: string | null
}

type FeatureMap = Record<string, boolean>

export const MCPSettings: React.FC<MCPSettingsProps> = ({ sessionId }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [available, setAvailable] = useState<Record<string, { description?: string; tools?: string[] }>>({})
  const [features, setFeatures] = useState<FeatureMap>({})
  const [initial, setInitial] = useState<FeatureMap>({})
  const [useAsDefault, setUseAsDefault] = useState(false)

  const changed = useMemo(() => JSON.stringify(features) !== JSON.stringify(initial), [features, initial])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const avail = await api.getAvailableFeatures()
        let current: FeatureMap = {}
        // Load stored defaults for new sessions
        let storedDefaults: FeatureMap = {}
        try { storedDefaults = JSON.parse(localStorage.getItem('aigents_default_features') || '{}') } catch {}
        if (sessionId) {
          try {
            const cfg = await api.getSessionConfig(sessionId)
            current = (cfg?.features as FeatureMap) || {}
          } catch (e) {
            console.warn('Failed to load session config:', e)
          }
        }
        const enabled: FeatureMap = {}
        for (const key of Object.keys(avail)) {
          // If a session is selected, prefer its current flags; else prefer stored defaults
          enabled[key] = sessionId ? Boolean(current[key]) : Boolean(storedDefaults[key])
        }
        setAvailable(avail)
        setFeatures(enabled)
        setInitial(enabled)
      } catch (e) {
        console.warn('Failed to load MCP settings:', e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [sessionId])

  const toggle = (key: string) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      // Save defaults if requested
      if (useAsDefault) {
        try {
          localStorage.setItem('aigents_default_features', JSON.stringify(features || {}))
        } catch {}
      }
      // Update current session if available
      if (sessionId) {
        await api.updateSessionConfig(sessionId, { features })
        alert('MCP configuration updated for this session. The agent will restart to apply changes.')
      } else if (useAsDefault) {
        alert('Default MCP configuration saved. It will be used for new sessions.')
      }
      setInitial(features)
    } catch (e) {
      alert('Failed to update MCP configuration')
    } finally {
      setSaving(false)
    }
  }

  const keys = Object.keys(available)

  return (
    <div>
      <div className="mb-3">
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-3 w-12">Enable</th>
                  <th className="py-2 pr-3">MCP Name</th>
                  <th className="py-2">MCP Tools</th>
                </tr>
              </thead>
              <tbody>
                {keys.map(key => (
                  <tr key={key} className="align-top border-t border-gray-200">
                    <td className="py-2 pr-3">
                      <input type="checkbox" checked={!!features[key]} onChange={() => toggle(key)} disabled={!sessionId && !useAsDefault} />
                    </td>
                    <td className="py-2 pr-3">
                      <div className="font-medium">{key}</div>
                      {available[key]?.description && (
                        <div className="text-xs text-muted-foreground">{available[key]?.description}</div>
                      )}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {(available[key]?.tools || []).map(t => (
                          <span key={t} className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs">{t}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={useAsDefault} onChange={() => setUseAsDefault(v => !v)} />
          Use as default for new sessions
        </label>
        <Button onClick={handleSave} disabled={(!sessionId && !useAsDefault) || !changed || saving || loading}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {useAsDefault && <>Defaults will be applied when creating new sessions.</>}
        {!useAsDefault && sessionId && <>Changes require restarting the agent; this happens automatically after saving.</>}
        {!useAsDefault && !sessionId && <>Select a session or enable "Use as default" to edit MCPs.</>}
      </div>
    </div>
  )}
