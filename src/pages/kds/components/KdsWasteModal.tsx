import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'
import { Select } from '@/shared/components/ui/Select'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { Input } from '@/shared/components/ui/Input'
import { inventoryService } from '@/pages/admin/inventory/services/inventory.service'
import { IInventoryItem } from '@/pages/admin/inventory/types/inventory.type'
import { useLocations } from '@/pages/admin/inventory/hooks/useInventoryQueries'

interface KdsWasteModalProps {
  onClose: () => void
}

export const KdsWasteModal = ({ onClose }: KdsWasteModalProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [itemId, setItemId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [lotNumber, setLotNumber] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState('')
  const [search, setSearch] = useState('')
  const [locationSearch, setLocationSearch] = useState('')

  const { data: locationsData, isLoading: isLoadingLocations } = useLocations()
  const locations = locationsData || []
  const filteredLocations = locations.filter((l: any) => 
    l.name?.toLowerCase().includes(locationSearch.toLowerCase())
  )

  const { data: items = [] as IInventoryItem[], isLoading } = useQuery({
    queryKey: ['kds', 'inventory', 'raw_items', search],
    queryFn: async () => {
      // Chỉ lấy nguyên liệu thô để bếp báo hỏng, giới hạn size: 20 và tìm kiếm
      const res = await inventoryService.getItems({ keyword: search || undefined, isActive: true, size: 20, type: 'RAW' })
      return res.content || []
    }
  })

  const wasteMutation = useMutation({
    mutationFn: () => inventoryService.createWasteTransaction({
      itemId,
      locationId: locationId || undefined,
      lotNumber: lotNumber || undefined,
      quantityChange: -Math.abs(quantity), // Bắt buộc gửi số âm
      reason
    }),
    onSuccess: () => {
      toast.success(t('kds.waste.success', 'Đã ghi nhận trừ kho do hao hụt'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'transactions'] })
      onClose()
    }
  })

  const handleSubmit = () => {
    if (!itemId) {
      toast.error(t('kds.waste.reqItem', 'Vui lòng chọn nguyên liệu'))
      return
    }
    if (!locationId) {
      toast.error(t('kds.waste.reqLocation', 'Vui lòng chọn khu vực lưu trữ/bếp'))
      return
    }
    if (!reason.trim()) {
      toast.error(t('kds.waste.reqReason', 'Vui lòng nhập lý do (Rớt, Cháy...)'))
      return
    }
    wasteMutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-visible animate-in zoom-in-95 border border-slate-700 text-slate-100">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 text-red-500 rounded-xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">{t('kds.waste.title', 'Báo Hỏng / Rớt')}</h2>
              <p className="text-sm text-slate-400">{t('kds.waste.subtitle', 'Trừ trực tiếp vào thẻ kho')}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">{t('kds.waste.itemLabel', 'Nguyên liệu')}</label>
            <AsyncSelect
              value={itemId}
              onChange={(val) => setItemId(String(val))}
              onSearch={setSearch}
              isLoading={isLoading}
              options={items.map(i => ({ value: i.id, label: `${i.name} (${i.sku}) - ${i.baseUom?.name || ''}` }))}
              placeholder={t('kds.waste.selectItem', '-- Chọn nguyên liệu bị hỏng --')}
              className="!bg-slate-800 !border-slate-700 !text-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5 z-10">
            <label className="text-sm font-semibold text-slate-300">{t('kds.waste.locationLabel', 'Khu vực lưu trữ / Bếp')}</label>
            <AsyncSelect
              value={locationId}
              onChange={(val) => {
                setLocationId(String(val))
                setLotNumber('') // reset lot
              }}
              onSearch={setLocationSearch}
              isLoading={isLoadingLocations}
              options={filteredLocations.map((l: any) => ({ value: l.id, label: l.name }))}
              placeholder={t('kds.waste.selectLocation', '-- Chọn vị trí --')}
              className="!bg-slate-800 !border-slate-700 !text-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">{t('kds.waste.lotLabel', 'Mã lô (Tùy chọn)')}</label>
            <Select
              value={lotNumber}
              onChange={(e) => setLotNumber(e.target.value)}
              disabled={!locationId || !itemId}
              className="!bg-slate-800 !border-slate-700 !text-slate-100 [&_button]:!bg-slate-800 [&_button]:!text-slate-100"
              options={[
                { value: '', label: t('kds.waste.autoFefo', 'Tự động trừ theo FEFO') },
                ...(items.find(i => i.id === itemId)?.batches
                  ?.filter(b => {
                    const isLocMatch = !b.locationId || String(b.locationId).toLowerCase() === String(locationId).toLowerCase()
                    return isLocMatch && Number(b.currentStock) > 0
                  })
                  .map(b => ({
                    value: b.lotNumber,
                    label: `${b.lotNumber} (${t('kds.waste.stockPrefix', 'Tồn:')} ${b.currentStock}${String(b.locationId).toLowerCase() !== String(locationId).toLowerCase() ? ` - ${b.locationName || 'Kho HT'}` : ''})`
                  })) || [])
              ]}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">{t('kds.waste.qtyLabel', 'Số lượng hỏng/rớt')}</label>
            <NumberInput
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={0.01}
              step={0.01}
              className="bg-slate-800 border-slate-700 text-slate-100 font-bold text-lg"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-300">{t('kds.waste.reasonLabel', 'Lý do')}</label>
            <Input
              placeholder={t('kds.waste.reasonPlaceholder', 'VD: Vô tình làm rớt, Cháy khét...')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
          <Button variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-slate-800">
            {t('common.cancel', 'Hủy')}
          </Button>
          <Button variant="danger" onClick={handleSubmit} disabled={wasteMutation.isPending} className="px-6">
            {wasteMutation.isPending ? t('common.saving', 'Đang xử lý...') : t('kds.waste.submitBtn', 'Xác nhận Báo Hỏng')}
          </Button>
        </div>
      </div>
    </div>
  )
}
