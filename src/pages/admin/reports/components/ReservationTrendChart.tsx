import { useTranslation } from 'react-i18next'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { format, parseISO } from 'date-fns'
import type { IDailyReservationTrend } from '../types/report.type'

interface Props {
  data?: IDailyReservationTrend[]
  isLoading: boolean
}

export function ReservationTrendChart({ data = [], isLoading }: Props) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">{t('common.loading', 'Đang tải biểu đồ...')}</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-[400px] flex flex-col items-center justify-center text-slate-400">
        <p>{t('admin.analytics.no_data', 'Chưa có dữ liệu')}</p>
      </div>
    )
  }

  // Format data for Recharts
  const chartData = data.map(item => ({
    ...item,
    displayDate: format(parseISO(item.day), 'dd/MM')
  }))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-[400px] flex flex-col">
      <h3 className="font-bold text-slate-800 mb-6">{t('admin.analytics.reservations.trend', 'Xu hướng Đặt bàn theo ngày')}</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="displayDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '13px', fontWeight: 600 }}
              labelStyle={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
            
            <Line 
              type="monotone" 
              name={t('admin.analytics.reservations.total', 'Tổng đặt bàn')}
              dataKey="totalReservations" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              name={t('admin.analytics.reservations.completed', 'Đã hoàn thành')}
              dataKey="totalCompleted" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line 
              type="monotone" 
              name={t('admin.analytics.reservations.cancelled', 'Đã huỷ')}
              dataKey="totalCancelled" 
              stroke="#EF4444" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
