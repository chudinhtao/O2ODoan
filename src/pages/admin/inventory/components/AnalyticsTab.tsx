import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Wallet, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { inventoryService } from '../services/inventory.service'
import SummaryCard from './analytics/SummaryCard'
import TrendChart from './analytics/TrendChart'
import DateRangeFilter, { FilterType } from './analytics/DateRangeFilter'
import { Skeleton } from '@/shared/components/ui/Skeleton'

interface AnalyticsTabProps {
  onNavigate?: (tab: string, params?: any) => void
}

export default function AnalyticsTab({ onNavigate }: AnalyticsTabProps) {
  const { t } = useTranslation()
  
  // State for date filtering
  const [filterType, setFilterType] = useState<FilterType>('month')
  const [customRange, setCustomRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  })

  // Calculate actual ISO strings for API
  const dateRange = useMemo(() => {
    const today = new Date()
    let from: Date, to: Date

    switch (filterType) {
      case 'last7':
        from = subDays(today, 7); to = today
        break
      case 'custom':
        from = new Date(customRange.from); to = new Date(customRange.to)
        break
      case 'month':
      default:
        from = startOfMonth(today); to = endOfMonth(today)
        break
    }
    
    // For API calls
    const apiFrom = format(from, 'yyyy-MM-dd')
    const apiTo = format(to, 'yyyy-MM-dd')

    return {
      from: apiFrom,
      to: apiTo,
      displayFrom: from,
      displayTo: to
    }
  }, [filterType, customRange])

  // Fetch Inventory Summary (Operational)
  const { data: summary, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', 'dashboard-summary', dateRange.from, dateRange.to],
    queryFn: () => inventoryService.getDashboardSummary(
      dateRange.from,
      dateRange.to
    ),
  })

  return (
    <div className="flex-1 overflow-y-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
      {/* Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-on-surface">{t('admin.inventory.analytics.title')}</h3>
            <p className="text-xs text-on-surface-variant">
              {format(dateRange.displayFrom, 'dd/MM/yyyy')} - {format(dateRange.displayTo, 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
        
        <DateRangeFilter 
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
        />
      </div>


      {/* Inventory Operations Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-on-surface-variant flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          {t('admin.inventory.analytics.operations', 'Vận hành tồn kho')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
          ) : summary && (
            <>
              <SummaryCard 
                title={t('admin.inventory.analytics.total_valuation')}
                value={summary.totalInventoryValue}
                icon={Wallet}
                isCurrency
                color="info"
                description={t('admin.inventory.analytics.current')}
              />
              <SummaryCard 
                title={t('admin.inventory.analytics.low_stock')}
                value={summary.lowStockCount}
                icon={ShieldAlert}
                color="error"
                description={t('admin.inventory.analytics.need_import')}
                onClick={() => onNavigate?.('low-stock')}
              />
              <SummaryCard 
                title={t('admin.inventory.analytics.expiring')}
                value={summary.expiringItemsCount}
                icon={AlertTriangle}
                color="warning"
                description={t('admin.inventory.analytics.in_7_days')}
                onClick={() => onNavigate?.('expiring')}
              />
            </>
          )}
        </div>
      </div>

      <TrendChart 
        startDate={dateRange.from} 
        endDate={dateRange.to} 
      />
    </div>
  )
}
