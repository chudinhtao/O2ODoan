import { CartItemRow } from './CartItemRow'
import { ICart, ICartItem } from '../types/posOrder.type'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Button } from '@/shared/components/ui/Button'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { ShoppingCart, Trash2, LayoutGrid } from 'lucide-react'

interface CartPanelProps {
  tableId?: string
  tableNumber: number
  cart: ICart | undefined
  isCartLoading: boolean
  isSubmitting: boolean
  onUpdateQuantity: (cartItemId: string, qty: number) => void
  onRemoveItem: (cartItemId: string) => void
  onSubmitTicket: () => void
  onCheckout?: () => void
  onEditItem?: (item: ICartItem) => void
  onClearCart?: () => void
}

export function CartPanel({
  tableId,
  tableNumber, cart, isCartLoading, isSubmitting,
  onUpdateQuantity, onRemoveItem,
  onSubmitTicket, onCheckout, onEditItem, onClearCart
}: CartPanelProps) {
  const { t } = useTranslation()
  const isEmpty    = !cart || cart.items.length === 0
  const hasSession = !!cart?.sessionToken
  const itemCount  = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0
  // isTakeaway chỉ true khi tableId TƯỜNG MINH là 'takeaway', không phải khi tableNumber = 0
  const isTakeaway = tableId === 'takeaway'
  const isNoSelection = !tableId // Chưa chọn bàn hoặc mang về

  // Màn hướng dẫn khi chưa chọn bàn
  if (isNoSelection) {
    return (
      <div className="flex flex-col h-full min-h-0 bg-surface-container-lowest items-center justify-center gap-4 p-6 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-surface-variant flex items-center justify-center">
          <LayoutGrid className="size-8 text-outline/50" />
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface-variant">
            {t('pos.cart.selectFirst', 'Chọn bàn hoặc Mang về')}
          </p>
          <p className="text-xs text-outline mt-1">
            {t('pos.cart.selectFirstDesc', 'Dùng dropdown phía trên để chọn bàn hoặc tạo đơn mang về.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-surface-container-lowest">

      {/* ── Header ── */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ShoppingCart className="size-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black text-on-surface leading-tight">
              {isTakeaway
                ? t('pos.cart.takeaway', 'Mang về')
                : `${t('pos.order.table', 'Bàn')} ${tableNumber}`}
            </h2>
            {!isEmpty && (
              <p className="text-[10px] text-outline font-medium">
                {t('pos.cart.items', { count: itemCount })}
              </p>
            )}
          </div>
        </div>

        {/* Clear cart — chỉ hiện khi local cart (chưa có session) */}
        {!isEmpty && onClearCart && !hasSession && (
          <button
            onClick={onClearCart}
            className="text-outline hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error/10"
            title={t('pos.cart.clearAll', 'Xoá tất cả')}
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {/* ── Item list ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-hide">
        {isCartLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-outline gap-3 opacity-60 select-none">
            <ShoppingCart className="size-10 stroke-1" />
            <p className="text-sm font-semibold">{t('pos.cart.empty', 'Chưa có món nào')}</p>
          </div>
        ) : (
          cart.items.map(item => (
            <CartItemRow
              key={item.cartItemId}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemoveItem}
              onEdit={onEditItem}
            />
          ))
        )}
      </div>

      {/* ── Summary + Actions ── */}
      <div className="shrink-0 border-t border-outline-variant/30 bg-surface-container-lowest">
        {!isEmpty && cart && (
          <div className="px-4 py-2 border-b border-outline-variant/10 space-y-1">
            <div className="flex justify-between text-[11px] text-outline font-medium">
              <span>Tạm tính</span>
              <span>{formatCurrency(cart.originalTotal)}</span>
            </div>
            {cart.automatedDiscount > 0 && (
              <div className="flex justify-between text-[11px] text-success font-bold">
                <span>Giảm giá tự động</span>
                <span>-{formatCurrency(cart.automatedDiscount)}</span>
              </div>
            )}
          </div>
        )}

        {/* Total row */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-bold text-on-surface-variant">{t('pos.cart.total', 'Tổng cộng')}</span>
          <span className="text-xl font-black text-primary">{formatCurrency(cart?.totalAmount ?? 0)}</span>
        </div>

        {/* Action buttons */}
        <div className="px-3 pb-3 flex flex-col gap-2">
          {isTakeaway ? (
            /* Takeaway: chỉ thanh toán */
            <Button
              variant="primary"
              size="lg"
              onClick={onCheckout}
              disabled={isEmpty || isSubmitting}
              className="w-full rounded-xl font-bold"
            >
              <span className="material-symbols-outlined text-lg mr-2">payments</span>
              {t('pos.cart.payNow', 'Thanh toán')}
            </Button>
          ) : hasSession ? (
            /* Table with active session: gửi bếp + thanh toán */
            <>
              <Button
                variant="primary"
                size="lg"
                onClick={onSubmitTicket}
                disabled={isEmpty || isSubmitting}
                className="w-full rounded-xl font-bold"
              >
                <span className="material-symbols-outlined text-lg mr-2">local_dining</span>
                {t('pos.cart.sendKitchen', 'Gửi bếp')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onCheckout}
                disabled={isSubmitting}
                className="w-full rounded-xl font-bold border-2 border-outline-variant hover:border-primary hover:text-primary"
              >
                <span className="material-symbols-outlined text-lg mr-2">payments</span>
                {t('pos.cart.checkout', 'Thanh toán')}
              </Button>
            </>
          ) : (
            /* Table, chưa có session: tạo đơn mới */
            <Button
              variant="primary"
              size="lg"
              onClick={onSubmitTicket}
              disabled={isEmpty || isSubmitting}
              className="w-full rounded-xl font-bold"
            >
              <span className="material-symbols-outlined text-lg mr-2">local_dining</span>
              {t('pos.cart.newOrder', 'Tạo đơn & Báo bếp')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
