import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, ClipboardCheck, Eye, PencilLine } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { Input } from '@/shared/components/ui/Input'
import { Textarea } from '@/shared/components/ui/Textarea'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { Select } from '@/shared/components/ui/Select'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { getSuccessMessage } from '@/shared/utils/apiResponse'
import { inventoryService } from '../services/inventory.service'
import { useLocations } from '../hooks/useInventoryQueries'
import StocktakeCountForm from './stocktake/StocktakeCountForm'
import { ExportButton } from '@/shared/components/ExportButton'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'

export default function StocktakeTab() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [activeStocktakeId, setActiveStocktakeId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [locationId, setLocationId] = useState('')
  const [keyword, setKeyword] = useState('')

  const { data: locations } = useLocations()
  const locationOptions = locations?.filter(l => l.active).map(l => ({ value: l.id, label: l.name })) || []
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(0)
  const pageSize = 15

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.inventory.stocktakes({ page, keyword, startDate, endDate }),
    queryFn: () => inventoryService.getStocktakes({ 
      page, 
      size: pageSize,
      keyword: keyword ? keyword.trim() : undefined,
      startDate: startDate ? `${startDate}T00:00:00` : undefined,
      endDate: endDate ? `${endDate}T23:59:59` : undefined,
    })
  })

  const createMutation = useMutation({
    mutationFn: () => inventoryService.createStocktake({ name: newName, notes: newNotes, locationId: locationId || undefined }),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.inventory.stocktake.createSuccess', 'Đã tạo phiên kiểm kê mới')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inventory.stocktakes() })
      setIsModalOpen(false)
      setNewName('')
      setNewNotes('')
      setLocationId('')
      if (res.data) setActiveStocktakeId(res.data.id)
    }
  })

  const filteredContent = data?.content || []

  if (activeStocktakeId) {
    return <StocktakeCountForm stocktakeId={activeStocktakeId} onBack={() => setActiveStocktakeId(null)} />
  }

  const columns: ColumnDef<any>[] = [
    {
      header: t('admin.inventory.stocktake.colName', 'Tên đợt kiểm kê'),
      cell: (st) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{st.name || `ST-${st.id.substring(0, 8).toUpperCase()}`}</span>
          <span className="text-[10px] text-slate-400 font-mono">ST-{st.id.substring(0, 8).toUpperCase()}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.stocktake.colDate', 'Ngày tạo'),
      cell: (st) => (
        <span className="text-slate-600">
          {new Date(st.createdAt).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      header: t('admin.inventory.location.name', 'Kho kiểm kê'),
      cell: (st) => (
        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-md border border-slate-200">
          {st.locationName || 'N/A'}
        </span>
      )
    },
    {
      header: t('admin.inventory.stocktake.itemsCount', 'Mặt hàng'),
      cell: (st) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-800">{st.items?.length || 0}</span>
          <span className="text-slate-500 text-xs">mục</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.stocktake.colStatus', 'Trạng thái'),
      align: 'center',
      cell: (st) => (
        <Badge variant={
          st.status === 'COMPLETED' ? 'success' :
          st.status === 'CANCELLED' ? 'danger' : 'warning'
        }>
          {st.status === 'COMPLETED' ? t('admin.inventory.stocktake.statusCompleted', 'Hoàn thành') : 
           st.status === 'DRAFT' ? t('admin.inventory.stocktake.statusDraft', 'Đang kiểm kê') : t('admin.inventory.stocktake.statusCancelled', 'Đã hủy')}
        </Badge>
      )
    },
    {
      header: '',
      align: 'right',
      cell: (st) => (
        <DropdownMenu 
          items={[
            { 
              label: st.status === 'DRAFT' ? t('admin.inventory.stocktake.continueBtn', 'Tiếp tục đếm') : t('admin.inventory.stocktake.viewBtn', 'Xem kết quả'), 
              onClick: () => setActiveStocktakeId(st.id), 
              icon: st.status === 'DRAFT' ? <PencilLine className="w-4 h-4" /> : <Eye className="w-4 h-4" />
            }
          ]}
        />
      )
    }
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {t('admin.inventory.stocktake.title', 'Kiểm kê kho')}
        </h2>
        <div className="flex items-center gap-2">
          <ExportButton
            data={(data?.content || []).map((st: any) => ({
              ...st,
              locationNameLabel: st.locationName || '—',
              itemsCount: st.items?.length || 0,
              statusLabel: st.status === 'COMPLETED' ? t('admin.inventory.stocktake.statusCompleted', 'Đã hoàn thành') : st.status === 'CANCELLED' ? t('admin.inventory.stocktake.statusCancelled', 'Đã hủy') : t('admin.inventory.stocktake.statusDraft', 'Bản nháp'),
              createdAtFormatted: new Date(st.createdAt).toLocaleString('vi-VN')
            }))}
            fileName={t('admin.inventory.stocktake.exportFileName', 'Lich_su_kiem_ke_kho')}
            sheetName="KiemKe"
            headers={{
              'name': t('admin.inventory.stocktake.colName', 'Tên đợt kiểm kê'),
              'locationNameLabel': t('admin.inventory.location.name', 'Kho kiểm kê'),
              'itemsCount': t('admin.inventory.stocktake.itemsCount', 'Số mặt hàng'),
              'statusLabel': t('admin.inventory.stocktake.colStatus', 'Trạng thái'),
              'createdAtFormatted': t('admin.inventory.stocktake.colDate', 'Ngày bắt đầu'),
              'notes': t('admin.inventory.stocktake.notes', 'Ghi chú')
            }}
          />
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="!rounded-lg">
            <Plus className="w-4 h-4 mr-1.5" /> 
            {t('admin.inventory.stocktake.createBtn', 'Tạo Phiếu Kiểm Kê')}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredContent}
        isLoading={isLoading}
        searchPlaceholder={t('common.search')}
        searchValue={keyword}
        onSearchChange={(val) => { setKeyword(val); setPage(0); }}
        filters={
          <div className="flex items-center gap-2">
            <input 
              type="date"
              className="h-9 px-2 bg-slate-50 border-none rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30 shadow-sm"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              title="Từ ngày"
            />
            <span className="text-slate-300 text-xs">—</span>
            <input 
              type="date"
              className="h-9 px-2 bg-slate-50 border-none rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30 shadow-sm"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              title="Đến ngày"
              min={startDate}
            />
          </div>
        }
        pagination={{
          currentPage: page,
          totalPages: data?.totalPages || 0,
          onPageChange: setPage,
          pageSize: pageSize,
          totalElements: data?.totalElements || 0,
        }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ClipboardCheck className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-bold">{t('admin.inventory.stocktake.empty')}</p>
          </div>
        }
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 font-bold text-lg text-slate-800">
              {t('admin.inventory.stocktake.createNew', 'Tạo Phiếu Kiểm Kê Mới')}
            </div>
            <div className="p-4 space-y-4">
              <Input
                label={t('admin.inventory.stocktake.nameLabel', 'Tên đợt kiểm kê')}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={t('admin.inventory.stocktake.namePlaceholder', 'VD: Kiểm kê cuối tháng 5/2026')}
                autoFocus
              />
              <div>
                <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1.5">
                  {t('admin.inventory.location.name', 'Kho cần kiểm kê')} <span className="text-red-500">*</span>
                </label>
                <Select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  options={[{value: '', label: t('admin.inventory.location.select', '--- Chọn Kho ---')}, ...locationOptions]}
                  className="w-full"
                />
                <p className="text-[10px] text-slate-400 mt-1 ml-1">{t('admin.inventory.stocktake.locationRequired', 'Bắt buộc chọn 1 kho cụ thể để kiểm kê (hỗ trợ kiểm kê theo Lô).')}</p>
              </div>
              <Textarea
                label={t('admin.inventory.stocktake.notesLabel', 'Ghi chú')}
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder={t('admin.inventory.stocktake.notesPlaceholder', 'Nhập ghi chú hoặc lý do kiểm kê...')}
                rows={3}
              />
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button 
                onClick={() => createMutation.mutate()} 
                disabled={!newName.trim() || !locationId || createMutation.isPending}
              >
                {createMutation.isPending ? t('common.loading', 'Đang xử lý...') : t('common.create', 'Tạo mới')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
