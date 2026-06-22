import { type LabelHTMLAttributes } from 'react'
import { cn } from '@/shared/utils/cn'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('text-sm font-medium text-text-muted mb-1.5 block', className)}
      {...props}
    />
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-sm text-accent-loss" role="alert">{message}</p>
}
