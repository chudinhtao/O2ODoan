import clsx from 'clsx'

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantMap: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  danger: 'bg-red-50 text-red-700 border-red-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  info: 'bg-blue-50 text-blue-700 border-blue-100',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
}

const dotMap: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-400',
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border leading-tight uppercase tracking-wider',
        variantMap[variant],
        className
      )}
    >
      <span className={clsx("w-1 h-1 rounded-full", dotMap[variant])} />
      {children}
    </span>
  )
}
