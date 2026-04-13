import { ICartItem } from '../types/posOrder.type'
import { Minus, Plus, Trash2, Pencil } from 'lucide-react'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useTranslation } from 'react-i18next'

interface CartItemRowProps {
  item: ICartItem
  onIncrease: (cartItemId: string) => void
  onDecrease: (cartItemId: string, currentQty: number) => void
  onRemove: (cartItemId: string) => void
  onEdit?: (item: ICartItem) => void
}

export function CartItemRow({ item, onIncrease, onDecrease, onRemove, onEdit }: CartItemRowProps) {
  const { t } = useTranslation()
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-3 flex flex-col gap-2 hover:border-outline-variant/60 transition-colors">
      {/* Top: name + price + edit */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-on-surface leading-snug line-clamp-2">{item.name}</h4>

          {/* Options chips */}
          {item.options && item.options.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {item.options.map((o, idx) => (
                <span key={idx} className="text-[10px] px-2 py-0.5 bg-primary/8 text-primary rounded-full font-semibold">
                  {o.optionName}
                </span>
              ))}
            </div>
          )}

          {/* Note */}
          {item.note && (
            <p className="text-[10px] text-on-surface-variant italic mt-1 line-clamp-1">📝 {item.note}</p>
          )}
        </div>

        {/* Price + edit icon */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-sm font-black text-on-surface">{formatCurrency(item.lineTotal)}</span>
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="text-outline hover:text-primary transition-colors p-0.5 rounded"
              title={t('pos.cart.edit', 'Chỉnh sửa')}
            >
              <Pencil className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom: quantity stepper + remove */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-surface-container rounded-lg overflow-hidden border border-outline-variant/30">
          <button
            onClick={() => onDecrease(item.cartItemId, item.quantity)}
            className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <Minus className="size-3.5 stroke-2" />
          </button>
          <span className="w-8 text-center text-sm font-black text-on-surface select-none">{item.quantity}</span>
          <button
            onClick={() => onIncrease(item.cartItemId)}
            className="w-7 h-7 flex items-center justify-center bg-primary text-on-primary hover:bg-primary/90 transition-colors"
          >
            <Plus className="size-3.5 stroke-2" />
          </button>
        </div>

        <button
          onClick={() => onRemove(item.cartItemId)}
          className="text-outline hover:text-error transition-colors p-1 rounded-lg hover:bg-error/10"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}
