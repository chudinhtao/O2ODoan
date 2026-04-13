export type PromotionType = 'PERCENT' | 'AMOUNT' | 'FLASH_SALE'

export interface IPromotion {
  id: string
  code: string | null
  name: string
  type: PromotionType
  value: number
  minOrderAmount: number
  minQuantity: number
  maxDiscountValue?: number
  usageLimit?: number
  usedCount: number
  startAt: string
  endAt: string
  isActive: boolean
  active?: boolean
  conditions?: IFlashSaleConditions
}

export interface IPromotionForm {
  code: string
  name: string
  type: PromotionType
  value: number
  minOrderAmount: number
  minQuantity: number
  maxDiscountValue?: number
  usageLimit?: number
  startAt: string
  endAt: string
}

export type FlashSaleTargetType = 'ALL' | 'CATEGORY' | 'ITEMS'
export type FlashSaleDiscountType = 'PERCENT' | 'FIXED_PRICE'

export interface IFlashSaleConditions {
  targetType: FlashSaleTargetType
  discountType: FlashSaleDiscountType
  discountValue: number
  itemIds?: string[]
  categoryId?: string
}

export interface IFlashSaleForm {
  name: string
  targetType: FlashSaleTargetType
  itemIds?: string[]
  categoryId?: string
  discountType: FlashSaleDiscountType
  discountValue: number
  startAt: string
  endAt: string
}
