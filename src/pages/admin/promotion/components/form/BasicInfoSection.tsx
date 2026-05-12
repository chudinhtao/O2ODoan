import { UseFormReturn } from 'react-hook-form'
import { Info } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import type { PromotionFormValues } from '../../hooks/usePromotionForm'

interface Props {
  form: UseFormReturn<PromotionFormValues>
}

export function BasicInfoSection({ form }: Props) {
  const { register, formState: { errors }, watch, setValue } = form
  const currentTrigger = watch('triggerType')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
        <Info className="w-5 h-5 text-primary" />
        Thông tin cơ bản
      </h3>
      
      <div className="space-y-4">
        <Input 
          {...register('name')} 
          label="Tên chương trình *" 
          placeholder="VD: Giảm 20% cuối tuần" 
          error={errors.name} 
          className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl transition-colors" 
        />
        <div className="relative">
          <Input
            {...register('code')}
            label={`Mã coupon${currentTrigger === 'COUPON' ? ' *' : ' (nếu có)'}`}
            placeholder="VD: SUMMER24"
            error={errors.code}
            className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl !pr-24 transition-colors"
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
    </div>
  )
}
