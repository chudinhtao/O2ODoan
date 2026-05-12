import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { adminPromotionService } from '../services/promotionService'
import type { IPromotionForm } from '../types/adminPromotion.type'
import { useTranslation } from 'react-i18next'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'

const getSuccessMessage = (message: string | undefined, fallback: string): string => message || fallback

export const usePromotions = (params: { keyword?: string; page: number; size: number }) => {
  return useQuery({
    queryKey: QUERY_KEYS.promotion.list(params),
    queryFn: () => adminPromotionService.getPromotions(params)
  })
}

export const usePromotionById = (id: string | null) => {
  return useQuery({
    queryKey: QUERY_KEYS.promotion.detail(id!),
    queryFn: () => adminPromotionService.getPromotionById(id!),
    enabled: !!id
  })
}

export const useCreatePromotion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: IPromotionForm) => adminPromotionService.createPromotion(data),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.promotion.createSuccess') || 'Tạo khuyến mãi thành công!'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
  })
}

export const useUpdatePromotion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IPromotionForm }) =>
      adminPromotionService.updatePromotion(id, data),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.promotion.updateSuccess') || 'Cập nhật khuyến mãi thành công!'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
  })
}

export const useDeletePromotion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => adminPromotionService.deletePromotion(id),
    onSuccess: (message) => {
      toast.success(getSuccessMessage(message, t('admin.promotion.deleteSuccess', 'Đã xóa khuyến mãi thành công!')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
  })
}

export const useHardDeletePromotion = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => adminPromotionService.hardDeletePromotion(id),
    onSuccess: (message) => {
      toast.success(getSuccessMessage(message, t('admin.promotion.hardDeleteSuccess', 'Đã xóa vĩnh viễn khuyến mãi thành công!')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
  })
}

export const useTogglePromotionStatus = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (id: string) => adminPromotionService.togglePromotionStatus(id),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.promotion.toggleSuccess', 'Cập nhật trạng thái thành công!')))
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.promotion.all })
    },
  })
}
