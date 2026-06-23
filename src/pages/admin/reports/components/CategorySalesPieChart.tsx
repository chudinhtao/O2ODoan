import { useTranslation } from 'react-i18next'
import { PieChart as PieChartIcon } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { ICategorySales } from '../types/report.type'

const COLORS = ['#ff6933', '#4ade80', '#60a5fa', '#f472b6', '#a78bfa', '#facc15', '#2dd4bf', '#fb923c']

interface Props {
  data: ICategorySales[]
  isLoading: boolean
}

export function CategorySalesPieChart({ data, isLoading }: Props) {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col min-w-0 h-full">
      <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2 shrink-0">
        <PieChartIcon size={20} className="text-primary" />
        {t('admin.analytics.category_sales', 'Doanh thu theo danh mục')}
      </h3>

      {isLoading ? (
        <div className="flex flex-1 justify-center items-center min-h-[250px]">
          <Skeleton className="w-[200px] h-[200px] rounded-full" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col flex-1 items-center justify-center min-h-[250px] text-on-surface/40">
          <p>{t('admin.analytics.no_data', 'Chưa có dữ liệu')}</p>
        </div>
      ) : (
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="h-[200px] w-full shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as ICategorySales
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-md border border-slate-200">
                          <p className="font-semibold text-slate-800 mb-2">{data.categoryName}</p>
                          <p className="text-primary font-bold">
                            {t('admin.analytics.revenue', 'Doanh thu')}: {data.totalRevenue.toLocaleString()} ₫
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {t('admin.analytics.item_quantity', 'Số lượng món')}: <span className="font-medium text-slate-800">{data.totalQuantitySold}</span>
                          </p>
                          <p className="text-sm text-slate-600">
                            {t('admin.analytics.percentage', 'Tỷ trọng')}: <span className="font-medium text-slate-800">{data.revenuePercentage ? data.revenuePercentage.toFixed(1) : 0}%</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Pie
                  data={data}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="totalRevenue"
                  nameKey="categoryName"
                >
                  {data.map((_entry: ICategorySales, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Responsive Legend */}
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 justify-center max-h-[140px] overflow-y-auto custom-scrollbar px-2">
            {data.map((entry: ICategorySales, index: number) => (
              <div key={entry.categoryName} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate max-w-[120px]" title={entry.categoryName}>{entry.categoryName}</span>
                <span className="text-[10px] text-slate-400 font-bold">({entry.revenuePercentage ? entry.revenuePercentage.toFixed(0) : 0}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
