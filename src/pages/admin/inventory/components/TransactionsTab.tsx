import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, ArrowDownRight, Plus, Trash2, Activity } from 'lucide-react'
import { inventoryService } from '../services/inventory.service'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { useInventoryItems } from '../hooks/useInventoryQueries'
import { useStaff } from '../../staff/hooks/useStaff'
import { IStaffProfile } from '../../staff/types/staff.type'
import QuickGrnModal from './QuickGrnModal'
import WasteModal from './WasteModal'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { ExportButton } from '@/shared/components/ExportButton'

export default function TransactionsTab({ navParams }: { navParams?: any }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [pageSize] = useState(20)
  const [isQuickGrnOpen, setIsQuickGrnOpen] = useState(false)
  const [isWasteOpen, setIsWasteOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState('')
  const [itemFilter, setItemFilter] = useState(() => navParams?.itemId || '')
  const [itemSearch, setItemSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (navParams?.itemId) {
      setItemFilter(navParams.itemId)
      setPage(0)
    }
  }, [navParams])

  const { staff } = useStaff()
  const getUserName = (id?: string | null) => {
    if (!id) return '—';
    const user = staff?.find((s: IStaffProfile) => s.id === id);
    return user ? user.fullName : id;
  }

  const { data: itemsData, isLoading: isLoadingItems } = useInventoryItems({ 
    keyword: itemSearch || undefined, 
    size: 20 
  })
  const allItems = itemsData?.content ?? []

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', 'transactions', { page, pageSize, typeFilter, itemFilter, startDate, endDate }],
    queryFn: () => inventoryService.getTransactions({
      page,
      size: pageSize,
      type: typeFilter || undefined,
      itemId: itemFilter || undefined,
      startDate: startDate ? `${startDate}T00:00:00` : undefined,
      endDate: endDate ? `${endDate}T23:59:59` : undefined,
    }),
  })

  const transactions = data?.content || []
  const totalPages = data?.totalPages || 0

  const TX_TYPE_OPTIONS = useMemo(() => [
    { value: '', label: t('admin.inventory.transactions.filterAllTypes') },
    { value: 'IN_PO', label: t('admin.inventory.transactions.type.IN_PO') },
    { value: 'IN_QUICK', label: t('admin.inventory.transactions.type.IN_QUICK') },
    { value: 'OUT_SALE', label: t('admin.inventory.transactions.type.OUT_SALE') },
    { value: 'OUT_WASTE', label: t('admin.inventory.transactions.type.OUT_WASTE') },
    { value: 'ADJUSTMENT', label: t('admin.inventory.transactions.type.ADJUSTMENT') },
    { value: 'MANUAL_BLOCK', label: t('admin.inventory.transactions.type.MANUAL_BLOCK') },
    { value: 'REFUND', label: t('admin.inventory.transactions.type.REFUND') },
    { value: 'IN_TRANSFER', label: t('admin.inventory.transactions.type.IN_TRANSFER') },
    { value: 'OUT_TRANSFER', label: t('admin.inventory.transactions.type.OUT_TRANSFER') },
  ], [t])

  const columns: ColumnDef<any>[] = [
    {
      header: t('admin.inventory.transactions.colItem'),
      cell: (tx) => {
        const isPositive = tx.quantityChange > 0
        return (
          <div className="flex items-center gap-2">
            <div className={`shrink-0 p-1.5 rounded-lg ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 truncate max-w-[200px]" title={tx.itemName}>{tx.itemName || 'N/A'}</span>
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{tx.itemSku || 'NO-SKU'}</span>
            </div>
          </div>
        )
      }
    },
    {
      header: t('admin.inventory.transactions.colType'),
      cell: (tx) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant="neutral" className="text-[10px] font-bold uppercase">
            {t(`admin.inventory.transactions.type.${tx.transactionType}`)}
          </Badge>
          {tx.locationName && (
            <span className="text-[10px] text-slate-500 font-medium line-clamp-1" title={tx.locationName}>
              📍 {tx.locationName}
            </span>
          )}
        </div>
      )
    },
    {
      header: t('admin.inventory.transactions.colQty'),
      align: 'right',
      cell: (tx) => {
        const isPositive = tx.quantityChange > 0
        return (
          <div className="flex flex-col items-end">
            <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{tx.quantityChange.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-medium">{tx.baseUomName || ''}</span>
          </div>
        )
      }
    },
    {
      header: t('admin.inventory.transactions.colPrice'),
      align: 'right',
      cell: (tx) => (
        <span className="text-slate-500 font-medium">
          {tx.unitPriceAtTransaction > 0 ? formatCurrency(tx.unitPriceAtTransaction) : '—'}
        </span>
      )
    },
    {
      header: t('admin.inventory.transactions.colTotal'),
      align: 'right',
      cell: (tx) => {
        const totalValue = Math.abs(tx.quantityChange * (tx.unitPriceAtTransaction || 0))
        return (
          <span className="font-bold text-primary tabular-nums">
            {totalValue > 0 ? formatCurrency(totalValue) : '—'}
          </span>
        )
      }
    },
    {
      header: t('admin.inventory.transactions.colTime'),
      cell: (tx) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</span>
          <span className="text-[10px] text-slate-400 font-medium">
            {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )
    },
    {
      header: t('admin.inventory.transactions.colReason'),
      cell: (tx) => (
        <div className="flex flex-col">
          <span className="text-slate-600 text-xs truncate max-w-[150px]" title={tx.reason}>{tx.reason || '—'}</span>
          {tx.createdBy && <span className="text-[10px] text-slate-400 font-medium italic mt-0.5">Bởi: {getUserName(tx.createdBy)}</span>}
        </div>
      )
    }
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {t('admin.inventory.transactions.title')}
        </h2>
        <div className="flex items-center gap-2">
          <ExportButton
            data={transactions.map((tx: any) => ({
              ...tx,
              createdAt: new Date(tx.createdAt).toLocaleString('vi-VN'),
              transactionType: t(`admin.inventory.transactions.type.${tx.transactionType}`),
              unitPrice: tx.unitPriceAtTransaction || 0,
              totalValueChange: Math.abs(tx.quantityChange * (tx.unitPriceAtTransaction || 0)),
              createdBy: getUserName(tx.createdBy),
              locationName: tx.locationName || 'N/A'
            }))}
            fileName={t('admin.inventory.transactions.exportFileName', 'Lich_su_giao_dich_kho')}
            sheetName="GiaoDich"
            headers={{
              'createdAt': t('admin.inventory.transactions.colTime', 'Thời gian'),
              'itemName': t('admin.inventory.transactions.colItem', 'Nguyên liệu'),
              'itemSku': t('admin.inventory.item.colSku', 'Mã SKU'),
              'transactionType': t('admin.inventory.transactions.colType', 'Loại giao dịch'),
              'quantityChange': t('admin.inventory.transactions.colQty', 'Thay đổi'),
              'baseUomName': t('admin.inventory.item.colUom', 'Đơn vị'),
              'unitPrice': t('admin.inventory.transactions.colPrice', 'Đơn giá vốn'),
              'totalValueChange': t('admin.inventory.transactions.colTotal', 'Tổng giá trị giao dịch'),
              'reason': t('admin.inventory.transactions.colReason', 'Lý do'),
              'locationName': t('admin.inventory.transactions.colLocation', 'Kho lưu trữ'),
              'createdBy': t('admin.inventory.transactions.colOperator', 'Người thực hiện')
            }}
          />
          <Button size="sm" onClick={() => setIsQuickGrnOpen(true)} className="!rounded-lg">
            <Plus className="w-4 h-4 mr-1.5" />
            {t('admin.inventory.quickGrn.title')}
          </Button>
          <Button size="sm" onClick={() => setIsWasteOpen(true)} variant="danger" className="!rounded-lg">
            <Trash2 className="w-4 h-4 mr-1.5" />
            {t('admin.inventory.waste.title')}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        searchPlaceholder={t('common.search')}
        filters={
          <div className="flex items-center gap-2">
            <div className="w-48">
              <AsyncSelect
                value={typeFilter}
                onChange={val => { setTypeFilter(val as string); setPage(0) }}
                onSearch={() => {}}
                options={TX_TYPE_OPTIONS}
                placeholder={t('admin.inventory.transactions.filterAllTypes')}
                className="!h-9 !py-0 !text-xs !bg-slate-50 border-none focus:!bg-white focus:!ring-1 focus:!ring-primary/30"
              />
            </div>
            <div className="w-64">
              <AsyncSelect
                value={itemFilter}
                onChange={val => { setItemFilter(val as string); setPage(0) }}
                onSearch={setItemSearch}
                isLoading={isLoadingItems}
                options={allItems.map(i => ({ 
                  value: i.id, 
                  label: `${i.name} (${i.sku || 'N/A'})` 
                }))}
                placeholder={t('admin.inventory.transactions.filterAllMaterials')}
                className="!h-9 !py-0 !text-xs !bg-slate-50 border-none focus:!bg-white focus:!ring-1 focus:!ring-primary/30"
              />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="date"
                className="h-9 px-2 bg-slate-50 border-none rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30 shadow-sm"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                title="Từ ngày"
              />
              <span className="text-slate-400 text-xs font-bold">→</span>
              <input 
                type="date"
                className="h-9 px-2 bg-slate-50 border-none rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30 shadow-sm"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                title="Đến ngày"
                min={startDate}
              />
            </div>
          </div>
        }
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
          pageSize: pageSize,
          totalElements: data?.totalElements || 0,
        }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Activity className="w-16 h-16 mb-4 opacity-10" />
            <p className="text-lg font-semibold">{t('admin.inventory.transactions.empty')}</p>
          </div>
        }
      />

      <QuickGrnModal isOpen={isQuickGrnOpen} onClose={() => setIsQuickGrnOpen(false)} />
      <WasteModal isOpen={isWasteOpen} onClose={() => setIsWasteOpen(false)} />
    </div>
  )
}
