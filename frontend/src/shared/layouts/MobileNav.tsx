import { Link, useLocation } from 'react-router-dom'
import {
  BellIcon,
  Cog6ToothIcon,
  HomeIcon,
  TicketIcon,
  TrophyIcon,
  UserIcon,
  WalletIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { ROUTES } from '@/core/constants/routes'
import { cn } from '@/shared/utils/cn'
import { Modal } from '@/shared/components/ui/Modal'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'

interface MobileMoreMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMoreMenu({ open, onClose }: MobileMoreMenuProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const slipCount = useBetSlipStore((s) => s.selections.length)

  const links = user
    ? [
        { to: `${ROUTES.HOME}?tab=cup`, label: 'Tipster Cup', icon: ChartBarIcon },
        { to: ROUTES.BET_SLIP, label: 'Bet slip', icon: TicketIcon, badge: slipCount },
        { to: ROUTES.NOTIFICATIONS, label: 'Notifications', icon: BellIcon },
        { to: ROUTES.SETTINGS, label: 'Settings', icon: Cog6ToothIcon },
        { to: ROUTES.PROFILE_EDIT, label: 'Edit profile', icon: UserIcon },
      ]
    : [
        { to: `${ROUTES.HOME}?tab=cup`, label: 'Tipster Cup', icon: ChartBarIcon },
        { to: ROUTES.LEADERBOARD, label: 'Rankings', icon: TrophyIcon },
      ]

  return (
    <Modal open={open} onClose={onClose} title="More">
      <nav className="space-y-1" aria-label="More navigation">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-3 min-h-[48px] hover:bg-bg-elevated transition-colors"
          >
            <item.icon className="h-5 w-5 text-text-muted shrink-0" aria-hidden="true" />
            <span className="font-medium flex-1">{item.label}</span>
            {'badge' in item && item.badge && item.badge > 0 ? (
              <Badge variant="live">{item.badge}</Badge>
            ) : null}
          </Link>
        ))}
        {user ? (
          <Button
            variant="secondary"
            className="w-full mt-4"
            onClick={() => {
              onClose()
              logout()
            }}
          >
            Log out
          </Button>
        ) : (
          <div className="mt-4 space-y-2">
            <Link to={ROUTES.LOGIN} onClick={onClose}>
              <Button className="w-full">Sign in</Button>
            </Link>
            <Link to={ROUTES.REGISTER} onClick={onClose}>
              <Button variant="secondary" className="w-full">Create account</Button>
            </Link>
          </div>
        )}
      </nav>
    </Modal>
  )
}

interface MobileBottomNavProps {
  onMoreOpen: () => void
}

export function MobileBottomNav({ onMoreOpen }: MobileBottomNavProps) {
  const location = useLocation()
  const pathname = location.pathname
  const search = location.search

  const items = [
    {
      key: 'arena',
      label: 'Arena',
      icon: HomeIcon,
      to: ROUTES.HOME,
      active: pathname === ROUTES.HOME && !search.includes('tab=leaderboard'),
    },
    {
      key: 'rankings',
      label: 'Rankings',
      icon: TrophyIcon,
      to: ROUTES.LEADERBOARD,
      active: pathname.startsWith('/leaderboard') || pathname.startsWith('/players'),
    },
    {
      key: 'wallet',
      label: 'Wallet',
      icon: WalletIcon,
      to: ROUTES.WALLET,
      active: pathname === ROUTES.WALLET,
    },
  ]

  return (
    <nav
      className="xl:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border-default glass-panel safe-area-pb safe-area-pt"
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 max-w-lg mx-auto">
        {items.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] text-xs font-bold uppercase tracking-wide',
              item.active ? 'text-accent-secondary' : 'text-text-muted',
            )}
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={onMoreOpen}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] text-xs font-bold uppercase tracking-wide text-text-muted"
          aria-label="Open more menu"
        >
          <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
          More
        </button>
      </div>
    </nav>
  )
}
