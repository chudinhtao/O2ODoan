import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'
import { Select } from '@/shared/components/ui/Select'
import { useInventoryItems, useLocations } from '../hooks/useInventoryQueries'
import { useQuickGrnMutation } from '../hooks/useInventoryMutations'

export default function QuickGrnModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const [itemSearch, setItemSearch] = useState('')
  
  const { data: itemsData, isLoading: isLoadingItems } = useInventoryItems({ 
    keyword: itemSearch || undefined, 
    isActive: true, 
    size: 20 
  })
  const allItems = itemsData?.content ?? []

  const [itemId, setItemId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [note, setNote] = useState('')
  const [lotNumber, setLotNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [locationId, setLocationId] = useState('')

  const { data: locations } = useLocations()
  const locationOptions = locations?.filter(l => l.active).map(l => ({ value: l.id, label: l.name })) || []

  const mutation = useQuickGrnMutation()

  if (!isOpen) return null

  const handleConfirm = () => {
    // Expiry Date Validation
    if (expiryDate) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (new Date(expiryDate) < today) {
        toast.error(t('admin.inventory.po.expiryPast', 'Ngày hết hạn không được ở trong quá khứ'))
        return
      }
    }

    mutation.mutate({
      itemId,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      note: note || undefined,
      lotNumber: lotNumber || undefined,
      expiryDate: expiryDate || undefined,
      locationId: locationId
    }, {
      onSuccess: () => {
        onClose()
        setItemId('')
        setQuantity('')
        setUnitPrice('')
        setNote('')
        setLotNumber('')
        setExpiryDate('')
      }
    })
  }

  const selectedItem = allItems.find(i => i.id === itemId)
  const itemOptions = allItems.map(item => ({
    value: item.id,
    label: `${item.name} (${item.sku || 'N/A'})`
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl min-h-[580px] flex flex-col justify-between overflow-hidden">
        <div className="py-5 px-6 border-b border-slate-100 font-bold text-base text-slate-800">
          {t('admin.inventory.quickGrn.title', 'Nhập Hàng Nhanh (Quick GRN)')}
        </div>
        <div className="p-6 space-y-7 flex-grow">
          <div className="grid grid-cols-2 gap-4">
            <div className="z-20 relative">
              <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1.5">
                {t('admin.inventory.quickGrn.material', 'Nguyên liệu')} <span className="text-red-500">*</span>
              </label>
              <AsyncSelect
                value={itemId}
                onChange={(val) => setItemId(String(val))}
                onSearch={setItemSearch}
                isLoading={isLoadingItems}
                options={itemOptions}
                placeholder={t('admin.inventory.quickGrn.selectMaterial', '-- Chọn nguyên liệu --')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1.5">
                {t('admin.inventory.location.name', 'Kho nhận hàng')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                options={[{value: '', label: '-- Chọn kho --'}, ...locationOptions]}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">{t('admin.inventory.quickGrn.quantity', 'Số lượng')} <span className="text-red-500">*</span></label>
              <div className="relative">
                <NumberInput
                  min={0}
                  step={0.01}
                  value={quantity}
                  onChange={(e: any) => setQuantity(e.target.value)}
                  placeholder="0.00"
                />
                {selectedItem && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                    {selectedItem.baseUom?.shortName}
                  </div>
                )}
              </div>
            </div>
            <NumberInput
              min={0}
              label={t('admin.inventory.quickGrn.unitPrice', 'Giá nhập / đơn vị')}
              value={unitPrice}
              onChange={(e: any) => setUnitPrice(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('admin.inventory.item.colBatchNumber', 'Mã Lô')}
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              placeholder={t('admin.inventory.quickGrn.batchPlaceholderAuto', 'Tự động phát sinh')}
            />
            <Input
              type="date"
              label={t('admin.inventory.item.colExpiryDate', 'Hạn sử dụng')}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>
          <Input
            label={t('admin.inventory.quickGrn.noteLabel', 'Ghi chú (Tên NCC, Lô...)')}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t('admin.inventory.quickGrn.notePlaceholder', 'Mua ở chợ...')}
          />
        </div>
        <div className="py-5 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>{t('common.cancel', 'Hủy')}</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={mutation.isPending || !itemId || !quantity || Number(quantity) <= 0 || !locationId}
            className="gap-2"
          >
            {mutation.isPending ? t('common.loading', 'Đang xử lý...') : <><Plus className="w-4 h-4" /> {t('admin.inventory.quickGrn.confirm', 'Xác nhận nhập')}</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
