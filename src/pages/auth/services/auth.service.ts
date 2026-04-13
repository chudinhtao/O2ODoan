import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import type { ILoginResponse } from '../types/auth.type'
import type { IApiResponse } from '@/shared/types/IApiResponse'

export interface ILoginPayload {
  username: string
  password: string
}

export const authService = {
  login: async (data: ILoginPayload) => {
    const res = await http.post<IApiResponse<ILoginResponse>>(API_ROUTES.auth.login, data)
    return res.data.data
  }
}
