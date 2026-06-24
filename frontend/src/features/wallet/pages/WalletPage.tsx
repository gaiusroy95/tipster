import { PageShell } from '@/shared/layouts/PageShell'
import { PageHero } from '@/shared/components/PageHero'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { QueryErrorFallback } from '@/shared/components/QueryErrorFallback'
import { WalletBalanceHero } from '@/features/wallet/components/WalletBalanceHero'
import { WalletRulesGrid } from '@/features/wallet/components/WalletRulesGrid'
import { WalletTransactionList } from '@/features/wallet/components/WalletTransactionList'
import { useWallet } from '@/features/wallet/hooks/useWallet'

const walletHeader = (
  <PageHero
    variant="wallet"
    title="Wallet"
    description="Virtual credits and transaction history"
  />
)

function WalletSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  )
}

export function WalletPage() {
  const { data, isLoading, isError, refetch } = useWallet()

  if (isLoading) {
    return (
      <PageShell header={walletHeader}>
        <WalletSkeleton />
      </PageShell>
    )
  }

  if (isError || !data) {
    return (
      <PageShell header={walletHeader}>
        <QueryErrorFallback onRetry={() => refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell header={walletHeader}>
      <div className="space-y-5">
        <WalletBalanceHero balance={data.balance} />
        <WalletRulesGrid />

        <section className="rounded-2xl border border-border-default bg-bg-surface overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border-default/60 bg-bg-elevated/30">
            <div>
              <h2 className="font-display text-base font-bold tracking-tight">Transactions</h2>
              <p className="text-xs text-text-muted mt-0.5">
                {data.transactions.length} record{data.transactions.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          <WalletTransactionList transactions={data.transactions} />
        </section>
      </div>
    </PageShell>
  )
}
