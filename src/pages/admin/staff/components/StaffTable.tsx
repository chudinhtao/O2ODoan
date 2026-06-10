import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, PencilLine, Lock, Unlock, Trash2 } from 'lucide-react';
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu';
import { DataTable } from '@/shared/components/DataTable/DataTable';
import { ColumnDef } from '@/shared/components/DataTable/types';
import { IStaffProfile, ROLE } from '../types/staff.type';
import { useToggleStaff } from '../hooks/useStaff';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';

interface StaffTableProps {
  data: IStaffProfile[];
  onEdit: (staff: IStaffProfile) => void;
  onDelete?: (id: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  page: number;
  pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  actions: React.ReactNode;
}

export function StaffTable({ 
  data, onEdit, onDelete, searchValue, onSearchChange, 
  page, pageSize, totalElements, onPageChange, onPageSizeChange,
  actions 
}: StaffTableProps) {
  const { t } = useTranslation();
  const toggleStaff = useToggleStaff();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    toggleStaff.mutate(id);
  };

  const totalPages = Math.ceil(totalElements / pageSize);



  const getRoleBadge = (role: string) => {
    switch (role) {
      case ROLE.ADMIN:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{t(`admin.staffModule.roles.${ROLE.ADMIN}`)}</span>;
      case ROLE.CASHIER:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{t(`admin.staffModule.roles.${ROLE.CASHIER}`)}</span>;
      case ROLE.KITCHEN:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">{t(`admin.staffModule.roles.${ROLE.KITCHEN}`)}</span>;
      case ROLE.SERVER:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700">{t(`admin.staffModule.roles.${ROLE.SERVER}`)}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{role}</span>;
    }
  };

  const getRoleAvatarColor = (role: string) => {
    switch (role) {
      case ROLE.ADMIN: return 'bg-orange-100 text-primary';
      case ROLE.CASHIER: return 'bg-blue-100 text-blue-600';
      case ROLE.KITCHEN: return 'bg-red-100 text-red-600';
      case ROLE.SERVER: return 'bg-teal-100 text-teal-600';
      default: return 'bg-slate-900 text-white';
    }
  };

  const generateInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const columns: ColumnDef<IStaffProfile>[] = [
    {
      header: 'STT',
      align: 'center',
      width: '60px',
      cell: (_, index) => (page * pageSize) + index + 1
    },
    {
      header: t('admin.staffModule.table.avatar'),
      width: '100px',
      cell: (staff) => (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRoleAvatarColor(staff.role)}`}>
          {generateInitials(staff.fullName)}
        </div>
      )
    },
    {
      header: t('admin.staffModule.table.fullName'),
      accessorKey: 'fullName',
      width: '25%',
      className: 'font-semibold text-slate-900'
    },
    {
      header: t('admin.staffModule.table.username'),
      accessorKey: 'username',
      width: '20%',
      className: 'text-slate-500'
    },
    {
      header: t('admin.staffModule.table.role'),
      width: '15%',
      cell: (staff) => getRoleBadge(staff.role)
    },
    {
      header: t('admin.staffModule.table.status'),
      width: '150px',
      cell: (staff) => staff.active ? (
        <div className="flex items-center gap-1.5 text-green-600 font-medium whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
          {t('admin.staffModule.table.statusActive')}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-slate-400 font-medium whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
          {t('admin.staffModule.table.statusInactive')}
        </div>
      )
    },
    {
      header: t('admin.staffModule.table.actions'),
      align: 'right',
      width: '100px',
      cell: (staff) => (
        <DropdownMenu
          items={[
            {
              label: staff.active ? t('admin.staff.lockAccount') : t('admin.staff.unlockAccount'),
              icon: staff.active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-primary" />,
              onClick: () => handleToggle(staff.id)
            },
            {
              label: t('common.edit', 'Chỉnh sửa'),
              icon: <PencilLine className="w-4 h-4" />,
              onClick: () => onEdit(staff)
            },
            {
              label: t('common.delete', 'Xóa'),
              icon: <Trash2 className="w-4 h-4" />,
              variant: 'danger',
              onClick: () => setConfirmDeleteId(staff.id)
            }
          ]}
        />
      )
    }
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={t('admin.staffModule.searchPlaceholder', 'Tìm kiếm nhân viên...')}
        actions={actions}
        pagination={{
          currentPage: page,
          pageSize,
          totalElements,
          totalPages,
          onPageChange,
          onPageSizeChange
        }}
        emptyState={
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <Users className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('admin.staffModule.empty')}</h3>
            <p className="text-slate-500">{t('admin.staffModule.emptyDesc')}</p>
          </div>
        }
      />

      <ConfirmDialog 
        isOpen={!!confirmDeleteId}
        title={t('common.confirmDelete', 'Xác nhận xóa')}
        description={t('admin.staff.confirmDeleteDesc', 'Bạn có chắc chắn muốn xóa nhân viên này? Thao tác này không thể hoàn tác.')}
        onConfirm={() => {
          if (confirmDeleteId && onDelete) onDelete(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        onCancel={() => setConfirmDeleteId(null)}
        variant="danger"
      />
    </>
  );
}
