import { IKdsTicket } from '../types/kds.type';
import { TicketTimer } from './TicketTimer';
import { TicketItemRow } from './TicketItemRow';
import { Button } from '@/shared/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Play, AlertOctagon } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  ticket: IKdsTicket;
  onItemStatusChange: (id: string, newStatus: string) => void;
  onTicketStatusChange: (id: string, newStatus: string) => void;
  onHideTicket: (id: string) => void;
  onItemCancelRequest?: (orderId: string, itemId: string, reason: string) => void;
  isLoading: boolean;
}

export const TicketCard = ({ 
  ticket, 
  onItemStatusChange, 
  onTicketStatusChange, 
  onHideTicket, 
  onItemCancelRequest,
  isLoading 
}: Props) => {
  const { t } = useTranslation();

  const handleAction = () => {
    if (isLoading) return;
    if (ticket.status === 'PENDING') {
      onTicketStatusChange(ticket.id, 'PREPARING');
    } else {
      onTicketStatusChange(ticket.id, 'DONE');
    }
  };

  const handleRejectTicket = () => {
    if (isLoading || !onItemCancelRequest || !ticket.orderId) return;
    // Iterate over all items in ticket and cancel those that aren't already cancelled or done
    ticket.items.forEach(item => {
      if (item.status !== 'CANCELLED' && item.status !== 'RETURNED' && item.status !== 'DONE' && item.status !== 'SERVED') {
        onItemCancelRequest(ticket.orderId!, item.id, 'Hết nguyên liệu (Bếp báo)');
      }
    });
  };

  const isAllDone = ticket.items.every(i => i.status === 'DONE' || i.status === 'CANCELLED');
  const ticketTitle = ticket.tableNumber 
    ? t('kds.ticket.table', { number: ticket.tableNumber, defaultValue: `Bàn ${ticket.tableNumber}` })
    : t('kds.ticket.takeaway', { defaultValue: 'Mang đi' });

  const isPending = ticket.status === 'PENDING';
  const isCancelled = ticket.status === 'CANCELLED';
  
  let headerBg = isPending ? 'bg-[#ff9f43]' : 'bg-[#2ed573]';
  let badgeText = isPending ? t('kds.ticket.status.pending') : t('kds.ticket.status.preparing');
  
  if (isCancelled) {
    headerBg = 'bg-[#ff4757]';
    badgeText = t('kds.ticket.status.cancelled');
  }
  
  const timeFormatted = format(new Date(ticket.createdAt), 'HH:mm');

  return (
    <div className={`
      flex flex-col bg-slate-800 rounded-xl shadow-2xl overflow-hidden
      shrink-0 w-[350px] h-full border
      transition-all duration-300
      ${isAllDone && !isCancelled ? 'opacity-70 grayscale-[20%]' : ''}
      ${isCancelled ? 'border-red-500' : isPending ? 'border-amber-500/50' : 'border-blue-500/50'}
    `}>
      {/* Colored Header */}
      <div className={`${headerBg} text-white px-5 py-3 shadow-md relative overflow-hidden`}>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        
        {isCancelled && (
           <div className="flex justify-center items-center gap-2 mb-2 bg-red-950/40 py-1.5 rounded-lg border border-red-400/30">
             <AlertOctagon className="w-4 h-4 text-red-200" />
             <span className="font-bold text-sm uppercase tracking-widest text-red-100">{t('kds.ticket.status.cancelled')}</span>
           </div>
        )}
        <div className="flex justify-between items-center mb-1.5">
          <div className="font-black text-2xl tracking-wider drop-shadow-md">{ticketTitle}</div>
          <div className="font-bold text-sm bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-inner">{timeFormatted}</div>
        </div>
        <div className="flex justify-between items-center text-sm text-white/90 font-medium">
          <div className="font-bold uppercase tracking-widest text-xs bg-white/20 px-2 py-0.5 rounded">{badgeText}</div>
          <div className="opacity-75 font-mono">#{ticket.id.substring(0,6).toUpperCase()}</div>
        </div>
      </div>

      {ticket.note && (
        <div className="bg-red-500/10 text-red-400 px-5 py-3 text-sm font-bold border-b border-red-500/20 flex items-center gap-2">
          <span className="bg-red-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded-md shadow-sm">{t('kds.ticket.noteLabel')}</span>
          {ticket.note}
        </div>
      )}

      {/* Body: Items */}
      <div className={`flex-1 overflow-y-auto p-2 ${isCancelled ? 'bg-red-950/10' : 'bg-slate-800/50'}`}>
        {ticket.items.map((item, index) => (
          <div key={item.id} className="mb-2 last:mb-0">
            <TicketItemRow 
              item={item} 
              orderId={ticket.orderId}
              onStatusChange={onItemStatusChange}
              onItemCancelRequest={onItemCancelRequest}
              isLoading={isLoading}
              isTicketPending={isPending}
            />
            {index < ticket.items.length - 1 && <div className="h-px bg-slate-700/50 mt-2 mx-3" />}
          </div>
        ))}
      </div>

      {/* Footer Area with timer and buttons */}
      <div className="bg-slate-900 p-4 flex flex-col gap-4 border-t border-slate-700/50">
        <div className="flex justify-between items-center px-1">
          <div className="text-slate-400 text-xs font-mono font-medium">{ticket.id.substring(0,8)}</div>
          <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 shadow-inner">
            <TicketTimer createdAt={ticket.createdAt} />
          </div>
        </div>
        
        {isCancelled ? (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 bg-slate-800 text-red-400 hover:bg-red-950 hover:text-red-300 font-bold py-6 rounded-xl border-2 border-red-500/50 shadow-lg transition-all"
              onClick={() => onHideTicket(ticket.id)}
            >
              {t('kds.actions.hide')}
            </Button>
          </div>
        ) : !isAllDone ? (
          <div className="flex gap-3">
            {isPending && (
              <Button 
                variant="outline"
                className="bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300 font-bold py-6 rounded-xl transition-all"
                onClick={handleRejectTicket}
                disabled={isLoading}
              >
                {t('kds.actions.reject')}
              </Button>
            )}
            <Button 
              className={`flex-1 text-lg font-black py-6 rounded-xl border-transparent text-white shadow-xl transition-all active:scale-95 hover:brightness-110 ${
                isPending ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
              }`}
              onClick={handleAction}
              disabled={isLoading}
            >
              {isPending ? (
                <>
                  <Play className="w-6 h-6 mr-2 fill-current" />
                  {t('kds.ticket.startPrep')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6 mr-2" />
                  {t('kds.ticket.markAllDone', 'Hoàn tất Đơn')}
                </>
              )}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

