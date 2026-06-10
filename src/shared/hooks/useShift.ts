import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_ROUTES } from '@/shared/constants/API_ROUTES';
import api from '@/services/interceptor';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/auth.slice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { isAxiosError } from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export const useShift = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);

  const isAdminOrManager = user?.role === 'ADMIN';

  const currentShift = useQuery({
    queryKey: ['current-shift'],
    queryFn: async () => {
      try {
        const response = await api.get<ApiResponse>(API_ROUTES.authAttendance.current);
        return response.data?.data || null;
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          if (err.response?.status === 404) {
            return null; // Có lịch nhưng chưa check-in -> return null để hiện Overlay
          }
          if (err.response?.status === 403) {
            // KHÔNG CÓ LỊCH
            navigate('/unauthorized', { 
              state: { 
                message: err.response.data?.message || 'Bạn không có ca làm việc nào được phân công hôm nay. Vui lòng liên hệ quản lý.'
              }
            });
            return null;
          }
        }
        throw err;
      }
    },
    retry: false,
    enabled: !isAdminOrManager && !!user
  });

  const clockIn = useMutation({
    mutationFn: async () => {
      const response = await api.post<ApiResponse>(API_ROUTES.authAttendance.clockIn, { note: 'System Clock-in' });
      return response.data;
    },
    onSuccess: (data) => {
      // Use message from backend if available, fallback to i18n
      toast.success(data.message || t('shift.clockInSuccess', 'Đã mở ca thành công!'));
      queryClient.invalidateQueries({ queryKey: ['current-shift'] });
    }
  });

  const clockOut = useMutation({
    mutationFn: async (note?: string) => {
      const response = await api.post<ApiResponse>(API_ROUTES.authAttendance.clockOut, { note: note || 'System Clock-out' });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || t('shift.clockOutSuccess', 'Đã kết ca thành công!'));
      dispatch(logoutUser());
      queryClient.clear();
      navigate('/login');
    }
  });

  return { currentShift, clockIn, clockOut, isAdminOrManager, user };
};
