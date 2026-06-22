import { LockClosedIcon } from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'
import type { AchievementProgress, AchievementTier } from '@/features/achievements/types/achievement'

const TIER_LABEL: Record<AchievementTier, string> = {
  standard: 'AB',
  elite: 'EL',
}

function placeholderLabel(name: string, tier: AchievementTier) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return initials || TIER_LABEL[tier]
}

export function achievementIconPath(iconSlug: string) {
  return `/assets/Icon/${iconSlug}.png`
}

export function AchievementBadge({
  name,
  tier,
  iconSlug,
  earned = true,
  size = 'md',
  className,
}: {
  name: string
  tier: AchievementTier
  iconSlug: string
  earned?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClass =
    size === 'sm' ? 'h-10 w-10 text-[10px]' : size === 'lg' ? 'h-14 w-14 text-sm' : 'h-12 w-12 text-xs'

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-full font-display font-bold',
        sizeClass,
        earned
          ? tier === 'elite'
            ? 'bg-gradient-to-br from-accent-gold to-amber-600 text-bg-primary shadow-sm'
            : 'bg-gradient-to-br from-accent-primary/80 to-accent-gold/70 text-bg-primary shadow-sm'
          : 'bg-bg-elevated text-text-muted border border-border-default',
        className,
      )}
      title={name}
      data-icon-slug={iconSlug}
    >
      {/* Custom PNG icons can replace this label when assets are wired */}
      <span aria-hidden="true">{placeholderLabel(name, tier)}</span>
      <span className="sr-only">{name}</span>
      {!earned && (
        <LockClosedIcon
          className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-text-muted bg-bg-surface rounded-full p-0.5"
          aria-hidden="true"
        />
      )}
      {/* Future: <img src={achievementIconPath(iconSlug)} alt="" className="h-full w-full object-contain" /> */}
    </div>
  )
}

export function AchievementProgressBar({
  progress,
  earned,
}: {
  progress?: { current: number; target: number }
  earned: boolean
}) {
  if (earned || !progress || progress.target <= 0) return null

  const pct = Math.round((progress.current / progress.target) * 100)

  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-text-muted mb-1">
        <span>Progress</span>
        <span>{progress.current}/{progress.target}</span>
      </div>
      <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
        <div
          className="h-full rounded-full bg-accent-gold/80 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function AchievementCard({ achievement }: { achievement: AchievementProgress }) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-4 transition-colors',
        achievement.earned
          ? 'border-accent-gold/25 bg-gradient-to-br from-accent-gold/10 via-bg-elevated/20 to-transparent'
          : 'border-border-default/80 bg-bg-elevated/20 opacity-90',
      )}
    >
      <AchievementBadge
        name={achievement.name}
        tier={achievement.tier}
        iconSlug={achievement.iconSlug}
        earned={achievement.earned}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              'font-display font-bold leading-tight',
              achievement.earned ? 'text-accent-gold' : 'text-text-primary',
            )}
          >
            {achievement.name}
          </p>
          {achievement.tier === 'elite' && (
            <span className="shrink-0 rounded-full border border-accent-gold/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-accent-gold">
              Elite
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted mt-1 leading-snug">{achievement.description}</p>
        {achievement.requiresSettlement && !achievement.earned && (
          <p className="text-[10px] text-text-muted/80 mt-1">Requires settled bet results</p>
        )}
        <AchievementProgressBar progress={achievement.progress} earned={achievement.earned} />
      </div>
    </div>
  )
}

export function AchievementsGrid({
  achievements,
  emptyMessage = 'Place bets and complete profile goals to unlock achievements.',
}: {
  achievements: AchievementProgress[]
  emptyMessage?: string
}) {
  if (achievements.length === 0) {
    return <p className="text-sm text-text-muted py-8 text-center">{emptyMessage}</p>
  }

  const earnedCount = achievements.filter((a) => a.earned).length

  return (
    <div>
      <p className="text-xs text-text-muted mb-4">
        {earnedCount} of {achievements.length} unlocked
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {achievements.map((a) => <AchievementCard key={a.id} achievement={a} />)}
      </div>
    </div>
  )
}
