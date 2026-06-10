import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { inventoryService } from '../../services/inventory.service'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { format } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'

interface TrendChartProps {
  startDate?: string
  endDate?: string
}

export default function TrendChart({ startDate, endDate }: TrendChartProps) {
  const { t, i18n } = useTranslation()
  const currentLocale = i18n.language === 'vi' ? vi : enUS

  const { data: trendData = [], isLoading } = useQuery({
    queryKey: ['admin', 'inventory', 'trend', startDate, endDate],
    queryFn: () => inventoryService.getTrendData(startDate, endDate),
  })

  if (isLoading) {
    return <Skeleton className="w-full h-[400px] rounded-3xl" />
  }

  const chartData = trendData.map(item => ({
    ...item,
    formattedDate: format(new Date(item.date), 'dd/MM', { locale: currentLocale })
  }))

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.08)]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-on-surface">{t('admin.inventory.analytics.trend_title')}</h3>
        <p className="text-sm text-on-surface-variant">{t('admin.inventory.analytics.trend_subtitle')}</p>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCogs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066cc" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#0066cc" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: any) => [formatCurrency(Number(value)), '']}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
            <Area 
              type="monotone" 
              dataKey="cogs" 
              name={t('admin.inventory.analytics.chart_cogs')} 
              stroke="#0066cc" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCogs)" 
            />
            <Area 
              type="monotone" 
              dataKey="waste" 
              name={t('admin.inventory.analytics.chart_waste')} 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorWaste)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
