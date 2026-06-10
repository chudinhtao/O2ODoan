import { Trash2, Minus, Plus } from 'lucide-react'
import { ICartItem } from '../types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { CountdownTimer } from './CountdownTimer'
import { useServerTime } from '@/shared/hooks/useServerTime'

interface CartItemRowProps {
  item: ICartItem
  isLast: boolean
  onUpdateQuantity: (cartItemId: string, quantity: number) => void
  onRemoveItem: (cartItemId: string) => void
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

export function CartItemRow({ item, isLast, onUpdateQuantity, onRemoveItem }: CartItemRowProps) {
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false)
  const { t } = useTranslation()
  const { isExpired, isScheduleActive } = useServerTime(10000)

  const isSaleExpired = item.saleEndAt ? isExpired(item.saleEndAt) : false
  const isCurrentlyInSchedule = isScheduleActive(item.schedules)
  const hasActiveFlashSale = item.hasFlashSale && !isSaleExpired && isCurrentlyInSchedule

  return (
    <>
      <div className={`p-4 flex gap-3 ${!isLast ? 'border-b border-slate-50' : ''}`}>
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-white font-black text-xl select-none ${item.station === 'BAR' ? 'bg-gradient-to-br from-amber-400 to-orange-400' : 'bg-gradient-to-br from-orange-500 to-red-400'}`}>
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
          {hasActiveFlashSale && item.saleEndAt && (
            <div className="absolute top-0.5 right-0.5">
              <CountdownTimer endDate={item.saleEndAt} showIcon={false} className="!text-[7px] !px-1 !py-0 !bg-red-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between gap-2 items-start">
            <h4 className="font-bold text-sm text-slate-800 leading-tight truncate flex-1">{item.name}</h4>
            <button
              onClick={() => setIsRemoveConfirmOpen(true)}
              className="text-slate-300 hover:text-red-400 transition-colors shrink-0 p-0.5"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {item.options.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.options.map((opt, i) => (
                <span key={i} className="text-[10px] bg-orange-50 text-guest-primary font-medium px-2 py-0.5 rounded-full border border-orange-100">
                  {opt.optionName}{opt.extraPrice > 0 ? ` +${fmt(opt.extraPrice)}đ` : ''}
                </span>
              ))}
            </div>
          )}

          {item.note && (
            <p className="text-[11px] text-slate-400 mt-0.5 italic truncate">{item.note}</p>
          )}

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-guest-primary text-sm">{fmt(item.lineTotal)}đ</span>
                {hasActiveFlashSale && (
                   <span className="flex items-center gap-0.5 text-[8px] text-red-500 font-bold bg-red-50 px-1 rounded border border-red-100 uppercase animate-pulse">
                     {t('customer.menu.almostEmpty', 'Sắp hết')}
                   </span>
                )}
              </div>
              {hasActiveFlashSale && (
                <span className="text-[10px] text-slate-400 line-through">
                  {fmt(item.basePrice * item.quantity + item.options.reduce((acc, opt) => acc + opt.extraPrice * item.quantity, 0))}đ
                </span>
              )}
            </div>
            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
              <button
                onClick={() => onUpdateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-90 transition-all"
              >
                <Minus size={13} strokeWidth={2.5} />
              </button>
              <span className="w-7 text-center font-black text-sm text-slate-800">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-100 active:scale-90 transition-all"
              >
                <Plus size={13} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isRemoveConfirmOpen}
        title={t('customer.cart.confirmRemoveItemTitle') as string}
        description={t('customer.cart.confirmRemoveItemDesc') as string}
        confirmText={t('customer.cart.confirmBtn') as string}
        cancelText={t('customer.cart.cancelBtn') as string}
        onConfirm={() => { onRemoveItem(item.cartItemId); setIsRemoveConfirmOpen(false) }}
        onCancel={() => setIsRemoveConfirmOpen(false)}
        variant="danger"
      />
    </>
  )
}
