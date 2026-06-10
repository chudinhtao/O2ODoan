import { IKdsTicketItem } from '../types/kds.type';
import { useState } from 'react';
import { CheckSquare, Square, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';

interface Props {
  item: IKdsTicketItem;
  orderId?: string;
  onStatusChange: (id: string, newStatus: string) => void;
  onItemCancelRequest?: (orderId: string, itemId: string, reason: string) => void;
  isLoading: boolean;
  isTicketPending?: boolean;
}

export const TicketItemRow = ({ item, orderId, onStatusChange, onItemCancelRequest, isLoading, isTicketPending }: Props) => {
  const { t } = useTranslation();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const isDone = item.status === 'DONE' || item.status === 'SERVED';
  const isCancelled = item.status === 'CANCELLED' || item.status === 'RETURNED';

  const isPreparing = item.status === 'PREPARING';

  const handleClick = () => {
    if (isLoading || isCancelled || isTicketPending) return;
    if (item.status === 'PENDING') {
      onStatusChange(item.id, 'PREPARING');
    } else if (item.status === 'PREPARING') {
      onStatusChange(item.id, 'DONE');
    } else if (item.status === 'DONE') {
      onStatusChange(item.id, 'PREPARING'); // Revert back to preparing
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || isCancelled || isDone || !onItemCancelRequest || !orderId || isTicketPending) return;
    setIsCancelConfirmOpen(true);
  };

  const confirmCancel = () => {
    if (!onItemCancelRequest || !orderId) return;
    onItemCancelRequest(orderId, item.id, t('kds.actions.rejectReasonItem', 'Hết nguyên liệu'));
    setIsCancelConfirmOpen(false);
  };

  // Nếu bị huỷ, cho hiển thị màu đỏ mờ thay vì xám mờ như Done
  return (
    <>
      <div 
        onClick={handleClick}
        className={`
        flex items-start gap-4 py-2 px-1 transition-all duration-300 rounded-lg
        ${(isLoading || isTicketPending) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700/50'}
        ${isDone ? 'opacity-50 grayscale' : ''}
        ${isCancelled ? 'opacity-60' : ''}
      `}
    >
      {/* Square Checkbox */}
      <div className={`mt-0.5 transition-all ${isDone ? 'text-emerald-500' : isPreparing ? 'text-blue-400' : isCancelled ? 'text-red-500' : 'text-slate-500'}`}>
        {isDone ? <CheckSquare className="w-6 h-6 md:w-7 md:h-7 fill-emerald-500/20 text-emerald-500" /> : <Square className={`w-6 h-6 md:w-7 md:h-7 ${isPreparing ? "text-blue-400/50 fill-blue-500/20" : ""}`} strokeWidth={isCancelled ? 1 : 2} fill={isPreparing ? 'currentColor' : 'transparent'} />}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className={`font-bold text-lg md:text-xl leading-tight tracking-wide
              ${isDone ? 'line-through text-slate-500' : isCancelled ? 'line-through text-red-400' : isPreparing ? 'text-blue-300' : 'text-slate-100'}`
            }>
              {item.itemName}
            </div>
            
            {isPreparing && !isCancelled && !isDone && (
              <span className="inline-block mt-1 mr-2 text-[11px] font-black px-2 py-0.5 rounded uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {t('kds.item.status.preparing')}
              </span>
            )}

            {item.kitchenAlertSent && !isCancelled && !isDone && (
              <span className="inline-block mt-1 text-[11px] font-black px-2 py-0.5 rounded uppercase bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse">
                {t('kds.item.status.overdue', 'QUÁ LÂU!')}
              </span>
            )}

            {isCancelled && (
              <span className={`inline-block mt-1 text-[11px] font-black px-2 py-0.5 rounded uppercase border ${item.status === 'RETURNED' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                {item.status === 'RETURNED' ? t('kds.item.status.returned') : t('kds.item.status.cancelled')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {item.quantity > 1 && (
              <div className={`font-black text-xl md:text-2xl shrink-0 ${isDone ? 'text-slate-500' : isCancelled ? 'text-red-500' : isPreparing ? 'text-blue-400' : 'text-amber-400'}`}>
                {item.quantity}x
              </div>
            )}
            
            {/* Nút Từ Chối Item */}
            {!isDone && !isCancelled && (
              <button 
                onClick={handleCancel}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-slate-700 hover:border-red-500/30 shadow-sm"
                title={t('kds.actions.reject')}
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
        
        {/* Render Options */}
        {item.options && item.options.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {item.options.map((opt, idx) => (
              <span key={idx} className={`text-[11px] md:text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm border 
                ${isDone ? 'bg-slate-800 text-slate-500 border-slate-700' : isCancelled ? 'bg-red-950/30 text-red-400 border-red-900/50' : 'bg-slate-700 text-slate-300 border-slate-600'}`
              }>
                {opt}
              </span>
            ))}
          </div>
        )}

        {/* Render Notes */}
        {item.note && (
          <div className={`text-xs md:text-sm mt-2 font-bold ${isDone ? 'text-slate-500' : isCancelled ? 'text-red-500' : 'text-amber-400'}`}>
            * {item.note}
          </div>
        )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onCancel={() => setIsCancelConfirmOpen(false)}
        onConfirm={confirmCancel}
        title={t('kds.actions.cancel', 'HỦY MÓN')}
        description={t('kds.confirm.cancelItem', { name: item.itemName, defaultValue: `Bạn có chắc chắn muốn báo hết và HỦY món "${item.itemName}" không?` })}
        confirmText={t('kds.actions.cancel', 'HỦY MÓN')}
        cancelText={t('common.cancel', 'Hủy')}
        variant="danger"
        isLoading={isLoading}
      />
    </>
  );
};
