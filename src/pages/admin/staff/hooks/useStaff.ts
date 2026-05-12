import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminStaffService } from '../services/staffService';
import { ICreateStaffRequest, IUpdateStaffRequest } from '../types/adminStaff.type';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const getSuccessMessage = (message: string | undefined, fallback: string) => message && message !== 'Success' ? message : fallback;

export const ADMIN_STAFF_KEYS = {
  all: ['admin-staff'] as const,
  list: (params: any) => [...ADMIN_STAFF_KEYS.all, 'list', params] as const,
};

export const useGetStaffList = (params?: { keyword?: string; role?: string; active?: boolean; }) => {
  return useQuery({
    queryKey: ADMIN_STAFF_KEYS.list(params),
    queryFn: () => adminStaffService.getStaffList(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: ICreateStaffRequest) => adminStaffService.createStaff(payload),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.staffModule.createSuccess')));
      queryClient.invalidateQueries({ queryKey: ADMIN_STAFF_KEYS.all });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: IUpdateStaffRequest }) => adminStaffService.updateStaff(id, payload),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.staffModule.updateSuccess')));
      queryClient.invalidateQueries({ queryKey: ADMIN_STAFF_KEYS.all });
    },
  });
};

export const useToggleStaff = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => adminStaffService.toggleStaffStatus(id),
    onSuccess: (res) => {
      toast.success(getSuccessMessage(res.message, t('admin.staffModule.toggleSuccess')));
      queryClient.invalidateQueries({ queryKey: ADMIN_STAFF_KEYS.all });
    },
  });
};
