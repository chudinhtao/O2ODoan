import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeCanvas } from 'qrcode.react'
import { CheckCircle, AlertCircle, Coins, Smartphone, Printer, PauseCircle, Verified, Bell, Loader2, QrCode, SplitSquareHorizontal } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { formatCurrency } from '@/shared/utils/formatCurrency'

export type PaymentMethod = 'CASH' | 'QR' | 'MIXED'

interface PaymentActionPanelProps {
  orderTotal: number
  paymentMethod: PaymentMethod
  setPaymentMethod: (m: PaymentMethod) => void
  cashGiven: number
  setCashGivenStr: (val: string) => void
  handleCashGivenChange: (val: string) => void
  releaseTable: boolean
  setReleaseTable: (val: boolean) => void
  isCheckingOut: boolean
  handlePaymentSubmit: (method: string) => void
  onHoldOrder: () => void
  onPrintBeforeClose: () => void
  isTakeaway: boolean
  // QR PayOS (full amount)
  qrPayosUrl: string | null
  qrPayosCode: string | null
  isCreatingQrPayos: boolean
  handleQrCreateLink: () => void
  // Mixed
  mixedQrUrl: string | null
  mixedQrCode: string | null
  isCreatingQr: boolean
  qrAmount: number
  isMixedReady: boolean
  handleMixedCreateQr: () => void
  excessDeposit?: number
}

const QUICK_CASH_DENOMS = [20000, 50000, 100000, 200000, 500000]

export function PaymentActionPanel({
  orderTotal, paymentMethod, setPaymentMethod,
  cashGiven, setCashGivenStr, handleCashGivenChange,
  releaseTable, setReleaseTable, isCheckingOut, handlePaymentSubmit,
  onHoldOrder, onPrintBeforeClose, isTakeaway,
  qrPayosUrl, qrPayosCode, isCreatingQrPayos, handleQrCreateLink,
  mixedQrUrl, mixedQrCode, isCreatingQr, qrAmount, isMixedReady, handleMixedCreateQr,
  excessDeposit = 0
}: PaymentActionPanelProps) {
  const { t } = useTranslation()

  // Auto-switch to CASH if order total is 0 or less
  useEffect(() => {
    if (orderTotal <= 0 && paymentMethod !== 'CASH') {
      setPaymentMethod('CASH')
    }
  }, [orderTotal, paymentMethod, setPaymentMethod])

  const isSufficient = cashGiven >= orderTotal
  const change = Math.max(0, cashGiven - orderTotal) + excessDeposit
  const isZeroOrder = orderTotal <= 0

  const paymentMethods = [
    { id: 'CASH' as PaymentMethod, label: t('pos.payment.methods.cash', 'Tiền mặt'), icon: Coins },
    ...(isZeroOrder ? [] : [
      { id: 'QR' as PaymentMethod, label: t('pos.payment.methods.qr', 'PayOS / QR'), icon: Smartphone },
      { id: 'MIXED' as PaymentMethod, label: t('pos.payment.methods.mixed', 'Hỗn hợp'), icon: SplitSquareHorizontal },
    ])
  ]

  // Logic button xác nhận
  const isConfirmDisabled = (() => {
    if (isCheckingOut) return true
    if (paymentMethod === 'CASH') return !isSufficient
    if (paymentMethod === 'QR') return !qrPayosUrl   // Phải tạo QR PayOS trước
    if (paymentMethod === 'MIXED') return !mixedQrUrl  // Phải tạo QR trước
    return false
  })()

  const confirmLabel = (() => {
    if (paymentMethod === 'QR') return t('pos.payment.btnQRDone', 'Xác nhận thủ công (Fallback)')
    if (paymentMethod === 'MIXED') return t('pos.payment.btnMixedDone', 'Xác nhận đã nhận đủ tiền')
    return t('pos.payment.confirm', 'Xác nhận thanh toán')
  })()

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-5 scrollbar-hide">
        
        {/* Payment Method Selection */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-outline uppercase tracking-widest px-1">
            {t('pos.payment.methodTitle', 'Phương thức thanh toán')}
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {paymentMethods.map(m => {
              const active = paymentMethod === m.id
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`flex flex-col items-center justify-center p-2 py-3 border-2 rounded-lg transition-all gap-1.5 relative group ${
                    active 
                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5' 
                    : 'bg-surface border-outline-variant/40 text-outline hover:border-primary/40 hover:text-on-surface'
                  }`}
                >
                  <Icon className={`size-6 ${active ? 'animate-in zoom-in-75 duration-300' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="font-black text-[10px] uppercase tracking-tighter leading-none">{m.label}</span>
                  {active && (
                    <div className="absolute top-1.5 right-1.5 size-4 bg-primary text-white rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                      <CheckCircle className="size-2.5" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Payment Input Section */}
        <div className="space-y-4">

          {/* === CASH === */}
          {paymentMethod === 'CASH' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {isZeroOrder ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/20 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <CheckCircle className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-emerald-700 text-lg">{t('pos.payment.zeroOrderTitle', 'Đơn hàng 0đ')}</h3>
                    <p className="text-sm font-bold text-emerald-600/80">
                      {t('pos.payment.zeroOrderDesc', 'Không cần thanh toán thêm. Vui lòng bấm Xác nhận để hoàn tất.')}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">
                      {t('pos.payment.cashGiven', 'Tiền mặt khách đưa')}
                    </label>
                    <div className="relative group">
                      <Input
                        className="w-full bg-surface-container-low border-outline-variant/50 hover:border-primary rounded-lg h-12 px-4 font-black text-on-surface text-lg focus:ring-primary focus:border-primary transition-all tabular-nums"
                        type="text"
                        placeholder="0"
                        value={cashGiven > 0 ? cashGiven.toLocaleString('vi-VN') : ''}
                        onChange={(e) => handleCashGivenChange(e.target.value)}
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-outline">{t('common.units.currency', 'đ')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {QUICK_CASH_DENOMS.map(denom => (
                      <button
                        key={denom}
                          className="h-9 text-[10px] font-black text-on-surface-variant bg-surface-container-low border border-outline-variant/30 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95"
                        onClick={() => setCashGivenStr(denom.toString())}
                      >
                        {denom >= 1000 ? `${denom / 1000}k` : denom}
                      </button>
                    ))}
                  </div>

                  <div className={`p-3 lg:p-4 rounded-lg border flex justify-between items-center transition-all duration-300 ${
                    isSufficient 
                    ? 'bg-success/5 border-success/20 shadow-sm shadow-success/5' 
                    : 'bg-error/5 border-error/20'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`size-8 rounded-lg flex items-center justify-center ${isSufficient ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {isSufficient ? <CheckCircle className="size-4.5" /> : <AlertCircle className="size-4.5" />}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isSufficient ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isSufficient ? t('pos.payment.change', 'Tiền thối lại') : t('pos.payment.insufficient', 'Còn thiếu')}
                      </span>
                    </div>
                    <span className={`text-2xl font-black font-headline tabular-nums tracking-tighter ${isSufficient ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isSufficient ? formatCurrency(change) : formatCurrency(orderTotal - cashGiven)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === QR THUẦN === */}
          {/* === QR PayOS (full amount) === */}
          {paymentMethod === 'QR' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Chưa tạo QR: hiển thị tóm tắt và nút tạo */}
              {!qrPayosUrl && (
                <div className="space-y-4">
                  <div className="p-3 lg:p-4 rounded-lg bg-surface-container-low border border-outline-variant/30 flex justify-between items-center">
                    <span className="text-[10px] font-black text-outline uppercase tracking-widest">{t('pos.payment.qrTotalDue', 'Tổng cần thanh toán')}</span>
                    <span className="text-xl font-black text-primary tabular-nums">{formatCurrency(orderTotal)}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-lg border-primary/30 text-primary font-black text-sm hover:bg-primary hover:text-white transition-all gap-2"
                    onClick={handleQrCreateLink}
                    disabled={isCreatingQrPayos}
                  >
                    {isCreatingQrPayos ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <QrCode className="size-4" />
                    )}
                    {isCreatingQrPayos
                      ? t('pos.payment.qrCreating', 'Đang tạo mã QR PayOS...')
                      : t('pos.payment.qrCreate', { amount: formatCurrency(orderTotal), defaultValue: `Tạo mã QR – ${formatCurrency(orderTotal)}` })}
                  </Button>
                  <p className="text-[10px] text-center text-outline-variant font-bold">
                    {t('pos.payment.qrHint', 'Hệ thống sẽ tự đóng bill khi nhận được biến động số dư từ ngân hàng.')}
                  </p>
                </div>
              )}

              {/* QR đã tạo: hiển thị mã QR cho khách quét */}
              {qrPayosUrl && (
                <div className="bg-surface-container-low/50 rounded-xl p-5 flex flex-col items-center space-y-4 border-2 border-primary/15 animate-in zoom-in-95 duration-500">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">
                      {t('pos.payment.qrScanTitle', 'Mã QR PayOS')}
                    </p>
                    <p className="text-xl font-black text-primary font-headline tabular-nums">{formatCurrency(orderTotal)}</p>
                  </div>
                  {/* Render QR từ checkoutUrl của PayOS thông qua QR generator API */}
                  <div className="p-2 bg-white rounded-lg shadow-xl border-2 border-primary/10">
                    {qrPayosCode ? (
                      <QRCodeCanvas value={qrPayosCode} size={176} level="M" />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrPayosUrl)}`}
                        alt="PayOS QR"
                        className="w-44 h-44 object-contain"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-400/30 rounded-lg w-full">
                    <div className="size-2 bg-amber-500 rounded-full animate-pulse shrink-0" />
                    <p className="text-[10px] font-bold text-amber-700">
                      {t('pos.payment.qrWaiting', 'Đang chờ khách quét — Hệ thống tự đóng bill khi nhận tiền')}
                    </p>
                  </div>
                  <p className="text-[10px] text-center text-outline-variant font-bold max-w-[260px]">
                    {t('pos.payment.qrFallbackHint', 'Nếu webhook chậm, dùng nút bên dưới để xác nhận thủ công.')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* === MIXED: Tiền mặt + QR === */}
          {paymentMethod === 'MIXED' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Bước 1: Nhập tiền mặt */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">
                  {t('pos.payment.mixedCash', 'Bước 1 — Tiền mặt khách đưa')}
                </label>
                <div className="relative group">
                  <Input
                    className="w-full bg-surface-container-low border-outline-variant/50 hover:border-primary rounded-lg h-12 px-4 font-black text-on-surface text-lg focus:ring-primary focus:border-primary transition-all tabular-nums"
                    type="text"
                    placeholder="0"
                    value={cashGiven > 0 ? cashGiven.toLocaleString('vi-VN') : ''}
                    onChange={(e) => handleCashGivenChange(e.target.value)}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-outline">{t('common.units.currency', 'đ')}</span>
                </div>
                <div className="grid grid-cols-5 gap-2 pt-1">
                  {QUICK_CASH_DENOMS.map(denom => (
                    <button
                      key={denom}
                      className="h-9 text-[10px] font-black text-on-surface-variant bg-surface-container-low border border-outline-variant/30 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95"
                      onClick={() => setCashGivenStr(denom.toString())}
                    >
                      {denom >= 1000 ? `${denom / 1000}k` : denom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tóm tắt phần QR */}
              {isMixedReady && (
                <div className="p-3 lg:p-4 rounded-lg bg-primary/5 border border-primary/15 space-y-2 animate-in fade-in duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-outline uppercase tracking-widest">{t('pos.payment.mixedCashSummary', 'Tiền mặt')}</span>
                    <span className="font-black text-on-surface tabular-nums">{formatCurrency(cashGiven)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t('pos.payment.mixedQrRemaining', 'Còn cần quét QR')}</span>
                    <span className="font-black text-primary text-lg tabular-nums">{formatCurrency(qrAmount)}</span>
                  </div>
                </div>
              )}

              {/* Bước 2: Tạo mã QR */}
              {isMixedReady && !mixedQrUrl && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-outline uppercase tracking-widest px-1">
                    {t('pos.payment.mixedQrStep', 'Bước 2 — Tạo mã QR cho phần còn thiếu')}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full h-11 rounded-lg border-primary/30 text-primary font-black text-sm hover:bg-primary hover:text-white transition-all gap-2"
                    onClick={handleMixedCreateQr}
                    disabled={isCreatingQr}
                  >
                    {isCreatingQr ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <QrCode className="size-4" />
                    )}
                    {isCreatingQr
                      ? t('pos.payment.mixedCreating', 'Đang tạo mã QR...')
                      : t('pos.payment.mixedCreateQr', { amount: formatCurrency(qrAmount), defaultValue: `Tạo QR ${formatCurrency(qrAmount)}` })}
                  </Button>
                </div>
              )}

              {/* QR đã tạo — hiển thị cho khách quét */}
              {mixedQrUrl && (
                <div className="bg-surface-container-low/50 rounded-xl p-5 flex flex-col items-center space-y-4 border-2 border-primary/20 animate-in zoom-in-95 duration-500">
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                      {t('pos.payment.mixedQrReady', 'Mã QR phần chuyển khoản')}
                    </p>
                    <p className="text-xl font-black text-primary font-headline tabular-nums">{formatCurrency(qrAmount)}</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg shadow-xl border-2 border-primary/10">
                    {mixedQrCode ? (
                      <QRCodeCanvas value={mixedQrCode} size={176} level="M" />
                    ) : (
                      <img src={mixedQrUrl} alt="PayOS QR" className="w-44 h-44 object-contain" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-400/30 rounded-lg">
                    <div className="size-2 bg-amber-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-bold text-amber-700">
                      {t('pos.payment.mixedWaiting', 'Đang chờ khách quét — Hệ thống tự đóng bill khi nhận tiền')}
                    </p>
                  </div>
                </div>
              )}

              {/* Nếu tiền mặt >= tổng bill, không cần QR */}
              {cashGiven >= orderTotal && cashGiven > 0 && (
                <div className="p-3 lg:p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                  <CheckCircle className="size-5 text-emerald-500 shrink-0" />
                  <p className="text-[11px] font-bold text-emerald-700">
                    {t('pos.payment.mixedFullCash', 'Tiền mặt đã đủ — Không cần tạo QR, hãy chuyển sang phương thức Tiền mặt')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Bottom Actions */}
      <div className="p-4 lg:p-5 bg-surface-container-lowest border-t border-outline-variant/40 space-y-4">
        {!isTakeaway && (
          <div className="flex items-center gap-3 px-1">
             <label className="flex items-center gap-3 cursor-pointer relative group">
                <input 
                    type="checkbox" 
                    checked={releaseTable} 
                    onChange={e => setReleaseTable(e.target.checked)}
                    className="sr-only peer" 
                />
                <div className="w-10 h-5.5 bg-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary transition-colors"></div>
                <span className="text-[11px] font-black text-on-surface-variant uppercase tracking-tight group-hover:text-primary transition-colors">
                  {t('pos.payment.closeAndClearTable', 'Dọn bàn sau khi đóng bill')}
                </span>
             </label>
          </div>
        )}
        
        <div className="space-y-3">
          <Button
            onClick={() => handlePaymentSubmit(paymentMethod)}
            disabled={isConfirmDisabled}
            isLoading={isCheckingOut}
            variant={isConfirmDisabled ? 'outline' : 'primary'}
            className="w-full h-12 rounded-lg shadow-xl shadow-primary/20 text-base font-black uppercase tracking-tight transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {paymentMethod === 'QR' ? <Bell className="size-5" /> : <Verified className="size-5" />}
            {confirmLabel}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={onPrintBeforeClose} 
              disabled={isCheckingOut} 
              className="h-10 text-[11px] font-black uppercase rounded-lg border-outline-variant bg-surface hover:bg-surface-container transition-all"
            >
              <Printer className="size-3.5 mr-2" />
              {t('pos.payment.printBefore', 'In Bill')}
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              onClick={onHoldOrder} 
              className="h-10 text-[11px] font-black uppercase rounded-lg text-outline hover:bg-surface-container transition-all"
            >
              <PauseCircle className="size-3.5 mr-2" />
              {t('pos.payment.hold', 'Tạm giữ')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}



