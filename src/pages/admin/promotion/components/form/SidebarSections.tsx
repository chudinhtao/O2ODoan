import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Input } from '@/shared/components/ui/Input'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import type { PromotionFormValues } from '../../hooks/usePromotionForm'

interface Props {
  form: UseFormReturn<PromotionFormValues>
}

// Kept for backwards-compatible export — now renders nothing (stackable merged below)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SidebarStatusSection(_: Props) {
  return null
}

export function SidebarLimitsSection({ form }: Props) {
  const { t } = useTranslation()
  const { register, formState: { errors }, watch, setValue } = form
  const currentScope   = watch('scope')
  const currentTrigger = watch('triggerType')
  const isStackable    = watch('stackable')

  return (
    <div className="space-y-4">
      {/* Stackable toggle (merged from StatusSection) */}
      <div
        onClick={() => setValue('stackable', !isStackable)}
        className={`flex items-center justify-between p-3.5 rounded-lg border-2 cursor-pointer transition-all ${
          isStackable ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
        }`}
      >
        <div>
          <p className="text-sm font-bold text-slate-700">{t('admin.promotions.form.sidebarSection.stackableLabel', 'Cho phép kết hợp')}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">{t('admin.promotions.form.sidebarSection.stackableSub', 'Stackable Promotion')}</p>
        </div>
        <div className={`w-10 h-5 rounded-full transition-colors relative shadow-inner shrink-0 ${isStackable ? 'bg-primary' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isStackable ? 'left-5' : 'left-0.5'}`} />
        </div>
      </div>


      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          {...register('usageLimit', { valueAsNumber: true })}
          label={t('admin.promotions.form.sidebarSection.usageLimitLabel', 'Giới hạn lượt dùng')}
          placeholder={t('admin.promotions.form.sidebarSection.usageLimitPlaceholder', 'Không giới hạn')}
          error={errors.usageLimit}
          suffix="lần"
        />
        <NumberInput
          {...register('priority', { valueAsNumber: true })}
          label={t('admin.promotions.form.sidebarSection.priorityLabel', 'Độ ưu tiên')}
          placeholder={t('admin.promotions.form.sidebarSection.priorityPlaceholder', '0')}
          error={errors.priority}
        />
      </div>

      <div className="pt-3 space-y-4 border-t border-slate-100">
        <Input
          {...register('startAt')}
          type="datetime-local"
          label={t('admin.promotions.form.sidebarSection.startAtLabel', 'Bắt đầu từ')}
          className="!bg-slate-50 border-transparent focus:!border-primary transition-colors text-sm"
        />
        <Input
          {...register('endAt')}
          type="datetime-local"
          label={t('admin.promotions.form.sidebarSection.endAtLabel', 'Kết thúc vào')}
          className="!bg-slate-50 border-transparent focus:!border-primary transition-colors text-sm"
        />
      </div>
    </div>
  )
}
