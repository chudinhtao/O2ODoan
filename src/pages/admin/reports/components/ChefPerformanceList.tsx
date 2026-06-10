import { useTranslation } from 'react-i18next'
import { ChefHat, Flame } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Badge } from '@/shared/components/ui/Badge'
import type { IChefPerformance } from '../types/report.type'

interface Props {
  data: IChefPerformance[]
  isLoading: boolean
}

export function ChefPerformanceList({ data, isLoading }: Props) {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
        <ChefHat size={20} className="text-primary" />
        {t('admin.analytics.chef_kpi', 'KPI Đầu bếp (Tốc độ ra món)')}
      </h3>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            {t('admin.analytics.no_data', 'Chưa có dữ liệu')}
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((chef) => {
              const isFast = chef.avgPrepMinutes < 5
              const isSlow = chef.avgPrepMinutes > 15
              
              return (
                <div key={chef.chefId} className="flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      {chef.chefName}
                      {isFast && <Flame size={16} className="text-red-500 animate-pulse" />}
                    </span>
                    <Badge variant="neutral">
                      {t('admin.analytics.total', 'Tổng')}: {chef.totalItemsPrepared} {t('admin.analytics.items_unit', 'món')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="flex flex-col bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-xs uppercase font-bold text-slate-400">{t('admin.analytics.avg_speed', 'Tốc độ trung bình')}</span>
                      <span className={`font-bold ${isFast ? 'text-green-600' : isSlow ? 'text-red-500' : 'text-slate-700'}`}>
                        {chef.avgPrepMinutes.toFixed(1)} {t('admin.analytics.minutes', 'phút')}
                      </span>
                    </div>
                    <div className="flex flex-col bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-xs uppercase font-bold text-slate-400">{t('admin.analytics.late_rate', 'Tỷ lệ trễ (>15p)')}</span>
                      <span className={`font-bold ${chef.lateRate > 20 ? 'text-red-500' : 'text-slate-700'}`}>
                        {chef.lateRate.toFixed(1)}% ({chef.lateItemCount})
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
