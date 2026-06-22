import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-lg border border-border-default bg-bg-elevated px-4 text-base text-text-primary placeholder:text-text-muted',
        'focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/30',
        error && 'border-accent-loss focus:border-accent-loss focus:ring-accent-loss/30',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
