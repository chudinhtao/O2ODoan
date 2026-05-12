import { useState, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from 'date-fns'
import { Wallet, ShoppingBag, Receipt, TrendingUp, BarChart2, ChefHat, LineChart } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
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
import type { IRevenueReport } from '../types/report.type'

// Tab ids for the report sections
const REPORT_TABS = [
  { id: 'overview', getLabel: (t: any) => t('admin.analytics.tabs.overview', 'Tổng quan'), icon: BarChart2 },
  { id: 'operations', getLabel: (t: any) => t('admin.analytics.tabs.operations', 'Vận hành'), icon: ChefHat },
  { id: 'menu', getLabel: (t: any) => t('admin.analytics.tabs.menu_promo', 'Menu & KM'), icon: LineChart },
] as const

type TabId = (typeof REPORT_TABS)[number]['id']

export default function ReportsManagementPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [filterType, setFilterType] = useState<'last7' | 'last30' | 'week' | 'month' | 'year' | 'custom'>('last7')
  const [customRange, setCustomRange] = useState({
    from: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  })
  const [topItemSortBy, setTopItemSortBy] = useState<'QUANTITY' | 'REVENUE'>('QUANTITY')

  const [dateRange, prevDateRange] = useMemo(() => {
    const today = new Date()
    let from: Date, to: Date, prevFrom: Date, prevTo: Date

    switch (filterType) {
      case 'custom':
        from = new Date(customRange.from); to = new Date(customRange.to)
        const diff = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
        prevFrom = subDays(from, diff); prevTo = subDays(to, diff)
        break
      case 'last7':
        from = subDays(today, 7); to = today
        prevFrom = subDays(from, 7); prevTo = subDays(to, 7)
        break
      case 'last30':
        from = subDays(today, 30); to = today
        prevFrom = subDays(from, 30); prevTo = subDays(to, 30)
        break
      case 'week':
        from = startOfWeek(today); to = endOfWeek(today)
        prevFrom = subDays(from, 7); prevTo = subDays(to, 7)
        break
      case 'year':
        from = startOfYear(today); to = endOfYear(today)
        prevFrom = subDays(from, 365); prevTo = subDays(to, 365)
        break
      case 'month':
      default:
        from = startOfMonth(today); to = endOfMonth(today)
        prevFrom = startOfMonth(subDays(from, 1)); prevTo = endOfMonth(subDays(from, 1))
        break
    }
    return [
      { from: format(from, 'yyyy-MM-dd'), to: format(to, 'yyyy-MM-dd') },
      { from: format(prevFrom, 'yyyy-MM-dd'), to: format(prevTo, 'yyyy-MM-dd') }
    ]
  }, [filterType, customRange])

  // Data fetching — common
  const { data: revenueData = [], isLoading: revenueLoading } = useRevenueReport(dateRange.from, dateRange.to)
  const { data: prevRevenueData = [], isLoading: prevRevenueLoading } = useRevenueReport(prevDateRange.from, prevDateRange.to)

  // Data fetching — Overview tab
  const { data: sourceData = [], isLoading: sourceLoading } = useSourceReport(dateRange.from, dateRange.to)
  const { data: hourlyData = [], isLoading: hourlyLoading } = useHourlyTraffic(dateRange.from, dateRange.to)
  const { data: tableData = [], isLoading: tableLoading } = useTableUsageReport(dateRange.from, dateRange.to)

  // Data fetching — Operations tab
  const { data: staffCallData = [], isLoading: staffCallLoading } = useStaffCallStats(dateRange.from, dateRange.to)
  const { data: kitchenData = [], isLoading: kitchenLoading } = useKitchenPerformance(dateRange.from, dateRange.to)
  const { data: cancelledData = [], isLoading: cancelledLoading } = useCancelledDrilldown(dateRange.from, dateRange.to)

  // Data fetching — Menu & KM tab
  const { data: topItems = [], isLoading: topLoading } = useTopItemsReport(dateRange.from, dateRange.to, 10, topItemSortBy)
  const { data: promotionData = [], isLoading: promotionLoading } = usePromotionEffectiveness(dateRange.from, dateRange.to)

  // Calculations
  const totalRevenue = useMemo(() => revenueData.reduce((acc: number, curr: IRevenueReport) => acc + curr.revenue, 0), [revenueData])
  const prevTotalRevenue = useMemo(() => prevRevenueData.reduce((acc: number, curr: IRevenueReport) => acc + curr.revenue, 0), [prevRevenueData])
  const totalOrders = useMemo(() => revenueData.reduce((acc: number, curr: IRevenueReport) => acc + curr.totalOrders, 0), [revenueData])
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const growth = prevTotalRevenue === 0 ? (totalRevenue > 0 ? 100 : 0) : ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
  const growthStr = `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-4 lg:p-6 space-y-6 overflow-y-auto w-full custom-scrollbar">
      <div className="w-full max-w-[2000px] mx-auto space-y-6">
        {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black font-display text-primary">{t('admin.reports')}</h1>
          <p className="text-xs text-on-primary/60 mt-1">
            <Trans i18nKey="admin.analytics.data_from_to" values={{ from: dateRange.from, to: dateRange.to }}>
              Dữ liệu từ {{from: dateRange.from}} đến {{to: dateRange.to}}
            </Trans>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-slate-200">
            <Button
               variant={filterType === 'last7' ? 'primary' : 'ghost'}
               size="sm"
               className="!px-3"
               onClick={() => setFilterType('last7')}
            >
              {t('admin.analytics.last_7_days', '7 ngày qua')}
            </Button>
            <Button
               variant={filterType === 'month' ? 'primary' : 'ghost'}
               size="sm"
               className="!px-3"
               onClick={() => setFilterType('month')}
            >
              {t('admin.analytics.this_month')}
            </Button>
            <Button
               variant={filterType === 'custom' ? 'primary' : 'ghost'}
               size="sm"
               className="!px-3"
               onClick={() => setFilterType('custom')}
            >
              {t('admin.analytics.custom_range', 'Tùy chọn')}
            </Button>
          </div>

          {filterType === 'custom' && (
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-right-2 duration-300">
              <input
                type="date"
                value={customRange.from}
                onChange={(e) => setCustomRange(prev => ({ ...prev, from: e.target.value }))}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 px-2"
              />
              <span className="text-slate-300">→</span>
              <input
                type="date"
                value={customRange.to}
                onChange={(e) => setCustomRange(prev => ({ ...prev, to: e.target.value }))}
                className="bg-transparent border-none text-sm font-medium focus:ring-0 px-2"
              />
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
        <StatCard
          title={t('admin.dashboard.revenue')}
          value={`${totalRevenue.toLocaleString()} ₫`}
          icon={Wallet}
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
          title={t('admin.analytics.revenue_trend', 'Tăng trưởng')}
          value={growthStr}
          trend={growthStr}
          icon={TrendingUp}
          isLoading={revenueLoading || prevRevenueLoading}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
        {REPORT_TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={15} />
              {tab.getLabel(t)}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-0 pb-8">
        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6 xl:gap-8">
            {/* Row 1: Full width revenue */}
            <div className="w-full">
              <RevenueChart data={revenueData} isLoading={revenueLoading} totalRevenue={totalRevenue} />
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-stretch">
            <div className="w-full h-[420px]">
              <KitchenPerformanceCard data={kitchenData} isLoading={kitchenLoading} />
            </div>
            <div className="w-full h-[420px]">
              <StaffCallStatsList data={staffCallData} isLoading={staffCallLoading} />
            </div>
            <div className="w-full h-[420px]">
              <CancelledOrderDrilldownCard data={cancelledData} isLoading={cancelledLoading} />
            </div>
          </div>
        )}

        {/* === MENU & KM TAB === */}
        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 items-stretch">
            <div className="w-full h-[420px]">
              <TopItemsList
                data={topItems}
                isLoading={topLoading}
                sortBy={topItemSortBy}
                onChangeSortBy={setTopItemSortBy}
              />
            </div>
            <div className="w-full h-[420px]">
              <PromotionEffectivenessList data={promotionData} isLoading={promotionLoading} />
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
