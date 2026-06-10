import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Flame, BadgePercent, Edit3, ShoppingCart, Tag
} from 'lucide-react'
import { IMenuItem, IMenuItemOption } from '../types'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useTranslation } from 'react-i18next'
import { ItemOptionGroup } from './ItemOptionGroup'
import { useServerTime } from '@/shared/hooks/useServerTime'
import { StepperInput } from '@/shared/components/ui/StepperInput'

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
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-[2px]"
          />

          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="flex flex-col w-full max-w-md max-h-[90vh] rounded-[24px] sm:rounded-[32px] overflow-hidden bg-white pointer-events-auto relative shadow-2xl"
            >
              <div className="flex-1 overflow-y-auto relative scrollbar-none">
                {/* Image Header */}
                <div className="w-full h-[240px] relative shrink-0 bg-slate-100">
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

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white active:scale-90 transition-all shadow-md z-10"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>

                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {item.isFeatured && (
                      <span className="inline-flex w-fit items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black uppercase px-3 py-1.5 rounded-full shadow-lg">
                        <Flame size={12} fill="currentColor" />
                        {t('customer.menu.bestSeller', 'Bán chạy nhất')}
                      </span>
                    )}
                    {hasDiscount && (
                      <span className="inline-flex w-fit items-center gap-1.5 bg-red-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
                        <BadgePercent size={12} />
                        -{discountPct}%
                      </span>
                    )}
                  </div>

                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                      <span className="bg-slate-900/90 text-white font-black text-sm px-5 py-2 rounded-full shadow-xl">{t('customer.itemDetail.outOfStock', 'Tạm hết hàng')}</span>
                    </div>
                  )}
                </div>

                {/* Content Body */}
                <div className="relative -mt-6 bg-white rounded-t-[24px] px-5 sm:px-6 pt-6 pb-6 flex flex-col min-h-full">
                  
                  {/* Title & Price */}
                  <div className="mb-6">
                    <h2 className="text-[22px] font-black text-slate-900 leading-snug mb-3">{item.name}</h2>
                    <div className="flex items-end gap-3 flex-wrap">
                      <span className="text-[28px] font-black text-[#ff6400] leading-none">{fmt(displayPrice)}đ</span>
                      {hasDiscount && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-slate-400 line-through font-semibold">{fmt(item.basePrice)}đ</span>
                          <span className="flex items-center gap-1 bg-red-50 text-red-500 text-[11px] font-black px-2 py-0.5 rounded border border-red-100">
                            <Tag size={10} strokeWidth={3} />
                            -{fmt(savings)}đ
                          </span>
                        </div>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[15px] text-slate-500 leading-relaxed mt-4">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {((item.optionGroups?.length ?? 0) > 0) && (
                    <div className="h-px bg-slate-100 mb-6 w-full" />
                  )}

                  {/* Options */}
                  {(item.optionGroups?.length ?? 0) > 0 && (
                    <div className="space-y-6 mb-6">
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

                  {((item.optionGroups?.length ?? 0) > 0) && (
                    <div className="h-px bg-slate-100 mb-6 w-full" />
                  )}

                  {/* Note */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[15px] font-bold text-slate-800">
                      <Edit3 size={18} className="text-slate-400" />
                      {t('customer.itemDetail.additionalNote')}
                    </label>
                    <textarea
                      placeholder={t('customer.itemDetail.noteExample')}
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      rows={2}
                      className="w-full text-[15px] text-slate-700 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-200 focus:border-[#ff6400] focus:ring-2 focus:ring-[#ff6400]/20 outline-none transition-all placeholder:text-slate-400 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="bg-white border-t border-slate-100 px-4 sm:px-5 py-4 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.08)] z-10 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <StepperInput
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={99}
                    className="h-12 sm:h-[52px] !p-1.5 !rounded-2xl"
                  />

                  <button
                    onClick={() => { if (isValid && item.isAvailable && !isAdding) { onAddToCart(item, quantity, selectedOptions, note); onClose() } }}
                    disabled={!isValid || !item.isAvailable || isAdding}
                    className={`
                      flex-1 h-12 sm:h-[52px] flex items-center justify-between px-3 sm:px-5 rounded-2xl
                      font-bold text-[14px] sm:text-[15px] text-white transition-all active:scale-[0.98] duration-150 min-w-0
                      ${isValid && item.isAvailable && !isAdding
                        ? 'bg-gradient-to-r from-[#ff7a00] to-[#ff4d00] shadow-[0_4px_20px_-4px_rgba(255,100,0,0.4)]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                      ${isAdding ? 'opacity-80' : ''}
                    `}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      {isAdding && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />}
                      <span className="truncate">{isAdding ? t('customer.itemDetail.adding', 'Đang thêm...') : (item.isAvailable ? t('customer.itemDetail.addToCart') : t('customer.itemDetail.outOfStock', 'Tạm hết hàng'))}</span>
                    </div>
                    {item.isAvailable && !isAdding && (
                      <span className="font-black text-[14px] sm:text-[16px] bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-lg shrink-0">{fmt(calculateTotal())}đ</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
