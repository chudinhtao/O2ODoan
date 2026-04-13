import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminMenuService } from '../services/adminMenu.service'
import { IMenuItemRequest, IOptionGroupRequest, ICategoryRequest } from '../types/adminMenu.type'
import { toast } from 'sonner'
import { t } from 'i18next'

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(t('admin.categories.notifications.createSuccess'))
    }
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: ICategoryRequest }) => 
      adminMenuService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(t('admin.categories.notifications.updateSuccess'))
    }
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(t('admin.categories.notifications.deleteSuccess'))
    }
  })
}

export function useHardDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.hardDeleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(t('admin.categories.notifications.hardDeleteSuccess', 'Đã xóa danh mục vĩnh viễn'))
    }
  })
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.toggleCategoryStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(t('admin.categories.notifications.updateSuccess'))
    }
  })
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.createMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(t('admin.menu.notifications.createSuccess'))
    }
  })
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: IMenuItemRequest }) => 
      adminMenuService.updateMenuItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(t('admin.menu.notifications.updateSuccess'))
    }
  })
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.deleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(t('admin.menu.notifications.deleteSuccess', 'Đã ẩn món thành công'))
    }
  })
}

export function useRestoreMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.restoreMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(t('admin.menu.notifications.restoreSuccess', 'Khôi phục món thành công'))
    }
  })
}

export function useHardDeleteMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.hardDeleteMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(t('admin.menu.notifications.hardDeleteSuccess', 'Đã xóa món vĩnh viễn'))
    }
  })
}

export function useToggleMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.toggleMenuItemStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(t('admin.menu.notifications.toggleSuccess'))
    }
  })
}

export function useAddOptionGroups() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, groups }: { id: string, groups: IOptionGroupRequest[] }) =>
      adminMenuService.addOptionGroups(id, groups),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(t('admin.menu.notifications.updateSuccess'))
    }
  })
}
