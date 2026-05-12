import { BellRing, Clock } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import type { IStaffCallStats } from '../types/report.type'

interface Props {
  data: IStaffCallStats[]
  isLoading: boolean
}

import { useTranslation } from 'react-i18next'

export function StaffCallStatsList({ data, isLoading }: Props) {
  const { t } = useTranslation()
  const getCallTypeLabel = (type: string) => {
    switch (type) {
      case 'BILL': return { label: t('admin.analytics.payment', 'Thanh toán'), color: 'bg-emerald-100 text-emerald-700' }
      case 'WATER': return { label: t('admin.analytics.water', 'Lấy nước'), color: 'bg-blue-100 text-blue-700' }
      case 'CLEAN': return { label: t('admin.analytics.clean_table', 'Dọn bàn'), color: 'bg-amber-100 text-amber-700' }
      case 'SUPPORT': return { label: t('admin.analytics.other_support', 'Hỗ trợ khác'), color: 'bg-purple-100 text-purple-700' }
      default: return { label: type, color: 'bg-slate-100 text-slate-700' }
    }
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col min-w-0 h-full overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <BellRing size={20} className="text-primary"/>
          {t('admin.analytics.staff_call_stats', 'Thống kê gọi nhân viên')}
        </h3>
      </div>

      <div className="flex-1 flex flex-col min-h-0 w-full">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-on-surface/40">
            <p>{t('admin.analytics.no_staff_call_data', 'Không có dữ liệu gọi nhân viên')}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0 pb-2">
            <ul className="space-y-3">
              {data.map((item, index) => {
                const typeInfo = getCallTypeLabel(item.callType)
                return (
                  <li key={`${item.tableNumber}-${item.callType}-${index}`} className="flex flex-col gap-2 p-3 bg-surface rounded-xl border border-primary/5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 w-16">{t('admin.analytics.table', 'Bàn')} {item.tableNumber}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <span className="font-bold text-primary">{item.callCount} {t('admin.analytics.times', 'lần')}</span>
                    </div>
                    
                    {item.avgResolveMinutes && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 p-1.5 rounded-md w-max mt-1">
                        <Clock size={12} className="text-orange-500" />
                        <span>{t('admin.analytics.avg_resolve', 'Xử lý TB')}: <b>{Math.round(item.avgResolveMinutes)}</b> {t('admin.analytics.avg_minute_per_time', 'phút/lần')}</span>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
