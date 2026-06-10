import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { Select } from '@/shared/components/ui/Select'
import { inventoryService } from '../../admin/inventory/services/inventory.service'
import { IPurchaseOrderRequest } from '../../admin/inventory/types/inventory.type'
import { useLocations } from '../../admin/inventory/hooks/useInventoryQueries'

interface QuickGrnModalProps {
  onClose: () => void
}

interface IPoItemDraft {
  itemId: string
  quantity: number
  uomId: string
  unitPrice: number
  _tempName: string
  _tempUomName: string
}

export default function QuickGrnModal({ onClose }: QuickGrnModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [items, setItems] = useState<IPoItemDraft[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | number>('')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [locationId, setLocationId] = useState('')

  const { data: locations } = useLocations()
  const locationOptions = locations?.filter(l => l.active).map(l => ({ value: l.id, label: l.name })) || []

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['pos', 'inventory', 'items', searchKeyword],
    queryFn: async () => {
      const res = await inventoryService.getItems({ 
        isActive: true, 
        keyword: searchKeyword || undefined, 
        size: 50 
      })
      return res.content || []
    }
  })

  const createMutation = useMutation({
    mutationFn: (payload: IPurchaseOrderRequest) => inventoryService.createPurchaseOrder(payload),
    onSuccess: () => {
      toast.success(t('pos.inventory.quickGrnSuccess', 'Đã nhập kho nhanh thành công'))
      queryClient.invalidateQueries({ queryKey: ['inventory', 'purchase-orders'] })
      onClose()
    }
  })

  const handleAddItem = (itemId: string) => {
    if (!itemId) return
    const invItem = inventoryItems.find(i => i.id === itemId)
    if (!invItem) return
    
    if (items.some(i => i.itemId === itemId)) {
      toast.error(t('pos.inventory.duplicateItem', 'Mặt hàng đã có trong danh sách'))
      return
    }

    setItems([...items, {
      itemId: invItem.id,
      quantity: 1,
      uomId: invItem.baseUom?.id || '',
      unitPrice: invItem.avgCostPrice || 0,
      _tempName: invItem.name,
      _tempUomName: invItem.baseUom?.name || ''
    }])
    setSelectedItemId('') // Reset
  }

  const handleUpdateItem = (index: number, field: keyof IPoItemDraft, value: number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error(t('pos.inventory.reqItem', 'Phải có ít nhất 1 mặt hàng'))
      return
    }
    
    createMutation.mutate({
      type: 'QUICK_GRN',
      locationId: locationId,
      items: items.map(i => ({
        itemId: i.itemId,
        orderedQuantity: i.quantity,
        uomId: i.uomId,
        unitPrice: i.unitPrice
      }))
    })
  }

  const totalPoAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-surface-dim bg-surface-container/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <span className="material-symbols-outlined text-2xl block">inventory_2</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">{t('pos.inventory.quickGrnTitle', 'Nhập Kho Nhanh')}</h2>
              <p className="text-sm text-on-surface-variant">{t('pos.inventory.quickGrnSubtitle', 'Thu ngân bổ sung hàng mua lặt vặt khẩn cấp')}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-6 h-6 text-on-surface-variant" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-5 md:p-8 min-w-0">
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1.5">
                {t('pos.inventory.location', 'Kho nhận hàng')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                options={[{value: '', label: t('pos.inventory.selectLocation', '-- Chọn kho --')}, ...locationOptions]}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 ml-1 mb-1.5">
                {t('pos.inventory.findItem', 'Tìm kiếm mặt hàng')}
              </label>
              <AsyncSelect
                value={selectedItemId}
                onChange={(val) => {
                  handleAddItem(String(val))
                  setSelectedItemId('')
                  setSearchKeyword('')
                }}
                onSearch={setSearchKeyword}
                placeholder={t('pos.inventory.selectItem', '-- Nhập mã vạch hoặc chọn nguyên liệu --')}
                options={inventoryItems.map(i => ({ value: i.id, label: `${i.name} (${i.sku})` }))}
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="border border-surface-dim rounded-xl overflow-x-auto min-w-0 bg-white">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-container/50 border-b border-surface-dim">
                <tr>
                  <th className="px-5 py-4 font-semibold">{t('pos.inventory.colItem', 'Mặt hàng')}</th>
                  <th className="px-5 py-4 font-semibold w-24">{t('pos.inventory.colUom', 'Đơn vị')}</th>
                  <th className="px-5 py-4 font-semibold w-32">{t('pos.inventory.colQty', 'Số lượng')}</th>
                  <th className="px-5 py-4 font-semibold w-40">{t('pos.inventory.colPrice', 'Đơn giá')}</th>
                  <th className="px-5 py-4 font-semibold w-40 text-right">{t('pos.inventory.colTotal', 'Thành tiền')}</th>
                  <th className="px-5 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-dim">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">shopping_cart</span>
                      {t('pos.inventory.emptyItems', 'Chưa có mặt hàng nào. Vui lòng tìm kiếm phía trên.')}
                    </td>
                  </tr>
                ) : items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-container/20">
                    <td className="px-5 py-3 font-semibold text-base">{item._tempName}</td>
                    <td className="px-5 py-3 text-on-surface-variant">{item._tempUomName}</td>
                    <td className="px-5 py-3">
                      <NumberInput
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                        min={0.01}
                        step={0.01}
                        className="text-lg font-medium text-center h-10"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <NumberInput
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                        min={0}
                        step={1000}
                        className="text-lg font-medium text-right h-10"
                      />
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-lg text-primary">
                      {(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Button variant="danger" size="icon" onClick={() => handleRemoveItem(idx)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 md:px-6 border-t border-surface-dim bg-surface-container/30 flex items-center justify-between mt-auto">
          <div>
            <div className="text-xs font-semibold text-on-surface-variant uppercase">{t('pos.inventory.total', 'Tổng tiền cần thanh toán')}</div>
            <div className="text-xl sm:text-2xl font-black text-primary">{totalPoAmount.toLocaleString()} VNĐ</div>
          </div>
          <Button 
            onClick={handleSubmit} 
            disabled={createMutation.isPending || items.length === 0 || !locationId} 
            size="default"
            className="gap-2 px-6"
          >
            {createMutation.isPending ? t('common.saving', 'Đang xử lý...') : t('pos.inventory.confirmBtn', 'Xác nhận Nhập Kho')}
          </Button>
        </div>

      </div>
    </div>
  )
}
