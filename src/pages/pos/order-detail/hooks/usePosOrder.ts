import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import { orderService } from '@/pages/admin/orders/services/order.service'
import type { IOrder } from '@/pages/admin/orders/types/order.type'
import http from '@/services/interceptor'
import type { IApiResponse } from '@/shared/types/IApiResponse'
import i18n from '@/config/i18n'
import { useEffect } from 'react'
import { useWebSocketCtx } from '@/contexts/WebSocketContext'

// Lấy order đang active của bàn thông qua session token
export function usePosSessionOrder(sessionToken: string) {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  // Real-time update via WebSockets
  useEffect(() => {
    if (!sessionToken || !isConnected) return

    const queryKey = QUERY_KEYS.order.bySession(sessionToken)

    // Subscribe to tickets status updates and general order events
    const subTickets = subscribe(`/topic/sessions/${sessionToken}/tickets`, () => {
      queryClient.invalidateQueries({ queryKey })
    })
    const subOrders = subscribe(`/topic/sessions/${sessionToken}/orders`, () => {
      queryClient.invalidateQueries({ queryKey })
    })
    const subPaid = subscribe(`/topic/sessions/${sessionToken}/paid`, () => {
      queryClient.invalidateQueries({ queryKey })
    })
    const subGlobal = subscribe('/topic/pos/updates', () => {
      queryClient.invalidateQueries({ queryKey })
    })

    return () => {
      subTickets?.unsubscribe()
      subOrders?.unsubscribe()
      subPaid?.unsubscribe()
      subGlobal?.unsubscribe()
    }
  }, [sessionToken, isConnected, subscribe, queryClient])

  return useQuery<IOrder>({
    queryKey: QUERY_KEYS.order.bySession(sessionToken),
    queryFn: async () => {
      const res = await http.get<IApiResponse<IOrder>>(
        '/orders/session',
        { headers: { 'X-Session-Token': sessionToken } }
      )
      return res.data.data
    },
    enabled: !!sessionToken,
    staleTime: 30_000, // No need for frequent refetch since we have WS
  })
}

// Checkout: chốt đơn, trả tiền và giải phóng bàn
export function usePosCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      releaseTable = true,
      paymentMethod = 'CASH',
      paymentDetail,
    }: {
      orderId: string
      releaseTable?: boolean
      paymentMethod?: string
      paymentDetail?: Record<string, number> | null
    }) => orderService.checkoutOrder(orderId, releaseTable, paymentMethod, paymentDetail),
    onSuccess: (_, variables) => {
      if (variables.releaseTable) {
        queryClient.removeQueries({ queryKey: QUERY_KEYS.order.all })
      } else {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      }
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
      queryClient.invalidateQueries({ queryKey: ['pos-takeaways'] })
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || i18n.t('pos.payment.error', 'Thanh toán thất bại, vui lòng thử lại'))
    },
  })
}

// Cancel đơn từ POS
export function usePosCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId, 'Thu ngân huỷ đơn'),
    onSuccess: () => {
      toast.success(i18n.t('pos.orderDetail.cancelSuccess', 'Đã huỷ đơn hàng'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
      queryClient.invalidateQueries({ queryKey: ['pos-takeaways'] })
    },
    onError: () => toast.error(i18n.t('pos.orderDetail.cancelError', 'Huỷ đơn thất bại')),
  })
}

export function usePosRequestPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionToken: string) => orderService.requestPayment(sessionToken),
    onSuccess: () => {
      toast.success(i18n.t('pos.orderDetail.requestPaymentSuccess', 'Đã yêu cầu tính tiền (Tạm tính)'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
      queryClient.invalidateQueries({ queryKey: ['pos-takeaways'] })
    },
    onError: () => toast.error(i18n.t('pos.orderDetail.requestPaymentError', 'Yêu cầu tính tiền thất bại')),
  })
}

export function usePosCancelItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, itemId, reason }: { orderId: string, itemId: string, reason?: string }) =>
      orderService.cancelItem(orderId, itemId, reason),
    onSuccess: () => {
      toast.success(i18n.t('pos.orderDetail.cancelItemSuccess', 'Đã huỷ món thành công'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || i18n.t('common.error', 'Có lỗi xảy ra'))
    },
  })
}

export function usePosCancelTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, ticketId, reason }: { orderId: string, ticketId: string, reason?: string }) =>
      orderService.cancelTicket(orderId, ticketId, reason),
    onSuccess: () => {
      toast.success(i18n.t('pos.orderDetail.cancelTicketSuccess', 'Đã huỷ toàn bộ phiếu yêu cầu'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || i18n.t('common.error', 'Có lỗi xảy ra'))
    },
  })
}

export function usePosReturnItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, itemId, reason }: { orderId: string, itemId: string, reason?: string }) =>
      orderService.returnItem(orderId, itemId, reason),
    onSuccess: () => {
      toast.success(i18n.t('pos.orderDetail.returnItemSuccess', 'Đã trả hàng / Hoàn món thành công'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || i18n.t('common.error', 'Có lỗi xảy ra'))
    },
  })
}

export function usePosApplyPromotion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, code }: { orderId: string, code: string }) =>
      orderService.applyPromotion(orderId, code),
    onSuccess: () => {
      toast.success(i18n.t('pos.payment.promoSuccess', 'Áp dụng mã thành công'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || i18n.t('pos.payment.promoError', 'Mã không hợp lệ hoặc đã hết hạn'))
    },
  })
}
