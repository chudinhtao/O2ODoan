import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useWebSocketCtx } from '@/contexts/WebSocketContext';

export const useKdsSocket = () => {
  const queryClient = useQueryClient();
  const { subscribe, isConnected } = useWebSocketCtx();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isConnected) return;

    // 1. Nghe đơn hàng mới
    const subOrders = subscribe('/topic/kds/orders', (message) => {
      queryClient.invalidateQueries({ queryKey: ['kds-active-tickets'] });
      
      try {
        const data = JSON.parse(message);
        if (data.type === 'TICKET_CREATED' || data.items) {
          toast.info(t('kds.notifications.newOrder'), { 
            icon: '🔔',
            className: 'bg-orange-50 font-medium border-orange-500'
          });
        }
      } catch (e) {
        console.error('[KDS] Parse Error:', e);
      }
    });

    // 2. Nghe các cập nhật ticket (hủy món, thay đổi từ POS)
    const subTickets = subscribe('/topic/kds/tickets', () => {
      queryClient.invalidateQueries({ queryKey: ['kds-active-tickets'] });
    });

    return () => {
      subOrders?.unsubscribe();
      subTickets?.unsubscribe();
    };
  }, [isConnected, subscribe, queryClient, t]);

  return { isConnected };
};
