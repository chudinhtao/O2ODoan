import { useState } from 'react';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ColumnDef } from '@/shared/components/DataTable/types';
import { IAttendanceSummary } from '../types/staff.type';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Calendar, Download } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useAttendanceSummary } from '../hooks/useAttendanceSummary';

interface AttendanceSummaryProps {
  currentDate: Date;
}

export function AttendanceSummaryTable({ currentDate }: AttendanceSummaryProps) {
  const { t } = useTranslation();
  // Option 1: Monthly view by default
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const [fromDate, setFromDate] = useState<string>(format(startOfMonth, 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState<string>(format(endOfMonth, 'yyyy-MM-dd'));
  const [search, setSearch] = useState('');

  const { data: summary = [], isLoading } = useAttendanceSummary(fromDate, toDate);

  const columns: ColumnDef<IAttendanceSummary>[] = [
    {
      accessorKey: 'fullName',
      header: t('admin.staff.employee', 'Nhân viên'),
      cell: (item) => <span className="font-medium">{item.fullName}</span>,
    },
    {
      accessorKey: 'totalShifts',
      header: t('admin.staff.summary.total_shifts', 'Tổng số ca'),
      cell: (item) => <span className="font-semibold">{item.totalShifts}</span>,
    },
    {
      accessorKey: 'totalWorkingHours',
      header: t('admin.staff.summary.total_working_hours', 'Tổng giờ làm'),
      cell: (item) => (
        <span className="font-semibold text-emerald-600">
          {item.totalWorkingHours} h
        </span>
      ),
    },
    {
      accessorKey: 'totalLateMinutes',
      header: t('admin.staff.summary.total_late_minutes', 'Tổng phút trễ'),
      cell: (item) => (
        <span className={item.totalLateMinutes > 0 ? "font-semibold text-rose-600" : ""}>
          {item.totalLateMinutes} p
        </span>
      ),
    },
    {
      accessorKey: 'totalEarlyLeaveMinutes',
      header: t('admin.staff.summary.total_early_leave', 'Tổng phút về sớm'),
      cell: (item) => (
        <span className={item.totalEarlyLeaveMinutes > 0 ? "font-semibold text-amber-600" : ""}>
          {item.totalEarlyLeaveMinutes} p
        </span>
      ),
    },
    {
      accessorKey: 'totalOtMinutes',
      header: t('admin.staff.summary.total_ot', 'Tổng phút OT'),
      cell: (item) => (
        <span className={item.totalOtMinutes > 0 ? "font-semibold text-blue-600" : ""}>
          {item.totalOtMinutes} p
        </span>
      ),
    },
  ];

  const handleExport = () => {
    // Basic CSV export
    const headers = [
      t('admin.staff.employee', 'Nhân viên'),
      t('admin.staff.summary.total_shifts', 'Tổng số ca'),
      t('admin.staff.summary.total_working_hours', 'Tổng giờ làm'),
      t('admin.staff.summary.total_late_minutes', 'Tổng phút trễ'),
      t('admin.staff.summary.total_early_leave', 'Tổng phút về sớm'),
      t('admin.staff.summary.total_ot', 'Tổng phút OT')
    ];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n"
      + summary.map(row => {
          return `"${row.fullName}",${row.totalShifts},${row.totalWorkingHours},${row.totalLateMinutes},${row.totalEarlyLeaveMinutes},${row.totalOtMinutes}`;
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bang_Tong_Hop_Cong_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-4 rounded-xl border border-outline-variant shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-on-surface-variant" />
            <span className="text-sm font-medium text-on-surface-variant">{t('admin.staff.summary.from_date', 'Từ ngày:')}</span>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-sm border-outline-variant rounded-md shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-on-surface-variant">{t('admin.staff.summary.to_date', 'Đến ngày:')}</span>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-sm border-outline-variant rounded-md shadow-sm"
            />
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="gap-2 shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          onClick={handleExport}
          disabled={!summary.length}
        >
          <Download className="w-4 h-4" />
          {t('admin.staff.summary.export_csv', 'Xuất Bảng Lương (CSV)')}
        </Button>
      </div>

      <div className="flex-1 min-h-0 bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
        <DataTable
          columns={columns}
          data={summary.filter(s => s.fullName.toLowerCase().includes(search.toLowerCase()))}
          isLoading={isLoading}
          searchPlaceholder={t('admin.staff.summary.search_placeholder', 'Tìm nhân viên...')}
          searchValue={search}
          onSearchChange={setSearch}
        />
      </div>
    </div>
  );
}
