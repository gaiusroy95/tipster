import { Link } from 'react-router-dom'
import { RankBadge, getRankRowClass } from '@/shared/components/RankBadge'
import { playerPath } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'

interface LeaderboardCompactRowProps {
  rank: number
  displayName: string
  userId: string
  trailing: string
  trailingClassName?: string
  subtitle?: string
}

export function LeaderboardCompactRow({
  rank,
  displayName,
  userId,
  trailing,
  trailingClassName,
  subtitle,
}: LeaderboardCompactRowProps) {
  return (
    <Link
      to={playerPath(userId)}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors min-h-[44px] border',
        getRankRowClass(rank),
      )}
    >
      <RankBadge rank={rank} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium">{displayName}</p>
        {subtitle && <p className="text-xs text-text-muted truncate">{subtitle}</p>}
      </div>
      <span className={cn('font-mono text-xs shrink-0', trailingClassName ?? 'text-accent-win')}>
        {trailing}
      </span>
    </Link>
  )
}
