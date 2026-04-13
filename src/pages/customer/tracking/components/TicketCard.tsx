import {
  Clock, Flame, ChefHat, CheckCircle2, XCircle, RotateCcw, X
} from 'lucide-react'
import { IOrderTicket } from '@/pages/admin/orders/types/order.type'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useState } from 'react'

interface TicketCardProps {
  ticket: IOrderTicket
  index: number
  onCancelTicket?: (ticketId: string) => void
  onCancelItem?: (itemId: string) => void
  isCancellingTicket?: boolean
  isCancellingItem?: boolean
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

type ItemStatus = 'PENDING' | 'PREPARING' | 'DONE' | 'SERVED' | 'CANCELLED' | 'RETURNED'

const ITEM_STATUS_CONFIG: Record<ItemStatus, {
  Icon: React.ElementType
  pill: string
  pulse?: boolean
}> = {
  PENDING:  { Icon: Clock,        pill: 'bg-slate-100 text-slate-500' },
  PREPARING:{ Icon: Flame,        pill: 'bg-orange-100 text-orange-600', pulse: true },
  DONE:     { Icon: ChefHat,      pill: 'bg-lime-100 text-lime-700' },
  SERVED:   { Icon: CheckCircle2, pill: 'bg-green-100 text-green-700' },
  CANCELLED:{ Icon: XCircle,      pill: 'bg-red-100 text-red-500' },
  RETURNED: { Icon: RotateCcw,    pill: 'bg-rose-100 text-rose-600' },
}

const TICKET_STATUS_BADGE: Record<string, { label: string; cls: string; Icon: React.ElementType; pulse?: boolean }> = {
  PENDING:   { label: 'Chờ xác nhận', cls: 'bg-amber-100 text-amber-700',   Icon: Clock,         pulse: false },
  PREPARING: { label: 'Đang chế biến', cls: 'bg-orange-100 text-orange-600', Icon: Flame,         pulse: true  },
  DONE:      { label: 'Đã xong',       cls: 'bg-green-100 text-green-700',   Icon: CheckCircle2,  pulse: false },
  CANCELLED: { label: 'Đã huỷ',        cls: 'bg-red-100 text-red-600',       Icon: XCircle,       pulse: false },
}

const TICKET_LEFT_BORDER: Record<string, string> = {
  PENDING:   'border-amber-400',
  PREPARING: 'border-orange-500',
  DONE:      'border-green-500',
  CANCELLED: 'border-red-400',
}

export function TicketCard({
  ticket, index,
  onCancelTicket, onCancelItem,
  isCancellingTicket, isCancellingItem
}: TicketCardProps) {
  const { t } = useTranslation()
  const [showTicketConfirm, setShowTicketConfirm] = useState(false)
  const [cancelItemTarget, setCancelItemTarget] = useState<{ id: string; name: string } | null>(null)

  const totalAmount = ticket.items.reduce((sum, item) => {
    if (item.status === 'CANCELLED' || item.status === 'RETURNED') return sum
    const base = item.unitPrice + (item.options?.reduce((s, o) => s + o.extraPrice, 0) || 0)
    return sum + base * item.quantity
  }, 0)

  const canCancelTicket = ticket.status === 'PENDING' && !!onCancelTicket
  const badge = TICKET_STATUS_BADGE[ticket.status] ?? TICKET_STATUS_BADGE['PENDING']
  const borderColor = TICKET_LEFT_BORDER[ticket.status] ?? 'border-slate-200'

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-sm border-l-4 ${borderColor} overflow-hidden border border-slate-100`}>

        {/* ── Ticket header ── */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-50">
          <div>
            <p className="font-black text-slate-900 text-[15px] leading-none">
              {t('customer.tracking.ticket.seqNumber', { seq: ticket.seqNumber || index + 1 })}
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5">
              {new Date(ticket.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Status badge */}
          <span className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${badge.cls}`}>
            <badge.Icon
              size={13}
              strokeWidth={2.5}
              className={badge.pulse ? 'animate-pulse' : ''}
            />
            {badge.label}
          </span>
        </div>

        {/* ── Items list ── */}
        <div className="divide-y divide-slate-50 px-4">
          {ticket.items.map(item => {
            const cfg = ITEM_STATUS_CONFIG[item.status as ItemStatus] ?? ITEM_STATUS_CONFIG['PENDING']
            const isCancelled = item.status === 'CANCELLED' || item.status === 'RETURNED'
            const canCancelThisItem = item.status === 'PENDING' && !!onCancelItem

            return (
              <div key={item.id} className="py-3 flex items-center gap-3">
                {/* Qty bubble */}
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-black text-slate-600">{item.quantity}</span>
                </div>

                {/* Name + options */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm leading-snug truncate ${isCancelled ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {item.itemName}
                  </p>
                  {item.options && item.options.length > 0 && (
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.options.map(o => o.optionName).join(' · ')}
                    </p>
                  )}
                </div>

                {/* Price */}
                <span className={`text-sm font-bold shrink-0 ${isCancelled ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                  {fmt((item.unitPrice + (item.options?.reduce((s, o) => s + o.extraPrice, 0) || 0)) * item.quantity)}đ
                </span>

                {/* Item status pill */}
                <span className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${cfg.pill}`}>
                  <cfg.Icon size={11} strokeWidth={2.5} className={cfg.pulse ? 'animate-pulse' : ''} />
                  {t(`customer.tracking.ticket.statusConfig.${item.status}`)}
                </span>

                {/* Cancel item button */}
                {canCancelThisItem && (
                  <button
                    onClick={() => setCancelItemTarget({ id: item.id, name: item.itemName })}
                    disabled={isCancellingItem}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 active:scale-90 transition-all disabled:opacity-40 shrink-0"
                  >
                    <X size={13} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Footer: total + cancel ticket ── */}
        <div className="bg-slate-50/60 px-4 py-3 flex items-center justify-between border-t border-slate-100">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-slate-400 font-medium">{t('customer.tracking.ticket.subtotal')}</span>
              <span className="text-slate-900 font-black text-sm">{fmt(totalAmount)}đ</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium italic mt-0.5">
              (Giá đã bao gồm {fmt(Math.round(totalAmount - (totalAmount / 1.08)))}đ thuế VAT 8%)
            </span>
          </div>
          {canCancelTicket && (
            <button
              onClick={() => setShowTicketConfirm(true)}
              disabled={isCancellingTicket}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 active:scale-95 transition-all border border-red-200 disabled:opacity-50"
            >
              <X size={12} strokeWidth={2.5} />
              {t('customer.tracking.ticket.cancelBtn')}
            </button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={showTicketConfirm}
        title={t('customer.tracking.ticket.confirmCancel.title')}
        description={t('customer.tracking.ticket.confirmCancel.desc', { seq: ticket.seqNumber || index + 1 })}
        confirmText={t('customer.tracking.ticket.confirmCancel.confirm')}
        cancelText={t('customer.tracking.ticket.confirmCancel.cancel')}
        variant="danger"
        isLoading={isCancellingTicket}
        onConfirm={() => { onCancelTicket?.(ticket.id); setShowTicketConfirm(false) }}
        onCancel={() => setShowTicketConfirm(false)}
      />
      <ConfirmDialog
        isOpen={!!cancelItemTarget}
        title={t('customer.tracking.item.confirmCancel.title')}
        description={t('customer.tracking.item.confirmCancel.desc', { name: cancelItemTarget?.name })}
        confirmText={t('customer.tracking.item.confirmCancel.confirm')}
        cancelText={t('customer.tracking.item.confirmCancel.cancel')}
        variant="warning"
        isLoading={isCancellingItem}
        onConfirm={() => { if (cancelItemTarget) onCancelItem?.(cancelItemTarget.id); setCancelItemTarget(null) }}
        onCancel={() => setCancelItemTarget(null)}
      />
    </>
  )
}
