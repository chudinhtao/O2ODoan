import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { IApiResponse, IPageResponse } from '@/shared/types/IApiResponse'
import { ICategory, IMenuItem, ICart, ITicketItemRequest } from '../types'

export const customerService = {
  // Menu
  getCategories: () => 
    http.get<IApiResponse<IPageResponse<ICategory>>>(`${API_ROUTES.menu.categories}?page=0&size=100`),
  
  getItems: (categoryId: string) =>
    http.get<IApiResponse<IPageResponse<IMenuItem>>>(`${API_ROUTES.menu.items}?categoryId=${categoryId}&page=0&size=100`),
  
  getItemDetails: (id: string) =>
    http.get<IApiResponse<IMenuItem>>(API_ROUTES.menu.item(id)),

  getActivePromotionsByScope: (scope: string) =>
    http.get<IApiResponse<any[]>>(`/promotions/active/${scope}`),
  // Session
  openSession: (qrToken: string) =>
    http.post<IApiResponse<{ sessionToken: string }>>('/sessions/open', { qrToken }),

  getSessionOrder: (token?: string) =>
    http.get<IApiResponse<any>>(API_ROUTES.order.sessionOrder),

  // Cart
  getCart: (token?: string) =>
    http.get<IApiResponse<ICart>>(API_ROUTES.order.cart),

  addToCart: (token: string, payload: ITicketItemRequest) =>
    http.post<IApiResponse<ICart>>(API_ROUTES.order.cartItems, payload),

  updateCartItem: (token: string, cartItemId: string, quantity: number, note: string) =>
    http.put<IApiResponse<ICart>>(`${API_ROUTES.order.cartItems}/${cartItemId}`, { quantity, note }),

  deleteCartItem: (token: string, cartItemId: string) =>
    http.delete<IApiResponse<ICart>>(`${API_ROUTES.order.cartItems}/${cartItemId}`),

  // Tickets & Others
  submitOrder: (token?: string, note?: string) =>
    http.post<IApiResponse<any>>(API_ROUTES.order.tickets, { note }),

  requestPayment: (token: string, paymentMethod: string) =>
    http.post<IApiResponse<any>>('/orders/request-payment', { paymentMethod }),

  createPayOSLink: (token: string, orderId: string, amount: number) =>
    http.post<any>(`/payments/payos/create/${orderId}?amount=${amount}`, {}),

  callStaff: (token: string, callType: string, note?: string) =>
    http.post<IApiResponse<any>>('/staff-calls', { callType, note }),

  cancelTicket: (token: string, ticketId: string) =>
    http.patch<IApiResponse<any>>(`${API_ROUTES.order.root}/session/tickets/${ticketId}/cancel`, {}),

  cancelItem: (token: string, itemId: string) =>
    http.patch<IApiResponse<any>>(`${API_ROUTES.order.root}/session/items/${itemId}/cancel`, {}),

  applyPromotion: (token: string, code: string) =>
    http.patch<IApiResponse<any>>(`${API_ROUTES.order.root}/session/promotion`, { code }),
}
