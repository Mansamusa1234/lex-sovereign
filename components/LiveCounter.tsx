'use client'
import { useState, useEffect, useRef } from 'react'

interface Props {
  target: number
  duration?: number
  suffix?: string
  prefix?: string
  className?: string
}

export default function LiveCounter({ target, duration = 2000, suffix = '', prefix = '', className = '' }: Props) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>()
  const startRef = useRef<number>()
  const startValRef = useRef(0)

  useEffect(() => {
    startValRef.current = count
    startRef.current = undefined

    function animate(ts: number) {
      if (!startRef.current) startRef.current = ts
      const elapsed = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startValRef.current + (target - startValRef.current) * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return (
    <span className={className}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}
