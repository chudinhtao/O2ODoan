import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StaffService from '../services/staff.service';
import { toast } from 'sonner';
import i18n from 'i18next';

export const useSchedules = (from: string, to: string) => {
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['work-schedules', from, to],
    queryFn: () => StaffService.getSchedules(from, to),
    enabled: !!from && !!to,
  });

  const assignShiftMutation = useMutation({
    mutationFn: StaffService.assignShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-schedules'] });
      toast.success(i18n.t('admin.staff.assign_success', 'Gán ca làm việc thành công'));
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || i18n.t('admin.staff.assign_error', 'Không thể gán ca');
      toast.error(message);
    }
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: StaffService.deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-schedules'] });
      toast.success(i18n.t('admin.staff.delete_schedule_success', 'Đã huỷ lịch làm việc'));
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || i18n.t('admin.staff.delete_schedule_error', 'Không thể huỷ lịch');
      toast.error(message);
    }
  });

  return {
    schedules,
    isLoading,
    assignShift: assignShiftMutation.mutate,
    isAssigning: assignShiftMutation.isPending,
    deleteSchedule: deleteScheduleMutation.mutate,
    isDeleting: deleteScheduleMutation.isPending
  };
};
