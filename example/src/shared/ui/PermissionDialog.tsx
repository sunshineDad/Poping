import React, { useState } from 'react'
import { ToolLabel, ToolContent } from '@features/tool-render'
import { AlertTriangle, Check, X } from 'lucide-react'
import { Button } from '@shared/ui'
import type { PermissionRequest } from '@shared/types'

interface PermissionDecision {
  action: 'approve' | 'deny'
  modifiedInput?: Record<string, any>
  denyReason?: string
}

interface PermissionDialogProps {
  request: PermissionRequest
  onDecision: (decision: PermissionDecision) => void
}

export function PermissionDialog({ request, onDecision }: PermissionDialogProps) {
  const [denyReason, setDenyReason] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  if (!request) return null

  const handleAllow = () => onDecision({ action: 'approve' })
  const handleDeny = () => onDecision({ action: 'deny', denyReason: denyReason || 'User denied the tool use' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fadeIn" />
      <div className="relative w-full max-w-lg mx-4 conversation-fade-in">
        <div className="bg-background border border-border rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <AlertTriangle size={16} className="text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Permission Required</h3>
                <p className="text-sm text-muted-foreground">Claude wants to run a tool</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <ToolLabel toolName={request.toolName} toolInput={request.toolInput} />
              <div className="mt-3">
                <ToolContent toolName={request.toolName} toolInput={request.toolInput} />
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200/60 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800">This tool will access your system. Review the details above before allowing.</p>
            </div>

            <div className="mb-4">
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span className={`transform transition-transform mr-1 ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
                Advanced Options
              </button>
              {showAdvanced && (
                <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Deny Reason (optional):</label>
                    <input type="text" value={denyReason} onChange={(e) => setDenyReason(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background" placeholder="Explain why you're denying this request..." />
                    <p className="text-xs text-muted-foreground mt-1">This helps Claude understand and adjust its approach</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="secondary" size="sm" onClick={handleDeny} className="flex items-center gap-2">
                <X size={14} />
                Deny
              </Button>
              <Button variant="default" size="sm" onClick={handleAllow} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                <Check size={14} />
                Allow
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
