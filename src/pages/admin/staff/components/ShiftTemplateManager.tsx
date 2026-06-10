import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ColumnDef } from '@/shared/components/DataTable/types';
import { IShiftTemplate } from '../types/staff.type';
import { useShifts } from '../hooks/useShifts';
import ShiftFormModal from './modals/ShiftFormModal';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';

const ShiftTemplateManager: React.FC = () => {
  const { t } = useTranslation();
  const { shifts, isLoading, saveShift, deleteShift, isSaving, isDeleting } = useShifts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<IShiftTemplate | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const paginatedData = useMemo(() => {
    return shifts.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  }, [shifts, currentPage, pageSize]);

  const totalPages = Math.ceil(shifts.length / pageSize);

  const handleAdd = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  const handleEdit = (shift: IShiftTemplate) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: IShiftTemplate) => {
    saveShift(data, {
      onSuccess: () => setIsModalOpen(false)
    });
  };

  const handleDelete = () => {
    if (confirmDeleteId) {
      deleteShift(confirmDeleteId, {
        onSuccess: () => setConfirmDeleteId(null)
      });
    }
  };

  const columns: ColumnDef<IShiftTemplate>[] = [
    {
      header: 'STT',
      align: 'center',
      width: '60px',
      cell: (_, index) => (currentPage * pageSize) + index + 1
    },
    {
      header: t('admin.staff.shift_name', 'Tên ca'),
      accessorKey: 'name',
      width: '30%',
      className: 'font-bold text-slate-700'
    },
    {
      header: t('admin.staff.start_time', 'Giờ bắt đầu'),
      width: '15%',
      cell: (shift) => <span className="font-medium text-slate-600">{shift.startTime.substring(0, 5)}</span>
    },
    {
      header: t('admin.staff.end_time', 'Giờ kết thúc'),
      width: '15%',
      cell: (shift) => <span className="font-medium text-slate-600">{shift.endTime.substring(0, 5)}</span>
    },
    {
      header: t('admin.staff.color', 'Màu hiển thị'),
      width: '15%',
      cell: (shift) => (
        <div 
          className="w-6 h-6 rounded-lg border border-slate-200 shadow-sm" 
          style={{ backgroundColor: shift.colorCode || '#3B82F6' }}
        />
      )
    },
    {
      header: t('admin.staff.status', 'Trạng thái'),
      width: '150px',
      cell: (shift) => (
        <Badge variant={shift.active ? 'success' : 'neutral'}>
          {shift.active ? t('common.active', 'Hoạt động') : t('common.inactive', 'Ngừng')}
        </Badge>
      )
    },
    {
      header: t('common.actions', 'Thao tác'),
      align: 'right',
      width: '100px',
      cell: (shift) => (
        <div className="flex justify-end gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 rounded-lg hover:bg-white hover:shadow-sm"
            onClick={() => handleEdit(shift)}
          >
            <Edit2 className="w-4 h-4 text-slate-400 hover:text-primary" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 rounded-lg hover:bg-white hover:shadow-sm"
            onClick={() => setConfirmDeleteId(shift.id || null)}
          >
            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 flex flex-col gap-4 h-full min-h-0">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <Clock className="w-5 h-5 text-primary" />
          {t('admin.staff.shift_list', 'Danh sách Ca làm việc')}
        </h3>
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        actions={
          <Button size="sm" className="flex items-center gap-2 rounded-lg" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            {t('admin.staff.add_shift', 'Thêm ca mới')}
          </Button>
        }
        pagination={{
          currentPage,
          pageSize,
          totalElements: shifts.length,
          totalPages,
          onPageChange: setCurrentPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setCurrentPage(0);
          }
        }}
        emptyState={
          <div className="text-center py-10 text-slate-400 font-medium italic">
            {t('admin.staff.no_shifts', 'Chưa có ca làm việc nào được định nghĩa.')}
          </div>
        }
      />

      <ShiftFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingShift}
        isLoading={isSaving}
      />

      <ConfirmDialog 
        isOpen={!!confirmDeleteId}
        title={t('common.confirmDelete')}
        description={t('admin.staff.confirmDeleteShiftDesc', 'Bạn có chắc chắn muốn xóa ca làm mẫu này?')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};

export default ShiftTemplateManager;
