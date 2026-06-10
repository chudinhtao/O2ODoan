import { useEffect, useMemo, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { IPromotionForm } from '../types/adminPromotion.type'
import { useCreatePromotion, useUpdatePromotion, usePromotionById } from './usePromotions'
import { useAdminCategories } from '../../menu/hooks/useMenuQueries'
import { timeService } from '@/services/time.service'
import { useServerTime } from '@/shared/hooks/useServerTime'

// ─── Zod Schema ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createPromotionSchema = (t: any) => {
  const parseNum = (v: unknown) => {
    if (v === '' || v === null || v === undefined) return undefined
    const n = Number(v)
    if (Number.isNaN(n)) return undefined
    return n
  }

  const optNum = z.preprocess(parseNum, z.number().optional())
    .refine(v => v === undefined || v >= 0, { message: t('admin.promotion.validation.positiveNumber', 'Giá trị phải >= 0') })

  const reqNum = z.preprocess((v) => parseNum(v) ?? 0, z.number())

  return z.object({
    name: z.string().min(1, t('admin.promotion.validation.requiredName', 'Tên không được để trống')),
    code: z.string().optional(),
    scope: z.enum(['PRODUCT', 'ORDER', 'BUNDLE'], {
      message: t('admin.promotion.validation.invalidScope', 'Scope phải là PRODUCT, ORDER hoặc BUNDLE')
    }),
    triggerType: z.enum(['AUTO', 'COUPON'], {
      message: t('admin.promotion.validation.invalidTriggerType', 'triggerType phải là AUTO hoặc COUPON')
    }),
    discountType: z.enum(['PERCENT', 'FIX_AMOUNT', 'FIX_PRICE'], {
      message: t('admin.promotion.validation.invalidDiscountType', 'Loại giảm giá không hợp lệ')
    }),
    discountValue: reqNum.refine((v) => v >= 0, { message: t('admin.promotion.validation.greaterThanZero', 'Bắt buộc nhập số') }),
    maxDiscount: optNum.optional(),
    usageLimit: optNum.optional(),
    priority: reqNum.default(0),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
    stackable: z.boolean().default(false),
    minOrderAmount: reqNum.default(0),
    targetType: z.enum(['GLOBAL', 'CATEGORY', 'ITEM']).default('GLOBAL'),
    targetId: z.string().nullable().optional(),
    bundleItems: z.array(z.object({
      itemId: z.string().min(1, t('admin.promotion.validation.requiredItem', 'Bắt buộc chọn món')),
      quantity: z.preprocess((v) => parseNum(v) ?? 0, z.number().min(1, t('admin.promotion.validation.greaterThanZero', 'SL > 0'))),
      role: z.enum(['BUY', 'GET'])
    })).default([]),
    schedules: z.array(z.object({
      days: z.array(z.number()).min(1, t('admin.promotion.validation.requiredDays', 'Chọn ít nhất 1 ngày')),
      startTime: z.string().min(1, t('admin.promotion.validation.requiredStart', 'Giờ bắt đầu')),
      endTime: z.string().min(1, t('admin.promotion.validation.requiredEnd', 'Giờ kết thúc'))
    })).default([]),
  }).refine(data => {
    if (data.triggerType === 'COUPON' && (!data.code || data.code.trim() === '')) return false
    return true
  }, { message: t('admin.promotion.validation.requiredCodeForCoupon', 'Cần nhập mã coupon khi chọn Trigger = Mã coupon'), path: ['code'] })
    .refine(data => {
      if (data.discountType === 'PERCENT' && data.discountValue != null && data.discountValue > 100) return false
      return true
    }, { message: t('admin.promotion.validation.percentMax', 'Giảm theo % không được vượt quá 100'), path: ['discountValue'] })
    .refine(data => {
      if (data.scope === 'BUNDLE' && data.bundleItems.length === 0) return false
      return true
    }, { message: t('admin.promotion.validation.bundleRequired', 'CTKM Combo yêu cầu ít nhất 1 món điều kiện'), path: ['bundleItems'] })
    .refine(data => {
      if (data.startAt && data.endAt && new Date(data.startAt) > new Date(data.endAt)) return false
      return true
    }, { message: t('admin.promotion.validation.endAfterStart', 'Ngày bắt đầu phải trước ngày kết thúc'), path: ['endAt'] })
}

export type PromotionFormValues = z.infer<ReturnType<typeof createPromotionSchema>>

// ─── Default Values ─────────────────────────────────────────────

export const getInitialDefaults = () => {
  const serverNow = timeService.getNow()
  return {
    name: '',
    code: '',
    scope: 'ORDER' as const,
    triggerType: 'AUTO' as const,
    discountType: 'PERCENT' as const,
    discountValue: 10,
    maxDiscount: undefined,
    usageLimit: undefined,
    priority: 0,
    startAt: format(new Date(serverNow), "yyyy-MM-dd'T'HH:mm"),
    endAt: format(new Date(serverNow + 86400000 * 30), "yyyy-MM-dd'T'HH:mm"),
    stackable: false,
    minOrderAmount: 0,
    targetType: 'GLOBAL' as const,
    targetId: null,
    bundleItems: [] as { itemId: string; quantity: number; role: 'BUY' | 'GET' }[],
    schedules: [] as { days: number[]; startTime: string; endTime: string }[],
  }
}

// ─── Hook ───────────────────────────────────────────────────────

interface UsePromotionFormProps {
  promoId?: string | null
  onSuccess: () => void
}

export function usePromotionForm({ promoId, onSuccess }: UsePromotionFormProps) {
  const { t } = useTranslation()
  const isEdit = !!promoId

  // ── Queries ──
  const { data: editingPromo, isFetching: isLoadingPromo } = usePromotionById(promoId || null)
  const { data: catData } = useAdminCategories({ size: 100 })
  const categories = catData?.content || []

  // ── Mutations ──
  const createMutation = useCreatePromotion()
  const updateMutation = useUpdatePromotion()

  // ── Server Time ──
  const { now } = useServerTime(30000)
  const serverTimeStr = format(new Date(now), 'HH:mm dd/MM/yyyy')

  // ── Form ──
  const schemaResolver = useMemo(() => zodResolver(createPromotionSchema(t)), [t])

  const form = useForm<PromotionFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: schemaResolver as any,
    defaultValues: getInitialDefaults()
  })

  const { reset, setValue, watch, control } = form

  const bundleArray = useFieldArray({ control, name: 'bundleItems' })
  const scheduleArray = useFieldArray({ control, name: 'schedules' })

  // ── Reset form when promo data changes ──
  const lastResetId = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    if (lastResetId.current === promoId && (isEdit ? !!editingPromo : true)) return

    if (!isEdit) {
      reset(getInitialDefaults())
      lastResetId.current = promoId
    } else if (editingPromo) {
      reset({
        name: editingPromo.name,
        code: editingPromo.code ?? '',
        scope: editingPromo.scope,
        triggerType: editingPromo.triggerType,
        discountType: editingPromo.discountType,
        discountValue: editingPromo.discountValue ?? undefined,
        maxDiscount: editingPromo.maxDiscount ?? undefined,
        usageLimit: editingPromo.usageLimit ?? undefined,
        priority: editingPromo.priority,
        startAt: editingPromo.startAt ? format(new Date(editingPromo.startAt), "yyyy-MM-dd'T'HH:mm") : '',
        endAt: editingPromo.endAt ? format(new Date(editingPromo.endAt), "yyyy-MM-dd'T'HH:mm") : '',
        stackable: editingPromo.stackable,
        minOrderAmount: editingPromo.requirement?.minOrderAmount ?? 0,
        targetType: editingPromo.targets?.[0]?.targetType ?? 'GLOBAL',
        targetId: editingPromo.targets?.[0]?.targetId ?? null,
        bundleItems: editingPromo.bundleItems?.map(b => ({
          itemId: b.itemId,
          quantity: b.quantity,
          role: b.role
        })) ?? [],
        schedules: editingPromo.schedules ?
          editingPromo.schedules.map(s => ({
            days: [s.dayOfWeek],
            startTime: s.startTime.substring(0, 5),
            endTime: s.endTime.substring(0, 5)
          })) : []
      })
      lastResetId.current = promoId
    }
  }, [isEdit, editingPromo, reset, promoId])

  // Clear maxDiscount khi đổi sang type không phải PERCENT
  const watchedDiscountType = watch('discountType')
  useEffect(() => {
    if (watchedDiscountType && watchedDiscountType !== 'PERCENT') {
      setValue('maxDiscount', undefined)
    }
  }, [watchedDiscountType, setValue])

  // ── Submit ──
  const onSubmit = (data: PromotionFormValues) => {
    const payload: IPromotionForm = {
      ...data,
      code: data.triggerType === 'AUTO' ? undefined : (data.code?.trim() || undefined),
      discountValue: data.discountValue ?? null,
      requirement: {
        minOrderAmount: data.minOrderAmount ?? 0,
        minQuantity: 0,
      },
      targets: [
        {
          targetType: data.targetType as 'GLOBAL' | 'CATEGORY' | 'ITEM',
          targetId: data.targetId ?? null
        }
      ],
      bundleItems: data.bundleItems,
      schedules: data.schedules.flatMap(s => s.days.map(d => ({
        dayOfWeek: d,
        startTime: `${s.startTime}:00`,
        endTime: `${s.endTime}:00`
      }))),
      startAt: data.startAt ? (data.startAt.length === 16 ? `${data.startAt}:00` : data.startAt) : undefined,
      endAt: data.endAt ? (data.endAt.length === 16 ? `${data.endAt}:00` : data.endAt) : undefined,
    }

    if (isEdit && promoId) {
      updateMutation.mutate({ id: promoId, data: payload }, { onSuccess })
    } else {
      createMutation.mutate(payload, { onSuccess })
    }
  }

  const onError = () => {
    import('sonner').then(({ toast }) => {
      toast.error(t('admin.promotion.validation.formInvalid', 'Vui lòng kiểm tra lại các trường báo lỗi đỏ!'))
    })
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return {
    form,
    isEdit,
    isLoadingPromo,
    isSubmitting,
    categories,
    serverTimeStr,
    bundleArray,
    scheduleArray,
    onSubmit,
    onError,
  }
}
