import { useCallback, useEffect, useRef, useState } from 'react'

export function useSidebar(options?: { closeDelayMs?: number; historyButtonSelector?: string }) {
  const { closeDelayMs = 400, historyButtonSelector = '[data-history-button]' } = options || {}

  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const open = useCallback(() => setIsOpen(true), [])

  const close = useCallback(() => {
    setIsClosing(true)
    window.setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, closeDelayMs)
  }, [closeDelayMs])

  const toggle = useCallback(() => {
    if (isOpen) close()
    else open()
  }, [isOpen, close, open])

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && panelRef.current.contains(event.target as Node)) return
      const target = event.target as Element
      if (historyButtonSelector && target.closest(historyButtonSelector)) return
      close()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, close, historyButtonSelector])

  return { isOpen, isClosing, panelRef, open, close, toggle }
}

