import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector }   from '@/store/hooks'
import type { IRole }       from '@/shared/constants/ROLE'
import { ROUTES }           from '@/shared/constants/ROUTES'

interface ProtectedRouteProps {
  allowedRoles?: IRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { accessToken, role } = useAppSelector(s => s.auth)

  if (!accessToken) return <Navigate to={ROUTES.login} replace />
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.unauthorized} replace />
  }

  return <Outlet />
}

