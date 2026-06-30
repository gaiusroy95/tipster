/* eslint-disable react-refresh/only-export-components */
import { type ReactNode, createContext, useContext, useState, useCallback } from 'react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/shared/utils/cn'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextValue {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toastStyles: Record<
  Toast['type'],
  { container: string; icon: string; Icon: typeof CheckCircleIcon }
> = {
  success: {
    container: 'border-accent-win/35 bg-bg-surface/95 text-accent-win',
    icon: 'text-accent-win',
    Icon: CheckCircleIcon,
  },
  error: {
    container: 'border-accent-loss/35 bg-bg-surface/95 text-accent-loss',
    icon: 'text-accent-loss',
    Icon: ExclamationCircleIcon,
  },
  info: {
    container: 'border-border-default bg-bg-surface/95 text-text-primary',
    icon: 'text-accent-secondary',
    Icon: InformationCircleIcon,
  },
}

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
      <div
        className={cn(
          'pointer-events-none fixed inset-x-0 top-[calc(var(--layout-header-height)+0.5rem)] z-[70]',
          'flex flex-col items-center gap-2 px-4 safe-area-pt',
          'lg:inset-x-auto lg:right-4 lg:top-4 lg:items-end lg:px-0 lg:max-w-sm',
        )}
        aria-live="polite"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const style = toastStyles[t.type]
            const Icon = style.Icon

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ type: 'tween', duration: 0.2 }}
                className={cn(
                  'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3.5',
                  'text-sm font-medium shadow-elevated backdrop-blur-md',
                  style.container,
                )}
              >
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', style.icon)} aria-hidden="true" />
                <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
              </motion.div>
            )
          })}
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
