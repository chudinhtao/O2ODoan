import { LucideIcon } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/formatCurrency'

interface SummaryCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  color?: 'primary' | 'error' | 'warning' | 'success' | 'info'
  isCurrency?: boolean
  trend?: string
  onClick?: () => void
}

export default function SummaryCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  color = 'primary',
  isCurrency = false,
  trend,
  onClick
}: SummaryCardProps) {
  
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    error: 'bg-red-50 text-red-600',
    warning: 'bg-amber-50 text-amber-600',
    success: 'bg-emerald-50 text-emerald-600',
    info: 'bg-blue-50 text-blue-600',
  }

  const iconColor = colorMap[color]

  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-4 group transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:border-primary/20' : 'hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.08)]'}`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${iconColor} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col items-end gap-1">
          {description && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 bg-surface-container px-2 py-0.5 rounded-full">
              {description}
            </span>
          )}
          {trend && (
            <span className="text-[11px] font-bold text-emerald-600 animate-pulse">
              {trend}
            </span>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-on-surface-variant mb-1">{title}</h3>
        <div className="text-2xl font-black text-on-surface">
          {isCurrency ? formatCurrency(Number(value)) : value}
        </div>
      </div>
    </div>
  )
}
