import { Plus, Minus, X, Check, Flame, Snowflake, Coffee, Star, UtensilsCrossed, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IMenuItem } from '@/pages/admin/menu/types/adminMenu.type'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { StepperInput } from '@/shared/components/ui/StepperInput'
import { Button } from '@/shared/components/ui/Button'
import { Textarea } from '@/shared/components/ui/Textarea'
import { useModifierSelection } from '../hooks/useModifierSelection'
import { useServerTime } from '@/shared/hooks/useServerTime'

interface ItemModifierModalProps {
  isOpen: boolean
  onClose: () => void
  item: IMenuItem | null
  onAddToCart: (item: IMenuItem, quantity: number, options: string[], note: string, editingCartItemId?: string) => void
  editingCartItemId?: string
  initialQuantity?: number
  initialNote?: string
  initialOptions?: string[]
}

export function ItemModifierModal({
  isOpen, onClose, item, onAddToCart,
  editingCartItemId, initialQuantity, initialNote, initialOptions: initialOptsArray
}: ItemModifierModalProps) {
  const { t, i18n } = useTranslation()
  const { isExpired } = useServerTime(5000)

  const STATION_CONFIG = {
    HOT:   { icon: Flame,     color: 'text-orange-500', bg: 'bg-orange-500/10', label: t('pos.menu.item.status.hot', 'Nóng') },
    COLD:  { icon: Snowflake, color: 'text-sky-500',    bg: 'bg-sky-500/10',    label: t('pos.menu.item.status.cold', 'Lạnh') },
    DRINK: { icon: Coffee,    color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: t('pos.menu.item.status.drink', 'Nước') },
    RETAIL:{ icon: Package,   color: 'text-slate-500',  bg: 'bg-slate-500/10',  label: t('pos.menu.item.status.retail', 'Bán lẻ') },
  } as const

  const {
    quantity, setQuantity, handleDecreaseQuantity, handleIncreaseQuantity,
    note, setNote, selectedOptions, handleToggleOption,
    totalPrice, isValid, flatOptions
  } = useModifierSelection(item, isOpen, initialQuantity, initialNote, initialOptsArray)

  if (!isOpen || !item) return null

  // Chốt chặn Server Time cho POS
  const isSaleExpired = item.saleEndAt ? isExpired(item.saleEndAt) : false
  const hasSale   = !!item.salePrice && item.salePrice < item.basePrice && !isSaleExpired
  const station   = item.station ? STATION_CONFIG[item.station] : null
  const StIcon    = station?.icon
  const hasGroups = !!item.optionGroups?.length

  const handleAdd = () => {
    if (!isValid) return
    onAddToCart(item, quantity, flatOptions, note, editingCartItemId)
    onClose()
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
      currencyDisplay: 'symbol'
    }).format(amount)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-250 h-[90vh] md:h-[85vh] max-h-[800px] min-h-[600px] ring-1 ring-outline-variant/30">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 size-8 flex items-center justify-center rounded-full bg-surface hover:bg-surface-variant text-on-surface transition-all shadow-md ring-1 ring-outline-variant/30"
        >
          <X className="size-4" />
        </button>

        {/* ── LEFT: Image + Item Info ── */}
        <div className="w-full md:w-[400px] shrink-0 flex flex-col bg-surface-container-lowest border-b md:border-b-0 md:border-r border-outline-variant/30">
          <div className="relative h-80 shrink-0 overflow-hidden bg-surface-container hidden md:block">
            <ImageWithFallback
              src={item.imageUrl || ''}
              alt={item.name}
              fallback="https://placehold.co/400x400/f1f5f9/94a3b8?text=No+Image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {hasSale && (
              <span className="absolute bottom-3 left-3 z-10 bg-error text-on-error text-[11px] font-black px-2.5 py-1 rounded-full shadow-md">
                -{Math.round(((item.basePrice - item.salePrice!) / item.basePrice) * 100)}%
              </span>
            )}
          </div>

          <div className="flex flex-col shrink-0 md:flex-1 p-4 md:p-5 gap-2 md:gap-3">
            <div className="hidden md:flex flex-wrap items-center gap-2">
              {item.categoryName && (
                <span className="text-[11px] font-semibold text-outline uppercase tracking-wide">
                  {item.categoryName}
                </span>
              )}
              {station && StIcon && (
                <span className={`flex items-center gap-1 text-[11px] font-semibold ${station.color} ${station.bg} px-2 py-0.5 rounded-full`}>
                  <StIcon className="size-3" />
                  {station.label}
                </span>
              )}
              {item.isFeatured && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full">
                  <Star className="size-3 fill-tertiary stroke-tertiary" />
                  {t('pos.menu.item.featured', 'Nổi bật')}
                </span>
              )}
            </div>

            <h3 className="text-xl font-black text-on-surface font-headline leading-tight">
              {item.name}
            </h3>

            {item.description && (
              <p className="hidden md:block text-sm text-on-surface-variant leading-relaxed line-clamp-3">
                {item.description}
              </p>
            )}

            <div className="mt-auto pt-2 border-t border-outline-variant/30">
              {hasSale ? (
                <div className="flex flex-col">
                  <span className="text-xs text-outline line-through">{formatPrice(item.basePrice)}</span>
                  <span className="text-2xl font-black text-error">{formatPrice(item.salePrice!)}</span>
                </div>
              ) : (
                <span className="text-2xl font-black text-primary">{formatPrice(item.basePrice)}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Options + Note + Footer ── */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6 pt-4 md:pt-14 space-y-6 scrollbar-hide">
            {!hasGroups && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-outline py-12">
                <UtensilsCrossed className="size-12 stroke-1" />
                <p className="text-sm font-medium">{t('pos.menu.modifier.noOptions', 'Món này không có tuỳ chọn thêm')}</p>
              </div>
            )}

            {item.optionGroups?.sort((a, b) => a.displayOrder - b.displayOrder).map(group => (
              <div key={group.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-primary shrink-0" />
                  <h4 className="text-sm font-black text-on-surface uppercase tracking-wide flex-1 truncate">
                    {group.name}
                  </h4>
                  {group.isRequired ? (
                    <span className="text-[10px] bg-error-container text-on-error-container px-2 py-0.5 rounded-full font-black shrink-0">
                      {t('pos.menu.modifier.required', 'BẮT BUỘC')}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-surface-container text-outline px-2 py-0.5 rounded-full font-semibold shrink-0">
                      {t('pos.menu.modifier.optional', 'Tuỳ chọn')}
                    </span>
                  )}
                </div>

                <div className={`grid gap-2 ${group.options.length >= 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {group.options.map(opt => {
                    const isSelected = (selectedOptions[group.id!] || []).includes(opt.id!)
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleToggleOption(group, opt.id!)}
                        className={`flex items-center justify-between p-3.5 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'bg-primary/5 border-primary shadow-sm'
                            : 'bg-surface-container-lowest border-outline-variant/40 hover:border-outline hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`size-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-primary border-primary' : 'border-outline'
                          }`}>
                            {isSelected && <Check className="size-2.5 text-on-primary stroke-[3]" />}
                          </div>
                          <span className={`text-sm truncate transition-colors ${
                            isSelected ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'
                          }`}>
                            {opt.name}
                          </span>
                        </div>
                        {opt.extraPrice > 0 && (
                          <span className={`text-xs font-bold shrink-0 ml-1 px-1.5 py-0.5 rounded-lg ${
                            isSelected ? 'bg-primary/10 text-primary' : 'bg-surface-container text-outline'
                          }`}>
                            +{formatPrice(opt.extraPrice)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

          </div>

          {/* ── Fixed Note & Footer ── */}
          <div className="shrink-0 flex flex-col bg-surface-container-lowest border-t border-outline-variant/30">
            <div className="p-5 pb-0">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-wide">
                  {t('pos.menu.modifier.specialNote', 'Ghi chú')}
                </h4>
                <Textarea
                  placeholder={t('pos.menu.modifier.notePlaceholder', 'Vd: Ít đường, không đá, không cay...')}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="!bg-surface-container-lowest !border-2 !border-outline-variant/40 focus-within:!border-primary/60 !text-on-surface resize-none min-h-[80px]"
                />
              </div>
            </div>

            <div className="p-5 flex items-center gap-4">
            <div className="shrink-0">
              <StepperInput
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={999}
                variant="admin"
                className="bg-surface-container-lowest border-outline-variant/30 py-1.5"
              />
            </div>

            <Button
              size="lg"
              onClick={handleAdd}
              disabled={!isValid}
              className="flex-1 rounded-xl font-bold py-4 flex items-center justify-between px-5 shadow-md hover:shadow-lg transition-all"
            >
              <span className="text-base">{t('pos.menu.modifier.addToCart', 'Thêm vào giỏ')}</span>
              <span className="text-base font-black">{formatPrice(totalPrice)}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
