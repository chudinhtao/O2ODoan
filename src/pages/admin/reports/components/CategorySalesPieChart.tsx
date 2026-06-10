import { useTranslation } from 'react-i18next'
import { PieChart as PieChartIcon } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
        <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[250px]">
          <ResponsiveContainer width="100%" height={250}>
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
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="totalRevenue"
                nameKey="categoryName"
              >
                {data.map((_entry: ICategorySales, index: number) => (
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
