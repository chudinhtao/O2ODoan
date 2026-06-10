import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Clock } from 'lucide-react'
import { useOrderDetails, useOrderTimeline } from '../hooks/useOrders'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Badge } from '@/shared/components/ui/Badge'

import { OrderTicketList } from '../components/OrderTicketList'
import { OrderPaymentSummary } from '../components/OrderPaymentSummary'
import { OrderAuditTimeline } from '../components/OrderAuditTimeline'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: order, isLoading } = useOrderDetails(id)
  const { data: timeline } = useOrderTimeline(id)

  if (isLoading || !order) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')} className="shrink-0">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800">
                {t('admin.orders.drawer.title')} <span className="text-primary">#{order.id?.slice(-8).toUpperCase()}</span>
              </h1>
              <Badge variant={order.status === 'PAID' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'info'}>
                {t(`admin.orders.status.${order.status.toLowerCase()}`)}
              </Badge>
              <Badge variant="neutral" className="text-slate-500 bg-white">
                {order.source === 'QR' ? 'QR Code' : 'POS'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500">
              <Clock className="w-4 h-4" />
              {new Date(order.createdAt).toLocaleString('vi-VN')}
              <span className="text-slate-300">•</span>
              {order.orderType === 'TAKEAWAY' ? t('pos.tableMap.takeaway', 'Mang về') : `${t('admin.orders.table.table')} ${order.tableNumber || '-'}`}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 h-[calc(100vh-80px)] overflow-hidden">
        <div className="w-full max-w-[1920px] h-full mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-auto">
            
            {/* Left Column: Items & Timeline */}
            <div className="lg:col-span-8 xl:col-span-9 border-r border-slate-100 flex flex-col">
              <div className="p-8 space-y-12">
                <OrderTicketList tickets={order.tickets} />
                <div className="pt-8 border-t border-slate-100">
                  <OrderAuditTimeline timeline={timeline || []} />
                </div>
              </div>
            </div>

            {/* Right Column: Payment Details */}
            <div className="lg:col-span-4 xl:col-span-3 bg-slate-50/30">
              <div className="p-8 sticky top-0">
                <OrderPaymentSummary order={order} />
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
