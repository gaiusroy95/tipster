import { PageShell } from '@/shared/layouts/PageShell'
import { StatCard } from '@/shared/components/StatCard'
import { SkeletonCard } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { useWallet } from '@/features/wallet/hooks/useWallet'
import { formatCredits } from '@/shared/utils/formatCredits'
import { formatDateTime } from '@/shared/utils/formatDate'
import { bettingRules } from '@/core/config/bettingRules'

export function WalletPage() {
  const { data, isLoading, isError, refetch } = useWallet()

  if (isLoading) {
    return (
      <PageShell title="Wallet">
        <SkeletonCard />
      </PageShell>
    )
  }

  if (isError || !data) {
    return (
      <PageShell title="Wallet">
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Wallet" description="Virtual credits and transaction history">
      <StatCard label="Available balance" value={formatCredits(data.balance)} subValue="Virtual credits only" />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Small bet max" value={formatCredits(bettingRules.smallBetMax)} />
        <StatCard
          label="Big bet range"
          value={`${formatCredits(bettingRules.bigBetMin)} – ${formatCredits(bettingRules.bigBetMax)}`}
        />
        <StatCard label="Daily big bets" value={String(bettingRules.dailyBigBetLimit)} subValue="Max per day" />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Transactions</h2>
        <div className="space-y-2">
          {data.transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border-default bg-bg-surface"
            >
              <div>
                <p className="font-medium">{tx.description}</p>
                <p className="text-xs text-text-muted mt-1">{formatDateTime(tx.createdAt)}</p>
                <p className="text-xs text-text-muted">Balance: {formatCredits(tx.balanceAfter)}</p>
              </div>
              <span
                className={`font-mono font-bold ${tx.amount >= 0 ? 'text-accent-win' : 'text-accent-loss'}`}
              >
                {tx.amount >= 0 ? '+' : ''}{formatCredits(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
