import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  BellIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  InboxStackIcon,
  PencilSquareIcon,
  UserIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { ROUTES, playerPath } from '@/core/constants/routes'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'
import { useEditProfileDrawer } from '@/features/profile/context/EditProfileDrawerContext'
import { prefetchPlayerProfile } from '@/features/profile/hooks/useProfile'
import { ProfileAvatar } from '@/features/profile/components/ProfileAvatar'
import { RightSideDrawer } from '@/shared/components/ui/RightSideDrawer'
import { Button } from '@/shared/components/ui/Button'
import { AppLogo } from '@/shared/components/AppLogo'
import { cn } from '@/shared/utils/cn'

interface AccountMenuDrawerProps {
  open: boolean
  onClose: () => void
}

function MenuRow({
  to,
  icon: Icon,
  label,
  badge,
  onClick,
}: {
  to?: string
  icon: typeof UserIcon
  label: string
  badge?: string
  onClick?: () => void
}) {
  const className = cn(
    'flex items-center justify-start gap-3 rounded-xl px-3 py-3 min-h-[48px] text-sm font-medium text-left',
    'text-text-primary hover:bg-bg-elevated transition-colors w-full',
  )

  const content = (
    <>
      <Icon className="h-5 w-5 text-text-muted shrink-0" aria-hidden="true" />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="rounded-full bg-accent-win/20 px-2 py-0.5 text-[11px] font-semibold text-accent-win">
          {badge}
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

export function AccountMenuDrawer({ open, onClose }: AccountMenuDrawerProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const setPanelOpen = useBetSlipStore((s) => s.setPanelOpen)
  const { open: openEditProfile } = useEditProfileDrawer()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (open && user?.id) {
      prefetchPlayerProfile(queryClient, user.id)
    }
  }, [open, queryClient, user?.id])

  if (!user) {
    return (
      <RightSideDrawer open={open} onClose={onClose} title="Account">
        <div className="p-4 space-y-4">
          <p className="text-sm text-text-muted">Sign in to access your profile and bet slip.</p>
          <Link to={ROUTES.LOGIN} onClick={onClose}>
            <Button className="w-full">Sign in</Button>
          </Link>
          <Link to={ROUTES.REGISTER} onClick={onClose}>
            <Button variant="secondary" className="w-full">Create account</Button>
          </Link>
        </div>
      </RightSideDrawer>
    )
  }

  return (
    <RightSideDrawer
      open={open}
      onClose={onClose}
      header={<AppLogo size="sm" className="max-w-[140px]" />}
      title="Account menu"
    >
      <div className="p-4 space-y-5">
        <div className="flex items-center gap-3 rounded-xl border border-border-default bg-bg-elevated/40 p-3">
          <ProfileAvatar
            name={user.displayName}
            avatarUrl={user.avatarUrl}
            className="h-12 w-12 text-sm"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{user.displayName}</p>
            <p className="text-xs text-text-muted truncate">@{user.username}</p>
            <Link
              to={playerPath(user.id)}
              onClick={onClose}
              className="text-xs font-semibold text-accent-secondary hover:underline mt-0.5 inline-block"
            >
              View profile
            </Link>
          </div>
        </div>

        <nav className="space-y-1" aria-label="Account menu">
          <MenuRow
            to={playerPath(user.id)}
            icon={UserIcon}
            label="My profile"
            onClick={onClose}
          />
          <MenuRow
            to={ROUTES.BETS_ACTIVE}
            icon={InboxStackIcon}
            label="Open bets"
            onClick={onClose}
          />
          <MenuRow
            to={ROUTES.LEADERBOARD}
            icon={ChartBarIcon}
            label="Rankings"
            onClick={onClose}
          />
          <MenuRow
            to={ROUTES.NOTIFICATIONS}
            icon={BellIcon}
            label="Notifications"
            onClick={onClose}
          />
          <MenuRow
            icon={PencilSquareIcon}
            label="Edit profile"
            onClick={() => {
              openEditProfile()
              onClose()
            }}
          />
          <MenuRow
            to={ROUTES.SETTINGS}
            icon={Cog6ToothIcon}
            label="Settings"
            onClick={onClose}
          />
          <MenuRow
            to={ROUTES.TERMS}
            icon={DocumentTextIcon}
            label="Help & info"
            onClick={onClose}
          />
          <MenuRow
            icon={ClipboardDocumentListIcon}
            label="Open bet slip"
            onClick={() => {
              setPanelOpen(true)
              onClose()
            }}
          />
        </nav>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            onClose()
            logout()
          }}
        >
          Log out
        </Button>
      </div>
    </RightSideDrawer>
  )
}
