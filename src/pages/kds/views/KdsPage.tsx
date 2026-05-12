import { useState, useEffect } from 'react';
import { TicketGrid } from '../components/TicketGrid';
import { KdsHeader } from '../components/KdsHeader';
import { useKdsQuery } from '../hooks/useKdsQuery';
import { useKdsSocket } from '../hooks/useKdsSocket';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { IKdsTicket } from '../types/kds.type';
import { Flame, Snowflake, Coffee } from 'lucide-react';

/** Danh sách các trạm bếp có thể chọn */
const STATIONS = [
  { key: 'HOT',  label: 'Bếp Nóng',   color: 'bg-amber-600', icon: Flame },
  { key: 'COLD', label: 'Bếp Lạnh',   color: 'bg-blue-600', icon: Snowflake },
  { key: 'DRINK', label: 'Đồ Uống',   color: 'bg-emerald-600', icon: Coffee },
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
    <div className="min-h-screen bg-slate-900 flex flex-col font-['Inter'] text-slate-100">
      <KdsHeader 
        stations={STATIONS}
        activeStations={activeStations}
        onToggleStation={toggleStation}
        isConnected={isConnected}
        onToggleFilter={() => setShowFilter(v => !v)}
      />

      {/* Mobile Station Filter Panel */}
      {showFilter && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-slate-800 px-4 py-4 flex gap-3 flex-wrap shadow-2xl md:hidden border-b border-slate-700">
          {STATIONS.map(s => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => toggleStation(s.key)}
                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all shadow-sm flex items-center gap-2 ${
                  activeStations.includes(s.key)
                    ? 'text-white border-transparent ' + s.color
                    : 'text-slate-300 border-slate-700 bg-slate-900/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {s.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Station Badge */}
      {activeStations.length === 0 && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-red-500/90 backdrop-blur-sm text-white text-sm font-bold text-center py-2 shadow-lg">
          ⚠️ Chưa chọn trạm bếp nào. Hãy chọn ít nhất 1 trạm để hiển thị món ăn.
        </div>
      )}

      <main className="flex-1 mt-16 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5 h-[320px] flex flex-col gap-4 shadow-lg">
                <Skeleton className="h-8 w-1/2 bg-slate-700" />
                <Skeleton className="h-14 w-full bg-slate-700" />
                <Skeleton className="h-14 w-full bg-slate-700" />
                <Skeleton className="h-14 w-full bg-slate-700" />
                <Skeleton className="h-14 w-full mt-auto bg-slate-700" />
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
