import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { toast } from 'sonner'
import { adminPromotionService } from '../services/promotionService'
import type { IPromotionForm, IFlashSaleForm } from '../types/adminPromotion.type'
import { useTranslation } from 'react-i18next'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'

const getErrorMessage = (err: unknown, fallback: string): string => {
  if (isAxiosError(err)) return err.response?.data?.message ?? fallback
  return fallback
}



export const usePromotions = (params: { keyword?: string; page: number; size: number }) => {
  return useQuery({
    queryKey: QUERY_KEYS.promotion.list(params),
    queryFn: () => adminPromotionService.getPromotions(params)
  })
}

export const useCreatePromotion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: IPromotionForm) => adminPromotionService.createPromotion(data),
    onSuccess: () => {
      toast.success(t('admin.promotion.createSuccess') || 'Tạo khuyến mãi thành công!')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('common.error')))
    }
  })
}

export const useCreateFlashSale = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: IFlashSaleForm) => adminPromotionService.createFlashSale(data),
    onSuccess: () => {
      toast.success(t('admin.promotion.flashSale.createSuccess', 'Tạo chiến dịch Flash Sale thành công!'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('common.error')))
    }
  })
}

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IPromotionForm }) =>
      adminPromotionService.updatePromotion(id, data),
    onSuccess: () => {
      toast.success(t('admin.promotion.updateSuccess') || 'Cập nhật khuyến mãi thành công!')
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('common.error')))
    }
  })
}

export const useDeletePromotion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => adminPromotionService.deletePromotion(id),
    onSuccess: () => {
      toast.success(t('admin.promotion.deleteSuccess', 'Đã tạm dừng khuyến mãi thành công!'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('common.error')))
    }
  })
}

export const useHardDeletePromotion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => adminPromotionService.hardDeletePromotion(id),
    onSuccess: () => {
      toast.success(t('admin.promotion.hardDeleteSuccess', 'Đã xóa vĩnh viễn khuyến mãi thành công!'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('common.error')))
    }
  })
}

export const useTogglePromotionStatus = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => adminPromotionService.togglePromotionStatus(id),
    onSuccess: () => {
      toast.success(t('admin.promotion.toggleSuccess', 'Cập nhật trạng thái thành công!'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('common.error')))
    }
  })
}
