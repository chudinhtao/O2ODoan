import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { IReservationRequest, IPreOrderItemState } from '@/shared/types/reservation'
import { ReservationCustomerForm, IReservationFormData } from './ReservationCustomerForm'
import { PreOrderList } from './PreOrderList'
import { Button } from '@/shared/components/ui/Button'
import { format } from 'date-fns'
import { SelectPreOrderItemModal } from './SelectPreOrderItemModal'

interface CreateReservationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: IReservationRequest) => void
  isSubmitting: boolean
}

export function CreateReservationModal({ isOpen, onClose, onSubmit, isSubmitting }: CreateReservationModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<Partial<IReservationFormData>>({
    customerName: '',
    customerPhone: '',
    partySize: 2,
    adultCount: 2,
    childrenCount: 0,
    bookingTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    note: '',
    depositAmount: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // CreateModal typically doesn't let you add pre-orders from POS yet (they are created via customer app or separate flow),
  // but if we support editing them here later, we keep the state.
  const [preOrderItems, setPreOrderItems] = useState<IPreOrderItemState[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        customerName: '',
        customerPhone: '',
        partySize: 2,
        adultCount: 2,
        childrenCount: 0,
        bookingTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        note: '',
        depositAmount: 0
      })
      setPreOrderItems([])
      setErrors({})
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    const newErrors: Record<string, string> = {}
    if (!formData.customerName?.trim()) newErrors.customerName = t('customer.booking.errName', 'Tên không được để trống')
    if (!formData.customerPhone?.trim() || !/^\d{10,11}$/.test(formData.customerPhone)) newErrors.customerPhone = t('customer.booking.errPhone', 'Số điện thoại không hợp lệ')
    if (!formData.bookingTime) newErrors.bookingTime = t('customer.booking.errTime', 'Chọn ngày giờ')
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    const bookingTimeLocal = `${formData.bookingTime}:00`

    onSubmit({
      customerName: formData.customerName!,
      customerPhone: formData.customerPhone!,
      partySize: formData.partySize!,
      adultCount: formData.adultCount,
      childrenCount: formData.childrenCount,
      bookingTime: bookingTimeLocal,
      note: formData.note,
      depositAmount: formData.depositAmount,
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
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="font-black text-xl text-white">{t('pos.reservations.createNew', 'Tạo Đặt Bàn Mới')}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Body */}
        <form id="pos-booking-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <ReservationCustomerForm 
            formData={formData} 
            onChange={setFormData} 
            errors={errors} 
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
            form="pos-booking-form"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="px-6 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30"
          >
            {t('common.save', 'Tạo Đặt Bàn')}
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
