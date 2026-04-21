import http from '@/services/interceptor'
import type { IApiResponse, IPageResponse } from '@/shared/types/IApiResponse'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import type { IPromotion, IPromotionForm } from '../types/adminPromotion.type'

class PromotionService {
  async getPromotions(
    params: { keyword?: string; page: number; size: number }
  ): Promise<IPageResponse<IPromotion>> {
    const response = await http.get<IApiResponse<IPageResponse<IPromotion>>>(
      API_ROUTES.promotion.root,
      { params }
    )
    return response.data.data
  }

  async getPromotionById(id: string): Promise<IPromotion> {
    const response = await http.get<IApiResponse<IPromotion>>(
      API_ROUTES.promotion.byId(id)
    )
    return response.data.data
  }

  async createPromotion(data: IPromotionForm): Promise<IPromotion> {
    const response = await http.post<IApiResponse<IPromotion>>(
      API_ROUTES.promotion.root,
      data
    )
    return response.data.data
  }

  async updatePromotion(id: string, data: IPromotionForm): Promise<IPromotion> {
    const response = await http.put<IApiResponse<IPromotion>>(
      API_ROUTES.promotion.byId(id),
      data
    )
    return response.data.data
  }

  async deletePromotion(id: string): Promise<void> {
    await http.delete<IApiResponse<void>>(API_ROUTES.promotion.byId(id))
  }

  async togglePromotionStatus(id: string): Promise<IPromotion> {
    const response = await http.patch<IApiResponse<IPromotion>>(
      API_ROUTES.promotion.toggle(id)
    )
    return response.data.data
  }
}

export const adminPromotionService = new PromotionService()
