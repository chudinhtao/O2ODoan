import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Check, X, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { Input } from '@/shared/components/ui/Input'
import { inventoryService } from '../../services/inventory.service'
import { IStocktakeItemUpdateRequest } from '../../types/inventory.type'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useStocktakeMutations } from '../../hooks/useInventoryMutations'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'

interface StocktakeCountFormProps {
  stocktakeId: string
  onBack: () => void
}

export default function StocktakeCountForm({ stocktakeId, onBack }: StocktakeCountFormProps) {
  const { t } = useTranslation()
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmFinalize, setConfirmFinalize] = useState(false)
  
  const { updateItems, finalize, cancel } = useStocktakeMutations()

  const { data: st, isLoading } = useQuery({
    queryKey: QUERY_KEYS.inventory.stocktake(stocktakeId),
    queryFn: async () => {
      return await inventoryService.getStocktake(stocktakeId)
    }
  })

  useEffect(() => {
    if (st && st.items) {
      const initCounts: Record<string, number> = {}
      const initReasons: Record<string, string> = {}
      st.items.forEach(item => {
        initCounts[item.id] = item.countedQuantity ?? item.systemQuantity ?? 0
        initReasons[item.id] = item.adjustmentReason || ''
      })
      setCounts(initCounts)
      setReasons(initReasons)
    }
  }, [st])

  const handleSaveDraft = () => {
    if (!st) return
    const updates: IStocktakeItemUpdateRequest[] = st.items.map(i => ({
      id: i.id,
      countedQuantity: counts[i.id] || 0,
      adjustmentReason: reasons[i.id] || undefined
    }))
    updateItems.mutate({ id: st.id, items: updates })
  }

  const handleFinalize = async () => {
    if (!st) return
    
    // Validate adjustment reason
    const invalidItems = st.items.filter(i => {
      const sysQty = i.systemQuantity || 0;
      const countQty = counts[i.id] || 0;
      const diff = countQty - sysQty;
      return diff !== 0 && !reasons[i.id]?.trim();
    });
    
    if (invalidItems.length > 0) {
      toast.error(t('admin.inventory.stocktake.reqReason', 'Vui lòng nhập lý do điều chỉnh cho các mặt hàng bị lệch.'));
      return;
    }

    const updates: IStocktakeItemUpdateRequest[] = st.items.map(i => ({
      id: i.id,
      countedQuantity: counts[i.id] || 0,
      adjustmentReason: reasons[i.id] || undefined
    }))

    try {
      await updateItems.mutateAsync({ id: st.id, items: updates })
      await finalize.mutateAsync(st.id)
      onBack()
    } catch (error) {
      // Error handled by mutations/interceptor
    }
  }

  const handleCancel = () => {
    cancel.mutate(stocktakeId, {
      onSuccess: () => onBack()
    })
  }

  if (isLoading) return <div className="h-full flex items-center justify-center">{t('common.loading', 'Đang tải...')}</div>
  if (!st) return null

  const isCompleted = st.status === 'COMPLETED' || st.status === 'CANCELLED'

  const sortedItems = [...st.items].sort((a, b) => {
    const nameDiff = (a.itemName || '').localeCompare(b.itemName || '')
    if (nameDiff !== 0) return nameDiff
    
    // Sort by Expiry Date (null/undefined comes last)
    if (!a.expiryDate && b.expiryDate) return 1
    if (a.expiryDate && !b.expiryDate) return -1
    if (a.expiryDate && b.expiryDate) return a.expiryDate.localeCompare(b.expiryDate)
    
    // Fallback to Lot Number
    return (a.lotNumber || '').localeCompare(b.lotNumber || '')
  })

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-surface-dim overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-surface-dim bg-surface-container/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="w-5 h-5 text-on-surface-variant" />
          </Button>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-on-surface truncate">
              {t('admin.inventory.stocktake.idTitle', 'Phiếu Kiểm Kê:')} ST-{st.id.substring(0, 8).toUpperCase()}
            </h2>
            <div className="text-sm text-on-surface-variant truncate">
              {t('common.createdAt', 'Ngày tạo')}: {new Date(st.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
        
        {!isCompleted && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmCancel(true)}
              disabled={updateItems.isPending || finalize.isPending || cancel.isPending}
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              {t('admin.inventory.stocktake.cancelBtn', 'Hủy Phiếu')}
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={updateItems.isPending || finalize.isPending || cancel.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" /> {t('common.saveDraft', 'Lưu nháp')}
            </Button>
            <Button
              onClick={() => setConfirmFinalize(true)}
              disabled={updateItems.isPending || finalize.isPending || cancel.isPending}
              className="gap-2"
            >
              <Check className="w-4 h-4" /> {t('admin.inventory.stocktake.finalizeBtn', 'Chốt Kiểm Kê')}
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmDialog
        isOpen={confirmCancel}
        title={t('admin.inventory.stocktake.confirmCancelTitle', 'Hủy phiếu kiểm kê')}
        description={t('admin.inventory.stocktake.confirmCancel', 'Bạn có chắc chắn muốn hủy phiếu kiểm kê này không?')}
        onConfirm={() => {
          setConfirmCancel(false)
          handleCancel()
        }}
        onCancel={() => setConfirmCancel(false)}
        variant="danger"
        isLoading={cancel.isPending}
      />

      <ConfirmDialog
        isOpen={confirmFinalize}
        title={t('admin.inventory.stocktake.confirmFinalizeTitle', 'Chốt sổ kiểm kê')}
        description={t('admin.inventory.stocktake.confirmFinalize', 'Chốt sổ sẽ áp dụng số lượng mới lên tồn kho thực tế. Bạn có chắc chắn?')}
        onConfirm={() => {
          setConfirmFinalize(false)
          handleFinalize()
        }}
        onCancel={() => setConfirmFinalize(false)}
        variant="warning"
        isLoading={finalize.isPending || updateItems.isPending}
      />

      <div className="flex-1 overflow-auto p-4 min-w-0 scrollbar-thin">
        <div className="border border-surface-dim rounded-lg overflow-x-auto min-w-0">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-container/50 border-b border-surface-dim">
              <tr>
                <th className="px-4 py-3 font-semibold text-on-surface">{t('admin.inventory.stocktake.colItem', 'Mặt hàng')}</th>
                <th className="px-4 py-3 font-semibold text-on-surface w-32">{t('admin.inventory.stocktake.colLot', 'Lô / Hạn SD')}</th>
                <th className="px-4 py-3 font-semibold text-on-surface text-center w-32">{t('admin.inventory.stocktake.colSystem', 'Tồn hệ thống')}</th>
                <th className="px-4 py-3 font-semibold text-on-surface text-center w-40">{t('admin.inventory.stocktake.colCounted', 'Đếm thực tế')}</th>
                <th className="px-4 py-3 font-semibold text-on-surface text-center w-32">{t('admin.inventory.stocktake.colDiff', 'Chênh lệch')}</th>
                <th className="px-4 py-3 font-semibold text-on-surface">{t('admin.inventory.stocktake.colReason', 'Lý do')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim">
              {sortedItems.map((item) => {
                const sysQty = item.systemQuantity || 0
                const countQty = counts[item.id] || 0
                const diff = countQty - sysQty
                const showDiff = isCompleted ? item.variance : diff

                return (
                  <tr key={item.id} className="hover:bg-surface-container/20">
                    <td className="px-4 py-3 font-medium text-on-surface truncate max-w-[200px]">
                      {item.itemName}
                      {item.itemSku && <div className="text-xs text-on-surface-variant font-normal">{item.itemSku}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{item.lotNumber && item.lotNumber !== 'N/A' ? item.lotNumber : t('admin.inventory.stocktake.defaultLot', 'Lô Mặc Định')}</div>
                      <div className="text-xs text-on-surface-variant">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString('vi-VN') : '---'}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-on-surface-variant font-medium">
                      {sysQty}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCompleted ? (
                        <span className="font-bold">{item.countedQuantity}</span>
                      ) : (
                        <NumberInput
                          value={counts[item.id]}
                          onChange={(e) => setCounts(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                          min={0}
                          step={0.01}
                          className="text-center font-bold text-primary max-w-[120px] mx-auto"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${showDiff > 0 ? 'text-green-600' : showDiff < 0 ? 'text-red-500' : 'text-on-surface-variant'}`}>
                        {showDiff > 0 ? `+${showDiff}` : showDiff}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isCompleted ? (
                        <span className="text-on-surface-variant">{item.adjustmentReason || '-'}</span>
                      ) : (
                        <Input
                          placeholder={t('admin.inventory.stocktake.reasonPh', 'VD: Cân sai...')}
                          value={reasons[item.id] || ''}
                          onChange={(e) => setReasons(prev => ({ ...prev, [item.id]: e.target.value }))}
                          className="min-w-[150px]"
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
