import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { TrendingUp } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { IRevenueReport } from '../types/report.type'

interface Props {
  data: IRevenueReport[]
  isLoading: boolean
  totalRevenue: number
}

export function RevenueChart({ data, isLoading, totalRevenue }: Props) {
  const { t } = useTranslation()

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col min-w-0">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-3 gap-2">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          {t('admin.analytics.revenue_trend')}
        </h3>
        <div className="flex flex-col items-end">
          <div className="text-xs text-on-surface-variant font-medium uppercase tracking-[0.1em]">{t('admin.analytics.total_gross', 'Tổng Doanh Thu (Gross)')}</div>
          <div className="font-black text-2xl text-primary">{totalRevenue.toLocaleString()} ₫</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
        <div className="p-3 bg-surface-variant/30 rounded-xl border border-outline-variant/50">
          <p className="text-xs text-on-surface-variant font-medium mb-1 line-clamp-1 truncate">{t('admin.analytics.net_revenue', 'Doanh thu thuần (Net)')}</p>
          <p className="text-lg font-bold text-on-surface">{Math.round(totalRevenue / 1.08).toLocaleString()} ₫</p>
        </div>
        <div className="p-3 bg-error/5 rounded-xl border border-error/10">
          <p className="text-xs text-error/80 font-medium mb-1 line-clamp-1 truncate">{t('admin.analytics.estimated_vat', 'Thuế giá trị gia tăng (8%)')}</p>
          <p className="text-lg font-bold text-error">{Math.round(totalRevenue - (totalRevenue / 1.08)).toLocaleString()} ₫</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center min-h-[320px]">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col flex-1 items-center justify-center min-h-[320px] text-on-surface/40">
          <p>{t('admin.analytics.no_data')}</p>
        </div>
      ) : (
        <div className="h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="day"
                tickFormatter={(val) => format(new Date(val), 'dd/MM')}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(val) => `${(val / 1000).toLocaleString()}k`}
                width={60}
              />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`${value.toLocaleString()} ₫`, t('admin.analytics.revenue')]}
                labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ff6933"
                strokeWidth={3}
                dot={{ r: 4, fill: '#ff6933', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
