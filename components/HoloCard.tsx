'use client'
import { useState } from 'react'
import clsx from 'clsx'

interface Props {
  plan: string
  price: number
  features: string[]
  color?: string
}

export default function HoloCard({ plan, price, features, color = '#f59e0b' }: Props) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientY - rect.top)  / rect.height - 0.5) * 20
    const y = ((e.clientX - rect.left) / rect.width  - 0.5) * -20
    setRotate({ x, y })
  }

  return (
    <div
      className="relative cursor-pointer select-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setRotate({ x: 0, y: 0 }) }}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="relative rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          transform: hovering
            ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(1.04)`
            : 'rotateX(0deg) rotateY(0deg) scale(1)',
          background: `linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)`,
          border: `1px solid ${color}40`,
          boxShadow: hovering
            ? `0 30px 60px ${color}30, 0 0 60px ${color}20, inset 0 0 30px ${color}05`
            : `0 10px 30px ${color}10`,
        }}
      >
        {/* Holographic shimmer overlay */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: hovering ? 0.15 : 0,
            background: `linear-gradient(${rotate.y * 3}deg,
              transparent 0%,
              rgba(255,255,255,0.1) 25%,
              rgba(251,191,36,0.3) 50%,
              rgba(139,92,246,0.2) 75%,
              transparent 100%)`,
          }}
        />

        {/* Scan line */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="absolute w-full h-px bg-amber-400/20"
            style={{ animation: 'scanLine 3s linear infinite' }} />
        </div>

        {/* Card content */}
        <div className="p-6">
          {/* Card chip graphic */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-10 h-8 rounded bg-gradient-to-br from-amber-400/80 to-amber-600/80 grid grid-cols-3 grid-rows-3 gap-px p-0.5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-amber-900/40 rounded-[1px]" />
              ))}
            </div>
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full bg-red-500/60" />
              <div className="w-6 h-6 rounded-full bg-amber-500/60 -ml-2" />
            </div>
          </div>

          {/* Plan name */}
          <div className="mb-4">
            <div className="font-mono text-xs tracking-[0.3em] uppercase mb-1"
              style={{ color: `${color}80` }}>
              Lex Sovereign AI Brain
            </div>
            <div className="font-black text-2xl text-white">{plan}</div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-1 mb-6">
            <span className="font-black text-5xl" style={{ color }}>
              ${price}
            </span>
            <span className="text-slate-500 text-sm mb-2">/month</span>
          </div>

          {/* Features */}
          <div className="space-y-1.5">
            {features.slice(0, 4).map(f => (
              <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                {f}
              </div>
            ))}
          </div>

          {/* Card number placeholder */}
          <div className="mt-6 font-mono text-slate-600 text-xs tracking-[0.2em]">
            •••• •••• •••• ••••
          </div>
        </div>

        {/* Border glow */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1px ${color}20` }} />
      </div>
    </div>
  )
}
