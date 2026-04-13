import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '@/config/i18n'
import { posOrderService } from '../services/posOrder.service'
import { IAddCartItemRequest, IUpdateCartItemRequest } from '../types/posOrder.type'
import { useEffect } from 'react'
import { useWebSocketCtx } from '@/contexts/WebSocketContext'

export const POS_CART_KEY = (sessionToken: string) => ['pos-cart', sessionToken]

export function usePosCart(sessionToken: string) {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  useEffect(() => {
    if (!sessionToken || !isConnected) return
    const sub = subscribe(`/topic/sessions/${sessionToken}/cart`, () => {
      queryClient.invalidateQueries({ queryKey: POS_CART_KEY(sessionToken) })
    })
    return () => {
      sub?.unsubscribe()
    }
  }, [sessionToken, isConnected, subscribe, queryClient])

  return useQuery({
    queryKey: POS_CART_KEY(sessionToken),
    queryFn: async () => {
      const res = await posOrderService.getCart(sessionToken)
      return res.data.data
    },
    enabled: !!sessionToken,
    staleTime: 0,
  })
}

export function useAddCartItem(sessionToken: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: IAddCartItemRequest) =>
      posOrderService.addCartItem(sessionToken, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_CART_KEY(sessionToken) })
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || i18n.t('pos.cart.addError'))
    }
  })
}

export function useUpdateCartItem(sessionToken: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cartItemId, payload }: { cartItemId: string; payload: IUpdateCartItemRequest }) =>
      posOrderService.updateCartItem(sessionToken, cartItemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_CART_KEY(sessionToken) })
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || i18n.t('pos.cart.updateError', 'Cập nhật số lượng thất bại'))
    }
  })
}

export function useRemoveCartItem(sessionToken: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cartItemId: string) =>
      posOrderService.removeCartItem(sessionToken, cartItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_CART_KEY(sessionToken) })
    },
  })
}

export function useSubmitTicket(sessionToken: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => posOrderService.submitTicket(sessionToken),
    onSuccess: () => {
      toast.success(i18n.t('pos.cart.submitSuccess'))
      queryClient.invalidateQueries({ queryKey: POS_CART_KEY(sessionToken) })
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || i18n.t('pos.cart.submitError'))
    }
  })
}
