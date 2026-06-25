import { PageShell } from '@/shared/layouts/PageShell'
import { BetSlipPanelContent } from '@/features/betting/components/BetSlipPanelContent'

export function BetSlipPage() {
  return (
    <PageShell title="Bet slip" description="Review selections, set stakes, and place virtual bets">
      <BetSlipPanelContent />
    </PageShell>
  )
}
