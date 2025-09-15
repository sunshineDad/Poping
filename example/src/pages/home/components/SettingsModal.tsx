import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/ui/dialog'
import { PermissionsSettings } from './PermissionsSettings'
import { MCPSettings } from './MCPSettings'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId?: string | null
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange, sessionId }) => {
  const [activeTab, setActiveTab] = useState<'permissions'|'mcps'>('permissions')

  const TabButton: React.FC<{ value: 'permissions'|'mcps'; label: string }> = ({ value, label }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={[
        'px-3 py-1.5 text-sm rounded-md transition-colors',
        'hover:bg-gray-100',
        activeTab === value ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
      ].join(' ')}
    >
      {label}
    </button>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-4">
          <TabButton value="permissions" label="Permissions" />
          <TabButton value="mcps" label="MCPs" />
        </div>

        {/* Content */}
        <div>
          {activeTab === 'permissions' && (
            <PermissionsSettings sessionId={sessionId} />
          )}
          {activeTab === 'mcps' && (
            <MCPSettings sessionId={sessionId} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
