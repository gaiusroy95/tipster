import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { PROFILE_ICON_MONEY_BAG } from '@/core/constants/branding'
import { ROUTES } from '@/core/constants/routes'
import { BetSlipIcon } from '@/features/betting/components/BetSlipIcon'
import { ProfileBalanceIcon } from '@/features/profile/components/ProfileBalanceIcon'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'
import type { ReactNode } from 'react'

export function WalletBalanceHero({ balance }: { balance: number }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border-default bg-bg-surface">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-secondary/12 via-transparent to-accent-primary/8"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-gold/8 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative p-5 sm:p-7">
        {/* Column on mobile + 3-column layout (xl); row only when center column is wide (sm–lg, 2xl+) */}
        <div
          className={cn(
            'flex flex-col gap-5',
            'sm:flex-row sm:items-center sm:gap-6',
            'xl:flex-col xl:items-stretch',
            '2xl:flex-row 2xl:items-center 2xl:gap-8',
          )}
        >
          <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center">
            <ProfileBalanceIcon
              src={PROFILE_ICON_MONEY_BAG}
              size="md"
              className="h-12 w-12 sm:h-14 sm:w-14 2xl:h-16 2xl:w-16 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Arena balance
              </p>
              <p
                className={cn(
                  'mt-1 font-mono font-bold tabular-nums tracking-tight text-text-primary',
                  'text-2xl sm:text-3xl 2xl:text-4xl',
                  'break-all sm:break-normal',
                )}
              >
                {formatCredits(balance)}
              </p>
              <span className="inline-flex mt-2 max-w-full items-center rounded-full border border-border-default/80 bg-bg-elevated/60 px-2.5 py-0.5 text-[11px] font-medium text-text-muted">
                Virtual credits only — no real money
              </span>
            </div>
          </div>

          <div
            className={cn(
              'grid grid-cols-2 gap-2 w-full shrink-0',
              'xl:pt-4 xl:border-t xl:border-border-default/50',
              '2xl:max-w-[340px] 2xl:ml-auto 2xl:pt-0 2xl:border-t-0',
            )}
          >
            <WalletQuickLink to={ROUTES.BETS_ACTIVE} icon={<BetSlipIcon size="sm" />} label="Open bets" />
            <WalletQuickLink
              to={ROUTES.BETS_HISTORY}
              icon={
                <ClockIcon className="h-5 w-5 shrink-0 text-accent-secondary" aria-hidden="true" />
              }
              label="Bet history"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function WalletQuickLink({
  to,
  icon,
  label,
}: {
  to: string
  icon: ReactNode
  label: string
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-border-default/70',
        'bg-bg-elevated/50 px-3 py-3 sm:px-4 min-h-[48px] transition-colors',
        'hover:border-accent-secondary/40 hover:bg-accent-secondary/10',
      )}
    >
      <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-text-primary">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <ArrowRightIcon
        className="h-4 w-4 text-text-muted group-hover:text-accent-secondary transition-colors shrink-0 hidden sm:block"
        aria-hidden="true"
      />
    </Link>
  )
}
