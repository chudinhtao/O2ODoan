import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, AlertCircle, Save, AlertTriangle } from 'lucide-react'
import { inventoryService } from '@/pages/admin/inventory/services/inventory.service'
import { ISelectedRecipeTarget } from '../RecipeTab'
import { IRecipeItemRequest } from '@/pages/admin/inventory/types/inventory.type'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { AsyncSelect } from '@/shared/components/ui/AsyncSelect'
import { toast } from 'sonner'
import { useInventoryItems, useLocations } from '@/pages/admin/inventory/hooks/useInventoryQueries'
import { Select } from '@/shared/components/ui/Select'

interface RecipeEditorProps {
  selectedTarget: ISelectedRecipeTarget | null
}

import { useTranslation } from 'react-i18next'

export default function RecipeEditor({ selectedTarget }: RecipeEditorProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [recipeItems, setRecipeItems] = useState<IRecipeItemRequest[]>([])
  const [recipeId, setRecipeId] = useState<string | null>(null)
  const [defaultLocationId, setDefaultLocationId] = useState<string>('')
  
  const [itemSearch, setItemSearch] = useState('')

  const { data: locations } = useLocations()
  const locationOptions = locations?.filter(l => l.active).map(l => ({ value: l.id, label: l.name })) || []
  
  // Fetch ingredients for dropdown
  const { data: ingredientsData, isLoading: isLoadingIngredients } = useInventoryItems({ 
    keyword: itemSearch || undefined, 
    isActive: true, 
    size: 20 
  })
  const ingredients = ingredientsData?.content || []


  // Fetch current recipe when target changes
  const { data: currentRecipe, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', 'recipe', selectedTarget?.saleItemId, selectedTarget?.modifierId],
    queryFn: async () => {
      if (!selectedTarget) return null
      try {
        if (selectedTarget.type === 'MAIN_ITEM') {
          return await inventoryService.getRecipeBySaleItem(selectedTarget.saleItemId)
        } else {
          return await inventoryService.getRecipeByModifier(selectedTarget.modifierId!)
        }
      } catch (error) {
        // Nếu 404 (chưa có công thức), trả về null để editor ở trạng thái tạo mới
        return null
      }
    },
    enabled: !!selectedTarget
  })

  useEffect(() => {
    if (currentRecipe) {
      setRecipeId(currentRecipe.id)
      setDefaultLocationId(currentRecipe.defaultLocationId || '')
      setRecipeItems(currentRecipe.items.map(i => ({
        inventoryItemId: i.inventoryItemId,
        quantity: i.quantity,
        uomId: i.uom.id,
        wastagePercent: i.wastagePercent,
        scope: i.scope,
        _tempName: i.inventoryItemName, // just for display
        _tempUomName: i.uom.name // just for display
      } as any)))
    } else {
      setRecipeId(null)
      setDefaultLocationId('')
      setRecipeItems([])
    }
  }, [currentRecipe])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTarget) return
      const payload = {
        saleItemId: selectedTarget.type === 'MAIN_ITEM' ? selectedTarget.saleItemId : undefined,
        modifierId: selectedTarget.type === 'MODIFIER' ? selectedTarget.modifierId : undefined,
        type: selectedTarget.type,
        defaultLocationId: defaultLocationId || undefined,
        items: recipeItems.map(i => ({
          inventoryItemId: i.inventoryItemId,
          quantity: Number(i.quantity),
          uomId: i.uomId,
          wastagePercent: Number(i.wastagePercent || 0),
          scope: i.scope || 'ALWAYS'
        }))
      }
      
      if (recipeId) {
        return inventoryService.updateRecipe(recipeId, payload)
      } else {
        return inventoryService.createRecipe(payload)
      }
    },
    onSuccess: () => {
      toast.success(t('admin.inventory.recipe.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'recipe'] })
    }
  })

  const handleAddIngredient = (inventoryItemId: string) => {
    if (!inventoryItemId) return
    const item = ingredients.find(i => i.id === inventoryItemId)
    if (!item) return

    // Prevent duplicates
    if (recipeItems.some(i => i.inventoryItemId === inventoryItemId)) {
      toast.error(t('admin.inventory.recipe.duplicateIngredientError'))
      return
    }

    setRecipeItems([...recipeItems, {
      inventoryItemId: item.id,
      quantity: 1,
      uomId: item.baseUom?.id || '',
      wastagePercent: 0,
      scope: 'ALWAYS',
      _tempName: item.name,
      _tempUomName: item.baseUom?.name || ''
    } as any])
  }

  const handleUpdateItem = (index: number, field: keyof IRecipeItemRequest, value: any) => {
    const newItems = [...recipeItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setRecipeItems(newItems)
  }

  const handleRemoveItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index))
  }

  if (!selectedTarget) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-surface-container/10">
        <div className="w-16 h-16 bg-surface-dim rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-on-surface-variant" />
        </div>
        <h3 className="text-lg font-semibold text-on-surface">{t('admin.inventory.recipe.noSelectedTitle')}</h3>
        <p className="text-sm text-on-surface-variant max-w-sm mt-2">
          {t('admin.inventory.recipe.noSelectedDesc')}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-dim">
        <div>
          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            {selectedTarget.type === 'MAIN_ITEM' ? t('admin.inventory.recipe.titleMainItem') : t('admin.inventory.recipe.titleModifier')}
          </div>
          <h2 className="text-xl font-bold text-on-surface">{selectedTarget.name}</h2>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || recipeItems.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? t('admin.inventory.recipe.saving') : t('admin.inventory.recipe.saveBtn')}
        </button>
      </div>

      <div className="p-4 border-b border-surface-dim bg-slate-50/50">
        <label className="block text-sm font-semibold text-slate-700 mb-1">Vị trí chế biến (Tùy chọn)</label>
        <p className="text-xs text-slate-500 mb-2">Chỉ định kho mặc định sẽ bị trừ nguyên liệu khi món này được bán ra từ POS.</p>
        <div className="w-1/2">
          <Select
            value={defaultLocationId}
            onChange={(e) => setDefaultLocationId(e.target.value)}
            options={[{value: '', label: '-- Mặc định (Tự động tìm theo hệ thống) --'}, ...locationOptions]}
            className="w-full bg-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-on-surface-variant">{t('admin.inventory.conversion.loading')}</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          {!recipeId && (
            <div className="mb-6 flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">{t('admin.inventory.recipe.noRecipeWarningTitle')}</span>
                <p className="mt-1 text-amber-700/90 leading-relaxed">
                  {t('admin.inventory.recipe.noRecipeWarning')}
                </p>
              </div>
            </div>
          )}

          {/* Ingredient Selector */}
          <div className="mb-6 bg-surface-container p-4 rounded-xl border border-slate-200 shadow-sm relative z-20">
            <AsyncSelect
              label={t('admin.inventory.recipe.addIngredient', 'Thêm nguyên liệu mới')}
              value=""
              onChange={(val) => handleAddIngredient(val as string)}
              onSearch={setItemSearch}
              isLoading={isLoadingIngredients}
              options={ingredients.map(ing => ({ value: ing.id, label: `${ing.name} (${ing.sku})` }))}
              placeholder={t('admin.inventory.recipe.searchPlaceholder', '-- Nhập tên nguyên liệu để thêm --')}
            />
          </div>

          {/* Recipe Items Table */}
          {recipeItems.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-surface-dim rounded-xl">
              <p className="text-on-surface-variant text-sm">{t('admin.inventory.recipe.emptyRecipe')}</p>
            </div>
          ) : (
            <div className="border border-surface-dim rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container/50 border-b border-surface-dim">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-on-surface">{t('admin.inventory.recipe.colIngredient')}</th>
                    <th className="px-4 py-3 font-semibold text-on-surface w-32">{t('admin.inventory.recipe.colQuantity')}</th>
                    <th className="px-4 py-3 font-semibold text-on-surface w-28">{t('admin.inventory.recipe.colWastage')}</th>
                    <th className="px-4 py-3 font-semibold text-on-surface w-36">{t('admin.inventory.recipe.colScope')}</th>
                    <th className="px-4 py-3 font-semibold text-on-surface w-16 text-center">{t('admin.inventory.recipe.colDelete')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-dim">
                  {recipeItems.map((item, idx) => {
                    // We no longer check isMissingFromActive here because 'ingredients' 
                    // only contains the top 20 search results from the dropdown, causing false positives.

                    return (
                      <tr key={idx} className="bg-white hover:bg-surface-container/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-medium text-on-surface">{(item as any)._tempName || 'Nguyên liệu ID: ' + item.inventoryItemId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <NumberInput
                            min={0}
                            step={0.01}
                            value={item.quantity}
                            onChange={(e: any) => handleUpdateItem(idx, 'quantity', e.target.value)}
                            className="!py-1.5"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <NumberInput
                            min={0}
                            max={100}
                            step={1}
                            value={item.wastagePercent}
                            onChange={(e: any) => handleUpdateItem(idx, 'wastagePercent', e.target.value)}
                            className="!py-1.5"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={item.scope || 'ALWAYS'}
                            onChange={(e) => handleUpdateItem(idx, 'scope', e.target.value)}
                            className="w-full px-2 py-1.5 border border-surface-dim bg-white rounded text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                          >
                            <option value="ALWAYS">{t('admin.inventory.recipe.scopeAlways')}</option>
                            <option value="TAKEAWAY_ONLY">{t('admin.inventory.recipe.scopeTakeaway')}</option>
                            <option value="DINE_IN_ONLY">{t('admin.inventory.recipe.scopeDineIn')}</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded transition-colors inline-flex"
                            title={t('admin.inventory.recipe.colDelete')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
