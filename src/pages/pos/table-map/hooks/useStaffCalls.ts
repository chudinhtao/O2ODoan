import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import http from '@/services/interceptor'
import type { IApiResponse } from '@/shared/types/IApiResponse'
import { useWebSocketCtx } from '@/contexts/WebSocketContext'

export interface IStaffCall {
  id: string
  sessionId: string
  tableId: string
  tableNumber: number
  callType: string
  status: string
  createdAt: string
  resolvedAt: string | null
}

const STAFF_CALL_KEY = ['staff-calls', 'active']

export function useActiveStaffCalls() {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  // Realtime subscription
  useEffect(() => {
    if (!isConnected) return
    const sub = subscribe('/topic/staff/calls', () => {
      // Khi có cuộc gọi mới từ WebSocket, invalidate cache liền lập tức
      queryClient.invalidateQueries({ queryKey: STAFF_CALL_KEY })
    })
    return () => {
      sub?.unsubscribe()
    }
  }, [subscribe, isConnected, queryClient])

  return useQuery({
    queryKey: STAFF_CALL_KEY,
    queryFn: async () => {
      const { data } = await http.get<IApiResponse<IStaffCall[]>>('/staff-calls/active')
      return data.data
    },
  })
}

export function useResolveStaffCall() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => http.put<IApiResponse<string>>(`/staff-calls/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_CALL_KEY })
      import('@/config/i18n').then(({ default: i18n }) => toast.success(i18n.t('pos.staffCalls.resolveSuccess')))
    },
  })
}
