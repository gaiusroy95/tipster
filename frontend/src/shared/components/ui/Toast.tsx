/* eslint-disable react-refresh/only-export-components */
import { type ReactNode, createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed right-4 z-[60] flex flex-col gap-2 max-w-sm toast-offset lg:bottom-4" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`rounded-lg px-4 py-3 text-sm font-medium shadow-elevated border ${
                t.type === 'success'
                  ? 'bg-accent-win/20 border-accent-win/30 text-accent-win'
                  : t.type === 'error'
                    ? 'bg-accent-loss/20 border-accent-loss/30 text-accent-loss'
                    : 'bg-bg-elevated border-border-default text-text-primary'
              }`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
