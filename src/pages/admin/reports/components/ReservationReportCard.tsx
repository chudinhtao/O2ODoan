import { useTranslation } from 'react-i18next'
import { CalendarDays, CheckCircle2, XCircle, UserX, CreditCard, RefreshCw, AlertTriangle } from 'lucide-react'
import type { IReservationReport } from '../types/report.type'

interface Props {
  data?: IReservationReport
  isLoading: boolean
}

export function ReservationReportCard({ data, isLoading }: Props) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">{t('common.loading', 'Đang tải dữ liệu...')}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    {
      label: t('admin.analytics.reservations.total', 'Tổng đặt bàn'),
      value: data.totalReservations,
      icon: CalendarDays,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: t('admin.analytics.reservations.completed', 'Đã hoàn thành'),
      value: data.totalCompleted,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: t('admin.analytics.reservations.cancelled', 'Đã huỷ'),
      value: data.totalCancelled,
      icon: XCircle,
      color: 'bg-red-50 text-red-600'
    },
    {
      label: t('admin.analytics.reservations.noshow', 'Không đến'),
      value: data.totalNoShow,
      icon: UserX,
      color: 'bg-slate-100 text-slate-600'
    }
  ]

  const depositStats = [
    {
      label: t('admin.analytics.reservations.deposits', 'Tổng tiền cọc'),
      value: `${data.totalDeposits.toLocaleString()} ₫`,
      icon: CreditCard,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      label: t('admin.analytics.reservations.refunded', 'Đã hoàn tiền'),
      value: `${data.refunded.toLocaleString()} ₫`,
      icon: RefreshCw,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: t('admin.analytics.reservations.forfeited', 'Mất cọc (Thu)'),
      value: `${data.forfeited.toLocaleString()} ₫`,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      label: t('admin.analytics.reservations.pendingRefund', 'Chờ hoàn tiền'),
      value: `${data.pendingRefund.toLocaleString()} ₫`,
      icon: RefreshCw,
      color: 'bg-orange-50 text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <h3 className="font-bold text-slate-800 mb-6">{t('admin.analytics.reservations.statusTitle', 'Trạng thái Đặt bàn')}</h3>
        <div className="grid grid-cols-2 gap-4 flex-1">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value.toLocaleString()}</p>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
        <h3 className="font-bold text-slate-800 mb-6">{t('admin.analytics.reservations.depositTitle', 'Thống kê Tiền cọc')}</h3>
        <div className="grid grid-cols-2 gap-4 flex-1">
          {depositStats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon size={20} />
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800">{stat.value}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
