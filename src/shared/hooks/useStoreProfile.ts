import { useQuery } from '@tanstack/react-query'
import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'

export interface IStoreProfile {
  id: string
  name: string
  slogan: string | null
  logoUrl: string | null
  bannerUrl: string | null
  address: string | null
  phone: string | null
}

export function useStoreProfile() {
  return useQuery({
    queryKey: ['store-profile'],
    queryFn: async () => {
      const res = await http.get<{ data: IStoreProfile }>(API_ROUTES.menu.profile)
      return res.data.data
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
    retry: 2,
  })
}
