import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { type PreOrderItem } from '../views/BookingMenuPage'

interface BookingCartBarProps {
  cart: PreOrderItem[]
  onRemoveItem: (index: number) => void
  onConfirm: () => void
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

export function BookingCartBar({ cart, onRemoveItem, onConfirm }: BookingCartBarProps) {
  const { t } = useTranslation()
  const totalQty = cart.reduce((s, c) => s + c.qty, 0)
  const totalEst = cart.reduce((s, c) => {
    const base = c.item.salePrice ?? c.item.basePrice
    const extras = Object.values(c.opts).flat().reduce((x, o) => x + o.extraPrice, 0)
    return s + (base + extras) * c.qty
  }, 0)

  if (totalQty === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white p-3 pb-5 shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.12)]">
      {/* Mini cart list — last 2 items */}
      {cart.length > 0 && (
        <div className="flex flex-col gap-1 mb-2.5">
          {cart.slice(-2).map((c, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-orange-50/50">
              <span className="text-xs font-semibold text-text-base truncate mr-2">
                {c.qty}× {c.item.name}
              </span>
              <Button
                type="button"
                variant="icon"
                onClick={() => onRemoveItem(cart.indexOf(c))}
                className="w-auto h-auto min-w-0 bg-transparent border-none cursor-pointer text-text-subtle hover:bg-transparent hover:text-red-500 transition-colors p-0.5 shrink-0"
              >
                <X size={12} />
              </Button>
            </div>
          ))}
          {cart.length > 2 && (
            <p className="text-[0.7rem] text-text-muted text-center m-0 mt-1">
              +{cart.length - 2} {t('customer.home.moreItems', 'món khác')}
            </p>
          )}
        </div>
      )}

      {/* CTA */}
      <Button
        onClick={onConfirm}
        className="w-full h-auto p-3 rounded-xl border-none cursor-pointer bg-gradient-to-br from-guest-primary to-guest-primary-dark flex items-center justify-between shadow-md hover:-translate-y-0.5 hover:shadow-lg hover:shadow-guest-primary/40 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-[0.7rem] font-black text-white">{totalQty}</span>
          </div>
          <span className="font-extrabold text-[0.9rem] text-white">
            {t('customer.bookingMenu.confirmBtn', 'Xác nhận chọn món')}
          </span>
        </div>
        <span className="font-bold text-[0.85rem] text-white/90">
          ~{fmt(totalEst)}đ
        </span>
      </Button>
    </div>
  )
}
