import { useQuery } from '@tanstack/react-query'
import http from '@/services/interceptor'
import type { IPageResponse, IApiResponse } from '@/shared/types/IApiResponse'
import type { IOrder, OrderFiltersParams } from '@/pages/admin/orders/types/order.type'

export function useShiftOrders(startDate: string, endDate: string, page = 0, size = 10, keyword?: string) {
  
  const params: OrderFiltersParams = {
    page,
    size,
    startDate,
    endDate,
    sort: 'updatedAt,asc',
    ...(keyword ? { keyword } : {})
  }

  return useQuery<IPageResponse<IOrder>>({
    queryKey: ['shift-orders', params],
    queryFn: async () => {
      const res = await http.get<IApiResponse<IPageResponse<IOrder>>>('/orders/history', {
        params,
      })
      return res.data.data
    },
    enabled: !!startDate,
  })
}
