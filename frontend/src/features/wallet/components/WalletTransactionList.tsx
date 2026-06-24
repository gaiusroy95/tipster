import type { ComponentType, SVGProps } from 'react'
import {
  ArrowUturnLeftIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  TicketIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { formatCredits } from '@/shared/utils/formatCredits'
import { formatDateTime, formatRelativeTime } from '@/shared/utils/formatDate'
import type { WalletTransaction } from '@/mocks/data/types'
import { cn } from '@/shared/utils/cn'

type TxVisual = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  wrap: string
}

const txVisuals: Record<WalletTransaction['type'], TxVisual> = {
  initial: {
    icon: SparklesIcon,
    label: 'Bonus',
    wrap: 'bg-accent-gold/15 text-accent-gold border-accent-gold/25',
  },
  bet_placed: {
    icon: TicketIcon,
    label: 'Bet placed',
    wrap: 'bg-accent-loss/12 text-accent-loss border-accent-loss/25',
  },
  bet_won: {
    icon: TrophyIcon,
    label: 'Bet won',
    wrap: 'bg-accent-win/12 text-accent-win border-accent-win/25',
  },
  bet_lost: {
    icon: TicketIcon,
    label: 'Bet lost',
    wrap: 'bg-accent-loss/12 text-accent-loss border-accent-loss/25',
  },
  bet_cancelled: {
    icon: ArrowUturnLeftIcon,
    label: 'Cancelled',
    wrap: 'bg-bg-elevated text-text-muted border-border-default',
  },
  penalty: {
    icon: ExclamationTriangleIcon,
    label: 'Penalty',
    wrap: 'bg-accent-loss/12 text-accent-loss border-accent-loss/25',
  },
  forum_bonus: {
    icon: SparklesIcon,
    label: 'Forum bonus',
    wrap: 'bg-accent-gold/15 text-accent-gold border-accent-gold/25',
  },
}

function isRecent(date: string) {
  const diffMs = Date.now() - new Date(date).getTime()
  return diffMs < 48 * 60 * 60 * 1000
}

export function WalletTransactionList({ transactions }: { transactions: WalletTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-default bg-bg-elevated mb-3">
          <BanknotesIcon className="h-6 w-6 text-text-muted" aria-hidden="true" />
        </div>
        <p className="font-semibold text-text-primary">No transactions yet</p>
        <p className="text-sm text-text-muted mt-1 max-w-xs">
          Credits and bet activity will show up here.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border-default/50">
      {transactions.map((tx) => (
        <WalletTransactionRow key={tx.id} tx={tx} />
      ))}
    </div>
  )
}

function WalletTransactionRow({ tx }: { tx: WalletTransaction }) {
  const visual = txVisuals[tx.type]
  const positive = tx.amount >= 0
  const timeLabel = isRecent(tx.createdAt)
    ? formatRelativeTime(tx.createdAt)
    : formatDateTime(tx.createdAt)

  return (
    <div className="flex items-start gap-3 sm:items-center sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-bg-elevated/30 transition-colors">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
          visual.wrap,
        )}
        title={visual.label}
      >
        <visual.icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm text-text-primary truncate">{tx.description}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
          <span className="text-xs text-text-muted">{timeLabel}</span>
          <span className="text-text-muted/40 text-xs hidden sm:inline">·</span>
          <span className="text-xs text-text-muted">
            Balance {formatCredits(tx.balanceAfter)}
          </span>
        </div>
      </div>

      <div className="text-right shrink-0 min-w-[4.5rem] sm:min-w-[5.5rem]">
        <p
          className={cn(
            'font-mono text-xs sm:text-sm md:text-base font-bold tabular-nums whitespace-nowrap',
            positive ? 'text-accent-win' : 'text-accent-loss',
          )}
        >
          {positive ? '+' : ''}{formatCredits(tx.amount)}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-text-muted mt-0.5 hidden sm:block">
          {visual.label}
        </p>
      </div>
    </div>
  )
}
