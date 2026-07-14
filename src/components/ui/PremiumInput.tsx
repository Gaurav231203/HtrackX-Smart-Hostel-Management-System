"use client"

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'input-premium w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
            'transition-all duration-200',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

PremiumInput.displayName = 'PremiumInput'

export default PremiumInput
