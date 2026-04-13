import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CustomerBottomNav } from '../../components/CustomerBottomNav'
import { Button } from '@/shared/components/ui/Button'
import { useTranslation } from 'react-i18next'

// Promotions available to display — in real app this would come from API: GET /api/promotions/available
const AVAILABLE_PROMOTIONS = [
  { id: '1', code: 'WELCOME20', value: '-20k', title: 'Chào bạn mới', desc: 'Giảm 20% cho đơn đầu tiên', expiry: '31/12/2026' },
  { id: '2', code: 'MORNING15', value: '-15k', title: 'Cà phê sáng', desc: 'Giảm 15.000đ cho đơn từ 50.000đ', expiry: '15/10/2026' },
  { id: '3', code: 'SUNTIME15', value: '-15%', title: 'Suntime Special', desc: 'Giảm 15% tối đa 30.000đ', expiry: '31/12/2026' },
]

export default function PromotionPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t')
  const navigate = useNavigate()

  const [inputCode, setInputCode] = useState('')
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [applyState, setApplyState] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const { t } = useTranslation()

  const handleApply = (code = inputCode) => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return

    // Simulate API validation — replace with real API call
    const found = AVAILABLE_PROMOTIONS.find(p => p.code === trimmed)
    if (found) {
      setAppliedCode(trimmed)
      setInputCode(trimmed)
      setApplyState('success')
      setErrorMsg('')
    } else {
      setApplyState('error')
      setErrorMsg(t('customer.promo.invalidCode'))
    }
  }

  const handleRemove = () => {
    setAppliedCode(null)
    setInputCode('')
    setApplyState('idle')
    setErrorMsg('')
  }

  const appliedPromo = AVAILABLE_PROMOTIONS.find(p => p.code === appliedCode)

  return (
    <div className="bg-guest-bg font-sans text-slate-900 min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-guest-bg/95 backdrop-blur-md border-b border-guest-primary/10">
        <div className="flex items-center px-4 py-3 max-w-md mx-auto">
          <Button
            variant="icon"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full text-guest-primary hover:bg-guest-primary/10 transition-colors shadow-none bg-transparent"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Button>
          <h1 className="flex-1 text-center mr-10 text-lg font-bold min-w-0 truncate">{t('customer.promo.title')}</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-48 pt-16 max-w-md mx-auto w-full">
        {/* Promo Input Section */}
        <section className="p-4 pt-5">
          <label className="block mb-2 text-sm font-semibold text-slate-700 min-w-0 truncate">{t('customer.promo.inputLabel')}</label>
          <div className="flex gap-2 h-14">
            <div className="flex-1 relative min-w-0">
              <input
                type="text"
                placeholder={t('customer.promo.inputPlaceholder')}
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value)
                  setApplyState('idle')
                  setErrorMsg('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className={`w-full h-full rounded-xl border px-4 pr-10 outline-none transition-all focus:ring-2 text-sm font-medium uppercase tracking-widest ${
                  applyState === 'success'
                    ? 'border-green-400 bg-green-50 text-green-700 focus:ring-green-200'
                    : applyState === 'error'
                    ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-200'
                    : 'border-slate-200 bg-white focus:ring-guest-primary/30 focus:border-guest-primary'
                }`}
              />
              {applyState === 'success' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              )}
              {applyState === 'error' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                  <span className="material-symbols-outlined text-xl">error</span>
                </div>
              )}
            </div>
            <Button
              variant="guest"
              onClick={() => handleApply()}
              disabled={!inputCode.trim()}
              className="font-bold px-5 rounded-xl shrink-0 h-14"
            >
              {t('customer.promo.applyBtn')}
            </Button>
          </div>

          {/* Feedback text */}
          {applyState === 'success' && (
            <p className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1 min-w-0 truncate">
              <span className="material-symbols-outlined text-base shrink-0">celebration</span>
              <span className="truncate">{appliedPromo?.desc} — {t('customer.promo.appliedSuccess')}</span>
            </p>
          )}
          {applyState === 'error' && (
            <p className="mt-2 text-xs text-red-500 font-medium">{errorMsg}</p>
          )}
        </section>

        {/* Applied Promotion */}
        {appliedPromo && (
          <section className="mt-2 px-4">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-slate-700 uppercase tracking-wider min-w-0 truncate">
              <span className="material-symbols-outlined text-guest-primary text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              <span className="truncate">{t('customer.promo.currentlyApplied')}</span>
            </h2>
            <div className="bg-guest-primary/10 border border-guest-primary/20 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-guest-primary flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-guest-primary tracking-widest truncate">{appliedPromo.code}</p>
                  <p className="text-sm text-slate-600 truncate">{appliedPromo.desc}</p>
                </div>
              </div>
              <Button
                variant="icon"
                onClick={handleRemove}
                className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors shadow-none bg-transparent h-8 w-8"
              >
                <span className="material-symbols-outlined">close</span>
              </Button>
            </div>
          </section>
        )}

        {/* Available Promotions */}
        <section className="mt-6 px-4">
          <h2 className="text-sm font-bold mb-4 uppercase tracking-wider text-slate-700 min-w-0 truncate">{t('customer.promo.availablePromo')}</h2>
          <div className="space-y-3">
            {AVAILABLE_PROMOTIONS.map(promo => {
              const isApplied = appliedCode === promo.code
              return (
                <div
                  key={promo.id}
                  className={`bg-white border rounded-xl overflow-hidden shadow-sm flex transition-all ${
                    isApplied ? 'border-guest-primary ring-1 ring-guest-primary/20' : 'border-slate-100'
                  }`}
                >
                  {/* Value tab with cutout effect */}
                  <div className="w-24 bg-guest-primary/5 flex flex-col items-center justify-center border-r border-dashed border-slate-200 relative shrink-0">
                    <span className="text-guest-primary font-black text-xl">{promo.value}</span>
                    {/* Cutout circles */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-guest-bg rounded-full" />
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-guest-bg rounded-full" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{promo.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{promo.desc}</p>
                    </div>
                    <div className="flex items-end justify-between mt-3 gap-2">
                      <span className="text-[10px] text-slate-400 truncate">{t('customer.promo.expireAt')} {promo.expiry}</span>
                      {isApplied ? (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-sm">check</span>
                          {t('customer.promo.using')}
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setInputCode(promo.code)
                            handleApply(promo.code)
                          }}
                          className="text-xs font-bold text-guest-primary border border-guest-primary px-3 py-1 rounded-full hover:bg-guest-primary hover:text-white transition-all active:scale-95 shrink-0 shadow-none bg-transparent h-auto w-auto"
                        >
                          {t('customer.promo.useNow')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* Sticky Footer Summary */}
      <footer className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 px-4 pt-4 pb-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-sm text-slate-500">
            <span>{t('customer.promo.subtotal')}</span>
            <span>—</span>
          </div>
          {appliedPromo && (
            <div className="flex justify-between text-sm gap-2 min-w-0">
              <span className="text-green-700 font-medium flex items-center gap-1 truncate">
                <span className="material-symbols-outlined text-base shrink-0">local_offer</span>
                <span className="truncate">{t('customer.promo.discountValue', { code: appliedPromo.code })}</span>
              </span>
              <span className="text-green-600 font-bold">{appliedPromo.value}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-1 border-t border-slate-100 min-w-0">
            <span className="font-bold text-slate-900 truncate">{t('customer.promo.totalAfter')}</span>
            <span className="text-xl font-black text-guest-primary shrink-0">—</span>
          </div>
        </div>
        <Button
          variant="guest"
          onClick={() => navigate(-1)}
          className="w-full font-bold py-3.5 rounded-xl text-base px-2"
        >
          <span className="truncate block">{appliedPromo ? t('customer.promo.useCodeBtn', { code: appliedPromo.code }) : t('customer.promo.confirmNoCodeBtn')}</span>
        </Button>
      </footer>

      <CustomerBottomNav token={token || ''} activeTab="cart" />
    </div>
  )
}
