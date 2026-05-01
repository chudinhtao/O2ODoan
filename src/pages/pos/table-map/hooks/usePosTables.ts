import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { posTableService } from '../services/posTable.service'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { IApiResponse } from '@/shared/types/IApiResponse'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { useWebSocketCtx } from '@/contexts/WebSocketContext'

export const POS_TABLE_KEYS = {
  all: ['pos-tables'] as const,
  takeaways: ['pos-takeaways'] as const,
}

export function usePosTables() {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  useEffect(() => {
    if (!isConnected) return
    const sub = subscribe('/topic/pos/tables', () => {
      queryClient.invalidateQueries({ queryKey: POS_TABLE_KEYS.all })
    })
    return () => {
      sub?.unsubscribe()
    }
  }, [isConnected, subscribe, queryClient])

  return useQuery({
    queryKey: POS_TABLE_KEYS.all,
    queryFn: async () => {
      const res = await posTableService.getTables()
      return res.data.data
    }
  })
}

export function useActiveTakeaways() {
  return useQuery({
    queryKey: POS_TABLE_KEYS.takeaways,
    queryFn: async () => {
      const res = await posTableService.getActiveTakeaways()
      return res.data.data
    },
    staleTime: 0,
    refetchOnMount: 'always',   // Fetch mới mỗi khi vào trang
    refetchInterval: 10_000,    // Tự poll 10s/lần khi đang ở trang
  })
}

export function useOpenPosTable() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: posTableService.openTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_TABLE_KEYS.all })
    },
    onError: (error: AxiosError<IApiResponse<unknown>>) => {
      toast.error(error.response?.data?.message || t('pos.table.errorOpen', 'Không thể mở bàn'))
    }
  })
}

export function useMarkCleaned() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: posTableService.markCleaned,
    onSuccess: () => {
      toast.success(t('pos.table.successCleaned', 'Đã dọn bàn xong'))
      queryClient.invalidateQueries({ queryKey: POS_TABLE_KEYS.all })
    },
    onError: (error: AxiosError<IApiResponse<unknown>>) => {
      toast.error(error.response?.data?.message || t('pos.table.errorClean', 'Lỗi khi dọn bàn'))
    }
  })
}

export function useTransferTable() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: posTableService.transferTable,
    onSuccess: () => {
      toast.success(t('pos.table.successTransfer', 'Chuyển bàn thành công'))
      queryClient.invalidateQueries({ queryKey: POS_TABLE_KEYS.all })
    },
    onError: (error: AxiosError<IApiResponse<unknown>>) => {
      toast.error(error.response?.data?.message || t('pos.table.errorTransfer', 'Lỗi khi chuyển bàn'))
    }
  })
}

export function useMergeTable() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: posTableService.mergeTables,
    onSuccess: () => {
      toast.success(t('pos.table.successMerge', 'Gộp bàn thành công'))
      queryClient.invalidateQueries({ queryKey: POS_TABLE_KEYS.all })
    },
    onError: (error: AxiosError<IApiResponse<unknown>>) => {
      toast.error(error.response?.data?.message || t('pos.table.errorMerge', 'Lỗi khi gộp bàn'))
    }
  })
}
