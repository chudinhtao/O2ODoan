import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StaffService from '../services/staff.service';
import { toast } from 'sonner';
import i18n from 'i18next';
import { ICreateStaffRequest, IUpdateStaffRequest } from '../types/staff.type';

export const useStaff = (params?: { page?: number, size?: number, keyword?: string }) => {
  const { data: staffPage, isLoading, error } = useQuery({
    queryKey: ['staff-profiles', params],
    queryFn: () => StaffService.getAllStaff(params),
  });

  return { staffPage, staff: staffPage?.content || [], isLoading, error };
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ICreateStaffRequest) => StaffService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profiles'] });
      toast.success(i18n.t('admin.staff.create_success', 'Tạo nhân viên thành công'));
    }
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: IUpdateStaffRequest }) => StaffService.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profiles'] });
      toast.success(i18n.t('admin.staff.update_success', 'Cập nhật thành công'));
    }
  });
};

export const useToggleStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => StaffService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profiles'] });
      toast.success(i18n.t('admin.staff.toggle_success', 'Cập nhật trạng thái thành công'));
    }
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => StaffService.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-profiles'] });
      toast.success(i18n.t('admin.staff.delete_success', 'Xóa nhân viên thành công'));
    }
  });
};
