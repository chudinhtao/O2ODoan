import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'
import { Select } from '@/shared/components/ui/Select'
import { inventoryService } from '../services/inventory.service'
import { useInventoryItems, useLocations } from '../hooks/useInventoryQueries'
import { getSuccessMessage } from '@/shared/utils/apiResponse'

export default function WasteModal({ isOpen, onClose, prefilledItem }: { 
  isOpen: boolean; 
  onClose: () => void;
  prefilledItem?: { itemId: string, name: string } | null
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [itemSearch, setItemSearch] = useState('')
  const { data: itemsData, isLoading: isLoadingItems } = useInventoryItems({ 
    keyword: itemSearch || undefined, 
    isActive: true, 
    size: 20 
  })
  const allItems = itemsData?.content ?? []

  const [itemId, setItemId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [lotNumber, setLotNumber] = useState('')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  const { data: locationsData, isLoading: isLoadingLocations } = useLocations()
  const locations = locationsData || []

  useEffect(() => {
    if (prefilledItem) {
      setItemId(prefilledItem.itemId)
      setItemSearch(prefilledItem.name)
    } else {
      setItemId('')
      setItemSearch('')
    }
  }, [prefilledItem, isOpen])

  const mutation = useMutation({
    mutationFn: () => inventoryService.createWasteTransaction({
      itemId,
      locationId: locationId || undefined,
      lotNumber: lotNumber || undefined,
      quantityChange: Number(quantity), // Backend will negate it
      reason
    }),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.inventory.notifications.updateSuccess')))
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] })
      onClose()
      setItemId('')
      setLocationId('')
      setLotNumber('')
      setQuantity('')
      setReason('')
      setItemSearch('')
    }
  })

  if (!isOpen) return null

  const selectedItem = allItems.find(i => i.id === itemId)
  
  const itemOptions = allItems.map(item => ({
    value: item.id,
    label: `${item.name} (${item.sku || 'N/A'}) - ${t('admin.inventory.waste.currentStock', 'Tồn')}: ${item.currentStock} ${item.baseUom?.shortName}`
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col justify-between overflow-visible animate-in fade-in zoom-in-95 duration-200">
        <div className="py-4 px-5 border-b border-slate-100 font-bold text-sm text-red-600 flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> {t('admin.inventory.waste.title', 'Xuất Hủy Nguyên Liệu')}
        </div>
        <div className="p-5 space-y-4 flex-grow">
          <div className="relative z-20">
            <label className="block text-xs font-bold text-slate-600 ml-0.5 mb-1">
              {t('admin.inventory.waste.material', 'Nguyên liệu')} <span className="text-red-500">*</span>
            </label>
            <AsyncSelect
              value={itemId}
              onChange={val => setItemId(val as string)}
              onSearch={setItemSearch}
              isLoading={isLoadingItems}
              options={itemOptions}
              placeholder={t('admin.inventory.waste.selectMaterial', '-- Chọn nguyên liệu --')}
            />
          </div>
          <div className="relative z-10">
            <label className="block text-xs font-bold text-slate-600 ml-0.5 mb-1">
              {t('admin.inventory.waste.location', 'Kho xuất hủy')} <span className="text-red-500">*</span>
            </label>
            <AsyncSelect
              value={locationId}
              onChange={val => {
                setLocationId(val as string)
                setLotNumber('') // reset lot when location changes
              }}
              onSearch={() => {}}
              isLoading={isLoadingLocations}
              options={locations.map((l: any) => ({ value: l.id, label: l.name }))}
              placeholder={t('admin.inventory.waste.selectLocation', '-- Chọn khu vực lưu trữ --')}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 ml-0.5 mb-1 block">
              {t('admin.inventory.waste.lotNumber', 'Mã lô (Tùy chọn)')}
            </label>
            <Select
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              disabled={!locationId || !itemId}
              options={[
                { value: '', label: t('admin.inventory.waste.autoFefo', 'Tự động trừ theo FEFO') },
                ...(selectedItem?.batches
                  ?.filter(b => {
                    const isLocMatch = !b.locationId || String(b.locationId).toLowerCase() === String(locationId).toLowerCase()
                    return isLocMatch && Number(b.currentStock) > 0
                  })
                  .map(b => ({
                    value: b.lotNumber,
                    label: `${b.lotNumber} (${t('admin.inventory.waste.stockPrefix', 'Tồn:')} ${b.currentStock}${String(b.locationId).toLowerCase() !== String(locationId).toLowerCase() ? ` - ${b.locationName || 'Kho HT'}` : ''})`
                  })) || [])
              ]}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 ml-0.5 mb-1 block">{t('admin.inventory.waste.quantity', 'Số lượng hủy')} <span className="text-red-500">*</span></label>
            <div className="relative">
              <NumberInput
                min={0}
                step={0.01}
                max={selectedItem?.currentStock ?? undefined}
                value={quantity}
                onChange={(e: any) => setQuantity(e.target.value)}
                placeholder="0.00"
              />
              {selectedItem && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  {selectedItem.baseUom?.shortName}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 ml-0.5 mb-1">
              {t('admin.inventory.waste.reason', 'Lý do xuất hủy')} <span className="text-red-500">*</span>
            </label>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t('admin.inventory.waste.reasonPlaceholder', 'Ví dụ: Bể vỡ, hết hạn, ẩm mốc...')}
            />
          </div>
        </div>
        <div className="py-3.5 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending} className="!rounded-xl font-bold">{t('common.cancel', 'Hủy')}</Button>
          <Button 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending || !itemId || !locationId || !quantity || Number(quantity) <= 0 || !reason.trim()}
            variant="danger"
            className="!rounded-xl font-bold gap-2"
          >
            {mutation.isPending ? t('common.loading', 'Đang xử lý...') : <><Trash2 className="w-4 h-4" /> {t('admin.inventory.waste.confirm', 'Xác nhận hủy')}</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
