import { Coffee, Trash2 } from 'lucide-react'
import { IPreOrderItemState } from '@/shared/types/reservation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'

interface Props {
  items: IPreOrderItemState[]
  onRemoveItem?: (index: number) => void
  onAddItem?: () => void
  readonly?: boolean
  variant?: 'guest' | 'admin'
}

export function PreOrderList({ items, onRemoveItem, onAddItem, readonly = false, variant = 'guest' }: Props) {
  const { t } = useTranslation()
  return (
    <div className={`col-span-2 rounded-2xl p-4 border mt-2 ${variant === 'admin' ? 'bg-blue-50/50 border-blue-100/50' : 'bg-orange-50/50 border-orange-100/50'}`}>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Coffee className={variant === 'admin' ? 'text-blue-500' : 'text-orange-500'} size={14} /> {t('pos.reservations.preorder.title', 'Món Đặt Trước')}
        </label>
        {!readonly && onAddItem && (
          <Button 
            type="button"
            variant="outline" 
            size="sm"
            onClick={onAddItem}
            className={`h-7 px-2.5 text-[11px] ${variant === 'admin' ? 'text-blue-600 border-blue-200 hover:bg-blue-50' : 'text-orange-600 border-orange-200 hover:bg-orange-50'}`}
          >
            + {t('pos.reservations.preorder.add', 'Thêm Món')}
          </Button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((pi, idx) => (
            <div key={idx} className={`bg-white p-3 rounded-xl border flex items-start justify-between gap-3 shadow-sm ${variant === 'admin' ? 'border-blue-100' : 'border-orange-100'}`}>
              <div className="flex-1">
                <div className="font-bold text-sm text-slate-800">{pi.qty}x {pi.item.name}</div>
                {pi.opts && pi.opts.length > 0 && (
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {pi.opts.map(o => o.name).join(', ')}
                  </div>
                )}
                {pi.note && <div className={`text-[11px] italic mt-0.5 ${variant === 'admin' ? 'text-blue-500' : 'text-orange-500'}`}>{t('pos.reservations.preorder.noteLabel', 'Ghi chú: {{note}}', { note: pi.note })}</div>}
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="font-bold text-primary text-sm">
                  {new Intl.NumberFormat('vi-VN').format(pi.item.basePrice * pi.qty)}đ
                </div>
                {!readonly && onRemoveItem && (
                  <Button 
                    variant="icon"
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    className="text-red-400 hover:text-red-600 p-1 mt-1 inline-flex rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-4 bg-white/50 rounded-xl border border-dashed ${variant === 'admin' ? 'border-blue-200' : 'border-orange-200'}`}>
          <p className={`text-xs font-medium ${variant === 'admin' ? 'text-blue-600/70' : 'text-orange-600/70'}`}>{t('pos.reservations.preorder.empty', 'Chưa có món nào được chọn')}</p>
        </div>
      )}
    </div>
  )
}
