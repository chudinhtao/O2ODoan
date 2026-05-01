import { Suspense } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/slices/auth.slice'
import { clearSession } from '@/store/slices/session.slice'
import { clearCart }    from '@/store/slices/cart.slice'
import { ROUTES } from '@/shared/constants/ROUTES'
import { queryClient } from '@/providers/AppProviders'
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle'

export default function PosLayout() {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()


  const isActive = (path: string) => location.pathname.includes(path)

  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearSession())
    dispatch(clearCart())
    queryClient.clear()
    navigate(ROUTES.login)
  }



  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* 1. Left Sidebar (Stitch UI) */}
      <aside className="w-[80px] bg-white border-r border-slate-200 flex flex-col items-center py-6 shrink-0 z-50">
        <div className="size-12 rounded-xl bg-[#2463eb] flex items-center justify-center mb-8 shadow-sm">
           <span className="material-symbols-outlined text-white text-2xl">receipt_long</span>
        </div>
        <nav className="flex flex-col w-full">
          <Link to="/pos/tables" className={`w-full flex flex-col items-center justify-center py-4 gap-1 relative group transition-all
            ${isActive('/pos/tables') ? 'border-l-4 border-[#2463eb] bg-[#2463eb]/5 text-[#2463eb]' : 'border-l-4 border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined text-[24px]">grid_view</span>
            <span className="text-[10px] font-black uppercase tracking-wider">Tables</span>
          </Link>
          <Link to="/pos/takeaways" className={`w-full flex flex-col items-center justify-center py-4 gap-1 relative group transition-all
            ${isActive('/pos/takeaways') ? 'border-l-4 border-[#2463eb] bg-[#2463eb]/5 text-[#2463eb]' : 'border-l-4 border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Takeaway</span>
          </Link>
          <Link to="/pos/orders/new" className={`w-full flex flex-col items-center justify-center py-4 gap-1 relative group transition-all
            ${isActive('/pos/orders') ? 'border-l-4 border-[#2463eb] bg-[#2463eb]/5 text-[#2463eb]' : 'border-l-4 border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined text-[24px]">point_of_sale</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Sales</span>
          </Link>
          <Link to="/pos/reports" className={`w-full flex flex-col items-center justify-center py-4 gap-1 relative group transition-all
            ${isActive('/pos/reports') ? 'border-l-4 border-[#2463eb] bg-[#2463eb]/5 text-[#2463eb]' : 'border-l-4 border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined text-[24px]">bar_chart</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Reports</span>
          </Link>
        </nav>
        <div className="mt-auto w-full flex flex-col items-center gap-4">
          <LanguageToggle variant="plain" />
          <button onClick={handleLogout} className="w-full flex flex-col items-center justify-center py-4 text-slate-400 hover:text-red-600 hover:bg-red-50 gap-1 transition-all">
            <span className="material-symbols-outlined text-[24px]">logout</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Area */}
      <main className="flex-1 flex flex-col min-w-0">


        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ErrorBoundary>
            <Suspense fallback={<PosPageSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}

function PosPageSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full bg-surface-variant/20 p-4 gap-4">
      {/* Top Header/Filter Skeleton */}
      <header className="h-14 bg-surface rounded-xl border border-outline-variant flex items-center px-4">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="ml-auto w-32 h-8 rounded-md" />
      </header>
      
      {/* 2-Column POS Layout Skeleton */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Left: Main Content (Tables/Menu) */}
        <div className="flex-1 bg-surface rounded-xl border border-outline-variant p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
             <Skeleton className="h-5 w-32 rounded" />
             <div className="flex gap-2">
               <Skeleton className="h-8 w-16 rounded-lg" />
               <Skeleton className="h-8 w-16 rounded-lg" />
             </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
             {[...Array(15)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
             ))}
          </div>
        </div>
        
        {/* Right: Order Cart */}
        <div className="w-full md:w-[340px] bg-surface rounded-xl border border-outline-variant p-4 flex flex-col gap-4 shrink-0">
           <Skeleton className="h-6 w-full rounded-md mb-2" />
           <div className="flex-1 flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                 <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
           </div>
           <div className="mt-auto border-t border-outline-variant/30 pt-4 space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-6 w-1/2 rounded mb-4" />
              <Skeleton className="h-12 w-full rounded-xl" />
           </div>
        </div>
      </div>
    </div>
  )
}
