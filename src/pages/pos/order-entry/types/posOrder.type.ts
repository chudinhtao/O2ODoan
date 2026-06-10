// ── Cart types (Redis-backed, temporary basket before submitting ticket) ──

export interface ICartItemOption {
  optionId: string
  optionName: string
  extraPrice: number
}

export interface ICartItem {
  cartItemId: string
  menuItemId: string
  name: string
  basePrice: number
  quantity: number
  note?: string
  options: ICartItemOption[]
  lineTotal: number
}

export interface ICart {
  sessionToken: string
  items: ICartItem[]
  totalAmount: number
  originalTotal: number
  automatedDiscount: number
  appliedPromotions: string[]
}

// ── Request types ──

export interface ITakeawayRequest {
  customerName?: string
  customerPhone?: string
}

export interface IAddCartItemRequest {
  menuItemId: string
  quantity: number
  note?: string
  options?: { optionId: string }[]
}

export interface IUpdateCartItemRequest {
  quantity: number
  note?: string
}

// ── Ticket submit (gửi bếp) ──

export interface ITicketRequest {
  note?: string
}
