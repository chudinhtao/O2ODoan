import React, { useState } from 'react';
import { TicketDeliveryDto, DeliveryItem } from '../types/server.types';
import { useServeItemsMutation, useUnserveItemsMutation, useClaimDeliveryMutation, useUnclaimDeliveryMutation } from '../hooks/useServerData';
import { StationBadge } from '@/shared/components/ui/StationBadge';
import { Button } from '@/shared/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DeliveryCardProps {
  delivery: TicketDeliveryDto;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({ delivery }) => {
  const { t } = useTranslation();
  const { tableNumber, zone, items } = delivery;
  const serveMutation = useServeItemsMutation();
  const unserveMutation = useUnserveItemsMutation();
  const claimMutation = useClaimDeliveryMutation();
  const unclaimMutation = useUnclaimDeliveryMutation();
  
  // Local state to handle optimistic UI and undo window
  const [servedItems, setServedItems] = useState<string[]>([]);
  const [showUndo, setShowUndo] = useState(false);

  const hasUrgent = items.some((i: DeliveryItem) => i.isUrgent);
  const cardBg = hasUrgent ? 'bg-error-container text-on-error-container border border-error/20' : 'bg-surface-container border border-outline-variant';

  const handleServe = (itemIds: string[]) => {
    serveMutation.mutate({ itemIds }, {
      onSuccess: () => {
        setServedItems(prev => [...prev, ...itemIds]);
        setShowUndo(true);
        toast.success(t('server.served_table_success', { number: tableNumber }), { duration: 30000 }); // Show long enough for Undo
        
        // Hide Undo button after 30 seconds
        setTimeout(() => setShowUndo(false), 30000);
      }
    });
  };

  const handleClaim = (itemIds: string[]) => {
    claimMutation.mutate({ itemIds }, {
      onSuccess: () => {
        toast.success(t('server.claim_success'));
      }
    });
  };

  const handleUnclaim = (itemIds: string[]) => {
    unclaimMutation.mutate({ itemIds }, {
      onSuccess: () => {
        toast.success(t('server.unclaim_success'));
      }
    });
  };

  const handleUndo = (itemIds: string[]) => {
    unserveMutation.mutate({ itemIds }, {
      onSuccess: () => {
        setServedItems(prev => prev.filter(id => !itemIds.includes(id)));
        setShowUndo(false);
        toast.success(t('server.undo_success'));
      }
    });
  };

  // Lọc ra các item chưa được serve (hoặc đã undo)
  const activeItems = items.filter((i: DeliveryItem) => !servedItems.includes(i.itemId));

  if (activeItems.length === 0) {
    if (!showUndo) return null;
    return (
      <div className="bg-surface-container-high p-4 rounded-xl flex items-center justify-between shadow-sm mb-4">
        <div className="min-w-0">
          <p className="font-semibold text-on-surface truncate">{t('server.table', { number: tableNumber })}</p>
          <p className="text-sm text-on-surface-variant truncate">{t('server.served')}</p>
        </div>
        <Button 
          onClick={() => handleUndo(items.map((i: DeliveryItem) => i.itemId))}
          variant="outline"
          size="sm"
          disabled={unserveMutation.isPending}
          className="shrink-0"
        >
          {unserveMutation.isPending ? t('server.processing') : t('server.undo')}
        </Button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-sm overflow-hidden mb-4 transition-colors ${cardBg}`}>
      <div className="p-4 border-b border-outline-variant/30 flex justify-between items-start">
        <div className="min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold truncate">{t('server.table', { number: tableNumber })}</h3>
            {zone && <span className="text-xs bg-surface-dim px-2 py-1 rounded-md text-on-surface-variant font-medium shrink-0">{zone}</span>}
            {hasUrgent && (
              <span className="text-xs bg-error text-on-error px-2 py-1 rounded-md font-bold animate-pulse shrink-0 flex items-center gap-1">
                {t('server.urgent')} <AlertTriangle className="size-3" />
              </span>
            )}
          </div>
          <p className="text-sm opacity-80 mt-1 truncate">{activeItems.length} {t('server.items_to_serve')}</p>
        </div>
        
        {(() => {
          const isDelivering = activeItems.some(i => i.status === 'DELIVERING');
          const isPendingOp = serveMutation.isPending || claimMutation.isPending || unclaimMutation.isPending;
          
          return (
            <div className="flex flex-col gap-2 shrink-0">
              <Button
                onClick={() => isDelivering ? handleServe(activeItems.map((i: DeliveryItem) => i.itemId)) : handleClaim(activeItems.map((i: DeliveryItem) => i.itemId))}
                disabled={isPendingOp}
                variant={isDelivering ? "primary" : "secondary"}
                size="lg"
                className={isDelivering ? 'bg-emerald-600 hover:bg-emerald-700 text-white w-full' : 'w-full'}
              >
                {isPendingOp ? t('server.processing_now') : isDelivering ? t('server.serve_all') : t('server.claim_delivery')}
              </Button>
              {isDelivering && (
                <Button
                  onClick={() => handleUnclaim(activeItems.map((i: DeliveryItem) => i.itemId))}
                  disabled={isPendingOp}
                  variant="outline"
                  size="sm"
                  className="w-full text-error border-error/50 hover:bg-error/10 hover:text-error"
                >
                  {t('server.unclaim_delivery')}
                </Button>
              )}
            </div>
          );
        })()}
      </div>
      
      <div className="divide-y divide-outline-variant/30">
        {activeItems.map((item: DeliveryItem) => (
          <div key={item.itemId} className="p-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-lg bg-surface px-2 py-0.5 rounded-md border border-outline-variant/50">x{item.quantity}</span>
                <span className="font-semibold truncate">{item.itemName}</span>
                {item.deliveryAlertSent && (
                  <span className="ml-1 text-[10px] bg-error text-white px-1.5 py-0.5 rounded font-black animate-pulse flex items-center shrink-0">
                    <AlertTriangle className="size-3 mr-1" /> QUÁ LÂU
                  </span>
                )}
              </div>
              {item.note && (
                <p className="text-sm italic opacity-80 truncate text-error font-medium">{t('server.note', { note: item.note })}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <StationBadge station={item.station as any} />
                <span className="text-xs opacity-70 truncate">
                  {t('server.ready_at', { time: new Date(item.readyAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
