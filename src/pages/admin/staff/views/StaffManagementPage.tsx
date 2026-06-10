import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, ClipboardCheck, UserCircle } from 'lucide-react';
import StaffScheduler from '../components/StaffScheduler';
import ShiftTemplateManager from '../components/ShiftTemplateManager';
import AttendanceTable from '../components/AttendanceTable';
import StaffListTab from '../components/StaffListTab';
import { Select } from '@/shared/components/ui/Select';
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader';

import { AttendanceSummaryTable } from '../components/AttendanceSummaryTable';
import { Calculator } from 'lucide-react';

const TABS = [
  { key: 'list', icon: UserCircle, labelKey: 'admin.staffModule.title' },
  { key: 'scheduler', icon: Calendar, labelKey: 'admin.staff.tabs.scheduler' },
  { key: 'shifts', icon: Clock, labelKey: 'admin.staff.tabs.shifts' },
  { key: 'attendance', icon: ClipboardCheck, labelKey: 'admin.staff.tabs.attendance' },
  { key: 'summary', icon: Calculator, labelKey: 'admin.staff.tabs.summary' }
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function StaffManagementPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('list');

  return (
    <div className="flex flex-col h-full overflow-hidden bg-surface">
      <AdminPageHeader
        title={t('admin.staff.title', 'Quản lý Nhân sự')}
        description={t('admin.staff.description', 'Quản lý nhân sự, ca làm việc và chấm công')}
        actions={
          <div className="w-48">
            <Select
              value={activeTab}
              onChange={(e: any) => setActiveTab(e.target.value as TabKey)}
              options={TABS.map(tab => ({
                value: tab.key,
                label: t(tab.labelKey)
              }))}
              className="!py-2 bg-slate-50 border-slate-200 font-semibold"
            />
          </div>
        }
      />

      {/* Tab content */}
      <div className="flex-1 min-h-0 flex flex-col px-4 py-4">
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === 'list' && <StaffListTab />}
          {activeTab === 'scheduler' && <StaffScheduler />}
          {activeTab === 'shifts' && <ShiftTemplateManager />}
          {activeTab === 'attendance' && <AttendanceTable />}
          {activeTab === 'summary' && (
            <div className="p-6 flex-1 flex flex-col min-h-0">
              <h3 className="text-xl font-bold mb-4 shrink-0">{t('admin.staff.summary.title')}</h3>
              <AttendanceSummaryTable currentDate={new Date()} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
