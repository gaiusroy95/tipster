import { forwardRef, type FocusEvent, type InputHTMLAttributes } from 'react'
import { Input } from '@/shared/components/ui/Input'

type AutofillSafeInputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string
}

/**
 * Blocks browser/password-manager autofill on mount; fields become editable on focus.
 */
export const AutofillSafeInput = forwardRef<HTMLInputElement, AutofillSafeInputProps>(
  ({ onFocus, ...props }, ref) => {
    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      e.currentTarget.readOnly = false
      onFocus?.(e)
    }

    return (
      <Input
        ref={ref}
        readOnly
        data-1p-ignore="true"
        data-lpignore="true"
        data-form-type="other"
        onFocus={handleFocus}
        {...props}
      />
    )
  },
)
AutofillSafeInput.displayName = 'AutofillSafeInput'
