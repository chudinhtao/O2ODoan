import http from '@/services/interceptor'
import { IApiResponse, IPageResponse } from '@/shared/types/IApiResponse'
import { unwrapApiData, unwrapApiResponse } from '@/shared/utils/apiResponse'
import { IReservation } from '@/shared/types/reservation'

export const adminReservationService = {
  getReservations: (
    startDate?: string,
    endDate?: string,
    status?: string,
    phone?: string,
    page: number = 0,
    size: number = 20,
    hasDeposit?: boolean,
    refundStatus?: string
  ) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString(), sort: 'createdAt,desc' })
    if (startDate) params.append('startDate', `${startDate}T00:00:00`)
    if (endDate) params.append('endDate', `${endDate}T23:59:59`)
    if (status && status !== 'ALL') params.append('status', status)
    if (phone) params.append('phone', phone)
    if (hasDeposit) params.append('hasDeposit', 'true')
    if (refundStatus && refundStatus !== 'ALL') params.append('refundStatus', refundStatus)
    
    return http.get<IApiResponse<IPageResponse<IReservation>>>(`/admin/reservations?${params.toString()}`).then(unwrapApiData)
  },

  updateStatus: (id: string, status: string) => 
    http.patch<IApiResponse<void>>(`/admin/reservations/${id}/status`, { status }).then(unwrapApiResponse),
    
  getReservationById: (id: string) => 
    http.get<IApiResponse<IReservation>>(`/admin/reservations/${id}`).then(unwrapApiData),
}
