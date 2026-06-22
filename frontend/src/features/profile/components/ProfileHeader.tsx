import { PencilSquareIcon, ShareIcon, StarIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar'
import { ProfileBalanceIcon } from '@/features/profile/components/ProfileBalanceIcon'
import { useEditProfileDrawer } from '@/features/profile/context/EditProfileDrawerContext'
import { countryFlagEmoji } from '@/features/profile/lib/countryFlag'
import { rankTier } from '@/features/profile/lib/profileUtils'
import { ROUTES, playerPath } from '@/core/constants/routes'
import { OpenBetsIcon } from '@/features/profile/components/OpenBetsIcon'
import { ProfileSocialStatsGrid } from '@/features/profile/components/ProfileSocialStats'
import {
  PROFILE_ICON_GRAPH,
  PROFILE_ICON_MONEY_BAG,
} from '@/core/constants/branding'
import { formatCredits } from '@/shared/utils/formatCredits'
import { cn } from '@/shared/utils/cn'
import { Button } from '@/shared/components/ui/Button'
import { useToast } from '@/shared/components/ui/Toast'
import type { UserProfileStats } from '@/mocks/data/types'

interface ProfileHeaderProps {
  profile: UserProfileStats
  isOwnProfile: boolean
  openBetsTotal: number
  totalPlayers?: number
  countryCode?: string
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  openBetsTotal,
  totalPlayers = 3088,
  countryCode,
}: ProfileHeaderProps) {
  const tier = rankTier(profile.rank)
  const { open: openEditProfile } = useEditProfileDrawer()
  const flag = countryFlagEmoji(countryCode)
  const seasonPl = profile.seasonStats.profitLoss
  const seasonPlPositive = seasonPl >= 0
  const { toast } = useToast()

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: profile.displayName, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <section className="sidebar-panel overflow-hidden">
      {/* Identity */}
      <div className="relative bg-gradient-to-b from-bg-elevated/40 to-bg-surface">
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-secondary/50 to-transparent"
          aria-hidden="true"
        />

        <div className="relative px-4 sm:px-6 py-5 sm:py-6">
          <div className="flex flex-col gap-5 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
              <ProfileAvatar
                name={profile.displayName}
                avatarUrl={profile.avatarUrl}
                className="h-[72px] w-[72px] sm:h-20 sm:w-20 text-lg ring-2 ring-border-default/90 shadow-card mx-auto sm:mx-0"
              />

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight truncate">
                      {profile.displayName}
                    </h1>

                    <div className="mt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      {flag && (
                        <span
                          className="text-base leading-none"
                          title={countryCode}
                          aria-label={`Country: ${countryCode}`}
                        >
                          {flag}
                        </span>
                      )}
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                          tier.className,
                        )}
                      >
                        <StarIcon className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {tier.label}
                      </span>
                    </div>

                    <p className="text-sm text-text-muted mt-1.5 truncate">@{profile.username}</p>

                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-bg-elevated/60 border border-border-default/50 px-2.5 py-1 text-xs text-text-muted">
                      <span className="font-mono font-semibold text-text-primary">#{profile.rank}</span>
                      <span className="text-border-strong">·</span>
                      <span>of {totalPlayers.toLocaleString()} tipsters</span>
                    </p>
                  </div>

                  {isOwnProfile ? (
                    <div className="flex flex-row sm:flex-col gap-2 shrink-0 justify-center sm:justify-start sm:min-w-[132px]">
                      <ProfileActionButton
                        icon={PencilSquareIcon}
                        label="Edit profile"
                        onClick={openEditProfile}
                      />
                      <ProfileActionButton
                        icon={ShareIcon}
                        label="Share profile"
                        onClick={handleShare}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-row gap-2 shrink-0 justify-center sm:justify-start">
                      <Button
                        size="sm"
                        className="gap-1.5 min-h-[40px]"
                        onClick={() => toast('Follow is coming soon', 'info')}
                      >
                        <UserPlusIcon className="h-4 w-4" aria-hidden="true" />
                        Follow
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="min-h-[40px]"
                        onClick={() => toast('Messaging is coming soon', 'info')}
                      >
                        Message
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <ProfileSocialStatsGrid
              className="rounded-xl border border-border-default/60 bg-bg-primary/30 p-2 sm:p-3"
            />
          </div>
        </div>
      </div>

      {/* Balance strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border-default/50 bg-bg-panel/50">
        <BalanceTile
          to={isOwnProfile ? ROUTES.WALLET : undefined}
          iconSrc={PROFILE_ICON_MONEY_BAG}
          label="Arena balance"
          value={formatCredits(profile.balance)}
          valueClass="text-accent-gold"
        />
        <BalanceTile
          to={isOwnProfile ? ROUTES.BETS_ACTIVE : `${playerPath(profile.userId)}?tab=open-bets`}
          icon={<OpenBetsIcon size="sm" />}
          label="Open bets"
          value={formatCredits(openBetsTotal)}
          sub={`${profile.seasonStats.activeBets} active`}
        />
        <BalanceTile
          iconSrc={PROFILE_ICON_GRAPH}
          label="Season P/L"
          value={formatCredits(seasonPl)}
          valueClass={seasonPlPositive ? 'text-accent-win' : 'text-accent-loss'}
        />
      </div>
    </section>
  )
}

function ProfileActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof PencilSquareIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-start gap-2 rounded-lg border border-border-default/80',
        'bg-bg-elevated/40 px-3.5 py-2.5 min-h-[40px] text-sm font-medium text-text-primary text-left',
        'hover:border-accent-secondary/45 hover:bg-accent-secondary/10 transition-colors w-full sm:w-auto',
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-accent-secondary" aria-hidden="true" />
      {label}
    </button>
  )
}

function BalanceTile({
  iconSrc,
  icon,
  label,
  value,
  valueClass,
  sub,
  to,
}: {
  iconSrc?: string
  icon?: ReactNode
  label: string
  value: string
  valueClass?: string
  sub?: string
  to?: string
}) {
  const inner = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center">
        {icon ?? (iconSrc ? <ProfileBalanceIcon src={iconSrc} size="sm" /> : null)}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{label}</p>
        <p
          className={cn(
            'font-mono font-bold text-base sm:text-lg tabular-nums truncate mt-0.5',
            valueClass ?? 'text-text-primary',
          )}
        >
          {value}
        </p>
        {sub && <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>}
      </div>
      {to && (
        <ChevronRight className="shrink-0 text-text-muted/60 group-hover:text-accent-secondary transition-colors" />
      )}
    </>
  )

  const className = cn(
    'group flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 min-h-[68px] transition-colors text-left',
    to && 'hover:bg-bg-elevated/30',
  )

  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    )
  }

  return <div className={className}>{inner}</div>
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={cn('h-4 w-4', className)} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
        clipRule="evenodd"
      />
    </svg>
  )
}
