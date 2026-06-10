import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, FolderTree, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { useInventoryCategorySearch } from '../hooks/useInventoryQueries'
import { useCategoryMutations } from '../hooks/useInventoryMutations'
import { IItemCategory } from '../types/inventory.type'
import { ExportButton } from '@/shared/components/ExportButton'

export default function CategoryTab() {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const { data: searchData, isLoading } = useInventoryCategorySearch({
    keyword: keyword || undefined,
    page: currentPage,
    size: pageSize
  })

  const categories = searchData?.content || []
  const totalElements = searchData?.totalElements || 0
  const totalPages = searchData?.totalPages || 0

  const { create, update, remove } = useCategoryMutations()
  const [editItem, setEditItem] = useState<IItemCategory | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<IItemCategory | null>(null)

  const handleSave = () => {
    if (!name.trim()) return
    if (editItem) {
      update.mutate({ id: editItem.id, data: { name, description } }, { onSuccess: () => { setEditItem(null); setName(''); setDescription(''); setIsAdding(false) } })
    } else {
      create.mutate({ name, description }, { onSuccess: () => { setIsAdding(false); setName(''); setDescription('') } })
    }
  }

  const startEdit = (item: IItemCategory) => { setEditItem(item); setName(item.name); setDescription(item.description || ''); setIsAdding(true) }
  const startAdd = () => { setEditItem(null); setName(''); setDescription(''); setIsAdding(true) }

  const columns: ColumnDef<IItemCategory>[] = [
    {
      header: t('admin.inventory.category.colId'),
      accessorKey: 'id',
      cell: (cat) => (
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
          {cat.id.substring(0, 8).toUpperCase()}
        </span>
      ),
      className: 'w-32',
    },
    {
      header: t('admin.inventory.category.name'),
      accessorKey: 'name',
      cell: (cat) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
            <FolderTree className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800">{cat.name}</span>
            {cat.description && <span className="text-xs text-slate-500">{cat.description}</span>}
          </div>
        </div>
      ),
    },
    {
      header: t('common.description', 'Mô tả'),
      accessorKey: 'description',
      cell: (cat) => (
        <span className="text-sm text-slate-600 line-clamp-1">{cat.description || '—'}</span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (cat) => (
        <DropdownMenu 
          items={[
            { label: t('common.edit'), onClick: () => startEdit(cat), icon: <Pencil className="w-4 h-4" /> },
            { 
              label: t('common.delete'), 
              onClick: () => setDeleteTarget(cat), 
              icon: <Trash2 className="w-4 h-4" />,
              variant: 'danger' 
            },
          ]}
        />
      )
    }
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {t('admin.inventory.category.title')}
        </h2>
        <div className="flex items-center gap-2">
          <ExportButton
            data={(categories || []).map((c: any) => ({
              ...c,
              description: c.description || '—'
            }))}
            fileName={t('admin.inventory.category.exportFileName')}
            sheetName={t('admin.inventory.category.exportSheetName')}
            headers={{
              'id': t('admin.inventory.category.id', 'Mã nhóm'),
              'name': t('admin.inventory.category.exportHeaderName'),
              'description': t('admin.inventory.category.description', 'Mô tả')
            }}
          />
          <Button size="sm" onClick={startAdd} className="!rounded-lg">
            <Plus className="w-4 h-4 mr-1.5" /> {t('admin.inventory.category.addNew')}
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editItem ? t('admin.inventory.category.editTitle') : t('admin.inventory.category.addTitle')}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditItem(null); setName(''); setDescription('') }} className="rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="w-full">
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  {t('admin.inventory.category.name')} <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder={t('admin.inventory.category.namePlaceholder', 'Nhập tên nhóm (VD: Rau củ, Thịt, Gia vị...)')}
                  autoFocus
                />
              </div>
              <div className="w-full mt-4">
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  {t('common.description', 'Mô tả')}
                </label>
                <Input 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder={t('admin.inventory.category.placeholderDescription', 'Nhập mô tả cho nhóm này (không bắt buộc)')} 
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={() => { setIsAdding(false); setEditItem(null); setName(''); setDescription('') }}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={!name.trim() || create.isPending || update.isPending}>
                {editItem ? t('common.save') : t('admin.inventory.category.create')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        searchPlaceholder={t('common.search')}
        searchValue={keyword}
        onSearchChange={(val) => {
          setKeyword(val)
          setCurrentPage(0)
        }}
        filters={<></>}
        pagination={{
          currentPage: currentPage,
          totalPages: totalPages,
          onPageChange: setCurrentPage,
          pageSize: pageSize,
          totalElements: totalElements,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setCurrentPage(0)
          }
        }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FolderTree className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-bold">{t('admin.inventory.category.empty')}</p>
          </div>
        }
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }) }}
        title={t('admin.inventory.category.confirmDelete')}
        description={t('common.confirmDeleteDescription')}
        isLoading={remove.isPending}
      />
    </div>
  )
}
