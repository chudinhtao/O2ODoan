import { useTranslation } from 'react-i18next'
import { User, Phone, Users, Clock, AlignLeft } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Textarea } from '@/shared/components/ui/Textarea'
import { StepperInput } from '@/shared/components/ui/StepperInput'

export interface IReservationFormData {
  customerName: string;
  customerPhone: string;
  partySize: number;
  adultCount: number;
  childrenCount: number;
  bookingTime: string; // expects datetime-local format: yyyy-MM-ddThh:mm
  note: string;
  depositAmount: number;
}

interface Props {
  formData: Partial<IReservationFormData>;
  onChange: (data: Partial<IReservationFormData>) => void;
  errors?: Record<string, string>;
}

export function ReservationCustomerForm({ formData, onChange, errors = {} }: Props) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <User size={14} /> {t('pos.reservations.form.customer_name', 'Tên Khách Hàng')} <span className="text-red-500">*</span>
        </label>
        <Input 
          type="text" 
          value={formData.customerName || ''}
          onChange={e => onChange({ ...formData, customerName: e.target.value })}
          placeholder={t('pos.reservations.form.placeholder.name', 'VD: Nguyễn Văn A')}
          error={errors.customerName ? { message: errors.customerName as string, type: 'manual' } as import('react-hook-form').FieldError : undefined}
          className="bg-slate-50"
        />
      </div>

      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Phone size={14} /> {t('pos.reservations.form.phone', 'Số Điện Thoại')} <span className="text-red-500">*</span>
        </label>
        <Input 
          type="tel" 
          value={formData.customerPhone || ''}
          onChange={e => onChange({ ...formData, customerPhone: e.target.value.replace(/\D/g, '') })}
          placeholder={t('pos.reservations.form.placeholder.phone', 'VD: 0912345678')}
          maxLength={11}
          error={errors.customerPhone ? { message: errors.customerPhone as string, type: 'manual' } as import('react-hook-form').FieldError : undefined}
          className="bg-slate-50"
        />
      </div>

      <div className="col-span-2 sm:col-span-1 flex items-start gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Users size={14} /> {t('customer.booking.adults', 'Người Lớn')} <span className="text-red-500">*</span>
          </label>
          <StepperInput 
            value={formData.adultCount || 1}
            onChange={(val) => {
              const newAdults = val
              const children = formData.childrenCount || 0
              onChange({ ...formData, adultCount: newAdults, partySize: newAdults + children })
            }}
            min={1}
            variant="admin"
            className="h-[42px] w-full max-w-[140px]"
          />
        </div>

        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Users size={14} /> {t('customer.booking.children', 'Trẻ Em')}
          </label>
          <StepperInput 
            value={formData.childrenCount || 0}
            onChange={(val) => {
              const newChildren = val
              const adults = formData.adultCount || 1
              onChange({ ...formData, childrenCount: newChildren, partySize: adults + newChildren })
            }}
            min={0}
            variant="admin"
            className="h-[42px] w-full max-w-[140px]"
          />
        </div>
      </div>

      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Clock size={14} /> {t('pos.reservations.form.booking_time', 'Giờ Đến')} <span className="text-red-500">*</span>
        </label>
        <Input 
          type="datetime-local"
          value={formData.bookingTime || ''}
          onChange={e => onChange({ ...formData, bookingTime: e.target.value })}
          error={errors.bookingTime ? { message: errors.bookingTime, type: 'manual' } as any : undefined}
          className="bg-slate-50"
        />
      </div>

      <div className="col-span-2 sm:col-span-1">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <AlignLeft size={14} /> {t('pos.reservations.form.deposit', 'Tiền Cọc (VNĐ)')}
          <span className="text-[10px] text-slate-400 font-normal normal-case ml-1">{t('pos.reservations.form.emptyIfNoDeposit', '(Để trống nếu không cọc)')}</span>
        </label>
        <Input 
          type="number"
          min="0"
          step="1000"
          value={formData.depositAmount ? formData.depositAmount.toString() : ''}
          onChange={e => {
            const val = e.target.value
            onChange({ ...formData, depositAmount: val ? parseInt(val) : 0 })
          }}
          placeholder={t('pos.reservations.form.placeholder.deposit', 'VD: 500000')}
          className="bg-slate-50 font-bold text-primary"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <AlignLeft size={14} /> {t('pos.reservations.form.note', 'Ghi Chú')}
        </label>
        <Textarea 
          value={formData.note || ''}
          onChange={e => onChange({ ...formData, note: e.target.value })}
          placeholder={t('pos.reservations.form.placeholder.note', 'VD: Yêu cầu ghế trẻ em, dị ứng hải sản...')}
          rows={2}
          className="bg-slate-50"
        />
      </div>
    </div>
  )
}
