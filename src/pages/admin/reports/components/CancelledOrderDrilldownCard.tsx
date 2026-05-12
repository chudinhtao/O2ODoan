import { XCircle, TrendingDown, DollarSign } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import type { ICancelledOrderDrilldown } from '../types/report.type'

interface Props {
  data: ICancelledOrderDrilldown[]
  isLoading: boolean
}

import { useTranslation } from 'react-i18next'

function formatVnd(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount)
}

export function CancelledOrderDrilldownCard({ data, isLoading }: Props) {
  const { t } = useTranslation()

  const REASON_LABELS: Record<string, { label: string; color: string }> = {
    CUSTOMER_REQUEST: { label: t('admin.analytics.reason_customer', 'Khách yêu cầu'), color: 'bg-blue-100 text-blue-700' },
    ITEM_UNAVAILABLE: { label: t('admin.analytics.reason_out_of_stock', 'Món hết hàng'), color: 'bg-orange-100 text-orange-700' },
    KITCHEN_BUSY:     { label: t('admin.analytics.reason_busy_kitchen', 'Bếp quá tải'), color: 'bg-red-100 text-red-700' },
    WRONG_ORDER:      { label: t('admin.analytics.reason_wrong_order', 'Đặt sai món'), color: 'bg-purple-100 text-purple-700' },
    PAYMENT_FAILED:   { label: t('admin.analytics.reason_payment_failed', 'TT thất bại'), color: 'bg-pink-100 text-pink-700' },
    UNKNOWN:          { label: t('admin.analytics.reason_other', 'Khác'), color: 'bg-slate-100 text-slate-600' },
  }

  function getReasonInfo(reason: string) {
    return REASON_LABELS[reason] ?? { label: reason, color: 'bg-slate-100 text-slate-600' }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <XCircle size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-on-surface">{t('admin.analytics.cancelled_drilldown', 'Phân tích Đơn Hủy')}</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col items-center justify-center h-full min-h-[160px] text-emerald-600">
        <XCircle size={28} className="mb-2 opacity-60" />
        <p className="text-sm font-semibold">{t('admin.analytics.no_cancelled_data', 'Không có đơn bị hủy!')}</p>
        <p className="text-xs text-slate-400 mt-1">{t('admin.analytics.no_cancelled_data_desc', 'Vận hành xuất sắc trong kỳ này')}</p>
      </div>
    )
  }

  const totalCancelled = data.reduce((sum, r) => sum + r.cancelCount, 0)
  const totalLost = data.reduce((sum, r) => sum + r.cancelledRevenue, 0)

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col min-w-0 h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <XCircle size={20} className="text-primary" />
          {t('admin.analytics.cancelled_drilldown', 'Phân tích Đơn Hủy')}
        </h3>
        <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
          {totalCancelled} {t('admin.analytics.total_cancelled', 'đơn hủy')}
        </span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-red-50 rounded-xl p-3 flex items-center gap-2">
          <TrendingDown size={16} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-black text-red-700">{totalCancelled}</p>
            <p className="text-[10px] text-red-500">{t('admin.analytics.total_cancelled', 'đơn hủy')}</p>
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-2">
          <DollarSign size={16} className="text-orange-500 shrink-0" />
          <div>
            <p className="text-sm font-black text-orange-700">{formatVnd(totalLost)}</p>
            <p className="text-[10px] text-orange-500">{t('admin.analytics.lost_revenue', 'Doanh thu bị mất')}</p>
          </div>
        </div>
      </div>

      {/* Reason Breakdown */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0">
        <ul className="space-y-2">
          {data.map((item, idx) => {
            const info = getReasonInfo(item.cancellationReason)
            const pct = totalCancelled > 0 ? ((item.cancelCount / totalCancelled) * 100).toFixed(0) : '0'
            return (
              <li key={`${item.cancellationReason}-${idx}`} className="p-3 bg-surface rounded-xl border border-primary/5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${info.color}`}>
                    {info.label}
                  </span>
                  <span className="text-sm font-bold text-slate-700">{item.cancelCount} đơn</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5">
                  <div
                    className="bg-rose-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{pct}{t('admin.analytics.total_cancelled_pct', '% tổng hủy')}</span>
                  <span className="text-rose-600 font-semibold">-{formatVnd(item.cancelledRevenue)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
