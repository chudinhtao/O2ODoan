import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import http from '@/services/interceptor'
import type { IApiResponse } from '@/shared/types/IApiResponse'

export interface IShiftReport {
  shiftDate: string
  totalRevenue: number
  totalOrders: number
  revenueByPaymentMethod: Record<string, number>
  ordersByPaymentMethod: Record<string, number>
}

// Gọi API sang report-service để lấy báo cáo của ca
export function useShiftReport(shiftDate: string) {
  return useQuery<IShiftReport>({
    queryKey: QUERY_KEYS.report.shift(shiftDate),
    queryFn: async () => {
      const res = await http.get<IApiResponse<IShiftReport>>('/reports/cashier-shift', {
        params: { shiftDate },
      })
      return res.data.data
    },
    enabled: !!shiftDate,
  })
}
