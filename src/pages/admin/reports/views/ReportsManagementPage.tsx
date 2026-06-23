import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { format, startOfMonth, subDays } from 'date-fns'
import { Wallet, ShoppingBag, Receipt, TrendingUp, BarChart2, ChefHat, LineChart, Users, CalendarDays, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader'
import { ExportButton } from '@/shared/components/ExportButton'
import {
  useRevenueReport,
  useSourceReport,
  useHourlyTraffic,
  useTopItemsReport,
  useTableUsageReport,
  usePromotionEffectiveness,
  useStaffCallStats,
  useKitchenPerformance,
  useCancelledDrilldown,
  useCategorySales,
  useStaffTimesheet,
  useChefPerformance,
  useServerPerformance,
  useReservationReport
} from '../hooks/useReports'
import { RevenueChart } from '../components/RevenueChart'
import { SourcePieChart } from '../components/SourcePieChart'
import { HourlyTrafficChart } from '../components/HourlyTrafficChart'
import { StatCard } from '../components/StatCard'
import { TopItemsList } from '../components/TopItemsList'
import { TableUsageList } from '../components/TableUsageList'
import { PromotionEffectivenessList } from '../components/PromotionEffectivenessList'
import { StaffCallStatsList } from '../components/StaffCallStatsList'
import { KitchenPerformanceCard } from '../components/KitchenPerformanceCard'
import { CancelledOrderDrilldownCard } from '../components/CancelledOrderDrilldownCard'
import { CategorySalesPieChart } from '../components/CategorySalesPieChart'
import { StaffTimesheetList } from '../components/StaffTimesheetList'
import { ChefPerformanceList } from '../components/ChefPerformanceList'
import { ServerPerformanceList } from '../components/ServerPerformanceList'
import { ReservationReportCard } from '../components/ReservationReportCard'
import { ReservationTrendChart } from '../components/ReservationTrendChart'
import VarianceReportTab from '../../inventory/components/VarianceReportTab'
import VarianceAnalysisTab from '../../inventory/components/VarianceAnalysisTab'
import type { IRevenueReport } from '../types/report.type'
import type { IPageResponse } from '@/shared/types/IApiResponse'

// Compact pagination for report cards
function MiniPagination({ pageData, page, setPage }: {
  pageData?: IPageResponse<any>
  page: number
  setPage: (p: number) => void
}) {
  if (!pageData || pageData.totalPages <= 1 || pageData.totalElements <= pageData.size) return null
  return (
    <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
      <span className="text-[11px] font-semibold text-slate-400">
        {page * pageData.size + 1}–{Math.min((page + 1) * pageData.size, pageData.totalElements)} / {pageData.totalElements}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="p-1 rounded-md hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-bold text-slate-500 min-w-[3rem] text-center">
          {page + 1} / {pageData.totalPages}
        </span>
        <button
          disabled={pageData.last}
          onClick={() => setPage(page + 1)}
          className="p-1 rounded-md hover:bg-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Tab ids for the report sections
const REPORT_TABS = [
  { id: 'overview', getLabel: (t: any) => t('admin.analytics.tabs.overview', 'Tổng quan'), icon: BarChart2 },
  { id: 'operations', getLabel: (t: any) => t('admin.analytics.tabs.operations', 'Vận hành'), icon: ChefHat },
  { id: 'menu', getLabel: (t: any) => t('admin.analytics.tabs.menu_promo', 'Menu & KM'), icon: LineChart },
  { id: 'inventory', getLabel: (t: any) => t('admin.analytics.tabs.inventory', 'Kho hàng'), icon: Package },
  { id: 'reservations', getLabel: (t: any) => t('admin.analytics.tabs.reservations', 'Đặt bàn'), icon: CalendarDays },
  { id: 'staff', getLabel: (t: any) => t('admin.analytics.tabs.staff', 'Nhân sự'), icon: Users },
] as const

type TabId = (typeof REPORT_TABS)[number]['id']

export default function ReportsManagementPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [topItemSortBy, setTopItemSortBy] = useState<'QUANTITY' | 'REVENUE'>('QUANTITY')

  // Pagination state per section
  const PAGE_SIZE = 10
  const [staffCallPage, setStaffCallPage] = useState(0)
  const [kitchenPage, setKitchenPage] = useState(0)
  const [cancelledPage, setCancelledPage] = useState(0)
  const [topItemsPage, setTopItemsPage] = useState(0)
  const [promotionPage, setPromotionPage] = useState(0)
  const [staffTimesheetPage, setStaffTimesheetPage] = useState(0)
  const [chefPage, setChefPage] = useState(0)
  const [serverPage, setServerPage] = useState(0)

  const [dateRange, prevDateRange] = useMemo(() => {
    const from = new Date(startDate)
    const to = new Date(endDate)
    const diff = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const prevFrom = subDays(from, diff)
    const prevTo = subDays(to, diff)

    return [
      { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') },
      { from: format(prevFrom, 'yyyy-MM-dd'), to: format(prevTo, 'yyyy-MM-dd') }
    ]
  }, [startDate, endDate])

  // Data fetching — common
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueReport(dateRange.from, dateRange.to)
  const { data: prevRevenueData = [], isLoading: prevRevenueLoading } = useRevenueReport(prevDateRange.from, prevDateRange.to)

  // Data fetching — Overview tab
  const { data: sourceData = [], isLoading: sourceLoading } = useSourceReport(dateRange.from, dateRange.to)
  const { data: hourlyData = [], isLoading: hourlyLoading } = useHourlyTraffic(dateRange.from, dateRange.to)
  const { data: tableData = [], isLoading: tableLoading } = useTableUsageReport(dateRange.from, dateRange.to)

  // Data fetching — Operations tab (paginated)
  const { data: staffCallPageData, isLoading: staffCallLoading } = useStaffCallStats(dateRange.from, dateRange.to, staffCallPage, PAGE_SIZE)
  const { data: kitchenPageData, isLoading: kitchenLoading } = useKitchenPerformance(dateRange.from, dateRange.to, kitchenPage, PAGE_SIZE)
  const { data: cancelledPageData, isLoading: cancelledLoading } = useCancelledDrilldown(dateRange.from, dateRange.to, cancelledPage, PAGE_SIZE)

  // Data fetching — Menu & KM tab (paginated)
  const { data: topItemsPageData, isLoading: topLoading } = useTopItemsReport(dateRange.from, dateRange.to, topItemSortBy, topItemsPage, PAGE_SIZE)
  const { data: promotionPageData, isLoading: promotionLoading } = usePromotionEffectiveness(dateRange.from, dateRange.to, promotionPage, PAGE_SIZE)
  const { data: categorySalesPageData, isLoading: categorySalesLoading } = useCategorySales(dateRange.from, dateRange.to, 0, PAGE_SIZE)

  // Data fetching — Staff tab (paginated)
  const { data: staffTimesheetPageData, isLoading: staffTimesheetLoading } = useStaffTimesheet(dateRange.from, dateRange.to, staffTimesheetPage, PAGE_SIZE)
  const { data: chefPageData, isLoading: chefPerformanceLoading } = useChefPerformance(dateRange.from, dateRange.to, chefPage, PAGE_SIZE)
  const { data: serverPageData, isLoading: serverPerformanceLoading } = useServerPerformance(dateRange.from, dateRange.to, serverPage, PAGE_SIZE)

  // Extract .content arrays for components
  const staffCallData = staffCallPageData?.content ?? []
  const kitchenData = kitchenPageData?.content ?? []
  const cancelledData = cancelledPageData?.content ?? []
  const topItems = topItemsPageData?.content ?? []
  const promotionData = promotionPageData?.content ?? []
  const categorySales = categorySalesPageData?.content ?? []
  const staffTimesheet = staffTimesheetPageData?.content ?? []
  const chefPerformance = chefPageData?.content ?? []
  const serverPerformance = serverPageData?.content ?? []

  // Data fetching — Reservations tab
  const { data: reservationReport, isLoading: reservationReportLoading } = useReservationReport(dateRange.from, dateRange.to)

  // Calculations
  const { totalGrossRevenue, totalTax, totalNetRevenue } = useMemo(() => {
    return revenueData.reduce((acc: any, curr: IRevenueReport) => ({
      totalGrossRevenue: acc.totalGrossRevenue + curr.revenue,
      totalTax: acc.totalTax + (curr.taxAmount || 0),
      totalNetRevenue: acc.totalNetRevenue + (curr.netRevenue || 0)
    }), { totalGrossRevenue: 0, totalTax: 0, totalNetRevenue: 0 })
  }, [revenueData])

  const prevTotalRevenue = useMemo(() => prevRevenueData.reduce((acc: number, curr: IRevenueReport) => acc + curr.revenue, 0), [prevRevenueData])
  const totalOrders = useMemo(() => revenueData.reduce((acc: number, curr: IRevenueReport) => acc + curr.totalOrders, 0), [revenueData])
  const aov = totalOrders > 0 ? totalGrossRevenue / totalOrders : 0

  const growth = prevTotalRevenue === 0
    ? null  // Không đủ data kỳ trước → không tính được tăng trưởng
    : ((totalGrossRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
  const growthStr = growth === null
    ? 'N/A'
    : `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
      <AdminPageHeader
        title={t('admin.reports')}
        description={t('admin.analytics.data_from_to', { from: dateRange.from, to: dateRange.to })}
        actions={
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Shortcuts */}
            <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 h-9">
              <Button
                variant="ghost"
                size="sm"
                className="!px-3 !rounded-lg !text-[11px] !font-bold hover:!bg-slate-50"
                onClick={() => {
                  setStartDate(format(subDays(new Date(), 7), 'yyyy-MM-dd'))
                  setEndDate(format(new Date(), 'yyyy-MM-dd'))
                }}
              >
                {t('admin.dashboard.shortcut_7_days', '7 ngày')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="!px-3 !rounded-lg !text-[11px] !font-bold hover:!bg-slate-50"
                onClick={() => {
                  setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
                  setEndDate(format(new Date(), 'yyyy-MM-dd'))
                }}
              >
                {t('admin.dashboard.shortcut_this_month', 'Tháng này')}
              </Button>
            </div>

            {/* Custom Range Picker */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 h-9 min-w-0">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-none text-[10px] sm:text-[11px] font-bold focus:ring-0 px-1 text-slate-700 cursor-pointer p-0 w-[84px] sm:w-auto shrink-0 text-center"
              />
              <span className="text-slate-300 text-xs shrink-0">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-none text-[10px] sm:text-[11px] font-bold focus:ring-0 px-1 text-slate-700 cursor-pointer p-0 w-[84px] sm:w-auto shrink-0 text-center"
                min={startDate}
              />
            </div>

            <ExportButton
              data={
                activeTab === 'overview' ? revenueData.map(r => ({
                  date: r.day,
                  orders: r.totalOrders,
                  gross: r.revenue,
                  tax: r.taxAmount || 0,
                  net: r.netRevenue || 0
                })) :
                  activeTab === 'operations' ? staffCallData.map(s => ({
                    tableNumber: s.tableNumber,
                    callType: s.callType,
                    callCount: s.callCount,
                    avgResolveMinutes: s.avgResolveMinutes || 0
                  })) :
                    activeTab === 'menu' ? topItems.map(item => ({
                      name: item.itemName,
                      quantity: item.totalSold,
                      revenue: item.revenue
                    })) :
                      activeTab === 'reservations' && reservationReport ? [{
                        totalReservations: reservationReport.totalReservations,
                        totalCompleted: reservationReport.totalCompleted,
                        totalCancelled: reservationReport.totalCancelled,
                        totalDeposits: reservationReport.totalDeposits,
                        refunded: reservationReport.refunded,
                      }] :
                        staffTimesheet.map(s => ({
                          staff: s.staffName,
                          role: s.role,
                          shifts: s.totalShifts,
                          hours: s.totalWorkingHours,
                          revenue: s.role === 'CASHIER' ? s.totalRevenue : '',
                          itemsPrepared: s.role === 'KITCHEN' ? s.itemsPrepared : '',
                          callsResolved: s.role === 'SERVER' ? s.callsResolved : ''
                        }))
              }
              fileName={t('admin.analytics.exportFileName', { tab: activeTab, date: new Date().toISOString().split('T')[0], defaultValue: `Bao_cao_${activeTab}_${startDate}_den_${endDate}` })}
              sheetName="BaoCao"
              headers={
                activeTab === 'overview' ? {
                  'date': t('admin.analytics.colDate', 'Ngày'),
                  'orders': t('admin.analytics.colOrders', 'Số đơn hàng'),
                  'gross': t('admin.analytics.colGross', 'Doanh thu (Gross)'),
                  'tax': t('admin.analytics.colTax', 'Thuế (VAT)'),
                  'net': t('admin.analytics.colNet', 'Doanh thu thuần')
                } :
                  activeTab === 'operations' ? {
                    'tableNumber': t('admin.analytics.colTableNumber', 'Số bàn'),
                    'callType': t('admin.analytics.colCallType', 'Loại yêu cầu'),
                    'callCount': t('admin.analytics.colCallCount', 'Số lần gọi'),
                    'avgResolveMinutes': t('admin.analytics.colAvgResolve', 'Thời gian xử lý trung bình (phút)')
                  } :
                    activeTab === 'menu' ? {
                      'name': t('admin.analytics.colItemName', 'Món ăn'),
                      'quantity': t('admin.analytics.colQty', 'Số lượng bán'),
                      'revenue': t('admin.analytics.colRevenue', 'Doanh thu')
                    } : activeTab === 'reservations' ? {
                      'totalReservations': t('admin.analytics.colTotalRes', 'Tổng số đặt bàn'),
                      'totalCompleted': t('admin.analytics.colCompletedRes', 'Đã hoàn thành'),
                      'totalCancelled': t('admin.analytics.colCancelledRes', 'Đã huỷ'),
                      'totalDeposits': t('admin.analytics.colDeposits', 'Tổng tiền cọc'),
                      'refunded': t('admin.analytics.colRefunded', 'Đã hoàn tiền')
                    } : {
                      'staff': t('admin.analytics.colStaffName', 'Nhân viên'),
                      'role': t('admin.analytics.colRole', 'Vai trò'),
                      'shifts': t('admin.analytics.colShifts', 'Số ca làm'),
                      'hours': t('admin.analytics.colHours', 'Số giờ công'),
                      'revenue': t('admin.analytics.colRevenue', 'Doanh thu (Thu ngân)'),
                      'itemsPrepared': t('admin.analytics.colItemsPrepared', 'Món đã nấu (Bếp)'),
                      'callsResolved': t('admin.analytics.colCallsResolved', 'Yêu cầu đã xử lý (Phục vụ)')
                    }
              }
            />
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
        <div className="w-full max-w-[2000px] mx-auto space-y-6">

          {/* Summary Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 xl:gap-6">
            <StatCard
              title={t('admin.dashboard.revenue_gross', 'Doanh thu (Gross)')}
              value={`${totalGrossRevenue.toLocaleString()} ₫`}
              icon={Wallet}
              isLoading={revenueLoading}
            />
            <StatCard
              title={t('admin.dashboard.tax_vat', 'Tiền thuế (VAT)')}
              value={`${totalTax.toLocaleString()} ₫`}
              icon={Receipt}
              color="amber"
              isLoading={revenueLoading}
            />
            <StatCard
              title={t('admin.dashboard.net_revenue', 'Doanh thu thuần')}
              value={`${totalNetRevenue.toLocaleString()} ₫`}
              icon={TrendingUp}
              color="emerald"
              isLoading={revenueLoading}
            />
            <StatCard
              title={t('admin.dashboard.total_orders')}
              value={totalOrders}
              icon={ShoppingBag}
              isLoading={revenueLoading}
            />
            <StatCard
              title={t('admin.dashboard.aov')}
              value={`${aov.toLocaleString(undefined, { maximumFractionDigits: 0 })} ₫`}
              icon={Receipt}
              isLoading={revenueLoading}
            />
            <StatCard
              title={t('admin.analytics.growth', 'Tăng trưởng')}
              value={growthStr}
              trend={growthStr}
              icon={TrendingUp}
              isLoading={revenueLoading || prevRevenueLoading}
            />
          </div>

          {/* Tab Navigation */}
          <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 shrink-0">
            <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-max min-w-full sm:min-w-0">
              {REPORT_TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span>{tab.getLabel(t)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-0 pb-8">
            {/* === OVERVIEW TAB === */}
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6 xl:gap-8">
                {/* Row 1: Full width revenue */}
                <div className="w-full">
                  <RevenueChart data={revenueData} isLoading={revenueLoading} totalRevenue={totalGrossRevenue} />
                </div>

                {/* Row 2: Pie chart (1/3) & Hourly Traffic (2/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-stretch">
                  <div className="lg:col-span-1 h-full w-full">
                    <SourcePieChart data={sourceData} isLoading={sourceLoading} />
                  </div>
                  <div className="lg:col-span-2 h-full w-full">
                    <HourlyTrafficChart data={hourlyData} isLoading={hourlyLoading} />
                  </div>
                </div>

                {/* Row 3: Table Usage */}
                <div className="w-full">
                  <TableUsageList data={tableData} isLoading={tableLoading} />
                </div>
              </div>
            )}

            {/* === OPERATIONS TAB === */}
            {activeTab === 'operations' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
                <div className="w-full flex flex-col rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                  <div className="h-[460px]">
                    <KitchenPerformanceCard data={kitchenData} isLoading={kitchenLoading} />
                  </div>
                  <MiniPagination pageData={kitchenPageData} page={kitchenPage} setPage={setKitchenPage} />
                </div>
                <div className="w-full flex flex-col rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                  <div className="h-[460px]">
                    <StaffCallStatsList data={staffCallData} isLoading={staffCallLoading} />
                  </div>
                  <MiniPagination pageData={staffCallPageData} page={staffCallPage} setPage={setStaffCallPage} />
                </div>
                <div className="w-full flex flex-col rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                  <div className="h-[460px]">
                    <CancelledOrderDrilldownCard data={cancelledData} isLoading={cancelledLoading} />
                  </div>
                  <MiniPagination pageData={cancelledPageData} page={cancelledPage} setPage={setCancelledPage} />
                </div>
              </div>
            )}

            {/* === MENU & KM TAB === */}
            {activeTab === 'menu' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-stretch">
                {/* CategorySales - 1/3 */}
                <div className="lg:col-span-1 h-full">
                  <CategorySalesPieChart data={categorySales} isLoading={categorySalesLoading} />
                </div>
                {/* TopItems + Promotion - 2/3 */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
                  <div className="flex flex-col rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white h-full">
                    <div className="h-[460px]">
                      <TopItemsList
                        data={topItems}
                        isLoading={topLoading}
                        sortBy={topItemSortBy}
                        onChangeSortBy={setTopItemSortBy}
                      />
                    </div>
                    <MiniPagination pageData={topItemsPageData} page={topItemsPage} setPage={setTopItemsPage} />
                  </div>
                  <div className="flex flex-col rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white h-full">
                    <div className="h-[460px]">
                      <PromotionEffectivenessList data={promotionData} isLoading={promotionLoading} />
                    </div>
                    <MiniPagination pageData={promotionPageData} page={promotionPage} setPage={setPromotionPage} />
                  </div>
                </div>
              </div>
            )}

            {/* === RESERVATIONS TAB === */}
            {activeTab === 'reservations' && (
              <div className="flex flex-col gap-6 xl:gap-8 w-full h-auto">
                <ReservationReportCard data={reservationReport} isLoading={reservationReportLoading} />
                <ReservationTrendChart data={reservationReport?.dailyTrend} isLoading={reservationReportLoading} />
              </div>
            )}

            {/* === INVENTORY TAB === */}
            {activeTab === 'inventory' && (
              <div className="flex flex-col gap-6 xl:gap-8 w-full">
                <div className="w-full flex flex-col rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white h-[700px]">
                  <VarianceAnalysisTab />
                </div>
                <div className="w-full flex flex-col rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white h-[700px]">
                  <VarianceReportTab />
                </div>
              </div>
            )}

            {/* === STAFF TAB === */}
            {activeTab === 'staff' && (
              <div className="flex flex-col gap-6 xl:gap-8">
                <div className="w-full">
                  <div className="h-[400px]">
                    <StaffTimesheetList data={staffTimesheet} isLoading={staffTimesheetLoading} />
                  </div>
                  <MiniPagination pageData={staffTimesheetPageData} page={staffTimesheetPage} setPage={setStaffTimesheetPage} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8 items-stretch">
                  <div className="w-full">
                    <div className="h-[400px]">
                      <ChefPerformanceList data={chefPerformance} isLoading={chefPerformanceLoading} />
                    </div>
                    <MiniPagination pageData={chefPageData} page={chefPage} setPage={setChefPage} />
                  </div>
                  <div className="w-full">
                    <div className="h-[400px]">
                      <ServerPerformanceList data={serverPerformance} isLoading={serverPerformanceLoading} />
                    </div>
                    <MiniPagination pageData={serverPageData} page={serverPage} setPage={setServerPage} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
