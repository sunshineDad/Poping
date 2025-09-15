import React from 'react'
import { cn } from '@/lib/utils'

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
}

export function Switch({ checked, onCheckedChange, className, disabled, ...props }: SwitchProps) {
  return (
    <label className={cn('inline-flex items-center cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          'inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'h-4 w-4 rounded-full bg-background shadow transform transition-transform mx-0.5',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </span>
    </label>
  )
}

