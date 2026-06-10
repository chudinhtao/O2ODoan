import React, { useState } from 'react';
import { ServerDeliveryTab } from '@/pages/server/views/ServerDeliveryTab';
import { ServerStaffCallTab } from '@/pages/server/views/ServerStaffCallTab';
import { ServerKpiTab } from '@/pages/server/views/ServerKpiTab';
import { useServerZones } from '@/pages/server/hooks/useServerData';
import { useServerWebSocket } from '@/pages/server/hooks/useServerWebSocket';
import { useTranslation } from 'react-i18next';
import { UtensilsCrossed, Bell, User, LogOut } from 'lucide-react';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/auth.slice';
import { clearSession } from '@/store/slices/session.slice';
import { clearCart } from '@/store/slices/cart.slice';
import { queryClient } from '@/providers/AppProviders';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/ROUTES';
import { ShiftGuard } from '@/pages/shift/components/ShiftGuard';
import { useShift } from '@/shared/hooks/useShift';

export const ServerDashboard: React.FC = () => {
  const { t } = useTranslation();
  // Initialize WebSocket & Auto-sync
  useServerWebSocket();

  const [activeTab, setActiveTab] = useState<'DELIVERY' | 'CALLS' | 'KPI'>('DELIVERY');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  const { data: zones } = useServerZones();

  const toggleZone = (zone: string) => {
    setSelectedZones(prev => 
      prev.includes(zone) 
        ? prev.filter(z => z !== zone)
        : [...prev, zone]
    );
  };

  const { clockOut } = useShift();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearSession());
    dispatch(clearCart());
    queryClient.clear();
    navigate(ROUTES.login);
  };

  return (
    <ShiftGuard>
      <div className="min-h-screen bg-surface flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-black text-primary">ServerApp</h1>
            <div className="flex items-center gap-2">
              <LanguageToggle variant="plain" className="text-on-surface-variant hover:bg-surface-bright" />
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-bright text-on-surface-variant text-sm font-bold border border-outline-variant transition-colors hover:text-danger hover:border-danger/30"
                title={t('admin.logout', 'Đăng xuất')}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">{t('admin.logout', 'Đăng xuất')}</span>
              </button>

              <button 
                onClick={() => clockOut.mutate('Kết ca phục vụ')}
                disabled={clockOut.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-danger/10 text-danger text-sm font-bold border border-danger/20 disabled:opacity-50"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">{t('shift.clockOut', 'Kết ca')}</span>
              </button>
            </div>
          </div>
          {activeTab !== 'KPI' && zones && zones.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              <button
                onClick={() => setSelectedZones([])}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${selectedZones.length === 0 ? 'bg-primary text-on-primary border-primary' : 'bg-surface-bright text-on-surface-variant border-outline-variant'}`}
              >
                {t('server.all_zones')}
              </button>
              {zones.map((zone: string) => (
                <button
                  key={zone}
                  onClick={() => toggleZone(zone)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border ${selectedZones.includes(zone) ? 'bg-primary/10 text-primary border-primary/50' : 'bg-surface-bright text-on-surface-variant border-outline-variant'}`}
                >
                  {zone}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'DELIVERY' && <ServerDeliveryTab selectedZones={selectedZones} />}
          {activeTab === 'CALLS' && <ServerStaffCallTab selectedZones={selectedZones} />}
          {activeTab === 'KPI' && <ServerKpiTab />}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface-bright border-t border-outline-variant/30 pb-safe">
          <div className="flex justify-around items-center h-16">
            <button 
              onClick={() => setActiveTab('DELIVERY')}
              className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 ${activeTab === 'DELIVERY' ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              <UtensilsCrossed className="size-6" />
              <span className="text-[10px] font-bold uppercase tracking-wide">{t('server.tab_delivery')}</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('CALLS')}
              className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 relative ${activeTab === 'CALLS' ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              <Bell className="size-6" />
              <span className="text-[10px] font-bold uppercase tracking-wide">{t('server.tab_calls')}</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('KPI')}
              className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 ${activeTab === 'KPI' ? 'text-primary' : 'text-on-surface-variant'}`}
            >
              <User className="size-6" />
              <span className="text-[10px] font-bold uppercase tracking-wide">{t('server.tab_kpi')}</span>
            </button>
          </div>
        </div>
      </div>
    </ShiftGuard>
  );
};
