import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { PROFILE_ICON_MONEY_BAG } from '@/core/constants/branding'
import { ROUTES } from '@/core/constants/routes'
import { OpenBetsIcon } from '@/features/profile/components/OpenBetsIcon'
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

      <div className="relative flex flex-col gap-6 p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
          <div className="flex items-center gap-4 min-w-0">
            <ProfileBalanceIcon src={PROFILE_ICON_MONEY_BAG} size="md" className="h-14 w-14 sm:h-16 sm:w-16" />
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                Arena balance
              </p>
              <p className="mt-1 font-mono text-3xl sm:text-4xl font-bold tabular-nums tracking-tight text-text-primary">
                {formatCredits(balance)}
              </p>
              <span
                className="inline-flex mt-2 items-center rounded-full border border-border-default/80 bg-bg-elevated/60 px-2.5 py-0.5 text-[11px] font-medium text-text-muted"
              >
                Virtual credits only — no real money
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto sm:shrink-0">
            <WalletQuickLink to={ROUTES.BETS_ACTIVE} icon={<OpenBetsIcon size="sm" />} label="Open bets" />
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
        'group flex items-center justify-between gap-3 rounded-xl border border-border-default/70',
        'bg-bg-elevated/50 px-4 py-3 min-h-[48px] transition-colors',
        'hover:border-accent-secondary/40 hover:bg-accent-secondary/10',
      )}
    >
      <span className="flex items-center gap-2.5 text-sm font-medium text-text-primary">
        {icon}
        {label}
      </span>
      <ArrowRightIcon
        className="h-4 w-4 text-text-muted group-hover:text-accent-secondary transition-colors shrink-0"
        aria-hidden="true"
      />
    </Link>
  )
}
