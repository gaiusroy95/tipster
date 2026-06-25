import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { BetSlipPanelContent } from '@/features/betting/components/BetSlipPanelContent'
import { BetSlipIcon } from '@/features/betting/components/BetSlipIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'

/** Shared width for bet slip panel and launcher bar. */
const BET_SLIP_WIDTH =
  'w-full sm:w-[min(calc(100vw-1.5rem),440px)] xl:w-[400px]'

/** Aligns fixed bet slip with the right profile column inside max-w-[1800px] layout. */
const BET_SLIP_POSITION = cn(
  'fixed z-[45] flex flex-col gap-2 pointer-events-none',
  'bottom-[calc(var(--layout-sticky-offset)+0.5rem)] xl:bottom-6',
  'left-2 right-2 items-stretch',
  'sm:left-auto sm:right-4 sm:items-end',
  'lg:right-6',
  'xl:right-[max(1.5rem,calc((100vw-min(100vw,1800px))/2+1.5rem))]',
)

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
      className={BET_SLIP_POSITION}
      aria-label="Bet slip"
    >
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className={cn(
              'pointer-events-auto flex flex-col',
              BET_SLIP_WIDTH,
              'max-h-[min(72vh,560px)] overflow-hidden rounded-2xl',
              'border border-border-default/80 bg-bg-surface shadow-elevated',
            )}
            role="dialog"
            aria-label="Bet slip panel"
          >
            <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border-default/60 bg-gradient-to-r from-accent-secondary/20 to-bg-elevated px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <BetSlipIcon size="sm" />
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold leading-tight">Bet slip</p>
                  <p className="text-[11px] text-text-muted font-mono tabular-nums">
                    Balance {formatCredits(user.balance)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
                aria-label="Minimize bet slip"
              >
                <ChevronDownIcon className="h-5 w-5" />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3">
              <BetSlipPanelContent compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={togglePanel}
        className={cn(
          'pointer-events-auto flex min-h-[52px] items-center gap-2.5',
          BET_SLIP_WIDTH,
          'rounded-2xl px-3 py-2.5 text-sm font-semibold text-white shadow-glow-accent transition-opacity',
          'bg-gradient-to-r from-accent-secondary to-indigo-500 border border-accent-secondary/30',
          'hover:opacity-95',
          isPanelOpen && 'ring-2 ring-accent-secondary/40',
        )}
        aria-expanded={isPanelOpen}
        aria-label={`Bet slip, ${slipCount} selections, balance ${formatCredits(user.balance)}`}
      >
        <BetSlipIcon size="sm" className="shrink-0 text-white" />
        <span className="shrink-0 font-display">Bet slip</span>
        {slipCount > 0 && (
          <Badge variant="live" className="min-w-[22px] shrink-0 border-0 bg-accent-live text-white">
            {slipCount}
          </Badge>
        )}
        <span className="ml-auto min-w-[4.5rem] flex-1 truncate text-right font-mono text-sm font-bold tabular-nums sm:text-base">
          {formatCredits(user.balance)}
        </span>
        {isPanelOpen ? (
          <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
        ) : (
          <ChevronUpIcon className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
