import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/ROUTES'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/auth.slice'
import { clearSession } from '@/store/slices/session.slice'
import { clearCart }    from '@/store/slices/cart.slice'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { queryClient } from '@/providers/AppProviders'
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle'
import { AdminChatWidget } from '@/pages/admin/chat/components/AdminChatWidget'
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  TicketPercent, 
  Table, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  LogOut,
  Settings
} from 'lucide-react'

const getNavItems = (t: (key: string) => string) => [
  { path: ROUTES.admin.dashboard,  icon: LayoutDashboard, label: t('admin.nav.dashboard') },
  { path: ROUTES.admin.menu,       icon: UtensilsCrossed, label: t('admin.nav.menu') },
  { path: ROUTES.admin.promotions, icon: TicketPercent,   label: t('admin.nav.promotions') },
  { path: ROUTES.admin.tables,     icon: Table,           label: t('admin.nav.tables') },
  { path: ROUTES.admin.staff,      icon: Users,           label: t('admin.nav.staff') },
  { path: ROUTES.admin.orders,     icon: ClipboardList,   label: t('admin.nav.orders') },
  { path: ROUTES.admin.reports,    icon: TrendingUp,      label: t('admin.nav.reports') },
  { path: ROUTES.admin.settings,   icon: Settings,        label: t('admin.nav.settings') || 'Cài đặt' },
]

export function AdminLayout() {
  const { t } = useTranslation()
  const navItems = getNavItems(t)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearSession())
    dispatch(clearCart())
    queryClient.clear()
    navigate(ROUTES.login)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 text-on-surface font-display">
      {/* Desktop Sidebar */}
      <aside className="w-[72px] bg-primary text-on-primary hidden md:flex flex-col items-center py-4 shrink-0 h-full z-50">
        {/* Logo Placeholder */}
        <div className="w-9 h-9 bg-surface rounded-md mb-5 flex items-center justify-center flex-shrink-0 text-primary font-bold shadow-sm">
          <span className="material-symbols-outlined text-[20px]">local_cafe</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1 w-full items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex justify-center w-full focus:outline-none"
            >
              {({ isActive }) => (
                <div
                  className={`flex flex-col items-center justify-center w-[58px] h-[52px] rounded-md transition-all ${
                    isActive
                      ? 'bg-surface shadow-sm'
                      : 'hover:bg-on-primary/10'
                  }`}
                >
                  <item.icon
                    size={20}
                    className={`mb-0.5 ${
                      isActive ? 'text-primary' : 'text-on-primary/60'
                    }`}
                  />
                  <span
                    className={`text-[9px] uppercase tracking-wide text-center leading-tight px-0.5 font-headline ${
                      isActive ? 'font-bold text-primary' : 'font-medium text-on-primary/70'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col items-center gap-4 pt-4 pb-3">
          <LanguageToggle variant="plain" className="text-on-primary/60 hover:text-on-primary" />
          
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="text-on-primary/60 hover:text-on-primary transition-colors hover:scale-110 active:scale-95"
            title={t('admin.logout')}
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden pb-16 md:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<AdminPageSkeleton />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <nav className="fixed bottom-0 w-full h-16 bg-surface border-t border-outline-variant flex md:hidden items-stretch z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-all ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'} />
                <span className={`text-[8px] uppercase mt-0.5 leading-tight text-center truncate w-full px-0.5 ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {/* Divider */}
        <div className="w-px bg-outline-variant/40 my-3 flex-shrink-0" />

        {/* Language */}
        <div className="flex flex-col items-center justify-center px-2">
          <LanguageToggle variant="plain" />
          <span className="text-[8px] uppercase font-bold text-outline">{t('common.language', 'Language')}</span>
        </div>

        {/* Divider */}
        <div className="w-px bg-outline-variant/40 my-3 flex-shrink-0" />

        {/* Logout */}
        <button
          id="admin-logout-mobile-btn"
          onClick={handleLogout}
          className="flex-1 min-w-0 h-full flex flex-col items-center justify-center gap-0.5 text-on-surface-variant hover:text-danger transition-colors"
          title={t('admin.logout')}
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-[8px] uppercase font-medium mt-0.5 truncate">{t('admin.logout')}</span>
        </button>
      </nav>

      {/* Admin AI Chat Widget */}
      <AdminChatWidget />
    </div>
  )
}

function AdminPageSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full animate-pulse">
      {/* Header Skeleton */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-10 bg-slate-200 rounded-lg w-32" />
      </header>
      
      {/* Content Skeleton */}
      <div className="flex-1 p-8 space-y-8">
        {/* Tabs Skeleton */}
        <div className="flex gap-4 border-b border-slate-200 pb-4">
          <div className="h-6 w-24 bg-slate-200 rounded" />
          <div className="h-6 w-24 bg-slate-200 rounded" />
          <div className="h-6 w-32 bg-slate-200 rounded" />
        </div>
        
        {/* Filter Row Skeleton */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex gap-4">
            <div className="h-10 w-64 bg-slate-100 rounded-lg" />
            <div className="h-10 w-40 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-10 w-48 bg-slate-100 rounded-lg" />
        </div>
        
        {/* Table Skeleton */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden space-y-4 p-4">
          <div className="h-10 bg-slate-50 w-full mb-4" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 items-center border-b border-slate-200 pb-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-4 bg-slate-100 rounded w-16" />
              <div className="h-4 bg-slate-100 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
