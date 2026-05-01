import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { useAppDispatch } from '@/store/hooks'
import { setCredentials } from '@/store/slices/auth.slice'
import { ROLE } from '@/shared/constants/ROLE'
import { ROUTES } from '@/shared/constants/ROUTES'
import { authService, type ILoginPayload } from '../services/auth.service'
import type { IApiResponse } from '@/shared/types/IApiResponse'

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
    mutationFn: (data: ILoginPayload) => authService.login(data),
    onSuccess: (data) => {
      const { accessToken, refreshToken, fullName, role, id, username } = data

      const user = {
        id:       id       ?? '',
        username: username ?? '',
        fullName,
        role,
        active: true,
      }

      dispatch(setCredentials({ user, accessToken, refreshToken }))
      navigate(ROLE_REDIRECT[role] ?? ROUTES.login)
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
