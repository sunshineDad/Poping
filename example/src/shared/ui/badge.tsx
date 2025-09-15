import React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'secondary' | 'success' | 'destructive' | 'outline'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  destructive: 'bg-red-100 text-red-800 border-red-200',
  outline: 'border',
}

export function Badge({ className, variant = 'secondary', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
}

