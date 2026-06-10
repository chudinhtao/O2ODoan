import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, subDays, startOfMonth } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import { Activity, DollarSign, TrendingUp, CalendarDays, AlertTriangle, PackageSearch, Boxes, Clock, Menu } from 'lucide-react'
import {
  useRevenueReport,
  useTopItemsReport,
  useSourceReport
} from '@/pages/admin/reports/hooks/useReports'
import { useInventoryDashboardSummary } from '@/pages/admin/inventory/hooks/useInventoryQueries'

import { RevenueChart } from '@/pages/admin/reports/components/RevenueChart'
import { SourcePieChart } from '@/pages/admin/reports/components/SourcePieChart'
import { TopItemsList } from '@/pages/admin/reports/components/TopItemsList'
import type { IRevenueReport } from '@/pages/admin/reports/types/report.type'

import { timeService } from '@/services/time.service'
import { useOrders } from '@/pages/admin/orders/hooks/useOrders'
import { ExportButton } from '@/shared/components/ExportButton'
import { Button } from '@/shared/components/ui/Button'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { t, i18n } = useTranslation()
  
  const serverNow = useMemo(() => new Date(timeService.getNow()), [])
  const [startDate, setStartDate] = useState(format(subDays(serverNow, 7), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(serverNow, 'yyyy-MM-dd'))

  const dateRange = useMemo(() => {
    return {
      from: startDate,
      to: endDate
    }
  }, [startDate, endDate])

  // Data fetching
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueReport(dateRange.from, dateRange.to)
  const { data: sourceData = [], isLoading: sourceLoading } = useSourceReport(dateRange.from, dateRange.to)
  const { data: topItemsPageData, isLoading: topLoading } = useTopItemsReport(dateRange.from, dateRange.to, 'QUANTITY', 0, 5)
  const topItems = topItemsPageData?.content ?? []
  const { data: invSummary, isLoading: invLoading } = useInventoryDashboardSummary(
    `${dateRange.from}T00:00:00`, 
    `${dateRange.to}T23:59:59`
  )

  // Fetch recent orders
  const { data: recentOrdersData, isLoading: recentOrdersLoading } = useOrders({
    page: 0,
    size: 5,
    sort: 'createdAt,desc'
  })
  const recentOrders = recentOrdersData?.content || []

  // KPI Calculations
  const { totalGrossRevenue, totalTax, totalNetRevenue } = useMemo(() => {
    return revenueData.reduce((acc: any, curr: IRevenueReport) => ({
      totalGrossRevenue: acc.totalGrossRevenue + curr.revenue,
      totalTax: acc.totalTax + (curr.taxAmount || 0),
      totalNetRevenue: acc.totalNetRevenue + (curr.netRevenue || 0)
    }), { totalGrossRevenue: 0, totalTax: 0, totalNetRevenue: 0 })
  }, [revenueData])

  const currentLocale = i18n.language === 'en' ? enUS : vi
  const todayStr = format(serverNow, 'EEEE, dd/MM/yyyy', { locale: currentLocale })
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

  return (
    <div className="flex flex-col h-full bg-slate-50/50 relative">
      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0 shadow-sm gap-2">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.dispatchEvent(new Event('toggle-mobile-nav'))}
            className="md:hidden p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu size={24} />
          </button>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800 leading-tight">
              {t('admin.dashboard.title')}
            </h2>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest hidden md:block">
              {t('admin.dashboard.todayOverview', { date: todayStr })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-4">
           {/* Shortcuts */}
           <div className="hidden lg:flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 h-10">
              <Button
                variant="ghost"
                size="sm"
                className="!px-3 !rounded-lg !text-[11px] !font-bold hover:!bg-white hover:shadow-sm"
                onClick={() => {
                  setStartDate(format(subDays(serverNow, 7), 'yyyy-MM-dd'))
                  setEndDate(format(serverNow, 'yyyy-MM-dd'))
                }}
              >
                {t('admin.dashboard.shortcut_7_days', '7 ngày')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="!px-3 !rounded-lg !text-[11px] !font-bold hover:!bg-white hover:shadow-sm"
                onClick={() => {
                  setStartDate(format(startOfMonth(serverNow), 'yyyy-MM-dd'))
                  setEndDate(format(serverNow, 'yyyy-MM-dd'))
                }}
              >
                {t('admin.dashboard.shortcut_this_month', 'Tháng này')}
              </Button>
           </div>

           {/* Custom Range Picker */}
           <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 h-10 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <CalendarDays className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-[11px] font-bold focus:ring-0 px-1 text-slate-700 cursor-pointer p-0 w-24"
              />
              <span className="text-slate-300 text-xs">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-[11px] font-bold focus:ring-0 px-1 text-slate-700 cursor-pointer p-0 w-24"
                min={startDate}
              />
           </div>

           <ExportButton
              data={revenueData}
              fileName={t('admin.dashboard.exportFileName', { start: startDate, end: endDate, defaultValue: `Bao_cao_tong_quan_${startDate}_${endDate}` })}
              sheetName="DoanhThu"
              headers={{
                'day': t('admin.dashboard.export.day', 'Ngày'),
                'revenue': t('admin.dashboard.export.revenue', 'Doanh thu (Gross)'),
                'taxAmount': t('admin.dashboard.export.taxAmount', 'Tiền thuế (VAT)'),
                'netRevenue': t('admin.dashboard.export.netRevenue', 'Doanh thu thuần'),
                'totalOrders': t('admin.dashboard.export.totalOrders', 'Số đơn hàng'),
                'avgOrderValue': t('admin.dashboard.export.avgOrderValue', 'Giá trị đơn trung bình')
              }}
           />
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
        <div className="w-full max-w-[2000px] mx-auto">
          
          {/* ── Row 0: Financial KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* Total Revenue (Gross) */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity transform group-hover:scale-110">
                <DollarSign className="w-24 h-24 text-primary" />
              </div>
              <div className="flex items-center gap-2 mb-2 z-10">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{t('admin.dashboard.totalRevenue', 'Tổng Doanh Thu')}</h3>
              </div>
              <div className="z-10">
                <p className="text-lg lg:text-xl font-black text-slate-800 tracking-tight leading-tight">{fmt(totalGrossRevenue)}<span className="text-xs font-bold text-slate-400 ml-0.5">đ</span></p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 italic">{t('admin.dashboard.taxIncluded', '(Đã bao gồm thuế)')}</p>
              </div>
            </div>

            {/* Total Tax (VAT) */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity transform group-hover:scale-110">
                <Activity className="w-24 h-24 text-amber-500" />
              </div>
              <div className="flex items-center gap-2 mb-2 z-10">
                <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{t('admin.dashboard.vat', 'Thuế GTGT (VAT)')}</h3>
              </div>
              <div className="z-10">
                <p className="text-lg lg:text-xl font-black text-amber-600 tracking-tight leading-tight">{fmt(totalTax)}<span className="text-xs font-bold text-slate-400 ml-0.5">đ</span></p>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5 italic">{t('admin.dashboard.estimatedTax', '(Ước tính)')}</p>
              </div>
            </div>

            {/* COGS */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity transform group-hover:scale-110">
                <Boxes className="w-24 h-24 text-blue-500" />
              </div>
              <div className="flex items-center gap-2 mb-2 z-10">
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  <Boxes className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{t('admin.dashboard.cogs', 'Giá Vốn (COGS)')}</h3>
              </div>
              <div className="z-10">
                <p className="text-lg lg:text-xl font-black text-slate-700 tracking-tight leading-tight">{invLoading ? '...' : fmt(Math.round(invSummary?.cogsThisMonth || 0))}<span className="text-xs font-bold text-slate-400 ml-0.5">đ</span></p>
              </div>
            </div>

            {/* Waste Value */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity transform group-hover:scale-110">
                <AlertTriangle className="w-24 h-24 text-rose-500" />
              </div>
              <div className="flex items-center gap-2 mb-2 z-10">
                <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{t('admin.dashboard.waste', 'Hao Hụt / Hủy')}</h3>
              </div>
              <div className="z-10">
                <p className="text-lg lg:text-xl font-black text-rose-600 tracking-tight leading-tight">{invLoading ? '...' : fmt(Math.round(invSummary?.wasteValueThisMonth || 0))}<span className="text-xs font-bold text-slate-400 ml-0.5">đ</span></p>
              </div>
            </div>

            {/* Net Profit (Gross Profit in Card) */}
            <div className="bg-white rounded-xl p-3.5 border-2 border-emerald-100 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-lg transition-shadow relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 p-4 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity transform group-hover:scale-110">
                <TrendingUp className="w-24 h-24 text-emerald-500" />
              </div>
              <div className="flex items-center gap-2 mb-2 z-10">
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider truncate">{t('admin.dashboard.netProfit', 'Lợi Nhuận Ròng')}</h3>
              </div>
              <div className="z-10">
                <p className="text-lg lg:text-xl font-black text-emerald-600 tracking-tight leading-tight">
                  {invLoading ? '...' : fmt(Math.round(totalNetRevenue - (invSummary?.cogsThisMonth || 0) - (invSummary?.wasteValueThisMonth || 0)))}
                  <span className="text-xs font-bold text-emerald-400 ml-0.5">đ</span>
                </p>
                <p className="text-[9px] font-bold text-emerald-700 mt-0.5 italic">{t('admin.dashboard.netProfitFormula', '(Thuần - Vốn - Hủy)')}</p>
              </div>
            </div>
          </div>

          {/* ── Row 0.5: Inventory Alerts ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Link to="/admin/inventory?tab=alerts" className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:border-rose-200 hover:bg-rose-50/30 transition-all group overflow-hidden relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('admin.dashboard.lowStock', 'Sắp hết hàng')}</p>
                  <p className="text-lg font-black text-slate-800">
                    {invLoading ? '...' : invSummary?.lowStockCount || 0}
                    <span className="text-xs font-bold text-slate-400 ml-1 italic lowercase">{t('admin.dashboard.itemsUnit', 'mặt hàng')}</span>
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/admin/inventory?tab=expiring" className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:border-amber-200 hover:bg-amber-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('admin.dashboard.expiring', 'Sắp hết hạn')}</p>
                  <p className="text-lg font-black text-slate-800">
                    {invLoading ? '...' : invSummary?.expiringItemsCount || 0}
                    <span className="text-xs font-bold text-slate-400 ml-1 italic lowercase">{t('admin.dashboard.batchesUnit', 'lô hàng')}</span>
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/admin/inventory?tab=po" className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
                  <PackageSearch className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('admin.dashboard.pendingPOs', 'Đơn nhập chờ')}</p>
                  <p className="text-lg font-black text-slate-800">
                    {invLoading ? '...' : invSummary?.pendingPurchaseOrders || 0}
                    <span className="text-xs font-bold text-slate-400 ml-1 italic lowercase">{t('admin.dashboard.poUnit', 'phiếu')}</span>
                  </p>
                </div>
              </div>
            </Link>

            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:border-primary/20 hover:bg-slate-50/50 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0 group-hover:scale-110 transition-transform">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{t('admin.dashboard.inventoryValue', 'Giá trị tồn kho')}</p>
                  <p className="text-lg font-black text-slate-800">
                    {invLoading ? '...' : fmt(Math.round(invSummary?.totalInventoryValue || 0))}
                    <span className="text-[10px] font-bold text-slate-400 ml-0.5 italic">đ</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* ── Row 1: Revenue Chart (Full Width) ── */}
          <div className="mb-6 w-full">
            <RevenueChart data={revenueData} isLoading={revenueLoading} totalRevenue={totalGrossRevenue} />
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
                            {order.tableNumber ? t('admin.dashboard.tableNum', { number: order.tableNumber, defaultValue: `Bàn ${order.tableNumber}` }) : t('admin.dashboard.takeaway', 'Mang đi')} • {fmt(order.total)}đ
                          </p>
                          <p className="text-xs font-semibold text-slate-400 mt-1 truncate">
                            {order.status === 'PAID' ? t('admin.dashboard.status.paid', 'Đã thanh toán') : 
                             order.status === 'CANCELLED' ? t('admin.dashboard.status.cancelled', 'Đã hủy') : 
                             order.status === 'PAYMENT_REQUESTED' ? t('admin.dashboard.status.requested', 'Yêu cầu thanh toán') : t('admin.dashboard.status.serving', 'Đang phục vụ')}
                            {' • '}
                            {format(new Date(order.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400">
                    {t('admin.dashboard.noOrders', 'Chưa có đơn hàng nào')}
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
