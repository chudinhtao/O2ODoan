import { IMenuItem } from '@/pages/admin/menu/types/adminMenu.type'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { Plus, Flame, Snowflake, Coffee, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface MenuItemCardProps {
  item: IMenuItem
  onAdd: (item: IMenuItem) => void
}

const PLACEHOLDER = 'https://placehold.co/300x300/f1f5f9/94a3b8?text=No+Image'

function calcDiscount(base: number, sale: number) {
  return Math.round(((base - sale) / base) * 100)
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const { t, i18n } = useTranslation()

  const STATION_CONFIG = {
    HOT:   { icon: Flame,     color: 'text-orange-500', label: t('pos.menu.item.status.hot', 'Nóng') },
    COLD:  { icon: Snowflake, color: 'text-sky-500',    label: t('pos.menu.item.status.cold', 'Lạnh') },
    DRINK: { icon: Coffee,    color: 'text-emerald-500', label: t('pos.menu.item.status.drink', 'Nước') },
  } as const

  const hasSale  = !!item.salePrice && item.salePrice < item.basePrice
  const discount = hasSale ? calcDiscount(item.basePrice, item.salePrice!) : 0
  const station  = item.station ? STATION_CONFIG[item.station] : null
  const StIcon   = station?.icon

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
      currencyDisplay: 'symbol'
    }).format(amount)
  }

  return (
    <div
      onClick={() => item.isAvailable && onAdd(item)}
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-surface-container-lowest border transition-all duration-300
        ${item.isAvailable
          ? 'border-outline-variant/40 shadow-sm hover:shadow-xl hover:shadow-black/8 hover:-translate-y-0.5 cursor-pointer'
          : 'opacity-50 cursor-not-allowed grayscale border-outline-variant/30'
        }`}
    >
      {/* ── Image ── */}
      <div className="relative w-full aspect-[4/3] shrink-0 overflow-hidden bg-surface-container">
        <ImageWithFallback
          src={item.imageUrl}
          fallback={PLACEHOLDER}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Discount badge — only badge on image */}
        {hasSale && (
          <span className="absolute top-2 right-2 z-10 bg-error text-on-error text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
            -{discount}%
          </span>
        )}

        {/* Unavailable overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-surface/60 flex items-center justify-center z-20">
            <span className="bg-inverse-surface text-inverse-on-surface text-xs font-bold px-3 py-1 rounded-full">
              {t('pos.menu.item.outOfStock', 'Hết món')}
            </span>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="flex flex-col flex-1 p-2 gap-0.5">

        {/* Meta chips row: station · featured · category */}
        <div className="flex items-center gap-1.5 flex-wrap min-h-[14px]">
          {station && StIcon && (
            <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${station.color}`}>
              <StIcon className="size-3" />
              {station.label}
            </span>
          )}
          {item.isFeatured && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-tertiary">
              <Star className="size-3 fill-tertiary stroke-tertiary" />
              {t('pos.menu.item.featured', 'Nổi bật')}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-[13px] font-bold text-on-surface leading-tight line-clamp-2 h-[32px]">
          {item.name}
        </h3>

        {/* Option hint */}
        <div className="min-h-[14px] flex items-center">
          {item.optionGroups && item.optionGroups.length > 0 && (
            <p className="text-[10px] text-on-surface-variant font-medium">
              {t('pos.menu.item.optionsCount', { count: item.optionGroups.length })}
            </p>
          )}
        </div>

        {/* Price + Add button */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col leading-tight min-h-[30px] justify-center">
            {hasSale ? (
              <>
                <span className="text-[10px] text-outline line-through">
                  {formatPrice(item.basePrice)}
                </span>
                <span className="text-[15px] font-black text-error">
                  {formatPrice(item.salePrice!)}
                </span>
              </>
            ) : (
              <span className="text-[15px] font-black text-primary">
                {formatPrice(item.basePrice)}
              </span>
            )}
          </div>

          {item.isAvailable && (
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(item) }}
              className="p-1 text-primary hover:text-primary/80 active:scale-90 transition-all duration-150 shrink-0"
            >
              <Plus className="size-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
