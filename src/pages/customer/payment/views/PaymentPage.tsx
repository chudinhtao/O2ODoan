import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CreditCard, CheckCircle2, Ban,
  Ticket, Check, Loader2, QrCode, Banknote, HeadphonesIcon, X
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useCustomerSessionOrder } from '../../menu/hooks/useCustomerQueries'
import { useCustomerRequestPayment, useCustomerApplyPromotion } from '../../menu/hooks/useCustomerMutations'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { IOrder } from '@/pages/admin/orders/types/order.type'
import { CustomerBottomNav } from '../../components/CustomerBottomNav'
import { InvoiceCard } from '../components/InvoiceCard'
import { useTranslation } from 'react-i18next'



export default function CustomerPaymentPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: sessionOrder, isLoading, error: orderError } = useCustomerSessionOrder(token)
  const requestPaymentMutation = useCustomerRequestPayment(token)
  const applyPromoMutation = useCustomerApplyPromotion(token)

  const [selectedMethod, setSelectedMethod] = useState<'TRANSFER' | 'CASH' | null>(null)
  const [voucherCode, setVoucherCode] = useState('')

  const fmt = (val: number | undefined) => new Intl.NumberFormat('vi-VN').format(val || 0)
  const handleRequestPayment = () => { if (selectedMethod) requestPaymentMutation.mutate(selectedMethod) }
  const handleApplyPromotion = () => {
    if (!voucherCode.trim()) return
    applyPromoMutation.mutate(voucherCode, { onSuccess: () => setVoucherCode('') })
  }
  const handleRemovePromotion = () => {
    applyPromoMutation.mutate('', { onSuccess: () => setVoucherCode('') })
  }

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] px-4 pt-20 space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-[340px] w-full rounded-3xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    )
  }

  /* ─── Error ─── */
  if (orderError) {
    const errorMsg = (orderError as any).response?.data?.message || t('customer.payment.errorLoading')
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-sm w-full">
          <Ban size={40} className="text-red-400 mx-auto mb-3" />
          <h1 className="text-base font-black text-red-700 mb-2">{errorMsg}</h1>
          <p className="text-sm text-red-400 mb-5">Vui lòng quét mã QR mới tại bàn.</p>
          <button onClick={() => navigate('/')} className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 transition-colors">
            {t('customer.payment.backToHome', 'Về trang chủ')}
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
          <CreditCard size={48} className="text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium mb-4">{t('customer.payment.emptyInvoice')}</p>
          <button onClick={() => navigate(`/menu?t=${token}`)} className="text-guest-primary font-bold text-sm hover:underline">
            {t('customer.payment.backToMenu')}
          </button>
        </div>
      </div>
    )
  }

  const order: IOrder = sessionOrder


  return (
    <div className="bg-[#f8fafc] font-sans text-slate-900 min-h-screen flex flex-col pb-28">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center px-4 py-3 gap-3 max-w-md mx-auto">
          <button
            onClick={() => navigate(`/?t=${token}`)}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:scale-90 transition-all"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <h1 className="font-black text-[16px] text-slate-900">
            {t('customer.payment.title', { number: order.tableNumber || '?' })}
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 space-y-4 pt-[72px] pb-4">

        {/* Invoice */}
        <InvoiceCard order={order} />

        {/* PAID state */}
        {order.status === 'PAID' && (
          <div className="bg-white rounded-3xl p-8 text-center border border-green-100 shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-500" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">{t('customer.payment.successTitle')}</h3>
            <p className="text-slate-500 text-sm">{t('customer.payment.successDesc')}</p>
          </div>
        )}

        {/* PAYMENT_REQUESTED state */}
        {order.status === 'PAYMENT_REQUESTED' && (
          <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
              <CreditCard size={20} className="text-amber-600" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 mb-0.5">{t('customer.payment.waitingTitle')}</h3>
              <p className="text-slate-500 text-sm">{t('customer.payment.waitingDesc')}</p>
            </div>
          </div>
        )}

        {/* OPEN state: voucher + method */}
        {order.status === 'OPEN' && (
          <>
            {/* Voucher card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket size={16} className="text-guest-primary shrink-0" strokeWidth={2} />
                  <span className="text-sm font-black text-slate-800">
                    {t('customer.payment.voucherLabel', 'Ưu đãi & Giảm giá')}
                  </span>
                </div>
                {order.promotionId && (
                  <button
                    onClick={handleRemovePromotion}
                    disabled={applyPromoMutation.isPending}
                    className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 transition-colors"
                  >
                    <X size={12} strokeWidth={2.5} />
                    {t('customer.payment.removeVoucher', 'Gỡ bỏ')}
                  </button>
                )}
              </div>

              {order.promotionId ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check size={15} strokeWidth={2.5} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 font-bold leading-none mb-1">
                        {t('customer.payment.appliedTitle', 'Đã áp dụng mã')}
                      </p>
                      <p className="text-sm font-black text-emerald-900 uppercase">{order.promotionCode || 'VOUCHER'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-500 font-medium mb-0.5">{t('customer.payment.savings', 'Tiết kiệm')}</p>
                    <p className="text-base font-black text-emerald-600">-{fmt(order.discount)}đ</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder={t('customer.payment.voucherPlaceholder', 'Nhập mã của bạn')}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-guest-primary/20 focus:border-guest-primary transition-all"
                  />
                  <button
                    onClick={handleApplyPromotion}
                    disabled={applyPromoMutation.isPending || !voucherCode.trim()}
                    className="bg-gradient-to-r from-[#ff7a00] to-[#ff5000] text-white font-bold text-sm px-5 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                  >
                    {applyPromoMutation.isPending
                      ? <Loader2 size={16} className="animate-spin" />
                      : t('customer.payment.btnApplyVoucher', 'Áp dụng')
                    }
                  </button>
                </div>
              )}
            </div>

            {/* Payment method */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                {t('customer.payment.methodTitle')}
              </h3>

              {/* QR Transfer */}
              <div
                onClick={() => setSelectedMethod('TRANSFER')}
                className={`bg-white rounded-3xl cursor-pointer transition-all overflow-hidden border-2 ${selectedMethod === 'TRANSFER' ? 'border-guest-primary shadow-[0_4px_20px_-4px_rgba(255,100,0,0.2)]' : 'border-transparent shadow-sm'}`}
              >
                <div className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${selectedMethod === 'TRANSFER' ? 'bg-orange-100' : 'bg-slate-100'}`}>
                    <QrCode size={20} className={selectedMethod === 'TRANSFER' ? 'text-guest-primary' : 'text-slate-400'} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${selectedMethod === 'TRANSFER' ? 'text-slate-900' : 'text-slate-600'}`}>
                      {t('customer.payment.qrTitle')}
                    </p>
                    <p className="text-xs text-slate-400">{t('customer.payment.qrDescAuto')}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === 'TRANSFER' ? 'border-guest-primary bg-guest-primary' : 'border-slate-300'}`}>
                    {selectedMethod === 'TRANSFER' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>

                {/* QR content expanded */}
                {selectedMethod === 'TRANSFER' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4 border-t border-slate-100"
                  >
                    <div className="mt-4 flex flex-col items-center bg-slate-50 rounded-2xl p-4">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                        alt="QR Code"
                        className="w-44 h-44 object-cover mb-3"
                      />
                      <p className="text-sm font-bold text-slate-700 mb-4">
                        MB Bank — <span className="text-guest-primary">{fmt(order.total)}đ</span>
                      </p>
                      <button
                        onClick={handleRequestPayment}
                        disabled={requestPaymentMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-emerald-500 text-emerald-600 font-bold text-sm hover:bg-emerald-50 active:scale-[0.98] transition-all disabled:opacity-60"
                      >
                        {requestPaymentMutation.isPending
                          ? <Loader2 size={18} className="animate-spin" />
                          : <Check size={18} strokeWidth={2.5} />
                        }
                        {t('customer.payment.btnTransferred')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Cash */}
              <div
                onClick={() => setSelectedMethod('CASH')}
                className={`bg-white rounded-3xl cursor-pointer transition-all overflow-hidden border-2 ${selectedMethod === 'CASH' ? 'border-guest-primary shadow-[0_4px_20px_-4px_rgba(255,100,0,0.2)]' : 'border-transparent shadow-sm'}`}
              >
                <div className="flex items-center gap-3 p-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${selectedMethod === 'CASH' ? 'bg-orange-100' : 'bg-slate-100'}`}>
                    <Banknote size={20} className={selectedMethod === 'CASH' ? 'text-guest-primary' : 'text-slate-400'} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm ${selectedMethod === 'CASH' ? 'text-slate-900' : 'text-slate-600'}`}>
                      {t('customer.payment.cashTitle')}
                    </p>
                    <p className="text-xs text-slate-400">{t('customer.payment.cashDescGo')}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedMethod === 'CASH' ? 'border-guest-primary bg-guest-primary' : 'border-slate-300'}`}>
                    {selectedMethod === 'CASH' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>

                {/* Cash CTA expanded */}
                {selectedMethod === 'CASH' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="px-4 pb-4 border-t border-slate-100"
                  >
                    <button
                      onClick={handleRequestPayment}
                      disabled={requestPaymentMutation.isPending}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff7a00] to-[#ff5000] text-white font-bold text-sm shadow-[0_4px_16px_-4px_rgba(255,100,0,0.45)] active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {requestPaymentMutation.isPending
                        ? <Loader2 size={18} className="animate-spin" />
                        : <HeadphonesIcon size={18} strokeWidth={2} />
                      }
                      {t('customer.payment.btnCallCashier')}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <CustomerBottomNav token={token || ''} activeTab="payment" />
    </div>
  )
}
