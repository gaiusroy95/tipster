import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-accent-secondary to-indigo-500 text-white hover:opacity-90 font-semibold shadow-[var(--shadow-glow-accent)]',
  secondary:
    'bg-bg-elevated border border-border-default hover:bg-bg-surface text-text-primary',
  ghost: 'hover:bg-bg-elevated text-text-primary',
  danger: 'bg-accent-loss/20 text-accent-loss hover:bg-accent-loss/30 border border-accent-loss/30',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg min-w-[44px]',
  md: 'h-11 px-4 text-sm rounded-lg min-w-[44px]',
  lg: 'h-12 px-6 text-base rounded-xl min-w-[44px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
