import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, UtensilsCrossed, CircleCheck, Hourglass,
  CreditCard, Ban, GitMerge, ShoppingBag
} from 'lucide-react'
import { useCustomerSessionOrder } from '../../menu/hooks/useCustomerQueries'
import { useCustomerCancelTicket, useCustomerCancelItem } from '../../menu/hooks/useCustomerMutations'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { IOrder } from '@/pages/admin/orders/types/order.type'
import { CustomerBottomNav } from '../../components/CustomerBottomNav'
import { TicketCard } from '../components/TicketCard'
import { useTranslation } from 'react-i18next'

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

type OrderStatus = 'OPEN' | 'PAYMENT_REQUESTED' | 'PAID' | 'CANCELLED' | 'MERGED'

const STATUS_CONFIG: Record<OrderStatus, {
  gradient: string
  bg: string
  text: string
  pulse: string
  Icon: React.ElementType
  title: string
  sub: string
}> = {
  OPEN: {
    gradient: 'from-orange-500 to-red-400',
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-guest-primary',
    pulse: 'bg-guest-primary',
    Icon: UtensilsCrossed,
    title: 'Bàn đang hoạt động',
    sub: 'Bạn có thể tiếp tục gọi thêm món',
  },
  PAYMENT_REQUESTED: {
    gradient: 'from-amber-400 to-yellow-400',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    pulse: 'bg-amber-500',
    Icon: CreditCard,
    title: 'Đang chờ thanh toán',
    sub: 'Nhân viên sẽ đến hỗ trợ bạn',
  },
  PAID: {
    gradient: 'from-emerald-400 to-teal-400',
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    pulse: 'bg-emerald-500',
    Icon: CircleCheck,
    title: 'Đã thanh toán',
    sub: 'Cảm ơn bạn đã đến! Hẹn gặp lại 😊',
  },
  CANCELLED: {
    gradient: 'from-red-400 to-rose-500',
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    pulse: 'bg-red-500',
    Icon: Ban,
    title: 'Đơn đã bị huỷ',
    sub: 'Liên hệ nhân viên nếu có thắc mắc',
  },
  MERGED: {
    gradient: 'from-blue-400 to-indigo-400',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    pulse: 'bg-blue-500',
    Icon: GitMerge,
    title: 'Đã gộp đơn',
    sub: 'Đơn đã được gộp vào bàn khác',
  },
}

export default function OrderTrackingPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: sessionOrder, isLoading, error: orderError } = useCustomerSessionOrder(token)
  const cancelTicket = useCustomerCancelTicket(token)
  const cancelItem = useCustomerCancelItem(token)

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-16 px-4 space-y-4">
        <Skeleton className="h-[72px] w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  /* ─── Error ─── */
  if (orderError) {
    const errorMsg = (orderError as any).response?.data?.message || t('customer.tracking.errorLoading')
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-sm w-full">
          <Ban size={40} className="text-red-400 mx-auto mb-3" />
          <h1 className="text-base font-black text-red-700 mb-2">{errorMsg}</h1>
          <p className="text-sm text-red-400 mb-5">Vui lòng quét mã QR mới tại bàn.</p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-100 transition-colors"
          >
            {t('customer.tracking.backToHome', 'Về trang chủ')}
          </button>
        </div>
      </div>
    )
  }

  /* ─── Empty ─── */
  if (!token || !sessionOrder) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 text-center">
        <div>
          <ShoppingBag size={56} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium mb-5">{t('customer.tracking.emptyOrder')}</p>
          <button
            onClick={() => navigate(`/menu?t=${token}`)}
            className="text-guest-primary font-bold text-sm hover:underline"
          >
            {t('customer.tracking.backToMenu')}
          </button>
        </div>
      </div>
    )
  }

  const order: IOrder = sessionOrder
  const cfg = STATUS_CONFIG[order.status as OrderStatus] ?? STATUS_CONFIG['OPEN']

  const handleCancelTicket = (ticketId: string) => {
    cancelTicket.mutate(ticketId)
  }
  const handleCancelItem = (itemId: string) => {
    cancelItem.mutate(itemId)
  }

  return (
    <div className="bg-[#f8fafc] font-sans text-slate-900 min-h-screen flex flex-col">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center px-4 py-3 gap-3 max-w-md mx-auto">
          <button
            onClick={() => navigate(`/?t=${token}`)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:scale-90 transition-all"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <h1 className="flex-1 text-center font-black text-[16px] text-slate-900">
            Bàn {order.tableNumber || '—'}
          </h1>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-green-600 text-[10px] font-black uppercase tracking-wider">LIVE</span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto pb-44 pt-[68px] max-w-md mx-auto w-full">
        <div className="p-4 space-y-4">

          {/* Status banner */}
          <div className={`flex items-center gap-4 rounded-2xl border p-4 ${cfg.bg}`}>
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
              <cfg.Icon size={22} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-black text-[15px] leading-snug ${cfg.text}`}>{cfg.title}</p>
              <p className={`text-xs font-medium mt-0.5 opacity-70 ${cfg.text}`}>{cfg.sub}</p>
            </div>
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-70 ${cfg.pulse}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.pulse}`} />
            </span>
          </div>

          {/* Tickets */}
          {order.tickets?.length > 0 ? (
            <div className="space-y-3">
              {order.tickets.map((ticket, index) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  index={index}
                  onCancelTicket={order.status === 'OPEN' ? handleCancelTicket : undefined}
                  onCancelItem={order.status === 'OPEN' ? handleCancelItem : undefined}
                  isCancellingTicket={cancelTicket.isPending}
                  isCancellingItem={cancelItem.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-10 text-center">
              <Hourglass size={40} className="text-slate-200 mb-3" />
              <p className="text-slate-400 text-sm font-medium">Chưa có món nào được gọi</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm space-y-3">
             <div className="flex justify-between text-sm text-slate-500">
               <span>{t('customer.tracking.subtotal', 'Tạm tính')}</span>
               <span className="font-semibold">{fmt(order.subtotal)}đ</span>
             </div>
             {(order.discount ?? 0) > 0 && (
               <div className="flex justify-between text-sm text-green-600 font-bold">
                 <span>{t('customer.tracking.discount', 'Khuyến mãi')}</span>
                 <span>-{fmt(order.discount!)}đ</span>
               </div>
             )}
             <div className="flex items-center justify-between pt-3 border-t border-slate-50">
               <div>
                 <p className="text-slate-800 font-black text-base">{t('customer.tracking.grandTotal')}</p>
                 <p className="text-slate-400 text-[10px] uppercase tracking-wider mt-0.5">Đã bao gồm VAT 8%</p>
               </div>
               <span className="text-guest-primary text-2xl font-black">{fmt(order.total)}đ</span>
             </div>
          </div>
        </div>
      </main>



      <CustomerBottomNav token={token || ''} activeTab="tracking" />
    </div>
  )
}
