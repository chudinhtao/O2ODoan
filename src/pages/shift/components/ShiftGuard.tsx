import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useShift } from '@/shared/hooks/useShift';
import { RefreshCw } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
}

export function ShiftGuard({ children }: Props) {
  const { currentShift, isAdminOrManager } = useShift();
  const location = useLocation();

  if (isAdminOrManager || currentShift.data) {
    return <>{children ? children : <Outlet />}</>;
  }

  if (currentShift.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-subtle">
        <RefreshCw className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  // Chuyển hướng người dùng sang màn hình Clock-in nếu chưa mở ca (404 Not Found)
  // Lưu lại đường dẫn hiện tại để sau khi mở ca có thể redirect ngược lại đúng trang
  return <Navigate to="/shift/clock-in" state={{ from: location.pathname }} replace />;
}
