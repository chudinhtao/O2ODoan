import http from '@/services/interceptor'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { IProfileData, IProfileRequest } from '../types'

export const settingsService = {
  getProfile: (): Promise<IProfileData> =>
    http.get<IApiResponse<IProfileData>>('/admin/profile').then(r => r.data.data),

  updateProfile: (data: IProfileRequest): Promise<IProfileData> =>
    http.put<IApiResponse<IProfileData>>('/admin/profile', data).then(r => r.data.data),
}
