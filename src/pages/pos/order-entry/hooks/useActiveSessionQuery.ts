import { useQuery, useMutation } from '@tanstack/react-query'
import http from '@/services/interceptor'
import { IApiResponse } from '@/shared/types/IApiResponse'

interface ActiveSessionData {
  sessionToken: string
  tableNumber: number
}

export function useActiveSessionQuery(tableId?: string) {
  return useQuery({
    queryKey: ['session', 'active', tableId],
    queryFn: async () => {
      const res = await http.get<IApiResponse<ActiveSessionData | null>>(`/sessions/active/${tableId}`)
      return res.data.data
    },
    enabled: !!tableId && tableId !== 'takeaway',
  })
}

export function useTakeawaySessionMutation() {
  return useMutation({
    mutationFn: async () => {
      const res = await http.post<IApiResponse<ActiveSessionData>>('/sessions/open/takeaway')
      return res.data.data
    }
  })
}
