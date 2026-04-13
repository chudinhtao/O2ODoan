import { useEffect } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { X, Percent, Banknote } from 'lucide-react'
import type { IPromotion, IPromotionForm, PromotionType } from '../types/adminPromotion.type'
import { useCreatePromotion, useUpdatePromotion } from '../hooks/usePromotions'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  editingPromo: IPromotion | null
}

const defaultValues: IPromotionForm = {
  code: '',
  name: '',
  type: 'PERCENT',
  value: 10,
  minOrderAmount: 0,
  minQuantity: 0,
  maxDiscountValue: undefined,
  usageLimit: undefined,
  startAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  endAt: format(new Date(Date.now() + 86400000 * 30), "yyyy-MM-dd'T'HH:mm")
}

export function PromotionFormModal({ isOpen, onClose, editingPromo }: DrawerProps) {
  const { t } = useTranslation()

  const optNum = z.union([z.number(), z.string(), z.undefined(), z.null()])
    .transform(v => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v)))
    .refine(v => v === undefined || v >= 0, { message: t('common.validation.positiveNumber') })

  const reqNum = z.union([z.number(), z.string()])
    .transform(v => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v)))
    .refine(v => v !== undefined, { message: t('common.validation.numberRequired') })
    .refine(v => v === undefined || v >= 0, { message: t('common.validation.positiveNumber') })

  const promotionSchema = z.object({
    code: z.string()
      .min(3, t('admin.promotion.validation.minCode', 'Mã tối thiểu 3 ký tự'))
      .max(20, t('admin.promotion.validation.maxCode'))
      .regex(/^[A-Z0-9_]+$/, t('admin.promotion.validation.codeFormat')),
    name: z.string().min(1, t('admin.promotion.validation.requiredName')),
    type: z.enum(['PERCENT', 'AMOUNT', 'FLASH_SALE']),
    value: reqNum,
    minOrderAmount: reqNum,
    minQuantity: reqNum,
    maxDiscountValue: optNum.optional(),
    usageLimit: optNum.optional(),
    startAt: z.string().min(1, t('admin.promotion.validation.requiredStart')),
    endAt: z.string().min(1, t('admin.promotion.validation.requiredEnd'))
  }).refine(data => {
    if (data.type === 'PERCENT' && data.value > 100) return false
    return true
  }, {
    message: t('admin.promotion.validation.percentMax'),
    path: ['value']
  }).refine(data => {
    if (data.value <= 0) return false
    return true
  }, {
    message: t('admin.promotion.validation.greaterThanZero', 'Giá trị phải lớn hơn 0'),
    path: ['value']
  }).refine(data => {
    const start = new Date(data.startAt)
    const end = new Date(data.endAt)
    return end >= start
  }, {
    message: t('admin.promotion.validation.endAfterStart', 'Ngày kết thúc phải sau ngày bắt đầu'),
    path: ['endAt']
  })
  const createMutation = useCreatePromotion()
  const updateMutation = useUpdatePromotion()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<IPromotionForm>({
    resolver: zodResolver(promotionSchema) as any,
    defaultValues
  })

  useEffect(() => {
    if (isOpen) {
      if (editingPromo) {
        reset({
          code: editingPromo.code || '',
          name: editingPromo.name,
          type: editingPromo.type,
          value: editingPromo.value,
          minOrderAmount: editingPromo.minOrderAmount,
          minQuantity: editingPromo.minQuantity,
          maxDiscountValue: editingPromo.maxDiscountValue || undefined,
          usageLimit: editingPromo.usageLimit || undefined,
          startAt: format(new Date(editingPromo.startAt), "yyyy-MM-dd'T'HH:mm"),
          endAt: format(new Date(editingPromo.endAt), "yyyy-MM-dd'T'HH:mm")
        })
      } else {
        reset(defaultValues)
      }
    }
  }, [isOpen, editingPromo, reset])

  const onSubmit: SubmitHandler<any> = (data) => {
    const payload: IPromotionForm = {
      ...data,
      startAt: data.startAt.length === 10 ? `${data.startAt}T00:00:00` : (data.startAt.length === 16 ? `${data.startAt}:00` : data.startAt),
      endAt: data.endAt.length === 10 ? `${data.endAt}T23:59:59` : (data.endAt.length === 16 ? `${data.endAt}:00` : data.endAt),
    }

    if (editingPromo) {
      updateMutation.mutate({ id: editingPromo.id, data: payload }, {
        onSuccess: () => {
          onClose()
        }
      })
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onClose()
        }
      })
    }
  }

  if (!isOpen) return null

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const currentType = watch('type')

  const setType = (type: PromotionType) => {
    setValue('type', type)
  }

  const toggleAutoCode = () => {
    const randomCode = 'SUN' + Math.floor(Math.random() * 10000)
    setValue('code', randomCode)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              {editingPromo ? t('admin.promotion.form.titleEdit') : t('admin.promotion.form.titleAdd')}
            </h3>
            <p className="text-sm text-slate-500 font-medium">{editingPromo ? t('admin.promotion.form.descEdit') : t('admin.promotion.form.descAdd')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar max-h-[75vh]">
          <form id="promo-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Basic Settings */}
              <div className="space-y-6">
                <Input
                  {...register('name')}
                  label={t('admin.promotion.form.name')}
                  error={errors.name}
                  placeholder={t('admin.promotion.form.namePlaceholder')}
                  type="text"
                  className="!py-3.5 !rounded-xl !shadow-sm"
                />

                <div className="relative group">
                  <Input
                    {...register('code')}
                    label={t('admin.promotion.form.code')}
                    error={errors.code}
                    placeholder="SUMMER24"
                    type="text"
                    className="!py-3.5 !rounded-xl !shadow-sm !pr-28"
                  />
                  <div className="absolute right-2 top-[34px]">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleAutoCode}
                      className="!text-[10px] !font-black !uppercase !tracking-wider !text-primary !bg-primary/5 hover:!bg-primary/10 !rounded-lg !px-2 !h-8"
                    >
                      {t('admin.promotion.form.autoGenerate')}
                    </Button>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                  <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[2px]">{t('admin.promotion.form.type')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label 
                      onClick={() => setType('PERCENT')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${currentType === 'PERCENT' ? 'border-primary bg-white shadow-md' : 'border-transparent bg-slate-200/50 hover:bg-slate-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentType === 'PERCENT' ? 'bg-primary text-white' : 'bg-white text-slate-400'}`}>
                        <Percent className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold ${currentType === 'PERCENT' ? 'text-slate-800' : 'text-slate-500'}`}>
                        {t('admin.promotion.type.percent', 'Phần trăm')}
                      </span>
                    </label>
                    <label 
                      onClick={() => setType('AMOUNT')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${currentType === 'AMOUNT' ? 'border-primary bg-white shadow-md' : 'border-transparent bg-slate-200/50 hover:bg-slate-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentType === 'AMOUNT' ? 'bg-primary text-white' : 'bg-white text-slate-400'}`}>
                        <Banknote className="w-5 h-5" />
                      </div>
                      <span className={`text-xs font-bold ${currentType === 'AMOUNT' ? 'text-slate-800' : 'text-slate-500'}`}>
                        {t('admin.promotion.type.amount', 'Số tiền')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Values & Limits */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    {...register('value', { valueAsNumber: true })}
                    type="number"
                    label={t('admin.promotion.form.value')}
                    rightAddon={<span className="text-sm font-bold text-slate-400">{currentType === 'PERCENT' ? '%' : 'đ'}</span>}
                    error={errors.value}
                    className="!py-3.5 !rounded-xl !shadow-sm"
                  />
                  <Input 
                    {...register('minOrderAmount', { valueAsNumber: true })}
                    type="number"
                    label={t('admin.promotion.form.minOrder')}
                    rightAddon={<span className="text-sm font-bold text-slate-400">đ</span>}
                    error={errors.minOrderAmount}
                    className="!py-3.5 !rounded-xl !shadow-sm"
                  />
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex flex-col gap-4">
                    {currentType === 'PERCENT' && (
                      <Input 
                        {...register('maxDiscountValue', { valueAsNumber: true })}
                        type="number"
                        label={t('admin.promotion.form.maxDiscount')}
                        rightAddon={<span className="text-sm font-bold text-slate-400">đ</span>}
                        placeholder={t('admin.promotion.form.noCap')}
                        error={errors.maxDiscountValue}
                        className="!py-3.5 !rounded-xl !shadow-sm"
                      />
                    )}
                    <Input 
                      {...register('usageLimit', { valueAsNumber: true })}
                      type="number"
                      label={t('admin.promotion.form.usageLimit')}
                      rightAddon={<span className="text-sm font-bold text-slate-400">lần</span>}
                      placeholder={t('admin.promotion.form.noLimit')}
                      error={errors.usageLimit}
                      className="!py-3.5 !rounded-xl !shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-[2px] px-1">{t('admin.promotion.form.period')}</label>
                  <div className="flex flex-col gap-4">
                    <Input 
                       {...register('startAt')}
                       type="datetime-local"
                       label={t('admin.promotion.form.startAt')}
                       className="!py-2.5 !rounded-lg"
                    />
                    <Input 
                       {...register('endAt')}
                       type="datetime-local"
                       label={t('admin.promotion.form.endAt')}
                       className="!py-2.5 !rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0 mt-auto">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose} className="flex-1 !rounded-2xl !py-4 !text-base border-slate-200 text-slate-600 hover:bg-white font-bold transition-all shadow-sm">
            {t('admin.promotion.form.cancel')}
          </Button>
          <Button type="button" isLoading={isSubmitting} onClick={handleSubmit(onSubmit)} className="flex-2 !rounded-2xl !py-4 !text-base bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
            {t('admin.promotion.form.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}
