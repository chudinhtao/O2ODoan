import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminReservationService } from '../services/adminReservation.service'
import { posReservationService } from '@/pages/pos/reservations/services/posReservation.service'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export const ADMIN_RESERVATION_KEYS = {
  all: ['adminReservations'] as const,
  list: (filters: any) => [...ADMIN_RESERVATION_KEYS.all, 'list', filters] as const,
  detail: (id: string) => [...ADMIN_RESERVATION_KEYS.all, 'detail', id] as const,
}

export function useAdminReservationsList(
  startDate?: string,
  endDate?: string,
  status?: string,
  phone?: string,
  page: number = 0,
  size: number = 20,
  hasDeposit?: boolean,
  refundStatus?: string
) {
  return useQuery({
    queryKey: ADMIN_RESERVATION_KEYS.list({ startDate, endDate, status, phone, page, size, hasDeposit, refundStatus }),
    queryFn: () => adminReservationService.getReservations(startDate, endDate, status, phone, page, size, hasDeposit, refundStatus),
    placeholderData: (previousData) => previousData,
  })
}

export function useAdminUpdateReservationStatus() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async ({ id, status, reason, refundStatus }: { id: string; status: string, reason?: string, refundStatus?: string }) => {
      if (status === 'CANCELLED' || status === 'NO_SHOW') {
        await posReservationService.cancelReservation(id, { reason, status: status as 'CANCELLED' | 'NO_SHOW', refundStatus })
        return
      }
      await adminReservationService.updateStatus(id, status)
    },
    onSuccess: () => {
      toast.success(t('admin.reservations.statusUpdated', 'Cập nhật trạng thái thành công'))
      queryClient.invalidateQueries({ queryKey: ADMIN_RESERVATION_KEYS.all })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || t('admin.reservations.statusUpdateFailed', 'Cập nhật trạng thái thất bại'))
    },
  })
}
