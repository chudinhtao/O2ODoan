import { useState, useEffect } from 'react';
import { IKdsTicket } from '../types/kds.type';
import { TicketCard } from './TicketCard';
import { useTranslation } from 'react-i18next';

interface Props {
  tickets: IKdsTicket[];
  onItemStatusChange: (id: string, newStatus: string) => void;
  onTicketStatusChange: (id: string, newStatus: string) => void;
  onItemCancelRequest: (orderId: string, itemId: string, reason: string) => void;
  processingTicketId?: string;
  processingItemId?: string;
}

export const TicketGrid = ({ tickets, onItemStatusChange, onTicketStatusChange, onItemCancelRequest, processingTicketId, processingItemId }: Props) => {
  const { t } = useTranslation();
  const [hiddenTickets, setHiddenTickets] = useState<string[]>([]);
  const [tab, setTab] = useState<'ACTIVE' | 'HISTORY' | 'CANCELLED'>('ACTIVE');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('kds_hidden_tickets');
      if (stored) setHiddenTickets(JSON.parse(stored));
    } catch {}
  }, []);

  const handleHideTicket = (id: string) => {
    const updated = [...hiddenTickets, id];
    setHiddenTickets(updated);
    localStorage.setItem('kds_hidden_tickets', JSON.stringify(updated));
  };

  const activeTickets = tickets.filter(t => ['PENDING', 'PREPARING'].includes(t.status) && !hiddenTickets.includes(t.id));
  const historyTickets = tickets
    .filter(t => ['DONE', 'SERVED'].includes(t.status) && !hiddenTickets.includes(t.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const cancelledTickets = tickets
    .filter(t => ['CANCELLED', 'RETURNED'].includes(t.status) && !hiddenTickets.includes(t.id))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const currentTickets = tab === 'ACTIVE' ? activeTickets : tab === 'HISTORY' ? historyTickets : cancelledTickets;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-slate-900">
      {/* Tabs */}
      <div className="flex gap-3 px-6 pt-6 shrink-0">
        <button 
          onClick={() => setTab('ACTIVE')}
          className={`px-6 py-3 font-bold rounded-t-xl transition-all duration-300 text-sm uppercase tracking-wider
            ${tab === 'ACTIVE' 
              ? 'bg-slate-800 text-amber-500 shadow-lg border-t-2 border-amber-500' 
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-t-2 border-transparent'}`}
        >
           {t('kds.grid.activeTab', 'Đơn Đang Nấu')} ({activeTickets.length})
        </button>
        <button 
          onClick={() => setTab('HISTORY')}
          className={`px-6 py-3 font-bold rounded-t-xl transition-all duration-300 text-sm uppercase tracking-wider
            ${tab === 'HISTORY' 
              ? 'bg-slate-800 text-emerald-400 shadow-lg border-t-2 border-emerald-500' 
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-t-2 border-transparent'}`}
        >
           {t('kds.grid.historyTab', 'Lịch Sử Đã Xong')} ({historyTickets.length})
        </button>
        <button 
          onClick={() => setTab('CANCELLED')}
          className={`px-6 py-3 font-bold rounded-t-xl transition-all duration-300 text-sm uppercase tracking-wider
            ${tab === 'CANCELLED' 
              ? 'bg-slate-800 text-red-500 shadow-lg border-t-2 border-red-500' 
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-t-2 border-transparent'}`}
        >
           {t('kds.grid.cancelledTab', 'Yêu cầu Hủy')} ({cancelledTickets.length})
        </button>
      </div>

      {/* Content */}
      {currentTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 min-h-0 bg-slate-800 mx-6 mb-6 rounded-b-xl rounded-tr-xl shadow-xl border border-slate-700/50">
          <div className="w-24 h-24 mb-6 text-slate-500">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-400 tracking-wide">{t('kds.grid.empty', 'Chưa có đơn hàng')}</h2>
        </div>
      ) : (
        <div className="flex flex-1 p-6 gap-6 overflow-x-auto items-start min-h-0 bg-slate-900 scrollbar-hide">
          {currentTickets.map(ticket => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket}
              onItemStatusChange={onItemStatusChange}
              onTicketStatusChange={onTicketStatusChange}
              onHideTicket={handleHideTicket}
              onItemCancelRequest={onItemCancelRequest}
              processingTicketId={processingTicketId}
              processingItemId={processingItemId}
            />
          ))}
        </div>
      )}
    </div>
  );
};
