import { useSearchParams, useNavigate, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCustomerSessionOrder, useCustomerCart } from '../../menu/hooks/useCustomerQueries'
import { useCustomerOpenSession } from '../../menu/hooks/useCustomerMutations'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { StaffSupportModal } from '../components/StaffSupportModal'
import { RecentOrderSummary } from '../components/RecentOrderSummary'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Coffee, ChevronRight, Banknote, UtensilsCrossed, CheckCircle2, Ban } from 'lucide-react'
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle'
import { CustomerBottomNav } from '../../components/CustomerBottomNav'
import http from '@/services/interceptor'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { usePaymentLock } from '../../shared/hooks/usePaymentLock'

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80&w=1200'

interface RestaurantProfile { name: string; slogan: string; bannerUrl?: string; logoUrl?: string }

function useRestaurantProfile() {
  return useQuery<RestaurantProfile>({
    queryKey: ['restaurant-profile'],
    queryFn: async () => {
      const res = await http.get<IApiResponse<RestaurantProfile>>('/menu/profile')
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export default function CustomerLandingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const qrToken = searchParams.get('qr')
  const sessionToken = searchParams.get('t')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: profile } = useRestaurantProfile()
  const storeName   = profile?.name      || t('customer.home.brand')
  const storeSlogan = profile?.slogan    || t('customer.home.slogan')
  const heroBanner  = profile?.bannerUrl || DEFAULT_HERO

  const openSessionMutation = useCustomerOpenSession()
  const [sessionError, setSessionError] = useState<string | null>(null)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)

  usePaymentLock(sessionToken || '')

  useEffect(() => {
    if (qrToken) {
      openSessionMutation.mutate(qrToken, {
        onSuccess: (res) => {
          const newSessionToken = res.data.sessionToken
          setSearchParams({ t: newSessionToken }, { replace: true })
        },
        onError: (err: any) => {
          setSessionError(err.response?.data?.message || 'Lỗi khi kết nối bàn, vui lòng quét lại QR.')
        }
      })
    }
  }, [qrToken])

  const { data: sessionOrder, isLoading: isSessionLoading, error: orderError } = useCustomerSessionOrder(sessionToken)
  const { data: cart } = useCustomerCart(sessionToken)

  useEffect(() => {
    if (orderError) {
      const msg = (orderError as any).response?.data?.message || t('customer.home.invalidSession')
      setSessionError(msg)
    }
  }, [orderError, t])

  /* ─── Redirect or Error states ─── */
  if (!qrToken && !sessionToken) {
    return <Navigate to="/booking" replace />
  }

  if (sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-guest-bg p-6 text-center">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-sm w-full">
          <AlertTriangle size={40} className="text-red-400 mx-auto mb-3" />
          <h1 className="text-base font-black text-red-700 mb-1">{sessionError}</h1>
          <p className="text-sm text-red-400">Xin phiền bạn báo lại với nhân viên để được hỗ trợ.</p>
        </div>
      </div>
    )
  }

  if (!sessionToken || isSessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-guest-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-guest-primary border-t-transparent" />
      </div>
    )
  }

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const tableNumber = sessionOrder?.tableNumber

  /* ─── Quick nav items ─── */
  const quickNavs = [
    {
      id: 'menu',
      icon: 'restaurant_menu',
      label: t('customer.home.menu'),
      onClick: () => navigate(`/menu?t=${sessionToken}`),
      badge: null,
      gradient: 'from-orange-400 to-red-400',
    },
    {
      id: 'cart',
      icon: 'shopping_cart',
      label: t('customer.home.cart'),
      onClick: () => navigate(`/menu?t=${sessionToken}`),
      badge: cartItemCount > 0 ? cartItemCount : null,
      gradient: 'from-amber-400 to-orange-400',
    },
    {
      id: 'payment',
      icon: 'receipt_long',
      label: t('customer.home.orderedTickets'),
      onClick: () => navigate(`/payment?t=${sessionToken}`),
      badge: null,
      gradient: 'from-emerald-400 to-teal-400',
    },
    {
      id: 'staff',
      icon: 'notifications_active',
      label: t('customer.home.callStaff'),
      onClick: () => setIsSupportModalOpen(true),
      badge: null,
      gradient: 'from-blue-400 to-indigo-400',
    },
  ]

  return (
    <div className="bg-[#f8fafc] font-sans text-slate-900 min-h-screen pb-24">
      {/* ── Sticky Header ── */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Coffee size={20} className="text-guest-primary" strokeWidth={2} />
          <h1 className="font-black text-lg tracking-tight text-slate-900">{storeName}</h1>
        </div>
        <div className="flex items-center gap-2">
          {tableNumber && (
            <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
              <span className="text-guest-primary text-xs font-black">
                {t('customer.home.tableServing', { number: tableNumber })}
              </span>
            </div>
          )}
          <LanguageToggle variant="plain" />
        </div>
      </header>

      <main className="max-w-md mx-auto pt-14">
        {/* ── Hero Banner ── */}
        <div className="relative h-52 w-full overflow-hidden">
          <img src={heroBanner} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-10 left-5 z-10">
            <h2 className="text-white text-3xl font-black leading-tight tracking-tight drop-shadow-md">
              {storeName}
            </h2>
            <p className="text-white/80 text-sm font-medium mt-0.5">{storeSlogan}</p>
          </div>
        </div>

        {/* ── Status card ── */}
        <div className="px-4 -mt-5 relative z-10">
          <div 
            onClick={() => {
              if (sessionOrder?.status === 'PAYMENT_REQUESTED') navigate(`/payment?t=${sessionToken}`)
              else navigate(`/tracking?t=${sessionToken}`)
            }}
            className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] p-4 border border-slate-100 flex items-center gap-4 cursor-pointer active:scale-95 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              sessionOrder?.status === 'PAYMENT_REQUESTED' ? 'bg-amber-100' : 
              sessionOrder?.status === 'PAID' ? 'bg-emerald-100' :
              sessionOrder?.status === 'CANCELLED' ? 'bg-red-100' :
              'bg-orange-100'
            }`}>
              {sessionOrder?.status === 'PAYMENT_REQUESTED' ? (
                <Banknote size={20} className="text-amber-500" strokeWidth={2.5} />
              ) : sessionOrder?.status === 'PAID' ? (
                <CheckCircle2 size={20} className="text-emerald-500" strokeWidth={2.5} />
              ) : sessionOrder?.status === 'CANCELLED' ? (
                <Ban size={20} className="text-red-500" strokeWidth={2.5} />
              ) : (
                <UtensilsCrossed size={20} className="text-guest-primary" strokeWidth={2.5} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {isSessionLoading ? (
                <>
                  <Skeleton className="h-4 w-32 mb-1.5" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="font-black text-slate-900 text-sm leading-snug truncate pr-2">
                      {sessionOrder?.status === 'PAYMENT_REQUESTED' 
                        ? t('customer.home.waitingPayment', { defaultValue: 'Chờ thanh toán' }) 
                        : sessionOrder?.status === 'PAID'
                        ? 'Đã thanh toán hoàn tất'
                        : sessionOrder?.status === 'CANCELLED'
                        ? 'Bàn đã bị hủy'
                        : t('customer.home.tableOpened', { defaultValue: 'Bàn đang mở' }) + (sessionOrder?.tableNumber ? ` - Bàn ${sessionOrder.tableNumber}` : '')}
                    </p>
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  </div>
                  <p className="text-slate-500 text-xs font-medium">
                    {sessionOrder?.status === 'PAYMENT_REQUESTED' 
                      ? t('customer.home.pleasePay', { defaultValue: 'Bấm để xem hóa đơn' }) 
                      : sessionOrder?.status === 'PAID'
                      ? 'Cảm ơn quý khách!'
                      : sessionOrder?.status === 'CANCELLED'
                      ? 'Vui lòng liên hệ nhân viên'
                      : (sessionOrder?.tickets?.length ? `Bạn đã đặt ${sessionOrder.tickets.reduce((acc: number, t: any) => acc + t.items.length, 0)} món` : t('customer.home.sessionActive', { defaultValue: 'Bấm để xem trạng thái đơn' }))}
                  </p>
                </>
              )}
            </div>
            {/* Pulse indicator */}
            {sessionOrder?.status !== 'PAID' && sessionOrder?.status !== 'CANCELLED' && (
              <span className="relative flex h-2.5 w-2.5 shrink-0 ml-1">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${
                  sessionOrder?.status === 'PAYMENT_REQUESTED' ? 'bg-amber-400' : 'bg-guest-primary'
                }`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  sessionOrder?.status === 'PAYMENT_REQUESTED' ? 'bg-amber-500' : 'bg-guest-primary'
                }`} />
              </span>
            )}
          </div>
        </div>

        {/* ── Quick nav grid ── */}
        <div className="p-4 pt-5 grid grid-cols-2 gap-3">
          {quickNavs.map((nav) => (
            <button
              key={nav.id}
              onClick={nav.onClick}
              className="relative bg-white rounded-2xl p-5 flex flex-col items-center gap-3 border border-slate-100 shadow-sm active:scale-[0.96] transition-all hover:shadow-md group"
            >
              {nav.badge !== null && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white">
                  {nav.badge}
                </span>
              )}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${nav.gradient} flex items-center justify-center shadow-sm`}>
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {nav.icon}
                </span>
              </div>
              <span className="font-bold text-sm text-slate-700 group-hover:text-slate-900 transition-colors text-center leading-tight">
                {nav.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Recent orders ── */}
        <RecentOrderSummary sessionOrder={sessionOrder} isLoading={isSessionLoading} />

        {/* ── Hint banner ── */}
        <div className="px-4 mb-8">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/60 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-guest-primary text-xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
              <p className="text-xs font-medium text-slate-700">{t('customer.home.discoverMenu')}</p>
            </div>
            <button
              onClick={() => navigate(`/menu?t=${sessionToken}`)}
              className="bg-gradient-to-r from-[#ff7a00] to-[#ff5000] text-white text-xs font-bold px-4 py-2 rounded-full shrink-0 active:scale-95 transition-all"
            >
              {t('customer.home.orderNow')}
            </button>
          </div>
        </div>
      </main>

      <StaffSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        token={sessionToken || ''}
      />

      <CustomerBottomNav token={sessionToken || ''} activeTab="home" />
    </div>
  )
}
