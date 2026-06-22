import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { BetSlipPanelContent } from '@/features/betting/components/BetSlipPanelContent'
import { BetSlipIcon } from '@/features/betting/components/BetSlipIcon'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'
import { Badge } from '@/shared/components/ui/Badge'

export function BetSlipChatPanel() {
  const user = useAuthStore((s) => s.user)
  const selections = useBetSlipStore((s) => s.selections)
  const isPanelOpen = useBetSlipStore((s) => s.isPanelOpen)
  const togglePanel = useBetSlipStore((s) => s.togglePanel)
  const setPanelOpen = useBetSlipStore((s) => s.setPanelOpen)

  if (!user) return null

  const slipCount = selections.length

  return (
    <div
      className={cn(
        'fixed z-[45] flex flex-col items-end gap-2 pointer-events-none',
        'right-3 sm:right-4 lg:right-6',
        'bottom-[calc(var(--layout-sticky-offset)+0.5rem)] xl:bottom-6',
      )}
      aria-label="Bet slip"
    >
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="pointer-events-auto w-[min(100vw-1.5rem,520px)] min-w-[min(100%,320px)] max-h-[min(72vh,560px)] flex flex-col rounded-2xl border border-border-default/80 bg-bg-surface shadow-elevated overflow-hidden"
            role="dialog"
            aria-label="Bet slip panel"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border-default px-4 py-3 bg-gradient-to-r from-accent-secondary/20 to-bg-elevated">
              <div className="flex items-center gap-3 min-w-0">
                <BetSlipIcon size="sm" />
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm leading-tight">Bet slip</p>
                  <p className="text-[11px] text-text-muted font-mono tabular-nums">
                    Balance {formatCredits(user.balance)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-elevated hover:text-text-primary transition-colors"
                aria-label="Minimize bet slip"
              >
                <ChevronDownIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="scrollbar-panel flex-1 overflow-y-auto overscroll-contain px-4 py-3">
              <BetSlipPanelContent compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={togglePanel}
        className={cn(
          'pointer-events-auto flex items-center gap-2.5 rounded-2xl pl-3 pr-4 py-2.5 min-h-[48px]',
          'bg-gradient-to-r from-accent-secondary to-indigo-500 text-white font-semibold text-sm shadow-glow-accent',
          'hover:opacity-95 transition-opacity border border-accent-secondary/30',
          isPanelOpen && 'ring-2 ring-accent-secondary/40',
        )}
        aria-expanded={isPanelOpen}
        aria-label={`Bet slip, ${slipCount} selections`}
      >
        <BetSlipIcon size="sm" className="text-white" />
        <span className="font-display">Bet slip</span>
        {slipCount > 0 && (
          <Badge variant="live" className="bg-accent-live text-white border-0 min-w-[22px]">
            {slipCount}
          </Badge>
        )}
        <span className="font-mono text-xs tabular-nums opacity-90 hidden sm:inline">
          {formatCredits(user.balance)}
        </span>
        {isPanelOpen ? (
          <ChevronDownIcon className="h-4 w-4 opacity-80" aria-hidden="true" />
        ) : (
          <ChevronUpIcon className="h-4 w-4 opacity-80" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
