import React from 'react';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { IStaffProfile, IShiftTemplate, IWorkSchedule } from '../types/staff.type';
import { Skeleton } from '@/shared/components/ui/Skeleton';

interface Props {
  days: Date[];
  staff: IStaffProfile[];
  schedules: IWorkSchedule[];
  shifts: IShiftTemplate[];
  loading: boolean;
  filterShiftId?: string;
  isFullscreen?: boolean;
  onCellClick: (staff: IStaffProfile, day: Date, scheduleId?: string) => void;
}

const SchedulerGrid: React.FC<Props> = ({ days, staff, schedules, shifts, loading, filterShiftId, isFullscreen, onCellClick }) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'vi' ? vi : enUS;

  const getDaySchedules = (staffId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let daySchedules = schedules.filter(s => s.userId === staffId && s.workDate === dateStr);
    if (filterShiftId) {
      daySchedules = daySchedules.filter(s => s.shiftId === filterShiftId);
    }
    return daySchedules;
  };

  const isPastDate = (date: Date) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return format(date, 'yyyy-MM-dd') < todayStr;
  };

  const getShiftStyle = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return {};
    return {
      backgroundColor: `${shift.colorCode}15`,
      border: `1px solid ${shift.colorCode}40`,
      color: shift.colorCode
    };
  };

  const getShiftName = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    return shift ? shift.name : t('admin.staff.unknown_shift', 'K/X');
  };

  const getShiftTime = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return '';
    return `${shift.startTime.substring(0, 5)} - ${shift.endTime.substring(0, 5)}`;
  };

  const calculateShiftDuration = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return 0;
    const [h1, m1] = shift.startTime.split(':').map(Number);
    const [h2, m2] = shift.endTime.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60; // Cross midnight
    return diff / 60;
  };

  const formatStats = (totalHours: number, count: number) => {
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours % 1) * 60);
    return `${h}h${m > 0 ? ` ${m}${t('admin.staff.minute_short', 'ph')}` : ''} / ${count} ${t('admin.staff.shift_short', 'ca')}`;
  };

  const getStaffStats = (staffId: string) => {
    const staffSchedules = schedules.filter(s => s.userId === staffId);
    let totalHours = 0;
    staffSchedules.forEach(s => totalHours += calculateShiftDuration(s.shiftId));
    return formatStats(totalHours, staffSchedules.length);
  };

  const getDayStats = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySchedules = schedules.filter(s => s.workDate === dateStr);
    let totalHours = 0;
    daySchedules.forEach(s => totalHours += calculateShiftDuration(s.shiftId));
    return formatStats(totalHours, daySchedules.length);
  };

  const groupedStaff = React.useMemo(() => {
    return staff.reduce((acc, currentStaff) => {
      const role = currentStaff.role || 'OTHER';
      if (!acc[role]) acc[role] = [];
      acc[role].push(currentStaff);
      return acc;
    }, {} as Record<string, IStaffProfile[]>);
  }, [staff]);

  const roles = Object.keys(groupedStaff).sort();

  if (loading) {
    return (
      <div className="grid grid-cols-8 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {Array(32).fill(0).map((_, i) => (
          <div key={i} className="bg-white p-4 h-32">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-auto custom-scrollbar flex-1 ${isFullscreen ? 'min-h-0' : 'max-h-[calc(100vh-250px)]'}`}>
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-30">
          <tr>
            <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-[2px] w-48 sticky left-0 bg-slate-50 z-40 border-r border-slate-200">
              {t('admin.staff.employee', 'Nhân viên')}
            </th>
            {days.map((day, i) => (
              <th key={i} className={`px-4 py-3 text-center border-l border-slate-100 ${isPastDate(day) ? 'opacity-40 bg-slate-50/50' : ''}`}>
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-600 capitalize">{format(day, 'EEEE', { locale: dateLocale })}</span>
                    <span className="text-xs font-black text-slate-800">, {format(day, 'dd/MM')}</span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 tracking-tight">{getDayStats(day)}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {roles.map(role => (
            <React.Fragment key={role}>
              <tr>
                <td colSpan={days.length + 1} className="px-6 py-2 bg-slate-100 font-black text-[11px] text-slate-500 uppercase tracking-widest sticky left-0 z-10 border-y border-slate-200">
                  {t('admin.staff.department', 'Phân hệ')}: {role}
                </td>
              </tr>
              {groupedStaff[role].map((s) => (
                <tr key={s.id} className="group">
                  <td className="px-6 py-4 sticky left-0 bg-white z-10 group-hover:bg-slate-50 transition-colors border-r border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 border border-slate-200 shrink-0">
                        {s.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm whitespace-nowrap">{s.fullName}</span>
                        <span className="text-[11px] text-slate-400 font-medium tracking-tight mt-0.5">{getStaffStats(s.id)}</span>
                      </div>
                    </div>
                  </td>
                  {days.map((day, i) => {
                    const daySchedules = getDaySchedules(s.id, day);
                    const past = isPastDate(day);
                    return (
                      <td 
                        key={i} 
                        className={`p-1.5 border-l border-slate-50 h-32 transition-all align-top ${past ? 'bg-slate-50/80 opacity-50 pointer-events-none select-none' : 'hover:bg-slate-50/50 cursor-pointer'}`}
                        onClick={(e) => {
                          if (past) return;
                          if (e.target === e.currentTarget) {
                            onCellClick(s, day);
                          }
                        }}
                      >
                        {daySchedules.length > 0 ? (
                          <div 
                            className="flex flex-col gap-1.5 h-full max-h-[120px] overflow-y-auto custom-scrollbar"
                            onClick={() => onCellClick(s, day)}
                          >
                            {daySchedules.map(schedule => {
                              const isNoShow = schedule.status === 'NO_SHOW';
                              const isCompleted = schedule.status === 'COMPLETED';
                              return (
                                <div 
                                  key={schedule.id}
                                  className={`rounded-[4px] px-2 py-1.5 flex flex-col justify-center animate-in fade-in duration-300 shrink-0 shadow-sm ${isNoShow ? 'bg-red-50 border border-red-100 opacity-60 text-red-600' : ''} ${!past ? 'hover:brightness-95 cursor-pointer' : ''}`}
                                  style={!isNoShow ? getShiftStyle(schedule.shiftId) : {}}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (past) return;
                                    onCellClick(s, day, schedule.id);
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-semibold tracking-tight leading-none">{getShiftTime(schedule.shiftId)}</span>
                                    {isCompleted && <span className="text-[10px] leading-none">✔</span>}
                                    {isNoShow && <span className="text-[10px] font-bold text-red-500 leading-none">✖</span>}
                                  </div>
                                  <span className={`text-[11px] font-bold truncate leading-tight mt-0.5 ${isNoShow ? 'line-through' : ''}`}>
                                    {getShiftName(schedule.shiftId)}
                                  </span>
                                  {schedule.notes && !isNoShow && (
                                    <span className="text-[9px] font-medium opacity-70 line-clamp-1 italic leading-tight mt-0.5">“{schedule.notes}”</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div 
                            className={`h-full w-full flex items-center justify-center transition-opacity ${past ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`}
                            onClick={() => !past && onCellClick(s, day)}
                          >
                             <div className="size-6 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                               <span className="text-lg leading-none">+</span>
                             </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SchedulerGrid;
