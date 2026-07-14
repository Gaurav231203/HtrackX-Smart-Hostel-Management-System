"use client"

import { useEffect, useState } from 'react'

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([])

  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles: Bubble[] = []
      for (let i = 0; i < 20; i++) {
        newBubbles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 100 + 50,
          duration: Math.random() * 10 + 15,
          delay: Math.random() * 5,
        })
      }
      setBubbles(newBubbles)
    }

    generateBubbles()
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full opacity-5 dark:opacity-10 blur-3xl animate-float"
          style={{
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            background: `radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)`,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
