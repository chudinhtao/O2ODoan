import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, PackageCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { Select } from '@/shared/components/ui/Select'
import { getSuccessMessage } from '@/shared/utils/apiResponse'
import { inventoryService } from '../../services/inventory.service'
import { useLocations } from '../../hooks/useInventoryQueries'
import { IPurchaseOrder, IGoodsReceiptRequest } from '../../types/inventory.type'

interface GoodsReceiptModalProps {
  po: IPurchaseOrder
  onClose: () => void
}

export default function GoodsReceiptModal({ po, onClose }: GoodsReceiptModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [receiptQtys, setReceiptQtys] = useState<Record<string, number>>(
    Object.fromEntries(po.items.map((item) => [item.id, 0]))
  )
  const [locationIds, setLocationIds] = useState<Record<string, string>>({})

  const { data: locations } = useLocations()
  const locationOptions = locations?.filter(l => l.active).map(l => ({ value: l.id, label: l.name })) || []

  const receiveMutation = useMutation({
    mutationFn: (payload: IGoodsReceiptRequest) => inventoryService.receivePurchaseOrder(po.id, payload),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.inventory.po.receiveSuccess', 'Nhận hàng thành công!')))
      queryClient.invalidateQueries({ queryKey: ['inventory', 'purchase-orders'] })
      onClose()
    },
  })

  const handleSave = () => {
    const lines = po.items
      .filter((item) => (receiptQtys[item.id] ?? 0) > 0)
      .map((item) => ({
        poItemId: item.id,
        receivedQuantity: receiptQtys[item.id],
        locationId: locationIds[item.id] || undefined
      }))

    if (lines.length === 0) {
      toast.error(t('admin.inventory.po.receiveEmptyError', 'Vui lòng nhập số lượng thực nhận cho ít nhất 1 mặt hàng'))
      return
    }
    
    // Check if any received line is missing a location
    const missingLocation = lines.some(line => !line.locationId)
    if (missingLocation) {
      toast.error(t('admin.inventory.po.missingLocationError', 'Vui lòng chọn kho nhập cho các mặt hàng được nhận'))
      return
    }

    receiveMutation.mutate({ items: lines })
  }

  const totalReceiving = po.items.reduce(
    (sum, item) => sum + (receiptQtys[item.id] ?? 0) * (item.unitPrice ?? 0),
    0
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <PackageCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {t('admin.inventory.po.receiveTitle', 'Nhận Hàng')}
              </h2>
              <p className="text-xs text-slate-500">{po.poNumber} · {po.supplierName ?? '—'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        {/* Items Table */}
        <div className="flex-1 overflow-auto p-4 pb-40">
          <p className="text-xs text-slate-500 mb-3">
            {t('admin.inventory.po.receiveHint', 'Nhập số lượng thực tế nhận được từ nhà cung cấp cho lần giao này.')}
          </p>
          <div className="border border-slate-200 rounded-xl overflow-visible min-w-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs">{t('admin.inventory.po.colItem')}</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-xs">{t('admin.inventory.po.colOrdered', 'Đặt')}</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-xs">{t('admin.inventory.po.colReceived', 'Đã nhận')}</th>
                  <th className="text-right px-4 py-2.5 font-semibold text-slate-600 text-xs w-32">{t('admin.inventory.po.colRemaining', 'Còn thiếu')}</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-xs w-48">{t('admin.inventory.location.name', 'Kho nhận hàng')}</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-600 text-xs w-36">
                    <span className="text-emerald-600">✦ {t('admin.inventory.po.colReceivingNow', 'SL Nhận lần này')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {po.items.map((item) => {
                  const remaining = item.remainingQuantity ?? 0
                  const isFullyReceived = remaining === 0
                  return (
                    <tr key={item.id} className={isFullyReceived ? 'opacity-40' : 'hover:bg-slate-50/50'}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.itemName}</div>
                        <div className="text-xs text-slate-400">{item.uomName}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">{item.orderedQuantity}</td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">{item.receivedQuantity}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={remaining === 0 ? 'text-slate-400' : 'text-orange-500 font-bold'}>
                          {remaining}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={locationIds[item.id] || ''}
                          onChange={(e) => setLocationIds(prev => ({ ...prev, [item.id]: e.target.value }))}
                          options={[{value: '', label: '-- Chọn kho --'}, ...locationOptions]}
                          disabled={isFullyReceived || (receiptQtys[item.id] ?? 0) === 0}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <NumberInput
                          value={receiptQtys[item.id] ?? 0}
                          onChange={(e) =>
                            setReceiptQtys((prev) => ({ ...prev, [item.id]: Math.min(Number(e.target.value), remaining) }))
                          }
                          min={0}
                          max={remaining}
                          step={0.01}
                          disabled={isFullyReceived}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-sm text-slate-600">
            {t('admin.inventory.po.receivingValue', 'Giá trị nhận lần này')}:
            <span className="font-bold text-slate-800 ml-2">{totalReceiving.toLocaleString()} {t('common.currency', 'đ')}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} disabled={receiveMutation.isPending} className="gap-2">
              <PackageCheck className="w-4 h-4" />
              {receiveMutation.isPending ? t('common.saving', 'Đang lưu...') : t('admin.inventory.po.confirmReceive', 'Xác nhận Nhận hàng')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
