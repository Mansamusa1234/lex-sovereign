'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  LayoutDashboard, CheckSquare, Mail, BookOpen,
  Scale, Bot, Newspaper
} from 'lucide-react'

const TABS = [
  { href: '/dashboard', label: 'Brain',    icon: LayoutDashboard },
  { href: '/approvals', label: 'Approve',  icon: CheckSquare },
  { href: '/emails',    label: 'Emails',   icon: Mail },
  { href: '/news',      label: 'News',     icon: Newspaper },
  { href: '/knowledge', label: 'Library',  icon: BookOpen },
  { href: '/agents',    label: 'Agents',   icon: Bot },
]

export default function MobileNav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-2 pb-safe">
      <div className="flex items-center justify-around">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex flex-col items-center gap-0.5 py-3 px-2 min-w-0 flex-1 relative transition-colors',
                active ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
              )}>
              <div className="relative">
                <Icon className={clsx('w-5 h-5', active && 'drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]')} />
                {href === '/approvals' && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium truncate">{label}</span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-amber-400 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
