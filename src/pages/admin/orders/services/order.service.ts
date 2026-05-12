import http from '@/services/interceptor'
import type { IOrder, IOrderPageResponse, OrderFiltersParams } from '../types/order.type'
import type { IApiResponse } from '@/shared/types/IApiResponse'
import { unwrapApiResponse } from '@/shared/utils/apiResponse'

class OrderService {
  async getOrders(params: OrderFiltersParams): Promise<IOrderPageResponse> {
    const { data } = await http.get<IApiResponse<IOrderPageResponse>>('/orders/history', { params: params as any })
    return data.data
  }

  async getOrderById(id: string): Promise<IOrder> {
    const { data } = await http.get<IApiResponse<IOrder>>(`/orders/${id}`)
    return data.data
  }

  async cancelOrder(id: string, reason?: string, note?: string): Promise<IApiResponse<unknown>> {
    return http.post<IApiResponse<unknown>>(`/orders/${id}/cancel`, { reason, note }).then(unwrapApiResponse)
  }

  async requestPayment(sessionToken: string): Promise<IApiResponse<unknown>> {
    return http.post<IApiResponse<unknown>>(`/orders/request-payment`, {}, {
      headers: { 'X-Session-Token': sessionToken }
    }).then(unwrapApiResponse)
  }

  async checkoutOrder(
    id: string,
    releaseTable: boolean = true,
    paymentMethod: string = 'CASH',
    paymentDetail?: Record<string, number> | null
  ): Promise<IApiResponse<unknown>> {
    return http.post<IApiResponse<unknown>>(`/orders/${id}/checkout`, { releaseTable, paymentMethod, paymentDetail }).then(unwrapApiResponse)
  }

  async createPayosLink(orderId: string, sessionToken: string, amount: number, cashAmount?: number): Promise<{ checkoutUrl: string; qrCode?: string }> {
    const params: Record<string, unknown> = { orderId, sessionToken, amount }
    if (cashAmount && cashAmount > 0) params.cashAmount = cashAmount
    const { data } = await http.post<{ checkoutUrl: string; qrCode?: string }>('/payments/payos/create', null, { params })
    return data
  }

  async cancelItem(orderId: string, itemId: string, reason?: string): Promise<IApiResponse<unknown>> {
    return http.patch<IApiResponse<unknown>>(`/orders/${orderId}/items/${itemId}/cancel`, { reason }).then(unwrapApiResponse)
  }

  async cancelTicket(orderId: string, ticketId: string, reason?: string): Promise<IApiResponse<unknown>> {
    return http.patch<IApiResponse<unknown>>(`/orders/${orderId}/tickets/${ticketId}/cancel`, { reason }).then(unwrapApiResponse)
  }

  async returnItem(orderId: string, itemId: string, reason?: string): Promise<IApiResponse<unknown>> {
    return http.patch<IApiResponse<unknown>>(`/orders/${orderId}/items/${itemId}/return`, { reason }).then(unwrapApiResponse)
  }

  async applyPromotion(orderId: string, code: string): Promise<IApiResponse<unknown>> {
    return http.patch<IApiResponse<unknown>>(`/orders/${orderId}/promotion`, { code }).then(unwrapApiResponse)
  }
}

export const orderService = new OrderService()
