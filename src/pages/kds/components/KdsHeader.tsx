import { Button } from '@/shared/components/ui/Button';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { ChevronLeft, WifiOff, SlidersHorizontal, LucideIcon, Trash2, Ban, LogOut, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useShift } from '@/shared/hooks/useShift';
import { KdsWasteModal } from './KdsWasteModal';
import { KdsKillSwitchModal } from './KdsKillSwitchModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/auth.slice';
import { clearSession } from '@/store/slices/session.slice';
import { clearCart } from '@/store/slices/cart.slice';
import { queryClient } from '@/providers/AppProviders';
import { ROUTES } from '@/shared/constants/ROUTES';

interface Station {
  key: string;
  label: string;
  color: string;
  icon: LucideIcon;
}

interface Props {
  stations: readonly Station[];
  activeStations: string[];
  onToggleStation: (key: string) => void;
  isConnected: boolean;
}

export const KdsHeader = ({ stations, activeStations, onToggleStation, isConnected }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isWasteOpen, setIsWasteOpen] = useState(false);
  const [isKillSwitchOpen, setIsKillSwitchOpen] = useState(false);
  const [isStationOpen, setIsStationOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { clockOut } = useShift();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(clearSession());
    dispatch(clearCart());
    queryClient.clear();
    navigate(ROUTES.login);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950 shadow-xl z-50 flex items-center justify-between px-6 border-b border-slate-800">
      <div className="flex items-center gap-2 sm:gap-6 min-w-0">
        <Button
          variant="ghost"
          onClick={() => navigate('/pos/table-map')}
          className="text-slate-100 hover:text-white hover:bg-slate-800 px-1 sm:px-2 shrink-0"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </Button>
        <div className="h-6 w-px bg-slate-700 shrink-0 hidden sm:block" />
        <h1 className="text-sm sm:text-2xl text-white font-black tracking-wide flex items-center gap-2 sm:gap-3 drop-shadow-md min-w-0">
          <span className="truncate">{t('kds.header.title')}</span>
          <span className="text-amber-400 text-[8px] sm:text-[10px] uppercase px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded bg-amber-500/10 border border-amber-500/30 font-black tracking-wider shadow-sm shrink-0 whitespace-nowrap">
            {t('kds.header.modeLabel')}
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* 1. Station Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsStationOpen(!isStationOpen)}
            className="h-9 px-2 sm:px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-100 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <SlidersHorizontal className="size-3.5 text-amber-500" />
            <span className="max-w-[80px] sm:max-w-[120px] truncate hidden xs:inline">
              {activeStations.length === 0 || activeStations.length === stations.length
                ? t('kds.header.allStations', 'Tất cả trạm')
                : activeStations.map(k => stations.find(s => s.key === k)?.label).join(', ')}
            </span>
            <ChevronDown className="size-3 text-slate-400 shrink-0" />
          </button>
          {isStationOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsStationOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 text-[9px] uppercase font-black tracking-wider text-slate-500 border-b border-slate-800/60 mb-1">{t('kds.header.selectStation', 'Chọn Trạm Bếp')}</div>
                {stations.map(s => {
                  const isActive = activeStations.includes(s.key);
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.key}
                      onClick={() => onToggleStation(s.key)}
                      className={`w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
                        isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{s.label}</span>
                      </div>
                      {isActive && <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 2. Utilities Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsActionOpen(!isActionOpen)}
            className="h-9 px-2 sm:px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-100 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-xs font-bold">{t('kds.header.utilities', 'Tiện ích')}</span>
            <ChevronDown className="size-3 text-slate-400 shrink-0" />
          </button>
          {isActionOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsActionOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setIsWasteOpen(true);
                    setIsActionOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>{t('kds.header.wasteMaterial', 'Báo Hỏng Nguyên Liệu')}</span>
                </button>
                <button
                  onClick={() => {
                    setIsKillSwitchOpen(true);
                    setIsActionOpen(false);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 text-left"
                >
                  <Ban className="w-3.5 h-3.5 text-orange-500" />
                  <span>{t('kds.header.killSwitchItem', 'Báo Hết Món Ăn')}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {!isConnected && (
          <div className="flex items-center text-red-500 text-xs font-bold animate-pulse bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20 shrink-0">
            <WifiOff className="w-3.5 h-3.5" />
          </div>
        )}

        {/* 3. User Menu Dropdown */}
        {user && (
          <div className="relative shrink-0">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="h-9 px-2 sm:px-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            >
              <div className="size-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-[10px] shrink-0">
                {user.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="max-w-[70px] sm:max-w-[100px] truncate hidden sm:inline text-xs font-bold text-slate-300">{user.fullName || user.username}</span>
              <ChevronDown className="size-3 text-slate-500 shrink-0" />
            </button>
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Profile Header */}
                  <div className="flex items-center gap-2.5 p-2 border-b border-slate-800/60 pb-2.5 mb-1.5">
                    <div className="size-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-xs">
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">{user.fullName || user.username}</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{user.role}</div>
                    </div>
                  </div>

                  {/* Settings / Language Toggle */}
                  <div className="flex items-center justify-between px-2 py-1.5 hover:bg-slate-850 rounded-lg mb-1 transition-colors">
                    <span className="text-xs font-semibold text-slate-400">{t('common.language', 'Ngôn ngữ')}</span>
                    <div className="scale-75 origin-right">
                      <LanguageToggle variant="pill" />
                    </div>
                  </div>

                  {/* Clock Out */}
                  <button
                    onClick={() => {
                      clockOut.mutate(t('kds.header.clockOutReason', 'Kết ca bếp'));
                      setIsUserMenuOpen(false);
                    }}
                    disabled={clockOut.isPending}
                    className="w-full px-2 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors disabled:opacity-50 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('shift.clockOut', 'Kết ca')}</span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 flex items-center gap-2 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('admin.logout', 'Đăng xuất tài khoản')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isWasteOpen && <KdsWasteModal onClose={() => setIsWasteOpen(false)} />}
      {isKillSwitchOpen && <KdsKillSwitchModal onClose={() => setIsKillSwitchOpen(false)} />}
    </header>
  );
};
