import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serverApiService } from '../services/serverApiService';
import { ServeItemsRequest } from '../types/server.types';
import { toast } from 'sonner';

export const useServerZones = () => {
  return useQuery({
    queryKey: ['server', 'zones'],
    queryFn: () => serverApiService.getDistinctZones(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePendingDeliveries = (zones: string[]) => {
  return useQuery({
    queryKey: ['server', 'deliveries', zones],
    queryFn: () => serverApiService.getPendingDeliveries(zones),
    // Đã xóa refetchInterval: 10000 vì chúng ta dùng WebSocket Real-time
  });
};

export const useActiveCalls = (zones: string[]) => {
  return useQuery({
    queryKey: ['server', 'calls', zones],
    queryFn: () => serverApiService.getActiveCalls(zones),
    // Đã xóa refetchInterval: 10000 vì chúng ta dùng WebSocket Real-time
  });
};

export const useServerKpi = () => {
  return useQuery({
    queryKey: ['server', 'kpi'],
    queryFn: () => serverApiService.getKpiToday(),
    refetchInterval: 60000,
  });
};

export const useServeItemsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ServeItemsRequest) => serverApiService.serveItems(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', 'deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['server', 'kpi'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể phục vụ món');
    }
  });
};

export const useUnserveItemsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ServeItemsRequest) => serverApiService.unserveItems(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', 'deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['server', 'kpi'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể Undo');
    }
  });
};

export const useAcceptCallMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ callId, userName }: { callId: string; userName?: string }) => serverApiService.acceptCall(callId, userName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', 'calls'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể tiếp nhận yêu cầu');
    }
  });
};

export const useResolveCallMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (callId: string) => serverApiService.resolveCall(callId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', 'calls'] });
      queryClient.invalidateQueries({ queryKey: ['server', 'kpi'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Không thể hoàn thành yêu cầu');
    }
  });
};
