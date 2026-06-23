import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, CalendarClock, History, X, Package, Truck, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { getSuccessMessage } from '@/shared/utils/apiResponse'
import { inventoryService } from '../services/inventory.service'
import { IExpiringStock } from '../types/inventory.type'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/shared/components/ui/Badge'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import CategoryAsyncSelect from '@/shared/components/inventory/CategoryAsyncSelect'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'
import { useLocations, useFormatUom } from '../hooks/useInventoryQueries'
import { ExportButton } from '@/shared/components/ExportButton'
import { format } from 'date-fns'
import { Button } from '@/shared/components/ui/Button'
import { formatCurrency } from '@/shared/utils/formatCurrency'

export default function ExpiringStockTab({ onNavigate: _onNavigate }: { onNavigate?: (tab: string, params?: any) => void }) {
  const { t } = useTranslation()
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30) // Default: expiring in next 30 days
    return d.toISOString().split('T')[0]
  })
  const [keyword, setKeyword] = useState('')

  const daysFilter = Math.max(1, Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
  const [categoryId, setCategoryId] = useState<string>('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [wasteTarget, setWasteTarget] = useState<IExpiringStock | null>(null)
  const [selectedLotForDetails, setSelectedLotForDetails] = useState<IExpiringStock | null>(null)
  const queryClient = useQueryClient()
  const { formatQty } = useFormatUom()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', 'reports', 'expiring', daysFilter],
    queryFn: () => inventoryService.getExpiringStock(daysFilter, { unpaged: true })
  })

  const expiringList = data?.content || []
  
  const filteredList = expiringList.filter(i => {
    if (categoryId && i.categoryId !== categoryId) return false
    if (!keyword) return true
    const k = keyword.toLowerCase()
    return (
      i.itemName.toLowerCase().includes(k) || 
      i.itemSku.toLowerCase().includes(k) ||
      i.lotNumber?.toLowerCase().includes(k)
    )
  })

  const paginatedData = filteredList.slice(page * pageSize, (page + 1) * pageSize)

  const wasteMutation = useMutation({
    mutationFn: (payload: { itemId: string; quantityChange: number; reason: string; lotNumber?: string; locationId?: string }) => 
      inventoryService.createWasteTransaction(payload),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res?.message, t('admin.inventory.expiring.wasteSuccess', 'Đã tiêu hủy lô hàng thành công')))
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] })
      setWasteTarget(null)
    }
  })

  const confirmWaste = (reason: string, locationId?: string) => {
    if (!wasteTarget) return
    wasteMutation.mutate({
      itemId: wasteTarget.itemId,
      quantityChange: -Math.abs(wasteTarget.currentStock), // must be negative for OUT
      reason: reason,
      lotNumber: wasteTarget.lotNumber || undefined,
      locationId: locationId || undefined
    })
  }

  const handleWaste = (item: IExpiringStock) => {
    setWasteTarget(item)
  }

  const columns: ColumnDef<IExpiringStock>[] = [
    {
      header: t('admin.inventory.expiring.colItem', 'Nguyên liệu'),
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{item.itemName}</span>
          <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{item.itemSku}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.expiring.colLot', 'Mã lô'),
      cell: (item) => (
        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 font-bold border border-slate-200">
          {item.lotNumber || 'N/A'}
        </span>
      )
    },
    {
      header: t('admin.inventory.expiring.colStock', 'Tồn hiện tại'),
      align: 'right',
      cell: (item) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-slate-900">{formatQty(item.itemId, item.currentStock, item.uomName)}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.expiring.colDate', 'Ngày hết hạn'),
      cell: (item) => (
        <span className="text-slate-600 font-medium">
          {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      header: t('admin.inventory.expiring.colStatus', 'Trạng thái'),
      align: 'center',
      cell: (item) => {
        const isExpired = item.status === 'EXPIRED'
        if (isExpired) return <Badge variant="danger">{t('admin.inventory.expiring.statusExpired', 'Đã quá hạn')}</Badge>
        return (
          <Badge variant="warning">
            {t('admin.inventory.expiring.statusExpiring', 'Còn {{days}} ngày', { days: item.daysRemaining })}
          </Badge>
        )
      }
    },
    {
      header: '',
      align: 'right',
      cell: (item) => (
        <DropdownMenu 
          items={[
            { 
              label: t('admin.inventory.expiring.actionWaste', 'Tiêu hủy (Waste)'), 
              onClick: () => handleWaste(item), 
              icon: <Trash2 className="w-4 h-4" />,
              variant: 'danger'
            },
            { label: t('common.details', 'Xem chi tiết'), onClick: () => setSelectedLotForDetails(item), icon: <History className="w-4 h-4" /> },
          ]}
        />
      )
    }
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {t('admin.inventory.expiring.title', 'Cảnh báo Hạn Sử Dụng')}
        </h2>
        <div className="flex items-center gap-2">
          <ExportButton
            data={filteredList.map(item => ({
              ...item,
              expiryDate: new Date(item.expiryDate).toLocaleDateString('vi-VN'),
              costPrice: item.avgCostPrice || 0,
              estimatedLoss: (item.currentStock || 0) * (item.avgCostPrice || 0),
              statusLabel: item.status === 'EXPIRED' 
                ? t('admin.inventory.expiring.statusExpired', 'Đã quá hạn') 
                : t('admin.inventory.expiring.statusExpiring', 'Sắp hết hạn (Còn {{days}} ngày)', { days: item.daysRemaining })
            }))}
            fileName={t('admin.inventory.expiring.exportFileName', 'Canh_bao_het_han')}
            sheetName="HetHan"
            headers={{
              'itemName': t('admin.inventory.expiring.colItem', 'Tên nguyên liệu'),
              'itemSku': t('admin.inventory.item.colSku', 'Mã SKU'),
              'lotNumber': t('admin.inventory.expiring.colLot', 'Số lô'),
              'expiryDate': t('admin.inventory.expiring.colDate', 'Ngày hết hạn'),
              'daysRemaining': t('admin.inventory.expiring.daysRemaining', 'Số ngày còn lại'),
              'currentStock': t('admin.inventory.expiring.colStock', 'Số lượng tồn'),
              'uomName': t('admin.inventory.item.colUom', 'Đơn vị'),
              'costPrice': t('admin.inventory.item.colCostPrice', 'Giá vốn'),
              'estimatedLoss': t('admin.inventory.expiring.estimatedLoss', 'Giá trị ước tính hao phí'),
              'statusLabel': t('admin.inventory.expiring.colStatus', 'Trạng thái')
            }}
          />
        </div>
      </div>

      {expiringList.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-4 animate-in slide-in-from-top-2 shadow-sm">
          <CalendarClock className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700 font-medium">
            {t('admin.inventory.expiring.alertPrefix', 'Có')}{' '}
            <span className="font-bold">{expiringList.length}</span>{' '}
            {t('admin.inventory.expiring.alertSuffix', 'lô nguyên liệu sắp hết hạn hoặc đã quá hạn. Vui lòng kiểm tra và xử lý (Waste) sớm.')}
          </p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder={t('common.search')}
        searchValue={keyword}
        onSearchChange={(val) => {
          setKeyword(val)
          setPage(0)
        }}
        filters={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 h-9">
              <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">
                {t('admin.inventory.expiring.filterExpiryBefore', 'Hết hạn trước:')}
              </span>
              <input 
                type="date"
                value={targetDate}
                onChange={(e) => { setTargetDate(e.target.value); setPage(0); }}
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 cursor-pointer p-0"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="w-44">
              <CategoryAsyncSelect
                value={categoryId}
                onChange={setCategoryId}
                label=""
                placeholder={t('admin.inventory.expiring.allCategories', 'Tất cả nhóm')}
                className="!h-9 !py-0 !text-xs !bg-slate-50 border-none focus:!bg-white focus:!ring-1 focus:!ring-primary/30"
              />
            </div>
          </div>
        }
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
            <CalendarClock className="w-12 h-12 mb-3 opacity-20 text-green-500" />
            <p className="text-lg font-bold text-slate-600">
              {t('admin.inventory.expiring.emptyTitle', 'Tuyệt vời! Kho không có hàng sắp hết hạn.')}
            </p>
          </div>
        }
      />

      <WasteLotModal
        isOpen={!!wasteTarget}
        onClose={() => setWasteTarget(null)}
        item={wasteTarget}
        onConfirm={confirmWaste}
        isLoading={wasteMutation.isPending}
      />

      <LotDetailsModal 
        isOpen={!!selectedLotForDetails}
        onClose={() => setSelectedLotForDetails(null)}
        item={selectedLotForDetails}
      />
    </div>
  )
}

interface LotDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  item: IExpiringStock | null
}

function LotDetailsModal({ isOpen, onClose, item }: LotDetailsModalProps) {
  const { t } = useTranslation()

  // 1. Query Purchase Orders to find the source PO
  const { data: posData, isLoading: isLoadingPO } = useQuery({
    queryKey: ['admin', 'inventory', 'po', 'list-all'],
    queryFn: () => inventoryService.getPurchaseOrders({ size: 100 }),
    enabled: !!isOpen && !!item && !!item.lotNumber,
  })

  // 2. Query Transactions for this specific item
  const { data: txData, isLoading: isLoadingTx } = useQuery({
    queryKey: ['admin', 'inventory', 'transactions', 'item-history', item?.itemId],
    queryFn: () => inventoryService.getTransactions({ itemId: item?.itemId, size: 50 }),
    enabled: !!isOpen && !!item?.itemId,
  })

  if (!isOpen || !item) return null

  // Find the PO that contains an item with the matching lotNumber (batchNumber)
  const sourcePO = posData?.content?.find((po: any) => 
    po.items?.some((pi: any) => pi.batchNumber === item.lotNumber)
  )

  const poItem = sourcePO?.items?.find((pi: any) => pi.batchNumber === item.lotNumber)

  // Find the transactions for this item belonging to the same lot
  const transactions = (txData?.content || []).filter((tx: any) => 
    tx.lotNumber === item.lotNumber || 
    (tx.reason && tx.reason.includes(item.lotNumber))
  )

  // Check if there is a quick GRN transaction matching the lot or recent IN_QUICK
  const quickGrnTx = transactions.find((tx: any) => 
    tx.transactionType === 'IN_QUICK' && tx.reason?.includes(item.lotNumber)
  ) || (txData?.content || []).find((tx: any) => tx.transactionType === 'IN_QUICK' && tx.lotNumber === item.lotNumber)

  const importPrice = poItem?.unitPrice || quickGrnTx?.unitPriceAtTransaction || 0
  const isExpired = item.status === 'EXPIRED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl min-h-[550px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="py-5 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                {t('admin.inventory.expiring.lotDetailsTitle', 'Chi tiết Lô hàng')}{' '}
                <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-bold border border-slate-200">
                  {item.lotNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {item.itemName} • {item.itemSku}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isExpired ? 'danger' : 'warning'}>
              {isExpired ? t('admin.inventory.expiring.statusExpired', 'Đã quá hạn') : t('admin.inventory.expiring.statusExpiring', 'Còn {{days}} ngày', { days: item.daysRemaining })}
            </Badge>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-grow overflow-y-auto max-h-[500px]">
          {/* Section 1: Nguồn gốc lô hàng */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              {t('admin.inventory.expiring.sourceSection', 'Nguồn gốc & Thông tin nhập')}
            </h4>

            {isLoadingPO ? (
              <div className="py-4 text-center text-xs text-slate-400 font-medium">
                {t('common.loading', 'Đang tải thông tin...')}
              </div>
            ) : sourcePO ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Nhà cung cấp</span>
                  <p className="text-sm font-bold text-slate-700">{sourcePO.supplierName || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Đơn mua hàng (PO)</span>
                  <p className="text-sm font-bold text-primary font-mono">{sourcePO.poNumber || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Đơn giá nhập</span>
                  <p className="text-sm font-bold text-slate-900 tabular-nums">
                    {importPrice > 0 ? formatCurrency(importPrice) : '—'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Ngày nhập kho</span>
                  <p className="text-sm font-bold text-slate-700">
                    {new Date(sourcePO.confirmedAt || sourcePO.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <span className="text-xs text-slate-400 font-medium">Ghi chú nhập hàng</span>
                  <p className="text-sm font-medium text-slate-600 italic">
                    {sourcePO.notes || t('common.noNotes', 'Không có ghi chú')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" className="bg-sky-50 text-sky-700 border-sky-200">
                    {t('admin.inventory.transactions.type.IN_QUICK', 'Nhập nhanh (Quick GRN)')}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Đơn giá nhập</span>
                    <p className="text-sm font-bold text-slate-900 tabular-nums">
                      {importPrice > 0 ? formatCurrency(importPrice) : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-medium">Ngày nhập nhanh</span>
                    <p className="text-sm font-bold text-slate-700">
                      {quickGrnTx ? new Date(quickGrnTx.createdAt).toLocaleDateString('vi-VN') : '—'}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-xs text-slate-400 font-medium">Ghi chú nhập nhanh</span>
                    <p className="text-sm font-medium text-slate-600 italic">
                      {quickGrnTx?.reason || t('common.noNotes', 'Không có ghi chú')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Lịch sử biến động & Xuất hủy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {t('admin.inventory.expiring.historySection', 'Lịch sử biến động & Xuất hủy')}
            </h4>

            {isLoadingTx ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                {t('common.loading', 'Đang tải lịch sử giao dịch...')}
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                {t('admin.inventory.transactions.empty', 'Không có lịch sử giao dịch')}
              </div>
            ) : (
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4">Loại giao dịch</th>
                      <th className="py-3 px-4 text-right">Thay đổi</th>
                      <th className="py-3 px-4">Người thực hiện / Lý do</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {transactions.map((tx: any) => {
                      const isPositive = tx.quantityChange > 0
                      const isDisposal = tx.transactionType === 'OUT_WASTE'
                      return (
                        <tr key={tx.id} className={`hover:bg-slate-50/50 transition ${isDisposal ? 'bg-red-50/20' : ''}`}>
                          <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                            <div className="font-bold text-slate-700">
                              {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(tx.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={isDisposal ? 'danger' : isPositive ? 'success' : 'neutral'} className="text-[9px] font-bold uppercase tracking-wider">
                              {t(`admin.inventory.transactions.type.${tx.transactionType}`)}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
                              {isPositive ? '+' : ''}{tx.quantityChange.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-medium ml-1">
                              {tx.baseUomName || item.uomName}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-700 max-w-[250px] truncate" title={tx.reason}>
                              {tx.reason || '—'}
                            </div>
                            {tx.createdBy && (
                              <div className="text-[10px] text-slate-400 font-medium italic mt-0.5">
                                {t('admin.inventory.expiring.byStaff', 'Thực hiện bởi: {{name}}', { name: tx.createdBy })}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="py-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <Button onClick={onClose} variant="outline" className="!rounded-xl font-bold">
            {t('common.close', 'Đóng')}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface WasteLotModalProps {
  isOpen: boolean
  onClose: () => void
  item: IExpiringStock | null
  onConfirm: (reason: string, locationId?: string) => void
  isLoading: boolean
}

function WasteLotModal({ isOpen, onClose, item, onConfirm, isLoading }: WasteLotModalProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const [locationId, setLocationId] = useState('')
  const { data: locationsData, isLoading: isLoadingLocations } = useLocations()
  const locations = locationsData || []

  useEffect(() => {
    if (item) {
      setReason(t('admin.inventory.waste.defaultReason', 'Tiêu hủy lô hàng cận date/hết hạn: {{lotNumber}}', { lotNumber: item.lotNumber }))
    } else {
      setReason('')
    }
  }, [item, isOpen])

  if (!isOpen || !item) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="py-4 px-6 border-b border-slate-100 font-bold text-base text-red-600 flex items-center gap-2 bg-red-50/10">
          <Trash2 className="w-5 h-5" />
          {t('admin.inventory.expiring.wasteDialogTitle', 'Tiêu hủy lô hàng')}
        </div>
        
        <div className="p-6 space-y-5">
          <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 text-xs text-red-800 space-y-2">
            <p className="font-bold text-[13px] text-red-900">
              Bạn đang thực hiện tiêu hủy toàn bộ tồn kho của lô hàng này:
            </p>
            <div className="grid grid-cols-[80px_1fr] gap-y-1.5 text-red-800 font-medium">
              <span>Nguyên liệu:</span>
              <span className="font-bold text-slate-800">{item.itemName}</span>
              <span>Mã lô:</span>
              <span className="font-mono font-bold text-slate-800">{item.lotNumber}</span>
              <span>Số lượng hủy:</span>
              <span className="font-bold text-red-600">{item.currentStock.toLocaleString()} {item.uomName}</span>
            </div>
          </div>

          <div className="space-y-1.5 z-10">
            <label className="text-xs font-bold text-slate-600 ml-0.5 block">
              {t('admin.inventory.waste.location', 'Khu vực lưu trữ')} <span className="text-slate-400 font-normal">({t('admin.inventory.waste.emptyToWasteAll', 'để trống để hủy tất cả kho')})</span>
            </label>
            <AsyncSelect
              value={locationId}
              onChange={(val) => setLocationId(String(val))}
              onSearch={() => {}}
              isLoading={isLoadingLocations}
              options={locations.map((l: any) => ({ value: l.id, label: l.name }))}
              placeholder={t('admin.inventory.waste.selectLocationOptional', '-- Chọn vị trí (tùy chọn) --')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 ml-0.5 block">
              Lý do tiêu hủy <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[90px] p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition resize-none font-semibold text-slate-700 bg-slate-50/30"
              placeholder="Nhập lý do tiêu hủy (ví dụ: hỏng hóc, ẩm mốc, quá hạn...)"
            />
          </div>
        </div>

        <div className="py-3.5 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="!rounded-xl font-bold">
            {t('common.cancel', 'Hủy')}
          </Button>
          <Button
            onClick={() => onConfirm(reason, locationId)}
            disabled={isLoading || !reason.trim()}
            variant="danger"
            className="!rounded-xl font-bold gap-2 shadow-sm"
          >
            {isLoading ? t('common.loading', 'Đang xử lý...') : <><Trash2 className="w-4 h-4" /> {t('admin.inventory.expiring.wasteBtn', 'Tiêu hủy ngay')}</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
