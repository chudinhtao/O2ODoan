import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShieldX } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { ROUTES } from '@/shared/constants/ROUTES'

import { useAppDispatch } from '@/store/hooks'
import { logoutUser } from '@/store/slices/auth.slice'
import { queryClient } from '@/providers/AppProviders'

export default function UnauthorizedPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const customMessage = location.state?.message as string | undefined

  const handleLogout = async () => {
    await dispatch(logoutUser())
    queryClient.clear()
    navigate(ROUTES.login)
  }


  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="text-center max-w-sm space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-error-container flex items-center justify-center">
            <ShieldX className="w-10 h-10 text-error" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-on-surface font-headline">
            {t('auth.unauthorized.title')}
          </h1>
          <p className="text-on-surface-variant text-sm">
            {customMessage || t('auth.unauthorized.description')}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate(-1)}>
            {t('auth.unauthorized.goBack')}
          </Button>
          <button
            onClick={handleLogout}
            className="text-sm text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            {t('auth.unauthorized.changeAccount')}
          </button>
        </div>
      </div>
    </main>
  )
}
