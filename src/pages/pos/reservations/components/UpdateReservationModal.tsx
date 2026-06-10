import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { IReservation, IUpdateReservationRequest, IPreOrderItemState, IPreOrderDraftItem } from '@/shared/types/reservation'
import { format, parseISO } from 'date-fns'
import { X } from 'lucide-react'
import { usePosMenuItems } from '@/pages/pos/order-entry/hooks/usePosMenu'
import { ReservationCustomerForm, IReservationFormData } from './ReservationCustomerForm'
import { PreOrderList } from './PreOrderList'
import { Button } from '@/shared/components/ui/Button'
import { SelectPreOrderItemModal } from './SelectPreOrderItemModal'

interface UpdateReservationModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: IReservation | null
  isSubmitting?: boolean
  onSave: (id: string, data: IUpdateReservationRequest) => void
  onCancelRes: (id: string) => void
}

export function UpdateReservationModal({
  isOpen,
  onClose,
  reservation,
  isSubmitting,
  onSave
}: UpdateReservationModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<Partial<IReservationFormData>>({})
  const [preOrderItems, setPreOrderItems] = useState<IPreOrderItemState[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: allItems } = usePosMenuItems()

  useEffect(() => {
    if (reservation) {
      setFormData({
        customerName: reservation.customerName,
        customerPhone: reservation.customerPhone,
        partySize: reservation.partySize,
        adultCount: reservation.adultCount || reservation.partySize,
        childrenCount: reservation.childrenCount || 0,
        bookingTime: format(parseISO(reservation.bookingTime), "yyyy-MM-dd'T'HH:mm"),
        note: reservation.note || '',
        depositAmount: reservation.depositAmount || 0
      })

      if (reservation.preOrderDraft && allItems) {
        try {
          const draft: IPreOrderDraftItem[] = JSON.parse(reservation.preOrderDraft)
          const items: IPreOrderItemState[] = draft.reduce((acc, d) => {
            const menuItem = allItems.find(m => m.id === d.menuItemId)
            if (menuItem) {
              acc.push({
                item: {
                  id: menuItem.id,
                  name: menuItem.name,
                  basePrice: menuItem.basePrice
                },
                qty: d.quantity,
                opts: d.options.map(o => {
                  let optName = t('pos.reservations.preorder.option', 'Tùy chọn')
                  menuItem.optionGroups?.forEach(g => {
                    g.options?.forEach(opt => {
                      if (opt.id === o.optionId) optName = opt.name
                    })
                  })
                  return { optionId: o.optionId, name: optName }
                }),
                note: d.note
              })
            }
            return acc
          }, [] as IPreOrderItemState[])
          setPreOrderItems(items)
        } catch (e) {
          console.error('Failed to parse preOrderDraft', e)
        }
      } else {
        setPreOrderItems([])
      }
    }
  }, [reservation, allItems])

  if (!isOpen || !reservation) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(reservation.id, {
      ...formData,
      bookingTime: formData.bookingTime ? (formData.bookingTime.length === 16 ? `${formData.bookingTime}:00` : formData.bookingTime) : undefined,
      preOrderDraft: preOrderItems.length > 0 ? JSON.stringify(preOrderItems.map(p => ({
        menuItemId: p.item.id,
        quantity: p.qty,
        options: p.opts.map(o => ({ optionId: o.optionId })),
        note: p.note
      }))) : undefined
    })
  }

  const handleRemoveItem = (index: number) => {
    setPreOrderItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddPreOrderItem = (item: IPreOrderItemState) => {
    setPreOrderItems(prev => [...prev, item])
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="font-black text-xl text-white">{t('common.edit', 'Chỉnh sửa Thông tin')}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Body */}
        <form id="pos-update-res-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <ReservationCustomerForm 
            formData={formData} 
            onChange={(data) => setFormData(prev => ({ ...prev, ...data }))} 
          />
          <PreOrderList 
            items={preOrderItems} 
            onRemoveItem={handleRemoveItem} 
            onAddItem={() => setIsMenuOpen(true)}
            variant="admin"
          />
        </form>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 shrink-0 flex justify-end gap-3">
          <Button 
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 rounded-xl border-slate-200 text-slate-600 bg-white"
          >
            {t('common.close', 'Đóng')}
          </Button>
          <Button 
            variant="primary"
            type="submit"
            form="pos-update-res-form"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="px-6 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30"
          >
            {t('common.save', 'Lưu Thay Đổi')}
          </Button>
        </div>
      </div>

      <SelectPreOrderItemModal 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onAddItem={handleAddPreOrderItem} 
      />
    </div>
  )
}
