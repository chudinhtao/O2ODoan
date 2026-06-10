import React from 'react';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useAppSelector } from '@/store/hooks';
import { useTranslation } from 'react-i18next';
import { useServerKpi } from '@/pages/server/hooks/useServerData';
import { UtensilsCrossed, Bell, Clock } from 'lucide-react';
import { useShift } from '@/shared/hooks/useShift';
import { format } from 'date-fns';

export const ServerKpiTab: React.FC = () => {
  const { t } = useTranslation();
  const { currentShift } = useShift();
  const startFrom = currentShift.data?.checkIn ? format(new Date(currentShift.data.checkIn), "yyyy-MM-dd'T'HH:mm:ss.SSS") : undefined;
  const { data: kpi, isLoading, isError } = useServerKpi(startFrom);
  const user = useAppSelector(state => state.auth.user);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !kpi) {
    return (
      <div className="text-center py-10 text-on-surface-variant">
        <p>{t('server.kpi_no_data')}</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return t('server.kpi_time_format_s', { s: Math.floor(seconds) });
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return t('server.kpi_time_format_m_s', { m: mins, s: secs });
  };

  return (
    <div className="pb-24 space-y-4">
      <div className="bg-primary text-on-primary p-6 rounded-2xl shadow-sm mb-6">
        <h2 className="text-2xl font-bold">{t('server.kpi_greeting', { name: user?.fullName || 'Nhân viên' })}</h2>
        <p className="opacity-90 mt-1">{t('server.kpi_subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-bright p-5 rounded-xl border border-outline-variant/50 shadow-sm flex flex-col items-center justify-center text-center">
          <UtensilsCrossed className="size-8 mb-2 text-on-surface-variant" />
          <p className="text-3xl font-black text-on-surface">{kpi.totalServed}</p>
          <p className="text-sm font-medium text-on-surface-variant mt-1">{t('server.kpi_served')}</p>
        </div>

        <div className="bg-surface-bright p-5 rounded-xl border border-outline-variant/50 shadow-sm flex flex-col items-center justify-center text-center">
          <Bell className="size-8 mb-2 text-on-surface-variant" />
          <p className="text-3xl font-black text-on-surface">{kpi.totalResolved}</p>
          <p className="text-sm font-medium text-on-surface-variant mt-1">{t('server.kpi_resolved')}</p>
        </div>
      </div>

      <div className="bg-surface-bright p-5 rounded-xl border border-outline-variant/50 shadow-sm flex items-center justify-between mt-4">
        <div>
          <Clock className="size-6 mb-1 text-on-surface-variant" />
          <p className="text-sm font-medium text-on-surface-variant">{t('server.kpi_avg_response')}</p>
        </div>
        <p className="text-2xl font-bold text-primary">{formatTime(kpi.avgResponseSeconds)}</p>
      </div>

      <div className="bg-surface-bright p-5 rounded-xl border border-outline-variant/50 shadow-sm flex items-center justify-between mt-4">
        <div>
          <UtensilsCrossed className="size-6 mb-1 text-on-surface-variant" />
          <p className="text-sm font-medium text-on-surface-variant">{t('server.kpi_avg_delivery', 'Thời gian bưng món trung bình')}</p>
        </div>
        <p className="text-2xl font-bold text-primary">{formatTime(kpi.avgDeliverySeconds)}</p>
      </div>
    </div>
  );
};
