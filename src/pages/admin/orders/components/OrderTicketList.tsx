import { useTranslation } from 'react-i18next'
import { IOrderTicket } from '../types/order.type'
import { Badge } from '@/shared/components/ui/Badge'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useStaff } from '../../staff/hooks/useStaff'

interface Props {
  tickets: IOrderTicket[]
}

export function OrderTicketList({ tickets }: Props) {
  const { t } = useTranslation()
  const { staff } = useStaff()

  const getStaffName = (id?: string) => {
    if (!id) return ''
    const s = staff?.find((x) => x.id === id)
    return s ? s.fullName : `ID: ${id.slice(0, 6)}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          {t('admin.orders.detail.itemsDetails', 'Chi tiết món ăn')}
        </h2>
        <span className="text-sm font-medium text-slate-500">({tickets.reduce((acc, curr) => acc + curr.items.reduce((a, b) => a + b.quantity, 0), 0)} {t('admin.orders.detail.itemsUnit', 'món')})</span>
      </div>
      <div className="space-y-6">
        {tickets.map((ticket, idx) => (
          <div key={ticket.id} className="border border-slate-100 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  {t('admin.orders.drawer.callNumber', { number: ticket.seqNumber || idx + 1 })}
                </span>
                {ticket.createdBy && (
                  <span className="text-[10px] font-medium text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Người tạo: {getStaffName(ticket.createdBy)}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-slate-500">
                {new Date(ticket.createdAt).toLocaleTimeString('vi-VN')}
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {ticket.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  {item.imageUrl ? (
                    <div className="size-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm relative">
                      <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="font-bold text-white text-sm">{item.quantity}x</span>
                      </div>
                    </div>
                  ) : (
                    <div className="size-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0 shadow-sm">
                      {item.quantity}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 text-sm">{item.itemName}</p>
                      {item.station && (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
                          {item.station}
                        </span>
                      )}
                      {(item.isAlertSent || item.kitchenAlertSent) && (
                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" title={t('admin.orders.detail.warningOvertime', 'Quá giờ cảnh báo!')} />
                      )}
                    </div>
                    {item.options?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {item.options.map((o, i) => (
                          <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {o.optionName}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.note && (
                      <p className="text-[11px] text-red-600 mt-2 font-medium bg-red-50 px-2 py-1 rounded-md inline-block">
                        {t('admin.orders.detail.note', 'Ghi chú')}: {item.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 flex flex-col justify-center items-end">
                    <span className="text-sm font-bold text-slate-800">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                    <div className="mt-1 flex flex-col items-end gap-1">
                      {item.status === 'CANCELLED' && (
                        <div className="flex flex-col items-end">
                          <Badge variant="danger" className="text-[10px] px-1.5 py-0">
                            {t('admin.orders.status.cancelled', 'Đã hủy')}
                          </Badge>
                          {item.cancelledBy && (
                            <span className="text-[9px] font-medium text-red-400 mt-0.5">
                              {getStaffName(item.cancelledBy)}
                            </span>
                          )}
                        </div>
                      )}
                      {item.status === 'RETURNED' && (
                        <div className="flex flex-col items-end">
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                            {t('admin.orders.status.returned', 'Đã trả')}
                          </Badge>
                          {item.cancelledBy && (
                            <span className="text-[9px] font-medium text-amber-500 mt-0.5">
                              {getStaffName(item.cancelledBy)}
                            </span>
                          )}
                        </div>
                      )}
                      {item.status === 'SERVED' && (
                        <div className="flex flex-col items-end">
                          {item.servedAt && (
                            <span className="text-[9px] font-medium text-slate-400">
                              {t('admin.orders.detail.servedAt', 'Đã bưng')}: {new Date(item.servedAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                            </span>
                          )}
                          {item.servedBy && (
                            <span className="text-[9px] font-medium text-blue-500">
                              NV: {getStaffName(item.servedBy)}
                            </span>
                          )}
                        </div>
                      )}
                      {item.status === 'COMPLETED' && item.preparedBy && (
                        <span className="text-[9px] font-medium text-green-500 mt-0.5">
                          Bếp: {getStaffName(item.preparedBy)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
