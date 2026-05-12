import { Button } from '@/shared/components/ui/Button';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { ChevronLeft, WifiOff, SlidersHorizontal, LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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
  onToggleFilter: () => void;
}

export const KdsHeader = ({ stations, activeStations, onToggleStation, isConnected, onToggleFilter }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-950 shadow-xl z-50 flex items-center justify-between px-6 border-b border-slate-800">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/pos/table-map')}
          className="text-slate-100 hover:text-white hover:bg-slate-800 px-2"
        >
          <ChevronLeft className="w-7 h-7" />
        </Button>
        <div className="h-6 w-px bg-slate-700" />
        <h1 className="text-2xl text-white font-black tracking-wide flex items-center gap-3 drop-shadow-md">
          {t('kds.header.title')}
          <span className="text-amber-400 text-[10px] uppercase px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 font-black tracking-wider shadow-sm">
            {t('kds.header.modeLabel')}
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Desktop Station Pills */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700/50 shadow-inner">
          {stations.map(s => {
            const isActive = activeStations.includes(s.key);
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => onToggleStation(s.key)}
                className={`px-4 py-2 rounded-lg text-sm font-black transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? `text-white ${s.color} shadow-lg scale-105`
                    : 'text-slate-100 bg-slate-800 hover:text-white hover:bg-slate-700 hover:shadow-md'
                }`}
              >
                <Icon className="w-4 h-4" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Toggle Filter */}
        <button
          className="md:hidden p-2.5 rounded-lg hover:bg-slate-700 text-slate-200 transition-colors"
          onClick={onToggleFilter}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>

        {!isConnected && (
          <div className="flex items-center text-red-500 text-sm font-bold animate-pulse bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
            <WifiOff className="w-4 h-4 mr-2" />
            {t('kds.header.offlineMode')}
          </div>
        )}
        <div className="scale-90 ml-2">
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
};
