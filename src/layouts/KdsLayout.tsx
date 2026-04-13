import { Outlet } from 'react-router-dom';

const KdsLayout = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-neutral-100 flex flex-col font-['Inter']">
      <Outlet />
    </div>
  );
};

export default KdsLayout;
