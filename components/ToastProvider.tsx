'use client'
import {
  createContext, useContext, useState, useCallback, useRef,
  type ReactNode
} from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast:   (message: string, variant?: ToastVariant) => void
  success: (message: string) => void
  error:   (message: string) => void
  warning: (message: string) => void
  info:    (message: string) => void
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {}, success: () => {}, error: () => {}, warning: () => {}, info: () => {},
})

export const useToast = () => useContext(ToastContext)

const DURATION = 4500

const ICON: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}

const STYLE: Record<ToastVariant, string> = {
  success: 'bg-slate-900 border-emerald-500/40 text-emerald-300',
  error:   'bg-slate-900 border-red-500/40 text-red-300',
  warning: 'bg-slate-900 border-amber-500/40 text-amber-300',
  info:    'bg-slate-900 border-blue-500/40 text-blue-300',
}

const ICON_STYLE: Record<ToastVariant, string> = {
  success: 'text-emerald-400',
  error:   'text-red-400',
  warning: 'text-amber-400',
  info:    'text-blue-400',
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = ICON[toast.variant]
  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl shadow-black/40',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
        'pointer-events-auto min-w-[280px] max-w-[420px]',
        STYLE[toast.variant]
      )}
    >
      <Icon className={clsx('w-4 h-4 flex-shrink-0 mt-0.5', ICON_STYLE[toast.variant])} />
      <p className="flex-1 text-sm text-slate-200 leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts(prev => [...prev.slice(-4), { id, message, variant }])
    timers.current[id] = setTimeout(() => dismiss(id), DURATION)
  }, [dismiss])

  const ctx: ToastContextValue = {
    toast:   add,
    success: (m) => add(m, 'success'),
    error:   (m) => add(m, 'error'),
    warning: (m) => add(m, 'warning'),
    info:    (m) => add(m, 'info'),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
