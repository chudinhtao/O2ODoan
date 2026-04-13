import { UtensilsCrossed, Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IMenuItem } from '../types'
import { MenuItemCard } from './MenuItemCard'

interface MenuSectionProps {
  items: IMenuItem[]
  onAdd: (item: IMenuItem) => void
}

export function MenuSection({ items, onAdd }: MenuSectionProps) {
  const { t } = useTranslation()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <UtensilsCrossed size={36} className="text-slate-300" />
        </div>
        <h3 className="text-sm font-bold text-slate-400">{t('customer.menu.empty', 'Không có món ăn trong mục này')}</h3>
      </div>
    )
  }

  const featured = items.filter(i => i.isFeatured)
  const regular = items.filter(i => !i.isFeatured)
  const showHeroSection = featured.length > 0

  return (
    <div className="space-y-6">
      {/* Hero / Featured */}
      {showHeroSection && (
        <section>
          <div className="flex items-center gap-2 mb-3 px-0.5">
            <Flame size={16} fill="#f59e0b" className="text-amber-500 shrink-0" />
            <h2 className="font-black text-[13px] text-slate-700 uppercase tracking-widest">Bán chạy nhất</h2>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
            {featured.map(item => (
              <div key={item.id} className="w-[190px] shrink-0">
                <MenuItemCard item={item} onAdd={onAdd} variant="vertical" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Regular list */}
      {regular.length > 0 && (
        <section>
          {showHeroSection && (
            <div className="flex items-center gap-2 mb-3 px-0.5">
              <UtensilsCrossed size={15} className="text-slate-400 shrink-0" />
              <h2 className="font-black text-[13px] text-slate-500 uppercase tracking-widest">Thực đơn</h2>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
          )}
          <div className="space-y-2.5">
            {regular.map(item => (
              <MenuItemCard key={item.id} item={item} onAdd={onAdd} variant="horizontal" />
            ))}
          </div>
        </section>
      )}

      {!showHeroSection && (
        <div className="space-y-2.5">
          {items.map(item => (
            <MenuItemCard key={item.id} item={item} onAdd={onAdd} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  )
}
