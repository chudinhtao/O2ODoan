import { useTranslation } from 'react-i18next'
import { User, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/shared/components/ui/Input'
import { StepperInput } from '@/shared/components/ui/StepperInput'

export interface BookingFormData {
  customerName: string
  customerPhone: string
  partySize: number
  adultCount: number
  childrenCount: number
  bookingDate: string
  bookingTime: string
  note: string
}

interface BookingFormProps {
  formData: BookingFormData
  setFormData: React.Dispatch<React.SetStateAction<BookingFormData>>
  openTime?: string
  closeTime?: string
  errors?: Record<string, string>
}

export function BookingForm({ formData, setFormData, openTime = '08:00', closeTime = '22:00', errors = {} }: BookingFormProps) {
  const { t } = useTranslation()
  const minDate = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="bg-white rounded-[14px] border border-surface-border overflow-hidden">

      {/* ── Row 1: Party size ── */}
      <div className="grid grid-cols-2 border-b border-surface-subtle">
        <div className="flex items-center justify-between p-3 border-r border-surface-subtle">
          <label className="font-bold text-sm text-text-base">
            {t('customer.booking.adults')}
          </label>
          <StepperInput
            value={Number(formData.adultCount) || 1}
            min={1}
            onChange={(val) => setFormData(f => ({ ...f, adultCount: val }))}
          />
        </div>
        
        <div className="flex items-center justify-between p-3">
          <label className="font-bold text-sm text-text-base">
            {t('customer.booking.children')}
          </label>
          <StepperInput
            value={Number(formData.childrenCount) || 0}
            min={0}
            onChange={(val) => setFormData(f => ({ ...f, childrenCount: val }))}
          />
        </div>
      </div>

      {/* ── Row 2: Date & Time ── */}
      <div className="grid grid-cols-2 border-b border-surface-subtle">
        <div className="p-3 border-r border-surface-subtle">
          <label className="block font-bold text-xs text-text-muted mb-1">
            {t('customer.booking.date')}
          </label>
          <Input 
            type="date" min={minDate} 
            value={formData.bookingDate}
            onChange={e => setFormData(f => ({ ...f, bookingDate: e.target.value }))}
            error={errors.bookingDate ? { type: 'manual', message: errors.bookingDate } : undefined}
            className="w-full text-sm focus:!ring-guest-primary/20 focus:!border-guest-primary hover:!border-guest-primary/40"
          />
        </div>
        <div className="p-3">
          <label className="block font-bold text-xs text-text-muted mb-1">
            {t('customer.booking.time')}
          </label>
          <Input 
            type="time" min={openTime} max={closeTime} 
            value={formData.bookingTime}
            onChange={e => setFormData(f => ({ ...f, bookingTime: e.target.value }))}
            error={errors.bookingTime ? { type: 'manual', message: errors.bookingTime } : undefined}
            className="w-full text-sm focus:!ring-guest-primary/20 focus:!border-guest-primary hover:!border-guest-primary/40"
          />
        </div>
      </div>

      {/* ── Row 3: Name ── */}
      <div className="p-3 border-b border-surface-subtle">
        <label className="block font-bold text-xs text-text-muted mb-1">
          {t('customer.booking.name')}
        </label>
        <Input 
          type="text" 
          placeholder={t('customer.booking.namePlaceholder')}
          value={formData.customerName}
          onChange={e => setFormData(f => ({ ...f, customerName: e.target.value }))}
          icon={<User size={16} className="text-text-subtle group-focus-within:!text-guest-primary" />}
          error={errors.customerName ? { type: 'manual', message: errors.customerName } : undefined}
          className="w-full text-sm focus:!ring-guest-primary/20 focus:!border-guest-primary hover:!border-guest-primary/40"
        />
      </div>

      {/* ── Row 4: Phone ── */}
      <div className="p-3 border-b border-surface-subtle">
        <label className="block font-bold text-xs text-text-muted mb-1">
          {t('customer.booking.phone')}
        </label>
        <Input 
          type="tel" 
          placeholder={t('customer.booking.phonePlaceholder')}
          value={formData.customerPhone}
          onChange={e => setFormData(f => ({ ...f, customerPhone: e.target.value }))}
          icon={<Phone size={16} className="text-text-subtle group-focus-within:!text-guest-primary" />}
          error={errors.customerPhone ? { type: 'manual', message: errors.customerPhone } : undefined}
          className="w-full text-sm focus:!ring-guest-primary/20 focus:!border-guest-primary hover:!border-guest-primary/40"
        />
      </div>

      {/* ── Row 5: Note (compact) ── */}
      <div className="p-2">
        <Input
          type="text"
          placeholder={t('customer.booking.notePlaceholder')}
          value={formData.note}
          onChange={e => setFormData(f => ({ ...f, note: e.target.value }))}
          className="w-full text-sm border-transparent focus:!border-guest-primary focus:!ring-guest-primary/20 shadow-none bg-transparent hover:bg-surface-subtle hover:!border-guest-primary/40"
        />
      </div>
    </div>
  )
}
