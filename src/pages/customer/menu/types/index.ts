export interface ICategory {
  id: string
  name: string
  imageUrl: string
  displayOrder: number
  isActive: boolean
}

export interface ISchedule {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface IMenuItemOption {
  id: string
  name: string
  extraPrice: number
  isAvailable: boolean
}

export interface IMenuItemOptionGroup {
  id: string
  name: string
  type: 'SINGLE' | 'MULTIPLE'
  isRequired: boolean
  displayOrder: number
  options: IMenuItemOption[]
}

export interface IMenuItem {
  id: string
  categoryId: string
  categoryName?: string
  name: string
  description?: string
  imageUrl?: string
  basePrice: number
  salePrice?: number
  station: 'BAR' | 'KITCHEN'
  isAvailable: boolean
  isFeatured: boolean
  isActive: boolean
  saleEndAt?: string
  schedules?: ISchedule[]
  optionGroups?: IMenuItemOptionGroup[]
}

export interface ICartItemOption {
  optionName: string
  extraPrice: number
}

export interface ICartItem {
  cartItemId: string
  menuItemId: string
  name: string
  imageUrl?: string
  basePrice: number
  quantity: number
  note?: string
  station: 'BAR' | 'KITCHEN'
  options: ICartItemOption[]
  lineTotal: number
  hasFlashSale: boolean
  discountPrice?: number
  saleEndAt?: string
  schedules?: ISchedule[]
}

export interface ICart {
  sessionToken: string
  items: ICartItem[]
  totalAmount: number
  originalTotal: number
  automatedDiscount: number
  appliedPromotions: string[]
}

export interface ITicketItemOption {
  optionId: string
}

export interface ITicketItemRequest {
  menuItemId: string
  quantity: number
  note?: string
  options?: ITicketItemOption[]
}
