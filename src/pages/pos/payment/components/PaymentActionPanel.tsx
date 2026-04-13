import { useTranslation } from 'react-i18next'
import { CheckCircle, AlertCircle, Coins, Smartphone, Landmark, Printer, PauseCircle, Verified, Bell } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { formatCurrency } from '@/shared/utils/formatCurrency'

export type PaymentMethod = 'CASH' | 'QR' | 'TRANSFER'

interface PaymentActionPanelProps {
  orderTotal: number
  orderId: string
  paymentMethod: PaymentMethod
  setPaymentMethod: (m: PaymentMethod) => void
  cashGiven: number
  setCashGivenStr: (val: string) => void
  handleCashGivenChange: (val: string) => void
  releaseTable: boolean
  setReleaseTable: (val: boolean) => void
  isCheckingOut: boolean
  handlePaymentSubmit: () => void
  onHoldOrder: () => void
  onPrintBeforeClose: () => void
  isTakeaway: boolean
}

const QUICK_CASH_DENOMS = [20000, 50000, 100000, 200000, 500000]

export function PaymentActionPanel({
  orderTotal, orderId, paymentMethod, setPaymentMethod,
  cashGiven, setCashGivenStr, handleCashGivenChange,
  releaseTable, setReleaseTable, isCheckingOut, handlePaymentSubmit,
  onHoldOrder, onPrintBeforeClose, isTakeaway
}: PaymentActionPanelProps) {
  const { t } = useTranslation()

  const isSufficient = cashGiven >= orderTotal
  const change = Math.max(0, cashGiven - orderTotal)

  const paymentMethods = [
    { id: 'CASH' as PaymentMethod, label: t('pos.payment.methods.cash', 'Tiền mặt'), icon: Coins },
    { id: 'QR' as PaymentMethod, label: t('pos.payment.methods.qr', 'QR Scan'), icon: Smartphone },
    { id: 'TRANSFER' as PaymentMethod, label: t('pos.payment.methods.transfer', 'Chuyển khoản'), icon: Landmark },
  ]

  return (
    <div className="flex flex-col h-full bg-surface">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        
        {/* Payment Method Selection */}
        <div className="space-y-4">
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
                  className={`flex flex-col items-center justify-center p-3 py-4 border-2 rounded-2xl transition-all gap-2 relative group ${
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
          {paymentMethod === 'CASH' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-outline uppercase tracking-widest px-1">
                  {t('pos.payment.cashGiven', 'Tiền mặt khách đưa')}
                </label>
                <div className="relative group">
                  <Input
                    className="w-full bg-surface-container-low border-outline-variant/50 hover:border-primary rounded-2xl h-14 px-5 font-black text-on-surface text-xl focus:ring-primary focus:border-primary transition-all tabular-nums"
                    type="text"
                    placeholder="0"
                    value={cashGiven > 0 ? cashGiven.toLocaleString('vi-VN') : ''}
                    onChange={(e) => handleCashGivenChange(e.target.value)}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-outline">{t('common.units.currency', 'đ')}</span>
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="grid grid-cols-5 gap-2">
                {QUICK_CASH_DENOMS.map(denom => (
                  <button
                    key={denom}
                    className="h-9 text-[10px] font-black text-on-surface-variant bg-surface-container-low border border-outline-variant/30 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-95"
                    onClick={() => setCashGivenStr(denom.toString())}
                  >
                    {denom >= 1000 ? `${denom / 1000}k` : denom}
                  </button>
                ))}
              </div>

              {/* Cash Result calculation */}
              <div className={`p-4 rounded-2xl border flex justify-between items-center transition-all duration-300 ${
                isSufficient 
                ? 'bg-success/5 border-success/20 shadow-sm shadow-success/5' 
                : 'bg-error/5 border-error/20'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`size-8 rounded-xl flex items-center justify-center ${isSufficient ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
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
            </div>
          )}

          {paymentMethod === 'QR' && (
            <div className="bg-surface-container-low/50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center space-y-6 border border-outline-variant/30 animate-in fade-in zoom-in-95 duration-500">
               <div className="text-center space-y-2">
                  <p className="text-[10px] font-black text-outline uppercase tracking-[0.2em]">{t('pos.payment.qrTitle', 'Quét mã QR Pay')}</p>
                  <p className="text-base font-bold text-on-surface tracking-tight">
                    {t('pos.payment.qrPrompt', 'Hệ thống tự động tạo mã cho')} <span className="text-primary font-black font-headline text-lg ml-1">{formatCurrency(orderTotal)}</span>
                  </p>
               </div>
               <div className="p-4 bg-white border-2 border-primary/10 rounded-3xl shadow-2xl shadow-primary/5 transition-all hover:scale-105 duration-300">
                  <img 
                    src={`https://img.vietqr.io/image/970436-096000000-compact2.png?amount=${orderTotal}&addInfo=Thanh toan FNB ${orderId}&accountName=NHA HANG FNB`} 
                    alt="VietQR code" 
                    className="w-40 h-40 md:w-48 md:h-48 object-contain"
                  />
               </div>
               <p className="text-[10px] text-center text-outline-variant font-bold max-w-[240px]">
                 {t('pos.payment.qrNotice', '(Nhận diện tự động, bạn không cần làm gì khác sau khi khách quét)')}
               </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Bottom Actions */}
      <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/40 space-y-5">
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
            onClick={handlePaymentSubmit}
            disabled={isCheckingOut || (paymentMethod === 'CASH' && !isSufficient)}
            isLoading={isCheckingOut}
            variant={(paymentMethod === 'CASH' && !isSufficient) ? "outline" : "primary"}
            className="w-full h-15 rounded-2xl shadow-xl shadow-primary/20 text-base font-black uppercase tracking-tight transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {paymentMethod === 'QR' ? <Bell className="size-5" /> : <Verified className="size-5" />}
            {paymentMethod === 'QR' 
               ? t('pos.payment.btnQRDone', 'Đã nhận tiền & Đóng Bill') 
               : t('pos.payment.confirm', 'Xác nhận thanh toán')}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              size="sm"
              onClick={onPrintBeforeClose} 
              disabled={!isSufficient || isCheckingOut} 
              className="h-10 text-[11px] font-black uppercase rounded-xl border-outline-variant bg-surface hover:bg-surface-container transition-all"
            >
              <Printer className="size-3.5 mr-2" />
              {t('pos.payment.printBefore', 'In Bill')}
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              onClick={onHoldOrder} 
              className="h-10 text-[11px] font-black uppercase rounded-xl text-outline hover:bg-surface-container transition-all"
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
