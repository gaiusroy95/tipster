import { getPasswordChecks } from '@/features/auth/schemas/authSchemas'
import { cn } from '@/shared/utils/cn'

export function PasswordRequirements({ password }: { password: string }) {
  const checks = getPasswordChecks(password)

  const items = [
    { key: 'minLength', label: 'At least 8 characters', met: checks.minLength },
    { key: 'hasLetter', label: 'Contains a letter', met: checks.hasLetter },
    { key: 'hasNumber', label: 'Contains a number', met: checks.hasNumber },
  ] as const

  return (
    <ul className="mt-2 space-y-1" aria-live="polite">
      {items.map((item) => (
        <li
          key={item.key}
          className={cn(
            'text-xs',
            item.met ? 'text-accent-win' : 'text-text-muted',
          )}
        >
          {item.met ? '✓' : '○'} {item.label}
        </li>
      ))}
    </ul>
  )
}
