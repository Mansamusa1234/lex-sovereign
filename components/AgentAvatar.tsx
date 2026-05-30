'use client'
import clsx from 'clsx'

export type AgentPersona = 'sovereign' | 'lex' | 'aria'

export const PERSONAS = {
  sovereign: {
    name: 'Sovereign',
    fullName: 'Darren Sovereign',
    role: 'Supreme Orchestrator',
    tagline: 'Commands with authority',
    color: '#f59e0b',
    glow: 'shadow-amber-500/50',
    ring: 'ring-amber-500/60',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    accent: 'text-amber-400',
  },
  lex: {
    name: 'Lex',
    fullName: 'Alexandra Lex',
    role: 'Legal Research Agent',
    tagline: 'Precise & analytical',
    color: '#60a5fa',
    glow: 'shadow-blue-500/50',
    ring: 'ring-blue-500/60',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    accent: 'text-blue-400',
  },
  aria: {
    name: 'Aria',
    fullName: 'Aria Grace',
    role: 'Email Drafting Agent',
    tagline: 'Clear & professional',
    color: '#34d399',
    glow: 'shadow-emerald-500/50',
    ring: 'ring-emerald-500/60',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    accent: 'text-emerald-400',
  },
}

// ── SOVEREIGN — Commanding male with crown ───────────────────────────────────
function SovereignSVG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      {/* Deep background */}
      <circle cx="60" cy="60" r="60" fill="#0f0a00"/>
      <circle cx="60" cy="60" r="58" fill="url(#sovBg)"/>
      <defs>
        <radialGradient id="sovBg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#2d1800" />
          <stop offset="100%" stopColor="#0f0800" />
        </radialGradient>
        <radialGradient id="skinSov" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#d4956a" />
          <stop offset="100%" stopColor="#b8783e" />
        </radialGradient>
      </defs>
      {/* Neck */}
      <rect x="49" y="76" width="22" height="18" rx="6" fill="#c8864e"/>
      {/* Suit shoulders */}
      <path d="M10 120 Q10 88 60 85 Q110 88 110 120Z" fill="#1a0e00"/>
      {/* Shirt / tie */}
      <path d="M48 90 L55 90 L60 100 L65 90 L72 90 Q68 105 60 108 Q52 105 48 90Z" fill="#2d1f00"/>
      <path d="M56 90 L60 100 L64 90 L62 90 L60 97 L58 90Z" fill="#f59e0b"/>
      {/* Head shape */}
      <ellipse cx="60" cy="54" rx="26" ry="30" fill="url(#skinSov)"/>
      {/* Hair - deep brown, slicked back */}
      <path d="M34 40 Q35 20 60 18 Q85 20 86 40 Q82 26 60 24 Q38 26 34 40Z" fill="#1a0800"/>
      <path d="M34 40 Q30 35 32 44" stroke="#1a0800" strokeWidth="3" fill="none"/>
      <path d="M86 40 Q90 35 88 44" stroke="#1a0800" strokeWidth="3" fill="none"/>
      {/* Crown */}
      <path d="M36 30 L40 18 L48 25 L60 14 L72 25 L80 18 L84 30 L80 28 L72 22 L60 18 L48 22 L40 28Z" fill="#f59e0b"/>
      <circle cx="60" cy="14" r="4" fill="#fcd34d"/>
      <circle cx="40" cy="18" r="3" fill="#f59e0b"/>
      <circle cx="80" cy="18" r="3" fill="#f59e0b"/>
      {/* Sideburns */}
      <rect x="34" y="44" width="6" height="14" rx="3" fill="#2a1500"/>
      <rect x="80" y="44" width="6" height="14" rx="3" fill="#2a1500"/>
      {/* Eyebrows - strong */}
      <path d="M42 45 Q50 41 56 44" stroke="#3d2000" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M64 44 Q70 41 78 45" stroke="#3d2000" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Eyes - intense dark */}
      <ellipse cx="50" cy="52" rx="6" ry="6.5" fill="white"/>
      <ellipse cx="70" cy="52" rx="6" ry="6.5" fill="white"/>
      <circle cx="51" cy="52" r="4" fill="#1a0800"/>
      <circle cx="71" cy="52" r="4" fill="#1a0800"/>
      <circle cx="52.5" cy="50.5" r="1.5" fill="white"/>
      <circle cx="72.5" cy="50.5" r="1.5" fill="white"/>
      {/* Nose - strong, defined */}
      <path d="M60 55 L57 65 Q60 68 63 65Z" fill="#b07040" opacity="0.7"/>
      <path d="M55 64 Q60 67 65 64" stroke="#a06030" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Mouth - firm, confident */}
      <path d="M48 72 Q60 78 72 72" stroke="#8b4513" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M50 72 Q60 75 70 72" fill="#c0604a" opacity="0.8"/>
      {/* Beard shadow */}
      <path d="M36 60 Q36 75 50 78 Q60 80 70 78 Q84 75 84 60" fill="#1a0800" opacity="0.15"/>
      {/* Glow effect */}
      <circle cx="60" cy="60" r="58" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  )
}

// ── LEX — Scholarly female with glasses ──────────────────────────────────────
function LexSVG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="60" fill="#00080f"/>
      <circle cx="60" cy="60" r="58" fill="url(#lexBg)"/>
      <defs>
        <radialGradient id="lexBg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#001428" />
          <stop offset="100%" stopColor="#000810" />
        </radialGradient>
        <radialGradient id="skinLex" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#f5d6c8" />
          <stop offset="100%" stopColor="#e8b898" />
        </radialGradient>
      </defs>
      {/* Neck */}
      <rect x="49" y="76" width="22" height="18" rx="6" fill="#edc8a8"/>
      {/* Blazer */}
      <path d="M10 120 Q10 88 60 85 Q110 88 110 120Z" fill="#0d1f3a"/>
      {/* Blouse */}
      <path d="M50 88 Q55 85 60 88 Q65 85 70 88 Q65 100 60 102 Q55 100 50 88Z" fill="#e8f4f8"/>
      {/* Head */}
      <ellipse cx="60" cy="52" rx="25" ry="29" fill="url(#skinLex)"/>
      {/* Hair — dark, professional bun/updo */}
      <path d="M35 42 Q34 20 60 18 Q86 20 85 42 Q82 24 60 22 Q38 24 35 42Z" fill="#2d1f00"/>
      {/* Bun at top */}
      <ellipse cx="60" cy="18" rx="14" ry="10" fill="#3d2a00"/>
      <ellipse cx="60" cy="16" rx="12" ry="8" fill="#2d1f00"/>
      {/* Hair sides flowing down */}
      <path d="M35 42 Q30 52 32 65 Q35 55 40 50" fill="#2d1f00"/>
      <path d="M85 42 Q90 52 88 65 Q85 55 80 50" fill="#2d1f00"/>
      {/* Glasses frames */}
      <rect x="36" y="47" width="18" height="13" rx="5" fill="none" stroke="#60a5fa" strokeWidth="2"/>
      <rect x="66" y="47" width="18" height="13" rx="5" fill="none" stroke="#60a5fa" strokeWidth="2"/>
      <line x1="54" y1="53" x2="66" y2="53" stroke="#60a5fa" strokeWidth="2"/>
      <line x1="28" y1="53" x2="36" y2="53" stroke="#60a5fa" strokeWidth="1.5"/>
      <line x1="84" y1="53" x2="92" y2="53" stroke="#60a5fa" strokeWidth="1.5"/>
      {/* Lens tint */}
      <rect x="37" y="48" width="16" height="11" rx="4" fill="#60a5fa" opacity="0.08"/>
      <rect x="67" y="48" width="16" height="11" rx="4" fill="#60a5fa" opacity="0.08"/>
      {/* Eyebrows */}
      <path d="M38 45 Q45 42 52 44" stroke="#3d2a00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M68 44 Q75 42 82 45" stroke="#3d2a00" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Eyes */}
      <ellipse cx="45" cy="53" rx="4" ry="4.5" fill="white"/>
      <ellipse cx="75" cy="53" rx="4" ry="4.5" fill="white"/>
      <circle cx="46" cy="53" r="2.8" fill="#1a3060"/>
      <circle cx="76" cy="53" r="2.8" fill="#1a3060"/>
      <circle cx="47" cy="52" r="0.9" fill="white"/>
      <circle cx="77" cy="52" r="0.9" fill="white"/>
      {/* Nose */}
      <path d="M60 57 L57 65 Q60 67 63 65Z" fill="#d4a880" opacity="0.5"/>
      {/* Mouth — slight thoughtful smile */}
      <path d="M50 71 Q60 76 70 71" stroke="#b07060" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M52 71 Q60 74 68 71" fill="#d4806a" opacity="0.6"/>
      {/* Earrings */}
      <circle cx="35" cy="58" r="3" fill="#60a5fa" opacity="0.8"/>
      <circle cx="85" cy="58" r="3" fill="#60a5fa" opacity="0.8"/>
      <circle cx="60" cy="60" r="58" fill="none" stroke="#60a5fa" strokeWidth="0.5" opacity="0.3"/>
    </svg>
  )
}

// ── ARIA — Warm, communicative with headset ───────────────────────────────────
function AriaSVG({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="60" fill="#001209"/>
      <circle cx="60" cy="60" r="58" fill="url(#ariaBg)"/>
      <defs>
        <radialGradient id="ariaBg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#001e10" />
          <stop offset="100%" stopColor="#000c06" />
        </radialGradient>
        <radialGradient id="skinAria" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#e8b888" />
          <stop offset="100%" stopColor="#d49060" />
        </radialGradient>
      </defs>
      {/* Neck */}
      <rect x="49" y="76" width="22" height="18" rx="6" fill="#d4a060"/>
      {/* Professional top */}
      <path d="M10 120 Q10 88 60 85 Q110 88 110 120Z" fill="#0a200f"/>
      {/* Headset arc over head */}
      <path d="M30 54 Q28 28 60 26 Q92 28 90 54" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round"/>
      {/* Ear cups */}
      <circle cx="30" cy="55" r="7" fill="#0d2d1a" stroke="#34d399" strokeWidth="2"/>
      <circle cx="90" cy="55" r="7" fill="#0d2d1a" stroke="#34d399" strokeWidth="2"/>
      <circle cx="30" cy="55" r="3.5" fill="#34d399" opacity="0.7"/>
      <circle cx="90" cy="55" r="3.5" fill="#34d399" opacity="0.7"/>
      {/* Mic boom */}
      <line x1="90" y1="62" x2="96" y2="76" stroke="#34d399" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="97" cy="78" r="4" fill="#34d399" opacity="0.9"/>
      <circle cx="97" cy="78" r="2" fill="#0d2d1a"/>
      {/* Head */}
      <ellipse cx="60" cy="52" rx="24" ry="28" fill="url(#skinAria)"/>
      {/* Hair — natural, flowing waves */}
      <path d="M36 42 Q35 20 60 18 Q85 20 84 42 Q82 24 60 22 Q38 24 36 42Z" fill="#1a0800"/>
      {/* Side waves */}
      <path d="M36 42 Q30 54 32 72 Q36 58 42 54" fill="#1a0800"/>
      <path d="M84 42 Q90 54 88 72 Q84 58 78 54" fill="#1a0800"/>
      {/* Hair highlight */}
      <path d="M44 20 Q55 17 60 19" stroke="#2d1200" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
      {/* Eyebrows — gentle arched */}
      <path d="M40 43 Q48 40 54 43" stroke="#2d1200" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M66 43 Q72 40 80 43" stroke="#2d1200" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Eyes — warm, wide */}
      <ellipse cx="47" cy="51" rx="5.5" ry="6" fill="white"/>
      <ellipse cx="73" cy="51" rx="5.5" ry="6" fill="white"/>
      <circle cx="48" cy="51" r="3.5" fill="#1a3010"/>
      <circle cx="74" cy="51" r="3.5" fill="#1a3010"/>
      <circle cx="49.5" cy="49.5" r="1.2" fill="white"/>
      <circle cx="75.5" cy="49.5" r="1.2" fill="white"/>
      {/* Eyelashes */}
      <path d="M42 46 Q44 44 47 45" stroke="#1a0800" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M52 45 Q55 44 52 46" stroke="#1a0800" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M68 45 Q71 44 73 45" stroke="#1a0800" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M78 46 Q80 44 79 45" stroke="#1a0800" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Nose — soft */}
      <path d="M60 55 L58 63 Q60 65 62 63Z" fill="#c09060" opacity="0.5"/>
      {/* Warm smile */}
      <path d="M48 70 Q60 78 72 70" stroke="#a05030" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M50 70 Q60 76 70 70" fill="#e08060" opacity="0.7"/>
      {/* Dimples */}
      <circle cx="48" cy="72" r="1.5" fill="#c07040" opacity="0.3"/>
      <circle cx="72" cy="72" r="1.5" fill="#c07040" opacity="0.3"/>
      {/* Earrings hidden by headset */}
      <circle cx="60" cy="60" r="58" fill="none" stroke="#34d399" strokeWidth="0.5" opacity="0.3"/>
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
        'rounded-full ring-2 overflow-hidden transition-all duration-700 flex-shrink-0',
        p.ring,
        active && 'scale-110',
        speaking
          ? `shadow-2xl ${p.glow} animate-[breathe_1.5s_ease-in-out_infinite]`
          : `shadow-lg`,
      )}>
        {persona === 'sovereign' && <SovereignSVG size={size} />}
        {persona === 'lex'       && <LexSVG size={size} />}
        {persona === 'aria'      && <AriaSVG size={size} />}
      </div>

      {/* Speaking wave */}
      {speaking && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
          {[1, 2, 3, 2, 1].map((h, i) => (
            <div key={i} className="w-1 rounded-full"
              style={{
                backgroundColor: p.color,
                height: `${h * 5}px`,
                animation: `speakBar 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
