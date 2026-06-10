import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import TimePicker24h from '@/shared/components/ui/TimePicker24h';
import { X, Clock, Loader2, Palette } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { IShiftTemplate } from '../../types/staff.type';
import { useTranslation } from 'react-i18next';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IShiftTemplate) => void;
  initialData?: IShiftTemplate | null;
  isLoading?: boolean;
}

const ShiftFormModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  isLoading 
}) => {
  const { t } = useTranslation();
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<IShiftTemplate>();

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        startTime: initialData.startTime?.substring(0, 5) || '08:00',
        endTime: initialData.endTime?.substring(0, 5) || '17:00'
      });
    } else {
      reset({
        name: '',
        startTime: '08:00',
        endTime: '17:00',
        colorCode: '#3B82F6',
        gracePeriodMinutes: 5,
        active: true
      });
    }
  }, [initialData, reset, isOpen]);

  const onFormSubmit = (data: IShiftTemplate) => {
    if (data.startTime.length === 5) data.startTime += ':00';
    if (data.endTime.length === 5) data.endTime += ':00';
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={() => !isLoading && onClose()} 
      />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
             <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
               <Clock className="w-4 h-4" />
             </div>
             <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              {initialData ? t('admin.staff.edit_shift', 'Sửa Ca') : t('admin.staff.add_shift', 'Thêm Ca')}
            </h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading} className="h-9 w-9 p-0 hover:bg-primary/10 hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-primary">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-4 custom-scrollbar">
          <Input 
            label={t('admin.staff.shift_name', 'Tên ca')}
            {...register('name', { required: t('common.validation.numberRequired', 'Trường này là bắt buộc') })}
            placeholder="VD: Ca Sáng"
            error={errors.name}
            className="!py-2.5 !rounded-xl"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('admin.staff.start_time', 'Giờ bắt đầu')}</label>
              <Controller
                control={control}
                name="startTime"
                rules={{ required: t('common.validation.numberRequired', 'Trường này là bắt buộc') }}
                render={({ field: { onChange, value } }) => (
                  <TimePicker24h 
                    value={value} 
                    onChange={onChange} 
                    error={!!errors.startTime} 
                  />
                )}
              />
              {errors.startTime && <span className="text-xs text-rose-500 ml-1 block">{errors.startTime.message}</span>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{t('admin.staff.end_time', 'Giờ kết thúc')}</label>
              <Controller
                control={control}
                name="endTime"
                rules={{ required: t('common.validation.numberRequired', 'Trường này là bắt buộc') }}
                render={({ field: { onChange, value } }) => (
                  <TimePicker24h 
                    value={value} 
                    onChange={onChange} 
                    error={!!errors.endTime} 
                  />
                )}
              />
              {errors.endTime && <span className="text-xs text-rose-500 ml-1 block">{errors.endTime.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{t('admin.staff.color', 'Màu hiển thị')}</span>
                </div>
              </div>
              <input 
                type="color" 
                {...register('colorCode')}
                className="w-8 h-8 p-0 border-none rounded-lg cursor-pointer bg-transparent"
              />
            </div>
            
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">{t('admin.staff.grace_period', 'Châm chước (Phút)')}</span>
                </div>
              </div>
              <input 
                type="number"
                min="0"
                max="60"
                {...register('gracePeriodMinutes', { valueAsNumber: true })}
                className="w-12 px-2 py-1 text-center bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
             <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">{t('admin.staff.status', 'Trạng thái')}</span>
                <span className="text-xs text-slate-500">{t('admin.staff.active_desc', 'Kích hoạt ca làm việc')}</span>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input {...register('active')} type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
             </label>
          </div>

          {/* Hidden submit button to allow enter key */}
          <button type="submit" className="hidden" />
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="ghost"
            className="flex-1 py-3 rounded-xl font-black uppercase text-xs tracking-widest bg-white hover:bg-slate-100 border border-slate-200"
          >
            {t('common.cancel', 'Hủy')}
          </Button>
          <Button
            onClick={handleSubmit(onFormSubmit)}
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('common.save', 'Lưu')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShiftFormModal;
