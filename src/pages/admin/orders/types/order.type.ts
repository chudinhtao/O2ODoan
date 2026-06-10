import { IPageResponse } from '@/shared/types/IApiResponse'

export type OrderStatus = 'OPEN' | 'PAYMENT_REQUESTED' | 'PAID' | 'CANCELLED' | 'MERGED'
export type OrderSource = 'QR' | 'MANUAL'
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'

export type OrderTicketStatus = 'PENDING' | 'PREPARING' | 'DONE' | 'CANCELLED'
export type OrderTicketItemStatus = 'PENDING' | 'PREPARING' | 'DONE' | 'SERVED' | 'CANCELLED' | 'RETURNED'

export interface IOrderItemOption {
  id: string
  optionName: string
  extraPrice: number
}

export interface IOrderTicketItem {
  id: string
  menuItemId: string
  itemName: string
  unitPrice: number
  quantity: number
  note: string | null
  status: OrderTicketItemStatus
  station: string
  imageUrl?: string
  createdAt: string
  servedAt?: string
  options: IOrderItemOption[]
  isAlertSent?: boolean
  kitchenAlertSent?: boolean
  deliveryAlertSent?: boolean
}

export interface IOrderTicket {
  id: string
  orderId: string
  seqNumber: number
  status: OrderTicketStatus
  note: string | null
  createdBy: string
  createdAt: string
  items: IOrderTicketItem[]
}

export interface IOrder {
  id: string
  sessionId: string
  tableId: string | null
  tableNumber: string | null
  status: OrderStatus
  source: OrderSource
  orderType: OrderType
  customerName?: string | null
  customerPhone?: string | null
  subtotal: number
  depositAmount?: number
  discount?: number
  discountType?: string
  discountRate?: number
  tax?: number
  serviceFee?: number
  total: number
  promotionId?: string | null
  promotionCode?: string | null
  paymentMethod?: string
  paymentDetail?: string
  payosOrderCode?: number | null
  paidAt?: string | null
  cashierId?: string | null
  cancelledBy?: string | null
  cancelReason?: string | null
  minOrderAmount?: number
  maxDiscountValue?: number
  isStackable?: boolean
  createdAt: string
  updatedAt: string
  tickets: IOrderTicket[]
  summaryItems?: any[]
}

export interface OrderFiltersParams {
  page: number
  size: number
  sort?: string
  status?: OrderStatus | ''
  source?: OrderSource | ''
  orderType?: OrderType | ''
  paymentMethod?: string
  search?: string
  startDate?: string
  endDate?: string
}

export type IOrderPageResponse = IPageResponse<IOrder>

export interface IAuditLog {
  id: string
  orderId: string
  actionName: string
  details?: string
  userId: string
  role: string
  createdAt: string
}
