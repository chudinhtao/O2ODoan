import { useState, useEffect } from 'react';
import { TicketGrid } from '../components/TicketGrid';
import { useKdsQuery } from '../hooks/useKdsQuery';
import { useKdsSocket } from '../hooks/useKdsSocket';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { Button } from '@/shared/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, WifiOff, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { IKdsTicket } from '../types/kds.type';

/** Danh sách các trạm bếp có thể chọn */
const STATIONS = [
  { key: 'HOT',  label: '🔥 Bếp Nóng',   color: 'bg-orange-500' },
  { key: 'COLD', label: '🧊 Bếp Lạnh',   color: 'bg-blue-500' },
  { key: 'DRINK', label: '☕ Đồ Uống',   color: 'bg-green-500' },
] as const;

const LS_KEY = 'kds_active_stations';

/** Đọc từ localStorage, mặc định chọn tất cả */
const loadStations = (): string[] => {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return STATIONS.map(s => s.key);
};

export const KdsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tickets, isLoading, updateItemStatus, updateTicketStatus, cancelOrderItem } = useKdsQuery();
  const { isConnected } = useKdsSocket();
  const [showFilter, setShowFilter] = useState(false);

  // Phase 3: Station filter — lưu vào localStorage để Tablet nhớ qua lần tắt/mở
  const [activeStations, setActiveStations] = useState<string[]>(loadStations);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(activeStations));
  }, [activeStations]);

  const toggleStation = (key: string) => {
    setActiveStations(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  // Lọc ticket theo trạm được chọn (lọc ở client, không cần đổi API)
  const filteredTickets: IKdsTicket[] = (tickets || []).filter(ticket =>
    ticket.items?.some(item => activeStations.includes(item.station))
  );

  const handleItemStatus = (id: string, newStatus: string) =>
    updateItemStatus.mutate({ id, status: newStatus });

  const handleTicketStatus = (id: string, newStatus: string) =>
    updateTicketStatus.mutate({ id, status: newStatus });

  const handleItemCancelRequest = (orderId: string, itemId: string, reason: string) =>
    cancelOrderItem.mutate({ orderId, itemId, reason });

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-['Inter']">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-neutral-800 text-gray-100 shadow-md z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/pos/table-map')}
            className="text-gray-300 hover:text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            {t('kds.header.backToPos')}
          </Button>
          <div className="h-6 w-px bg-gray-700" />
          <h1 className="text-xl font-bold tracking-wide">
            {t('kds.header.title')}{' '}
            <span className="text-orange-500 ml-2 text-sm uppercase px-2 py-0.5 rounded border border-orange-500">
              {t('kds.header.modeLabel')}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Phase 3: Station pills */}
          <div className="hidden md:flex items-center gap-1.5">
            {STATIONS.map(s => (
              <button
                key={s.key}
                onClick={() => toggleStation(s.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                  activeStations.includes(s.key)
                    ? 'text-white border-transparent ' + s.color
                    : 'text-gray-400 border-gray-600 bg-transparent'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Mobile: Toggle filter panel */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-gray-300"
            onClick={() => setShowFilter(v => !v)}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {!isConnected && (
            <div className="flex items-center text-red-400 text-sm font-medium animate-pulse">
              <WifiOff className="w-4 h-4 mr-1.5" />
              {t('kds.header.offlineMode')}
            </div>
          )}
          <div className="scale-90">
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Mobile Station Filter Panel */}
      {showFilter && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-neutral-700 px-4 py-3 flex gap-2 flex-wrap shadow-lg md:hidden">
          {STATIONS.map(s => (
            <button
              key={s.key}
              onClick={() => toggleStation(s.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                activeStations.includes(s.key)
                  ? 'text-white border-transparent ' + s.color
                  : 'text-gray-400 border-gray-500 bg-transparent'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Active Station Badge */}
      {activeStations.length === 0 && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-yellow-500/90 text-yellow-900 text-xs font-bold text-center py-1.5">
          ⚠️ Chưa chọn trạm bếp nào. Chọn ít nhất 1 trạm để hiển thị món.
        </div>
      )}

      <main className="flex-1 mt-16 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-lg border p-4 h-[300px] flex flex-col gap-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <TicketGrid
            tickets={filteredTickets}
            onItemStatusChange={handleItemStatus}
            onTicketStatusChange={handleTicketStatus}
            onItemCancelRequest={handleItemCancelRequest}
            isLoading={
              updateItemStatus.isPending || updateTicketStatus.isPending || cancelOrderItem.isPending
            }
          />
        )}
      </main>
    </div>
  );
};

export default KdsPage;
