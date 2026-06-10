import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { IApiResponse, IPageResponse } from '@/shared/types/IApiResponse'
import { unwrapApiData, unwrapApiResponse } from '@/shared/utils/apiResponse'
import { ICategory, IMenuItem, ICart, ITicketItemRequest } from '../types'

export const customerService = {
  // Menu
  getProfile: () =>
    http.get<IApiResponse<any>>(API_ROUTES.menu.profile).then(unwrapApiData),

  getCategories: () => 
    http.get<IApiResponse<IPageResponse<ICategory>>>(`${API_ROUTES.menu.categories}?page=0&size=100`).then(unwrapApiData),
  
  getItems: (categoryId: string) =>
    http.get<IApiResponse<IPageResponse<IMenuItem>>>(`${API_ROUTES.menu.items}?categoryId=${categoryId}&page=0&size=100`).then(unwrapApiData),
  
  getItemDetails: (id: string) =>
    http.get<IApiResponse<IMenuItem>>(API_ROUTES.menu.item(id)).then(unwrapApiData),

  getActivePromotionsByScope: (scope: string) =>
    http.get<IApiResponse<any[]>>(`/promotions/active/${scope}`).then(unwrapApiData),
  // Session
  openSession: (qrToken: string) =>
    http.post<IApiResponse<{ sessionToken: string }>>('/sessions/open', { qrToken }).then(unwrapApiResponse),

  getSessionOrder: () =>
    http.get<IApiResponse<any>>(API_ROUTES.order.sessionOrder).then(unwrapApiData),

  // Cart
  getCart: () =>
    http.get<IApiResponse<ICart>>(API_ROUTES.order.cart).then(unwrapApiData),

  addToCart: (payload: ITicketItemRequest) =>
    http.post<IApiResponse<ICart>>(API_ROUTES.order.cartItems, payload).then(unwrapApiResponse),

  updateCartItem: (cartItemId: string, quantity: number, note: string) =>
    http.put<IApiResponse<ICart>>(`${API_ROUTES.order.cartItems}/${cartItemId}`, { quantity, note }).then(unwrapApiResponse),

  deleteCartItem: (cartItemId: string) =>
    http.delete<IApiResponse<ICart>>(`${API_ROUTES.order.cartItems}/${cartItemId}`).then(unwrapApiResponse),

  // Tickets & Others
  submitOrder: (note?: string) =>
    http.post<IApiResponse<any>>(API_ROUTES.order.tickets, { note }).then(unwrapApiResponse),

  requestPayment: (paymentMethod: string) =>
    http.post<IApiResponse<any>>('/orders/request-payment', { paymentMethod }).then(unwrapApiResponse),

  createPayOSLink: (orderId: string, amount: number, sessionToken: string | null) =>
    http.post<any>(`/payments/payos/create`, null, {
      params: { orderId, amount, sessionToken }
    }),

  callStaff: (callType: string, note?: string) =>
    http.post<IApiResponse<any>>('/staff-calls', { callType, message: note }).then(unwrapApiResponse),

  cancelTicket: (ticketId: string) =>
    http.patch<IApiResponse<any>>(`${API_ROUTES.order.root}/session/tickets/${ticketId}/cancel`, {}).then(unwrapApiResponse),

  cancelItem: (itemId: string) =>
    http.patch<IApiResponse<any>>(`${API_ROUTES.order.root}/session/items/${itemId}/cancel`, {}).then(unwrapApiResponse),

  applyPromotion: (code: string) =>
    http.patch<IApiResponse<any>>(`${API_ROUTES.order.root}/session/promotion`, { code }).then(unwrapApiResponse),
}
