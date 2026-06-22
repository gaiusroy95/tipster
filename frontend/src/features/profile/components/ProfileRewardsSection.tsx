import type { ReactNode } from 'react'
import { ProfilePanelCard } from '@/features/profile/components/ProfilePanelCard'
import { ProfileRewardsWidget } from '@/features/profile/components/ProfileRewardsWidget'
import { computeStreaks, lastTenWinRate } from '@/features/profile/lib/profileUtils'
import { cn } from '@/shared/utils/cn'
import type { DashboardData, UserProfileStats } from '@/mocks/data/types'

export function ProfileRewardsSection({
  profile,
  dashboard,
}: {
  profile: UserProfileStats
  dashboard?: DashboardData
}) {
  return <ProfileRewardsWidget profile={profile} dashboard={dashboard} variant="full" />
}

export function ProfileAllTimeStats({
  profile,
  totalPlayers = 3088,
}: {
  profile: UserProfileStats
  totalPlayers?: number
}) {
  const { currentWin, longestWin, longestLoss } = computeStreaks(profile.form)
  const last10 = lastTenWinRate(profile.form)
  const bestRank = profile.rank ? Math.max(1, profile.rank - 12) : null

  const rows: { label: string; value: ReactNode }[] = [
    {
      label: 'Current overall rank',
      value: (
        <span className="font-mono font-semibold">
          #{profile.rank}{' '}
          <span className="text-text-muted font-normal text-xs">of {totalPlayers.toLocaleString()}</span>
        </span>
      ),
    },
    {
      label: 'Best overall rank',
      value: bestRank ? `#${bestRank}` : '—',
    },
    {
      label: 'Recent form',
      value: (
        <span className="inline-flex gap-1">
          {profile.form.slice(-10).map((f, i) => (
            <span
              key={i}
              className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold',
                f === 'W' && 'bg-accent-win/20 text-accent-win',
                f === 'L' && 'bg-accent-loss/20 text-accent-loss',
                f === 'D' && 'bg-bg-elevated text-text-muted border border-border-default/60',
              )}
              title={f === 'W' ? 'Win' : f === 'L' ? 'Loss' : 'Draw'}
            >
              {f}
            </span>
          ))}
        </span>
      ),
    },
    { label: 'Last 10 win %', value: `${last10}%` },
    { label: 'Current winning streak', value: String(currentWin) },
    { label: 'Longest winning streak', value: String(longestWin) },
    { label: 'Longest losing streak', value: String(longestLoss) },
    { label: 'Total bets (season)', value: String(profile.seasonStats.totalBets) },
    { label: 'Win rate', value: `${Math.round(profile.seasonStats.winRate)}%` },
    {
      label: 'Season ROI',
      value: (
        <span className={cn('font-mono font-semibold', profile.seasonStats.roi >= 0 ? 'text-accent-win' : 'text-accent-loss')}>
          {profile.seasonStats.roi.toFixed(1)}%
        </span>
      ),
    },
  ]

  return (
    <ProfilePanelCard title="All-time stats" subtitle="Performance transparency">
      <dl className="space-y-0 divide-y divide-border-default/50 -mt-1">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-2.5 text-sm first:pt-0">
            <dt className="text-text-muted">{row.label}</dt>
            <dd className="font-medium text-text-primary text-right">{row.value}</dd>
          </div>
        ))}
      </dl>
    </ProfilePanelCard>
  )
}
