import http from '@/services/interceptor'
import { IApiResponse, IPageResponse } from '@/shared/types/IApiResponse'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { unwrapApiData } from '@/shared/utils/apiResponse'
import { IMenuItem, ICategory } from '@/pages/admin/menu/types/adminMenu.type'

export const posMenuService = {
  getCategories: () =>
    http.get<IApiResponse<IPageResponse<ICategory>>>(API_ROUTES.menu.categories).then(unwrapApiData),

  getItems: (categoryId?: string) =>
    http.get<IApiResponse<IPageResponse<IMenuItem>>>(API_ROUTES.menu.items, {
      params: { categoryId, size: 100, isAvailable: true, isActive: true }
    }).then(unwrapApiData),

  getItem: (id: string) =>
    http.get<IApiResponse<IMenuItem>>(`/menu/items/${id}`).then(unwrapApiData),
}
