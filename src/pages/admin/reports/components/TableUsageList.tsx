import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Armchair, Users, Clock } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import type { ITableUsage } from '../types/report.type'

interface TableUsageListProps {
  data: ITableUsage[]
  isLoading: boolean
  isDashboard?: boolean
}

export const TableUsageList = ({ data, isLoading, isDashboard = false }: TableUsageListProps) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const displayLimit = isDashboard ? 4 : (expanded ? data.length : 8)
  const displayData = data.slice(0, displayLimit)

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col min-w-0 h-auto">
      <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
        <Armchair size={20} className="text-primary"/>
        {t('admin.dashboard.table_usage')}
      </h3>
      
      <div className="flex-1 w-full min-h-0">
        {isLoading ? (
           <div className="space-y-4">
             {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
           </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-on-surface/40">
            <p>{t('admin.dashboard.no_data', 'Chưa có dữ liệu bàn')}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
            {displayData.map((item: ITableUsage, index: number) => (
              <li key={item.tableNumber || index} className="flex flex-col gap-2 overflow-hidden bg-surface p-3 rounded-xl border border-primary/5 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-on-surface truncate" title={item.tableName}>
                      {index + 1}. {item.tableName} {item.zone ? `(${item.zone})` : ''}
                    </span>
                    <span className="text-xs text-on-surface/50 flex items-center gap-1 mt-0.5">
                       <Users size={12} />
                       {item.capacity ? `${item.capacity} chỗ` : 'Không rõ'} • {item.sessionsCount} lượt khách
                    </span>
                  </div>
                  <span className="font-bold text-primary flex-shrink-0 text-right">
                    {item.totalRevenue.toLocaleString()} ₫
                  </span>
                </div>
                
                {item.avgSessionMinutes && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-1.5 rounded-md mt-1 w-max">
                    <Clock size={12} className="text-orange-500" />
                    <span>TB/lượt: <b>{Math.round(item.avgSessionMinutes)}</b> phút</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {!isLoading && data.length > (isDashboard ? 4 : 8) && !isDashboard && (
           <div className="flex justify-center mt-4 border-t border-slate-200 pt-4">
             <button 
                onClick={() => setExpanded(!expanded)} 
                className="text-primary font-semibold text-sm hover:underline"
             >
               {expanded ? t('common.showLess', 'Show less') : t('common.showMore', 'Show more')}
             </button>
           </div>
        )}

        {!isLoading && isDashboard && (
           <div className="flex justify-center mt-4 border-t border-slate-200 pt-4">
             <Link 
                to="/admin/reports" 
                className="text-primary font-semibold text-sm hover:underline"
             >
               {t('admin.dashboard.viewDetailedReport')}
             </Link>
           </div>
        )}
      </div>
    </div>
  )
}
