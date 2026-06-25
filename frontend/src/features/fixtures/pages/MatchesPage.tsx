import { MatchBrowsePanel } from '@/features/fixtures/components/MatchBrowsePanel'

export function MatchesPage() {
  return (
    <div className="min-w-0 max-w-full max-lg:pb-layout-nav">
      <MatchBrowsePanel discoveryMode="sticky" />
    </div>
  )
}
