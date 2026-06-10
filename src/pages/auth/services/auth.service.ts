import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import type { ILoginResponse, IUser } from '../types/auth.type'
import type { IApiResponse } from '@/shared/types/IApiResponse'

export interface ILoginPayload {
  username: string
  password: string
}

export const authService = {
  login: async (data: ILoginPayload) => {
    const res = await http.post<IApiResponse<ILoginResponse>>(API_ROUTES.auth.login, data)
    return res.data.data
  },
  getMe: async (): Promise<IUser> => {
    const res = await http.get<IApiResponse<IUser>>(API_ROUTES.auth.me)
    return res.data.data
  },
  logout: async () => {
    const res = await http.post<IApiResponse<void>>(API_ROUTES.auth.logout)
    return res.data
  }
}
