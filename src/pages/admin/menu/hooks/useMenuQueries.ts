import { useQuery } from '@tanstack/react-query'
import { adminMenuService } from '../services/adminMenu.service'

export function useAdminMenuItems(params?: { categoryId?: string, isActive?: boolean, isAvailable?: boolean, isFeatured?: boolean, station?: string, keyword?: string, page?: number, size?: number }) {
  return useQuery({
    queryKey: ['admin-menu-items', params],
    queryFn: () => adminMenuService.getMenuItems(params),
  })
}

export function useAdminMenuItem(id?: string | null) {
  return useQuery({
    queryKey: ['admin-menu-items', id],
    queryFn: () => adminMenuService.getMenuItemById(id!),
    enabled: !!id
  })
}

export function useAdminCategories(params?: { keyword?: string, page?: number, size?: number }) {
  return useQuery({
    queryKey: ['admin-categories', params],
    queryFn: () => adminMenuService.getCategories(params),
  })
}
