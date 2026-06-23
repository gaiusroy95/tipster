import { type HTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

export function AuthCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border-default/80 bg-bg-surface shadow-elevated',
        className,
      )}
      {...props}
    />
  )
}
