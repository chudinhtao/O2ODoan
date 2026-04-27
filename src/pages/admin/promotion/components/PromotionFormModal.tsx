import { useEffect, useState, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { X, Percent, Banknote, Tag, ShoppingCart, Package, Zap, Ticket, Clock, Plus, Trash2 } from 'lucide-react'
import type {
  IPromotion, IPromotionForm,
  PromotionScope, PromotionTriggerType, PromotionDiscountType
} from '../types/adminPromotion.type'
import { SCOPE_LABELS, DISCOUNT_TYPE_LABELS, TRIGGER_LABELS } from '../types/adminPromotion.type'
import { useCreatePromotion, useUpdatePromotion } from '../hooks/usePromotions'
import { useAdminCategories, useAdminMenuItems } from '../../menu/hooks/useMenuQueries'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { timeService } from '@/services/time.service'
import { useServerTime } from '@/shared/hooks/useServerTime'

interface PromotionFormModalProps {
  isOpen: boolean
  onClose: () => void
  editingPromo: IPromotion | null
}

import { useTranslation } from 'react-i18next'

const createPromotionSchema = (t: any) => {
  const optNum = z.union([z.number(), z.string(), z.undefined(), z.null()])
    .transform(v => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? undefined : Number(v)))
    .refine(v => v === undefined || v >= 0, { message: t('admin.promotion.validation.positiveNumber', 'Giá trị phải >= 0') })

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
    discountValue: optNum.refine((v) => v !== undefined, { message: t('admin.promotion.validation.greaterThanZero', 'Bắt buộc nhập số') }),
    maxDiscount: optNum.optional(),
    usageLimit: optNum.optional(),
    priority: z.coerce.number().min(0, t('admin.promotion.validation.positiveNumber', 'Phải >= 0')).default(0),
    startAt: z.string().optional(),
    endAt: z.string().optional(),
    stackable: z.boolean().default(false),
    minOrderAmount: optNum.optional(),
    targetType: z.enum(['GLOBAL', 'CATEGORY', 'ITEM']).default('GLOBAL'),
    targetId: z.string().nullable().optional(),
    bundleItems: z.array(z.object({
      itemId: z.string().min(1, t('admin.promotion.validation.requiredItem', 'Bắt buộc chọn món')),
      quantity: z.coerce.number().min(1, t('admin.promotion.validation.greaterThanZero', 'SL > 0')),
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

type FormValues = z.infer<ReturnType<typeof createPromotionSchema>>

const getInitialDefaults = () => {
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
    bundleItems: [],
    schedules: [],
  }
}

export function PromotionFormModal({ isOpen, onClose, editingPromo }: PromotionFormModalProps) {
  const { t } = useTranslation()
  const createMutation = useCreatePromotion()
  const updateMutation = useUpdatePromotion()
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule'>('basic')
  
  // Data cho Dropdown Target
  const { data: catData } = useAdminCategories({ size: 100 })
  const { data: itemData } = useAdminMenuItems({ size: 100 })
  const categories = catData?.content || []
  const menuItems = itemData?.content || []

  const schemaResolver = useMemo(() => zodResolver(createPromotionSchema(t)), [t])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: schemaResolver as any,
    defaultValues: getInitialDefaults()
  })

  // Watch trước mọi side-effects (Rules of Hooks)
  const watchedDiscountType = watch('discountType')

  const { now } = useServerTime(30000) // Update clock every 30s
  const serverTimeStr = format(new Date(now), 'HH:mm dd/MM/yyyy')

  const { fields: bundleFields, append: appendBundle, remove: removeBundle } = useFieldArray({
    control,
    name: 'bundleItems'
  })

  const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
    control,
    name: 'schedules'
  })

  useEffect(() => {
    if (isOpen) {
      if (editingPromo) {
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
            // Gom nhóm các ngày có cùng khung giờ để hiển thị dễ hơn (optional, simplified for here)
            // Backend trả về flat list, ta có thể map 1-1 hoặc gom nhóm. Ở đây map 1-1 cho đơn giản.
            editingPromo.schedules.map(s => ({
              days: [s.dayOfWeek],
              startTime: s.startTime.substring(0, 5),
              endTime: s.endTime.substring(0, 5)
            })) : []
        })
      } else {
        reset(getInitialDefaults())
      }
      setActiveTab('basic')
    }
  }, [isOpen, editingPromo, reset])

  // Clear maxDiscount khi đổi sang type không phải PERCENT
  useEffect(() => {
    if (watchedDiscountType && watchedDiscountType !== 'PERCENT') {
      setValue('maxDiscount', undefined)
    }
  }, [watchedDiscountType, setValue])

  const onSubmit = (data: FormValues) => {
    // Map về IPromotionForm schema của API Backend
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
          targetType: data.targetType as any,
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

    if (editingPromo) {
      updateMutation.mutate({ id: editingPromo.id, data: payload }, { onSuccess: onClose })
    } else {
      createMutation.mutate(payload, { onSuccess: onClose })
    }
  }

  const onError = (errors: any) => {
    console.error('Validation Errors:', errors)
    import('sonner').then(({ toast }) => {
      toast.error(t('admin.promotion.validation.formInvalid', 'Vui lòng kiểm tra lại các trường báo lỗi đỏ!'))
    })
  }

  if (!isOpen) return null

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const currentScope = watch('scope')
  const currentTrigger = watch('triggerType')
  const currentDiscountType = watchedDiscountType
  const isStackable = watch('stackable')

  const scopeOptions: { value: PromotionScope; icon: typeof Tag; color: string }[] = [
    { value: 'ORDER', icon: ShoppingCart, color: 'text-blue-500' },
    { value: 'PRODUCT', icon: Tag, color: 'text-green-500' },
    { value: 'BUNDLE', icon: Package, color: 'text-amber-500' },
  ]

  const discountOptions: { value: PromotionDiscountType; icon: typeof Percent }[] = [
    { value: 'PERCENT', icon: Percent },
    { value: 'FIX_AMOUNT', icon: Banknote },
    { value: 'FIX_PRICE', icon: Banknote },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white w-full max-w-2xl rounded-[28px] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {editingPromo ? '✏️ Chỉnh sửa khuyến mãi' : '🎁 Tạo khuyến mãi mới'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Điền thông tin bên dưới để cấu hình chương trình</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0 bg-slate-50/50">
          {[
            { key: 'basic', label: '⚙️ Cài đặt cơ bản' },
            { key: 'schedule', label: '🕐 Lịch giờ (tùy chọn)' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> Giờ Server hiện tại:
            </span>
            <span className="text-xs font-black text-blue-800 font-mono">{serverTimeStr}</span>
          </div>
          <form id="promo-form" onSubmit={handleSubmit(onSubmit, onError)}>

            {activeTab === 'basic' && (
              <div className="space-y-5">
                {/* Tên + Code */}
                <div className="grid grid-cols-2 gap-4">
                  <Input {...register('name')} label="Tên chương trình *" placeholder="VD: Giảm 20% cuối tuần" error={errors.name} className="!rounded-xl" />
                  <div className="relative">
                    <Input
                      {...register('code')}
                      label={`Mã coupon${currentTrigger === 'COUPON' ? ' *' : ' (nếu có)'}`}
                      placeholder="VD: SUMMER24"
                      error={errors.code}
                      className="!rounded-xl !pr-24"
                    />
                    <button
                      type="button"
                      onClick={() => setValue('code', 'FNB' + Math.floor(Math.random() * 99999).toString().padStart(5, '0'))}
                      className="absolute right-2 bottom-2 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded-lg transition-colors"
                    >
                      TẠO TỰ ĐỘNG
                    </button>
                  </div>
                </div>

                {/* Scope */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phạm vi áp dụng</label>
                  <div className="grid grid-cols-3 gap-2">
                    {scopeOptions.map(({ value, icon: Icon, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue('scope', value)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          currentScope === value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${currentScope === value ? 'text-primary' : color}`} />
                        {SCOPE_LABELS[value]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trigger Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Kích hoạt bởi</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['AUTO', 'COUPON'] as PromotionTriggerType[]).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setValue('triggerType', t)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          currentTrigger === t
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {t === 'AUTO' ? <Zap className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                        {TRIGGER_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Loại giảm giá</label>
                  <div className="grid grid-cols-3 gap-2">
                    {discountOptions.map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setValue('discountType', value)}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                          currentDiscountType === value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{DISCOUNT_TYPE_LABELS[value]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Values */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register('discountValue', { valueAsNumber: true })}
                    type="number"
                    label={`Giá trị giảm ${currentDiscountType === 'PERCENT' ? '(%)' : '(đ)'}`}
                    rightAddon={<span className="text-xs font-bold text-slate-400">{currentDiscountType === 'PERCENT' ? '%' : 'đ'}</span>}
                    error={errors.discountValue}
                    className="!rounded-xl"
                  />
                  {currentDiscountType === 'PERCENT' && (
                    <Input
                      {...register('maxDiscount', { valueAsNumber: true })}
                      type="number"
                      label="Giảm tối đa (đ)"
                      rightAddon={<span className="text-xs font-bold text-slate-400">đ</span>}
                      placeholder="Không giới hạn"
                      error={errors.maxDiscount}
                      className="!rounded-xl"
                    />
                  )}
                </div>

                {/* Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register('usageLimit', { valueAsNumber: true })}
                    type="number"
                    label="Giới hạn lượt dùng"
                    rightAddon={<span className="text-xs font-bold text-slate-400">lần</span>}
                    placeholder="Không giới hạn"
                    error={errors.usageLimit}
                    className="!rounded-xl"
                  />
                  <Input
                    {...register('priority', { valueAsNumber: true })}
                    type="number"
                    label="Độ ưu tiên (cao hơn = áp trước)"
                    placeholder="0"
                    error={errors.priority}
                    className="!rounded-xl"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <Input {...register('startAt')} type="datetime-local" label="Bắt đầu" className="!rounded-xl" />
                  <Input {...register('endAt')} type="datetime-local" label="Kết thúc" className="!rounded-xl" />
                </div>

                {/* Targets & Conditions */}
                {(currentScope === 'ORDER' || currentTrigger === 'COUPON') && (
                  <div className="grid grid-cols-1">
                    <Input
                      {...register('minOrderAmount', { valueAsNumber: true })}
                      type="number"
                      label="Đơn tối thiểu (đ)"
                      placeholder="VD: 50000"
                      error={errors.minOrderAmount}
                      className="!rounded-xl"
                    />
                  </div>
                )}

                {currentScope === 'PRODUCT' && (
                  <div className="p-4 border-2 border-slate-200 rounded-xl space-y-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Món/Danh mục áp dụng (Target)</label>
                    <div className="flex gap-4">
                      {/* Fixed TailWind overlapping classes */}
                      <select {...register('targetType')} className="w-1/3 h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                        <option value="GLOBAL">Tất cả menu</option>
                        <option value="CATEGORY">Theo danh mục</option>
                        <option value="ITEM">Theo món cụ thể</option>
                      </select>
                      
                      {watch('targetType') === 'CATEGORY' && (
                        <select {...register('targetId')} className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                          <option value="">-- Chọn danh mục --</option>
                          {categories.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      )}
                      
                      {watch('targetType') === 'ITEM' && (
                        <select {...register('targetId')} className="flex-1 h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                          <option value="">-- Chọn món ăn --</option>
                          {menuItems.map((m: any) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                )}

                {currentScope === 'BUNDLE' && (
                  <div className="p-4 border-2 border-amber-200 bg-amber-50 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-amber-800">Cấu hình Bundle/Combo</p>
                        <p className="text-xs text-amber-700 mt-0.5">Ví dụ: MUA 2 Trà Sữa (BUY) + ĐƯỢC 1 Bánh ngọt (GET) giá 0đ</p>
                      </div>
                      <Button type="button" onClick={() => appendBundle({ itemId: '', quantity: 1, role: 'BUY' })} className="h-8 px-3 text-xs bg-amber-500 hover:bg-amber-600 text-white !rounded-lg border-none shadow-sm flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Thêm món
                      </Button>
                    </div>

                    <div className="space-y-3">
                       {bundleFields.length === 0 && (
                          <div className="p-4 border-2 border-dashed border-amber-200 rounded-xl text-center">
                            <Package className="w-6 h-6 text-amber-300 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-amber-700">Chưa có món nào, vui lòng thêm món vào Combo.</p>
                          </div>
                        )}
                        {bundleFields.map((field, index) => (
                          <div key={field.id} className="flex items-start gap-3 p-3 bg-white border border-amber-100 rounded-xl shadow-sm">
                            <div className="flex-1 space-y-3">
                              <div className="flex gap-2">
                                <select {...register(`bundleItems.${index}.role` as const)} className="w-[110px] shrink-0 h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all">
                                  <option value="BUY">🛒 MUA</option>
                                  <option value="GET">🎁 TẶNG/GIẢM</option>
                                </select>
                                
                                <select {...register(`bundleItems.${index}.itemId` as const)} className="flex-1 min-w-0 h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all">
                                  <option value="">-- Chọn món --</option>
                                  {menuItems.map((m: any) => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                                </select>
                                
                                <div className="w-[90px] shrink-0 relative flex items-center border border-slate-200 rounded-lg bg-white focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all overflow-hidden h-10">
                                  <span className="text-xs font-bold text-slate-400 pl-3">SL:</span>
                                  <input 
                                    type="number" 
                                    {...register(`bundleItems.${index}.quantity` as const, { valueAsNumber: true })} 
                                    className="w-full h-full bg-transparent px-2 text-sm outline-none font-semibold text-slate-700"
                                    placeholder="1"
                                    min="1"
                                  />
                                </div>
                              </div>
                              {errors.bundleItems?.[index]?.itemId && (
                                <p className="text-xs text-red-500">{errors.bundleItems[index]?.itemId?.message}</p>
                              )}
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => removeBundle(index)}
                              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 bg-slate-50 rounded-lg transition-colors border border-slate-100 mt-0.5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stackable toggle */}
                <div
                  onClick={() => setValue('stackable', !isStackable)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${isStackable ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Cho phép kết hợp (Stackable)</p>
                    <p className="text-xs text-slate-400 mt-0.5">Có thể dùng cùng lúc với CTKM khác</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${isStackable ? 'bg-primary' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${isStackable ? 'left-6' : 'left-1'}`} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Lịch lặp lại (Happy Hour)</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Giúp bạn cấu hình khuyến mãi chỉ áp dụng vào những ngày nhất định hoặc khung giờ nhất định trong ngày.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {scheduleFields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-slate-200 rounded-xl space-y-4 bg-white shadow-sm relative group">
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 text-rose-500 rounded-full shadow-md hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Các ngày áp dụng</label>
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5, 6, 0].map(day => {
                            const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
                            const isSelected = watch(`schedules.${index}.days`)?.includes(day)
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => {
                                  const currentDays = watch(`schedules.${index}.days`) || []
                                  if (isSelected) {
                                    setValue(`schedules.${index}.days`, currentDays.filter(d => d !== day))
                                  } else {
                                    setValue(`schedules.${index}.days`, [...currentDays, day])
                                  }
                                }}
                                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border ${
                                  isSelected 
                                    ? 'bg-primary border-primary text-white shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                              >
                                {labels[day]}
                              </button>
                            )
                          })}
                        </div>
                        {errors.schedules?.[index]?.days && (
                          <p className="text-[10px] text-red-500 mt-1">{errors.schedules[index]?.days?.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          {...register(`schedules.${index}.startTime`)} 
                          type="time" 
                          label="Giờ bắt đầu" 
                          className="!rounded-xl" 
                          error={errors.schedules?.[index]?.startTime}
                        />
                        <Input 
                          {...register(`schedules.${index}.endTime`)} 
                          type="time" 
                          label="Giờ kết thúc" 
                          className="!rounded-xl" 
                          error={errors.schedules?.[index]?.endTime}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendSchedule({ days: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '22:00' })}
                    className="w-full !py-3 !rounded-xl border-dashed border-2 border-slate-300 text-slate-500 hover:border-primary hover:text-primary gap-2"
                  >
                    <Plus className="w-4 h-4" /> Thêm khung giờ lặp lại
                  </Button>
                </div>

                {scheduleFields.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[24px]">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                    <p className="text-sm font-medium text-slate-400">Chưa thiết lập lịch lặp lại</p>
                    <p className="text-[11px] text-slate-300 mt-1">Khuyến mãi sẽ áp dụng 24/7 trong kỳ hạn hiệu lực</p>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex gap-3 shrink-0 bg-slate-50/50">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose} className="flex-1 !rounded-2xl !py-3 font-bold">
            Hủy
          </Button>
          <Button
            type="button"
            isLoading={isSubmitting}
            onClick={handleSubmit(onSubmit, onError)}
            className="flex-[2] !rounded-2xl !py-3 font-bold bg-primary text-white"
          >
            {editingPromo ? 'Lưu thay đổi' : 'Tạo chương trình'}
          </Button>
        </div>
      </div>
    </div>
  )
}
