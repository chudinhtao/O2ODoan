import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { useAppDispatch } from '@/store/hooks'
import { setCredentials } from '@/store/slices/auth.slice'
import { ROLE } from '@/shared/constants/ROLE'
import { ROUTES } from '@/shared/constants/ROUTES'
import { authService, type ILoginPayload } from '../services/auth.service'
import type { IApiResponse } from '@/shared/types/IApiResponse'
import api from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import { isAxiosError } from 'axios'

const ROLE_REDIRECT: Record<string, string> = {
  [ROLE.ADMIN]:   ROUTES.admin.dashboard,
  [ROLE.CASHIER]: ROUTES.pos.tables,
  [ROLE.KITCHEN]: ROUTES.kds,
  [ROLE.SERVER]:  ROUTES.server,
}

export function useLogin() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: ILoginPayload) => {
      const loginRes = await authService.login(data);
      const { accessToken, role } = loginRes;

      let nextRoute = ROLE_REDIRECT[role] ?? ROUTES.login;
      let stateMsg = null;

      if (role !== ROLE.ADMIN) {
        try {
          const shiftRes = await api.get<IApiResponse<any>>(API_ROUTES.authAttendance.current, {
            headers: { 
              Authorization: `Bearer ${accessToken}`,
              'X-Skip-Global-Toast': 'true'
            }
          });
          
          // Nếu backend trả về 200 OK nhưng không có dữ liệu ca làm việc (null/empty),
          // nghĩa là có lịch nhưng chưa mở ca -> phải nhảy sang trang clock-in
          const isEmptyShift = !shiftRes.data?.data;
          if (isEmptyShift) {
            nextRoute = '/shift/clock-in';
          }
          // Ngược lại nếu có dữ liệu -> 200 OK -> keep target pos/kds route
        } catch (err: unknown) {
          if (isAxiosError(err)) {
            if (err.response?.status === 404) {
              nextRoute = '/shift/clock-in';
            } else if (err.response?.status === 403) {
              nextRoute = '/unauthorized';
              stateMsg = err.response.data?.message || 'Bạn không có ca làm việc nào được phân công hôm nay.';
            }
          }
        }
      }
      return { loginRes, nextRoute, stateMsg };
    },
    onSuccess: ({ loginRes, nextRoute, stateMsg }) => {
      const { accessToken, refreshToken, fullName, role, id, username } = loginRes;

      const user = {
        id:       id       ?? '',
        username: username ?? '',
        fullName,
        role,
        active: true,
      }

      dispatch(setCredentials({ user, accessToken, refreshToken }))
      
      if (stateMsg) {
        navigate(nextRoute, { state: { message: stateMsg } })
      } else {
        navigate(nextRoute)
      }
    },
    // interceptor.ts đã toast lỗi 400/401/500 toàn cục.
    // onError chỉ xử lý trường hợp ECONNABORTED (timeout) không có response
    onError: (err: AxiosError<IApiResponse<null>>) => {
      if (!err.response) {
        // Lỗi mạng tức thời (offline/timeout) — interceptor không bắt được
        void err // đã được interceptor toast qua ECONNABORTED check
      }
    },
  })
}
