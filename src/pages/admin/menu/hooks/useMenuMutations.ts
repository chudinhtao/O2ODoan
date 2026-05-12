import { useMutation, useQueryClient } from '@tanstack/react-query'
import { t } from 'i18next'
import { toast } from 'sonner'
import { adminMenuService } from '../services/adminMenu.service'
import type { ICategoryRequest, IMenuItemRequest, IOptionGroupRequest } from '../types/adminMenu.type'

const successMessage = (message: string | undefined, fallback: string) => message || fallback

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.createCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(successMessage(res.message, t('admin.categories.notifications.createSuccess')))
    }
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: ICategoryRequest }) =>
      adminMenuService.updateCategory(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(successMessage(res.message, t('admin.categories.notifications.updateSuccess')))
    }
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.deleteCategory,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(successMessage(message, t('admin.categories.notifications.deleteSuccess')))
    }
  })
}

export function useHardDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.hardDeleteCategory,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(successMessage(message, t('admin.categories.notifications.hardDeleteSuccess', 'Da xoa danh muc vinh vien')))
    }
  })
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.toggleCategoryStatus,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(successMessage(res.message, t('admin.categories.notifications.updateSuccess')))
    }
  })
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.createMenuItem,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(successMessage(res.message, t('admin.menu.notifications.createSuccess')))
    }
  })
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: IMenuItemRequest }) =>
      adminMenuService.updateMenuItem(id, payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(successMessage(res.message, t('admin.menu.notifications.updateSuccess')))
    }
  })
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.deleteMenuItem,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(successMessage(message, t('admin.menu.notifications.deleteSuccess', 'Da an mon thanh cong')))
    }
  })
}

export function useRestoreMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.restoreMenuItem,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(successMessage(res.message, t('admin.menu.notifications.restoreSuccess', 'Khoi phuc mon thanh cong')))
    }
  })
}

export function useHardDeleteMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.hardDeleteMenuItem,
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(successMessage(message, t('admin.menu.notifications.hardDeleteSuccess', 'Da xoa mon vinh vien')))
    }
  })
}

export function useToggleMenuItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminMenuService.toggleMenuItemStatus,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(successMessage(res.message, t('admin.menu.notifications.toggleSuccess')))
    }
  })
}

export function useAddOptionGroups() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, groups }: { id: string, groups: IOptionGroupRequest[] }) =>
      adminMenuService.addOptionGroups(id, groups),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] })
      toast.success(successMessage(res.message, t('admin.menu.notifications.updateSuccess')))
    }
  })
}
