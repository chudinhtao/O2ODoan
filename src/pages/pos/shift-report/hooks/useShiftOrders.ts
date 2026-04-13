import { useQuery } from '@tanstack/react-query'
import http from '@/services/interceptor'
import type { IPageResponse, IApiResponse } from '@/shared/types/IApiResponse'
import type { IOrder, OrderFiltersParams } from '@/pages/admin/orders/types/order.type'

export function useShiftOrders(date: string) {
  // We want to get all orders from date 00:00:00 to 23:59:59
  const startDate = `${date}T00:00:00`
  const endDate = `${date}T23:59:59`
  
  const params: OrderFiltersParams = {
    page: 0,
    size: 200, // get a large number of orders
    startDate,
    endDate,
    sort: 'createdAt,desc',
  }

  return useQuery<IPageResponse<IOrder>>({
    queryKey: ['shift-orders', params],
    queryFn: async () => {
      const res = await http.get<IApiResponse<IPageResponse<IOrder>>>('/orders/history', {
        params,
      })
      return res.data.data
    },
    enabled: !!date,
  })
}
