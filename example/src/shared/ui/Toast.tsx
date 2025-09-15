import React, { useEffect, useState } from 'react'

type ToastItem = { id: number; message: string; type?: 'info' | 'success' | 'error' }

export function showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
  window.dispatchEvent(new CustomEvent('toast', { detail: { message, type } }))
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent
      const { message, type } = ce.detail || {}
      if (!message) return
      const id = Date.now() + Math.random()
      setItems((prev) => [...prev, { id, message, type }])
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2500)
    }
    window.addEventListener('toast', handler as EventListener)
    return () => window.removeEventListener('toast', handler as EventListener)
  }, [])

  const color = (t?: string) => (t === 'success' ? 'bg-green-600' : t === 'error' ? 'bg-red-600' : 'bg-neutral-800')

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {items.map((t) => (
        <div key={t.id} className={`text-white text-xs px-3 py-2 rounded shadow ${color(t.type)} bg-opacity-95`}>{t.message}</div>
      ))}
    </div>
  )
}

