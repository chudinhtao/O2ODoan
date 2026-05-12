import React from 'react';
import { usePendingDeliveries } from '@/pages/server/hooks/useServerData';
import { DeliveryCard } from '@/pages/server/components/DeliveryCard';
import { TicketDeliveryDto } from '@/pages/server/types/server.types';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

interface ServerDeliveryTabProps {
  selectedZones: string[];
}

export const ServerDeliveryTab: React.FC<ServerDeliveryTabProps> = ({ selectedZones }) => {
  const { t } = useTranslation();
  const { data: deliveries, isLoading, isError } = usePendingDeliveries(selectedZones);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
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

  if (!deliveries || deliveries.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-4">
          <Sparkles className="size-10 text-on-surface-variant" />
        </div>
        <h3 className="text-xl font-bold text-on-surface">{t('server.empty_delivery_title')}</h3>
        <p className="text-on-surface-variant mt-2">{t('server.empty_delivery_desc')}</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {deliveries.map((delivery: TicketDeliveryDto) => (
        <DeliveryCard key={delivery.tableId} delivery={delivery} />
      ))}
    </div>
  );
};
