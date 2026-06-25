import type { ReactNode } from 'react'
import {
  ArrowLeftIcon,
  BanknotesIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import type { AdminUser } from '@/core/types/api'
import { formatBalance, formatJoinedDate } from '@/features/users/lib/userUtils'
import { Badge } from '@/shared/components/Badge'
import { PanelCard } from '@/shared/components/PanelCard'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Label } from '@/shared/components/ui/Label'
import { cn } from '@/shared/utils/cn'

function DetailSection({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string
  description?: string
  icon: typeof ShieldCheckIcon
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border-default/70 bg-bg-elevated/25 p-4 sm:p-5',
        className,
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent-secondary/20 bg-accent-secondary/10 text-accent-secondary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-display text-sm font-bold">{title}</h3>
          {description ? <p className="mt-0.5 text-xs text-text-muted">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  )
}

export function UserDetailPanel({
  user,
  onBack,
  showBack,
  banReason,
  onBanReasonChange,
  balanceAdj,
  onBalanceAdjChange,
  onPromoteToggle,
  onBanToggle,
  onVerifyEmail,
  onApplyBalance,
  isUpdating,
  isVerifying,
}: {
  user: AdminUser | null
  onBack?: () => void
  showBack?: boolean
  banReason: string
  onBanReasonChange: (value: string) => void
  balanceAdj: string
  onBalanceAdjChange: (value: string) => void
  onPromoteToggle: () => void
  onBanToggle: () => void
  onVerifyEmail: () => void
  onApplyBalance: () => void
  isUpdating: boolean
  isVerifying: boolean
}) {
  if (!user) {
    return (
      <PanelCard
        title="User details"
        subtitle="Select an account to manage"
        className="flex h-full min-h-[420px] items-center justify-center"
      >
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-default bg-bg-elevated/50">
            <UserCircleIcon className="h-8 w-8 text-text-muted/70" aria-hidden="true" />
          </div>
          <p className="mt-4 font-display text-lg font-semibold">No user selected</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
            Choose a user from the directory to review their profile, adjust access, or modify
            their wallet balance.
          </p>
        </div>
      </PanelCard>
    )
  }

  return (
    <PanelCard
      title="User details"
      subtitle="Manage access, moderation, and wallet"
      className="h-full"
      action={
        showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary lg:hidden"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
        ) : null
      }
      bodyClassName="space-y-5"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border-default/70 bg-gradient-to-br from-accent-secondary/10 via-bg-elevated/40 to-bg-surface p-5">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent-secondary/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserAvatar
            name={user.displayName}
            avatarUrl={user.avatarUrl}
            size="xl"
            className="h-20 w-20 sm:h-24 sm:w-24"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                {user.displayName}
              </h2>
              {user.role === 'ADMIN' ? <Badge variant="secondary">Admin</Badge> : null}
              {user.isBanned ? <Badge variant="loss">Banned</Badge> : (
                <Badge variant="win">Active</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-text-muted">@{user.username}</p>
            <p className="mt-1 truncate text-sm text-text-muted">{user.email}</p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Balance', value: formatBalance(user.balance), mono: true },
            { label: 'Rank', value: `#${user.rank}`, mono: true },
            { label: 'Role', value: user.role, mono: false },
            { label: 'Joined', value: formatJoinedDate(user.createdAt), mono: false },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border-default/60 bg-bg-primary/30 px-3 py-2.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {item.label}
              </p>
              <p
                className={cn(
                  'mt-1 text-sm font-semibold truncate',
                  item.mono && 'font-mono tabular-nums',
                )}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <DetailSection
        title="Access control"
        description="Elevate privileges or suspend account access"
        icon={ShieldCheckIcon}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            variant="secondary"
            className="sm:flex-1"
            isLoading={isUpdating}
            onClick={onPromoteToggle}
          >
            {user.role === 'ADMIN' ? 'Demote to user' : 'Promote to admin'}
          </Button>
          <Button
            variant={user.isBanned ? 'secondary' : 'danger'}
            className="sm:flex-1"
            isLoading={isUpdating}
            onClick={onBanToggle}
          >
            {user.isBanned ? 'Restore access' : 'Ban user'}
          </Button>
        </div>
        {!user.isBanned ? (
          <div className="mt-4">
            <Label htmlFor="ban-reason">Ban reason (optional)</Label>
            <Input
              id="ban-reason"
              placeholder="Reason shown in audit log if banned"
              value={banReason}
              onChange={(e) => onBanReasonChange(e.target.value)}
            />
          </div>
        ) : null}
      </DetailSection>

      <DetailSection
        title="Account verification"
        description="Override email verification for support cases"
        icon={EnvelopeIcon}
      >
        <Button variant="ghost" isLoading={isVerifying} onClick={onVerifyEmail}>
          Force verify email
        </Button>
      </DetailSection>

      <DetailSection
        title="Wallet adjustment"
        description="Add or deduct virtual credits with audit trail"
        icon={BanknotesIcon}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="balance-adj">Amount</Label>
            <Input
              id="balance-adj"
              type="number"
              placeholder="e.g. 100 or -50"
              value={balanceAdj}
              onChange={(e) => onBalanceAdjChange(e.target.value)}
            />
          </div>
          <Button
            className="sm:min-w-[120px]"
            isLoading={isUpdating}
            onClick={onApplyBalance}
          >
            Apply
          </Button>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Current balance:{' '}
          <span className="font-mono font-semibold text-text-primary">
            {formatBalance(user.balance)}
          </span>{' '}
          credits
        </p>
      </DetailSection>
    </PanelCard>
  )
}
