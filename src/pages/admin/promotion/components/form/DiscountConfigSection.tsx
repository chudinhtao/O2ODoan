import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Percent, Banknote, Tag, ShoppingCart, Package, Zap, Ticket, Settings2 } from 'lucide-react'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { Button } from '@/shared/components/ui/Button'
import type { PromotionFormValues } from '../../hooks/usePromotionForm'
import { PromotionScope, PromotionTriggerType, PromotionDiscountType } from '../../types/adminPromotion.type'

interface Props {
  form: UseFormReturn<PromotionFormValues>
}

export function DiscountConfigSection({ form }: Props) {
  const { t } = useTranslation()
  const { register, formState: { errors }, watch, setValue } = form

  const currentScope = watch('scope')
  const currentTrigger = watch('triggerType')
  const currentDiscountType = watch('discountType')

  const scopeOptions: { value: PromotionScope; icon: typeof Tag; color: string; label: string }[] = [
    { value: 'ORDER', icon: ShoppingCart, color: 'text-blue-500', label: t('admin.promotions.table.scopeOrder', 'Đơn hàng') },
    { value: 'PRODUCT', icon: Tag, color: 'text-green-500', label: t('admin.promotions.table.scopeProduct', 'Sản phẩm') },
    { value: 'BUNDLE', icon: Package, color: 'text-amber-500', label: t('admin.promotions.table.scopeBundle', 'Combo') },
  ]

  const discountOptions: { value: PromotionDiscountType; icon: typeof Percent; label: string }[] = [
    { value: 'PERCENT', icon: Percent, label: t('admin.promotions.table.discountPercent', 'Phần trăm') },
    { value: 'FIX_AMOUNT', icon: Banknote, label: t('admin.promotions.table.discountFixAmount', 'Số tiền cố định') },
    { value: 'FIX_PRICE', icon: Banknote, label: t('admin.promotions.table.discountFixPrice', 'Giá cố định') },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-primary" />
        {t('admin.promotions.form.discountSection.title', 'Cấu hình Khuyến mãi')}
      </h3>

      {/* Scope */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{t('admin.promotions.form.discountSection.scopeLabel', 'Phạm vi áp dụng')}</label>
        <div className="grid grid-cols-3 gap-3">
          {scopeOptions.map(({ value, icon: Icon, color, label }) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              onClick={() => setValue('scope', value)}
              className={`flex items-center justify-center gap-2 !p-3 !rounded-lg !border-2 !text-sm !font-semibold transition-all shadow-none ${
                currentScope === value
                  ? '!border-primary !bg-primary/5 !text-primary'
                  : '!border-slate-100 !bg-white !text-slate-500 hover:!border-slate-300 hover:!bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${currentScope === value ? 'text-primary' : color}`} />
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Trigger Type */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{t('admin.promotions.form.discountSection.triggerLabel', 'Kích hoạt bởi')}</label>
          <div className="grid grid-cols-2 gap-3">
            {(['AUTO', 'COUPON'] as PromotionTriggerType[]).map(triggerVal => (
              <Button
                key={triggerVal}
                type="button"
                variant="outline"
                onClick={() => setValue('triggerType', triggerVal)}
                className={`flex items-center justify-center gap-2 !p-3 !rounded-lg !border-2 !text-sm !font-semibold transition-all shadow-none ${
                  currentTrigger === triggerVal
                    ? '!border-primary !bg-primary/5 !text-primary'
                    : '!border-slate-100 !bg-white !text-slate-500 hover:!border-slate-300 hover:!bg-slate-50'
                }`}
              >
                {triggerVal === 'AUTO' ? <Zap className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                {triggerVal === 'AUTO' ? t('admin.promotions.table.triggerAuto', 'Tự động') : t('admin.promotions.table.triggerCoupon', 'Coupon')}
              </Button>
            ))}
          </div>
        </div>

        {/* Discount Type */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{t('admin.promotions.form.discountSection.discountTypeLabel', 'Loại giảm giá')}</label>
          <div className="grid grid-cols-3 gap-3">
            {discountOptions.map(({ value, icon: Icon, label }) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                onClick={() => setValue('discountType', value)}
                className={`flex items-center justify-center gap-1.5 !p-3 !rounded-lg !border-2 !text-[11px] !font-semibold transition-all shadow-none ${
                  currentDiscountType === value
                    ? '!border-primary !bg-primary/5 !text-primary'
                    : '!border-slate-100 !bg-white !text-slate-500 hover:!border-slate-300 hover:!bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <NumberInput
          {...register('discountValue', { valueAsNumber: true })}
          label={currentDiscountType === 'PERCENT' ? t('admin.promotions.form.discountSection.valueLabelPercent', 'Giá trị giảm (%) *') : t('admin.promotions.form.discountSection.valueLabelAmount', 'Giá trị giảm (đ) *')}
          error={errors.discountValue}
          suffix={currentDiscountType === 'PERCENT' ? '%' : 'đ'}
        />
        {currentDiscountType === 'PERCENT' ? (
          <NumberInput
            {...register('maxDiscount', { valueAsNumber: true })}
            label={t('admin.promotions.form.discountSection.maxDiscountLabel', 'Giảm tối đa')}
            placeholder={t('admin.promotions.form.discountSection.maxDiscountPlaceholder', 'Không giới hạn')}
            error={errors.maxDiscount}
            suffix="đ"
          />
        ) : (
          <div /> // placeholder for grid alignment
        )}
      </div>
    </div>
  )
}
