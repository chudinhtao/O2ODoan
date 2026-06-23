import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, MapPin, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { Toggle } from '@/shared/components/ui/Toggle'
import { useLocations } from '../hooks/useInventoryQueries'
import { useLocationMutations } from '../hooks/useInventoryMutations'
import { ILocation } from '../types/inventory.type'
import { ExportButton } from '@/shared/components/ExportButton'

export default function LocationTab() {
  const { t } = useTranslation()
  const { data: locations, isLoading } = useLocations()
  const { create, update, toggle, remove } = useLocationMutations()
  const [editItem, setEditItem] = useState<ILocation | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<ILocation | null>(null)
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const handleSave = () => {
    if (!name.trim()) return
    if (editItem) {
      update.mutate({ id: editItem.id, data: { name, description } }, { onSuccess: () => { setIsAdding(false); setEditItem(null); resetForm() } })
    } else {
      create.mutate({ name, description }, { onSuccess: () => { setIsAdding(false); resetForm() } })
    }
  }

  const resetForm = () => { setName(''); setDescription('') }
  const startEdit = (item: ILocation) => { setEditItem(item); setName(item.name); setDescription(item.description || ''); setIsAdding(true) }
  const startAdd = () => { setEditItem(null); resetForm(); setIsAdding(true) }

  const columns: ColumnDef<ILocation>[] = [
    {
      header: t('admin.inventory.location.colId', 'Mã vị trí'),
      accessorKey: 'id',
      cell: (loc) => (
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
          {loc.id.substring(0, 8).toUpperCase()}
        </span>
      ),
      className: 'w-32',
    },
    {
      header: t('admin.inventory.location.name', 'Tên vị trí / Kho'),
      accessorKey: 'name',
      cell: (loc) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{loc.name}</span>
            {loc.description && <span className="text-xs text-slate-500">{loc.description}</span>}
          </div>
        </div>
      ),
    },
    {
      header: t('common.description', 'Mô tả'),
      accessorKey: 'description',
      cell: (loc) => (
        <span className="text-sm text-slate-600 line-clamp-1">{loc.description || '—'}</span>
      ),
    },
    {
      header: t('common.status', 'Trạng thái'),
      accessorKey: 'active',
      cell: (loc) => (
        <div className="flex items-center gap-2">
          <Toggle 
            checked={loc.active} 
            onChange={() => toggle.mutate(loc.id)} 
            disabled={toggle.isPending} 
          />
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            loc.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {loc.active ? t('common.active', 'Hoạt động') : t('common.inactive', 'Tạm ngưng')}
          </span>
        </div>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (loc) => (
        <DropdownMenu 
          items={[
            { label: t('common.edit', 'Sửa'), onClick: () => startEdit(loc), icon: <Pencil className="w-4 h-4" /> },
            { 
              label: t('common.delete', 'Xóa'), 
              onClick: () => setDeleteTarget(loc), 
              icon: <Trash2 className="w-4 h-4" />,
              variant: 'danger' 
            },
          ]}
        />
      )
    }
  ]

  // Filter local data
  const filteredData = locations?.filter(l => 
    l.name.toLowerCase().includes(keyword.toLowerCase())
  ) || []

  // Paginate local data
  const paginatedData = filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize)

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {t('admin.inventory.location.title', 'Danh sách Khu vực lưu trữ')}
        </h2>
        <div className="flex items-center gap-2">
          <ExportButton
            data={(locations || []).map((l: any) => ({
              ...l,
              description: l.description || '—',
              isActiveLabel: l.active ? t('common.active', 'Hoạt động') : t('common.inactive', 'Tạm ngưng')
            }))}
            fileName={t('admin.inventory.location.exportFileName', 'Danh_sach_vi_tri_kho')}
            sheetName={t('admin.inventory.location.exportSheetName', 'Khu vực lưu trữ')}
            headers={{
              'id': t('admin.inventory.location.id', 'Mã kho'),
              'name': t('admin.inventory.location.name', 'Tên kho'),
              'description': t('admin.inventory.location.description', 'Mô tả'),
              'isActiveLabel': t('common.status', 'Trạng thái')
            }}
          />
          <Button size="sm" onClick={startAdd} className="!rounded-lg">
            <Plus className="w-4 h-4 mr-1.5" /> {t('admin.inventory.location.addNew', 'Thêm kho mới')}
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editItem ? t('admin.inventory.location.editTitle', 'Sửa tên kho') : t('admin.inventory.location.addTitle', 'Thêm kho mới')}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditItem(null); resetForm() }} className="rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </Button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="w-full">
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  {t('admin.inventory.location.name', 'Tên vị trí / Kho')} <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder={t('admin.inventory.location.placeholderName', 'Nhập tên kho (VD: Kho Tổng, Kho Bếp)')} 
                  autoFocus 
                />
              </div>
              <div className="w-full">
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  {t('common.description', 'Mô tả')}
                </label>
                <Input 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder={t('admin.inventory.location.placeholderDescription', 'Nhập mô tả cho kho này (không bắt buộc)')} 
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={() => { setIsAdding(false); setEditItem(null); resetForm() }}>
                {t('common.cancel', 'Hủy')}
              </Button>
              <Button onClick={handleSave} disabled={!name.trim() || create.isPending || update.isPending}>
                {editItem ? t('common.save', 'Lưu thay đổi') : t('admin.inventory.location.create', 'Tạo kho mới')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder={t('common.search', 'Tìm kiếm...')}
        searchValue={keyword}
        onSearchChange={(val) => {
          setKeyword(val)
          setCurrentPage(0)
        }}
        filters={<></>}
        pagination={{
          currentPage: currentPage,
          totalPages: Math.ceil(filteredData.length / pageSize),
          onPageChange: setCurrentPage,
          pageSize: pageSize,
          totalElements: filteredData.length,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setCurrentPage(0)
          }
        }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <MapPin className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-bold">{t('admin.inventory.location.empty', 'Chưa có khu vực lưu trữ nào')}</p>
          </div>
        }
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }) }}
        title={t('admin.inventory.location.confirmDelete', 'Xác nhận xóa')}
        description={t('common.confirmDeleteDescription', 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?')}
        isLoading={remove.isPending}
      />
    </div>
  )
}
