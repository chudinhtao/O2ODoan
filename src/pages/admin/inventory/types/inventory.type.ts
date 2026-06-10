export interface IUom {
  id: string
  name: string
  shortName: string
}

export interface IUomRequest {
  name: string
  shortName?: string
}

export interface ILocation {
  id: string
  name: string
  description?: string
  active: boolean
}

export interface ILocationRequest {
  name: string
  description?: string
}

export interface IItemCategory {
  id: string
  name: string
  description?: string
}

export interface IItemCategoryRequest {
  name: string
  description?: string
}

export interface ISupplier {
  id: string
  code: string
  name: string
  phone: string
  email?: string
  address?: string
  taxCode?: string
  active: boolean
}

export interface ISupplierRequest {
  code?: string
  name: string
  phone?: string
  email?: string
  address?: string
  taxCode?: string
}

export interface IInventoryBatch {
  id: string
  lotNumber: string
  expiryDate: string
  currentStock: number
  locationId?: string
  locationName?: string
}

export interface IBatchFlattened extends IInventoryBatch {
  itemId: string
  itemName: string
  itemSku: string
  baseUom: IUom | null
}

export interface IInventoryItem {
  id: string
  sku: string
  name: string
  type: string
  safetyStock: number
  avgCostPrice: number
  currentStock: number
  active: boolean
  category: IItemCategory | null
  baseUom: IUom | null
  batches?: IInventoryBatch[]
}

export interface IInventoryItemRequest {
  sku?: string
  name: string
  categoryId?: string
  type: string
  baseUomId: string
  safetyStock?: number
  avgCostPrice?: number
}

export interface IUomConversion {
  id: string
  itemId: string
  itemName: string
  fromUom: IUom
  toUom: IUom
  conversionRate: number
}

export interface IUomConversionRequest {
  itemId: string
  fromUomId: string
  toUomId: string
  conversionRate: number
}

export type IIngredientScope = 'ALWAYS' | 'TAKEAWAY_ONLY' | 'DINE_IN_ONLY'

export interface IRecipeItem {
  id: string
  inventoryItemId: string
  inventoryItemName: string
  quantity: number
  uom: IUom
  wastagePercent: number
  scope: IIngredientScope
}

export interface IRecipe {
  id: string
  saleItemId: string | null
  modifierId: string | null
  type: string
  defaultLocationId?: string
  defaultLocationName?: string
  items: IRecipeItem[]
}

export interface IRecipeItemRequest {
  inventoryItemId: string
  quantity: number
  uomId: string
  wastagePercent?: number
  scope?: IIngredientScope
}

export interface IRecipeRequest {
  saleItemId?: string
  modifierId?: string
  type: string
  defaultLocationId?: string
  items: IRecipeItemRequest[]
}

export const ITEM_TYPE = {
  RAW: 'RAW',
  RETAIL: 'RETAIL',
  CONSUMABLE: 'CONSUMABLE',
} as const
export type IItemType = (typeof ITEM_TYPE)[keyof typeof ITEM_TYPE]

export const RECIPE_TYPE = {
  MAIN_ITEM: 'MAIN_ITEM',
  MODIFIER: 'MODIFIER',
} as const

// -- Purchase Order --
export interface IPurchaseOrderItemRequest {
  itemId: string
  orderedQuantity: number
  uomId: string
  unitPrice: number
  batchNumber?: string
  expiryDate?: string
}

export interface IPurchaseOrderRequest {
  supplierId?: string
  type: 'STANDARD' | 'QUICK_GRN'
  expectedDate?: string
  notes?: string
  locationId?: string
  items: IPurchaseOrderItemRequest[]
}

export interface IPurchaseOrderItem {
  id: string
  itemId: string
  itemName: string
  itemSku?: string
  orderedQuantity: number
  receivedQuantity: number
  remainingQuantity: number
  uomId: string
  uomName: string
  unitPrice: number
  totalLineAmount: number
  batchNumber?: string
  expiryDate?: string
}

export interface IPurchaseOrder {
  id: string
  poNumber: string
  supplierId?: string
  supplierName?: string
  type: 'STANDARD' | 'QUICK_GRN'
  status: 'DRAFT' | 'CONFIRMED' | 'PARTIAL_RECEIVED' | 'COMPLETED' | 'CANCELLED'
  totalAmount: number
  expectedDate?: string
  notes?: string
  items: IPurchaseOrderItem[]
  createdAt: string
  createdBy?: string
  confirmedAt?: string
  updatedAt: string
}

export interface IGoodsReceiptLineRequest {
  poItemId: string
  receivedQuantity: number
  note?: string
  locationId?: string
}

export interface IGoodsReceiptRequest {
  items: IGoodsReceiptLineRequest[]
}

// -- Stocktake --
export interface IStocktakeItemUpdateRequest {
  id: string
  countedQuantity: number
  adjustmentReason?: string
}

export interface IStocktakeItem {
  id: string
  itemId: string
  itemName: string
  itemSku: string
  systemQuantity: number
  countedQuantity: number
  variance: number
  adjustmentReason?: string
  batchId?: string
  lotNumber?: string
  expiryDate?: string
}

export interface IStocktakeCreateRequest {
  name: string
  notes?: string
  locationId?: string
}

export interface IStocktake {
  id: string
  status: 'DRAFT' | 'COMPLETED' | 'CANCELLED' | 'COUNTING'
  name?: string
  notes?: string
  snapshotTime?: string
  completedAt?: string
  locationId?: string
  locationName?: string
  items: IStocktakeItem[]
  createdAt: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
}

// -- Stock Transaction --
export interface IStockTransaction {
  id: string
  itemId: string
  itemName: string
  itemSku?: string
  baseUomName?: string
  transactionType: 'IN_PO' | 'IN_QUICK' | 'IN_TRANSFER' | 'OUT_SALE' | 'OUT_WASTE' | 'OUT_TRANSFER' | 'HOLD' | 'REFUND' | 'ADJUSTMENT' | 'MANUAL_BLOCK'
  quantityChange: number
  unitPriceAtTransaction: number
  referenceId?: string
  orderLineItemId?: string
  reason: string
  createdAt: string
  createdBy?: string
  lotNumber?: string
  expiryDate?: string
  locationId?: string
  locationName?: string
}



export interface IExpiringStock {
  id?: string | number
  itemId: string
  itemName: string
  itemSku: string
  lotNumber: string
  expiryDate: string
  currentStock: number
  uomName: string
  daysRemaining: number
  status: 'EXPIRED' | 'EXPIRING'
  categoryId?: string
  categoryName?: string
  avgCostPrice?: number
}

export interface IQuickGrnRequest {
  itemId: string
  quantity: number
  unitPrice?: number
  note?: string
  lotNumber?: string
  expiryDate?: string
  locationId?: string
}

export interface IStockTransactionRequest {
  itemId: string
  transactionType: 'IN_PO' | 'IN_QUICK' | 'IN_TRANSFER' | 'OUT_SALE' | 'OUT_WASTE' | 'OUT_TRANSFER' | 'HOLD' | 'REFUND' | 'ADJUSTMENT' | 'MANUAL_BLOCK'
  quantityChange: number
  unitPriceAtTransaction?: number
  referenceId?: string
  orderLineItemId?: string
  reason: string
  lotNumber?: string
  expiryDate?: string
}

export interface IInternalTransferItemRequest {
  itemId: string
  quantity: number
  lotNumber?: string
}

export interface IInternalTransferRequest {
  fromLocationId: string
  toLocationId: string
  notes?: string
  items: IInternalTransferItemRequest[]
}

export interface ILowStockItemResponse {
  id?: string | number
  itemId: string
  itemName: string
  itemSku: string
  currentStock: number
  safetyStock: number
  reorderAmount: number
  uomName: string
  categoryId?: string
  categoryName?: string
  avgCostPrice?: number
}

export interface IVarianceReportItemResponse {
  itemId: string
  itemName: string
  itemSku: string
  uomName: string
  wasteQuantity: number
  adjustmentQuantity: number
  totalVarianceQuantity: number
  estimatedLossValue: number
  categoryId?: string
  categoryName?: string
}

export interface IVarianceReportResponse {
  startDate: string
  endDate: string
  totalEstimatedLossValue: number
  items: IVarianceReportItemResponse[]
}

export interface IDashboardSummary {
  totalInventoryValue: number
  lowStockCount: number
  expiringItemsCount: number
  cogsThisMonth: number
  wasteValueThisMonth: number
  pendingPurchaseOrders: number
}

export interface IInventoryTrend {
  date: string
  cogs: number
  waste: number
}

export interface IPurchaseSuggestion {
  itemId: string
  itemName: string
  itemSku: string
  currentStock: number
  safetyStock: number
  suggestedQuantity: number
  uomId: string
  uomName: string
  supplierId: string | null
  supplierName: string
}
