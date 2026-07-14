"use client"

import { cn } from '@/lib/utils'
import { HTMLAttributes } from 'react'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export default function GlassCard({ 
  children, 
  className, 
  hover = false,
  ...props 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        hover ? 'glass-card-hover' : 'glass-card',
        'rounded-2xl p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
