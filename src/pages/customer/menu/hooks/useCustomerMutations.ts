import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { customerService } from '../services/customerService'
import type { ITicketItemRequest } from '../types'
import { CUSTOMER_QUERY_KEYS } from './useCustomerQueries'
import { getSuccessMessage } from '@/shared/utils/apiResponse'
import i18n from '@/config/i18n'

export function useCustomerOpenSession() {
  return useMutation({
    mutationFn: (qrToken: string) => customerService.openSession(qrToken),
  })
}

export function useCustomerAddToCart(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ITicketItemRequest) => customerService.addToCart(payload),
    onSuccess: (res) => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.cart(token) })
      }
      toast.success(getSuccessMessage(res.message, i18n.t('customer.cart.addSuccess', 'Đã thêm vào giỏ hàng')))
    },
  })
}

export function useCustomerUpdateCartItem(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cartItemId, quantity, note }: { cartItemId: string, quantity: number, note: string }) =>
      customerService.updateCartItem(cartItemId, quantity, note),
    onSuccess: (res) => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.cart(token) })
      }
      toast.success(getSuccessMessage(res.message, i18n.t('customer.cart.updateSuccess', 'Đã cập nhật giỏ hàng')))
    },
  })
}

export function useCustomerDeleteCartItem(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cartItemId: string) => customerService.deleteCartItem(cartItemId),
    onSuccess: (res) => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.cart(token) })
      }
      toast.success(getSuccessMessage(res.message, i18n.t('customer.cart.removeSuccess', 'Đã xóa món khỏi giỏ')))
    },
  })
}

export function useCustomerSubmitOrder(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (note?: string) => customerService.submitOrder(note),
    onSuccess: (res) => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.cart(token) })
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
      }
      toast.success(getSuccessMessage(res.message, i18n.t('customer.order.submitSuccess', 'Đã gửi bếp thành công!')))
    },
  })
}

export function useCustomerRequestPayment(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (method: string) => customerService.requestPayment(method),
    onSuccess: (res) => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
      }
      toast.success(getSuccessMessage(res.message, i18n.t('customer.payment.requestSuccess', 'Đã gửi yêu cầu thanh toán')))
    },
  })
}

export function useCustomerCreatePayOSLink(token: string | null) {
  return useMutation({
    mutationFn: ({ orderId, amount }: { orderId: string, amount: number }) =>
      customerService.createPayOSLink(orderId, amount, token),
    onSuccess: (res) => {
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl
      }
    },
  })
}

export function useCustomerCallStaff(_token: string | null) {
  return useMutation({
    mutationFn: ({ callType, note }: { callType: string, note?: string }) =>
      customerService.callStaff(callType, note),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, i18n.t('customer.support.callSuccess', 'Đã gọi nhân viên, vui lòng đợi trong giây lát')))
    },
  })
}

export function useCustomerCancelTicket(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: string) => customerService.cancelTicket(ticketId),
    onSuccess: (res) => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
      }
      toast.success(getSuccessMessage(res.message, i18n.t('customer.tracking.ticket.cancelSuccess', 'Đã hủy phiếu yêu cầu')))
    },
  })
}

export function useCustomerCancelItem(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) => customerService.cancelItem(itemId),
    onSuccess: (res) => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
      }
      toast.success(getSuccessMessage(res.message, i18n.t('customer.tracking.item.cancelSuccess', 'Đã hủy món')))
    },
  })
}

export function useCustomerApplyPromotion(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => customerService.applyPromotion(code),
    onSuccess: (res) => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
      }
      toast.success(getSuccessMessage(res.message, i18n.t('customer.payment.promoSuccess', 'Đã áp dụng mã giảm giá thành công!')))
    },
  })
}
