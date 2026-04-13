import http from '@/services/interceptor'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { ICart, IAddCartItemRequest, IUpdateCartItemRequest } from '../types/posOrder.type'

const withSession = (token: string) => ({ headers: { 'X-Session-Token': token } })

export const posOrderService = {
  // Cart Operations
  getCart: (sessionToken: string) =>
    http.get<IApiResponse<ICart>>(API_ROUTES.order.cart, withSession(sessionToken)),

  addCartItem: (sessionToken: string, payload: IAddCartItemRequest) =>
    http.post<IApiResponse<ICart>>(API_ROUTES.order.cartItems, payload, withSession(sessionToken)),

  updateCartItem: (sessionToken: string, cartItemId: string, payload: IUpdateCartItemRequest) =>
    http.put<IApiResponse<ICart>>(API_ROUTES.order.cartItem(cartItemId), payload, withSession(sessionToken)),

  removeCartItem: (sessionToken: string, cartItemId: string) =>
    http.delete<IApiResponse<ICart>>(API_ROUTES.order.cartItem(cartItemId), withSession(sessionToken)),

  clearCart: (sessionToken: string) =>
    http.delete<IApiResponse<null>>(API_ROUTES.order.cart, withSession(sessionToken)),

  // Ticket: submit giỏ hàng → gửi bếp
  submitTicket: (sessionToken: string) =>
    http.post<IApiResponse<null>>(API_ROUTES.order.tickets, {}, withSession(sessionToken)),
}
