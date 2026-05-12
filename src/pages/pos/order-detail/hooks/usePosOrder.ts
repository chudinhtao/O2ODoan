import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '@/config/i18n'
import { useWebSocketCtx } from '@/contexts/WebSocketContext'
import { orderService } from '@/pages/admin/orders/services/order.service'
import type { IOrder } from '@/pages/admin/orders/types/order.type'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import http from '@/services/interceptor'
import type { IApiResponse } from '@/shared/types/IApiResponse'
import { getSuccessMessage } from '@/shared/utils/apiResponse'

export function usePosSessionOrder(sessionToken: string) {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  useEffect(() => {
    if (!sessionToken || !isConnected) return

    const queryKey = QUERY_KEYS.order.bySession(sessionToken)
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
    staleTime: 30_000,
  })
}

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
  })
}

export function usePosCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId, 'Thu ngan huy don'),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, i18n.t('pos.orderDetail.cancelSuccess', 'Đã hủy đơn hàng')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
      queryClient.invalidateQueries({ queryKey: ['pos-takeaways'] })
    },
  })
}

export function usePosRequestPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (sessionToken: string) => orderService.requestPayment(sessionToken),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, i18n.t('pos.orderDetail.requestPaymentSuccess', 'Đã yêu cầu tính tiền')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
      queryClient.invalidateQueries({ queryKey: ['pos-takeaways'] })
    },
  })
}

export function usePosCancelItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, itemId, reason }: { orderId: string, itemId: string, reason?: string }) =>
      orderService.cancelItem(orderId, itemId, reason),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, i18n.t('pos.orderDetail.cancelItemSuccess', 'Đã hủy món thành công')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
    },
  })
}

export function usePosCancelTicket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, ticketId, reason }: { orderId: string, ticketId: string, reason?: string }) =>
      orderService.cancelTicket(orderId, ticketId, reason),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, i18n.t('pos.orderDetail.cancelTicketSuccess', 'Đã hủy phiếu yêu cầu')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
    },
  })
}

export function usePosReturnItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, itemId, reason }: { orderId: string, itemId: string, reason?: string }) =>
      orderService.returnItem(orderId, itemId, reason),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, i18n.t('pos.orderDetail.returnItemSuccess', 'Đã trả hàng / hoàn món thành công')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: ['pos-tables'] })
    },
  })
}

export function usePosApplyPromotion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, code }: { orderId: string, code: string }) =>
      orderService.applyPromotion(orderId, code),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, i18n.t('pos.payment.promoSuccess', 'Áp dụng mã thành công')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
    },
  })
}
