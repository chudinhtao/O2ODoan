import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '@/config/i18n'
import { getSuccessMessage } from '@/shared/utils/apiResponse'
import { posReservationService } from '../services/posReservation.service'
import { IReservationRequest, IUpdateReservationRequest, IAssignTableRequest, ICancelReservationRequest } from '@/shared/types/reservation'
import { useWebSocketCtx } from '@/contexts/WebSocketContext'
import { useEffect } from 'react'

export const RESERVATION_KEYS = {
  all: ['pos-reservations'] as const,
  byFilters: (date: string, status?: string, keyword?: string, page?: number, size?: number) => 
    [...RESERVATION_KEYS.all, date, status, keyword, page, size] as const,
}

export function usePosReservations(dateStr: string, status?: string, keyword?: string, page: number = 0, size: number = 20) {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  // Listen to table and pos updates to keep reservations in sync
  useEffect(() => {
    if (!isConnected) return
    
    const subTables = subscribe('/topic/pos/tables', () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
    })
    
    const subUpdates = subscribe('/topic/pos/updates', () => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
    })

    return () => {
      subTables?.unsubscribe()
      subUpdates?.unsubscribe()
    }
  }, [isConnected, subscribe, queryClient])

  const { data: pageData, isLoading, isError } = useQuery({
    queryKey: RESERVATION_KEYS.byFilters(dateStr, status, keyword, page, size),
    queryFn: () => posReservationService.getReservations(dateStr, status, keyword, page, size),
    enabled: !!dateStr,
  })

  const createMutation = useMutation({
    mutationFn: (data: IReservationRequest) => posReservationService.createReservation(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      toast.success(getSuccessMessage(res.message, i18n.t('pos.reservations.createSuccess', 'Tạo đặt bàn thành công!')))
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IUpdateReservationRequest }) =>
      posReservationService.updateReservation(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      toast.success(getSuccessMessage(res.message, i18n.t('pos.reservations.updateSuccess', 'Cập nhật thành công!')))
    },
  })

  const assignTableMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IAssignTableRequest }) =>
      posReservationService.assignTables(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      toast.success(getSuccessMessage(res.message, i18n.t('pos.reservations.assignSuccess', 'Đã gán bàn thành công!')))
    },
  })

  const checkInMutation = useMutation({
    mutationFn: (id: string) => posReservationService.checkIn(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      toast.success(getSuccessMessage(res.message, i18n.t('pos.reservations.checkInSuccess', 'Khách đã nhận bàn!')))
    },
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ICancelReservationRequest }) =>
      posReservationService.cancelReservation(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: RESERVATION_KEYS.all })
      toast.success(getSuccessMessage(res.message, i18n.t('pos.reservations.cancelSuccess', 'Đã hủy đặt bàn!')))
    },
  })

  return {
    reservations: pageData?.content || [],
    pageData,
    isLoading,
    isError,
    createMutation,
    updateMutation,
    assignTableMutation,
    checkInMutation,
    cancelMutation,
  }
}
