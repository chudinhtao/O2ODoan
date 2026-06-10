import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  addDays, 
  startOfWeek, 
  format
} from 'date-fns';
import { IWorkSchedule, IStaffProfile } from '../types/staff.type';
import { useShifts } from '../hooks/useShifts';
import { useSchedules } from '../hooks/useSchedules';
import { useStaff } from '../hooks/useStaff';
import AssignmentModal from './modals/AssignmentModal';
import SchedulerHeader from './SchedulerHeader';
import SchedulerGrid from './SchedulerGrid';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { Select } from '@/shared/components/ui/Select';

const StaffScheduler: React.FC = () => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ staff: IStaffProfile, date: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterShiftId, setFilterShiftId] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const start = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  const from = format(days[0], 'yyyy-MM-dd');
  const to = format(days[6], 'yyyy-MM-dd');

  const { staff, isLoading: isStaffLoading } = useStaff();
  const { shifts } = useShifts();
  const { schedules, isLoading: isSchedulesLoading, assignShift, deleteSchedule, isAssigning, isDeleting } = useSchedules(from, to);

  const handleCellClick = (s: IStaffProfile, day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    setSelectedCell({ staff: s, date: dateStr });
    setIsModalOpen(true);
  };

  const handleAssign = (data: Partial<IWorkSchedule>) => {
    assignShift(data as IWorkSchedule);
  };

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteSchedule(deletingId, {
        onSuccess: () => {
          setIsConfirmOpen(false);
        }
      });
    }
  };

  return (
    <div className={`flex flex-col gap-4 h-full min-h-0 ${isFullscreen ? 'fixed inset-0 z-[100] bg-slate-50 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200' : 'p-4 md:p-6'}`}>
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-stretch justify-between shrink-0">
        <SchedulerHeader 
          currentDate={currentDate}
          onPrevWeek={() => setCurrentDate(addDays(currentDate, -7))}
          onNextWeek={() => setCurrentDate(addDays(currentDate, 7))}
          onToday={() => setCurrentDate(new Date())}
          onChangeDate={setCurrentDate}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        />
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto shrink-0 z-40">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{t('admin.staff.filter_by_shift', 'Lọc theo Ca:')}</span>
          <Select 
            value={filterShiftId}
            onChange={(e) => setFilterShiftId(e.target.value)}
            className="!py-0 !border-none !shadow-none !bg-transparent text-xs font-bold text-slate-800 w-full md:w-36 h-full"
            options={[
              { value: '', label: t('admin.staff.all_shifts', 'Tất cả các ca') },
              ...shifts.map(s => ({ value: s.id, label: s.name }))
            ]}
          />
        </div>
      </div>

      <SchedulerGrid 
        days={days}
        staff={staff}
        schedules={schedules}
        shifts={shifts}
        loading={isStaffLoading || isSchedulesLoading}
        filterShiftId={filterShiftId}
        onCellClick={handleCellClick}
        isFullscreen={isFullscreen}
      />

      <AssignmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staff={selectedCell?.staff || null}
        date={selectedCell?.date || ''}
        shifts={shifts}
        daySchedules={schedules.filter(s => s.userId === selectedCell?.staff.id && s.workDate === selectedCell?.date)}
        onSubmit={handleAssign}
        onDelete={handleDeleteRequest}
        isLoading={isAssigning}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title={t('admin.staff.confirm_delete_title', 'Xác nhận xoá')}
        description={t('admin.staff.confirm_delete_schedule', 'Bạn có chắc chắn muốn xoá lịch làm việc này?')}
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default StaffScheduler;
