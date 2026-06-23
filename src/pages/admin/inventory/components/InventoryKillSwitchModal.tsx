import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { inventoryService } from '../services/inventory.service'
import { IInventoryItem } from '../types/inventory.type'
import { getSuccessMessage } from '@/shared/utils/apiResponse'

export default function InventoryKillSwitchModal({ 
  isOpen, 
  onClose, 
  item,
  mode
}: { 
  isOpen: boolean; 
  onClose: () => void;
  item: IInventoryItem | null;
  mode: 'lock' | 'unlock';
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (isOpen) {
      setQuantity('')
      setReason(mode === 'lock' ? t('admin.inventory.killSwitch.defaultLockReason', 'Báo hết khẩn cấp') : t('admin.inventory.killSwitch.defaultUnlockReason', 'Có hàng trở lại'))
    }
  }, [isOpen, mode, t])

  const mutation = useMutation({
    mutationFn: () => {
      if (!item) throw new Error("Item is required")
      if (mode === 'lock') {
        return inventoryService.killSwitch(item.id, reason)
      } else {
        return inventoryService.restoreStock(item.id, Number(quantity), reason)
      }
    },
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.inventory.notifications.updateSuccess')))
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] })
      queryClient.invalidateQueries({ queryKey: ['kds', 'menu', 'items'] }) // Invalidate KDS menu items too
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('admin.inventory.killSwitch.errorMsg', 'Có lỗi xảy ra'))
    }
  })

  if (!isOpen || !item) return null

  const isLock = mode === 'lock'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col justify-between overflow-visible animate-in fade-in zoom-in-95 duration-200">
        <div className={`py-4 px-5 border-b border-slate-100 font-bold text-sm flex items-center gap-2 ${isLock ? 'text-orange-600' : 'text-emerald-600'}`}>
          {isLock ? <AlertTriangle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
          {isLock 
            ? t('admin.inventory.killSwitch.lockTitle', 'Báo Hết Khẩn Cấp')
            : t('admin.inventory.killSwitch.unlockTitle', 'Mở Lại Nguyên Liệu')}
        </div>
        
        <div className="p-5 space-y-4 flex-grow">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm font-medium text-slate-700">{t('admin.inventory.killSwitch.itemName', 'Nguyên liệu:')}</p>
            <p className="font-bold text-lg text-slate-900">{item.name}</p>
            {isLock && (
              <p className="text-xs text-orange-600 mt-2 font-medium">
                {t('admin.inventory.killSwitch.lockWarning', 'Cảnh báo: Hành động này sẽ đưa tồn kho về 0 và TẨY ẨN tất cả món ăn sử dụng nguyên liệu này trên Menu.')}
              </p>
            )}
            {!isLock && (
              <p className="text-xs text-emerald-600 mt-2 font-medium">
                {t('admin.inventory.killSwitch.unlockWarning', 'Mở lại nguyên liệu sẽ tự động cho phép hiển thị lại các món ăn trên Menu.')}
              </p>
            )}
          </div>

          {!isLock && (
            <div>
              <label className="text-xs font-bold text-slate-600 ml-0.5 mb-1 block">
                {t('admin.inventory.killSwitch.quantity', 'Số lượng hiện có')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <NumberInput
                  min={0.01}
                  step={0.01}
                  value={quantity}
                  onChange={(e: any) => setQuantity(e.target.value)}
                  placeholder="Nhập số lượng thực tế..."
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  {item.baseUom?.shortName}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 ml-0.5 mb-1">
              {t('admin.inventory.killSwitch.reason', 'Lý do')} <span className="text-red-500">*</span>
            </label>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder={t('admin.inventory.killSwitch.reasonPlaceholder', 'Nhập lý do thao tác...')}
            />
          </div>
        </div>

        <div className="py-3.5 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 rounded-b-2xl">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending} className="!rounded-xl font-bold">
            {t('common.cancel', 'Hủy')}
          </Button>
          <Button 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending || (!isLock && (!quantity || Number(quantity) <= 0)) || !reason.trim()}
            variant={isLock ? 'danger' : 'primary'}
            className={`!rounded-xl font-bold gap-2 ${isLock ? '!bg-orange-500 hover:!bg-orange-600 !text-white border-none' : ''}`}
          >
            {mutation.isPending 
              ? t('common.loading', 'Đang xử lý...') 
              : isLock 
                ? <><AlertTriangle className="w-4 h-4" /> {t('admin.inventory.killSwitch.confirmLock', 'Xác Nhận Báo Hết')}</>
                : <><RefreshCw className="w-4 h-4" /> {t('admin.inventory.killSwitch.confirmUnlock', 'Xác Nhận Mở Lại')}</>
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
