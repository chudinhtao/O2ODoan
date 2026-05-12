import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useWebSocketCtx } from '@/contexts/WebSocketContext'
import { posTableService } from '../services/posTable.service'
import { getSuccessMessage } from '@/shared/utils/apiResponse'

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
    queryFn: () => posTableService.getTables()
  })
}

export function useActiveTakeaways() {
  return useQuery({
    queryKey: POS_TABLE_KEYS.takeaways,
    queryFn: () => posTableService.getActiveTakeaways(),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: 10_000,
  })
}

export function useOpenPosTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: posTableService.openTable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POS_TABLE_KEYS.all })
    },
  })
}

export function useMarkCleaned() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: posTableService.markCleaned,
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('pos.table.successCleaned', 'Đã dọn bàn xong')))
      queryClient.invalidateQueries({ queryKey: POS_TABLE_KEYS.all })
    },
  })
}

export function useTransferTable() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: posTableService.transferTable,
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('pos.table.successTransfer', 'Chuyển bàn thành công')))
      return queryClient.invalidateQueries({ queryKey: POS_TABLE_KEYS.all })
    },
  })
}

export function useMergeTable() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  return useMutation({
    mutationFn: posTableService.mergeTables,
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('pos.table.successMerge', 'Gộp bàn thành công')))
      return queryClient.invalidateQueries({ queryKey: POS_TABLE_KEYS.all })
    },
  })
}
