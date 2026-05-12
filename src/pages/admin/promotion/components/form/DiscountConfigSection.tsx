import { UseFormReturn } from 'react-hook-form'
import { Percent, Banknote, Tag, ShoppingCart, Package, Zap, Ticket, Settings2 } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import type { PromotionFormValues } from '../../hooks/usePromotionForm'
import { PromotionScope, PromotionTriggerType, PromotionDiscountType, SCOPE_LABELS, DISCOUNT_TYPE_LABELS, TRIGGER_LABELS } from '../../types/adminPromotion.type'

interface Props {
  form: UseFormReturn<PromotionFormValues>
}

export function DiscountConfigSection({ form }: Props) {
  const { register, formState: { errors }, watch, setValue } = form

  const currentScope = watch('scope')
  const currentTrigger = watch('triggerType')
  const currentDiscountType = watch('discountType')

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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-primary" />
        Cấu hình Khuyến mãi
      </h3>

      {/* Scope */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Phạm vi áp dụng</label>
        <div className="grid grid-cols-3 gap-3">
          {scopeOptions.map(({ value, icon: Icon, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('scope', value)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                currentScope === value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${currentScope === value ? 'text-primary' : color}`} />
              {SCOPE_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Trigger Type */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Kích hoạt bởi</label>
          <div className="grid grid-cols-2 gap-3">
            {(['AUTO', 'COUPON'] as PromotionTriggerType[]).map(triggerVal => (
              <button
                key={triggerVal}
                type="button"
                onClick={() => setValue('triggerType', triggerVal)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  currentTrigger === triggerVal
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {triggerVal === 'AUTO' ? <Zap className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                {TRIGGER_LABELS[triggerVal]}
              </button>
            ))}
          </div>
        </div>

        {/* Discount Type */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Loại giảm giá</label>
          <div className="grid grid-cols-3 gap-3">
            {discountOptions.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('discountType', value)}
                className={`flex items-center justify-center gap-1.5 p-3 rounded-xl border-2 text-[11px] font-semibold transition-all ${
                  currentDiscountType === value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{DISCOUNT_TYPE_LABELS[value]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <Input
          {...register('discountValue', { valueAsNumber: true })}
          type="number"
          label={`Giá trị giảm ${currentDiscountType === 'PERCENT' ? '(%)' : '(đ)'} *`}
          rightAddon={<span className="text-xs font-bold text-slate-400">{currentDiscountType === 'PERCENT' ? '%' : 'đ'}</span>}
          error={errors.discountValue}
          className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl transition-colors"
        />
        {currentDiscountType === 'PERCENT' ? (
          <Input
            {...register('maxDiscount', { valueAsNumber: true })}
            type="number"
            label="Giảm tối đa (đ)"
            rightAddon={<span className="text-xs font-bold text-slate-400">đ</span>}
            placeholder="Không giới hạn"
            error={errors.maxDiscount}
            className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl transition-colors"
          />
        ) : (
          <div /> // placeholder for grid alignment
        )}
      </div>
    </div>
  )
}
