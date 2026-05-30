'use client'
import clsx from 'clsx'

export type AgentPersona = 'sovereign' | 'lex' | 'aria'

export const PERSONAS = {
  sovereign: {
    name: 'Sovereign',
    role: 'Supreme Orchestrator',
    voice: 'deep, commanding',
    color: '#f59e0b',
    glow: 'shadow-amber-500/40',
    ring: 'ring-amber-500/60',
    bg: 'bg-amber-500/10',
  },
  lex: {
    name: 'Lex',
    role: 'Legal Research Agent',
    voice: 'precise, scholarly',
    color: '#60a5fa',
    glow: 'shadow-blue-500/40',
    ring: 'ring-blue-500/60',
    bg: 'bg-blue-500/10',
  },
  aria: {
    name: 'Aria',
    role: 'Email Drafting Agent',
    voice: 'clear, professional',
    color: '#34d399',
    glow: 'shadow-emerald-500/40',
    ring: 'ring-emerald-500/60',
    bg: 'bg-emerald-500/10',
  },
}

function SovereignFace({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      {/* Glow */}
      <circle cx="50" cy="50" r="48" fill="#f59e0b" opacity="0.08"/>
      {/* Neck */}
      <rect x="42" y="64" width="16" height="12" rx="4" fill="#d4a574"/>
      {/* Shoulders */}
      <path d="M15 100 Q15 76 50 74 Q85 76 85 100Z" fill="#1e1407"/>
      {/* Gold collar */}
      <path d="M30 82 Q50 74 70 82" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Head */}
      <circle cx="50" cy="46" r="24" fill="#d4a574"/>
      {/* Hair */}
      <path d="M26 42 Q27 22 50 20 Q73 22 74 42 Q70 30 50 28 Q30 30 26 42Z" fill="#2d1b00"/>
      {/* Crown */}
      <path d="M30 28 L34 18 L40 24 L50 16 L60 24 L66 18 L70 28" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="50" cy="16" r="3" fill="#f59e0b"/>
      <circle cx="34" cy="18" r="2" fill="#f59e0b"/>
      <circle cx="66" cy="18" r="2" fill="#f59e0b"/>
      {/* Eyes */}
      <ellipse cx="41" cy="46" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="59" cy="46" rx="4" ry="4.5" fill="white"/>
      <circle cx="42" cy="46" r="2.5" fill="#1a0a00"/>
      <circle cx="60" cy="46" r="2.5" fill="#1a0a00"/>
      <circle cx="43" cy="45" r="0.8" fill="white"/>
      <circle cx="61" cy="45" r="0.8" fill="white"/>
      {/* Eyebrows */}
      <path d="M37 41 Q41 39 45 41" stroke="#2d1b00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M55 41 Q59 39 63 41" stroke="#2d1b00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Nose */}
      <path d="M50 48 L47 56 Q50 58 53 56Z" fill="#c4956a" opacity="0.6"/>
      {/* Mouth */}
      <path d="M42 61 Q50 66 58 61" stroke="#9e5a2a" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M44 61 Q50 64 56 61" fill="#e07060" opacity="0.7"/>
    </svg>
  )
}

function LexFace({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="48" fill="#60a5fa" opacity="0.06"/>
      <rect x="42" y="64" width="16" height="12" rx="4" fill="#f5d6c8"/>
      <path d="M15 100 Q15 76 50 74 Q85 76 85 100Z" fill="#0f172a"/>
      <path d="M50 74 L42 80 L58 80Z" fill="#1e3a5f" opacity="0.8"/>
      <circle cx="50" cy="46" r="24" fill="#f5d6c8"/>
      {/* Hair */}
      <path d="M26 40 Q28 20 50 19 Q72 20 74 40 Q70 26 50 25 Q30 26 26 40Z" fill="#4a2c00"/>
      {/* Glasses */}
      <rect x="33" y="42" width="14" height="10" rx="4" fill="none" stroke="#60a5fa" strokeWidth="1.5"/>
      <rect x="53" y="42" width="14" height="10" rx="4" fill="none" stroke="#60a5fa" strokeWidth="1.5"/>
      <line x1="47" y1="47" x2="53" y2="47" stroke="#60a5fa" strokeWidth="1.5"/>
      <line x1="25" y1="47" x2="33" y2="47" stroke="#60a5fa" strokeWidth="1.5"/>
      <line x1="67" y1="47" x2="75" y2="47" stroke="#60a5fa" strokeWidth="1.5"/>
      {/* Eyes */}
      <circle cx="40" cy="47" r="2.5" fill="#1a0a00"/>
      <circle cx="60" cy="47" r="2.5" fill="#1a0a00"/>
      <circle cx="41" cy="46" r="0.8" fill="white"/>
      <circle cx="61" cy="46" r="0.8" fill="white"/>
      {/* Eyebrows */}
      <path d="M35 40 Q40 38 45 40" stroke="#4a2c00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M55 40 Q60 38 65 40" stroke="#4a2c00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Nose */}
      <path d="M50 50 L47 57 Q50 59 53 57Z" fill="#e0b090" opacity="0.5"/>
      {/* Mouth */}
      <path d="M43 63 Q50 67 57 63" stroke="#b07050" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function AriaFace({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}>
      <circle cx="50" cy="50" r="48" fill="#34d399" opacity="0.06"/>
      <rect x="42" y="64" width="16" height="12" rx="4" fill="#e8c5b0"/>
      <path d="M15 100 Q15 76 50 74 Q85 76 85 100Z" fill="#0f1a12"/>
      <circle cx="50" cy="46" r="24" fill="#e8c5b0"/>
      {/* Hair */}
      <path d="M26 42 Q24 20 50 18 Q76 20 74 42 Q72 24 50 22 Q28 24 26 42Z" fill="#1a0a00"/>
      <path d="M26 42 Q22 55 24 65 Q28 56 32 52" fill="#1a0a00"/>
      <path d="M74 42 Q78 55 76 65 Q72 56 68 52" fill="#1a0a00"/>
      {/* Headset mic */}
      <circle cx="75" cy="46" r="5" fill="none" stroke="#34d399" strokeWidth="2"/>
      <path d="M72 42 Q68 34 50 33 Q32 34 28 42" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="25" cy="46" r="5" fill="none" stroke="#34d399" strokeWidth="2"/>
      <line x1="75" y1="51" x2="78" y2="58" stroke="#34d399" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="79" cy="60" r="3" fill="#34d399" opacity="0.8"/>
      {/* Eyes */}
      <ellipse cx="41" cy="46" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="59" cy="46" rx="4" ry="4.5" fill="white"/>
      <circle cx="42" cy="46" r="2.8" fill="#1a3a1a"/>
      <circle cx="60" cy="46" r="2.8" fill="#1a3a1a"/>
      <circle cx="43" cy="45" r="0.8" fill="white"/>
      <circle cx="61" cy="45" r="0.8" fill="white"/>
      {/* Eyebrows */}
      <path d="M36 40 Q41 38 45 40" stroke="#1a0a00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M55 40 Q59 38 64 40" stroke="#1a0a00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Nose */}
      <path d="M50 49 L47 56 Q50 58 53 56Z" fill="#d0a080" opacity="0.5"/>
      {/* Smile */}
      <path d="M42 62 Q50 68 58 62" stroke="#b06040" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M44 62 Q50 66 56 62" fill="#e08070" opacity="0.6"/>
    </svg>
  )
}

interface Props {
  persona: AgentPersona
  size?: number
  speaking?: boolean
  active?: boolean
  className?: string
}

export default function AgentAvatar({ persona, size = 64, speaking = false, active = false, className }: Props) {
  const p = PERSONAS[persona]

  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      <div className={clsx(
        'rounded-full ring-2 overflow-hidden transition-all duration-700',
        p.ring,
        p.bg,
        active && 'scale-110',
        speaking ? `shadow-2xl ${p.glow} animate-[breathe_1.5s_ease-in-out_infinite]` : 'shadow-lg',
      )}>
        {persona === 'sovereign' && <SovereignFace size={size} />}
        {persona === 'lex'      && <LexFace size={size} />}
        {persona === 'aria'     && <AriaFace size={size} />}
      </div>

      {/* Speaking wave indicator */}
      {speaking && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
          {[1, 2, 3, 2, 1].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full"
              style={{
                backgroundColor: p.color,
                height: `${h * 4}px`,
                animation: `speakBar 0.6s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
