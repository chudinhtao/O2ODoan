import React from 'react';
import { useActiveCalls } from '@/pages/server/hooks/useServerData';
import { StaffCallCard } from '@/pages/server/components/StaffCallCard';
import { StaffCallResponse } from '@/pages/server/types/server.types';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';

interface ServerStaffCallTabProps {
  selectedZones: string[];
}

export const ServerStaffCallTab: React.FC<ServerStaffCallTabProps> = ({ selectedZones }) => {
  const { t } = useTranslation();
  const { data: calls, isLoading, isError } = useActiveCalls(selectedZones);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 bg-error-container text-on-error-container rounded-xl">
        <p className="font-semibold">{t('server.loading_error')}</p>
      </div>
    );
  }

  if (!calls || calls.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-4 text-success">
          <CheckCircle2 className="size-10" />
        </div>
        <h3 className="text-xl font-bold text-on-surface">{t('server.empty_calls_title')}</h3>
        <p className="text-on-surface-variant mt-2">{t('server.empty_calls_desc')}</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {calls.map((call: StaffCallResponse) => (
        <StaffCallCard key={call.id} call={call} />
      ))}
    </div>
  );
};
