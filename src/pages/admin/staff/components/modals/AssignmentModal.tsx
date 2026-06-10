import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Loader2, Clock, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { format } from 'date-fns';
import { IStaffProfile, IShiftTemplate, IWorkSchedule } from '../../types/staff.type';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staff: IStaffProfile | null;
  date: string;
  shifts: IShiftTemplate[];
  daySchedules: IWorkSchedule[];
  onSubmit: (data: Partial<IWorkSchedule>) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const AssignmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  staff,
  date,
  shifts,
  daySchedules,
  onSubmit,
  onDelete,
  isLoading
}) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset } = useForm<Partial<IWorkSchedule>>();
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      reset({ shiftId: '', notes: '' });
      setSelectedShifts([]);
    }
  }, [isOpen, reset]);

  const toggleShift = (shiftId: string) => {
    setSelectedShifts(prev => 
      prev.includes(shiftId) ? prev.filter(id => id !== shiftId) : [...prev, shiftId]
    );
  };

  const onFormSubmit = (data: Partial<IWorkSchedule>) => {
    if (!staff || selectedShifts.length === 0) return;
    
    selectedShifts.forEach(shiftId => {
      onSubmit({
        ...data,
        shiftId,
        userId: staff.id,
        workDate: date
      });
    });
    
    reset({ shiftId: '', notes: '' });
    setSelectedShifts([]);
  };

  const getShiftName = (shiftId: string) => {
    return shifts.find(s => s.id === shiftId)?.name || 'Unknown';
  };
  
  const getShiftTime = (shiftId: string) => {
    const s = shifts.find(s => s.id === shiftId);
    return s ? `${s.startTime.substring(0,5)} - ${s.endTime.substring(0,5)}` : '';
  };

  const isPastDate = date < format(new Date(), 'yyyy-MM-dd');

  if (!isOpen || !staff) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={() => !isLoading && onClose()} 
      />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-4xl min-h-[75vh] rounded-[32px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
           <div className="flex flex-col gap-1">
              <span className="text-xs font-black text-primary uppercase tracking-widest">{staff.fullName}</span>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-none flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {t('admin.staff.schedule_for_date', 'Lịch ngày {{date}}', { date })}
              </h3>
           </div>
           
           <div className="flex items-center gap-3">
             {!isPastDate && (
               <Button
                 form="assign-form"
                 type="submit"
                 disabled={isLoading || selectedShifts.length === 0}
                 className="h-9 px-4 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest hover:bg-primary/90 shadow-sm shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
               >
                 {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                 {t('admin.staff.save_shift', 'Lưu ca làm việc')}
               </Button>
             )}
             <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading} className="h-9 w-9 p-0 hover:bg-primary/10 hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-primary">
               <X className="w-5 h-5" />
             </Button>
           </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 space-y-6 custom-scrollbar">
          
          {/* Add Shift Form */}
          {!isPastDate && (
            <form id="assign-form" onSubmit={handleSubmit(onFormSubmit)} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                {t('admin.staff.assign_new_shift', 'Phân ca mới')}
              </h4>
              <div className="space-y-2 z-50 relative">
                <div className="flex flex-wrap gap-2">
                  {shifts.map(s => {
                    const isSelected = selectedShifts.includes(s.id);
                    const isAssigned = daySchedules.some(sch => sch.shiftId === s.id && sch.status !== 'CANCELLED');
                    return (
                      <div 
                        key={s.id}
                        onClick={() => !isAssigned && toggleShift(s.id)}
                        className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all flex items-center ${
                          isAssigned 
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm cursor-default' 
                            : isSelected 
                              ? 'cursor-pointer bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                              : 'cursor-pointer bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {isAssigned && <Check className="w-3 h-3 mr-1" />}
                        {s.name} <span className={`text-[10px] ml-1 opacity-80 ${isSelected || isAssigned ? 'font-medium text-white/80' : 'text-slate-400'}`}>({s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)})</span>
                      </div>
                    );
                  })}
                </div>
                <div className="h-4">
                  {selectedShifts.length === 0 && daySchedules.length === 0 && (
                    <span className="text-[11px] text-rose-500 font-medium italic">{t('admin.staff.require_shift', 'Vui lòng chọn ít nhất 1 ca làm việc')}</span>
                  )}
                </div>

                <textarea 
                  {...register('notes')}
                  rows={2}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  placeholder={t('admin.staff.placeholder_note', 'Nhập ghi chú (nếu có)...')}
                />
              </div>
            </form>
          )}

          {/* Current Shifts List */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('admin.staff.assigned_shifts', 'Các ca đã xếp')}</h4>
            
            {daySchedules.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
                <Clock className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-sm font-medium text-slate-500">{t('admin.staff.no_shifts_assigned', 'Chưa có ca nào trong ngày này.')}</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {daySchedules.map(sch => (
                  <div key={sch.id} className="group relative flex flex-col bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm w-fit min-w-[140px] pr-8 hover:border-slate-300 transition-all">
                    <span className="font-bold text-slate-800 text-sm">{getShiftName(sch.shiftId)}</span>
                    <span className="text-[10px] font-black text-slate-400 mt-0.5 tracking-wide">{getShiftTime(sch.shiftId)}</span>
                    {sch.notes && <span className="text-[10px] text-slate-500 italic mt-1 max-w-[120px] truncate" title={sch.notes}>{sch.notes}</span>}
                    
                    {!isPastDate && sch.status === 'PLANNED' && (
                      <button
                        type="button"
                        onClick={() => onDelete(sch.id)}
                        disabled={isLoading}
                        className="absolute top-2 right-2 size-6 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
