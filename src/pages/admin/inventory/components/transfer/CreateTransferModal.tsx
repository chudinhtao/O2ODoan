import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, ArrowRightLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'
import { Select } from '@/shared/components/ui/Select'
import { Input } from '@/shared/components/ui/Input'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { getSuccessMessage, getApiErrorMessage } from '@/shared/utils/apiResponse'
import { inventoryService } from '../../services/inventory.service'
import { useLocations } from '../../hooks/useInventoryQueries'
import { IInventoryItem } from '../../types/inventory.type'

interface CreateTransferModalProps {
  onClose: () => void
}

export default function CreateTransferModal({ onClose }: CreateTransferModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  
  const [fromLocationId, setFromLocationId] = useState('')
  const [toLocationId, setToLocationId] = useState('')
  const [notes, setNotes] = useState('')
  
  const [fromLocSearch, setFromLocSearch] = useState('')
  const [toLocSearch, setToLocSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<Array<IInventoryItem & { transferQty: number; lotNumber?: string }>>([])

  const { data: locations } = useLocations()
  const locationOptions = locations?.filter(l => l.active).map(l => ({ value: l.id, label: l.name })) || []

  // Fetch items for searching
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['inventory-items-search', searchQuery],
    queryFn: () => inventoryService.getItems({ keyword: searchQuery || undefined, size: 5, isActive: true }),
    staleTime: 60000
  })

  const transferMutation = useMutation({
    mutationFn: () => inventoryService.createInternalTransfer({
      fromLocationId,
      toLocationId,
      notes,
      items: selectedItems.map(i => ({ itemId: i.id, quantity: i.transferQty, lotNumber: i.lotNumber }))
    }),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.inventory.transfer.createSuccess', 'Đã chuyển kho thành công')))
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions-transfers'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      onClose()
    },
    onError: (err: any) => {
      toast.error(getApiErrorMessage(err, t('admin.inventory.transfer.createError', 'Lỗi khi chuyển kho')))
    }
  })

  const handleAddItem = (item: IInventoryItem) => {
    if (selectedItems.some(i => i.id === item.id)) {
      toast.warning(t('admin.inventory.transfer.itemExists', 'Mặt hàng này đã có trong danh sách'))
      return
    }
    setSelectedItems(prev => [...prev, { ...item, transferQty: 1 }])
    setSearchQuery('')
  }

  const handleRemoveItem = (id: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id))
  }

  const handleUpdateQty = (id: string, qty: number) => {
    setSelectedItems(prev => prev.map(i => i.id === id ? { ...i, transferQty: qty } : i))
  }

  const handleUpdateLot = (id: string, lotNum: string) => {
    setSelectedItems(prev => prev.map(i => i.id === id ? { ...i, lotNumber: lotNum || undefined } : i))
  }

  const isFormValid = fromLocationId && toLocationId && fromLocationId !== toLocationId && selectedItems.length > 0 && selectedItems.every(i => i.transferQty > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t('admin.inventory.transfer.createTitle', 'Tạo Phiếu Chuyển Kho')}</h2>
              <p className="text-xs text-slate-500">{t('admin.inventory.transfer.createDesc', 'Luân chuyển hàng hóa giữa các kho nội bộ')}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 bg-slate-50/50">
          {/* Location Selection */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 relative z-20">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">{t('admin.inventory.transfer.fromLocation', 'Từ Kho (Xuất đi)')}</label>
              <AsyncSelect
                value={fromLocationId}
                onChange={val => {
                  setFromLocationId(String(val))
                  setSelectedItems([]) // reset items when location changes
                }}
                onSearch={setFromLocSearch}
                options={locationOptions.filter(l => l.label.toLowerCase().includes(fromLocSearch.toLowerCase()))}
                placeholder={t('admin.inventory.transfer.selectFromLocation', '-- Chọn kho xuất --')}
              />
            </div>
            <div className="flex flex-col items-center justify-center pt-6 px-2">
              <ArrowRightLeft className="w-6 h-6 text-slate-300" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">{t('admin.inventory.transfer.toLocation', 'Đến Kho (Nhận về)')}</label>
              <AsyncSelect
                value={toLocationId}
                onChange={val => setToLocationId(String(val))}
                onSearch={setToLocSearch}
                options={locationOptions.filter(l => l.label.toLowerCase().includes(toLocSearch.toLowerCase()))}
                placeholder={t('admin.inventory.transfer.selectToLocation', '-- Chọn kho nhận --')}
              />
            </div>
          </div>

          {/* Search Item */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative z-10">
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t('admin.inventory.transfer.addItemsTitle', 'Thêm hàng hóa vào phiếu chuyển')}</label>
            <AsyncSelect
              value=""
              onChange={(val) => {
                const item = searchResults?.content?.find(i => i.id === val)
                if (item) handleAddItem(item)
              }}
              onSearch={setSearchQuery}
              isLoading={isSearching}
              disabled={!fromLocationId}
              options={searchResults?.content?.map(item => ({
                value: item.id,
                label: `${item.name} (${item.sku || 'N/A'}) · ${t('admin.inventory.transfer.stockPrefix', 'Tồn:')} ${item.currentStock} ${item.baseUom?.name || ''}`
              })) || []}
              placeholder={!fromLocationId ? t('admin.inventory.transfer.requireFromLocation', 'Vui lòng chọn Kho xuất trước khi tìm hàng') : t('admin.inventory.transfer.searchItems', 'Tìm kiếm theo tên hoặc mã SKU...')}
            />
          </div>

          {/* Selected Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[250px] overflow-visible">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">{t('admin.inventory.transfer.item', 'Hàng hóa')}</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 w-32">{t('admin.inventory.transfer.lotNumber', 'Mã lô (Auto FEFO)')}</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">{t('admin.inventory.transfer.uom', 'ĐVT')}</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">{t('admin.inventory.transfer.currentStock', 'Tồn kho hiện tại')}</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 w-32">{t('admin.inventory.transfer.transferQty', 'SL Luân Chuyển')}</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                      {t('admin.inventory.transfer.noItems', 'Chưa có hàng hóa nào được chọn')}
                    </td>
                  </tr>
                ) : (
                  selectedItems.map((item) => {
                    const validBatches = item.batches?.filter(b => {
                      const isLocMatch = !b.locationId || String(b.locationId).toLowerCase() === String(fromLocationId).toLowerCase()
                      return isLocMatch && Number(b.currentStock) > 0
                    }) || []
                    
                    const displayStock = item.lotNumber 
                      ? validBatches.find(b => b.lotNumber === item.lotNumber)?.currentStock || 0
                      : validBatches.reduce((sum, b) => sum + Number(b.currentStock), 0)

                    return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{item.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{item.sku}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          value={item.lotNumber || ''}
                          onChange={(e) => handleUpdateLot(item.id, e.target.value)}
                          options={[
                            { value: '', label: t('admin.inventory.transfer.autoFefo', 'Tự động (FEFO)') },
                            ...validBatches.map(b => ({
                                value: b.lotNumber,
                                label: `${b.lotNumber} (${t('admin.inventory.transfer.stockPrefix', 'Tồn:')} ${b.currentStock}${String(b.locationId).toLowerCase() !== String(fromLocationId).toLowerCase() ? ` - ${b.locationName || 'Kho HT'}` : ''})`
                            }))
                          ]}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.baseUom?.name}</td>
                      <td className="px-4 py-3 text-right text-slate-600 font-medium">
                        {displayStock.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <NumberInput
                          value={item.transferQty}
                          onChange={(e) => handleUpdateQty(item.id, Number(e.target.value))}
                          min={0}
                          max={displayStock}
                          step={0.01}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
             <Input
                label={t('admin.inventory.transfer.notes', 'Ghi chú điều chuyển')}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t('admin.inventory.transfer.notesPlaceholder', 'Ví dụ: Bếp thiếu thịt bò nên lấy thêm từ Kho Tổng')}
             />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-slate-500">
              {selectedItems.length} {t('admin.inventory.transfer.item', 'Hàng hóa')}
            </span>
            {fromLocationId === toLocationId && fromLocationId !== '' && (
              <span className="text-sm text-red-500 font-medium">
                {t('admin.inventory.transfer.sameLocationError', 'Kho xuất và kho nhận không được trùng nhau!')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={transferMutation.isPending} className="!rounded-xl font-bold min-w-24">
              {t('common.cancel', 'Hủy bỏ')}
            </Button>
            <Button 
              onClick={() => transferMutation.mutate()} 
              disabled={!isFormValid || transferMutation.isPending}
              className="!rounded-xl font-bold min-w-32"
            >
              {t('admin.inventory.transfer.submit', 'Tạo Phiếu Chuyển')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
