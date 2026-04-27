import { useTranslation } from 'react-i18next'
import { PieChart as PieChartIcon } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ISourceReport } from '../types/report.type'

const COLORS = ['#ff6933', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa']

interface Props {
  data: ISourceReport[]
  isLoading: boolean
}

export function SourcePieChart({ data, isLoading }: Props) {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col min-w-0">
      <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
        <PieChartIcon size={20} className="text-primary" />
        {t('admin.analytics.source_distribution')}
      </h3>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center min-h-[320px]">
          <Skeleton className="w-[200px] h-[200px] rounded-full" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col flex-1 items-center justify-center min-h-[320px] text-on-surface/40">
          <p>{t('admin.analytics.no_data')}</p>
        </div>
      ) : (
        <div className="h-80 min-w-0 flex flex-col justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ISourceReport;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200">
                        <p className="font-semibold text-slate-800 mb-2">{data.source}</p>
                        <p className="text-primary font-bold">
                          Doanh thu: {data.revenue.toLocaleString()} ₫
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          Số đơn: <span className="font-medium text-slate-800">{data.totalOrders}</span>
                        </p>
                        <p className="text-sm text-slate-600">
                          Tỷ trọng: <span className="font-medium text-slate-800">{data.percentage ? data.percentage.toFixed(1) : 0}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="revenue"
                nameKey="source"
              >
                {data.map((_entry: ISourceReport, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
