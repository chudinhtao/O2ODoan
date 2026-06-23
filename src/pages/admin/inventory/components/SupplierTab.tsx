import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Phone, Mail, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { Input } from '@/shared/components/ui/Input'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useSuppliers } from '../hooks/useInventoryQueries'
import { useSupplierMutations } from '../hooks/useInventoryMutations'
import { ISupplier } from '../types/inventory.type'
import { ExportButton } from '@/shared/components/ExportButton'

export default function SupplierTab() {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [isAdding, setIsAdding] = useState(false)
  const [editItem, setEditItem] = useState<ISupplier | null>(null)
  const [isEditingCode, setIsEditingCode] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ISupplier | null>(null)
  const [toggleTarget, setToggleTarget] = useState<ISupplier | null>(null)

  const [formName, setFormName] = useState('')
  const [formCode, setFormCode] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formTaxCode, setFormTaxCode] = useState('')

  const { data, isLoading } = useSuppliers({ 
    keyword: keyword || undefined, 
    isActive: showInactive ? undefined : true, 
    page, 
    size: pageSize 
  })
  const { create, update, toggle, remove } = useSupplierMutations()

  const handleSave = () => {
    if (!formName.trim()) return
    const payload = { 
      name: formName, 
      code: formCode || undefined, 
      phone: formPhone || undefined,
      email: formEmail || undefined,
      address: formAddress || undefined,
      taxCode: formTaxCode || undefined
    }
    if (editItem) {
      update.mutate({ id: editItem.id, data: payload }, { onSuccess: resetForm })
    } else {
      create.mutate(payload, { onSuccess: resetForm })
    }
  }

  const resetForm = () => { 
    setIsAdding(false); 
    setEditItem(null); 
    setFormName(''); 
    setFormCode(''); 
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormTaxCode('');
    setIsEditingCode(false);
  }
  
  const startEdit = (s: ISupplier) => { 
    setEditItem(s); 
    setFormName(s.name); 
    setFormCode(s.code || ''); 
    setFormPhone(s.phone || ''); 
    setFormEmail(s.email || '');
    setFormAddress(s.address || '');
    setFormTaxCode(s.taxCode || '');
    setIsAdding(true); 
  }
  
  const startAdd = () => { 
    setEditItem(null); 
    setFormName(''); 
    setFormCode(''); 
    setFormPhone(''); 
    setFormEmail('');
    setFormAddress('');
    setFormTaxCode('');
    setIsAdding(true); 
  }

  const columns: ColumnDef<ISupplier>[] = [
    {
      header: t('admin.inventory.supplier.code'),
      accessorKey: 'code',
      className: 'font-mono text-[10px] text-slate-400',
    },
    {
      header: t('admin.inventory.supplier.name'),
      cell: (s) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{s.name}</span>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            {s.email && <span className="flex items-center gap-0.5"><Mail className="size-2.5" /> {s.email}</span>}
            {s.phone && <span className="flex items-center gap-0.5"><Phone className="size-2.5" /> {s.phone}</span>}
          </div>
        </div>
      ),
    },
    {
      header: t('admin.inventory.supplier.phone'),
      accessorKey: 'phone',
    },
    {
      header: t('admin.inventory.supplier.status'),
      cell: (s) => (
        <Badge variant={s.active ? 'success' : 'neutral'}>
          {s.active ? t('admin.inventory.supplier.active') : t('admin.inventory.supplier.inactive')}
        </Badge>
      ),
    },
    {
      header: '',
      align: 'right',
      cell: (s) => (
        <DropdownMenu 
          items={[
            { label: t('admin.inventory.supplier.editInfo'), onClick: () => startEdit(s), icon: <Pencil className="w-4 h-4" /> },
            { 
              label: s.active ? t('admin.inventory.supplier.deactivate') : t('admin.inventory.supplier.activate'), 
              onClick: () => setToggleTarget(s), 
              icon: <Trash2 className="w-4 h-4" />,
              variant: s.active ? 'danger' : 'default'
            }
          ]}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {t('admin.inventory.supplier.title')}
        </h2>
        <div className="flex items-center gap-2">
          <ExportButton
            data={(data?.content || []).map((s: any) => ({
              ...s,
              taxCode: s.taxCode || '—',
              isActiveLabel: s.active ? t('common.active', 'Hoạt động') : t('common.inactive', 'Tạm ngưng')
            }))}
            fileName={t('admin.inventory.supplier.exportFileName')}
            sheetName={t('admin.inventory.supplier.exportSheetName')}
            headers={{
              'name': t('admin.inventory.supplier.exportHeaderName'),
              'code': t('admin.inventory.supplier.exportHeaderCode'),
              'taxCode': t('admin.inventory.supplier.taxCode', 'Mã số thuế'),
              'contactName': t('admin.inventory.supplier.exportHeaderContact'),
              'phone': t('admin.inventory.supplier.exportHeaderPhone'),
              'email': t('admin.inventory.supplier.exportHeaderEmail'),
              'address': t('admin.inventory.supplier.exportHeaderAddress'),
              'isActiveLabel': t('admin.inventory.supplier.exportHeaderStatus')
            }}
          />
          <Button size="sm" onClick={startAdd} className="!rounded-lg">
            <Plus className="w-4 h-4 mr-1.5" /> {t('admin.inventory.supplier.addNewBtn')}
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-lg font-bold text-slate-800">
                {editItem ? t('admin.inventory.supplier.editTitle') : t('admin.inventory.supplier.addTitle')}
              </h2>
              <Button variant="ghost" size="icon" onClick={resetForm} className="rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </Button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('admin.inventory.supplier.code')}</label>
                  <Input 
                    value={formCode} 
                    onChange={e => setFormCode(e.target.value)} 
                    placeholder={isEditingCode || editItem ? t('admin.inventory.supplier.codePlaceholderManual') : t('admin.inventory.supplier.codePlaceholderAuto')} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('admin.inventory.supplier.name')} <span className="text-red-500">*</span></label>
                  <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder={t('admin.inventory.supplier.namePlaceholder')} autoFocus />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('admin.inventory.supplier.phone')}</label>
                  <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder={t('admin.inventory.supplier.phonePlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('admin.inventory.supplier.email')}</label>
                  <Input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder={t('admin.inventory.supplier.emailPlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('admin.inventory.supplier.taxCode')}</label>
                  <Input value={formTaxCode} onChange={e => setFormTaxCode(e.target.value)} placeholder={t('admin.inventory.supplier.taxCodePlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('admin.inventory.supplier.address')}</label>
                  <Input value={formAddress} onChange={e => setFormAddress(e.target.value)} placeholder={t('admin.inventory.supplier.addressPlaceholder')} />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <Button variant="outline" onClick={resetForm}>{t('common.cancel')}</Button>
              <Button onClick={handleSave} disabled={!formName.trim() || create.isPending || update.isPending}>
                {editItem ? t('common.save') : t('admin.inventory.supplier.create')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.content ?? []}
        isLoading={isLoading}
        searchPlaceholder={t('admin.inventory.supplier.search')}
        searchValue={keyword}
        onSearchChange={(val) => {
          setKeyword(val)
          setPage(0)
        }}
        filters={<></>}
        pagination={{
          currentPage: page,
          totalPages: data?.totalPages ?? 0,
          onPageChange: setPage,
          pageSize: pageSize,
          totalElements: data?.totalElements ?? 0,
          onPageSizeChange: (size) => {
            setPageSize(size)
            setPage(0)
          }
        }}
        actions={
          <Button 
            variant="outline" 
            onClick={() => setShowInactive(!showInactive)}
            size="sm"
          >
            {showInactive ? t('admin.inventory.supplier.hideInactive') : t('admin.inventory.supplier.showInactive')}
          </Button>
        }
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) remove.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }) }}
        title={t('admin.inventory.supplier.confirmDeleteTitle')}
        description={t('admin.inventory.supplier.confirmDeleteDescription')}
        isLoading={remove.isPending}
      />

      <ConfirmDialog
        isOpen={!!toggleTarget}
        onCancel={() => setToggleTarget(null)}
        onConfirm={() => { 
          if (toggleTarget) {
            toggle.mutate(toggleTarget.id, { 
              onSuccess: () => setToggleTarget(null) 
            }) 
          }
        }}
        title={
          toggleTarget?.active 
            ? t('admin.inventory.supplier.confirmDeactivateTitle') 
            : t('admin.inventory.supplier.confirmActivateTitle')
        }
        description={
          toggleTarget?.active 
            ? t('admin.inventory.supplier.confirmDeactivateDescription') 
            : t('admin.inventory.supplier.confirmActivateDescription')
        }
        isLoading={toggle.isPending}
      />
    </div>
  )
}

