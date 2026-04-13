import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { Activity } from 'lucide-react'
import {
  useRevenueReport,
  useTopItemsReport,
  useSourceReport
} from '@/pages/admin/reports/hooks/useReports'

import { RevenueChart } from '@/pages/admin/reports/components/RevenueChart'
import { SourcePieChart } from '@/pages/admin/reports/components/SourcePieChart'
import { TopItemsList } from '@/pages/admin/reports/components/TopItemsList'
import type { IRevenueReport } from '@/pages/admin/reports/types/report.type'

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  const [dateRange] = useState({
    from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  })

  // Data fetching
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueReport(dateRange.from, dateRange.to)
  const { data: sourceData = [], isLoading: sourceLoading } = useSourceReport(dateRange.from, dateRange.to)
  const { data: topItems = [], isLoading: topLoading } = useTopItemsReport(dateRange.from, dateRange.to, 5)

  const totalRevenue = useMemo(() => revenueData.reduce((acc: number, curr: IRevenueReport) => acc + curr.revenue, 0), [revenueData])

  const currentLocale = i18n.language === 'en' ? enUS : vi
  const todayStr = format(new Date(), 'EEEE, dd/MM/yyyy', { locale: currentLocale })

  return (
    <div className="flex flex-col h-full bg-transparent p-3 sm:p-4 space-y-3 overflow-y-auto w-full">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-black font-display text-primary tracking-tight leading-none">{t('admin.dashboard.title')}</h1>
          <p className="text-[10px] font-bold text-on-primary/40 mt-0.5 capitalize letter-spacing-tight">
            {t('admin.dashboard.todayOverview', { date: todayStr })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} isLoading={revenueLoading} totalRevenue={totalRevenue} />
        </div>

        {/* Source Pie */}
        <div>
          <SourcePieChart data={sourceData} isLoading={sourceLoading} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:gap-8 items-stretch">
        {/* Top Items Table */}
        <div className="h-full">
          <TopItemsList data={topItems} isLoading={topLoading} isDashboard={true} />
        </div>

        {/* Recent Activities Placeholder */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col min-w-0 h-full">
          <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            {t('admin.dashboard.recentActivity')}
          </h3>

          <div className="flex-1 overflow-y-auto pr-2">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-on-surface font-medium">Hóa đơn #HD1803-012 • 245,000đ</p>
                  <p className="text-xs text-on-surface/50">Thanh toán: Tiền mặt</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-on-surface font-medium">Nhân viên Nam đã thêm món mới</p>
                  <p className="text-xs text-on-surface/50">Menu update</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-on-surface font-medium">Hóa đơn #HD1803-011 • 112,000đ</p>
                  <p className="text-xs text-on-surface/50">Thanh toán: Chuyển khoản</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
