import { useQuery } from '@tanstack/react-query';
import StaffService from '../services/staff.service';

export const useAttendance = (from: string, to?: string) => {
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['attendance-logs', from, to],
    queryFn: () => StaffService.getAttendanceLogs(from, to),
    enabled: !!from,
  });

  return {
    logs,
    isLoading,
    refetch
  };
};
