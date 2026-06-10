import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { User, Phone, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

interface TakeawayCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (customerName?: string, customerPhone?: string) => void
  isLoading?: boolean
}

export function TakeawayCustomerModal({ isOpen, onClose, onSubmit, isLoading }: TakeawayCustomerModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(name.trim() || undefined, phone.trim() || undefined)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-250 ring-1 ring-outline-variant/30 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/30 bg-surface">
          <h2 className="text-lg font-bold text-on-surface">
            {t('pos.takeaway.customerInfo', 'Thông tin khách vãng lai')}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-variant transition-colors">
            <X className="size-5 text-on-surface-variant" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {t('pos.takeaway.customerInfoDesc', 'Vui lòng nhập tên và số điện thoại khách hàng (không bắt buộc) để dễ dàng gọi món khi hoàn thành.')}
          </p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">
                {t('common.customerName', 'Tên khách hàng')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-on-surface-variant" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-lg focus:ring-0 focus:border-primary text-sm text-on-surface placeholder:text-outline transition-colors"
                  placeholder={t('pos.takeaway.namePlaceholder', 'VD: Anh Tuấn...')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-on-surface">
                {t('common.phoneNumber', 'Số điện thoại')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-on-surface-variant" />
                </div>
                <input
                  type="tel"
                  className="block w-full pl-10 pr-3 py-2.5 bg-surface-container-lowest border-2 border-outline-variant/40 rounded-lg focus:ring-0 focus:border-primary text-sm text-on-surface placeholder:text-outline transition-colors"
                  placeholder={t('pos.takeaway.phonePlaceholder', 'VD: 0987654321...')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} className="min-w-[120px]">
              {isLoading ? t('common.processing', 'Đang xử lý...') : t('common.confirm', 'Xác nhận')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
