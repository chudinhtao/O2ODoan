import http from '@/services/interceptor'
import { IApiResponse, IPageResponse } from '@/shared/types/IApiResponse'
import { unwrapApiData, unwrapApiResponse } from '@/shared/utils/apiResponse'
import { IReservation, IReservationRequest, IUpdateReservationRequest, IAssignTableRequest, ICancelReservationRequest } from '@/shared/types/reservation'

export const posReservationService = {
  getReservations: (dateStr: string, status?: string, keyword?: string, page: number = 0, size: number = 20) => {
    const start = `${dateStr}T00:00:00`
    const end = `${dateStr}T23:59:59`
    const params = new URLSearchParams({ start, end, page: page.toString(), size: size.toString() })
    if (status && status !== 'ALL') params.append('status', status)
    if (keyword) params.append('keyword', keyword)
    
    return http.get<IApiResponse<IPageResponse<IReservation>>>(`/staff/reservations?${params.toString()}`).then(unwrapApiData)
  },

  createReservation: (data: IReservationRequest) => 
    http.post<IApiResponse<IReservation>>(`/admin/reservations`, data).then(unwrapApiResponse),
    
  updateReservation: (id: string, data: IUpdateReservationRequest) => 
    http.put<IApiResponse<IReservation>>(`/staff/reservations/${id}`, data).then(unwrapApiResponse),
    
  assignTables: (id: string, data: IAssignTableRequest) => 
    http.put<IApiResponse<IReservation>>(`/staff/reservations/${id}/assign-tables`, data).then(unwrapApiResponse),
    
  checkIn: (id: string) => 
    http.post<IApiResponse<IReservation>>(`/staff/reservations/${id}/check-in`).then(unwrapApiResponse),
    
  cancelReservation: (id: string, data: ICancelReservationRequest) => 
    http.put<IApiResponse<IReservation>>(`/staff/reservations/${id}/cancel`, data).then(unwrapApiResponse),
    
  createDepositLink: (reservationId: string, redirectUrl: string, amount?: number) => {
    return http.post<{checkoutUrl: string, qrCode?: string}>(`/payments/payos/reservation-deposit`, null, {
      params: { reservationId, redirectUrl, ...(amount && amount > 0 ? { amount } : {}) },
      headers: {
        'X-Skip-Global-Toast': 'true'
      }
    }).then(res => res.data)
  }
}
