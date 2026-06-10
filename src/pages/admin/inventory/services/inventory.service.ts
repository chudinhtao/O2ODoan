import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { IApiResponse, IPageResponse } from '@/shared/types/IApiResponse'
import {
  IUom, IUomRequest,
  IItemCategory, IItemCategoryRequest,
  ISupplier, ISupplierRequest,
  IInventoryItem, IInventoryItemRequest,
  IUomConversion, IUomConversionRequest,
  IRecipe, IRecipeRequest,
  IPurchaseOrder, IPurchaseOrderRequest, IGoodsReceiptRequest,
  IStocktake, IStocktakeItemUpdateRequest, IStocktakeCreateRequest,
  IStockTransaction,
  IDashboardSummary,
  IInventoryTrend,
  ILowStockItemResponse,
  IVarianceReportResponse,
  IQuickGrnRequest,
  IPurchaseSuggestion,
  ILocation, ILocationRequest,
  IInternalTransferRequest
} from '../types/inventory.type'

export const inventoryService = {
  // ── Locations ──
  getLocations: async () => {
    const res = await http.get<IApiResponse<ILocation[]>>(API_ROUTES.inventory.locations)
    return res.data.data
  },
  createLocation: async (payload: ILocationRequest) => {
    const res = await http.post<IApiResponse<ILocation>>(API_ROUTES.inventory.locations, payload)
    return res.data
  },
  updateLocation: async (id: string, payload: ILocationRequest) => {
    const res = await http.put<IApiResponse<ILocation>>(API_ROUTES.inventory.location(id), payload)
    return res.data
  },
  toggleLocation: async (id: string) => {
    const res = await http.patch<IApiResponse<ILocation>>(API_ROUTES.inventory.locationToggle(id))
    return res.data
  },
  deleteLocation: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(API_ROUTES.inventory.location(id))
    return res.data.message
  },

  // ── UoM ──
  getUoms: async () => {
    const res = await http.get<IApiResponse<IUom[]>>(API_ROUTES.inventory.uoms)
    return res.data.data
  },
  getUomsSearch: async (params?: { keyword?: string; page?: number; size?: number }) => {
    const res = await http.get<IApiResponse<IPageResponse<IUom>>>(API_ROUTES.inventory.uomsSearch, { params })
    return res.data.data
  },
  createUom: async (payload: IUomRequest) => {
    const res = await http.post<IApiResponse<IUom>>(API_ROUTES.inventory.uoms, payload)
    return res.data
  },
  updateUom: async (id: string, payload: IUomRequest) => {
    const res = await http.put<IApiResponse<IUom>>(API_ROUTES.inventory.uom(id), payload)
    return res.data
  },
  deleteUom: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(API_ROUTES.inventory.uom(id))
    return res.data.message
  },

  // ── Categories ──
  getCategories: async () => {
    const res = await http.get<IApiResponse<IItemCategory[]>>(API_ROUTES.inventory.categories)
    return res.data.data
  },
  getCategoriesSearch: async (params?: { keyword?: string; page?: number; size?: number }) => {
    const res = await http.get<IApiResponse<IPageResponse<IItemCategory>>>(API_ROUTES.inventory.categoriesSearch, { params })
    return res.data.data
  },
  createCategory: async (payload: IItemCategoryRequest) => {
    const res = await http.post<IApiResponse<IItemCategory>>(API_ROUTES.inventory.categories, payload)
    return res.data
  },
  updateCategory: async (id: string, payload: IItemCategoryRequest) => {
    const res = await http.put<IApiResponse<IItemCategory>>(API_ROUTES.inventory.category(id), payload)
    return res.data
  },
  deleteCategory: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(API_ROUTES.inventory.category(id))
    return res.data.message
  },

  // ── Suppliers ──
  getSuppliers: async (params?: { keyword?: string; isActive?: boolean; page?: number; size?: number }) => {
    const res = await http.get<IApiResponse<IPageResponse<ISupplier>>>(API_ROUTES.inventory.suppliers, { params })
    return res.data.data
  },
  createSupplier: async (payload: ISupplierRequest) => {
    const res = await http.post<IApiResponse<ISupplier>>(API_ROUTES.inventory.suppliers, payload)
    return res.data
  },
  updateSupplier: async (id: string, payload: ISupplierRequest) => {
    const res = await http.put<IApiResponse<ISupplier>>(API_ROUTES.inventory.supplier(id), payload)
    return res.data
  },
  toggleSupplier: async (id: string) => {
    const res = await http.patch<IApiResponse<ISupplier>>(API_ROUTES.inventory.supplierToggle(id))
    return res.data
  },
  deleteSupplier: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(API_ROUTES.inventory.supplier(id))
    return res.data.message
  },

  // ── Items ──
  getItems: async (params?: { keyword?: string; categoryId?: string; type?: string; page?: number; size?: number; isActive?: boolean }) => {
    const res = await http.get<IApiResponse<IPageResponse<IInventoryItem>>>(API_ROUTES.inventory.items, { params })
    return res.data.data
  },
  getItem: async (id: string) => {
    const res = await http.get<IApiResponse<IInventoryItem>>(API_ROUTES.inventory.item(id))
    return res.data.data
  },
  createItem: async (payload: IInventoryItemRequest) => {
    const res = await http.post<IApiResponse<IInventoryItem>>(API_ROUTES.inventory.items, payload)
    return res.data
  },
  updateItem: async (id: string, payload: IInventoryItemRequest) => {
    const res = await http.put<IApiResponse<IInventoryItem>>(API_ROUTES.inventory.item(id), payload)
    return res.data
  },
  toggleItem: async (id: string) => {
    const res = await http.patch<IApiResponse<IInventoryItem>>(API_ROUTES.inventory.itemToggle(id))
    return res.data
  },
  deleteItem: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(API_ROUTES.inventory.item(id))
    return res.data.message
  },

  // ── UoM Conversions ──
  getConversions: async (itemId?: string) => {
    if (!itemId) return []
    const res = await http.get<IApiResponse<IUomConversion[]>>(API_ROUTES.inventory.itemConversions(itemId))
    return res.data.data
  },
  createConversion: async (payload: IUomConversionRequest) => {
    const res = await http.post<IApiResponse<IUomConversion>>(API_ROUTES.inventory.conversions, payload)
    return res.data
  },
  deleteConversion: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(API_ROUTES.inventory.conversion(id))
    return res.data.message
  },

  // ── Recipes ──
  getRecipes: async (params?: { type?: string; page?: number; size?: number }) => {
    const res = await http.get<IApiResponse<IPageResponse<IRecipe>>>(API_ROUTES.inventory.recipes, { params })
    return res.data.data
  },
  getRecipe: async (id: string) => {
    const res = await http.get<IApiResponse<IRecipe>>(API_ROUTES.inventory.recipe(id))
    return res.data.data
  },
  getRecipeBySaleItem: async (saleItemId: string) => {
    const res = await http.get<IApiResponse<IRecipe>>(API_ROUTES.inventory.recipeBySaleItem(saleItemId), {
      headers: { 'X-Skip-Global-Toast': 'true' }
    })
    return res.data.data
  },
  getRecipeByModifier: async (modifierId: string) => {
    const res = await http.get<IApiResponse<IRecipe>>(API_ROUTES.inventory.recipeByModifier(modifierId), {
      headers: { 'X-Skip-Global-Toast': 'true' }
    })
    return res.data.data
  },
  createRecipe: async (payload: IRecipeRequest) => {
    const res = await http.post<IApiResponse<IRecipe>>(API_ROUTES.inventory.recipes, payload)
    return res.data
  },
  updateRecipe: async (_id: string, payload: IRecipeRequest) => {
    // Backend uses POST /recipes for both create and update (createOrUpdateRecipe)
    const res = await http.post<IApiResponse<IRecipe>>(API_ROUTES.inventory.recipes, payload)
    return res.data
  },
  deleteRecipe: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(API_ROUTES.inventory.recipe(id))
    return res.data.message
  },

  // ── Purchase Orders ──
  getPurchaseOrders: async (params?: { type?: string; status?: string; startDate?: string; endDate?: string; page?: number; size?: number; sort?: string }) => {
    const res = await http.get<IApiResponse<IPageResponse<IPurchaseOrder>>>(API_ROUTES.inventory.po, { params })
    return res.data.data
  },
  getPurchaseOrder: async (id: string) => {
    const res = await http.get<IApiResponse<IPurchaseOrder>>(API_ROUTES.inventory.poById(id))
    return res.data.data
  },
  createPurchaseOrder: async (payload: IPurchaseOrderRequest) => {
    const res = await http.post<IApiResponse<IPurchaseOrder>>(API_ROUTES.inventory.po, payload)
    return res.data
  },
  updatePurchaseOrder: async (id: string, payload: IPurchaseOrderRequest) => {
    const res = await http.put<IApiResponse<IPurchaseOrder>>(API_ROUTES.inventory.poById(id), payload)
    return res.data
  },
  confirmPurchaseOrder: async (id: string) => {
    const res = await http.post<IApiResponse<IPurchaseOrder>>(API_ROUTES.inventory.poConfirm(id))
    return res.data
  },
  receivePurchaseOrder: async (id: string, payload: IGoodsReceiptRequest) => {
    const res = await http.post<IApiResponse<IPurchaseOrder>>(API_ROUTES.inventory.poReceive(id), payload)
    return res.data
  },
  forceCompletePurchaseOrder: async (id: string) => {
    const res = await http.post<IApiResponse<IPurchaseOrder>>(API_ROUTES.inventory.poForceComplete(id))
    return res.data
  },
  cancelPurchaseOrder: async (id: string) => {
    const res = await http.post<IApiResponse<IPurchaseOrder>>(API_ROUTES.inventory.poCancel(id))
    return res.data
  },
  
  // ── Stocktakes ──
  getStocktakes: async (params?: { status?: string; keyword?: string; startDate?: string; endDate?: string; page?: number; size?: number }) => {
    const res = await http.get<IApiResponse<IPageResponse<IStocktake>>>(API_ROUTES.inventory.stocktake, { params })
    return res.data.data
  },
  getStocktake: async (id: string) => {
    const res = await http.get<IApiResponse<IStocktake>>(API_ROUTES.inventory.stocktakeById(id))
    return res.data.data
  },
  createStocktake: async (data: IStocktakeCreateRequest) => {
    const res = await http.post<IApiResponse<IStocktake>>(API_ROUTES.inventory.stocktake, data)
    return res.data
  },
  updateStocktakeItems: async (id: string, items: IStocktakeItemUpdateRequest[]) => {
    const res = await http.put<IApiResponse<IStocktake>>(API_ROUTES.inventory.stocktakeById(id), items)
    return res.data
  },
  finalizeStocktake: async (id: string) => {
    const res = await http.post<IApiResponse<IStocktake>>(API_ROUTES.inventory.stocktakeFinalize(id))
    return res.data
  },
  cancelStocktake: async (id: string) => {
    const res = await http.post<IApiResponse<IStocktake>>(API_ROUTES.inventory.stocktakeCancel(id))
    return res.data
  },

  // ── Reports ──
  getExpiringStock: async (days: number = 7) => {
    const res = await http.get<IApiResponse<any[]>>(API_ROUTES.inventory.reportExpiring, { params: { days } })
    return res.data.data
  },
  getLowStockItems: async () => {
    const res = await http.get<IApiResponse<ILowStockItemResponse[]>>(API_ROUTES.inventory.reportLowStock)
    return res.data.data
  },
  getVarianceReport: async (startDate: string, endDate: string) => {
    const start = startDate.length === 10 ? `${startDate}T00:00:00` : startDate;
    const end = endDate.length === 10 ? `${endDate}T23:59:59` : endDate;
    const res = await http.get<IApiResponse<IVarianceReportResponse>>(API_ROUTES.inventory.reportVariance, { params: { startDate: start, endDate: end } })
    return res.data.data
  },
  getDashboardSummary: async (startDate?: string, endDate?: string) => {
    const start = startDate?.length === 10 ? `${startDate}T00:00:00` : startDate;
    const end = endDate?.length === 10 ? `${endDate}T23:59:59` : endDate;
    const res = await http.get<IApiResponse<IDashboardSummary>>(API_ROUTES.inventory.reportDashboard, { params: { startDate: start, endDate: end } })
    return res.data.data
  },
  getTrendData: async (startDate?: string, endDate?: string) => {
    const start = startDate?.length === 10 ? `${startDate}T00:00:00` : startDate;
    const end = endDate?.length === 10 ? `${endDate}T23:59:59` : endDate;
    const res = await http.get<IApiResponse<IInventoryTrend[]>>(API_ROUTES.inventory.reportTrend, { params: { startDate: start, endDate: end } })
    return res.data.data
  },
  getPurchaseSuggestions: async () => {
    const res = await http.get<IApiResponse<IPurchaseSuggestion[]>>(API_ROUTES.report.purchaseSuggestions)
    return res.data.data
  },
  // ── Transactions ──
  getTransactions: async (params?: { 
    itemId?: string; 
    type?: string; 
    startDate?: string; 
    endDate?: string; 
    page?: number; 
    size?: number 
  }) => {
    let formattedParams = { ...params }
    if (params?.startDate && params.startDate.length === 10) {
      formattedParams.startDate = `${params.startDate}T00:00:00`
    }
    if (params?.endDate && params.endDate.length === 10) {
      formattedParams.endDate = `${params.endDate}T23:59:59`
    }
    const res = await http.get<IApiResponse<IPageResponse<IStockTransaction>>>(API_ROUTES.inventory.transactions, { params: formattedParams })
    return res.data.data
  },
  createWasteTransaction: async (payload: { itemId: string; quantityChange: number; reason: string; lotNumber?: string; locationId?: string }) => {
    const requestPayload = { ...payload, transactionType: 'OUT_WASTE' }
    const res = await http.post<IApiResponse<IStockTransaction>>(API_ROUTES.inventory.transactions + '/waste', requestPayload)
    return res.data
  },
  createQuickGrn: async (payload: IQuickGrnRequest) => {
    const res = await http.post<IApiResponse<IStockTransaction>>(API_ROUTES.inventory.transactions + '/quick-grn', payload)
    return res.data
  },
  createInternalTransfer: async (payload: IInternalTransferRequest) => {
    const res = await http.post<IApiResponse<IStockTransaction[]>>(API_ROUTES.inventory.transactions + '/transfer', payload)
    return res.data
  },
  killSwitch: async (itemId: string, reason?: string) => {
    const res = await http.post<IApiResponse<IStockTransaction>>(API_ROUTES.inventory.transactions + `/items/${itemId}/kill-switch`, null, { params: { reason } })
    return res.data
  },
  restoreStock: async (itemId: string, quantity: number, reason?: string) => {
    const res = await http.post<IApiResponse<IStockTransaction>>(API_ROUTES.inventory.transactions + `/items/${itemId}/restore-stock`, null, { params: { quantity, reason } })
    return res.data
  },
}
