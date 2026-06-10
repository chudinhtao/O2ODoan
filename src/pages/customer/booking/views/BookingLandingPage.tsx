import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Coffee, MapPin, Phone, Clock, X, ArrowRight, ChefHat, Info } from 'lucide-react'
import { AxiosError } from 'axios'
import { toast } from 'sonner'
import { BookingForm, type BookingFormData } from '../components/BookingForm'
import SuccessBookingView from './SuccessBookingView'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useCustomerCreateBooking, useCustomerCreateDepositLink } from '../hooks/useCustomerBooking'
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle'
import { Button } from '@/shared/components/ui/Button'
import { IReservationRequest } from '@/shared/types/reservation'
import { useCustomerProfile } from '../../menu/hooks/useCustomerQueries'
import { type PreOrderItem } from './BookingMenuPage'
import { ROUTES } from '@/shared/constants/ROUTES'
import { ITicketItemRequest, ITicketItemOption } from '../../menu/types'

interface LocationState {
  preOrderItems?: PreOrderItem[]
  formData?: Record<string, unknown>
}

export default function BookingLandingPage() {
  const { t } = useTranslation()

  const { data: profile } = useCustomerProfile()

  const restaurantName = profile?.name || 'F&B Pos'
  const slogan = profile?.slogan || t('customer.landing.slogan')
  const address = profile?.address || t('customer.landing.address')
  const hotline = profile?.phone || t('customer.landing.hotline')
  const bannerUrl = profile?.bannerUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1920"
  const openTime = profile?.openTime || '08:00'
  const closeTime = profile?.closeTime || '22:00'

  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as LocationState) || {}

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [preOrderItems, setPreOrderItems] = useState<PreOrderItem[]>(state.preOrderItems || [])
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdReservationId, setCreatedReservationId] = useState<string | null>(null)

  // Restore formData if user navigated back from BookingMenuPage
  const [formData, setFormData] = useState<BookingFormData>(() => {
    const saved = state.formData as BookingFormData | undefined
    return saved || {
      customerName: '',
      customerPhone: '',
      partySize: 2,
      adultCount: 2,
      childrenCount: 0,
      bookingDate: format(new Date(), 'yyyy-MM-dd'),
      bookingTime: '',
      note: ''
    }
  })

  // Clear location.state after restoring to avoid stale data on refresh
  useEffect(() => {
    if (location.state) {
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const createBookingMutation = useCustomerCreateBooking()
  const createDepositLinkMutation = useCustomerCreateDepositLink()

  const searchParams = new URLSearchParams(window.location.search)
  const paymentStatus = searchParams.get('status')

  if (paymentStatus === 'success' && !isSuccess) {
    setIsSuccess(true)
    window.history.replaceState({}, document.title, window.location.pathname)
  } else if (paymentStatus === 'cancel') {
    toast.error(t('customer.booking.paymentCancelled', 'Thanh toán cọc đã bị huỷ. Đơn đặt bàn của bạn đang chờ xác nhận thủ công.'))
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim())
      newErrors.customerName = t('customer.booking.errName')

    if (!formData.customerPhone.trim() || !/^\d{10,11}$/.test(formData.customerPhone))
      newErrors.customerPhone = t('customer.booking.errPhone')

    if (!formData.bookingDate)
      newErrors.bookingDate = t('customer.booking.errDate')

    if (!formData.bookingTime)
      newErrors.bookingTime = t('customer.booking.errTime')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})

    const localDateTimeStr = `${formData.bookingDate}T${formData.bookingTime}:00`

    let preOrderDraftStr: string | undefined = undefined
    if (preOrderItems.length > 0) {
      const ticketItems: ITicketItemRequest[] = preOrderItems.map(p => {
        const options: ITicketItemOption[] = []
        Object.values(p.opts).forEach(optList => {
          optList.forEach(opt => options.push({ optionId: opt.id }))
        })
        return { menuItemId: p.item.id, quantity: p.qty, note: p.note, options }
      })
      preOrderDraftStr = JSON.stringify(ticketItems)
    }

    const partySize = (formData.adultCount || 2) + (formData.childrenCount || 0)

    const requestData: IReservationRequest = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      partySize: partySize,
      adultCount: formData.adultCount,
      childrenCount: formData.childrenCount,
      bookingTime: localDateTimeStr,
      note: formData.note,
      preOrderDraft: preOrderDraftStr
    }

    createBookingMutation.mutate(requestData, {
      onSuccess: (res) => {
        setIsSuccess(true)
        if (res?.data?.id) setCreatedReservationId(res.data.id)
      },
      onError: (error) => {
        const errObj = error as AxiosError<{ message?: string }>;
        const msg = errObj.response?.data?.message || t('common.error.system', 'Lỗi hệ thống, vui lòng thử lại sau.')
        toast.error(msg)
      }
    })
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-surface font-sans">
      {/* ══ LEFT: Hero panel (desktop only) ══ */}
      <div className="relative hidden lg:block w-[42%] shrink-0 overflow-hidden">
        <ImageWithFallback 
          src={bannerUrl} 
          fallback="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1920"
          alt={restaurantName} 
          className="absolute inset-0 w-full h-full object-cover object-[center_30%]" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/50 to-black/90" />
        <div className="relative z-10 flex flex-col justify-between h-full p-8 animate-in slide-in-from-bottom-5 duration-500">
          
          {/* Brand row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-guest-primary flex items-center justify-center">
                <Coffee size={17} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-black text-base text-white">{restaurantName}</span>
            </div>
            <LanguageToggle variant="plain" className="text-white bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30 hover:bg-white/30" />
          </div>

          {/* Bottom: headline + info */}
          <div className="animate-in slide-in-from-bottom-5 duration-500 delay-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-guest-primary/90 text-white text-[0.68rem] font-bold tracking-widest uppercase mb-3.5">
              <span className="size-1.5 rounded-full bg-white/80 animate-pulse" />
              {t('customer.booking.title')}
            </div>

            <h1 className="text-white font-black text-[clamp(1.55rem,2.2vw,2.5rem)] leading-[1.08] mb-2.5 whitespace-pre-line">
              {t('customer.landing.greeting')}
            </h1>
            <p className="text-white/80 text-sm max-w-[32ch] mb-5">
              {slogan}
            </p>

            <div className="flex flex-col gap-2">
              {[
                { icon: Clock, text: `${openTime} – ${closeTime}` },
                { icon: MapPin, text: address },
                { icon: Phone, text: hotline },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                  <Icon size={13} className="text-guest-primary-light shrink-0 mt-0.5" />
                  <span className="text-xs text-white/90 leading-relaxed">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT: Form panel — flex column, fills height ══ */}
      <div className="flex-1 bg-guest-background flex flex-col overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-guest-primary/30">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-2.5 border-b border-guest-primary/10 bg-guest-background sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-guest-primary flex items-center justify-center">
              <Coffee size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-extrabold text-sm text-text-base">{restaurantName}</span>
          </div>
          <LanguageToggle variant="plain" className="text-guest-primary bg-guest-primary/10 px-3 py-1.5 rounded-full font-bold" />
        </div>

        {/* Form wrapper */}
        <div className="flex-1 flex flex-col max-w-[520px] w-full mx-auto p-5 min-h-0">
          {isSuccess ? (
            <SuccessBookingView
              formData={formData}
              preOrderItems={preOrderItems}
              paymentStatus={paymentStatus}
              createdReservationId={createdReservationId}
              createDepositLinkMutation={createDepositLinkMutation}
              onReset={() => {
                setIsSuccess(false)
                setCreatedReservationId(null)
                setFormData({
                  customerName: '',
                  customerPhone: '',
                  partySize: 2,
                  adultCount: 2,
                  childrenCount: 0,
                  bookingDate: format(new Date(), 'yyyy-MM-dd'),
                  bookingTime: '',
                  note: ''
                })
                setPreOrderItems([])
              }}
            />
          ) : (
            <form id="booking-form" onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Heading — compact */}
              <div>
                <h2 className="font-black text-[1.2rem] text-text-base mb-0.5">
                  {t('customer.booking.formTitle')}
                </h2>
                <p className="text-[0.78rem] text-text-muted font-medium">
                  {t('customer.booking.formSubtitle')}
                </p>
              </div>

              <BookingForm
                formData={formData}
                setFormData={setFormData}
                openTime={openTime}
                closeTime={closeTime}
                errors={errors}
              />

              {/* Pre-order section — compact single row when empty */}
              <div className="rounded-xl p-2.5 bg-orange-50/50 border border-guest-primary/20">
                <div className={`flex items-center justify-between ${preOrderItems.length > 0 ? 'mb-2' : ''}`}>
                  <div className="flex items-center gap-1.5">
                    <ChefHat size={13} className="text-guest-primary" />
                    <span className="font-bold text-sm text-text-base">{t('customer.booking.preorder')}</span>
                    <span className="text-xs text-text-muted">{t('customer.booking.optional')}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate(ROUTES.customer.bookingMenu, { state: { preOrderItems, formData } })}
                    className="h-auto w-auto min-w-0 text-xs font-bold px-2.5 py-1 rounded-full bg-guest-primary/10 text-guest-primary-dark hover:bg-guest-primary/20 transition-colors"
                  >
                    {t('customer.booking.addItems')}
                  </Button>
                </div>

                {preOrderItems.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2">
                    {preOrderItems.map((p, idx) => (
                      <div key={idx} className="flex items-start justify-between p-2 rounded-[9px] bg-white border border-black/5">
                        <div className="min-w-0">
                          <p className="font-bold text-[0.78rem] text-text-base truncate">
                            {p.qty}× {p.item.name}
                          </p>
                          {Object.values(p.opts || {}).flat().length > 0 && (
                            <p className="text-[0.68rem] text-text-muted mt-0.5">
                              {Object.values(p.opts || {}).flat().map(o => o.name).join(', ')}
                            </p>
                          )}
                          {p.note && <p className="text-[0.68rem] text-guest-primary-dark italic mt-0.5">Note: {p.note}</p>}
                        </div>
                        <Button
                          type="button"
                          variant="icon"
                          onClick={() => setPreOrderItems(prev => prev.filter((_, i) => i !== idx))}
                          className="ml-2 p-1 w-auto h-auto min-w-0 bg-transparent hover:text-red-500 text-text-subtle transition-colors shrink-0"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="flex items-start gap-2 p-2.5 rounded-[11px] bg-guest-primary/5 border border-guest-primary/10">
                <Info size={12} className="text-guest-primary-dark shrink-0 mt-0.5" />
                <p className="text-[0.72rem] text-guest-primary-dark/80 leading-relaxed">
                  {t('customer.booking.policy')}
                </p>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                id="booking-submit-btn"
                isLoading={createBookingMutation.isPending}
                className="w-full font-black py-3 rounded-xl text-sm bg-gradient-to-br from-guest-primary to-guest-primary-dark text-white border-none shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:shadow-guest-primary/40 transition-all"
              >
                {t('customer.booking.submitBtn')} <ArrowRight size={16} />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
