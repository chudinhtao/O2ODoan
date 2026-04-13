import { useEffect, useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { X, Zap, Search } from 'lucide-react'
import type { IFlashSaleForm, FlashSaleTargetType, FlashSaleDiscountType } from '../types/adminPromotion.type'
import { useCreateFlashSale } from '../hooks/usePromotions'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { useAdminCategories, useAdminMenuItems } from '../../menu/hooks/useMenuQueries'
import type { IMenuItem } from '../../menu/types/adminMenu.type'

interface FlashSaleFormDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const defaultValues: IFlashSaleForm = {
  name: '',
  targetType: 'ALL',
  discountType: 'PERCENT',
  discountValue: 10,
  startAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  endAt: format(new Date(Date.now() + 86400000 * 7), "yyyy-MM-dd'T'HH:mm"),
}

export function FlashSaleFormModal({ isOpen, onClose }: FlashSaleFormDrawerProps) {
  const { t } = useTranslation()

  const reqNum = z.union([z.number(), z.string()])
    .transform(v => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v)))
    .refine(v => v !== undefined, { message: t('common.validation.numberRequired') })
    .refine(v => v === undefined || v > 0, { message: t('common.validation.greaterThanZero') })

  const flashSaleSchema = z.object({
    name: z.string().min(1, t('admin.promotion.form.validation.requiredName')),
    targetType: z.enum(['ALL', 'CATEGORY', 'ITEMS']),
    categoryId: z.string().optional(),
    itemIds: z.array(z.string()).optional(),
    discountType: z.enum(['PERCENT', 'FIXED_PRICE']),
    discountValue: reqNum,
    startAt: z.string().min(1, t('admin.promotion.validation.requiredStart')),
    endAt: z.string().min(1, t('admin.promotion.validation.requiredEnd')),
  }).refine(data => {
    if (data.targetType === 'CATEGORY' && !data.categoryId) return false
    return true
  }, {
    message: t('admin.promotion.form.validation.targetRequired'),
    path: ['categoryId']
  }).refine(data => {
    if (data.targetType === 'ITEMS' && (!data.itemIds || data.itemIds.length === 0)) return false
    return true
  }, {
    message: t('admin.promotion.form.validation.targetRequired'),
    path: ['itemIds']
  }).refine(data => {
    if (data.discountType === 'PERCENT' && data.discountValue > 100) return false
    return true
  }, {
    message: t('admin.promotion.validation.percentMax'),
    path: ['discountValue']
  }).refine(data => {
    const start = new Date(data.startAt)
    const end = new Date(data.endAt)
    return end >= start
  }, {
    message: t('admin.promotion.validation.endAfterStart', 'Ngày kết thúc phải sau ngày bắt đầu'),
    path: ['endAt']
  })
  const createMutation = useCreateFlashSale()
  const { data: categoriesPage } = useAdminCategories({ size: 100 })
  const { data: menuPage } = useAdminMenuItems({ page: 0, size: 500 })
  
  const categories = categoriesPage?.content || []
  const menuItems = menuPage?.content || []
  const [itemSearch, setItemSearch] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<IFlashSaleForm>({
    resolver: zodResolver(flashSaleSchema) as any,
    defaultValues,
  })

  useEffect(() => {
    if (isOpen) reset(defaultValues)
  }, [isOpen, reset])


  const currentTargetType = watch('targetType')
  const currentDiscountType = watch('discountType')
  const currentItemIds = watch('itemIds') || []

  const onSubmit: SubmitHandler<any> = (data) => {
    const payload: IFlashSaleForm = {
      ...data,
      startAt: data.startAt.length === 10 ? `${data.startAt}T00:00:00` : (data.startAt.length === 16 ? `${data.startAt}:00` : data.startAt),
      endAt: data.endAt.length === 10 ? `${data.endAt}T23:59:59` : (data.endAt.length === 16 ? `${data.endAt}:00` : data.endAt),
    }
    createMutation.mutate(payload, { onSuccess: () => onClose() })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="p-8 border-b border-orange-100 flex justify-between items-center bg-orange-50/50">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-orange-500 shadow-lg shadow-orange-200 flex items-center justify-center text-white">
              <Zap className="size-6 fill-current animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">
                {t('admin.promotion.form.flashSaleTitle')}
              </h3>
              <p className="text-xs text-orange-600 font-bold uppercase tracking-widest bg-orange-100 px-2 py-0.5 rounded-full inline-block">
                {t('admin.promotion.form.flashSaleDesc')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar max-h-[75vh]">
          <form id="flash-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <Input
                  {...register('name')}
                  label={t('admin.promotion.form.name')}
                  error={errors.name}
                  placeholder={t('admin.promotion.form.flashSaleNamePlaceholder')}
                  className="!py-3.5 !rounded-xl !shadow-sm focus:ring-orange-500/20"
                />

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
                  <label className="block text-xs font-black text-slate-400 mb-4 uppercase tracking-[2px]">
                    {t('admin.promotion.form.target')}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(['ALL', 'CATEGORY', 'ITEMS'] as FlashSaleTargetType[]).map((typeEnum) => (
                      <label
                        key={typeEnum}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${currentTargetType === typeEnum ? 'border-orange-500 bg-white shadow-md' : 'border-transparent bg-slate-200/40 hover:bg-slate-200'}`}
                        onClick={() => setValue('targetType', typeEnum)}
                      >
                        <div className={`size-4 rounded-full border-2 flex items-center justify-center ${currentTargetType === typeEnum ? 'border-orange-500 text-orange-500' : 'border-slate-300'}`}>
                           {currentTargetType === typeEnum && <div className="size-2 bg-orange-500 rounded-full" />}
                        </div>
                        <span className={`text-xs font-bold uppercase ${currentTargetType === typeEnum ? 'text-slate-800' : 'text-slate-500'}`}>
                          {typeEnum === 'ALL' 
                            ? t('admin.promotion.form.targetAll') 
                            : typeEnum === 'CATEGORY' 
                              ? t('admin.promotion.form.targetCategory') 
                              : t('admin.promotion.form.targetItems')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {currentTargetType === 'CATEGORY' && (
                  <div className="animate-in slide-in-from-left-2 duration-300">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 px-1">
                      {t('admin.promotion.form.selectCategory')}
                    </label>
                    <Select
                      {...register('categoryId')}
                      className="!py-3 !rounded-xl !bg-slate-50 !border-slate-200"
                      options={[
                        { value: "", label: t('admin.promotion.form.categoryPlaceholder') as string },
                        ...categories.map((cat) => ({ value: cat.id, label: cat.name }))
                      ]}
                    />
                    {errors.categoryId && <p className="text-red-500 text-xs mt-1 font-bold italic">{errors.categoryId.message}</p>}
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-2">
                       <div className="flex gap-2">
                        <Input
                          {...register('discountValue', { valueAsNumber: true })}
                          type="number"
                          label={t('admin.promotion.form.value')}
                          labelClassName="text-slate-400 !text-[10px] !tracking-widest"
                          error={errors.discountValue}
                          className="!py-3.5 !rounded-xl !shadow-sm !bg-white !flex-1"
                        />
                        <div className="flex rounded-xl bg-slate-200/50 p-1 border border-slate-200">
                          {(['PERCENT', 'FIXED_PRICE'] as FlashSaleDiscountType[]).map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setValue('discountType', type)}
                              className={`px-3 rounded-lg text-[10px] font-black transition-all ${currentDiscountType === type ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              {type === 'PERCENT' ? '%' : 'Đ'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                    {t('admin.promotion.form.period')}
                  </label>
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

            {currentTargetType === 'ITEMS' && (
              <div className="animate-in fade-in zoom-in duration-300 py-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">
                    {t('admin.promotion.form.selectItems')}
                  </label>
                  <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md">
                    {t('admin.promotion.form.itemsSelected', { count: currentItemIds.length })}
                  </span>
                </div>
                
                  <Input
                    placeholder={t('admin.promotion.form.searchItems')}
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="!py-3 !pl-11 !rounded-2xl !bg-slate-50 !border-slate-200 focus:!ring-orange-500/10"
                    icon={<Search className="text-slate-400 group-focus-within:text-orange-500 transition-colors size-4" />}
                  />
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {menuItems
                    .filter((item: IMenuItem) => item.name.toLowerCase().includes(itemSearch.toLowerCase()))
                    .map((item: IMenuItem) => {
                      const isSelected = currentItemIds.includes(item.id)
                      return (
                        <label 
                          key={item.id} 
                          className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-orange-500 bg-white shadow-md' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setValue('itemIds', [...currentItemIds, item.id])
                              } else {
                                setValue('itemIds', currentItemIds.filter(id => id !== item.id))
                              }
                            }}
                          />
                          <div className="size-10 rounded-xl bg-white shadow-sm border border-slate-100 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${item.imageUrl || 'https://placehold.co/100x100?text=Food'}')` }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 truncate uppercase">{item.name}</p>
                            <p className="text-[9px] font-black text-slate-400 truncate tracking-tight">{item.categoryName || 'GENERAL'}</p>
                          </div>
                          {isSelected && <Zap className="size-3 text-orange-500 fill-current" />}
                        </label>
                      )
                  })}
                </div>
                {errors.itemIds && <p className="text-red-500 text-xs mt-2 font-bold italic">{errors.itemIds.message}</p>}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4 shrink-0 mt-auto">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending}
            onClick={onClose}
            className="flex-1 !rounded-2xl !py-4 !text-base border-slate-200 text-slate-600 hover:bg-white font-bold transition-all shadow-sm"
          >
            {t('admin.promotion.form.cancel')}
          </Button>
          <Button
            type="button"
            isLoading={createMutation.isPending}
            onClick={handleSubmit(onSubmit)}
            className="flex-2 !rounded-2xl !py-4 !text-base bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5"
          >
            <Zap className="size-4 mr-2 fill-current" />
            {t('admin.promotion.form.createFlashSale')}
          </Button>
        </div>
      </div>
    </div>
  )
}
