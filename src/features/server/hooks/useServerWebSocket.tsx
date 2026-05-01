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
        
        // Haptic feedback (Vibrate)
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200, 100, 400]); // Cảnh báo đỏ
        }
        
        // Play sound
        const audio = new Audio('/sounds/alert.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));

        if (payload.cancelledItems) {
          toast.error(t('server.alert_cancel', { number: payload.tableNumber }), { duration: 8000, icon: <AlertOctagon className="size-5 text-white" /> });
        } else {
          toast(t('server.alert_urgent'), { icon: <AlertTriangle className="size-5 text-red-500" />, duration: 5000 });
        }
        
        queryClient.invalidateQueries({ queryKey: ['server', 'deliveries'] });
        queryClient.invalidateQueries({ queryKey: ['server', 'calls'] });
      } catch (err) {
        console.error('Lỗi parse websocket message', err);
      }
    });

    // Lắng nghe cập nhật Khay Đồ (chỉ nhận event khi món Nấu xong hoặc đã Bưng)
    const unsubscribeDeliveries = subscribe('/topic/server/deliveries', () => {
       queryClient.invalidateQueries({ queryKey: ['server', 'deliveries'] });
       queryClient.invalidateQueries({ queryKey: ['server', 'kpi'] });
    });

    // Lắng nghe cập nhật Gọi Hỗ Trợ
    const unsubscribeCalls = subscribe('/topic/staff/calls', () => {
       queryClient.invalidateQueries({ queryKey: ['server', 'calls'] });
       queryClient.invalidateQueries({ queryKey: ['server', 'kpi'] });
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
