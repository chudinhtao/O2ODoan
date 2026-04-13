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
  let badgeText = isPending ? 'Mới nhận' : 'Đang nấu';
  
  if (isCancelled) {
    headerBg = 'bg-[#ff4757]';
    badgeText = 'Yêu cầu hủy';
  }
  
  const timeFormatted = format(new Date(ticket.createdAt), 'HH:mm');

  return (
    <div className={`
      flex flex-col bg-white rounded-xl shadow-md overflow-hidden
      shrink-0 w-[340px] h-full
      transition-all duration-300
      ${isAllDone && !isCancelled ? 'opacity-80' : ''}
      ${isCancelled ? 'border-2 border-[#ff4757]' : ''}
    `}>
      {/* Colored Header */}
      <div className={`${headerBg} text-white px-4 py-3 shadow-sm`}>
        {isCancelled && (
           <div className="flex justify-center items-center gap-2 mb-2 bg-white/20 py-1 rounded">
             <AlertOctagon className="w-4 h-4" />
             <span className="font-bold text-sm uppercase tracking-widest text-[#fff]">YÊU CẦU HỦY</span>
           </div>
        )}
        <div className="flex justify-between items-center mb-1">
          <div className="font-bold text-lg tracking-wide">{ticketTitle}</div>
          <div className="font-medium text-sm bg-black/10 px-2 py-0.5 rounded">{timeFormatted}</div>
        </div>
        <div className="flex justify-between items-center text-sm text-white/90">
          <div className="font-semibold uppercase tracking-wider textxs">{badgeText}</div>
          <div>#{ticket.id.substring(0,6).toUpperCase()}</div>
        </div>
      </div>

      {ticket.note && (
        <div className="bg-red-50 text-red-600 px-4 py-2 text-sm font-medium border-b border-red-100 flex items-center gap-1.5">
          <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Lưu ý</span>
          {ticket.note}
        </div>
      )}

      {/* Body: Items */}
      <div className={`flex-1 overflow-y-auto p-4 ${isCancelled ? 'bg-red-50/50' : 'bg-[#fcfcfc]'}`}>
        {ticket.items.map((item, index) => (
          <div key={item.id} className="mb-3 last:mb-0">
            <TicketItemRow 
              item={item} 
              orderId={ticket.orderId}
              onStatusChange={onItemStatusChange}
              onItemCancelRequest={onItemCancelRequest}
              isLoading={isLoading}
              isTicketPending={isPending}
            />
            {index < ticket.items.length - 1 && <div className="h-px bg-neutral-100 mt-3 mx-2" />}
          </div>
        ))}
      </div>

      {/* Footer Area with timer and buttons */}
      <div className="bg-neutral-600 p-3 flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <div className="text-neutral-400 text-xs font-mono">{ticket.id.substring(0,8)}</div>
          <TicketTimer createdAt={ticket.createdAt} />
        </div>
        
        {isCancelled ? (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="flex-1 !bg-white !text-red-600 hover:!bg-red-50 font-bold py-6 !rounded-lg !border-2 !border-red-500 shadow-sm"
              onClick={() => onHideTicket(ticket.id)}
            >
              Đồng ý Hủy (Ẩn vé)
            </Button>
          </div>
        ) : !isAllDone ? (
          <div className="flex gap-2">
            {isPending && (
              <Button 
                variant="outline"
                className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold py-6 !rounded-lg"
                onClick={handleRejectTicket}
                disabled={isLoading}
              >
                Từ chối
              </Button>
            )}
            <Button 
              className={`flex-1 text-base font-bold py-6 !rounded-lg border-transparent text-white shadow-sm transition-transform active:scale-95 hover:opacity-90 ${
                isPending ? 'bg-[#3742fa]' : 'bg-[#2ed573]'
              }`}
              onClick={handleAction}
              disabled={isLoading}
            >
              {isPending ? (
                <>
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  {t('kds.ticket.startPrep', 'Chuẩn bị')}
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

