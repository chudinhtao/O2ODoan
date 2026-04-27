import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '../services/settingsService'
import { IProfileRequest } from '../types'

const QUERY_KEY = ['admin-profile'] as const

export function useAdminProfile() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: settingsService.getProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: IProfileRequest) => settingsService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data)
      queryClient.invalidateQueries({ queryKey: ['restaurant-profile'] })
    },
  })
}
