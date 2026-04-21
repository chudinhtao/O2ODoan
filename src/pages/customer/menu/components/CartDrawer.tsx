import { ShoppingBasket, Edit } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ICart } from '../types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CartItemRow } from './CartItemRow'
// import Button removed
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Input } from '@/shared/components/ui/Input'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  cart?: ICart
  onUpdateQuantity: (cartItemId: string, quantity: number) => void
  onRemoveItem: (cartItemId: string) => void
  onClearCart: () => void
  onCheckout: () => void
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

export function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout }: CartDrawerProps) {
  const { t } = useTranslation()
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)
  const [note, setNote] = useState('')

  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 z-[80] backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#f8fafc] shadow-2xl z-[90] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center p-4 pb-3 bg-white border-b border-slate-100 gap-3">
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:scale-90 transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1">
                <h2 className="font-black text-lg text-slate-900">{t('customer.cart.title')}</h2>
                {itemCount > 0 && <p className="text-xs text-slate-400 font-medium">{itemCount} món đã chọn</p>}
              </div>
              {itemCount > 0 && (
                <button
                  onClick={() => setIsClearConfirmOpen(true)}
                  className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  {t('customer.cart.clearAll')}
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {!cart?.items || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBasket size={40} className="text-guest-primary" />
                  </div>
                  <h3 className="font-black text-lg text-slate-700">{t('customer.cart.emptyTitle')}</h3>
                  <p className="text-sm text-slate-400 max-w-xs mt-1">{t('customer.cart.emptyDesc')}</p>
                  <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-full border-2 border-guest-primary text-guest-primary font-bold text-sm hover:bg-orange-50 active:scale-95 transition-all">
                    {t('customer.cart.continueBtn')}
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {cart.items.map((item, index) => (
                      <CartItemRow key={item.cartItemId} item={item} isLast={index === cart.items.length - 1} onUpdateQuantity={onUpdateQuantity} onRemoveItem={onRemoveItem} />
                    ))}
                  </div>

                  {/* Note */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 flex items-center gap-3">
                    <Edit size={18} className="text-guest-primary shrink-0" />
                    <Input value={note} onChange={e => setNote(e.target.value)} placeholder={t('customer.cart.notePlaceholder')} className="bg-transparent border-0 shadow-none focus-visible:ring-0 px-0 text-sm" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="bg-white border-t border-slate-100 px-5 pt-4 pb-6 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.07)]">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>{t('customer.cart.subtotal', { count: itemCount })}</span>
                  <span className="font-semibold text-slate-700">{fmt(cart.originalTotal)}đ</span>
                </div>
                
                {cart.appliedPromotions?.length > 0 && (
                  <div className="mb-2 space-y-1">
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1.5">
                      {t('customer.cart.appliedPromos', 'Ưu đãi đã áp dụng')}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set(cart.appliedPromotions)).map((promo, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-full border border-orange-100 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                          {promo}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm text-green-600 pt-1.5 font-bold border-t border-green-100 mt-2">
                      <span>{t('customer.cart.discount', 'Tổng cộng giảm')}</span>
                      <span>-{fmt(cart.automatedDiscount)}đ</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center mb-1 border-t border-slate-50 pt-3">
                  <span className="font-bold text-slate-800">{t('customer.cart.total')}</span>
                  <span className="text-2xl font-black text-guest-primary">{fmt(cart.totalAmount)}đ</span>
                </div>
                <div className="text-right mb-4">
                  <span className="text-[10px] text-slate-400 font-medium italic">(Giá đã bao gồm VAT)</span>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full flex items-center justify-between bg-gradient-to-r from-[#ff7a00] to-[#ff5000] text-white font-bold text-base rounded-2xl py-4 px-5 shadow-[0_6px_20px_-4px_rgba(255,105,51,0.5)] active:scale-[0.98] transition-all"
                >
                  <span>{t('customer.cart.checkoutBtn')}</span>
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-px bg-white/30" />
                    <span className="font-black">{fmt(cart.totalAmount)}đ</span>
                  </div>
                </button>
              </div>
            )}

            <ConfirmDialog
              isOpen={isClearConfirmOpen}
              title={t('customer.cart.confirmClearAllTitle')}
              description={t('customer.cart.confirmClearAllDesc')}
              confirmText={t('customer.cart.confirmBtn')}
              cancelText={t('customer.cart.cancelBtn')}
              onConfirm={() => { onClearCart(); setIsClearConfirmOpen(false) }}
              onCancel={() => setIsClearConfirmOpen(false)}
              variant="danger"
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
