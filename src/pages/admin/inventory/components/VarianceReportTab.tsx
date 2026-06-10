import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingDown, RefreshCw, CalendarRange, Package, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/shared/components/ui/Button'
import { inventoryService } from '../services/inventory.service'
import { IVarianceReportResponse } from '../types/inventory.type'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import CategoryAsyncSelect from '@/shared/components/inventory/CategoryAsyncSelect'
import { ExportButton } from '@/shared/components/ExportButton'

function getDefaultDateRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = now
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  }
}

export default function VarianceReportTab() {
  const { t } = useTranslation()
  const defaultRange = getDefaultDateRange()
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  const [queryDates, setQueryDates] = useState({ startDate: defaultRange.startDate, endDate: defaultRange.endDate })
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin', 'inventory', 'reports', 'variance', queryDates],
    queryFn: () => inventoryService.getVarianceReport(
      queryDates.startDate + 'T00:00:00',
      queryDates.endDate + 'T23:59:59'
    ),
    enabled: !!queryDates.startDate && !!queryDates.endDate,
  })

  const report: IVarianceReportResponse | null = data || null
  const itemsList = report?.items || []
  
  const filteredItems = itemsList.filter(item => {
    if (categoryId && item.categoryId !== categoryId) return false
    if (!keyword) return true
    const k = keyword.toLowerCase()
    return (
      item.itemName.toLowerCase().includes(k) || 
      item.itemSku.toLowerCase().includes(k)
    )
  })

  const paginatedData = filteredItems.slice(page * pageSize, (page + 1) * pageSize)

  const handleSearch = () => {
    if (!startDate || !endDate) return
    setQueryDates({ startDate, endDate })
    setPage(0)
  }

  const columns: ColumnDef<any>[] = [
    {
      header: t('admin.inventory.variance.colItem', 'Nguyên liệu'),
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
            {item.itemName.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-700 leading-tight">{item.itemName}</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-tighter">SKU: {item.itemSku}</span>
          </div>
        </div>
      )
    },
    {
      header: t('admin.inventory.variance.colWaste', 'SL Hủy'),
      align: 'right',
      cell: (item) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-orange-600 tabular-nums">{item.wasteQuantity.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 uppercase font-bold">{item.uomName}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.variance.colAdjustment', 'SL Điều chỉnh'),
      align: 'right',
      cell: (item) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-blue-600 tabular-nums">{item.adjustmentQuantity.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 uppercase font-bold">{item.uomName}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.variance.colTotal', 'Tổng lệch'),
      align: 'right',
      cell: (item) => (
        <div className="flex flex-col items-end">
          <span className="font-black text-slate-800 tabular-nums">{item.totalVarianceQuantity.toLocaleString()}</span>
          <span className="text-[9px] text-slate-400 uppercase font-bold">{item.uomName}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.variance.colLoss', 'Thiệt hại ước tính'),
      align: 'right',
      cell: (item) => (
        <div className="flex flex-col items-end">
          <span className="font-black text-red-600 tabular-nums">
            {formatCurrency(item.estimatedLossValue || 0)}
          </span>
          {item.estimatedLossValue > 0 && <span className="text-[8px] text-red-400 font-bold uppercase tracking-tighter leading-none mt-1 italic">{t('admin.inventory.variance.operationalLoss', 'Tổn thất vận hành')}</span>}
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{t('admin.inventory.variance.title', 'Báo cáo Sai lệch & Hao hụt')}</h3>
            <p className="text-xs text-slate-500">{t('admin.inventory.variance.desc', 'Tổng hợp các giao dịch xuất hủy và điều chỉnh theo kỳ.')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100 transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white">
            <CalendarRange className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-28 h-7 border-none bg-transparent p-0 text-xs font-bold focus:ring-0 outline-none"
            />
            <span className="text-slate-300">—</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-28 h-7 border-none bg-transparent p-0 text-xs font-bold focus:ring-0 outline-none"
            />
          </div>
          
          <Button onClick={handleSearch} disabled={isFetching} size="sm" className="!rounded-lg">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
            {t('common.refresh', 'Làm mới')}
          </Button>

          <ExportButton
            data={filteredItems.map(item => ({
              ...item,
              estimatedLoss: item.estimatedLossValue || 0,
              statusLabel: item.estimatedLossValue > 0 
                ? t('admin.inventory.variance.operationalLoss', 'Tổn thất vận hành') 
                : t('admin.inventory.variance.normal', 'Không hao hụt')
            }))}
            fileName={t('admin.inventory.variance.exportFileName', { start: queryDates.startDate, end: queryDates.endDate, defaultValue: `Bao_cao_hao_hut_${queryDates.startDate}_den_${queryDates.endDate}` })}
            sheetName="HaoHut"
            headers={{
              'itemName': t('admin.inventory.variance.colItem', 'Tên nguyên liệu'),
              'itemSku': t('admin.inventory.item.colSku', 'Mã SKU'),
              'wasteQuantity': t('admin.inventory.variance.colWaste', 'SL Hủy'),
              'adjustmentQuantity': t('admin.inventory.variance.colAdjustment', 'SL Điều chỉnh'),
              'totalVarianceQuantity': t('admin.inventory.variance.colTotal', 'Tổng lệch'),
              'uomName': t('admin.inventory.item.colUom', 'Đơn vị'),
              'estimatedLoss': t('admin.inventory.variance.colLoss', 'Thiệt hại ước tính (VNĐ)'),
              'statusLabel': t('admin.inventory.variance.colStatus', 'Đánh giá')
            }}
          />
        </div>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between group transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-50 text-slate-600 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-400">{t('admin.inventory.variance.totalVariedItems', 'Tổng mặt hàng bị lệch')}</h3>
                <div className="text-base font-extrabold text-slate-800 leading-tight">{report.items.length}</div>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full shrink-0">
              {t('admin.inventory.variance.materialsCount', '{{count}} nguyên liệu', { count: report.items.length })}
            </span>
          </div>

          <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-between group transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-50 text-red-600 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-400">{t('admin.inventory.variance.totalEstimatedLoss', 'Tổng hao hụt ước tính')}</h3>
                <div className="text-base font-extrabold text-red-600 leading-tight">{formatCurrency(report.totalEstimatedLossValue || 0)}</div>
              </div>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-red-600/70 bg-red-50 px-2 py-0.5 rounded-full shrink-0">
              {t('admin.inventory.variance.lossBadge', 'Thiệt hại')}
            </span>
          </div>

          <div className="bg-white px-4 py-3 rounded-xl border border-slate-100 flex items-center justify-center border-dashed group transition-all duration-300 hover:bg-slate-50/50">
            <div className="text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">{t('admin.inventory.variance.reportPeriod', 'Kỳ báo cáo hiện tại')}</span>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-bold text-slate-700">
                  {new Date(report.startDate).toLocaleDateString('vi-VN')}
                </span>
                <span className="text-slate-300 text-[10px]">—</span>
                <span className="text-xs font-bold text-slate-700">
                  {new Date(report.endDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={paginatedData.map(item => ({ ...item, id: item.itemId }))}
        isLoading={isLoading}
        searchPlaceholder={t('common.search')}
        searchValue={keyword}
        onSearchChange={(val) => { setKeyword(val); setPage(0) }}
        filters={
          <div className="w-48">
            <CategoryAsyncSelect
              value={categoryId}
              onChange={setCategoryId}
              label=""
              placeholder={t('admin.inventory.variance.allCategories', 'Tất cả nhóm')}
              className="!h-9 !py-0 !text-xs !bg-slate-50 border-none focus:!bg-white focus:!ring-1 focus:!ring-primary/30"
            />
          </div>
        }
        pagination={{
          currentPage: page,
          totalPages: Math.ceil(filteredItems.length / pageSize),
          onPageChange: setPage,
          pageSize: pageSize,
          totalElements: filteredItems.length,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setPage(0)
          }
        }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <TrendingDown className="w-12 h-12 mb-3 opacity-20 text-blue-500" />
            <p className="text-lg font-bold">{t('admin.inventory.variance.emptyTitle', 'Không có dữ liệu hao hụt trong kỳ này.')}</p>
          </div>
        }
      />
    </div>
  )
}
