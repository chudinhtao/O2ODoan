import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '@/shared/constants/ROUTES'
import { useAppDispatch } from '@/store/hooks'
import { logoutUser } from '@/store/slices/auth.slice'
import { clearSession } from '@/store/slices/session.slice'
import { clearCart }    from '@/store/slices/cart.slice'
import { Suspense, useState, useEffect } from 'react'
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
  Settings,
  Warehouse,
  MessageSquare,
  CalendarDays
} from 'lucide-react'

const getNavItems = (t: (key: string) => string) => [
  { path: ROUTES.admin.dashboard,  icon: LayoutDashboard, label: t('admin.nav.dashboard') },
  { path: ROUTES.admin.reservations, icon: CalendarDays,   label: t('admin.nav.reservations') },
  { path: ROUTES.admin.menu,       icon: UtensilsCrossed, label: t('admin.nav.menu') },
  { path: ROUTES.admin.promotions, icon: TicketPercent,   label: t('admin.nav.promotions') },
  { path: ROUTES.admin.tables,     icon: Table,           label: t('admin.nav.tables') },
  { path: ROUTES.admin.staff,      icon: Users,           label: t('admin.nav.staff') },
  { path: ROUTES.admin.orders,     icon: ClipboardList,   label: t('admin.nav.orders') },
  { path: ROUTES.admin.reports,    icon: TrendingUp,      label: t('admin.nav.reports') },
  { path: ROUTES.admin.inventory,  icon: Warehouse,       label: t('admin.nav.inventory') },
  { path: ROUTES.admin.settings,   icon: Settings,        label: t('admin.nav.settings') || 'Cài đặt' },
]

export function AdminLayout() {
  const { t } = useTranslation()
  const navItems = getNavItems(t)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleToggle = () => setIsMobileNavOpen(prev => !prev)
    window.addEventListener('toggle-mobile-nav', handleToggle)
    return () => window.removeEventListener('toggle-mobile-nav', handleToggle)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    dispatch(clearSession())
    dispatch(clearCart())
    queryClient.clear()
    navigate(ROUTES.login)
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 text-on-surface font-display relative">
      {/* Mobile Overlay */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[90] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative w-[84px] bg-primary text-on-primary flex flex-col items-center py-2 shrink-0 h-full z-[100] transition-transform duration-300 md:translate-x-0 shadow-2xl md:shadow-none ${
        isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo Placeholder */}
        <div className="w-9 h-9 bg-surface rounded-md mb-2 flex items-center justify-center flex-shrink-0 text-primary font-bold shadow-sm">
          <span className="material-symbols-outlined text-[18px]">local_cafe</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-0 w-full items-center overflow-y-auto overflow-x-hidden no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex justify-center w-full focus:outline-none"
            >
              {({ isActive }) => (
                <div
                  className={`flex flex-col items-center justify-center w-[76px] h-[44px] rounded-md transition-all ${
                    isActive
                      ? 'bg-surface shadow-sm'
                      : 'hover:bg-on-primary/10'
                  }`}
                >
                  <item.icon
                    size={16}
                    className={isActive ? 'text-primary' : 'text-on-primary/60'}
                  />
                  <span
                    className={`text-[8.5px] line-clamp-2 uppercase text-center leading-[1.1] mt-[2px] px-1 font-headline ${
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
        <div className="mt-auto flex flex-col items-center gap-2 pt-2 pb-1">
          <button
            onClick={() => window.dispatchEvent(new Event('toggle-admin-chat'))}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-on-primary flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm relative group"
            title={t('admin.chat', 'Trợ lý AI')}
          >
            <MessageSquare size={16} />
            <span className="absolute top-0 right-0 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondary"></span>
            </span>
          </button>

          <LanguageToggle variant="plain" className="text-on-primary/60 hover:text-on-primary scale-90" />
          
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            className="text-on-primary/60 hover:text-on-primary transition-colors hover:scale-110 active:scale-95 py-1"
            title={t('admin.logout')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <ErrorBoundary>
          <Suspense fallback={<AdminPageSkeleton />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

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
