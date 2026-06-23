import { ROUTES } from '@/core/constants/routes'

export interface FooterLink {
  label: string
  to: string
}

export interface FooterInfoItem {
  label: string
  value: string
}

export const FOOTER_PLATFORM_LINKS: FooterLink[] = [
  { label: 'Arena', to: ROUTES.HOME },
  { label: 'Tipster Cup', to: `${ROUTES.HOME}?tab=cup` },
  { label: 'Leaderboard', to: ROUTES.LEADERBOARD },
  { label: 'Seasons', to: ROUTES.SEASONS },
  { label: 'Achievements', to: `${ROUTES.HOME}?tab=achievements` },
]

export const FOOTER_ACCOUNT_LINKS: FooterLink[] = [
  { label: 'Wallet', to: ROUTES.WALLET },
  { label: 'Active bets', to: ROUTES.BETS_ACTIVE },
  { label: 'Bet history', to: ROUTES.BETS_HISTORY },
  { label: 'Notifications', to: ROUTES.NOTIFICATIONS },
  { label: 'Settings', to: ROUTES.SETTINGS },
]

export const FOOTER_LEGAL_LINKS: FooterLink[] = [
  { label: 'Terms of Service', to: ROUTES.TERMS },
  { label: 'Privacy Policy', to: ROUTES.PRIVACY },
  { label: 'Arena Rules', to: ROUTES.RULES },
  { label: 'About Us', to: ROUTES.ABOUT },
  { label: 'Help Center', to: ROUTES.HELP },
]

export const FOOTER_COMPACT_LINKS: FooterLink[] = [...FOOTER_LEGAL_LINKS]

export const FOOTER_COMPETITION_ITEMS: FooterInfoItem[] = [
  { label: 'Welcome bonus', value: '1,000,000 credits' },
  { label: 'Stake sizes', value: '25K or 100K' },
  { label: 'Daily bet limit', value: '3 per day' },
  { label: 'Cancellation fee', value: '10% penalty' },
  { label: 'Season prizes', value: 'Offline awards' },
]
