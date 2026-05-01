// ============================================================
// Types cho Promotion System (Schema mới - 5 bảng)
// Sync với PromotionResponse và PromotionRequest từ menu-service
// ============================================================

export type PromotionScope = 'PRODUCT' | 'ORDER' | 'BUNDLE'
export type PromotionTriggerType = 'AUTO' | 'COUPON'
export type PromotionDiscountType = 'PERCENT' | 'FIX_AMOUNT' | 'FIX_PRICE'
export type TargetType = 'ITEM' | 'CATEGORY' | 'GLOBAL'
export type BundleItemRole = 'BUY' | 'GET'

// ─── Response (từ API → hiển thị) ────────────────────────────

export interface IPromotionTarget {
  id: string
  targetType: TargetType
  targetId: string | null
}

export interface IPromotionBundleItem {
  id: string
  itemId: string
  quantity: number
  role: BundleItemRole
}

export interface IPromotionRequirement {
  id: string
  minOrderAmount: number
  minQuantity: number
  memberLevel: string | null
}

export interface IPromotionSchedule {
  id: string
  dayOfWeek: number          // 0 = CN, 1 = T2, ..., 6 = T7
  startTime: string          // "HH:mm:ss"
  endTime: string
}

export interface IPromotion {
  id: string
  code: string | null
  name: string
  scope: PromotionScope
  triggerType: PromotionTriggerType
  discountType: PromotionDiscountType
  discountValue: number | null
  maxDiscount: number | null
  usageLimit: number | null
  usedCount: number
  priority: number
  startAt: string | null
  endAt: string | null
  stackable: boolean
  active: boolean
  displayStatus: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED'
  createdAt: string
  targets: IPromotionTarget[]
  bundleItems: IPromotionBundleItem[]
  requirement: IPromotionRequirement | null
  schedules: IPromotionSchedule[]
}

// ─── Request (gửi lên API) ─────────────────────────────────────

export interface IPromotionTargetForm {
  targetType: TargetType
  targetId: string | null
}

export interface IPromotionBundleItemForm {
  itemId: string
  quantity: number
  role: BundleItemRole
}

export interface IPromotionRequirementForm {
  minOrderAmount: number
  minQuantity: number
  memberLevel?: string
}

export interface IPromotionScheduleForm {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface IPromotionForm {
  code?: string
  name: string
  scope: PromotionScope
  triggerType: PromotionTriggerType
  discountType: PromotionDiscountType
  discountValue: number | null
  maxDiscount?: number
  usageLimit?: number
  priority: number
  startAt?: string
  endAt?: string
  stackable: boolean
  targets?: IPromotionTargetForm[]
  bundleItems?: IPromotionBundleItemForm[]
  requirement?: IPromotionRequirementForm
  schedules?: IPromotionScheduleForm[]
}

// ─── Helpers ───────────────────────────────────────────────────

export const SCOPE_LABELS: Record<PromotionScope, string> = {
  PRODUCT: 'Sản phẩm',
  ORDER: 'Đơn hàng',
  BUNDLE: 'Combo / Mua kèm',
}

export const DISCOUNT_TYPE_LABELS: Record<PromotionDiscountType, string> = {
  PERCENT: 'Phần trăm (%)',
  FIX_AMOUNT: 'Số tiền cố định (đ)',
  FIX_PRICE: 'Giá cố định (đ)',
}

export const TRIGGER_LABELS: Record<PromotionTriggerType, string> = {
  AUTO: 'Tự động',
  COUPON: 'Mã coupon',
}

export const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
