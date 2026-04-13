import { useTranslation } from 'react-i18next'
import { TrendingUp } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { IHourlyTraffic } from '../types/report.type'

interface Props {
  data: IHourlyTraffic[]
  isLoading: boolean
}

export function HourlyTrafficChart({ data, isLoading }: Props) {
  const { t } = useTranslation()

  return (
    <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mt-2 flex flex-col min-w-0">
      <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
        <TrendingUp size={20} className="text-primary"/> 
        {t('admin.analytics.hourly_traffic')}
      </h3>
      {isLoading ? (
        <Skeleton className="w-full h-64 rounded-xl" />
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-on-surface/40">
          <p>{t('admin.analytics.no_data')}</p>
        </div>
      ) : (
        <div className="h-64 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="hourOfDay" 
                tickFormatter={(val) => `${val}:00`}
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#6b7280', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#6b7280', fontSize: 12}}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any, name: any) => [value, name === 'orderCount' ? t('admin.analytics.order_count') : t('admin.analytics.revenue')]}
                labelFormatter={(label) => `${label}:00`}
                cursor={{fill: '#f4f4f5'}}
              />
              <Bar dataKey="orderCount" fill="#ff6933" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
