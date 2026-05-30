'use client'
import { useEffect, useRef } from 'react'

interface Props {
  color?: string
  size?: number
  speed?: number
  opacity?: number
  x?: string
  y?: string
}

export default function MorphingOrb({
  color = '#f59e0b',
  size = 400,
  speed = 8,
  opacity = 0.12,
  x = '20%',
  y = '20%',
}: Props) {
  const ref = useRef<SVGPathElement>(null)

  useEffect(() => {
    const shapes = [
      'M50,20 C70,10 90,30 80,50 C90,70 70,90 50,80 C30,90 10,70 20,50 C10,30 30,10 50,20Z',
      'M50,15 C72,5 95,35 85,55 C95,75 65,95 45,85 C25,95 5,65 15,45 C5,25 28,25 50,15Z',
      'M50,25 C68,8 92,28 82,52 C92,72 68,92 48,82 C28,92 8,72 18,48 C8,28 32,42 50,25Z',
      'M50,18 C75,8 92,32 84,54 C92,76 70,92 48,84 C26,92 8,68 16,46 C8,24 25,28 50,18Z',
    ]
    let idx = 0
    let progress = 0
    let animId: number

    function lerp(a: string, b: string, t: number): string {
      // Simple lerp on the numbers in the path
      const na = a.match(/[\d.]+/g)?.map(Number) ?? []
      const nb = b.match(/[\d.]+/g)?.map(Number) ?? []
      return a.replace(/[\d.]+/g, (_, i) => {
        const va = na[i] ?? 0
        const vb = nb[i] ?? 0
        return (va + (vb - va) * t).toFixed(2)
      })
    }

    function animate() {
      progress += 0.005 / speed * 0.6
      if (progress >= 1) { progress = 0; idx = (idx + 1) % shapes.length }
      const next = (idx + 1) % shapes.length
      const t = 0.5 - 0.5 * Math.cos(progress * Math.PI)
      if (ref.current) {
        ref.current.setAttribute('d', lerp(shapes[idx], shapes[next], t))
      }
      animId = requestAnimationFrame(animate)
    }

    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [speed])

  return (
    <div
      className="fixed pointer-events-none z-0"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ opacity }}>
        <defs>
          <radialGradient id={`orbGrad${x}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <filter id="orbBlur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <path
          ref={ref}
          d="M50,20 C70,10 90,30 80,50 C90,70 70,90 50,80 C30,90 10,70 20,50 C10,30 30,10 50,20Z"
          fill={`url(#orbGrad${x})`}
          filter="url(#orbBlur)"
        />
      </svg>
    </div>
  )
}
