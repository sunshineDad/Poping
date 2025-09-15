import React from 'react'
import { Settings } from 'lucide-react'
import { useTheme } from '@shared/hooks'

interface HeaderProps {
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onOpenSettings?: () => void
}

export function Header({ isSidebarOpen, onToggleSidebar, onOpenSettings }: HeaderProps) {
  const theme = useTheme()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between p-3 h-[75px] bg-background font-semibold">
        <div className="relative flex items-center justify-between w-full px-1 pt-6 pb-2">
          <div className="ml-4 flex items-center" data-history-button>
            {isSidebarOpen ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-base font-semibold text-gray-800">History Conversation</span>
              </div>
            ) : (
              <button onClick={onToggleSidebar} className="flex items-center gap-2 px-3 py-2 rounded-md transition-all bg-white shadow-sm hover:shadow hover:bg-gray-50" title="Toggle history">
                <span className="text-base font-medium text-gray-700">History</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <nav className="flex items-center gap-2">
            <button className="relative w-[30px] h-[30px] rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors" aria-label="Open Settings" onClick={onOpenSettings} title="Settings">
              <Settings size={18} className="text-gray-600" />
            </button>
          </nav>
        </div>
      </header>
  )
}
