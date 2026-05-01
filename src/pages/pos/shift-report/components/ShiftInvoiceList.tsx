import { useTranslation } from 'react-i18next'
import { useShiftOrders } from '../hooks/useShiftOrders'
import { Badge } from '@/shared/components/ui/Badge'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { useState } from 'react'
import { IOrder } from '@/pages/admin/orders/types/order.type'
import { ShiftOrderModal } from './ShiftOrderModal'

export function ShiftInvoiceList({ date }: { date: string }) {
  const { t, i18n } = useTranslation()
  const { data, isLoading, error } = useShiftOrders(date)
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
      currencyDisplay: 'symbol'
    }).format(amount)
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')
  }

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant shrink-0">
           <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-error/20 overflow-hidden text-center p-8">
        <p className="text-error font-medium">{t('report.page.invoiceError', 'Không thể tải danh sách hóa đơn.')}</p>
      </div>
    )
  }

  const invoices = data?.content || []

  if (invoices.length === 0) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden p-8 text-center flex flex-col items-center justify-center text-on-surface-variant">
        <p className="font-medium">{t('report.page.noInvoices', 'Trống')}</p>
        <p className="text-sm mt-1">{t('report.page.noInvoicesDesc', 'Chưa có hóa đơn nào được chốt trong ca này.')}</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">{t('admin.orders.status.paid', 'Đã TTS')}</Badge>
      case 'MERGED':
        return <Badge variant="neutral">{t('admin.orders.status.merged', 'Đã Gộp')}</Badge>
      case 'CANCELLED':
        return <Badge variant="danger">{t('admin.orders.status.cancelled', 'Đã hủy')}</Badge>
      case 'PAYMENT_REQUESTED':
        return <Badge variant="warning">{t('admin.orders.status.payment_requested', 'Chờ TT')}</Badge>
      default:
        return <Badge variant="info">{t('admin.orders.status.open', 'Đang dùng')}</Badge>
    }
  }

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col min-h-0 relative print:border-none print:shadow-none">
      <div className="p-4 border-b border-outline-variant bg-surface shrink-0 sticky top-0 z-10 hidden md:block print:border-b-2 print:border-black">
        <div className="grid grid-cols-5 gap-4 font-semibold text-sm text-on-surface-variant">
          <div>{t('admin.orders.table.id', 'Mã Đơn')}</div>
          <div>{t('admin.orders.table.createdAt', 'Thời gian')}</div>
          <div>{t('admin.orders.table.table', 'Bàn')}</div>
          <div>{t('admin.orders.table.total', 'Tổng tiền')}</div>
          <div>{t('admin.orders.table.status', 'Trạng thái')}</div>
        </div>
      </div>
      <div className="divide-y divide-outline-variant overflow-y-auto max-h-[400px] print:max-h-none print:overflow-visible">
        {invoices.map((invoice) => (
          <div 
            key={invoice.id} 
            onClick={() => setSelectedOrder(invoice)}
            className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 md:items-center hover:bg-surface-variant/50 cursor-pointer transition-colors"
          >
            <div className="font-mono text-sm text-on-surface">
              <span className="md:hidden text-on-surface-variant mr-2">ID:</span>
              #{invoice.id.substring(0, 8)}
            </div>
            <div className="text-sm text-on-surface-variant">
              {formatDateTime(invoice.createdAt)}
            </div>
            <div className="text-sm font-medium text-on-surface capitalize">
              <span className="md:hidden text-on-surface-variant mr-2">{t('admin.orders.table.table', 'Bàn')}:</span>
              {invoice.orderType === 'TAKEAWAY' ? t('pos.tableMap.takeaway', 'Mang về') : (invoice.tableNumber || '--')}
            </div>
            <div className="text-sm font-bold text-primary">
              <span className="md:hidden text-on-surface-variant mr-2 font-normal">{t('admin.orders.table.total', 'Tổng tiền')}:</span>
              {formatPrice(invoice.total)}
            </div>
            <div>
              {getStatusBadge(invoice.status)}
            </div>
          </div>
        ))}
      </div>
      <ShiftOrderModal 
        isOpen={selectedOrder !== null} 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  )
}
