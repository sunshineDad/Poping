import React, { useEffect, useState } from 'react'
import { api } from '@/services'
import { Button, Input, Tooltip } from '@shared/ui'

interface PermissionsSettingsProps {
  sessionId?: string | null
}

export const PermissionsSettings: React.FC<PermissionsSettingsProps> = ({ sessionId }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<'ask'|'auto'|'yolo'>('auto')
  const [autoAllow, setAutoAllow] = useState<string>('')
  const [autoPrompt, setAutoPrompt] = useState<string>('')
  const [overridesText, setOverridesText] = useState<string>('')

  // Make this view read-only per design (non-interactive)
  const canEdit = false

  useEffect(() => {
    const run = async () => {
      if (!sessionId) return
      try {
        setLoading(true)
        const cfg = await api.getPermissionsConfig(sessionId)
        setMode((cfg.mode as any) || 'auto')
        const a = cfg.auto || {}
        setAutoAllow((a.allow || []).join('\n'))
        setAutoPrompt((a.prompt || []).join('\n'))
        setOverridesText(JSON.stringify(cfg.overrides || {}, null, 2))
      } catch (e) {
        console.warn('Failed to load permissions config:', e)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [sessionId])

  const handleSave = async () => {
    if (!sessionId) return
    try {
      setSaving(true)
      let overrides: Record<string, 'allow'|'prompt'> = {}
      try { overrides = JSON.parse(overridesText || '{}') } catch { /* ignore */ }
      const auto = {
        allow: autoAllow.split('\n').map(s => s.trim()).filter(Boolean),
        prompt: autoPrompt.split('\n').map(s => s.trim()).filter(Boolean),
      }
      await api.updatePermissionsConfig(sessionId, { mode, auto, overrides })
      alert('Permissions updated')
    } catch (e) {
      alert('Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-3">
        <div className="font-medium mb-1">Permission Mode</div>
        <div className="flex gap-3 items-center">
          {(['ask','auto','yolo'] as const).map(m => (
            <label key={m} className={`flex items-center gap-2 text-sm ${mode===m? 'font-semibold' : '' }`}>
              <input type="radio" name="perm-mode" value={m} checked={mode===m} onChange={() => setMode(m)} disabled />
              {m.toUpperCase()}
            </label>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <div className="font-medium mb-1">Auto Mode Rules</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Allow patterns (one per line)</div>
            <textarea className="w-full border rounded p-2 text-sm" rows={6} value={autoAllow} readOnly disabled />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Prompt patterns (one per line)</div>
            <textarea className="w-full border rounded p-2 text-sm" rows={6} value={autoPrompt} readOnly disabled />
          </div>
        </div>
      </div>
      <div className="mb-3">
        <div className="font-medium mb-1">Per-tool Overrides (JSON)</div>
        <textarea className="w-full border rounded p-2 text-sm" rows={6} value={overridesText} readOnly disabled />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled className="pointer-events-none opacity-60">Save</Button>
      </div>
    </div>
  )
}
