import { useTranslation } from 'react-i18next'
import { ICategory } from '../types'

interface CategoryTabsProps {
  categories: ICategory[]
  activeCategoryId: string | null
  onSelectCategory: (id: string) => void
}

export function CategoryTabs({ categories, activeCategoryId, onSelectCategory }: CategoryTabsProps) {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
      {/* All tab */}
      <button
        onClick={() => onSelectCategory('')}
        className={`
          flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200
          ${!activeCategoryId || activeCategoryId === ''
            ? 'bg-gradient-to-r from-[#ff7a00] to-[#ff5000] text-white shadow-[0_4px_12px_-2px_rgba(255,105,51,0.4)]'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
        `}
      >
        {t('customer.menu.all', 'Tất cả')}
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          className={`
            flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap
            ${activeCategoryId === cat.id
              ? 'bg-gradient-to-r from-[#ff7a00] to-[#ff5000] text-white shadow-[0_4px_12px_-2px_rgba(255,105,51,0.4)]'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
          `}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
