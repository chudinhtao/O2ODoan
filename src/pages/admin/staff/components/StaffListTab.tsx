import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { StaffTable } from '../components/StaffTable';
import { StaffFormModal } from '../components/StaffFormModal';
import { useStaff, useDeleteStaff } from '../hooks/useStaff';
import { IStaffProfile } from '../types/staff.type';
import { Button } from '@/shared/components/ui/Button';
import { ExportButton } from '@/shared/components/ExportButton';

export default function StaffListTab() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { staffPage } = useStaff({ keyword: searchTerm, page: currentPage, size: pageSize });
  const staff = staffPage?.content || [];
  const deleteStaff = useDeleteStaff();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<IStaffProfile | null>(null);

  const handleAdd = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleEdit = (s: IStaffProfile) => {
    setEditingStaff(s);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteStaff.mutate(id);
  };

  return (
    <div className="p-4 flex flex-col gap-6 h-full min-h-0">
      <div className="flex-1 flex flex-col min-h-0">
        <StaffTable 
          data={staff} 
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchValue={searchTerm}
          onSearchChange={(v) => { setSearchTerm(v); setCurrentPage(0); }}
          page={currentPage}
          pageSize={pageSize}
          totalElements={staffPage?.totalElements || 0}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(0); }}
          actions={
            <>
              <ExportButton
                data={staff.map(s => ({
                  ...s,
                  roleLabel: t(`admin.analytics.role.${s.role.toLowerCase()}`, s.role),
                  activeLabel: s.active ? t('common.active', 'Hoạt động') : t('common.inactive', 'Tạm ngưng'),
                  createdAtFormatted: s.createdAt ? new Date(s.createdAt).toLocaleDateString('vi-VN') : '—',
                  lastLoginAtFormatted: s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString('vi-VN') : '—'
                }))}
                fileName={t('admin.staff.export.fileName', 'Danh_sach_nhan_vien')}
                sheetName={t('admin.staff.export.sheetName', 'NhanVien')}
                headers={{
                  'fullName': t('admin.staff.export.fullName', 'Họ và tên'),
                  'username': t('admin.staff.export.username', 'Tên đăng nhập'),
                  'roleLabel': t('admin.staff.export.role', 'Vai trò'),
                  'phone': t('admin.staff.export.phone', 'Số điện thoại'),
                  'createdAtFormatted': t('admin.staff.export.createdAt', 'Ngày tạo tài khoản'),
                  'lastLoginAtFormatted': t('admin.staff.export.lastLogin', 'Đăng nhập cuối'),
                  'activeLabel': t('admin.staff.export.active', 'Trạng thái')
                }}
              />
              <Button onClick={handleAdd} className="rounded-lg shrink-0 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.staffModule.addNew')}</span>
              </Button>
            </>
          }
        />
      </div>

      <StaffFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staffData={editingStaff}
      />
    </div>
  );
}
