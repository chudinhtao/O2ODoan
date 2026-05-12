import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { adminTableService } from '../services/tableService'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import type { ITableFilters, ITableForm } from '../types/adminTable.type'

const getSuccessMessage = (message: string | undefined, fallback: string): string => message || fallback

export const useTables = (filters: ITableFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.table.list(filters as unknown as Record<string, unknown>),
    queryFn: () => adminTableService.getTables(filters),
  })
}

export const useCreateTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (data: ITableForm) => adminTableService.createTable(data),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.tables.createSuccess')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
  })
}

export const useUpdateTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ITableForm }) =>
      adminTableService.updateTable(id, data),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.tables.updateSuccess')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
  })
}

export const useDeleteTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.deleteTable(id),
    onSuccess: (message) => {
      toast.success(getSuccessMessage(message, t('admin.tables.deleteSoftSuccess', 'Đã chuyển bàn vào lưu trữ')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
  })
}

export const useHardDeleteTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.hardDeleteTable(id),
    onSuccess: (message) => {
      toast.success(getSuccessMessage(message, t('admin.tables.deleteHardSuccess', 'Đã xóa bàn vĩnh viễn khỏi hệ thống')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
  })
}

export const useToggleActiveTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.toggleActive(id),
    onSuccess: (res) => {
      const fallback = res.data.active ? t('admin.tables.statusActiveSuccess', 'Đã bật hoạt động') : t('admin.tables.statusInactiveSuccess', 'Đã tạm ngưng hoạt động')
      toast.success(getSuccessMessage(res.message, fallback))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
  })
}

export const useGenerateQr = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.generateQr(id),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.tables.qrGenerateSuccess')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
  })
}

export const useDisableQr = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.disableQr(id),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.tables.qrDisableSuccess')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
  })
}

export const useMarkCleaned = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.markCleaned(id),
    onSuccess: (message) => {
      toast.success(getSuccessMessage(message, t('admin.tables.cleanSuccess')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
  })
}

export const useMergeTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ sourceTableId, targetTableId }: { sourceTableId: string; targetTableId: string }) =>
      adminTableService.mergeTable(sourceTableId, targetTableId),
    onSuccess: (message) => {
      toast.success(getSuccessMessage(message, t('admin.tables.mergeSuccess')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
  })
}

export const useTransferTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ sourceTableId, targetTableId }: { sourceTableId: string; targetTableId: string }) =>
      adminTableService.transferTable(sourceTableId, targetTableId),
    onSuccess: (message) => {
      toast.success(getSuccessMessage(message, t('admin.tables.transferSuccess')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
  })
}
