import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, PencilLine, Lock, Unlock } from 'lucide-react';
import { IStaff, ROLE } from '../types/adminStaff.type';
import { useToggleStaff } from '../hooks/useStaff';
// import removed;
import { Pagination } from '@/shared/components/ui/Pagination';
// EmptyState removed because it wasn't found in shared components and is not strictly necessary

interface StaffTableProps {
  data: IStaff[];
  onEdit: (staff: IStaff) => void;
}

export function StaffTable({ data, onEdit }: StaffTableProps) {
  const { t } = useTranslation();
  const toggleStaff = useToggleStaff();

  const handleToggle = (id: string) => {
    // We could add a confirmation modal here, but for now just toggle
    // using the mutation we built previously
    toggleStaff.mutate(id);
  };

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);

  const paginatedData = useMemo(() => {
    return data.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
        <Users className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">{t('admin.staffModule.empty')}</h3>
        <p className="text-slate-500">{t('admin.staffModule.emptyDesc')}</p>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case ROLE.ADMIN:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{t(`admin.staffModule.roles.${ROLE.ADMIN}`)}</span>;
      case ROLE.CASHIER:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{t(`admin.staffModule.roles.${ROLE.CASHIER}`)}</span>;
      case ROLE.KITCHEN:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">{t(`admin.staffModule.roles.${ROLE.KITCHEN}`)}</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{role}</span>;
    }
  };

  const getRoleAvatarColor = (role: string) => {
    switch (role) {
      case ROLE.ADMIN: return 'bg-orange-100 text-primary';
      case ROLE.CASHIER: return 'bg-blue-100 text-blue-600';
      case ROLE.KITCHEN: return 'bg-red-100 text-red-600';
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full w-full">
      <div className="overflow-auto flex-1 relative custom-scrollbar">
        <table className="w-full text-left relative">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.staffModule.table.avatar')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.staffModule.table.fullName')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.staffModule.table.username')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.staffModule.table.role')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('admin.staffModule.table.status')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('admin.staffModule.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedData.map((staff) => (
              <tr key={staff.id} className="hover:bg-slate-100 transition-colors">
                <td className="px-6 py-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRoleAvatarColor(staff.role)}`}>
                    {generateInitials(staff.fullName)}
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900">{staff.fullName}</td>
                <td className="px-6 py-4 text-slate-500">{staff.username}</td>
                <td className="px-6 py-4">{getRoleBadge(staff.role)}</td>
                <td className="px-6 py-4">
                  {staff.active ? (
                    <div className="flex items-center gap-1.5 text-green-600 font-medium whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
                      {t('admin.staffModule.table.statusActive')}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
                      {t('admin.staffModule.table.statusInactive')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                  <button 
                    onClick={() => onEdit(staff)}
                    className="p-2 text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <PencilLine className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleToggle(staff.id)}
                    disabled={toggleStaff.isPending}
                    className={`p-2 transition-colors disabled:opacity-50 ${staff.active ? 'text-slate-400 hover:text-red-500' : 'text-slate-400 hover:text-primary'}`}
                    title={staff.active ? t('admin.staffModule.table.lockAccount', 'Khoá tài khoản') : t('admin.staffModule.table.unlockAccount', 'Mở khóa tài khoản')}
                  >
                    {staff.active ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalElements={data.length}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(0);
          }}
        />
      )}
    </div>
  );
}
