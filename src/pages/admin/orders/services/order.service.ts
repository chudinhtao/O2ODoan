import http from '@/services/interceptor'
import type { IOrder, IOrderPageResponse, OrderFiltersParams } from '../types/order.type'
import type { IApiResponse } from '@/shared/types/IApiResponse'

class OrderService {
  async getOrders(params: OrderFiltersParams): Promise<IOrderPageResponse> {
    const { data } = await http.get<IApiResponse<IOrderPageResponse>>('/orders/history', { params: params as any })
    return data.data
  }

  async getOrderById(id: string): Promise<IOrder> {
    const { data } = await http.get<IApiResponse<IOrder>>(`/orders/${id}`)
    return data.data
  }

  async cancelOrder(id: string, reason?: string, note?: string): Promise<void> {
    await http.post(`/orders/${id}/cancel`, { reason, note })
  }

  async requestPayment(sessionToken: string): Promise<void> {
    await http.post(`/orders/request-payment`, {}, {
      headers: { 'X-Session-Token': sessionToken }
    })
  }

  async checkoutOrder(
    id: string,
    releaseTable: boolean = true,
    paymentMethod: string = 'CASH',
    paymentDetail?: Record<string, number> | null
  ): Promise<void> {
    await http.post(`/orders/${id}/checkout`, { releaseTable, paymentMethod, paymentDetail })
  }

  async createPayosLink(orderId: string, sessionToken: string, amount: number, cashAmount?: number): Promise<string> {
    const params: Record<string, unknown> = { orderId, sessionToken, amount }
    if (cashAmount && cashAmount > 0) params.cashAmount = cashAmount
    const { data } = await http.post<{ checkoutUrl: string }>('/payments/payos/create', null, { params })
    return data.checkoutUrl
  }

  async cancelItem(orderId: string, itemId: string, reason?: string): Promise<void> {
    await http.patch(`/orders/${orderId}/items/${itemId}/cancel`, { reason })
  }

  async cancelTicket(orderId: string, ticketId: string, reason?: string): Promise<void> {
    await http.patch(`/orders/${orderId}/tickets/${ticketId}/cancel`, { reason })
  }

  async returnItem(orderId: string, itemId: string, reason?: string): Promise<void> {
    await http.patch(`/orders/${orderId}/items/${itemId}/return`, { reason })
  }

  async applyPromotion(orderId: string, code: string): Promise<void> {
    await http.patch(`/orders/${orderId}/promotion`, { code })
  }
}

export const orderService = new OrderService()
