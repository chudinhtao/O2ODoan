import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import type { IOrder, IOrderTicketItem } from '@/pages/admin/orders/types/order.type'

const STATUS_MAP: Record<string, { labelKey: string, defaultLabel: string, color: string, dot: string, icon: string, descKey: string, defaultDesc: string }> = {
  PENDING: { labelKey: 'customer.status.pending', defaultLabel: 'Chờ tiếp nhận', color: 'bg-slate-50 text-slate-600', dot: 'bg-slate-400', icon: 'pending_actions', descKey: 'customer.status.pendingDesc', defaultDesc: 'Đang đợi nhà hàng xác nhận...' },
  PREPARING: { labelKey: 'customer.status.preparing', defaultLabel: 'Đang chuẩn bị', color: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500', icon: 'skillet', descKey: 'customer.status.preparingDesc', defaultDesc: 'Bếp đang làm món...' },
  READY: { labelKey: 'customer.status.ready', defaultLabel: 'Chờ phục vụ', color: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500', icon: 'room_service', descKey: 'customer.status.readyDesc', defaultDesc: 'Đã chuẩn bị xong, chờ mang ra...' },
  SERVED: { labelKey: 'customer.status.served', defaultLabel: 'Đã lên món', color: 'bg-green-50 text-green-600', dot: 'bg-green-500', icon: 'check_circle', descKey: 'customer.status.servedDesc', defaultDesc: 'Chúc bạn ngon miệng!' },
  COMPLETED: { labelKey: 'customer.status.completed', defaultLabel: 'Hoàn tất', color: 'bg-green-50 text-green-600', dot: 'bg-green-500', icon: 'check_circle', descKey: 'customer.status.completedDesc', defaultDesc: 'Hoàn tất' },
  RETURNED: { labelKey: 'customer.status.returned', defaultLabel: 'Bị trả lại', color: 'bg-red-50 text-red-600', dot: 'bg-red-500', icon: 'error', descKey: 'customer.status.returnedDesc', defaultDesc: 'Có sự cố với món ăn' },
  CANCELLED: { labelKey: 'customer.status.cancelled', defaultLabel: 'Đã hủy', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400', icon: 'cancel', descKey: 'customer.status.cancelledDesc', defaultDesc: 'Đã hủy' },
}

export function RecentOrderSummary({ sessionOrder, isLoading }: { sessionOrder?: IOrder, isLoading: boolean }) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="px-4 mb-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">
          {t('customer.home.recentOrders', 'Đơn hàng gần đây')}
        </h3>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (!sessionOrder?.tickets || sessionOrder.tickets.length === 0) {
    return null
  }

  // Find the latest ticket
  const sortedTickets = [...sessionOrder.tickets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const latestTicket = sortedTickets[0]

  if (!latestTicket?.items || latestTicket.items.length === 0) {
    return null
  }

  // Show up to 2 items from the latest ticket
  const displayItems = latestTicket.items.slice(0, 2)
  const hasMore = latestTicket.items.length > 2

  // Derive overall ticket status info
  const statusInfo = STATUS_MAP[latestTicket.status] || STATUS_MAP.PENDING

  return (
    <div className="px-4 mb-6">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">
        {t('customer.home.recentOrders', 'Đơn hàng gần đây')}
      </h3>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex justify-between items-center">
          <span className="font-bold text-sm text-slate-800">
            {t('customer.home.orderSeq', { defaultValue: 'Lần gọi #{{seq}}', seq: latestTicket.seqNumber })} — {format(new Date(latestTicket.createdAt), 'HH:mm')}
          </span>
          <span className="text-xs bg-slate-100 px-2 py-1 rounded font-medium text-slate-600">
            {t('customer.home.new', 'Mới nhất')}
          </span>
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-4 mb-3">
            {displayItems.map((item: IOrderTicketItem) => {
              const itemStatus = STATUS_MAP[item.status] || STATUS_MAP.PENDING
              const isDrink = item.itemName.toLowerCase().match(/(trà|cà phê|coffee|nước|sinh tố)/)
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="size-10 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center">
                      <span className="material-symbols-outlined text-guest-primary text-xl">
                        {isDrink ? 'coffee' : 'restaurant'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-sm truncate text-slate-800">{item.itemName} &times; {item.quantity}</p>
                      {item.note && <p className="text-xs text-slate-400 truncate">{item.note}</p>}
                    </div>
                  </div>
                  <div className={`flex shrink-0 items-center gap-1.5 px-2 py-1 rounded-full ${itemStatus.color} text-xs font-bold`}>
                    <span className={`size-1.5 rounded-full ${itemStatus.dot}`}></span>
                    {t(itemStatus.labelKey, itemStatus.defaultLabel)}
                  </div>
                </div>
              )
            })}

            {hasMore && (
              <p className="text-xs text-slate-500 italic text-center mt-1">
                + {latestTicket.items.length - 2} {t('customer.home.moreItems', 'món khác')}
              </p>
            )}
          </div>
          <div className={`flex items-center gap-2 ${statusInfo.color.split(' ')[1]} text-xs font-semibold pt-3 border-t border-slate-50`}>
            <span className="material-symbols-outlined text-sm">{statusInfo.icon}</span>
            {t(statusInfo.descKey, statusInfo.defaultDesc)}
          </div>
        </div>
      </div>
    </div>
  )
}
