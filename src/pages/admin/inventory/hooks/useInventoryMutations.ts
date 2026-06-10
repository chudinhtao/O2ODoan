import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { getSuccessMessage } from '@/shared/utils/apiResponse'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import { inventoryService } from '../services/inventory.service'
import {
  IUomRequest, IItemCategoryRequest, ISupplierRequest,
  IInventoryItemRequest, IUomConversionRequest,
  IRecipeRequest, IStocktakeItemUpdateRequest, IQuickGrnRequest,
  ILocationRequest
} from '../types/inventory.type'

export function useLocationMutations() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.locations() })

  const create = useMutation({
    mutationFn: (p: ILocationRequest) => inventoryService.createLocation(p),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.location.createSuccess', 'Tạo vị trí thành công'))); invalidate() },
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ILocationRequest }) => inventoryService.updateLocation(id, data),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.location.updateSuccess', 'Cập nhật thành công'))); invalidate() },
  })
  const toggle = useMutation({
    mutationFn: (id: string) => inventoryService.toggleLocation(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.location.toggleSuccess', 'Thay đổi trạng thái thành công'))); invalidate() },
  })
  const remove = useMutation({
    mutationFn: (id: string) => inventoryService.deleteLocation(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res, t('admin.inventory.location.deleteSuccess', 'Xóa vị trí thành công'))); invalidate() },
  })
  return { create, update, toggle, remove }
}

export function useUomMutations() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.uoms() })

  const create = useMutation({
    mutationFn: (p: IUomRequest) => inventoryService.createUom(p),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.uom.createSuccess'))); invalidate() },
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUomRequest }) => inventoryService.updateUom(id, data),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.uom.updateSuccess'))); invalidate() },
  })
  const remove = useMutation({
    mutationFn: (id: string) => inventoryService.deleteUom(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res, t('admin.inventory.uom.deleteSuccess'))); invalidate() },
  })
  return { create, update, remove }
}

export function useCategoryMutations() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.categories() })

  const create = useMutation({
    mutationFn: (p: IItemCategoryRequest) => inventoryService.createCategory(p),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.category.createSuccess'))); invalidate() },
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IItemCategoryRequest }) => inventoryService.updateCategory(id, data),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.category.updateSuccess'))); invalidate() },
  })
  const remove = useMutation({
    mutationFn: (id: string) => inventoryService.deleteCategory(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res, t('admin.inventory.category.deleteSuccess'))); invalidate() },
  })
  return { create, update, remove }
}

export function useSupplierMutations() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['inventory', 'suppliers'] })

  const create = useMutation({
    mutationFn: (p: ISupplierRequest) => inventoryService.createSupplier(p),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.supplier.createSuccess'))); invalidate() },
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ISupplierRequest }) => inventoryService.updateSupplier(id, data),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.supplier.updateSuccess'))); invalidate() },
  })
  const toggle = useMutation({
    mutationFn: (id: string) => inventoryService.toggleSupplier(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.supplier.toggleSuccess'))); invalidate() },
  })
  const remove = useMutation({
    mutationFn: (id: string) => inventoryService.deleteSupplier(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res, t('admin.inventory.supplier.deleteSuccess'))); invalidate() },
  })
  return { create, update, toggle, remove }
}

export function useItemMutations() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['inventory', 'items'] })

  const create = useMutation({
    mutationFn: (p: IInventoryItemRequest) => inventoryService.createItem(p),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.item.createSuccess'))); invalidate() },
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IInventoryItemRequest }) => inventoryService.updateItem(id, data),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.item.updateSuccess'))); invalidate() },
  })
  const toggle = useMutation({
    mutationFn: (id: string) => inventoryService.toggleItem(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.item.toggleSuccess'))); invalidate() },
  })
  const remove = useMutation({
    mutationFn: (id: string) => inventoryService.deleteItem(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res, t('admin.inventory.item.deleteSuccess'))); invalidate() },
  })
  return { create, update, toggle, remove }
}

export function useConversionMutations() {
  const qc = useQueryClient()
  const { t } = useTranslation()

  const create = useMutation({
    mutationFn: (p: IUomConversionRequest) => inventoryService.createConversion(p),
    onSuccess: (res, vars) => {
      toast.success(getSuccessMessage(res.message, t('admin.inventory.conversion.createSuccess')))
      qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.conversions(vars.itemId) })
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) => inventoryService.deleteConversion(id),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res, t('admin.inventory.conversion.deleteSuccess')))
      qc.invalidateQueries({ queryKey: ['inventory', 'conversions'] })
    },
  })
  return { create, remove }
}

export function useRecipeMutations() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['inventory', 'recipes'] })

  const create = useMutation({
    mutationFn: (p: IRecipeRequest) => inventoryService.createRecipe(p),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.recipe.createSuccess'))); invalidate() },
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IRecipeRequest }) => inventoryService.updateRecipe(id, data),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.recipe.updateSuccess'))); invalidate() },
  })
  const remove = useMutation({
    mutationFn: (id: string) => inventoryService.deleteRecipe(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res, t('admin.inventory.recipe.deleteSuccess'))); invalidate() },
  })
  return { create, update, remove }
}

export function useStocktakeMutations() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const invalidate = () => qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.stocktakes() })

  const create = useMutation({
    mutationFn: (p: { name: string; notes?: string }) => inventoryService.createStocktake(p),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.stocktake.createSuccess'))); invalidate() },
  })
  const updateItems = useMutation({
    mutationFn: ({ id, items }: { id: string; items: IStocktakeItemUpdateRequest[] }) => inventoryService.updateStocktakeItems(id, items),
    onSuccess: (res, vars) => { 
      toast.success(getSuccessMessage(res.message, t('admin.inventory.stocktake.saveSuccess'))); 
      qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.stocktake(vars.id) })
    },
  })
  const finalize = useMutation({
    mutationFn: (id: string) => inventoryService.finalizeStocktake(id),
    onSuccess: (res, id) => { 
      toast.success(getSuccessMessage(res.message, t('admin.inventory.stocktake.finalizeSuccess'))); 
      qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.stocktake(id) })
      invalidate()
    },
  })
  const cancel = useMutation({
    mutationFn: (id: string) => inventoryService.cancelStocktake(id),
    onSuccess: (res, id) => { 
      toast.success(getSuccessMessage(res.message, t('admin.inventory.stocktake.cancelSuccess'))); 
      qc.invalidateQueries({ queryKey: QUERY_KEYS.inventory.stocktake(id) })
      invalidate()
    },
  })
  return { create, updateItems, finalize, cancel }
}

export function usePurchaseOrderMutations() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['inventory', 'purchase-orders'] })

  const create = useMutation({
    mutationFn: (p: any) => inventoryService.createPurchaseOrder(p),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.po.createSuccess'))); invalidate() },
  })
  const confirm = useMutation({
    mutationFn: (id: string) => inventoryService.confirmPurchaseOrder(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.po.confirmSuccess'))); invalidate() },
  })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => inventoryService.updatePurchaseOrder(id, data),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.po.updateSuccess', 'Đã cập nhật phiếu nhập kho'))); invalidate() },
  })
  const cancel = useMutation({
    mutationFn: (id: string) => inventoryService.cancelPurchaseOrder(id),
    onSuccess: (res) => { toast.success(getSuccessMessage(res.message, t('admin.inventory.po.cancelSuccess'))); invalidate() },
  })
  return { create, update, confirm, cancel }
}

export function useQuickGrnMutation() {
  const qc = useQueryClient()
  const { t } = useTranslation()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['inventory'] })

  return useMutation({
    mutationFn: (p: IQuickGrnRequest) => inventoryService.createQuickGrn(p),
    onSuccess: (res) => { 
      toast.success(getSuccessMessage(res.message, t('admin.inventory.quickGrn.success')))
      invalidate()
    },
  })
}
