'use client'

import { useEffect, useState } from 'react'

interface CounterAnimationProps {
  end: number
  duration?: number
  suffix?: string
  className?: string
}

export function CounterAnimation({
  end,
  duration = 2000,
  suffix = '+',
  className = ''
}: CounterAnimationProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (hasAnimated || end === 0) return

    const startTime = Date.now()
    const startValue = 0

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(startValue + (end - startValue) * easeOutQuart)

      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(end)
        setHasAnimated(true)
      }
    }

    // Start animation after a small delay
    const timer = setTimeout(() => {
      requestAnimationFrame(animate)
    }, 100)

    return () => clearTimeout(timer)
  }, [end, duration, hasAnimated])

  return (
    <span className={className}>
      {count}{suffix}
    </span>
  )
}