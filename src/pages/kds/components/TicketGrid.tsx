import { useState, useEffect } from 'react';
import { IKdsTicket } from '../types/kds.type';
import { TicketCard } from './TicketCard';
import { useTranslation } from 'react-i18next';

interface Props {
  tickets: IKdsTicket[];
  onItemStatusChange: (id: string, newStatus: string) => void;
  onTicketStatusChange: (id: string, newStatus: string) => void;
  onItemCancelRequest: (orderId: string, itemId: string, reason: string) => void;
  isLoading: boolean;
}

export const TicketGrid = ({ tickets, onItemStatusChange, onTicketStatusChange, onItemCancelRequest, isLoading }: Props) => {
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
  const historyTickets = tickets.filter(t => ['DONE', 'SERVED'].includes(t.status) && !hiddenTickets.includes(t.id));
  const cancelledTickets = tickets.filter(t => ['CANCELLED', 'RETURNED'].includes(t.status) && !hiddenTickets.includes(t.id));
  
  const currentTickets = tab === 'ACTIVE' ? activeTickets : tab === 'HISTORY' ? historyTickets : cancelledTickets;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f3f4f6]">
      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-4 shrink-0">
        <button 
          onClick={() => setTab('ACTIVE')}
          className={`px-5 py-2.5 font-bold rounded-t-lg transition-colors text-sm uppercase tracking-wide
            ${tab === 'ACTIVE' 
              ? 'bg-white text-neutral-800 shadow-sm border-t-2 border-orange-500' 
              : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'}`}
        >
           {t('kds.grid.activeTab', 'Đơn Đang Nấu')} ({activeTickets.length})
        </button>
        <button 
          onClick={() => setTab('HISTORY')}
          className={`px-5 py-2.5 font-bold rounded-t-lg transition-colors text-sm uppercase tracking-wide
            ${tab === 'HISTORY' 
              ? 'bg-white text-green-600 shadow-sm border-t-2 border-green-500' 
              : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'}`}
        >
           {t('kds.grid.historyTab', 'Lịch Sử Đã Xong')} ({historyTickets.length})
        </button>
        <button 
          onClick={() => setTab('CANCELLED')}
          className={`px-5 py-2.5 font-bold rounded-t-lg transition-colors text-sm uppercase tracking-wide
            ${tab === 'CANCELLED' 
              ? 'bg-white text-red-600 shadow-sm border-t-2 border-red-500' 
              : 'bg-neutral-200 text-neutral-500 hover:bg-neutral-300'}`}
        >
           {t('kds.grid.cancelledTab', 'Yêu cầu Hủy')} ({cancelledTickets.length})
        </button>
      </div>

      {/* Content */}
      {currentTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 min-h-0 bg-white mx-4 mb-4 rounded-b-lg shadow-sm border border-t-0">
          <div className="w-20 h-20 mb-4 text-neutral-200">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-neutral-400">{t('kds.grid.empty', 'Chưa có đơn hàng')}</h2>
        </div>
      ) : (
        <div className="flex flex-1 p-4 pt-4 gap-5 overflow-x-auto items-start min-h-0 bg-[#f3f4f6]">
          {currentTickets.map(ticket => (
            <TicketCard 
              key={ticket.id} 
              ticket={ticket}
              onItemStatusChange={onItemStatusChange}
              onTicketStatusChange={onTicketStatusChange}
              onHideTicket={handleHideTicket}
              onItemCancelRequest={onItemCancelRequest}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
};
