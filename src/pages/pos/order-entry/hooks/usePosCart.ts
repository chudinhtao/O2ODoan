import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '@/config/i18n'
import { useWebSocketCtx } from '@/contexts/WebSocketContext'
import { posOrderService } from '../services/posOrder.service'
import type { IAddCartItemRequest, IUpdateCartItemRequest } from '../types/posOrder.type'
import { getSuccessMessage } from '@/shared/utils/apiResponse'

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
    queryFn: () => posOrderService.getCart(sessionToken),
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
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, i18n.t('pos.cart.submitSuccess')))
      queryClient.invalidateQueries({ queryKey: POS_CART_KEY(sessionToken) })
    },
  })
}
