import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { serverApiService } from '../services/serverApiService';
import type { ServeItemsRequest } from '../types/server.types';

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
  });
};

export const useActiveCalls = (zones: string[]) => {
  return useQuery({
    queryKey: ['server', 'calls', zones],
    queryFn: () => serverApiService.getActiveCalls(zones),
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
  });
};

export const useClaimDeliveryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ServeItemsRequest) => serverApiService.claimDelivery(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', 'deliveries'] });
    },
  });
};

export const useUnclaimDeliveryMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ServeItemsRequest) => serverApiService.unclaimDelivery(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', 'deliveries'] });
    },
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
  });
};

export const useAcceptCallMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ callId, userName }: { callId: string; userName?: string }) =>
      serverApiService.acceptCall(callId, userName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', 'calls'] });
    },
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
  });
};
