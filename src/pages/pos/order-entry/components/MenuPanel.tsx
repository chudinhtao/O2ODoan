import { usePosMenu } from '../hooks/usePosMenu'
import { MenuItemCard } from './MenuItemCard'
import { IMenuItem } from '@/pages/admin/menu/types/adminMenu.type'
import { Skeleton } from '@/shared/components/ui/Skeleton'

import { Input } from '@/shared/components/ui/Input'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'
import { useState, ChangeEvent, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const ITEMS_PER_PAGE = 10

interface MenuPanelProps {
  onItemClick: (item: IMenuItem) => void
}

export function MenuPanel({ onItemClick }: MenuPanelProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [categorySearch, setCategorySearch] = useState('')
  const { categories, menuItems, selectedCategoryId, setSelectedCategoryId } = usePosMenu()

  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [search, selectedCategoryId])

  const filteredItems = (menuItems.data ?? []).filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE)
  const currentItems = filteredItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const categoryOptions = [
    { value: '', label: t('pos.menu.all', 'Tất cả') },
    ...(categories.data ?? []).map(cat => ({
      value: cat.id,
      label: cat.name
    }))
  ]

  const filteredCategories = categoryOptions.filter(opt =>
    opt.label.toLowerCase().includes(categorySearch.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-surface border-r border-outline-variant">
      {/* Search & Categories */}
      <div className="px-4 py-3 shrink-0 border-b border-outline-variant relative z-20">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-outline z-10 pointer-events-none" />
            <Input
              type="text"
              placeholder={t('pos.menu.search', 'Tìm món...')}
              value={search}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 text-sm bg-surface-variant text-on-surface border-transparent focus:ring-primary/20"
            />
          </div>
          <div className="w-56 shrink-0">
            <AsyncSelect
              value={selectedCategoryId || ''}
              onChange={(val) => setSelectedCategoryId(val ? val.toString() : undefined)}
              onSearch={setCategorySearch}
              options={filteredCategories}
              isLoading={categories.isLoading}
              placeholder={t('pos.menu.selectCategory', 'Chọn danh mục...')}
            />
          </div>
        </div>
      </div>

      {/* Items Area */}
      <div className="flex-1 overflow-hidden px-1 py-4 flex flex-col gap-4">
        <div className="flex-1 flex gap-1 items-center h-full justify-between">
          {/* Prev Button */}
          <div className="shrink-0">
            <button
              className="px-0 py-4 text-outline hover:text-primary transition-all disabled:opacity-30 disabled:hover:text-outline active:scale-95"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-12 lg:size-16" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar h-full pr-2">
            {menuItems.isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mx-auto w-full pb-4">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-outline gap-2">
                <p className="text-sm font-medium">{t('pos.menu.notFound', 'Không tìm thấy món ăn phù hợp.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mx-auto py-2 w-full pb-4">
                {currentItems.map(item => (
                  <MenuItemCard key={item.id} item={item} onAdd={onItemClick} />
                ))}
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="shrink-0">
            <button
              className="px-0 py-4 text-outline hover:text-primary transition-all disabled:opacity-30 disabled:hover:text-outline active:scale-95"
              disabled={page >= totalPages || totalPages === 0}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-12 lg:size-16" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 shrink-0 min-h-[20px] pb-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                onClick={() => setPage(i + 1)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  page === i + 1 ? 'bg-primary w-8' : 'bg-outline-variant w-2.5 hover:bg-outline'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
