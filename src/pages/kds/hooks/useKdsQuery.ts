import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import httpClient from '@/services/interceptor';
import type { IKdsTicket } from '../types/kds.type';
import { getSuccessMessage } from '@/shared/utils/apiResponse';

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
      const res = await httpClient.put<{ message?: string }>(`kds/items/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kds-active-tickets'] });
    },
  });

  const updateTicketStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await httpClient.put<{ message?: string }>(`/kds/tickets/${id}/status`, { status });
      return res.data;
    },
    onSuccess: (res, variables) => {
      if (variables.status === 'DONE') {
        toast.success(getSuccessMessage(res.message, t('kds.notifications.markTicketDone', { number: '*' })));
      }
      queryClient.invalidateQueries({ queryKey: ['kds-active-tickets'] });
    },
  });

  const cancelOrderItem = useMutation({
    mutationFn: async ({ orderId, itemId, reason }: { orderId: string, itemId: string, reason: string }) => {
      const res = await httpClient.patch<{ message?: string }>(`/orders/${orderId}/items/${itemId}/cancel`, { reason });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('kds.notifications.cancelItemSuccess', 'Đã từ chối món và trừ tiền đơn hàng thành công')));
      queryClient.invalidateQueries({ queryKey: ['kds-active-tickets'] });
    },
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
