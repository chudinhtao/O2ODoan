import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Ruler, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { useInventoryUomSearch } from '../hooks/useInventoryQueries'
import { useUomMutations } from '../hooks/useInventoryMutations'
import { IUom } from '../types/inventory.type'
import { ExportButton } from '@/shared/components/ExportButton'

export default function UomTab() {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const { data: searchData, isLoading } = useInventoryUomSearch({
    keyword: keyword || undefined,
    page: currentPage,
    size: pageSize
  })

  const uoms = searchData?.content || []
  const totalElements = searchData?.totalElements || 0
  const totalPages = searchData?.totalPages || 0

  const { create, update, remove } = useUomMutations()
  const [editItem, setEditItem] = useState<IUom | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<IUom | null>(null)

  const handleSave = () => {
    if (!name.trim()) return
    if (editItem) {
      update.mutate({ id: editItem.id, data: { name, shortName } }, { onSuccess: () => { setIsAdding(false); setEditItem(null); resetForm() } })
    } else {
      create.mutate({ name, shortName }, { onSuccess: () => { setIsAdding(false); resetForm() } })
    }
  }

  const resetForm = () => { setName(''); setShortName('') }
  const startEdit = (item: IUom) => { setEditItem(item); setName(item.name); setShortName(item.shortName); setIsAdding(true) }
  const startAdd = () => { setEditItem(null); resetForm(); setIsAdding(true) }

  const columns: ColumnDef<IUom>[] = [
    {
      header: t('admin.inventory.uom.colId'),
      accessorKey: 'id',
      cell: (uom) => (
        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
          {uom.id.substring(0, 8).toUpperCase()}
        </span>
      ),
      className: 'w-32',
    },
    {
      header: t('admin.inventory.uom.name'),
      accessorKey: 'name',
      cell: (uom) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
            <Ruler className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800">{uom.name}</span>
        </div>
      ),
    },
    {
      header: t('admin.inventory.uom.shortName'),
      accessorKey: 'shortName',
      cell: (uom) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-medium text-xs border border-slate-200">
          {uom.shortName}
        </span>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (uom) => (
        <DropdownMenu 
          items={[
            { label: t('common.edit'), onClick: () => startEdit(uom), icon: <Pencil className="w-4 h-4" /> },
            { 
              label: t('common.delete'), 
              onClick: () => setDeleteTarget(uom), 
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
          {t('admin.inventory.uom.title')}
        </h2>
        <div className="flex items-center gap-2">
          <ExportButton
            data={uoms || []}
            fileName={t('admin.inventory.uom.exportFileName')}
            sheetName={t('admin.inventory.uom.exportSheetName')}
            headers={{
              'id': t('admin.inventory.uom.id', 'Mã ĐVT'),
              'name': t('admin.inventory.uom.exportHeaderName'),
              'shortName': t('admin.inventory.uom.exportHeaderShortName')
            }}
          />
          <Button size="sm" onClick={startAdd} className="!rounded-lg">
            <Plus className="w-4 h-4 mr-1.5" /> {t('admin.inventory.uom.addNew')}
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editItem ? t('admin.inventory.uom.editTitle') : t('admin.inventory.uom.addTitle')}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditItem(null); resetForm() }} className="rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </Button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="w-full">
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  {t('admin.inventory.uom.name')} <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder={t('admin.inventory.uom.placeholderName')} 
                  autoFocus 
                />
              </div>
              <div className="w-full">
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                  {t('admin.inventory.uom.shortName')}
                </label>
                <Input 
                  value={shortName} 
                  onChange={e => setShortName(e.target.value)} 
                  placeholder={t('admin.inventory.uom.placeholderShortName')} 
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={() => { setIsAdding(false); setEditItem(null); resetForm() }}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={!name.trim() || create.isPending || update.isPending}>
                {editItem ? t('common.save') : t('admin.inventory.uom.create')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={uoms}
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
            <Ruler className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-bold">{t('admin.inventory.uom.empty')}</p>
          </div>
        }
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }) }}
        title={t('admin.inventory.uom.confirmDelete')}
        description={t('common.confirmDeleteDescription')}
        isLoading={remove.isPending}
      />
    </div>
  )
}
