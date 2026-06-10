import { Skeleton } from '@/shared/components/ui/Skeleton'

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  isLoading: boolean
  trend?: string
  color?: 'primary' | 'amber' | 'emerald' | 'rose'
}

export const StatCard = ({ title, value, icon: Icon, isLoading, trend, color = 'primary' }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600'
  }

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex items-center justify-between gap-2.5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5 truncate" title={title}>
            {title}
          </p>
          {isLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <h3 className="text-base font-black text-slate-800 tracking-tight leading-tight truncate">
              {value}
            </h3>
          )}
        </div>
      </div>
      {trend && !isLoading && (
        <div className={`font-black px-1.5 py-0.5 rounded-full text-[9px] flex-shrink-0 ${
           trend.startsWith('-') ? 'text-rose-600 bg-rose-50' : 
           trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 
           'text-slate-500 bg-slate-100'
        }`}>
          {trend}
        </div>
      )}
    </div>
  )
}
