import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { adminTableService } from '../services/tableService'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import type { ITableFilters, ITableForm } from '../types/adminTable.type'

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError(err)) return err.response?.data?.message ?? fallback
  return fallback
}

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
    onSuccess: () => {
      toast.success(t('admin.tables.createSuccess'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, t('common.error'))),
  })
}

export const useUpdateTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ITableForm }) =>
      adminTableService.updateTable(id, data),
    onSuccess: () => {
      toast.success(t('admin.tables.updateSuccess'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, t('common.error'))),
  })
}

export const useDeleteTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.deleteTable(id),
    onSuccess: () => {
      toast.success(t('admin.tables.deleteSoftSuccess', 'Đã chuyển bàn vào lưu trữ'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, t('common.error'))),
  })
}

export const useHardDeleteTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.hardDeleteTable(id),
    onSuccess: () => {
      toast.success(t('admin.tables.deleteHardSuccess', 'Đã xóa bàn vĩnh viễn khỏi hệ thống'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, t('common.error'))),
  })
}

export const useToggleActiveTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.toggleActive(id),
    onSuccess: (data) => {
      toast.success(data.active ? t('admin.tables.statusActiveSuccess', 'Đã bật hoạt động') : t('admin.tables.statusInactiveSuccess', 'Đã tạm ngưng hoạt động'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, t('common.error'))),
  })
}

export const useGenerateQr = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.generateQr(id),
    onSuccess: () => {
      toast.success(t('admin.tables.qrGenerateSuccess'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, t('common.error'))),
  })
}

export const useDisableQr = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.disableQr(id),
    onSuccess: () => {
      toast.success(t('admin.tables.qrDisableSuccess'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, t('common.error'))),
  })
}

export const useMarkCleaned = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: (id: string) => adminTableService.markCleaned(id),
    onSuccess: () => {
      toast.success(t('admin.tables.cleanSuccess'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, t('common.error'))),
  })
}

export const useMergeTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ sourceTableId, targetTableId }: { sourceTableId: string; targetTableId: string }) =>
      adminTableService.mergeTable(sourceTableId, targetTableId),
    onSuccess: () => {
      toast.success(t('admin.tables.mergeSuccess'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, t('common.error'))),
  })
}

export const useTransferTable = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: ({ sourceTableId, targetTableId }: { sourceTableId: string; targetTableId: string }) =>
      adminTableService.transferTable(sourceTableId, targetTableId),
    onSuccess: () => {
      toast.success(t('admin.tables.transferSuccess'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.table.all })
    },
    onError: (err: unknown) => toast.error(getErrorMessage(err, t('common.error'))),
  })
}
