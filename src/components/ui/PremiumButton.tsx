"use client"

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
}

export default function PremiumButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: PremiumButtonProps) {
  const baseStyles = 'btn-premium relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-foreground text-background hover:opacity-90 shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border-2 border-foreground text-foreground hover:bg-foreground hover:text-background',
    ghost: 'hover:bg-secondary text-foreground',
    gradient: 'gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-105'
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
