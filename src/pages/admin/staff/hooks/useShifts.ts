import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StaffService from '../services/staff.service';
import { toast } from 'sonner';
import i18n from 'i18next';

export const useShifts = () => {
  const queryClient = useQueryClient();

  const { data: shifts = [], isLoading, error } = useQuery({
    queryKey: ['shift-templates'],
    queryFn: StaffService.getShifts,
  });

  const saveShiftMutation = useMutation({
    mutationFn: StaffService.saveShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      toast.success(i18n.t('admin.staff.save_success', 'Lưu ca làm việc thành công'));
    },
    onError: (err: unknown) => {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || i18n.t('admin.staff.save_error', 'Không thể lưu ca làm việc');
      toast.error(message);
    }
  });

  const deleteShiftMutation = useMutation({
    mutationFn: StaffService.deleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      toast.success(i18n.t('admin.staff.delete_success', 'Xóa ca làm việc thành công'));
    }
  });

  return {
    shifts,
    isLoading,
    error,
    saveShift: saveShiftMutation.mutate,
    isSaving: saveShiftMutation.isPending,
    deleteShift: deleteShiftMutation.mutate,
    isDeleting: deleteShiftMutation.isPending
  };
};
