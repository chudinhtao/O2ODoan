import { Outlet } from 'react-router-dom';
import { ShiftGuard } from '@/pages/shift/components/ShiftGuard';

const KdsLayout = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-neutral-100 flex flex-col font-['Inter']">
      <ShiftGuard>
        <Outlet />
      </ShiftGuard>
    </div>
  );
};

export default KdsLayout;
