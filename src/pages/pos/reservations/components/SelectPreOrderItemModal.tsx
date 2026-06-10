import { useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IMenuItem } from '@/pages/admin/menu/types/adminMenu.type'
import { IPreOrderItemState } from '@/shared/types/reservation'
import { MenuPanel } from '@/pages/pos/order-entry/components/MenuPanel'
import { ItemModifierModal } from '@/pages/pos/order-entry/components/ItemModifierModal'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  onAddItem: (item: IPreOrderItemState) => void
}

export function SelectPreOrderItemModal({ isOpen, onClose, onAddItem }: Props) {
  const { t } = useTranslation()
  const [selectedItem, setSelectedItem] = useState<IMenuItem | null>(null)

  if (!isOpen) return null

  const handleAddToCart = (item: IMenuItem, quantity: number, optionIds: string[], note: string) => {
    // Map optionIds back to objects containing name and extraPrice
    const opts: IPreOrderItemState['opts'] = []
    
    optionIds.forEach(optId => {
      item.optionGroups?.forEach(group => {
        const match = group.options.find(o => o.id === optId)
        if (match) {
          opts.push({
            optionId: optId,
            name: match.name
          })
        }
      })
    })

    onAddItem({
      item,
      qty: quantity,
      opts,
      note
    })
    
    // Đóng popup cấu hình món, quay về danh sách món
    setSelectedItem(null)
    
    toast.success(t('pos.reservations.preorder.added', 'Đã thêm món vào Đặt bàn!'))
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="font-black text-xl text-slate-800">
            {t('pos.reservations.preorder.selectItem', 'Chọn món Đặt trước')}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Menu Panel */}
        <div className="flex-1 overflow-hidden">
          <MenuPanel onItemClick={setSelectedItem} />
        </div>

      </div>

      {/* Item Modifier Modal */}
      {selectedItem && (
        <ItemModifierModal
          isOpen={true}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}
