import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute }  from '@/layouts/ProtectedRoute'
import { AdminLayout }     from '@/layouts/AdminLayout'
import { ROUTES }          from '@/shared/constants/ROUTES'
import { ROLE }            from '@/shared/constants/ROLE'


import PosLayout from '@/layouts/PosLayout'

// ── Lazy-loaded pages (code splitting per role) ──
const LoginPage         = lazy(() => import('@/pages/auth/views/LoginPage'))
const UnauthorizedPage  = lazy(() => import('@/pages/auth/views/UnauthorizedPage'))
const PosTableMapPage   = lazy(() => import('@/pages/pos/table-map/views/TableMapPage'))
const PosOrderEntryPage  = lazy(() => import('@/pages/pos/order-entry/views/OrderEntryPage'))
const PosOrderDetailPage = lazy(() => import('@/pages/pos/order-detail/views/OrderDetailPage'))
const PosPaymentPage     = lazy(() => import('@/pages/pos/payment/views/PaymentPage'))
const PosShiftReportPage = lazy(() => import('@/pages/pos/shift-report/views/ShiftReportPage'))
const KdsPage            = lazy(() => import('@/pages/kds/views/KdsPage'))
const KdsLayout          = lazy(() => import('@/layouts/KdsLayout'))
const AdminDashboard    = lazy(() => import('@/pages/admin/dashboard/views/DashboardPage'))
const AdminMenuPage     = lazy(() => import('@/pages/admin/menu/views/MenuManagementPage'))
const AdminPromotions   = lazy(() => import('@/pages/admin/promotion/views/PromotionManagementPage'))
const AdminTables       = lazy(() => import('@/pages/admin/tables/views/TablesManagementPage'))
const AdminStaff        = lazy(() => import('@/pages/admin/staff/views/StaffManagementPage'))
const AdminReports      = lazy(() => import('@/pages/admin/reports/views/ReportsManagementPage'))
const AdminOrders       = lazy(() => import('@/pages/admin/orders/views/OrdersManagementPage'))
const AdminSettings     = lazy(() => import('@/pages/admin/settings/views/SettingsPage'))
const CustomerHomePage  = lazy(() => import('@/pages/customer/landing/views/HomePage'))
const CustomerMenuPage  = lazy(() => import('@/pages/customer/menu/views/MenuPage'))
const CustomerTrackingPage = lazy(() => import('@/pages/customer/tracking/views/OrderTrackingPage'))
const CustomerPaymentPage  = lazy(() => import('@/pages/customer/payment/views/PaymentPage'))
const CustomerPromotionPage = lazy(() => import('@/pages/customer/promotion/views/PromotionPage'))

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center bg-surface">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
)

export function AppRouter() {
  return (
    <>
      <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public */}
          <Route path={ROUTES.login}        element={<LoginPage />} />
          <Route path={ROUTES.unauthorized} element={<UnauthorizedPage />} />
          <Route path={ROUTES.customer.root} element={<CustomerHomePage />} />
          <Route path={ROUTES.customer.menu} element={<CustomerMenuPage />} />
          <Route path={"/tracking"} element={<CustomerTrackingPage />} />
          <Route path={ROUTES.customer.payment} element={<CustomerPaymentPage />} />
          <Route path={"/promotion"} element={<CustomerPromotionPage />} />

          {/* POS — CASHIER */}
          <Route element={<ProtectedRoute allowedRoles={[ROLE.CASHIER, ROLE.ADMIN]} />}>
            <Route element={<PosLayout />}>
              <Route path={ROUTES.pos.tables}      element={<PosTableMapPage />} />
              <Route path="/pos/orders/new"        element={<PosOrderEntryPage />} />
              <Route path={ROUTES.pos.orderEntry}  element={<PosOrderEntryPage />} />
              <Route path={ROUTES.pos.orderDetail} element={<PosOrderDetailPage />} />
              <Route path={ROUTES.pos.payment}     element={<PosPaymentPage />} />
              <Route path={ROUTES.pos.reports}     element={<PosShiftReportPage />} />
            </Route>
          </Route>

          {/* KDS — KITCHEN */}
          <Route element={<ProtectedRoute allowedRoles={[ROLE.KITCHEN, ROLE.CASHIER, ROLE.ADMIN]} />}>
            <Route element={<KdsLayout />}>
              <Route path={ROUTES.kds} element={<KdsPage />} />
            </Route>
          </Route>

          {/* Admin — ADMIN only */}
          <Route element={<ProtectedRoute allowedRoles={[ROLE.ADMIN]} />}>
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.admin.root}      element={<Navigate to={ROUTES.admin.dashboard} replace />} />
              <Route path={ROUTES.admin.dashboard} element={<AdminDashboard />} />
              <Route path={ROUTES.admin.menu}      element={<AdminMenuPage />} />
              <Route path={ROUTES.admin.promotions} element={<AdminPromotions />} />
              <Route path={ROUTES.admin.tables}    element={<AdminTables />} />
              <Route path={ROUTES.admin.staff}     element={<AdminStaff />} />
              <Route path={ROUTES.admin.reports}   element={<AdminReports />} />
              <Route path={ROUTES.admin.orders}    element={<AdminOrders />} />
              <Route path={ROUTES.admin.settings}  element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </>
  )
}
