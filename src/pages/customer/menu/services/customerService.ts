import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { IApiResponse, IPageResponse } from '@/shared/types/IApiResponse'
import { ICategory, IMenuItem, ICart, ITicketItemRequest } from '../types'

const CUSTOMER_HEADERS = (token: string) => ({
  headers: { 'X-Session-Token': token }
})

export const customerService = {
  // Menu
  getCategories: () => 
    http.get<IApiResponse<IPageResponse<ICategory>>>(`${API_ROUTES.menu.categories}?page=0&size=100`),
  
  getItems: (categoryId: string) =>
    http.get<IApiResponse<IPageResponse<IMenuItem>>>(`${API_ROUTES.menu.items}?categoryId=${categoryId}&page=0&size=100`),
  
  getItemDetails: (id: string) =>
    http.get<IApiResponse<IMenuItem>>(API_ROUTES.menu.item(id)),

  // Session
  openSession: (qrToken: string) =>
    http.post<IApiResponse<{ sessionToken: string }>>('/sessions/open', { qrToken }),

  getSessionOrder: (token: string) =>
    http.get<IApiResponse<any>>(API_ROUTES.order.sessionOrder, CUSTOMER_HEADERS(token)),

  // Cart
  getCart: (token: string) =>
    http.get<IApiResponse<ICart>>(API_ROUTES.order.cart, CUSTOMER_HEADERS(token)),

  addToCart: (token: string, payload: ITicketItemRequest) =>
    http.post<IApiResponse<ICart>>(API_ROUTES.order.cartItems, payload, CUSTOMER_HEADERS(token)),

  updateCartItem: (token: string, cartItemId: string, quantity: number, note: string) =>
    http.put<IApiResponse<ICart>>(`${API_ROUTES.order.cartItems}/${cartItemId}`, { quantity, note }, CUSTOMER_HEADERS(token)),

  deleteCartItem: (token: string, cartItemId: string) =>
    http.delete<IApiResponse<ICart>>(`${API_ROUTES.order.cartItems}/${cartItemId}`, CUSTOMER_HEADERS(token)),

  // Tickets & Others
  submitOrder: (token: string, note?: string) =>
    http.post<IApiResponse<any>>(API_ROUTES.order.tickets, { note }, CUSTOMER_HEADERS(token)),

  requestPayment: (token: string, paymentMethod: string) =>
    http.post<IApiResponse<any>>('/orders/request-payment', { paymentMethod }, CUSTOMER_HEADERS(token)),

  callStaff: (token: string, callType: string, note?: string) =>
    http.post<IApiResponse<any>>('/staff-calls', { callType, note }, CUSTOMER_HEADERS(token)),

  cancelTicket: (token: string, ticketId: string) =>
    http.patch<IApiResponse<any>>(`${API_ROUTES.order.root}/session/tickets/${ticketId}/cancel`, {}, CUSTOMER_HEADERS(token)),

  cancelItem: (token: string, itemId: string) =>
    http.patch<IApiResponse<any>>(`${API_ROUTES.order.root}/session/items/${itemId}/cancel`, {}, CUSTOMER_HEADERS(token)),

  applyPromotion: (token: string, code: string) =>
    http.patch<IApiResponse<any>>(`${API_ROUTES.order.root}/session/promotion`, { code }, CUSTOMER_HEADERS(token)),
}
