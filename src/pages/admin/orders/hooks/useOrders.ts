import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import { getSuccessMessage } from '@/shared/utils/apiResponse'
import { orderService } from '../services/order.service'
import type { IOrder, IOrderPageResponse, OrderFiltersParams } from '../types/order.type'

export function useOrders(params: OrderFiltersParams) {
  return useQuery<IOrderPageResponse>({
    queryKey: QUERY_KEYS.order.list(params as unknown as Record<string, unknown>),
    queryFn: () => orderService.getOrders(params),
    placeholderData: (prev: IOrderPageResponse | undefined) => prev,
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
    onSuccess: (res, variables) => {
      toast.success(getSuccessMessage(res.message, t('admin.orders.cancelSuccess', 'Đã hủy đơn hàng thành công')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.all })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order.byId(variables.id) })
    },
  })

  return { cancelMutation }
}
