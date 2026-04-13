import { usePosMenu } from '../hooks/usePosMenu'
import { MenuItemCard } from './MenuItemCard'
import { IMenuItem } from '@/pages/admin/menu/types/adminMenu.type'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Search } from 'lucide-react'
import { useState, ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface MenuPanelProps {
  onItemClick: (item: IMenuItem) => void
}

export function MenuPanel({ onItemClick }: MenuPanelProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { categories, menuItems, selectedCategoryId, setSelectedCategoryId } = usePosMenu()

  const filteredItems = (menuItems.data ?? []).filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-surface border-r border-outline-variant">
      {/* Search & Categories */}
      <div className="p-6 space-y-6 shrink-0 border-b border-outline-variant">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-outline z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder={t('pos.menu.search', 'Tìm món...')}
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 bg-surface-variant text-on-surface border-transparent focus:ring-primary/20"
            />
          </div>
        </div>
        
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          <Button
            variant={!selectedCategoryId ? 'primary' : 'outline'}
            onClick={() => setSelectedCategoryId(undefined)}
            className="rounded-full whitespace-nowrap shrink-0"
          >
            {t('pos.menu.all', 'Tất cả')}
          </Button>
          {categories.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />)
            : (categories.data ?? []).map(cat => (
                 <Button
                   key={cat.id}
                   variant={selectedCategoryId === cat.id ? 'primary' : 'outline'}
                   onClick={() => setSelectedCategoryId(cat.id)}
                   className="rounded-full whitespace-nowrap shrink-0"
                 >
                   {cat.name}
                 </Button>
                )
              )
          }
        </div>
      </div>

      {/* Items grid */}
      <div className="flex-1 overflow-y-auto p-6 pt-0">
        {menuItems.isLoading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {Array.from({ length: 15 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-outline gap-2">
            <p className="text-sm font-medium">{t('pos.menu.notFound', 'Không tìm thấy món ăn phù hợp.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {filteredItems.map(item => (
              <MenuItemCard key={item.id} item={item} onAdd={onItemClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
