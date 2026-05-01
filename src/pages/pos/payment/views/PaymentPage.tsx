import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useReactToPrint } from 'react-to-print'

import { ROUTES } from '@/shared/constants/ROUTES'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import http from '@/services/interceptor'
import { usePosSessionOrder } from '@/pages/pos/order-detail/hooks/usePosOrder'
import { Button } from '@/shared/components/ui/Button'
import { ArrowLeft, Printer, Smartphone } from 'lucide-react'

import { ReceiptPrint } from '../components/ReceiptPrint'
import { InvoicePanel } from '../components/InvoicePanel'
import { PaymentActionPanel, PaymentMethod } from '../components/PaymentActionPanel'
import { usePaymentLogic } from '../hooks/usePaymentLogic'

export default function PaymentPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  
  const [sessionToken, setSessionToken] = useState<string | null>(location.state?.sessionToken || null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [releaseTable, setReleaseTable] = useState(true)
  const receiptRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({ contentRef: receiptRef })

  useEffect(() => {
    let isMounted = true
    if (tableId === 'takeaway') return // Do not open session for takeaway
    if (sessionToken) return

    if (tableId) {
      http.post<{data: {sessionToken: string}}>(API_ROUTES.posSession.openManual(tableId))
        .then(res => { if (isMounted) setSessionToken(res.data.data.sessionToken) })
        .catch(() => { if (isMounted) navigate(ROUTES.pos.tables) })
    }
    return () => { isMounted = false }
  }, [tableId, navigate, sessionToken])

  const { data: serverOrder, isLoading: isOrderLoading } = usePosSessionOrder(sessionToken || '')
  
  const {
    order,
    aggregatedItems,
    orderTotal,
    cashGiven,
    setCashGivenStr,
    handleCashGivenChange,
    handlePaymentSubmit,
    handleApplyVoucher,
    isCheckingOut,
    voucherCode,
    setVoucherCode,
    isApplyingVoucher,
    mixedQrUrl,
    isCreatingQr,
    qrAmount,
    isMixedReady,
    handleMixedCreateQr,
    qrPayosUrl,
    isCreatingQrPayos,
    handleQrCreateLink,
  } = usePaymentLogic(tableId, sessionToken, serverOrder, releaseTable)

  // Với Takeaway: session token đến từ location.state (đã có sẵn khi navigate vào)
  // Vì vậy isOrderLoading vẫn cần được tôn trọng để chờ data fetch về
  const isLoading = !!sessionToken && isOrderLoading

  if (isLoading || !order) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-surface">
        {/* Header Skeleton */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-outline-variant shrink-0">
          <div className="size-9 rounded-xl bg-surface-variant animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-36 rounded-full bg-surface-variant animate-pulse" />
            <div className="h-3 w-24 rounded-full bg-surface-variant animate-pulse" />
          </div>
        </div>
        {/* Body Skeleton */}
        <div className="flex-1 flex flex-row overflow-hidden">
          <div className="flex-[7] p-6 space-y-4 border-r border-outline-variant/30">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-full rounded-2xl bg-surface-variant animate-pulse" />
            ))}
            <div className="h-12 w-full rounded-2xl bg-surface-variant animate-pulse" />
          </div>
          <div className="flex-[3] min-w-[360px] p-6 space-y-4">
            <div className="h-8 w-full rounded-xl bg-surface-variant animate-pulse" />
            <div className="h-32 w-full rounded-2xl bg-surface-variant animate-pulse" />
            <div className="mt-auto h-12 w-full rounded-xl bg-primary/20 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const orderIdPrefix = order.id ? order.id.split('-')[0].toUpperCase() : t('pos.payment.newOrder', 'MỚI')

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-surface relative">
        {/* Header - Unified with Order Detail style */}
        <header className="px-4 py-3 flex items-center justify-between border-b border-outline-variant bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-9 rounded-xl text-on-surface-variant hover:bg-surface-container transition-all active:scale-90" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div className="flex flex-col -space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-on-surface font-headline tracking-tighter uppercase">
                  {t('pos.payment.tableStr', 'Bàn {{num}}', { num: order.tableNumber })}
                </h2>
                <span className="text-[10px] font-black text-outline py-0.5 px-2 bg-outline-variant/30 rounded-lg tracking-wider">#{orderIdPrefix}</span>
              </div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">{t('pos.payment.checkout', 'Thanh toán hóa đơn')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/5 border border-blue-500/10 rounded-xl text-blue-600">
                <Smartphone className="size-3.5" />
                <span className="text-[10px] font-black uppercase tracking-tight">{t('pos.payment.qrSession', 'QR Session')}</span>
             </div>
             <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrint} 
                className="h-9 border-outline-variant hover:bg-surface-container rounded-xl text-xs font-bold"
              >
                <Printer className="size-3.5 mr-2" />
                {t('pos.payment.printBtn', 'In Tạm Tính')}
              </Button>
          </div>
        </header>

        {/* Main Body - 7:3 Layout */}
        <div className="flex-1 flex flex-row overflow-hidden bg-surface-container-lowest/20">
          {/* Left Column: Invoice Detail (70%) */}
          <section className="flex-[7] overflow-y-auto p-4 border-r border-outline-variant/30 scrollbar-hide">
            <div className="max-w-4xl mx-auto">
              <InvoicePanel 
                 order={order}
                 aggregatedItems={aggregatedItems}
                 tableId={tableId}
                 onEditOrder={() => {
                   if (tableId === 'takeaway') {
                     navigate('/pos/orders/new/takeaway', { state: { sessionToken } })
                   } else {
                     navigate(`/pos/orders/${tableId}`, { state: { sessionToken } })
                   }
                 }}
                 onApplyVoucher={handleApplyVoucher}
                 voucherCode={voucherCode}
                 setVoucherCode={setVoucherCode}
                 isApplyingVoucher={isApplyingVoucher}
              />
            </div>
          </section>

          {/* Right Column: Payment & Actions (30%) */}
          <aside className="flex-[3] min-w-[360px] bg-surface border-l border-outline-variant/50 flex flex-col shadow-[-4px_0_20px_rgba(0,0,0,0.02)]">
            <PaymentActionPanel
               orderTotal={orderTotal}
               paymentMethod={paymentMethod}
               setPaymentMethod={setPaymentMethod}
               cashGiven={cashGiven}
               setCashGivenStr={setCashGivenStr}
               handleCashGivenChange={handleCashGivenChange}
               releaseTable={releaseTable}
               setReleaseTable={setReleaseTable}
               isCheckingOut={isCheckingOut}
               handlePaymentSubmit={handlePaymentSubmit}
               onHoldOrder={() => navigate(ROUTES.pos.tables)}
               onPrintBeforeClose={handlePrint}
               isTakeaway={tableId === 'takeaway'}
               mixedQrUrl={mixedQrUrl}
               isCreatingQr={isCreatingQr}
               qrAmount={qrAmount}
               isMixedReady={isMixedReady}
               handleMixedCreateQr={handleMixedCreateQr}
               qrPayosUrl={qrPayosUrl}
               isCreatingQrPayos={isCreatingQrPayos}
               handleQrCreateLink={handleQrCreateLink}
            />
          </aside>
        </div>
      </div>

      <div className="hidden">
        <ReceiptPrint 
          ref={receiptRef} 
          order={order} 
          items={aggregatedItems} 
          cashGiven={cashGiven}
          paymentMethod={paymentMethod}
          paymentDetail={paymentMethod === 'MIXED' ? { CASH: cashGiven, QR: qrAmount } : null}
        />
      </div>
    </>
  )
}
