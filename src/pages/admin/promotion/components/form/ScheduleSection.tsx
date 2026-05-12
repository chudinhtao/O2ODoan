import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form'
import { Clock, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import type { PromotionFormValues } from '../../hooks/usePromotionForm'

interface Props {
  form: UseFormReturn<PromotionFormValues>
  scheduleArray: UseFieldArrayReturn<PromotionFormValues, 'schedules'>
}

export function ScheduleSection({ form, scheduleArray }: Props) {
  const { register, watch, setValue, formState: { errors } } = form

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Lịch lặp lại (Happy Hour)
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-widest">Tùy chọn khung giờ vàng</p>
        </div>
        <Button
          type="button"
          onClick={() => scheduleArray.append({ days: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '22:00' })}
          className="h-8 px-3 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 !rounded-lg border-none shadow-none flex items-center gap-1 font-bold"
        >
          <Plus className="w-3.5 h-3.5" /> Thêm lịch
        </Button>
      </div>

      <div className="space-y-4">
        {scheduleArray.fields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
            <p className="text-sm font-medium text-slate-400">Chưa thiết lập lịch lặp lại</p>
            <p className="text-[11px] text-slate-400 mt-1">Khuyến mãi sẽ áp dụng 24/7 trong khoảng thời gian hiệu lực</p>
          </div>
        ) : (
          scheduleArray.fields.map((field, index) => (
            <div key={field.id} className="p-4 border border-slate-200 rounded-xl space-y-4 bg-white shadow-sm relative group">
              <button
                type="button"
                onClick={() => scheduleArray.remove(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-white border border-slate-200 text-rose-500 rounded-full shadow-md hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Các ngày áp dụng</label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 0].map(day => {
                    const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
                    const currentDays = watch(`schedules.${index}.days`) || []
                    const isSelected = currentDays.includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setValue(`schedules.${index}.days`, currentDays.filter((d: number) => d !== day))
                          } else {
                            setValue(`schedules.${index}.days`, [...currentDays, day])
                          }
                        }}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
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
                  className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl transition-colors"
                  error={errors.schedules?.[index]?.startTime}
                />
                <Input
                  {...register(`schedules.${index}.endTime`)}
                  type="time"
                  label="Giờ kết thúc"
                  className="!bg-slate-50 border-transparent focus:!border-primary !rounded-xl transition-colors"
                  error={errors.schedules?.[index]?.endTime}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
