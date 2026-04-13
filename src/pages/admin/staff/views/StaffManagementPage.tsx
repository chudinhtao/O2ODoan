import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Users, CheckCircle2, UserSquare2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { SkeletonTable } from '@/shared/components/ui/Skeleton';
import { useGetStaffList } from '../hooks/useStaff';
import { StaffTable } from '../components/StaffTable';
import { StaffFormModal } from '../components/StaffFormModal';
import { IStaff, ROLE } from '../types/adminStaff.type';
import { Skeleton } from '@/shared/components/ui/Skeleton';

export default function StaffManagementPage() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<IStaff | null>(null);

  // Pagination disabled for now per simple layout, or could use URL params
  const { data, isLoading } = useGetStaffList();

  const stats = useMemo(() => {
    if (!data) return { total: 0, active: 0, roles: { admin: 0, cashier: 0, kitchen: 0 } };
    let roles = { admin: 0, cashier: 0, kitchen: 0 };
    let active = 0;

    data.forEach(s => {
      if (s.active) active++;
      if (s.role === ROLE.ADMIN) roles.admin++;
      else if (s.role === ROLE.CASHIER) roles.cashier++;
      else if (s.role === ROLE.KITCHEN) roles.kitchen++;
    });

    return { total: data.length, active, roles };
  }, [data]);

  const handleOpenModal = (staff?: IStaff) => {
    setSelectedStaff(staff || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStaff(null);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-surface-dim flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold font-display text-on-surface hidden md:block">{t('admin.staffModule.title')}</h2>
        </div>

        <Button onClick={() => handleOpenModal()} className="!px-4 !py-2 !rounded-xl !text-sm">
          <Plus className="w-[18px] h-[18px] mr-1" />
          <span className="hidden sm:inline">{t('admin.staffModule.addNew')}</span>
        </Button>
      </header>

      <div className="flex-1 flex flex-col min-h-0 w-full relative">
      {/* Stats Row */}
      <div className="shrink-0 px-4 md:px-6 pt-4 mb-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('admin.staffModule.stats.total')}</p>
              <p className="text-xl font-bold text-slate-900">{stats.total} {t('admin.staffModule.stats.totalSuffix')}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('admin.staffModule.stats.active')}</p>
              <p className="text-xl font-bold text-slate-900">{stats.active} {t('admin.staffModule.stats.activeSuffix')}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
              <UserSquare2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('admin.staffModule.stats.roleDistribution')}</p>
              <p className="text-sm font-bold text-slate-900 line-clamp-2">
                {stats.roles.admin} {t('admin.staffModule.roles.ADMIN')} · {stats.roles.cashier} {t('admin.staffModule.roles.CASHIER')} · {stats.roles.kitchen} {t('admin.staffModule.roles.KITCHEN')}
              </p>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Table Section */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-4 md:px-6 pb-6">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex-1">
            <SkeletonTable rows={10} cols={7} />
          </div>
        ) : (
          <StaffTable 
            data={data || []} 
            onEdit={handleOpenModal} 
          />
        )}
      </div>

      </div>
      
      <StaffFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        staffData={selectedStaff}
      />
    </>
  );
}
