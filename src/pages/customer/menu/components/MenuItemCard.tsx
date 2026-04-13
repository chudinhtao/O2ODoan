import { Flame, Plus, UtensilsCrossed } from 'lucide-react'
import { IMenuItem } from '../types'

interface MenuItemCardProps {
  item: IMenuItem
  onAdd: (item: IMenuItem) => void
  variant?: 'vertical' | 'horizontal'
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

// ─── Vertical (Featured) Card ──────────────────────────────────────────────
function VerticalCard({ item, onAdd }: { item: IMenuItem; onAdd: (i: IMenuItem) => void }) {
  const hasDiscount = !!(item.salePrice && item.salePrice < item.basePrice)
  const discountPct = hasDiscount ? Math.round(((item.basePrice - item.salePrice!) / item.basePrice) * 100) : 0
  const displayPrice = hasDiscount ? item.salePrice! : item.basePrice

  return (
    <div
      onClick={() => item.isAvailable && onAdd(item)}
      className={`relative rounded-3xl overflow-hidden cursor-pointer group shadow-[0_4px_24px_-6px_rgba(0,0,0,0.15)] transition-all duration-300 active:scale-[0.97] ${!item.isAvailable ? 'opacity-70' : ''}`}
    >
      <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!item.isAvailable ? 'grayscale-[60%]' : ''}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
            <UtensilsCrossed size={48} className="text-orange-300" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5 z-10">
          {item.isFeatured && (
            <span className="flex items-center gap-0.5 backdrop-blur-sm bg-white/20 border border-white/30 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
              <Flame size={11} fill="currentColor" />
              Hot
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          )}
          {!item.isAvailable && (
            <span className="bg-slate-800/80 backdrop-blur-sm text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              Hết hàng
            </span>
          )}
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="font-black text-white text-[15px] leading-snug line-clamp-2 drop-shadow-md mb-1">{item.name}</h3>
          {item.description && (
            <p className="text-white/70 text-[11px] font-medium line-clamp-1 mb-2">{item.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-base drop-shadow">{fmt(displayPrice)}đ</span>
              {hasDiscount && <span className="text-white/60 text-xs line-through">{fmt(item.basePrice)}đ</span>}
            </div>
            <button
              onClick={e => { e.stopPropagation(); if (item.isAvailable) onAdd(item) }}
              disabled={!item.isAvailable}
              aria-label={`Thêm ${item.name}`}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.4)] ${item.isAvailable ? 'bg-gradient-to-br from-[#ff7a00] to-[#ff5000] text-white' : 'bg-white/30 text-white/60 cursor-not-allowed backdrop-blur-sm'}`}
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Horizontal (Regular) Card ─────────────────────────────────────────────
function HorizontalCard({ item, onAdd }: { item: IMenuItem; onAdd: (i: IMenuItem) => void }) {
  const hasDiscount = !!(item.salePrice && item.salePrice < item.basePrice)
  const discountPct = hasDiscount ? Math.round(((item.basePrice - item.salePrice!) / item.basePrice) * 100) : 0
  const displayPrice = hasDiscount ? item.salePrice! : item.basePrice

  return (
    <div
      onClick={() => item.isAvailable && onAdd(item)}
      className={`flex gap-3 bg-white rounded-2xl p-3 border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] cursor-pointer transition-all duration-200 active:scale-[0.98] ${!item.isAvailable ? 'opacity-70' : 'hover:shadow-[0_4px_16px_-4px_rgba(255,105,51,0.12)]'}`}
    >
      {/* Thumbnail */}
      <div className="relative w-[88px] h-[88px] rounded-2xl overflow-hidden bg-slate-100 shrink-0">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className={`w-full h-full object-cover ${!item.isAvailable ? 'grayscale-[50%]' : ''}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
            <UtensilsCrossed size={28} className="text-orange-200" />
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
            -{discountPct}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start gap-1 mb-0.5">
            {item.isFeatured && <Flame size={14} fill="#f59e0b" className="text-amber-400 shrink-0 mt-0.5" />}
            <h3 className={`font-bold text-[14px] leading-snug line-clamp-2 ${!item.isAvailable ? 'text-slate-400' : 'text-slate-900'}`}>
              {item.name}
            </h3>
          </div>
          {item.description && <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mt-0.5">{item.description}</p>}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col leading-none gap-0.5">
            <span className={`font-black text-[15px] ${!item.isAvailable ? 'text-slate-300' : 'text-guest-primary'}`}>{fmt(displayPrice)}đ</span>
            {hasDiscount && <span className="text-[10px] text-slate-400 line-through">{fmt(item.basePrice)}đ</span>}
          </div>
          {!item.isAvailable ? (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Hết hàng</span>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onAdd(item) }}
              aria-label={`Thêm ${item.name}`}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7a00] to-[#ff5000] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_-2px_rgba(255,105,51,0.45)] active:scale-90 transition-all"
            >
              <Plus size={17} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function MenuItemCard({ item, onAdd, variant = 'horizontal' }: MenuItemCardProps) {
  if (variant === 'vertical') return <VerticalCard item={item} onAdd={onAdd} />
  return <HorizontalCard item={item} onAdd={onAdd} />
}
