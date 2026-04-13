import { useMutation, useQueryClient } from '@tanstack/react-query'
import { customerService } from '../services/customerService'
import { CUSTOMER_QUERY_KEYS } from './useCustomerQueries'
import { ITicketItemRequest } from '../types'
import { toast } from 'sonner'

export function useCustomerOpenSession() {
  return useMutation({
    mutationFn: (qrToken: string) => customerService.openSession(qrToken),
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể mở phiên bàn')
    }
  })
}

export function useCustomerAddToCart(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ITicketItemRequest) => customerService.addToCart(token!, payload),
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.cart(token) })
      }
      toast.success('Đã thêm vào giỏ hàng')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể thêm vào giỏ hàng')
    }
  })
}

export function useCustomerUpdateCartItem(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cartItemId, quantity, note }: { cartItemId: string, quantity: number, note: string }) => 
      customerService.updateCartItem(token!, cartItemId, quantity, note),
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.cart(token) })
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Lỗi cập nhật giỏ hàng')
    }
  })
}

export function useCustomerDeleteCartItem(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (cartItemId: string) => customerService.deleteCartItem(token!, cartItemId),
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.cart(token) })
      }
      toast.success('Đã xóa món khỏi giỏ')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể xóa món')
    }
  })
}

export function useCustomerSubmitOrder(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (note?: string) => customerService.submitOrder(token!, note),
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.cart(token) })
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
      }
      toast.success('Đã gửi bếp thành công!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Lỗi gửi yêu cầu order')
    }
  })
}

export function useCustomerRequestPayment(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (method: string) => customerService.requestPayment(token!, method),
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
      }
      toast.success('Đã gửi yêu cầu thanh toán')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Lỗi khi yêu cầu thanh toán')
    }
  })
}

export function useCustomerCallStaff(token: string | null) {
  return useMutation({
    mutationFn: ({ callType, note }: { callType: string, note?: string }) => customerService.callStaff(token!, callType, note),
    onSuccess: () => {
      toast.success('Đã gọi nhân viên, vui lòng đợi trong giây lát')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể gọi nhân viên lúc này')
    }
  })
}

export function useCustomerCancelTicket(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketId: string) => customerService.cancelTicket(token!, ticketId),
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể hủy phiếu món')
    }
  })
}

export function useCustomerCancelItem(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId: string) =>
      customerService.cancelItem(token!, itemId),
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Không thể hủy món')
    }
  })
}

export function useCustomerApplyPromotion(token: string | null) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => customerService.applyPromotion(token!, code),
    onSuccess: () => {
      if (token) {
        queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
      }
      toast.success('Đã áp dụng mã giảm giá thành công!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Mã giảm giá không hợp lệ')
    }
  })
}
