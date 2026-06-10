import { useShift } from '@/shared/hooks/useShift';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/Button';
import { LogIn, Lock, LogOut, AlertCircle, RefreshCw } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ROLE } from '@/shared/constants/ROLE';
import { ROUTES } from '@/shared/constants/ROUTES';
import { useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/auth.slice';
import { queryClient } from '@/providers/AppProviders';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';

const ROLE_REDIRECT: Record<string, string> = {
  [ROLE.ADMIN]:   ROUTES.admin.dashboard,
  [ROLE.CASHIER]: ROUTES.pos.tables,
  [ROLE.KITCHEN]: ROUTES.kds,
  [ROLE.SERVER]:  '/server',
};

export default function ClockInPage() {
  const { t } = useTranslation();
  const { currentShift, clockIn, isAdminOrManager, user } = useShift();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const from = location.state?.from || ROLE_REDIRECT[user?.role || ''] || ROUTES.login;

  // Nếu là ADMIN hoặc ĐÃ mở ca -> Trở về đích
  if (isAdminOrManager || currentShift.data) {
    return <Navigate to={from} replace />;
  }

  // Đang gọi API kiểm tra trạng thái ca
  if (currentShift.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-subtle">
        <RefreshCw className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = async () => {
    await dispatch(logoutUser());
    queryClient.clear();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative">
      {/* Language Toggle — Fixed in page context */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle variant="pill" />
      </div>

      <div className="max-w-md w-full bg-surface-raised rounded-[2rem] shadow-2xl p-10 border border-surface-border text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Lock className="size-12 text-primary" />
        </div>
        
        <h1 className="text-3xl font-black text-on-surface mb-2 tracking-tight">
          {t('shift.clockInPage.title', 'Mở Ca Làm Việc')}
        </h1>
        
        <p className="text-on-surface-variant mb-10 text-lg">
          {t('shift.clockInPage.greeting1', 'Xin chào')} <span className="font-bold text-on-surface">{user?.fullName || t('shift.clockInPage.fallbackName', 'bạn')}</span>, 
          {' '}{t('shift.clockInPage.greeting2', 'bạn cần mở ca để bắt đầu phiên tác nghiệp.')}
        </p>

        {currentShift.error && (
          <div className="mb-8 p-4 bg-danger/10 text-danger rounded-xl text-sm flex items-start gap-3 w-full text-left font-medium">
            <AlertCircle className="size-5 shrink-0 mt-0.5" />
            <span>{t('shift.clockInPage.errorNetwork', 'Không thể kết nối với máy chủ. Vui lòng kiểm tra lại mạng kết nối.')}</span>
          </div>
        )}

        <Button 
          className="w-full h-16 text-xl font-bold shadow-xl shadow-primary/30 rounded-2xl bg-primary hover:bg-primary-dark transition-transform hover:scale-[1.02] active:scale-95 flex gap-3"
          onClick={() => clockIn.mutate()}
          isLoading={clockIn.isPending}
          disabled={clockIn.isPending}
        >
          <LogIn className="size-6" />
          {t('shift.clockIn', 'Bắt Đầu Ca')}
        </Button>
        
        <p className="text-sm text-text-subtle mt-8 text-on-surface-muted">
          {t('shift.clockInPage.note', 'Thời gian mở ca sẽ được ghi nhận vào hệ thống lưu trữ.')}
        </p>

        <Button 
          variant="ghost"
          className="mt-6 text-on-surface-variant hover:text-danger gap-2 rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          {t('shift.clockInPage.logoutAccount', 'Đăng xuất tài khoản')}
        </Button>
      </div>
    </div>
  );
}
