import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

interface CartFloatingButtonProps {
  itemCount: number
  totalAmount: number
  onClick: () => void
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

export function CartFloatingButton({ itemCount, totalAmount, onClick }: CartFloatingButtonProps) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-[86px] left-0 right-0 z-40 flex justify-center pointer-events-none"
        >
          <button
            onClick={onClick}
            className="
              pointer-events-auto
              flex items-center gap-0 overflow-hidden
              rounded-full
              shadow-[0_8px_32px_-8px_rgba(255,90,0,0.6)]
              active:scale-[0.96] transition-transform duration-150
            "
          >
            {/* Count badge — dark left side */}
            <div className="bg-slate-900 h-[46px] flex items-center justify-center px-4 gap-2 shrink-0">
              <div className="w-5 h-5 rounded-full bg-guest-primary flex items-center justify-center shrink-0">
                <span className="text-white font-black text-[11px] leading-none">{itemCount}</span>
              </div>
              <span className="text-white/80 text-sm font-medium whitespace-nowrap">
                {t('customer.cart.itemSummary', { count: itemCount })}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-[28px] bg-white/10 bg-slate-700 shrink-0" />

            {/* Price + arrow — orange right side */}
            <div className="bg-gradient-to-r from-[#ff7a00] to-[#ff5200] h-[46px] flex items-center gap-2 px-4 shrink-0">
              <span className="text-white font-black text-[15px] whitespace-nowrap">{fmt(totalAmount)}đ</span>
              <span className="material-symbols-outlined text-white/80 text-[18px]">shopping_bag</span>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
