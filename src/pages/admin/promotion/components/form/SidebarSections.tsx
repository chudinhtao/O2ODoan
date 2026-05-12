import { UseFormReturn } from 'react-hook-form'
import { CalendarClock, Zap } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import type { PromotionFormValues } from '../../hooks/usePromotionForm'

interface Props {
  form: UseFormReturn<PromotionFormValues>
}

export function SidebarStatusSection({ form }: Props) {
  const { watch, setValue } = form
  const isStackable = watch('stackable')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-500" />
        Trạng thái & Kết hợp
      </h3>

      <div
        onClick={() => setValue('stackable', !isStackable)}
        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
          isStackable ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-300 bg-slate-50'
        }`}
      >
        <div>
          <p className="text-sm font-bold text-slate-700">Cho phép kết hợp</p>
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Stackable</p>
        </div>
        <div className={`w-10 h-5 rounded-full transition-colors relative shadow-inner ${isStackable ? 'bg-primary' : 'bg-slate-300'}`}>
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${isStackable ? 'left-5' : 'left-0.5'}`} />
        </div>
      </div>
    </div>
  )
}

export function SidebarLimitsSection({ form }: Props) {
  const { register, formState: { errors }, watch } = form
  const currentScope = watch('scope')
  const currentTrigger = watch('triggerType')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-blue-500" />
        Giới hạn & Thời gian
      </h3>

      <div className="space-y-4">
        {(currentScope === 'ORDER' || currentTrigger === 'COUPON') && (
          <Input
            {...register('minOrderAmount', { valueAsNumber: true })}
            type="number"
            label="Đơn tối thiểu (đ)"
            placeholder="VD: 50000"
            error={errors.minOrderAmount}
            className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl transition-colors"
          />
        )}

        <Input
          {...register('usageLimit', { valueAsNumber: true })}
          type="number"
          label="Giới hạn lượt dùng"
          rightAddon={<span className="text-xs font-bold text-slate-400">lần</span>}
          placeholder="Không giới hạn"
          error={errors.usageLimit}
          className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl transition-colors"
        />

        <Input
          {...register('priority', { valueAsNumber: true })}
          type="number"
          label="Độ ưu tiên (cao hơn = áp trước)"
          placeholder="0"
          error={errors.priority}
          className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl transition-colors"
        />

        <div className="pt-2 space-y-4 border-t border-slate-100">
          <Input 
            {...register('startAt')} 
            type="datetime-local" 
            label="Bắt đầu từ" 
            className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl transition-colors text-sm" 
          />
          <Input 
            {...register('endAt')} 
            type="datetime-local" 
            label="Kết thúc vào" 
            className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl transition-colors text-sm" 
          />
        </div>
      </div>
    </div>
  )
}
