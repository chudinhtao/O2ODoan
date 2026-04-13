import { IKdsTicketItem } from '../types/kds.type';
import { CheckSquare, Square, X } from 'lucide-react';

interface Props {
  item: IKdsTicketItem;
  orderId?: string;
  onStatusChange: (id: string, newStatus: string) => void;
  onItemCancelRequest?: (orderId: string, itemId: string, reason: string) => void;
  isLoading: boolean;
  isTicketPending?: boolean;
}

export const TicketItemRow = ({ item, orderId, onStatusChange, onItemCancelRequest, isLoading, isTicketPending }: Props) => {
  const isDone = item.status === 'DONE' || item.status === 'SERVED';
  const isCancelled = item.status === 'CANCELLED' || item.status === 'RETURNED';

  const isPreparing = item.status === 'PREPARING';

  const handleClick = () => {
    if (isLoading || isCancelled || isDone || isTicketPending) return;
    if (item.status === 'PENDING') {
      onStatusChange(item.id, 'PREPARING');
    } else if (item.status === 'PREPARING') {
      onStatusChange(item.id, 'DONE');
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || isCancelled || isDone || !onItemCancelRequest || !orderId || isTicketPending) return;
    onItemCancelRequest(orderId, item.id, 'Hết nguyên liệu');
  };

  // Nếu bị huỷ, cho hiển thị màu đỏ mờ thay vì xám mờ như Done
  return (
    <div 
      onClick={handleClick}
      className={`
        flex items-start gap-3 py-1 transition-all duration-200
        ${(isLoading || isTicketPending) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isDone ? 'opacity-60' : ''}
        ${isCancelled ? 'opacity-70' : ''}
      `}
    >
      {/* Square Checkbox */}
      <div className={`mt-0.5 transition-colors ${isDone ? 'text-neutral-500' : isPreparing ? 'text-blue-500' : isCancelled ? 'text-red-400' : 'text-neutral-400'}`}>
        {isDone ? <CheckSquare className="w-5 h-5 md:w-6 md:h-6 fill-neutral-500 text-white" /> : <Square className={`w-5 h-5 md:w-6 md:h-6 ${isPreparing ? "text-blue-200" : ""}`} strokeWidth={isCancelled ? 1 : 2} fill={isPreparing ? 'currentColor' : 'transparent'} />}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1">
            <div className={`font-semibold text-base md:text-[17px] leading-tight 
              ${isDone ? 'line-through text-neutral-500' : isCancelled ? 'line-through text-red-500' : isPreparing ? 'text-blue-700' : 'text-neutral-800'}`
            }>
              {item.itemName}
            </div>
            
            {isPreparing && !isCancelled && !isDone && (
              <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-blue-100 text-blue-700">
                Đang Nấu
              </span>
            )}

            {isCancelled && (
              <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${item.status === 'RETURNED' ? 'bg-amber-100/50 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                {item.status === 'RETURNED' ? 'Bị Trả Lại' : 'Đã Hủy'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {item.quantity > 1 && (
              <div className={`font-bold text-base md:text-[17px] shrink-0 ${isDone ? 'text-neutral-500' : isCancelled ? 'text-red-400' : isPreparing ? 'text-blue-700' : 'text-neutral-800'}`}>
                {item.quantity}x
              </div>
            )}
            
            {/* Nút Từ Chối Item */}
            {!isDone && !isCancelled && (
              <button 
                onClick={handleCancel}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                title="Từ chối món"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
        
        {/* Render Options */}
        {item.options && item.options.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {item.options.map((opt, idx) => (
              <span key={idx} className={`text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide 
                ${isDone ? 'bg-neutral-200 text-neutral-500' : isCancelled ? 'bg-red-50 text-red-400' : 'bg-[#f1f2f6] text-[#57606f]'}`
              }>
                {opt}
              </span>
            ))}
          </div>
        )}

        {/* Render Notes */}
        {item.note && (
          <div className={`text-[11px] md:text-xs mt-1.5 font-medium ${isDone ? 'text-neutral-400' : isCancelled ? 'text-red-300' : 'text-red-500'}`}>
            * {item.note}
          </div>
        )}
      </div>
    </div>
  );
};
