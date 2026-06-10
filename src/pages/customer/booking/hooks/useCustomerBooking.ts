import { useMutation } from '@tanstack/react-query'
import http from '@/services/interceptor'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { IReservationRequest, IReservation } from '@/shared/types/reservation'

export function useCustomerCreateBooking() {
  return useMutation({
    mutationFn: async (data: IReservationRequest) => {
      // The new endpoint created in backend for customer reservations
      const response = await http.post<IApiResponse<IReservation>>('/customer/reservations', data)
      return response.data
    }
  })
}

export function useCustomerCreateDepositLink() {
  return useMutation({
    mutationFn: async ({ reservationId, redirectUrl }: { reservationId: string, redirectUrl: string }) => {
      const response = await http.post<{checkoutUrl: string, qrCode?: string}>(`/payments/payos/reservation-deposit`, null, {
        params: { reservationId, redirectUrl }
      })
      return response.data
    }
  })
}
