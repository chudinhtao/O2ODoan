import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import { orderService } from '../services/order.service'
import { OrderFiltersParams, IOrderPageResponse, IOrder } from '../types/order.type'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export function useOrders(params: OrderFiltersParams) {
  return useQuery<IOrderPageResponse>({
    queryKey: QUERY_KEYS.order.list(params as unknown as Record<string, unknown>),
    queryFn: () => orderService.getOrders(params),
    placeholderData: (prev: IOrderPageResponse | undefined) => prev, // Giữ data cũ khi đổi trang
  })
}

export function useOrderDetails(id: string | null | undefined) {
  return useQuery<IOrder>({
    queryKey: QUERY_KEYS.order.byId(id!),
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
  })
}

export function useOrderMutations() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason, note }: { id: string; reason?: string; note?: string }) => 
      orderService.cancelOrder(id, reason, note),
    onSuccess: (_, variables) => {
      toast.success(t('admin.orders.cancelSuccess', 'Đã huỷ đơn hàng thành công'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.byId(variables.id) })
    },
    onError: () => {
      toast.error(t('admin.orders.error', 'Có lỗi xảy ra, vui lòng thử lại'))
    },
  })

  return { cancelMutation }
}
