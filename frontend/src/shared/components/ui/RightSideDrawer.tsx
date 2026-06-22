import { type ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'
import { Button } from './Button'

interface RightSideDrawerProps {
  open: boolean
  onClose: () => void
  title?: string
  header?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
  widthClass?: string
  onBack?: () => void
}

export function RightSideDrawer({
  open,
  onClose,
  title,
  header,
  children,
  footer,
  className,
  contentClassName,
  widthClass = 'w-[min(360px,92vw)]',
  onBack,
}: RightSideDrawerProps) {
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
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={title || header ? 'right-drawer-title' : undefined}
            className={cn(
              'absolute inset-y-0 right-0 flex flex-col border-l border-border-default bg-bg-surface shadow-elevated safe-area-pt safe-area-pb',
              widthClass,
              className,
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
          >
            {(title || header) && (
              <div className="flex shrink-0 items-center gap-2 border-b border-border-default px-3 py-3 sm:px-4">
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
                    aria-label="Go back"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                ) : (
                  <span className="w-2 shrink-0" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  {header ?? (
                    <h2 id="right-drawer-title" className="text-base font-semibold truncate">
                      {title}
                    </h2>
                  )}
                  {header && <span id="right-drawer-title" className="sr-only">{title}</span>}
                </div>
                {!onBack && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label="Close"
                    className="shrink-0 -mr-1"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}
            <div className={cn('scrollbar-panel flex-1 overflow-y-auto overscroll-contain', contentClassName)}>
              {children}
            </div>
            {footer && (
              <div className="shrink-0 border-t border-border-default bg-bg-surface/95 p-4 safe-area-pb">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
