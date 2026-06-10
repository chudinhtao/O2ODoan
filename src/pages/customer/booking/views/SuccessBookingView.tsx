import { CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { type UseMutationResult } from '@tanstack/react-query'
import { Button } from '@/shared/components/ui/Button'
import { useTranslation } from 'react-i18next'

type DepositMutation = UseMutationResult<
  { checkoutUrl: string; qrCode?: string },
  Error,
  { reservationId: string; redirectUrl: string }
>

interface SuccessViewProps {
  formData: { customerName: string; bookingTime: string; bookingDate: string; partySize: number; adultCount?: number; childrenCount?: number }
  preOrderItems: { item: { name: string } }[]
  paymentStatus: string | null
  createdReservationId: string | null
  createDepositLinkMutation: DepositMutation
  onReset: () => void
}

export default function SuccessBookingView({ formData, preOrderItems, onReset }: SuccessViewProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center text-center pt-4 animate-in zoom-in duration-300">
      <div className="size-18 rounded-full bg-green-50 flex items-center justify-center mb-4.5">
        <CheckCircle2 size={38} className="text-green-600" strokeWidth={2.5} />
      </div>

      <h2 className="font-black text-2xl text-text-base mb-2">{t('customer.booking.successTitle')}</h2>
      <p className="text-sm font-medium text-text-muted leading-relaxed max-w-[34ch] mb-5">
        {t('customer.booking.successDesc', 'Yêu cầu đặt bàn của bạn đã được ghi nhận. Nhân viên nhà hàng sẽ sớm gọi điện xác nhận.')} <br />
        {t('customer.booking.successDetail', {
          adults: formData.adultCount || formData.partySize,
          childrenStr: formData.childrenCount ? `, ${formData.childrenCount} ${t('customer.booking.children')}` : '',
          time: formData.bookingTime,
          date: format(new Date(formData.bookingDate), 'dd/MM/yyyy')
        })}
      </p>

      {preOrderItems.length > 0 && (
        <div className="w-full rounded-xl p-3 bg-guest-primary/5 border border-guest-primary/20 text-left mb-3">
          <p className="font-bold text-sm text-guest-primary-dark mb-1">{t('customer.booking.preorderCount', { count: preOrderItems.length })}</p>
          <p className="text-xs text-guest-primary-dark/80">{t('customer.booking.preorderNote')}</p>
        </div>
      )}

      {/* Deposit block removed to wait for staff confirmation */}

      <Button
        variant="guest"
        onClick={onReset}
        className="font-bold px-7 rounded-xl"
      >
        {t('customer.booking.bookAnotherBtn')}
      </Button>
    </div>
  )
}
