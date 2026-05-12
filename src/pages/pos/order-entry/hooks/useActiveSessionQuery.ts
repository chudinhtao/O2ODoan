import { useQuery, useMutation } from '@tanstack/react-query'
import http from '@/services/interceptor'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { unwrapApiData } from '@/shared/utils/apiResponse'

interface ActiveSessionData {
  sessionToken: string
  tableNumber: number
}

export function useActiveSessionQuery(tableId?: string) {
  return useQuery({
    queryKey: ['session', 'active', tableId],
    queryFn: async () => {
      return http.get<IApiResponse<ActiveSessionData | null>>(`/sessions/active/${tableId}`).then(unwrapApiData)
    },
    enabled: !!tableId && tableId !== 'takeaway',
  })
}

export function useTakeawaySessionMutation() {
  return useMutation({
    mutationFn: async () => {
      return http.post<IApiResponse<ActiveSessionData>>('/sessions/open/takeaway').then(unwrapApiData)
    }
  })
}
