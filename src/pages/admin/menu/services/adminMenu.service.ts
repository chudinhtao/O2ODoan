import http from '@/services/interceptor'
import { IMenuItem, ICategory, ICategoryRequest, IMenuItemRequest, IOptionGroupRequest } from '../types/adminMenu.type'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { IApiResponse } from '@/shared/types/IApiResponse'
import type { IPageResponse } from '@/shared/types/IApiResponse'

export const adminMenuService = {
  getMenuItems: async (params?: { categoryId?: string, isActive?: boolean, isAvailable?: boolean, isFeatured?: boolean, station?: string, keyword?: string, page?: number, size?: number }) => {
    const res = await http.get<IApiResponse<IPageResponse<IMenuItem>>>(API_ROUTES.adminMenu.items, { params })
    return res.data.data
  },
  getMenuItemById: async (id: string) => {
    const res = await http.get<IApiResponse<IMenuItem>>(API_ROUTES.adminMenu.item(id))
    return res.data.data
  },
  
  // -- Categories API --
  getCategories: async (params?: { keyword?: string, page?: number, size?: number }) => {
    const res = await http.get<IApiResponse<IPageResponse<ICategory>>>(API_ROUTES.adminMenu.categories, { params })
    return res.data.data
  },
  createCategory: async (payload: ICategoryRequest) => {
    const res = await http.post<IApiResponse<ICategory>>(API_ROUTES.adminMenu.categories, payload)
    return res.data
  },
  updateCategory: async (id: string, payload: ICategoryRequest) => {
    const res = await http.put<IApiResponse<ICategory>>(API_ROUTES.adminMenu.category(id), payload)
    return res.data
  },
  deleteCategory: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(API_ROUTES.adminMenu.category(id))
    return res.data.message
  },
  hardDeleteCategory: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(API_ROUTES.adminMenu.categoryHard(id))
    return res.data.message
  },
  toggleCategoryStatus: async (id: string) => {
    const res = await http.patch<IApiResponse<ICategory>>(`${API_ROUTES.adminMenu.category(id)}/toggle`)
    return res.data
  },

  // -- Items API --
  createMenuItem: async (payload: IMenuItemRequest) => {
    const res = await http.post<IApiResponse<IMenuItem>>(API_ROUTES.adminMenu.items, payload)
    return res.data
  },
  updateMenuItem: async (id: string, payload: IMenuItemRequest) => {
    const res = await http.put<IApiResponse<IMenuItem>>(API_ROUTES.adminMenu.item(id), payload)
    return res.data
  },
  deleteMenuItem: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(API_ROUTES.adminMenu.item(id))
    return res.data.message
  },
  restoreMenuItem: async (id: string) => {
    const res = await http.patch<IApiResponse<IMenuItem>>(`${API_ROUTES.adminMenu.item(id)}/restore`)
    return res.data
  },
  hardDeleteMenuItem: async (id: string) => {
    const res = await http.delete<IApiResponse<void>>(`${API_ROUTES.adminMenu.item(id)}/hard`)
    return res.data.message
  },
  toggleMenuItemStatus: async (id: string) => {
    const res = await http.patch<IApiResponse<IMenuItem>>(`${API_ROUTES.adminMenu.item(id)}/toggle`)
    return res.data
  },
  addOptionGroups: async (id: string, groups: IOptionGroupRequest[]) => {
    const res = await http.post<IApiResponse<IMenuItem>>(`${API_ROUTES.adminMenu.item(id)}/options`, groups)
    return res.data
  },
  bulkUpdateSalePrice: async (payload: any) => {
    const res = await http.post<IApiResponse<void>>(API_ROUTES.adminMenu.bulkSale, payload)
    return res.data.data
  }
}
