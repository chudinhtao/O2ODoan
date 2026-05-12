import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays, startOfMonth } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { Activity, DollarSign, Receipt, TrendingUp, CalendarDays } from 'lucide-react'
import {
  useRevenueReport,
  useTopItemsReport,
  useSourceReport
} from '@/pages/admin/reports/hooks/useReports'

import { RevenueChart } from '@/pages/admin/reports/components/RevenueChart'
import { SourcePieChart } from '@/pages/admin/reports/components/SourcePieChart'
import { TopItemsList } from '@/pages/admin/reports/components/TopItemsList'
import type { IRevenueReport } from '@/pages/admin/reports/types/report.type'

import { timeService } from '@/services/time.service'
import { useOrders } from '@/pages/admin/orders/hooks/useOrders'

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  
  const [timeRange, setTimeRange] = useState<'TODAY' | 'LAST_7' | 'LAST_30' | 'THIS_MONTH'>('LAST_7')

  const serverNow = useMemo(() => new Date(timeService.getNow()), [])
  
  const dateRange = useMemo(() => {
    let fromDate = serverNow
    if (timeRange === 'LAST_7') fromDate = subDays(serverNow, 7)
    else if (timeRange === 'LAST_30') fromDate = subDays(serverNow, 30)
    else if (timeRange === 'THIS_MONTH') fromDate = startOfMonth(serverNow)

    return {
      from: format(fromDate, 'yyyy-MM-dd'),
      to: format(serverNow, 'yyyy-MM-dd')
    }
  }, [timeRange, serverNow])

  // Data fetching
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueReport(dateRange.from, dateRange.to)
  const { data: sourceData = [], isLoading: sourceLoading } = useSourceReport(dateRange.from, dateRange.to)
  const { data: topItems = [], isLoading: topLoading } = useTopItemsReport(dateRange.from, dateRange.to, 5)

  // Fetch recent orders
  const { data: recentOrdersData, isLoading: recentOrdersLoading } = useOrders({
    page: 0,
    size: 5,
    sort: 'createdAt,desc'
  })
  const recentOrders = recentOrdersData?.content || []

  // KPI Calculations
  const totalRevenue = useMemo(() => revenueData.reduce((acc: number, curr: IRevenueReport) => acc + curr.revenue, 0), [revenueData])
  const totalOrders = useMemo(() => revenueData.reduce((acc: number, curr: IRevenueReport) => acc + curr.totalOrders, 0), [revenueData])
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const avgDailyRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : totalRevenue

  const currentLocale = i18n.language === 'en' ? enUS : vi
  const todayStr = format(serverNow, 'EEEE, dd/MM/yyyy', { locale: currentLocale })
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

  return (
    <div className="flex flex-col h-full bg-slate-50/50 relative">
      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-800 leading-tight">
            {t('admin.dashboard.title')}
          </h2>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest hidden md:block">
            {t('admin.dashboard.todayOverview', { date: todayStr })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex items-center gap-2 text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
             <CalendarDays className="w-4 h-4" />
             <span className="text-xs font-bold">Lọc theo:</span>
           </div>
           <select
             value={timeRange}
             onChange={(e) => setTimeRange(e.target.value as any)}
             className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm hover:border-primary/50"
           >
             <option value="TODAY">Hôm nay</option>
             <option value="LAST_7">7 ngày qua</option>
             <option value="LAST_30">30 ngày qua</option>
             <option value="THIS_MONTH">Tháng này</option>
           </select>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
        <div className="w-full max-w-[2000px] mx-auto">
          
          {/* ── Row 0: KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity transform group-hover:scale-110">
                <DollarSign className="w-32 h-32 text-primary" />
              </div>
              <div className="flex items-center gap-2 mb-3 z-10">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Tổng Doanh Thu</h3>
              </div>
              <div className="z-10">
                <p className="text-2xl lg:text-3xl font-black text-slate-800">{fmt(totalRevenue)}<span className="text-base font-bold text-slate-400 ml-1">đ</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity transform group-hover:scale-110">
                <Receipt className="w-32 h-32 text-blue-500" />
              </div>
              <div className="flex items-center gap-2 mb-3 z-10">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Tổng Đơn Hàng</h3>
              </div>
              <div className="z-10">
                <p className="text-2xl lg:text-3xl font-black text-slate-800">{fmt(totalOrders)}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity transform group-hover:scale-110">
                <Activity className="w-32 h-32 text-emerald-500" />
              </div>
              <div className="flex items-center gap-2 mb-3 z-10">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">Giá Trị TB/Đơn</h3>
              </div>
              <div className="z-10">
                <p className="text-2xl lg:text-3xl font-black text-slate-800">{fmt(Math.round(avgOrderValue))}<span className="text-base font-bold text-slate-400 ml-1">đ</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity transform group-hover:scale-110">
                <TrendingUp className="w-32 h-32 text-amber-500" />
              </div>
              <div className="flex items-center gap-2 mb-3 z-10">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">TB Doanh Thu/Ngày</h3>
              </div>
              <div className="z-10">
                <p className="text-2xl lg:text-3xl font-black text-slate-800">{fmt(Math.round(avgDailyRevenue))}<span className="text-base font-bold text-slate-400 ml-1">đ</span></p>
              </div>
            </div>
          </div>
          
          {/* ── Row 1: Revenue Chart (Full Width) ── */}
          <div className="mb-6 w-full">
            <RevenueChart data={revenueData} isLoading={revenueLoading} totalRevenue={totalRevenue} />
          </div>

          {/* ── Row 2: Analytics & Lists (1/3, 1/3, 1/3) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            <div className="h-full w-full">
              <SourcePieChart data={sourceData} isLoading={sourceLoading} />
            </div>

            {/* Top Items Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[400px]">
              <TopItemsList data={topItems} isLoading={topLoading} isDashboard={true} />
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full min-h-[400px]">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 pb-3 border-b border-slate-100 shrink-0">
                <Activity size={18} className="text-primary" />
                {t('admin.dashboard.recentOrders', 'Đơn hàng mới nhất')}
              </h3>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {recentOrdersLoading ? (
                  <div className="flex flex-col gap-4">
                    <div className="h-12 bg-slate-100 rounded-lg animate-pulse w-full" />
                    <div className="h-12 bg-slate-100 rounded-lg animate-pulse w-full" />
                    <div className="h-12 bg-slate-100 rounded-lg animate-pulse w-full" />
                  </div>
                ) : recentOrders.length > 0 ? (
                  <ul className="space-y-6 mt-2">
                    {recentOrders.map((order) => (
                      <li key={order.id} className="flex items-start gap-4">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 shadow-sm ring-4 ${
                          order.status === 'PAID' ? 'bg-emerald-500 ring-emerald-50' :
                          order.status === 'CANCELLED' ? 'bg-rose-500 ring-rose-50' :
                          'bg-blue-500 ring-blue-50'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-700 truncate">
                            {order.tableNumber ? `Bàn ${order.tableNumber}` : 'Mang đi'} • {fmt(order.total)}đ
                          </p>
                          <p className="text-xs font-semibold text-slate-400 mt-1 truncate">
                            {order.status === 'PAID' ? 'Đã thanh toán' : 
                             order.status === 'CANCELLED' ? 'Đã hủy' : 
                             order.status === 'PAYMENT_REQUESTED' ? 'Yêu cầu thanh toán' : 'Đang phục vụ'}
                            {' • '}
                            {format(new Date(order.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400">
                    Chưa có đơn hàng nào
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
