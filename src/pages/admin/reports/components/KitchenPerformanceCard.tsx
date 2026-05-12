import { ChefHat, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import type { IKitchenPerformance } from '../types/report.type'

interface Props {
  data: IKitchenPerformance[]
  isLoading: boolean
}

import { useTranslation } from 'react-i18next'

export function KitchenPerformanceCard({ data, isLoading }: Props) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <ChefHat size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-on-surface">{t('admin.analytics.kitchen_performance', 'Hiệu suất Bếp')}</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center justify-center h-full min-h-[200px] text-on-surface/40">
        <ChefHat size={32} className="mb-2 opacity-40" />
        <p className="text-sm">{t('admin.analytics.no_kitchen_data', 'Chưa có dữ liệu hiệu suất bếp')}</p>
        <p className="text-xs text-center mt-1">{t('admin.analytics.no_kitchen_data_desc', 'Cần có dữ liệu từ KDS (các ticket đã hoàn thành)')}</p>
      </div>
    )
  }

  const totalTickets = data.reduce((sum, r) => sum + r.totalTickets, 0)
  const totalLate = data.reduce((sum, r) => sum + r.lateTickets, 0)
  const overallLateRate = totalTickets > 0 ? (totalLate / totalTickets) * 100 : 0
  const isWarning = overallLateRate > 20

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col min-w-0 h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <ChefHat size={20} className="text-primary" />
          {t('admin.analytics.kitchen_performance', 'Hiệu suất Bếp')}
        </h3>
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
          isWarning ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {isWarning ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
          {overallLateRate.toFixed(1)}% {t('admin.analytics.delayed', 'trễ')}
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
          <p className="text-lg font-black text-on-surface">{totalTickets}</p>
          <p className="text-[10px] text-slate-500">{t('admin.analytics.total_tickets', 'Tổng ticket')}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5 text-center">
          <p className="text-lg font-black text-orange-500">{totalLate}</p>
          <p className="text-[10px] text-slate-500">{t('admin.analytics.delayed_tickets', 'Bị trễ')}</p>
        </div>
        <div className={`rounded-xl p-2.5 text-center ${isWarning ? 'bg-red-50' : 'bg-emerald-50'}`}>
          <p className={`text-lg font-black ${isWarning ? 'text-red-600' : 'text-emerald-600'}`}>
            {overallLateRate.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-500">{t('admin.analytics.delay_rate', 'Tỉ lệ trễ')}</p>
        </div>
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
        <ul className="space-y-2">
          {data.map((item, idx) => (
            <li key={`${item.itemName}-${idx}`} className="flex items-center gap-3 p-2.5 bg-surface rounded-xl border border-primary/5">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.itemName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={10} />
                    {item.avgPrepMinutes != null ? `${item.avgPrepMinutes} ${t('admin.analytics.minute_per_ticket', 'phút/ticket')}` : 'N/A'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{item.totalTickets} {t('admin.analytics.tickets', 'ticket')}</span>
                </div>
              </div>
              {item.lateRate > 0 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  item.lateRate > 30 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.lateRate}% {t('admin.analytics.delayed', 'trễ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {isWarning && (
        <div className="mt-3 p-2.5 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
          <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">
            {t('admin.analytics.warning_kitchen_overload', 'Cảnh báo: Bếp đang quá tải (trễ >20%). Cần xem xét điều chỉnh menu hoặc bổ sung nhân lực giờ cao điểm.')}
          </p>
        </div>
      )}
    </div>
  )
}
