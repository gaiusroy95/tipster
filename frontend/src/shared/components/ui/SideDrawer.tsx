import { type ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'
import { Button } from './Button'

interface SideDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  header?: ReactNode
  children: ReactNode
  className?: string
}

export function SideDrawer({ open, onClose, title, header, children, className }: SideDrawerProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={title || header ? 'drawer-title' : undefined}
            className={cn(
              'absolute inset-y-0 left-0 flex w-[min(280px,88vw)] flex-col border-r border-border-default bg-bg-surface shadow-elevated safe-area-pt safe-area-pb',
              className,
            )}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
          >
            {(title || header) && (
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-default px-4 py-3">
                <div className="min-w-0 flex-1">
                  {header ?? (
                    <h2 id="drawer-title" className="text-base font-semibold">{title}</h2>
                  )}
                  {header && <span id="drawer-title" className="sr-only">Browse sports</span>}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close menu" className="shrink-0 -mr-1">
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>
            )}
            <div className="scrollbar-panel flex-1 overflow-y-auto overscroll-contain px-3 py-4">
              {children}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
