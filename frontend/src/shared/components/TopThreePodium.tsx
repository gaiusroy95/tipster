import { Link } from 'react-router-dom'
import { RankBadge, isPodiumRank } from '@/shared/components/RankBadge'
import { playerPath } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'

export interface PodiumEntry {
  userId: string
  displayName: string
  username: string
  points: number
  rank: number
}

const podiumOrder: (1 | 2 | 3)[] = [2, 1, 3]

const podiumMedalSize: Record<1 | 2 | 3, string> = {
  1: 'h-14 w-14 sm:h-16 sm:w-16',
  2: 'h-11 w-11 sm:h-12 sm:w-12',
  3: 'h-11 w-11 sm:h-12 sm:w-12',
}

const podiumBarHeight: Record<1 | 2 | 3, string> = {
  1: 'h-16 sm:h-20',
  2: 'h-12 sm:h-14',
  3: 'h-10 sm:h-12',
}

const podiumGlow: Record<1 | 2 | 3, string> = {
  1: 'from-accent-gold/25',
  2: 'from-white/15',
  3: 'from-amber-700/20',
}

export function TopThreePodium({ entries }: { entries: PodiumEntry[] }) {
  const byRank = new Map(entries.filter((e) => isPodiumRank(e.rank)).map((e) => [e.rank, e]))

  if (byRank.size === 0) return null

  return (
    <section
      className="mb-6 rounded-2xl border border-border-default bg-bg-surface/80 p-4 sm:p-5"
      aria-label="Top three tipsters"
    >
      <p className="text-xs font-semibold text-text-muted mb-4 text-center uppercase tracking-wide">
        Top performers
      </p>
      <div className="flex items-end justify-center gap-2 sm:gap-4">
        {podiumOrder.map((rank) => {
          const entry = byRank.get(rank)
          if (!entry) {
            return <div key={rank} className="w-[28%] sm:w-24" aria-hidden="true" />
          }

          return (
            <Link
              key={entry.userId}
              to={playerPath(entry.userId)}
              className={cn(
                'group flex w-[28%] sm:w-24 flex-col items-center text-center transition-transform hover:-translate-y-0.5',
                rank === 1 && 'sm:-mt-2',
              )}
            >
              <div
                className={cn(
                  'relative mb-2 flex items-center justify-center rounded-full p-1',
                  podiumMedalSize[rank],
                  'bg-gradient-to-b to-transparent',
                  podiumGlow[rank],
                )}
              >
                <RankBadge
                  rank={rank}
                  size="xl"
                  className="max-w-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                />
              </div>
              <p className="text-xs sm:text-sm font-semibold truncate w-full group-hover:text-accent-primary transition-colors">
                {entry.displayName}
              </p>
              <p className="text-[10px] sm:text-xs text-text-muted truncate w-full">@{entry.username}</p>
              <p className="mt-1 font-mono text-xs font-bold text-accent-win">{entry.points} pts</p>
              <div
                className={cn(
                  'mt-3 w-full rounded-t-lg border border-border-default/60 bg-bg-elevated/80',
                  podiumBarHeight[rank],
                )}
                aria-hidden="true"
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
