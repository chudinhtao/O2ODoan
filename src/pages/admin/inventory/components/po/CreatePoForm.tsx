import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { IPurchaseOrderRequest, IPurchaseSuggestion, IPurchaseOrder } from '../../types/inventory.type'
import { useUoms, useSuppliers, useInventoryItems } from '../../hooks/useInventoryQueries'
import { usePurchaseOrderMutations } from '../../hooks/useInventoryMutations'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'

interface CreatePoFormProps {
  onCancel: () => void
  prefilledSuggestion?: IPurchaseSuggestion
  editData?: IPurchaseOrder
}

interface IPoItemDraft {
  itemId: string
  quantity: number
  uomId: string
  unitPrice: number
  batchNumber?: string
  expiryDate?: string
  _tempName: string
  _tempUomName: string
}

export default function CreatePoForm({ onCancel, prefilledSuggestion, editData }: CreatePoFormProps) {
  const { t } = useTranslation()
  const { create, update } = usePurchaseOrderMutations()
  const [type, setType] = useState<'STANDARD'|'QUICK_GRN'>(editData?.type || 'STANDARD')
  const [supplierId, setSupplierId] = useState<string | number>(editData?.supplierId || '')
  const [items, setItems] = useState<IPoItemDraft[]>(() => {
    if (editData) {
      return editData.items.map(i => ({
        itemId: i.itemId,
        quantity: i.orderedQuantity,
        uomId: i.uomId,
        unitPrice: i.unitPrice,
        batchNumber: i.batchNumber,
        expiryDate: i.expiryDate,
        _tempName: i.itemName,
        _tempUomName: i.uomName
      }))
    }
    return []
  })
  const [selectedItemId, setSelectedItemId] = useState<string | number>('')
  const [expectedDate, setExpectedDate] = useState<string>(editData?.expectedDate || '')
  const [notes, setNotes] = useState<string>(editData?.notes || '')

  // Handle prefilled suggestion
  useEffect(() => {
    if (prefilledSuggestion) {
      if (prefilledSuggestion.supplierId) {
        setSupplierId(prefilledSuggestion.supplierId)
      }
      setItems([{
        itemId: prefilledSuggestion.itemId,
        quantity: prefilledSuggestion.suggestedQuantity,
        uomId: prefilledSuggestion.uomId || '',
        unitPrice: 0,
        _tempName: prefilledSuggestion.itemName,
        _tempUomName: prefilledSuggestion.uomName
      }])
      setNotes(t('admin.inventory.po.created_from_suggestion'))
    }
  }, [prefilledSuggestion, t])

  const [supplierSearch, setSupplierSearch] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const [uomSearch, setUomSearch] = useState('')

  const { data: suppliersData, isLoading: isLoadingSuppliers } = useSuppliers({ 
    keyword: supplierSearch || undefined, 
    isActive: true, 
    size: 20 
  })
  const suppliers = suppliersData?.content || []

  const { data: itemsData, isLoading: isLoadingItems } = useInventoryItems({ 
    keyword: itemSearch || undefined, 
    isActive: true, 
    size: 20 
  })
  const inventoryItems = itemsData?.content || []

  const { data: uoms = [] } = useUoms()

  const handleAddItem = (itemId: string) => {
    if (!itemId) return
    const invItem = inventoryItems.find(i => i.id === itemId)
    if (!invItem) return
    
    if (items.some(i => i.itemId === itemId)) {
      toast.error(t('admin.inventory.po.duplicateItem', 'Mặt hàng đã có trong phiếu'))
      return
    }

    setItems([...items, {
      itemId: invItem.id,
      quantity: 1,
      uomId: invItem.baseUom?.id || '',
      unitPrice: invItem.avgCostPrice || 0,
      batchNumber: '',
      expiryDate: '',
      _tempName: invItem.name,
      _tempUomName: invItem.baseUom?.name || ''
    }])
    setSelectedItemId('') // Reset dropdown
    setItemSearch('')
  }

  const handleUpdateItem = (index: number, field: keyof IPoItemDraft, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (type === 'STANDARD' && !supplierId) {
      toast.error(t('admin.inventory.po.reqSupplier', 'Vui lòng chọn nhà cung cấp'))
      return
    }
    if (items.length === 0) {
      toast.error(t('admin.inventory.po.reqItem', 'Phải có ít nhất 1 mặt hàng'))
      return
    }

    // Expiry Date Validation
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (const item of items) {
      if (item.expiryDate) {
        const expDate = new Date(item.expiryDate)
        if (expDate < today) {
          toast.error(t('admin.inventory.po.expiryPast', `Ngày hết hạn của ${item._tempName} không được ở trong quá khứ`))
          return
        }
      }
    }

    // Auto-generate Batch Number
    const autoBatch = `LOT-${new Date().toLocaleDateString('vi-VN').replace(/\//g, '')}`
    
    const payload: IPurchaseOrderRequest = {
      type,
      supplierId: supplierId ? String(supplierId) : undefined,
      expectedDate: expectedDate || undefined,
      notes: notes || undefined,
      items: items.map(i => ({
        itemId: i.itemId,
        orderedQuantity: i.quantity,
        uomId: i.uomId,
        unitPrice: i.unitPrice,
        batchNumber: i.batchNumber || autoBatch,
        expiryDate: i.expiryDate || undefined
      }))
    }
    
    if (editData) {
      update.mutate({ id: editData.id, data: payload }, { onSuccess: () => onCancel() })
    } else {
      create.mutate(payload, { onSuccess: () => onCancel() })
    }
  }

  const totalPoAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-dim bg-surface-container/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5 text-on-surface-variant" />
          </Button>
          <h2 className="text-lg font-bold text-on-surface">{t('admin.inventory.po.createTitle', 'Lập Phiếu Nhập Kho')}</h2>
        </div>
        <Button onClick={handleSubmit} disabled={create.isPending || update.isPending} className="gap-2">
          {create.isPending || update.isPending ? t('common.saving', 'Đang lưu...') : t('admin.inventory.po.saveBtn', 'Lưu Phiếu Nhập')}
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 p-3 md:p-4 min-w-0 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3 bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
          <Select
            label={t('admin.inventory.po.typeLabel', 'Loại Nhập Kho')}
            value={type}
            onChange={(e) => setType(e.target.value as 'STANDARD'|'QUICK_GRN')}
            options={[
              { value: 'STANDARD', label: t('admin.inventory.po.typeStd', 'Nhập tiêu chuẩn (Có NCC)') },
              { value: 'QUICK_GRN', label: t('admin.inventory.po.typeQuick', 'Nhập nhanh') }
            ]}
          />
          <AsyncSelect
            label={t('admin.inventory.po.supplierLabel', 'Nhà cung cấp')}
            value={supplierId}
            onChange={(val) => setSupplierId(val)}
            onSearch={setSupplierSearch}
            isLoading={isLoadingSuppliers}
            disabled={type === 'QUICK_GRN'}
            options={suppliers.map(s => ({ value: s.id, label: s.name }))}
            placeholder={t('admin.inventory.po.selectSupplier', '-- Chọn Nhà cung cấp --')}
          />
          <Input
            type="date"
            label={t('admin.inventory.po.expectedDateLabel', 'Ngày dự kiến giao')}
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
          />
          <Input
            label={t('admin.inventory.po.notesLabel', 'Ghi chú')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('admin.inventory.po.notesPlaceholder', 'Nhập ghi chú cho phiếu...')}
          />
        </div>

        <div className="mb-3">
          <AsyncSelect
            label={t('admin.inventory.po.findItem', 'Tìm mặt hàng')}
            value={selectedItemId}
            onChange={(val) => handleAddItem(String(val))}
            onSearch={setItemSearch}
            isLoading={isLoadingItems}
            options={inventoryItems.map(i => ({ value: i.id, label: `${i.name} (${i.sku})` }))}
            placeholder={t('admin.inventory.po.selectItem', '-- Nhập từ khóa để tìm nguyên liệu --')}
          />
        </div>

        <div className="border border-slate-200 rounded-lg overflow-auto flex-1 min-h-0 min-w-0 custom-scrollbar bg-white">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-sm">
              <tr>
                <th className="px-3 py-2 font-semibold text-slate-600 bg-slate-50 w-56">{t('admin.inventory.po.colItem', 'Mặt hàng')}</th>
                <th className="px-3 py-2 font-semibold text-slate-600 bg-slate-50 w-28">{t('admin.inventory.po.colUom', 'Đơn vị')}</th>
                <th className="px-3 py-2 font-semibold text-slate-600 bg-slate-50 w-32">{t('admin.inventory.item.colBatchNumber', 'Mã Lô')}</th>
                <th className="px-3 py-2 font-semibold text-slate-600 bg-slate-50 w-36">{t('admin.inventory.item.colExpiryDate', 'Hạn sử dụng')}</th>
                <th className="px-3 py-2 font-semibold text-slate-600 bg-slate-50 w-24">{t('admin.inventory.po.colQty', 'Số lượng')}</th>
                <th className="px-3 py-2 font-semibold text-slate-600 bg-slate-50 w-32">{t('admin.inventory.po.colPrice', 'Đơn giá')}</th>
                <th className="px-3 py-2 font-semibold text-slate-600 bg-slate-50 w-32 text-right">{t('admin.inventory.po.colTotal', 'Thành tiền')}</th>
                <th className="px-3 py-2 bg-slate-50 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    {t('admin.inventory.po.emptyItems', 'Chưa thêm mặt hàng nào')}
                  </td>
                </tr>
              ) : items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 border-b border-slate-100">
                  <td className="px-3 py-1.5 font-semibold text-slate-700 text-xs max-w-[224px] truncate" title={item._tempName}>{item._tempName}</td>
                  <td className="px-3 py-1.5 w-28 max-w-[112px]">
                    <AsyncSelect
                      value={item.uomId}
                      onChange={(val) => handleUpdateItem(idx, 'uomId', val as any)}
                      onSearch={setUomSearch}
                      options={uoms.filter(u => 
                        (u.shortName || u.name).toLowerCase().includes(uomSearch.toLowerCase())
                      ).map(u => ({ value: u.id, label: u.shortName || u.name }))}
                      placeholder={t('admin.inventory.po.selectUom', 'Chọn đv')}
                      className="!py-1 !h-8 !text-xs !min-h-[32px] w-full"
                    />
                    {(() => {
                      const invItem = inventoryItems.find(i => i.id === item.itemId)
                      if (invItem && invItem.baseUom && invItem.baseUom.id !== item.uomId) {
                        return (
                          <div className="text-[9px] text-slate-400 mt-0.5 italic">
                            {t('admin.inventory.po.uomConversionNotice', '* Quy đổi về đơn vị chuẩn ({{shortName}})', { shortName: invItem.baseUom.shortName || invItem.baseUom.name })}
                          </div>
                        )
                      }
                      return null
                    })()}
                  </td>
                  <td className="px-3 py-1.5 w-32 max-w-[128px]">
                    <Input
                      value={item.batchNumber || ''}
                      onChange={(e) => handleUpdateItem(idx, 'batchNumber', e.target.value)}
                      placeholder={`${t('admin.inventory.po.autoLabel', 'Tự động')}: LOT-${new Date().toLocaleDateString('vi-VN').replace(/\//g, '')}`}
                      className="!py-1 !px-2 !text-xs !h-8 w-full"
                    />
                  </td>
                  <td className="px-3 py-1.5 w-36 max-w-[144px]">
                    <Input
                      type="date"
                      value={item.expiryDate || ''}
                      onChange={(e) => handleUpdateItem(idx, 'expiryDate' as keyof IPoItemDraft, e.target.value as never)}
                      className="!py-1 !px-2 !text-xs !h-8 w-full"
                    />
                  </td>
                  <td className="px-3 py-1.5 w-24 max-w-[96px]">
                    <NumberInput
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      min={0.01}
                      step={0.01}
                      className="!py-1 !px-2 !text-xs !h-8 w-full"
                    />
                  </td>
                  <td className="px-3 py-1.5 w-32 max-w-[128px]">
                    <NumberInput
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                      min={0}
                      step={1000}
                      className="!py-1 !px-2 !text-xs !h-8 font-mono text-right w-full"
                    />
                  </td>
                  <td className="px-3 py-1.5 text-right font-bold text-slate-800 text-xs font-mono w-32 max-w-[128px]">
                    {(item.quantity * item.unitPrice).toLocaleString()}
                  </td>
                  <td className="px-3 py-1.5 text-center w-12 max-w-[48px]">
                    <Button variant="danger" size="icon" onClick={() => handleRemoveItem(idx)} className="!size-7">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200">
              <tr>
                <td colSpan={6} className="px-3 py-2 text-right font-bold uppercase text-[11px] text-slate-500">
                  {t('admin.inventory.po.total', 'Tổng cộng')}
                </td>
                <td className="px-3 py-2 text-right font-bold text-sm text-primary font-mono">
                  {totalPoAmount.toLocaleString()} {t('common.currency', 'đ')}
                </td>
                <td className="px-3 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
