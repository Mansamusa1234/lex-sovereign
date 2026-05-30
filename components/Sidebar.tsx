'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  LayoutDashboard, CheckSquare, Mail, FileText, BookOpen,
  ClipboardList, Scale, ChevronRight, Settings, Bot
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/approvals', label: 'Approvals',      icon: CheckSquare, badge: true },
  { href: '/emails',    label: 'Emails',          icon: Mail },
  { href: '/documents', label: 'Documents',       icon: FileText },
  { href: '/knowledge', label: 'Knowledge Base',  icon: BookOpen },
  { href: '/agents',    label: 'Agents',           icon: Bot },
  { href: '/audit',     label: 'Audit Log',        icon: ClipboardList },
]

export default function Sidebar({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <Scale className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Lex Sovereign</p>
            <p className="text-slate-400 text-xs">AI Brain</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                active
                  ? 'bg-amber-500/10 text-amber-400 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className={clsx(
                'w-4 h-4 flex-shrink-0',
                active ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
              )} />
              <span className="flex-1">{label}</span>
              {badge && pendingCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[20px] text-center leading-none">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
              {active && <ChevronRight className="w-3 h-3 text-amber-500/60 flex-shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-slate-800 pt-3 space-y-0.5">
        <Link href="/setup" className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
          isActive('/setup')
            ? 'bg-amber-500/10 text-amber-400 font-medium'
            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
        )}>
          <Settings className="w-4 h-4 flex-shrink-0 text-slate-600 group-hover:text-slate-400" />
          Setup & Status
        </Link>
        <p className="text-xs text-slate-700 leading-relaxed px-3 pt-2">
          Research & drafting tool — not a lawyer.
        </p>
      </div>
    </aside>
  )
}
