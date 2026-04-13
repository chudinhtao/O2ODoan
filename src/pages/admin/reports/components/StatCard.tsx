import { Skeleton } from '@/shared/components/ui/Skeleton'

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  isLoading: boolean
  trend?: string
}

export const StatCard = ({ title, value, icon: Icon, isLoading, trend }: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
          <Icon size={28} />
        </div>
        <div>
          <p className="text-on-surface/50 text-sm font-medium mb-1">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <h3 className="text-2xl font-bold text-on-surface">{value}</h3>
          )}
        </div>
      </div>
      {trend && !isLoading && (
        <div className={`font-semibold px-2 py-1 rounded-lg text-sm ${
           trend.startsWith('-') ? 'text-red-600 bg-red-50' : 
           trend.startsWith('+') ? 'text-green-600 bg-green-50' : 
           'text-gray-500 bg-gray-100'
        }`}>
          {trend}
        </div>
      )}
    </div>
  )
}
