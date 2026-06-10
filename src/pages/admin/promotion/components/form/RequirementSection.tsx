import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Select } from '@/shared/components/ui/Select'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import type { PromotionFormValues } from '../../hooks/usePromotionForm'

interface Props {
  form: UseFormReturn<PromotionFormValues>
}

export function RequirementSection({ form }: Props) {
  const { t } = useTranslation()
  const { register, formState: { errors } } = form

  const currentScope = form.watch('scope')
  const currentTrigger = form.watch('triggerType')

  // Nếu không phải ORDER và COUPON thì section này không có gì để hiện
  if (currentScope !== 'ORDER' && currentTrigger !== 'COUPON') {
    return null
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NumberInput
          {...register('minOrderAmount', { valueAsNumber: true })}
          label={t('admin.promotions.form.requirementSection.minOrderAmount', 'Giá trị đơn tối thiểu')}
          placeholder="VD: 100000"
          error={errors.minOrderAmount}
          suffix="đ"
        />
      </div>
    </div>
  )
}
