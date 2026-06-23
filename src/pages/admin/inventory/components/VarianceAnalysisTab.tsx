import { useState } from 'react'
import { RefreshCw, CalendarRange, Percent, Calculator, Download, TrendingDown, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { useInventoryVarianceReport } from '@/pages/admin/reports/hooks/useReports'
import { reportService } from '@/pages/admin/reports/services/reportService'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { IInventoryVarianceReport } from '@/pages/admin/reports/types/report.type'
import { useFormatUom } from '../hooks/useInventoryQueries'

function getDefaultDateRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = now
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  }
}

export default function VarianceAnalysisTab() {
  const { t } = useTranslation()
  const defaultRange = getDefaultDateRange()
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  const [queryDates, setQueryDates] = useState({ startDate: defaultRange.startDate, endDate: defaultRange.endDate })
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const { formatQty } = useFormatUom()

  const { data: reportPage, isLoading, isFetching } = useInventoryVarianceReport(queryDates.startDate, queryDates.endDate, 0, 1000)

  const handleSearch = () => {
    if (!startDate || !endDate) return
    setQueryDates({ startDate, endDate })
    setPage(0)
  }

  const [isExporting, setIsExporting] = useState(false)
  const handleExport = async () => {
    try {
      setIsExporting(true)
      const blob = await reportService.exportInventoryVariance(queryDates.startDate, queryDates.endDate)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `TvA_Report_${queryDates.startDate}_to_${queryDates.endDate}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed', error)
    } finally {
      setIsExporting(false)
    }
  }

  const report = reportPage?.content ?? []
  const reportList = [...report].sort((a, b) => b.varianceValue - a.varianceValue)
  const filteredList = reportList.filter(item => {
    if (!keyword) return true
    const k = keyword.toLowerCase()
    return item.ingredientName.toLowerCase().includes(k)
  })

  const paginatedList = filteredList.slice(page * pageSize, (page + 1) * pageSize)

  const totalLoss = report.reduce((acc, curr) => acc + (curr.varianceValue > 0 ? curr.varianceValue : 0), 0)

  const columns: ColumnDef<IInventoryVarianceReport>[] = [
    {
      header: t('admin.inventory.report.col_material'),
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
            {item.ingredientName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-700 leading-tight">{item.ingredientName}</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-tighter">ID: {item.ingredientId.slice(0, 8)}</span>
          </div>
        </div>
      )
    },
    {
      header: t('admin.inventory.report.col_theoretical'),
      align: 'right',
      className: 'hidden sm:table-cell',
      cell: (item) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-slate-500">{formatQty(item.ingredientId, item.theoreticalUsage, item.uomName || '')}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.report.col_actual'),
      align: 'right',
      className: 'hidden sm:table-cell',
      cell: (item) => (
        <div className="flex flex-col items-end">
          <span className="font-black text-slate-800">{formatQty(item.ingredientId, item.actualUsage, item.uomName || '')}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.report.col_variance'),
      align: 'right',
      cell: (item) => {
        const hasVariance = Math.abs(item.variance) > 0.001
        const variancePercent = item.theoreticalUsage > 0 ? (item.variance / item.theoreticalUsage) * 100 : 0
        const isLoss = item.variance > 0.001
        const isGain = item.variance < -0.001

        return (
          <div className="flex flex-col items-end gap-1">
            <span className={`font-black tabular-nums ${isLoss ? 'text-red-600' : isGain ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isLoss ? '+' : ''}{formatQty(item.ingredientId, item.variance, item.uomName || '')}
            </span>
            {hasVariance && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${isLoss ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                {isLoss ? '▲' : '▼'} {Math.abs(variancePercent).toFixed(1)}%
              </span>
            )}
          </div>
        )
      }
    },
    {
      header: t('admin.inventory.report.col_loss_value'),
      align: 'right',
      cell: (item) => {
        const isLoss = item.varianceValue > 0.001
        const isGain = item.varianceValue < -0.001
        return (
          <div className="flex flex-col items-end">
            <span className={`font-black tabular-nums ${isLoss ? 'text-red-600' : isGain ? 'text-emerald-600' : 'text-slate-400'}`}>
              {isLoss ? '+' : ''}{formatCurrency(Math.abs(item.varianceValue))}
            </span>
            {isLoss && <span className="text-[8px] text-red-400 font-bold uppercase tracking-tighter leading-none mt-1">{t('admin.inventory.report.financial_loss', 'Hao hụt tài chính')}</span>}
          </div>
        )
      }
    }
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{t('admin.inventory.report.tva_title')}</h3>
            <p className="text-xs text-slate-500">{t('admin.inventory.report.tva_subtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 rounded-xl px-2 sm:px-3 py-1.5 border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white">
            <CalendarRange className="hidden sm:block w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[84px] sm:w-28 h-7 border-none bg-transparent p-0 text-[10px] sm:text-xs font-bold focus:ring-0 outline-none"
            />
            <span className="text-slate-300 text-[10px] sm:text-xs">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[84px] sm:w-28 h-7 border-none bg-transparent p-0 text-[10px] sm:text-xs font-bold focus:ring-0 outline-none"
            />
          </div>

          <Button onClick={handleSearch} disabled={isFetching} size="sm" className="!rounded-lg">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''} sm:mr-1.5`} />
            <span className="hidden sm:inline">{t('admin.inventory.report.calculate_btn')}</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting || !reportPage} className="!rounded-lg">
            <Download className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">{t('admin.inventory.report.export_btn')}</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 shrink-0">
        <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between group transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50 text-red-600 group-hover:scale-105 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400">{t('admin.inventory.report.loss_valuation')}</h3>
              <div className="text-base font-extrabold text-red-600 leading-tight">
                {formatCurrency(totalLoss)}
              </div>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-red-600/70 bg-red-50 px-2 py-0.5 rounded-full shrink-0">
            {t('admin.inventory.variance.lossBadge', 'Thất thoát')}
          </span>
        </div>

        <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between group transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400">{t('admin.inventory.report.variance_count')}</h3>
              <div className="text-base font-extrabold text-slate-800 leading-tight">
                {report.filter(i => Math.abs(i.variance) > 0.001).length || 0}
              </div>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full shrink-0">
            {t('admin.inventory.variance.materialsCount', '{{count}} nguyên liệu', { count: report.length || 0 })}
          </span>
        </div>

        <div className="bg-primary/5 px-4 py-3 rounded-xl border border-primary/10 flex items-center gap-3 group transition-all duration-300 hover:bg-primary/[0.07]">
          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:rotate-12 transition-transform shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <p className="text-[11px] text-slate-600 font-medium leading-normal animate-in fade-in" dangerouslySetInnerHTML={{ __html: t('admin.inventory.report.smart_insight') }} />
        </div>
      </div>

      {/* Scrollable table */}
      <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
        <DataTable<IInventoryVarianceReport>
          columns={columns}
          data={paginatedList.map(item => ({ ...item, id: item.ingredientId }))}
          isLoading={isLoading}
          searchPlaceholder={t('common.search')}
          searchValue={keyword}
          onSearchChange={(val) => { setKeyword(val); setPage(0) }}
          pagination={{
            currentPage: page,
            totalPages: Math.ceil(filteredList.length / pageSize),
            onPageChange: setPage,
            pageSize: pageSize,
            totalElements: filteredList.length,
            onPageSizeChange: (size) => {
              setPageSize(size)
              setPage(0)
            }
          }}
          emptyState={
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Calculator className="w-12 h-12 mb-3 opacity-20 mx-auto text-primary" />
              <p className="text-lg font-bold">{t('admin.inventory.report.empty_data')}</p>
            </div>
          }
        />
      </div>
    </div>
  )
}
