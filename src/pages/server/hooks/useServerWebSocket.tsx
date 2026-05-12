import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketCtx } from '@/contexts/WebSocketContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AlertOctagon, AlertTriangle } from 'lucide-react';

export const useServerWebSocket = () => {
  const queryClient = useQueryClient();
  const { isConnected, subscribe } = useWebSocketCtx();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isConnected) return;

    // Lắng nghe alerts chung (Cancel Alert & Spillover)
    const unsubscribeAlerts = subscribe('/topic/server/alerts', (message: string) => {
      try {
        const payload = JSON.parse(message);
        
        const isUrgent = payload.cancelledItems || payload.urgentItemIds || payload.pendingSeconds || payload.urgencyLevel === 'CRITICAL' || payload.urgencyLevel === 'WARNING';
        const isNewItem = payload.urgencyLevel === 'NEW_ITEM';
        
        if (isUrgent || isNewItem) {
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 400]);
          }
          const audio = new Audio('/sounds/alert.mp3');
          audio.play().catch(() => {});
        }

        if (payload.cancelledItems) {
          toast.error(t('server.alert_cancel', { number: payload.tableNumber }), { duration: 8000, icon: <AlertOctagon className="size-5 text-white" /> });
        } else if (isUrgent) {
          // Chuông đỏ (Spillover/Radar)
          toast(payload.message || t('server.alert_urgent'), { icon: <AlertTriangle className="size-5 text-red-500" />, duration: 5000 });
        } else if (isNewItem) {
          // Chuông xanh (Có món mới vừa ra lò)
          toast.success(payload.message || `Bàn ${payload.tableNumber} có món mới xong!`, { duration: 4000 });
        }
        
        queryClient.invalidateQueries({ queryKey: ['server', 'deliveries'] });
        queryClient.invalidateQueries({ queryKey: ['server', 'calls'] });
      } catch (e) {
        console.error("Error parsing alert message", e);
      }
    });

    // Lắng nghe cập nhật Khay Đồ (chỉ nhận event khi món Nấu xong hoặc đã Bưng)
    const unsubscribeDeliveries = subscribe('/topic/server/deliveries', (msg) => {
       console.log("WebSocket received delivery update:", msg);
       setTimeout(() => {
         queryClient.invalidateQueries({ queryKey: ['server', 'deliveries'] });
         queryClient.invalidateQueries({ queryKey: ['server', 'kpi'] });
       }, 500); // Thêm 500ms để chờ Backend DB Transaction commit xong
    });

    // Lắng nghe cập nhật Gọi Hỗ Trợ
    const unsubscribeCalls = subscribe('/topic/staff/calls', () => {
       setTimeout(() => {
         queryClient.invalidateQueries({ queryKey: ['server', 'calls'] });
         queryClient.invalidateQueries({ queryKey: ['server', 'kpi'] });
       }, 500);
    });

    return () => {
      unsubscribeAlerts?.unsubscribe();
      unsubscribeDeliveries?.unsubscribe();
      unsubscribeCalls?.unsubscribe();
    };
  }, [isConnected, subscribe, queryClient, t]);

  // Hook Network Auto-Sync
  useEffect(() => {
    const handleOnline = () => {
      toast.success(t('server.sync_success'), { id: 'network-sync' });
      queryClient.invalidateQueries({ queryKey: ['server', 'deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['server', 'calls'] });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queryClient, t]);
};
