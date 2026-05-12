import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/pages/auth/services/auth.service'
import { ROUTES } from '@/shared/constants/ROUTES'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logout, setCredentials } from '@/store/slices/auth.slice'

export function useSessionGuard() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const accessToken = useAppSelector(s => s.auth.accessToken)
  const refreshToken = useAppSelector(s => s.auth.refreshToken)

  useEffect(() => {
    if (!accessToken) return

    authService.getMe()
      .then(user => {
        dispatch(setCredentials({
          user,
          accessToken,
          refreshToken: refreshToken ?? '',
        }))
      })
      .catch(() => {
        dispatch(logout())
        navigate(ROUTES.login, { replace: true })
      })
  }, [accessToken, dispatch, navigate, refreshToken])
}
