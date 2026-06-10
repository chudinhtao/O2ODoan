import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ClipboardCheck, 
  Calendar as CalendarIcon
} from 'lucide-react';
import { Badge } from '@/shared/components/ui/Badge';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ColumnDef } from '@/shared/components/DataTable/types';
import { IAttendanceLog } from '../types/staff.type';
import { format } from 'date-fns';
import { useAttendance } from '../hooks/useAttendance';
import { ExportButton } from '@/shared/components/ExportButton';

const formatTime = (isoString?: string) => {
  if (!isoString) return '--:--';
  try {
    return format(new Date(isoString), 'HH:mm');
  } catch {
    return '--:--';
  }
};

const AttendanceTable: React.FC = () => {
  const { t } = useTranslation();
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const { logs, isLoading } = useAttendance(startDate, endDate);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const lower = searchTerm.toLowerCase();
    return logs.filter(log => 
      log.fullName.toLowerCase().includes(lower) || 
      (log.shiftName && log.shiftName.toLowerCase().includes(lower))
    );
  }, [logs, searchTerm]);

  const paginatedData = useMemo(() => {
    return filteredLogs.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  const columns: ColumnDef<IAttendanceLog>[] = [
    {
      header: 'STT',
      align: 'center',
      width: '60px',
      cell: (_, index) => (currentPage * pageSize) + index + 1
    },
    {
      header: t('admin.staff.employee', 'Nhân viên'),
      accessorKey: 'fullName',
      width: '15%',
      className: 'font-bold text-slate-700'
    },
    {
      header: t('admin.staff.shift', 'Ca làm việc'),
      accessorKey: 'shiftName',
      width: '15%',
      className: 'text-sm font-bold text-primary'
    },
    {
      header: t('admin.staff.check_in', 'Giờ vào'),
      width: '10%',
      cell: (log) => <span className="text-sm font-black text-slate-900">{formatTime(log.checkIn)}</span>
    },
    {
      header: t('admin.staff.check_out', 'Giờ ra'),
      width: '10%',
      cell: (log) => <span className="text-sm font-black text-slate-900">{formatTime(log.checkOut)}</span>
    },
    {
      header: t('admin.staff.late_minutes', 'Đi muộn (p)'),
      align: 'center',
      width: '10%',
      cell: (log) => <span className="text-sm font-bold text-red-500">{(log.lateMinutes || 0) > 0 ? log.lateMinutes : '-'}</span>
    },
    {
      header: t('admin.staff.early_leave_minutes', 'Về sớm (p)'),
      align: 'center',
      width: '10%',
      cell: (log) => <span className="text-sm font-bold text-orange-500">{(log.earlyLeaveMinutes || 0) > 0 ? log.earlyLeaveMinutes : '-'}</span>
    },
    {
      header: t('admin.staff.ot_minutes', 'OT (p)'),
      align: 'center',
      width: '10%',
      cell: (log) => <span className="text-sm font-bold text-emerald-500">{(log.otMinutes || 0) > 0 ? log.otMinutes : '-'}</span>
    },
    {
      header: t('admin.staff.status', 'Trạng thái'),
      width: '150px',
      cell: (log) => (
        <div className="flex gap-1 flex-wrap">
          {log.late && <Badge variant="danger">{t('admin.staff.late', 'Đi muộn')}</Badge>}
          {log.earlyLeave && <Badge variant="warning">{t('admin.staff.early', 'Về sớm')}</Badge>}
          {(log.otMinutes || 0) > 0 && <Badge variant="success">{t('admin.staff.has_ot', 'Có OT')}</Badge>}
          {!log.late && !log.earlyLeave && log.checkIn && log.checkOut && <Badge variant="neutral">{t('admin.staff.on_time', 'Đúng giờ')}</Badge>}
          {log.checkIn && !log.checkOut && <Badge variant="neutral">{t('admin.staff.working', 'Đang làm việc')}</Badge>}
          {!log.checkIn && <Badge variant="neutral">{t('admin.staff.absent', 'Vắng mặt')}</Badge>}
        </div>
      )
    },
    {
      header: t('admin.staff.notes', 'Ghi chú'),
      width: '15%',
      cell: (log) => (
        <div className="text-sm text-slate-500 italic max-w-[250px] truncate">
          {log.checkInNote && <div className="truncate"><span className="font-bold text-slate-400 text-[10px] uppercase">{t('admin.staff.note_in', 'Vào')}:</span> {log.checkInNote}</div>}
          {log.checkOutNote && <div className="truncate"><span className="font-bold text-slate-400 text-[10px] uppercase">{t('admin.staff.note_out', 'Ra')}:</span> {log.checkOutNote}</div>}
          {!log.checkInNote && !log.checkOutNote && '-'}
        </div>
      )
    }
  ];

  return (
    <div className="p-4 flex flex-col gap-4 h-full min-h-0">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          {t('admin.staff.attendance_log', 'Nhật ký Điểm danh')}
        </h3>
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchValue={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v)
          setCurrentPage(0)
        }}
        searchPlaceholder={t('common.search', 'Tìm kiếm...')}
        leftToolbar={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg h-9 shrink-0 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
            <input 
              type="date" 
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 p-0 w-24 cursor-pointer"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(0); }}
            />
            <span className="text-slate-300 text-xs">—</span>
            <input 
              type="date" 
              className="bg-transparent border-none outline-none text-xs font-bold text-slate-700 p-0 w-24 cursor-pointer"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(0); }}
              min={startDate}
            />
          </div>
        }
        actions={
          <ExportButton
            data={filteredLogs.map(log => ({
              ...log,
              employeeCode: log.userId.slice(-6).toUpperCase(),
              checkInFormatted: log.checkIn ? new Date(log.checkIn).toLocaleString('vi-VN') : '-',
              checkOutFormatted: log.checkOut ? new Date(log.checkOut).toLocaleString('vi-VN') : '-',
              actualWorkedHours: log.checkIn && log.checkOut 
                ? Number(((new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60)).toFixed(2)) 
                : 0,
              lateMinutes: log.lateMinutes || 0,
              earlyLeaveMinutes: log.earlyLeaveMinutes || 0,
              otMinutes: log.otMinutes || 0,
              attendanceStatus: (() => {
                const parts: string[] = []
                if (log.late) parts.push(t('admin.staff.late', 'Đi muộn'))
                if (log.earlyLeave) parts.push(t('admin.staff.early', 'Về sớm'))
                if ((log.otMinutes || 0) > 0) parts.push(t('admin.staff.has_ot', 'Có OT'))
                if (!log.late && !log.earlyLeave && log.checkIn && log.checkOut) parts.push(t('admin.staff.on_time', 'Đúng giờ'))
                if (log.checkIn && !log.checkOut) parts.push(t('admin.staff.working', 'Đang làm việc'))
                if (!log.checkIn) parts.push(t('admin.staff.absent', 'Vắng mặt'))
                return parts.join(', ')
              })()
            }))}
            fileName={t('admin.staff.export_attendance_file', `Nhat_ky_diem_danh_${startDate}_${endDate}`)}
            sheetName={t('admin.staff.export_attendance_sheet', 'DiemDanh')}
            headers={{
              'employeeCode': t('admin.staff.employee_code', 'Mã NV'),
              'fullName': t('admin.staff.employee', 'Nhân viên'),
              'shiftName': t('admin.staff.shift', 'Ca làm việc'),
              'checkInFormatted': t('admin.staff.check_in', 'Giờ vào'),
              'checkOutFormatted': t('admin.staff.check_out', 'Giờ ra'),
              'actualWorkedHours': t('admin.staff.actual_hours', 'Số giờ làm việc thực tế'),
              'lateMinutes': t('admin.staff.late_minutes', 'Số phút đi muộn'),
              'earlyLeaveMinutes': t('admin.staff.early_leave_minutes', 'Số phút về sớm'),
              'otMinutes': t('admin.staff.ot_minutes', 'Số phút OT'),
              'attendanceStatus': t('admin.staff.status', 'Trạng thái'),
              'checkInNote': t('admin.staff.check_in_note', 'Ghi chú vào'),
              'checkOutNote': t('admin.staff.check_out_note', 'Ghi chú ra')
            }}
          />
        }
        pagination={{
          currentPage,
          pageSize,
          totalElements: filteredLogs.length,
          totalPages,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(0);
          }
        }}
        emptyState={
          <div className="text-center py-12 text-slate-400 font-medium italic">
            {t('admin.staff.no_attendance_data', `Chưa có dữ liệu điểm danh từ ngày ${startDate} đến ${endDate}.`, { startDate, endDate })}
          </div>
        }
      />
    </div>
  );
};

export default AttendanceTable;
