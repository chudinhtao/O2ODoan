import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Flame, BadgePercent, Edit3, Minus, Plus, ShoppingCart, Tag
} from 'lucide-react'
import { IMenuItem, IMenuItemOption } from '../types'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useTranslation } from 'react-i18next'
import { ItemOptionGroup } from './ItemOptionGroup'
import { useServerTime } from '@/shared/hooks/useServerTime'

interface ItemDetailModalProps {
  isOpen: boolean
  onClose: () => void
  item: IMenuItem | null
  onAddToCart: (
    item: IMenuItem,
    quantity: number,
    selectedOptions: Record<string, IMenuItemOption[]>,
    note: string
  ) => void;
  isAdding?: boolean;
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

export function ItemDetailModal({ isOpen, onClose, item, onAddToCart, isAdding }: ItemDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, IMenuItemOption[]>>({})
  const [note, setNote] = useState('')
  const { t } = useTranslation()
  const { isExpired, isScheduleActive } = useServerTime(5000); // 5s check 1 lần cho nhẹ

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(1)
      setNote('')
      const defaults: Record<string, IMenuItemOption[]> = {}
      item.optionGroups?.forEach((g) => {
        defaults[g.id] = g.isRequired && g.options.length > 0 ? [g.options[0]] : []
      })
      setSelectedOptions(defaults)
    }
  }, [isOpen, item])

  if (!item) return null

  // Chốt chặn Client: Kiểm tra Flash Sale có bị hết hạn không dựa trên serverTime + Schedules
  const isSaleExpired = item.saleEndAt ? isExpired(item.saleEndAt) : false
  const isCurrentlyInSchedule = isScheduleActive(item.schedules)
  
  const hasDiscount = !!(
    item.salePrice && 
    item.salePrice < item.basePrice && 
    !isSaleExpired &&
    isCurrentlyInSchedule
  )
  const displayPrice = hasDiscount ? item.salePrice! : item.basePrice
  const savings = hasDiscount ? item.basePrice - item.salePrice! : 0
  const discountPct = hasDiscount
    ? Math.round(((item.basePrice - item.salePrice!) / item.basePrice) * 100)
    : 0

  const calculateTotal = () => {
    const base = displayPrice
    const extras = Object.values(selectedOptions).flat().reduce((s, o) => s + o.extraPrice, 0)
    return (base + extras) * quantity
  }

  const handleToggleOption = (groupId: string, option: IMenuItemOption, isSingle: boolean) => {
    setSelectedOptions(prev => {
      const cur = prev[groupId] || []
      if (isSingle) return { ...prev, [groupId]: [option] }
      const has = cur.some(o => o.id === option.id)
      return { ...prev, [groupId]: has ? cur.filter(o => o.id !== option.id) : [...cur, option] }
    })
  }

  const isValid = item.optionGroups?.every(g =>
    !g.isRequired || (selectedOptions[g.id]?.length ?? 0) > 0
  ) ?? true

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col max-h-[92vh] rounded-t-[32px] overflow-hidden bg-[#f8fafc]"
          >
            <div className="flex justify-center pt-3 pb-1 bg-[#f8fafc] shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Image card */}
              <div className="mx-4 mt-2 rounded-3xl overflow-hidden relative bg-slate-200 shadow-xl" style={{ height: '220px' }}>
                {item.imageUrl ? (
                  <ImageWithFallback
                    src={item.imageUrl} alt={item.name}
                    className="w-full h-full object-cover"
                    fallback="/placeholder.png"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
                    <ShoppingCart size={64} className="text-orange-200" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full text-white active:scale-90 transition-all shadow-md"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>

                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {item.isFeatured && (
                    <span className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow">
                      <Flame size={11} fill="currentColor" />
                      Bán chạy
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="flex items-center gap-1 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
                      <BadgePercent size={11} />
                      -{discountPct}%
                    </span>
                  )}
                </div>

                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-slate-900/80 text-white font-black text-sm px-4 py-1.5 rounded-full">Tạm hết hàng</span>
                  </div>
                )}
              </div>

              {/* Info card */}
              <div className="mx-4 mt-3 bg-white rounded-3xl shadow-sm border border-slate-100 px-5 pt-5 pb-4">
                <h2 className="text-xl font-black text-slate-900 leading-snug mb-3">{item.name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[26px] font-black text-guest-primary leading-none">{fmt(displayPrice)}đ</span>
                  {hasDiscount && (
                    <>
                      <span className="text-sm text-slate-400 line-through font-medium">{fmt(item.basePrice)}đ</span>
                      <span className="ml-auto flex items-center gap-1 bg-gradient-to-r from-red-50 to-orange-50 text-red-500 text-[11px] font-black px-3 py-1 rounded-full border border-red-100">
                        <Tag size={11} strokeWidth={2.5} />
                        -{fmt(savings)}đ
                      </span>
                    </>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-slate-500 leading-relaxed mt-3 pt-3 border-t border-slate-100">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Options card */}
              {(item.optionGroups?.length ?? 0) > 0 && (
                <div className="mx-4 mt-3 bg-white rounded-3xl shadow-sm border border-slate-100 px-5 py-4 space-y-5">
                  {item.optionGroups!.map(group => (
                    <ItemOptionGroup
                      key={group.id}
                      group={group}
                      selectedOptions={selectedOptions[group.id] || []}
                      onToggleOption={(opt, isSingle) => handleToggleOption(group.id, opt, isSingle)}
                    />
                  ))}
                </div>
              )}

              {/* Note card */}
              <div className="mx-4 mt-3 mb-4 bg-white rounded-3xl shadow-sm border border-slate-100 px-5 py-4">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2.5">
                  <Edit3 size={15} className="text-slate-400" />
                  {t('customer.itemDetail.additionalNote')}
                </label>
                <textarea
                  placeholder={t('customer.itemDetail.noteExample')}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  rows={2}
                  className="w-full text-sm text-slate-700 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-guest-primary focus:ring-2 focus:ring-guest-primary/20 outline-none transition-all placeholder:text-slate-400 resize-none"
                />
              </div>

              <div className="h-28" />
            </div>

            {/* Pinned footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 pt-3 pb-6 shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.1)]">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-2xl border-2 border-slate-200 overflow-hidden shrink-0">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-90 transition-all"
                  >
                    <Minus size={18} strokeWidth={2.5} />
                  </button>
                  <span className="w-9 text-center font-black text-[17px] text-slate-900 select-none">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-90 transition-all"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                </div>

                <button
                  onClick={() => { if (isValid && item.isAvailable && !isAdding) { onAddToCart(item, quantity, selectedOptions, note); onClose() } }}
                  disabled={!isValid || !item.isAvailable || isAdding}
                  className={`
                    flex-1 h-12 flex items-center justify-between px-5 rounded-2xl
                    font-bold text-[14px] text-white transition-all active:scale-[0.97] duration-150
                    ${isValid && item.isAvailable && !isAdding
                      ? 'bg-gradient-to-r from-[#ff7a00] to-[#ff4d00] shadow-[0_4px_20px_-4px_rgba(255,100,0,0.55)]'
                      : 'bg-slate-300 cursor-not-allowed'}
                    ${isAdding ? 'opacity-80' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {isAdding && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    <span>{isAdding ? t('customer.itemDetail.adding', 'Đang thêm...') : (item.isAvailable ? t('customer.itemDetail.addToCart') : 'Tạm hết hàng')}</span>
                  </div>
                  {item.isAvailable && !isAdding && (
                    <span className="font-black text-[15px]">{fmt(calculateTotal())}đ</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
