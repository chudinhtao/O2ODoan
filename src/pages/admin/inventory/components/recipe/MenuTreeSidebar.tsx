import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, Coffee, Layers, FolderTree } from 'lucide-react'
import { adminMenuService } from '@/pages/admin/menu/services/adminMenu.service'
import { ISelectedRecipeTarget } from '../RecipeTab'

interface MenuTreeSidebarProps {
  selectedTarget: ISelectedRecipeTarget | null
  onSelectTarget: (target: ISelectedRecipeTarget) => void
}

export default function MenuTreeSidebar({ selectedTarget, onSelectTarget }: MenuTreeSidebarProps) {
  const { t } = useTranslation()
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({})
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCats } = useQuery({
    queryKey: ['admin', 'menu', 'categories-tree'],
    queryFn: () => adminMenuService.getCategories({ 
      size: 50 
    })
  })
  const categories = categoriesData?.content || []

  // Fetch items
  const { data: itemsData, isLoading: loadingItems } = useQuery({
    queryKey: ['admin', 'menu', 'items-tree'],
    queryFn: () => adminMenuService.getMenuItems({ 
      size: 100 
    })
  })
  const items = itemsData?.content || []

  const toggleCategory = (catId: string) => {
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }))
  }

  const toggleItem = (itemId: string) => {
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  return (
    <div className="flex flex-col h-full bg-surface-container/30">
      <div className="p-4 border-b border-surface-dim bg-white shrink-0">
        <h3 className="font-semibold text-on-surface">{t('admin.inventory.recipe.menuTitle')}</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {loadingCats || loadingItems ? (
          <div className="flex justify-center p-4">
            <span className="text-sm text-on-surface-variant">{t('admin.inventory.conversion.loading')}</span>
          </div>
        ) : (
          categories.map(cat => {
            const catItems = items.filter(i => i.categoryId === cat.id)

            return (
              <div key={cat.id} className="mb-1">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white text-left transition-colors"
                >
                  <div className="flex items-center gap-2 font-medium text-sm text-on-surface">
                    <FolderTree className="w-4 h-4 text-primary" />
                    <span>{cat.name}</span>
                  </div>
                  {expandedCats[cat.id] ? <ChevronDown className="w-4 h-4 text-on-surface-variant" /> : <ChevronRight className="w-4 h-4 text-on-surface-variant" />}
                </button>

                {/* Items List */}
                {expandedCats[cat.id] && (
                  <div className="ml-4 mt-1 border-l border-surface-dim pl-2 flex flex-col gap-1">
                    {catItems.map(item => {
                      const hasOptions = item.optionGroups && item.optionGroups.length > 0
                      
                      const isSelectedMain = selectedTarget?.saleItemId === item.id && !selectedTarget?.modifierId

                      return (
                        <div key={item.id} className="flex flex-col">
                          <div
                            className={`w-full flex items-center justify-between rounded-md text-sm transition-colors ${
                              isSelectedMain ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-white text-on-surface-variant'
                            }`}
                          >
                            <button
                              onClick={() => {
                                onSelectTarget({
                                  saleItemId: item.id,
                                  name: item.name,
                                  type: 'MAIN_ITEM'
                                })
                              }}
                              className="flex-1 flex items-center gap-2 px-3 py-2 text-left"
                            >
                              <Coffee className="w-3.5 h-3.5" />
                              <span>{item.name}</span>
                            </button>
                            {hasOptions && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleItem(item.id)
                                }}
                                className="p-2 hover:bg-black/5 rounded-md mr-1 transition-colors"
                              >
                                {expandedItems[item.id] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>

                          {/* Options List */}
                          {hasOptions && expandedItems[item.id] && (
                            <div className="ml-5 mt-1 border-l border-surface-dim border-dashed pl-2 flex flex-col gap-1">
                              {item.optionGroups?.map(group => (
                                <div key={group.name} className="flex flex-col gap-1">
                                  <div className="text-[11px] font-semibold text-on-surface-variant/70 uppercase tracking-wider pl-2 pt-1">
                                    {group.name}
                                  </div>
                                  {group.options.map((opt, idx) => {
                                    // Ở đây modifierId dùng index nếu opt không có id (để đơn giản) hoặc opt.name,
                                    // Nhưng chuẩn là DTO Option phải có ID. Ta map id hoặc name.
                                    const optId = opt.id || `${item.id}-${opt.name}`
                                    const isOptSelected = selectedTarget?.modifierId === optId
                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => onSelectTarget({
                                          saleItemId: item.id,
                                          modifierId: optId,
                                          name: `${item.name} - ${opt.name}`,
                                          type: 'MODIFIER'
                                        })}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors text-left ${
                                          isOptSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-white text-on-surface-variant'
                                        }`}
                                      >
                                        <Layers className="w-3 h-3" />
                                        <span>{opt.name}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
