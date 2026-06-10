import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { getSuccessMessage } from '@/shared/utils/apiResponse'
import { inventoryService } from '../services/inventory.service'
import { IPurchaseOrder, IPurchaseSuggestion } from '../types/inventory.type'
import CreatePoForm from './po/CreatePoForm'
import PoSuggestionsModal from './po/PoSuggestionsModal'
import PoDetailDrawer from './po/PoDetailDrawer'
import GoodsReceiptModal from './po/GoodsReceiptModal'
import PoActionMenu from './po/PoActionMenu'
import { PoStatusBadge } from './po/PoStatusBadge'
import { PoFilters } from './po/PoFilters'
import { ExportButton } from '@/shared/components/ExportButton'

interface PurchaseOrderTabProps {
  navParams?: any
}

export default function PurchaseOrderTab({ navParams }: PurchaseOrderTabProps) {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)
  const [isShowingSuggestions, setIsShowingSuggestions] = useState(false)
  const [prefilledSuggestion, setPrefilledSuggestion] = useState<IPurchaseSuggestion | null>(null)
  const [editPo, setEditPo] = useState<IPurchaseOrder | null>(null)
  const [detailPo, setDetailPo] = useState<IPurchaseOrder | null>(null)
  const [receivePo, setReceivePo] = useState<IPurchaseOrder | null>(null)


  useEffect(() => {
    if (navParams?.suggestion) {
      setPrefilledSuggestion(navParams.suggestion)
      setIsCreating(true)
    }
  }, [navParams])

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 25

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', 'purchase-orders', { search, statusFilter, typeFilter, startDate, endDate, page }],
    queryFn: () => inventoryService.getPurchaseOrders({
      status: statusFilter || undefined,
      type: typeFilter || undefined,
      startDate: startDate ? `${startDate}T00:00:00` : undefined,
      endDate: endDate ? `${endDate}T23:59:59` : undefined,
      page,
      size: pageSize,
      sort: 'createdAt,desc',
    }),
  })

  const confirmMutation = useMutation({
    mutationFn: (id: string) => inventoryService.confirmPurchaseOrder(id),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res?.message, t('admin.inventory.po.confirmSuccess', 'Đã chốt phiếu nhập kho')))
      queryClient.invalidateQueries({ queryKey: ['inventory', 'purchase-orders'] })
    },
  })

  const forceCompleteMutation = useMutation({
    mutationFn: (id: string) => inventoryService.forceCompletePurchaseOrder(id),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res?.message, t('admin.inventory.po.forceCompleteSuccess', 'Đã đóng phiếu nhập kho')))
      queryClient.invalidateQueries({ queryKey: ['inventory', 'purchase-orders'] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => inventoryService.cancelPurchaseOrder(id),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res?.message, t('admin.inventory.po.cancelSuccess', 'Đã hủy phiếu nhập kho')))
      queryClient.invalidateQueries({ queryKey: ['inventory', 'purchase-orders'] })
    },
  })

  if (isCreating || editPo) {
    return <CreatePoForm
      prefilledSuggestion={prefilledSuggestion ?? undefined}
      editData={editPo ?? undefined}
      onCancel={() => { setIsCreating(false); setPrefilledSuggestion(null); setEditPo(null) }}
    />
  }

  const columns: ColumnDef<IPurchaseOrder>[] = [
    {
      header: t('admin.inventory.po.colCode', 'Mã PO'),
      accessorKey: 'poNumber',
      cell: (po) => <span className="font-bold text-primary font-mono text-sm">{po.poNumber}</span>,
    },
    {
      header: t('admin.inventory.po.colType', 'Loại'),
      cell: (po) => (
        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
          {po.type === 'STANDARD' ? t('admin.inventory.po.typeStd', 'Tiêu chuẩn') : t('admin.inventory.po.typeQuick', 'Nhập nhanh')}
        </span>
      ),
    },
    {
      header: t('admin.inventory.po.colSupplier', 'Nhà cung cấp'),
      accessorKey: 'supplierName',
      cell: (po) => <span className="text-slate-700">{po.supplierName ?? '—'}</span>,
    },
    {
      header: t('admin.inventory.po.colStatus', 'Trạng thái'),
      cell: (po) => <PoStatusBadge status={po.status} />,
    },
    {
      header: t('admin.inventory.po.colTotal', 'Tổng tiền'),
      align: 'right',
      cell: (po) => <span className="font-bold text-slate-900">{po.totalAmount?.toLocaleString()} {t('common.currency', 'đ')}</span>,
    },
    {
      header: t('admin.inventory.po.colDate', 'Ngày tạo'),
      cell: (po) => (
        <span className="text-slate-500 text-xs font-mono">
          {new Date(po.createdAt).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (po) => (
        <PoActionMenu
          po={po}
          onView={() => setDetailPo(po)}
          onEdit={() => setEditPo(po)}
          onReceive={() => setReceivePo(po)}
          onConfirm={() => confirmMutation.mutate(po.id)}
          onForceComplete={() => forceCompleteMutation.mutate(po.id)}
          onCancel={() => cancelMutation.mutate(po.id)}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {t('admin.inventory.po.title', 'Quản lý Nhập kho')}
        </h2>
        <div className="flex items-center gap-2">
          <ExportButton
            data={(data?.content || []).map((po: any) => ({
              ...po,
              typeLabel: po.type === 'STANDARD' ? t('admin.inventory.po.typeStd', 'Tiêu chuẩn') : t('admin.inventory.po.typeQuick', 'Nhập nhanh'),
              statusLabel: t(`admin.inventory.po.status.${po.status.toLowerCase()}`, po.status),
              createdAtFormatted: new Date(po.createdAt).toLocaleString('vi-VN')
            }))}
            fileName={t('admin.inventory.po.exportFileName', 'Danh_sach_phieu_nhap_kho')}
            sheetName={t('admin.inventory.po.exportSheetName', 'NhapKho')}
            headers={{
              'poNumber': t('admin.inventory.po.colCode', 'Mã PO'),
              'typeLabel': t('admin.inventory.po.colType', 'Loại phiếu'),
              'supplierName': t('admin.inventory.po.colSupplier', 'Nhà cung cấp'),
              'statusLabel': t('admin.inventory.po.colStatus', 'Trạng thái'),
              'totalAmount': t('admin.inventory.po.colTotal', 'Tổng tiền'),
              'createdAtFormatted': t('admin.inventory.po.colDate', 'Ngày tạo')
            }}
          />
          <Button size="sm" onClick={() => setIsCreating(true)} className="!rounded-lg">
            <Plus className="w-4 h-4 mr-1.5" /> {t('admin.inventory.po.createBtn', 'Lập Phiếu Nhập')}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        searchPlaceholder={t('admin.inventory.po.searchPlaceholder', 'Tìm theo mã PO...')}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val)
          setPage(0)
        }}
        filters={
          <PoFilters 
            statusFilter={statusFilter} 
            setStatusFilter={v => { setStatusFilter(v); setPage(0) }} 
            typeFilter={typeFilter} 
            setTypeFilter={v => { setTypeFilter(v); setPage(0) }} 
            startDate={startDate}
            setStartDate={v => { setStartDate(v); setPage(0) }}
            endDate={endDate}
            setEndDate={v => { setEndDate(v); setPage(0) }}
          />
        }
        pagination={{ currentPage: page, totalPages: data?.totalPages ?? 0, onPageChange: setPage, pageSize, totalElements: data?.totalElements ?? 0 }}
        actions={
          <Button variant="ghost" onClick={() => setIsShowingSuggestions(true)} className="gap-2 text-primary hover:bg-primary/5">
            <Sparkles className="w-4 h-4" /> {t('admin.inventory.po.suggestions', 'Gợi ý nhập hàng')}
          </Button>
        }
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-bold">{t('admin.inventory.po.empty', 'Chưa có phiếu nhập kho')}</p>
          </div>
        }
      />

      {isShowingSuggestions && (
        <PoSuggestionsModal
          onClose={() => setIsShowingSuggestions(false)}
          onUseSuggestion={(item) => { setPrefilledSuggestion(item); setIsShowingSuggestions(false); setIsCreating(true) }}
        />
      )}

      {detailPo && <PoDetailDrawer po={detailPo} onClose={() => setDetailPo(null)} />}
      {receivePo && <GoodsReceiptModal po={receivePo} onClose={() => setReceivePo(null)} />}
    </div>
  )
}
