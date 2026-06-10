import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import type { PromotionFormValues } from '../../hooks/usePromotionForm'

interface Props {
  form: UseFormReturn<PromotionFormValues>
}

export function BasicInfoSection({ form }: Props) {
  const { t } = useTranslation()
  const { register, formState: { errors }, watch, setValue } = form
  const currentTrigger = watch('triggerType')

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <Input 
          {...register('name')} 
          label={t('admin.promotions.form.basicInfoSection.nameLabel', 'Tên chương trình *')} 
          placeholder={t('admin.promotions.form.basicInfoSection.namePlaceholder', 'VD: Giảm 20% cuối tuần')} 
          error={errors.name} 
          className="!bg-slate-50 border-transparent focus:!border-primary transition-colors" 
        />
        <div className="relative">
          <Input
            {...register('code')}
            label={t('admin.promotions.form.basicInfoSection.codeLabel', 'Mã coupon') + (currentTrigger === 'COUPON' ? t('admin.promotions.form.basicInfoSection.codeRequired', ' *') : t('admin.promotions.form.basicInfoSection.codeOptional', ' (nếu có)'))}
            placeholder={t('admin.promotions.form.basicInfoSection.codePlaceholder', 'VD: SUMMER24')}
            error={errors.code}
            className="!bg-slate-50 border-transparent focus:!border-primary !pr-24 transition-colors"
          />
          <Button
            type="button"
            variant="ghost"
            onClick={() => setValue('code', 'FNB' + Math.floor(Math.random() * 99999).toString().padStart(5, '0'))}
            className="absolute right-2 bottom-2 text-[10px] !font-bold text-primary bg-primary/10 hover:bg-primary/20 !px-2 !py-1 !h-auto !min-h-0 !rounded-lg transition-colors shadow-none"
          >
            {t('admin.promotions.form.basicInfoSection.autoGenerate', 'TẠO TỰ ĐỘNG')}
          </Button>
        </div>
      </div>
    </div>
  )
}
