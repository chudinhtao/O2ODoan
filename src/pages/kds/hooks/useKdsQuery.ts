import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import httpClient from '@/services/interceptor';
import { IKdsTicket } from '../types/kds.type';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const useKdsQuery = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const fetchActiveTickets = async (): Promise<IKdsTicket[]> => {
    const res = await httpClient.get('kds/tickets/active');
    return res.data;
  };

  const { data: tickets, isLoading, isError } = useQuery<IKdsTicket[]>({
    queryKey: ['kds-active-tickets'],
    queryFn: fetchActiveTickets,
  });

  const updateItemStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return httpClient.put(`kds/items/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kds-active-tickets'] });
    },
    onError: () => {
      toast.error(t('kds.notifications.error'));
    }
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return httpClient.put(`/kds/tickets/${id}/status`, { status });
    },
    onSuccess: (_, variables) => {
      if (variables.status === 'DONE') {
        toast.success(t('kds.notifications.markTicketDone', { number: '*' })); 
      }
      queryClient.invalidateQueries({ queryKey: ['kds-active-tickets'] });
    },
    onError: () => {
      toast.error(t('kds.notifications.error'));
    }
  });

  // Gọi thẳng qua order-service để khấu trừ tiền của đơn hàng khi bếp từ chối (huỷ món)
  const cancelOrderItem = useMutation({
    mutationFn: async ({ orderId, itemId, reason }: { orderId: string, itemId: string, reason: string }) => {
      return httpClient.patch(`/orders/${orderId}/items/${itemId}/cancel`, { reason });
    },
    onSuccess: () => {
      toast.success('Đã từ chối món và trừ tiền đơn hàng thành công');
      queryClient.invalidateQueries({ queryKey: ['kds-active-tickets'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Không thể huỷ món này');
    }
  });

  return {
    tickets: tickets || [],
    isLoading,
    isError,
    updateItemStatus,
    updateTicketStatus,
    cancelOrderItem
  };
};
