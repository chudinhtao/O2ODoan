import { useQuery } from '@tanstack/react-query';
import http from '@/services/interceptor';
import { API_ROUTES } from '@/shared/constants/API_ROUTES';
import type { IApiResponse } from '@/shared/types/IApiResponse';
import type { IAttendanceSummary } from '../types/staff.type';

export function useAttendanceSummary(from: string, to?: string) {
  return useQuery({
    queryKey: ['attendance-summary', from, to],
    queryFn: async () => {
      const res = await http.get<IApiResponse<IAttendanceSummary[]>>(API_ROUTES.adminStaff.attendanceSummary, {
        params: { from, to: to || from }
      });
      const items = res.data.data || [];
      return items.map(i => ({ ...i, id: i.userId }));
    },
    enabled: !!from,
  });
}
