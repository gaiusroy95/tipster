import type { ComponentType, SVGProps } from 'react'
import {
  DocumentTextIcon,
  EyeIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/shared/utils/cn'

type StatConfig = {
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const SOCIAL_STATS: StatConfig[] = [
  { label: 'Posts', icon: DocumentTextIcon },
  { label: 'Followers', icon: UsersIcon },
  { label: 'Following', icon: UserPlusIcon },
  { label: 'Views', icon: EyeIcon },
]

export function ProfileSocialStatsGrid({
  className,
  values,
}: {
  className?: string
  values?: Partial<Record<string, number>>
}) {
  return (
    <div className={cn('grid grid-cols-4 gap-1 sm:gap-2', className)}>
      {SOCIAL_STATS.map((stat) => (
        <ProfileSocialStat
          key={stat.label}
          label={stat.label}
          value={values?.[stat.label] ?? 0}
          icon={stat.icon}
        />
      ))}
    </div>
  )
}

function ProfileSocialStat({
  value,
  label,
  icon: Icon,
}: {
  value: number
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}) {
  return (
    <div className="flex flex-col items-center justify-center py-1 px-1 min-w-0">
      <div className="relative inline-flex shrink-0 mb-0.5 pt-1.5 pr-2.5 min-h-[28px]">
        <Icon className="h-6 w-6 text-accent-secondary" aria-hidden="true" />
        <span
          className="absolute top-0 right-0 font-mono text-[10px] font-bold leading-none text-text-primary tabular-nums"
        >
          {value.toLocaleString()}
        </span>
      </div>
      <span className="text-[10px] sm:text-[11px] text-text-muted truncate w-full text-center">
        {label}
      </span>
    </div>
  )
}
