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
  createdAt: string
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
  subtotal: number
  discount?: number
  total: number
  promotionId?: string | null
  promotionCode?: string | null
  createdAt: string
  tickets: IOrderTicket[]
}

export interface OrderFiltersParams {
  page: number
  size: number
  sort?: string
  status?: OrderStatus | ''
  source?: OrderSource | ''
  search?: string
  startDate?: string
  endDate?: string
}

export type IOrderPageResponse = IPageResponse<IOrder>
