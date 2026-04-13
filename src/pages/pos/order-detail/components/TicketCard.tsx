import { useTranslation } from 'react-i18next'
import { CheckCircle2, ChefHat, Ban, Clock, X, StickyNote } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { IOrderTicket } from '@/pages/admin/orders/types/order.type'

export const TICKET_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  // Ticket / Item status
  PENDING:    { label: 'Chờ bếp',   cls: 'bg-amber-100 text-amber-700' },
  IN_PROGRESS:{ label: 'Đang làm',  cls: 'bg-blue-100 text-blue-700' },
  PREPARING:  { label: 'Đang làm',  cls: 'bg-blue-100 text-blue-700' }, // Đồng bộ với KDS
  DONE:       { label: 'Xong',      cls: 'bg-emerald-100 text-emerald-700' },
  COMPLETED:  { label: 'Xong',      cls: 'bg-emerald-100 text-emerald-700' },
  SERVED:     { label: 'Đã lên món', cls: 'bg-emerald-100 text-emerald-700' }, // Đã bưng
  CANCELLED:  { label: 'Đã huỷ',   cls: 'bg-error-container text-on-error-container' },
  RETURNED:   { label: 'Đã trả hàng', cls: 'bg-outline-variant/30 text-on-surface-variant' },
  // Order status
  OPEN:       { label: 'Đang mở',   cls: 'bg-blue-100 text-blue-700' },
  PAYMENT_REQUESTED: { label: 'Chờ thu ngân', cls: 'bg-amber-100 text-amber-700' },
  PAID:       { label: 'Đã TT', cls: 'bg-emerald-100 text-emerald-700' },
}

export function TicketStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation()
  const upperStatus = status?.toUpperCase() || ''
  const s = TICKET_STATUS_MAP[upperStatus] ?? { label: upperStatus, cls: 'bg-surface-variant text-on-surface-variant' }
  const translatedLabel = t(`pos.orderDetail.status.${upperStatus.toLowerCase()}`, s.label)
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{translatedLabel}</span>
}

export function TicketCard({ 
  ticket, 
  idx, 
  onCancelItem, 
  onReturnItem,
  onCancelTicket,
  orderStatus 
}: { 
  ticket: IOrderTicket
  idx: number
  onCancelItem: (itemId: string, name: string, status: string) => void
  onReturnItem: (itemId: string, name: string) => void
  onCancelTicket: (ticketId: string, idx: number) => void
  orderStatus: string 
}) {
  const { t } = useTranslation()
  const tickStat = ticket.status?.toUpperCase() || ''
  const Icon = tickStat === 'DONE' || tickStat === 'COMPLETED' || tickStat === 'SERVED' ? CheckCircle2
    : tickStat === 'IN_PROGRESS' || tickStat === 'PREPARING' ? ChefHat
    : tickStat === 'CANCELLED' ? Ban : Clock

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-sm transition-all hover:shadow-md">
      {/* Ticket Header - More compact */}
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container/50 border-b border-outline-variant/50">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${tickStat === 'DONE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
            <Icon className="size-4" />
          </div>
          <span className="text-sm font-black text-on-surface tracking-tight uppercase">
            {t('pos.orderDetail.ticket', { index: idx + 1 })}
          </span>
          <span className="text-[10px] font-bold text-outline px-1.5 py-0.5 bg-surface-variant rounded-md">
            {new Date(ticket.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {orderStatus === 'OPEN' && tickStat !== 'CANCELLED' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancelTicket(ticket.id, idx)}
              className="h-7 !text-error/70 hover:!text-error hover:!bg-error/10 !bg-transparent text-[11px] font-black px-2 rounded-lg transition-all"
            >
              {t('common.cancel', 'Huỷ phiếu')}
            </Button>
          )}
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Item List - Denser padding */}
      <div className="divide-y divide-outline-variant/20 px-4 bg-surface-container-lowest/30">
        {ticket.items.map(item => (
          <div key={item.id} className="py-2.5 flex justify-between items-center group">
            <div className="min-w-0 flex-1 flex items-start gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-black text-primary leading-none mr-1">{item.quantity}×</span>
                  <span className="text-sm font-bold text-on-surface leading-tight">{item.itemName}</span>
                  <TicketStatusBadge status={item.status} />
                </div>
                
                {item.options?.length > 0 && (
                  <p className="text-[11px] text-outline font-medium mt-0.5 leading-tight">
                    {item.options.map(o => o.optionName).join(', ')}
                  </p>
                )}
                
                {item.note && (
                  <div className="flex items-center gap-1.5 mt-1 bg-error/5 border border-error/10 w-fit px-2 py-0.5 rounded-md">
                    <StickyNote className="size-2.5 text-error opacity-70" />
                    <p className="text-[10px] font-bold text-error italic leading-none">{item.note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-4">
              <span className="text-sm font-black text-on-surface-variant tracking-tight">
                {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
              </span>
              
              {orderStatus === 'OPEN' && item.status?.toUpperCase() !== 'CANCELLED' && item.status?.toUpperCase() !== 'RETURNED' && (
                <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                  {(() => {
                    const s = item.status?.toUpperCase() || ''
                    if (s === 'DONE' || s === 'COMPLETED' || s === 'SERVED') {
                      return (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReturnItem(item.id, item.itemName)}
                          className="size-8 rounded-lg !bg-amber-500/10 !text-amber-600 hover:!bg-amber-600 hover:!text-white transition-all"
                        >
                          <Ban className="size-3.5 stroke-[3]" />
                        </Button>
                      );
                    }
                    
                    return (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCancelItem(item.id, item.itemName, ticket.status)}
                        className="size-8 rounded-lg !bg-error/10 !text-error hover:!bg-error hover:!text-white transition-all"
                      >
                        <X className="size-4 stroke-[3]" />
                      </Button>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

