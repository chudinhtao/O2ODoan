import { useTranslation } from 'react-i18next'
import { X, Tag } from 'lucide-react'
import { IOrder } from '@/pages/admin/orders/types/order.type'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'

interface Props {
  order: IOrder | null
  isOpen: boolean
  onClose: () => void
}

export function ShiftOrderModal({ order, isOpen, onClose }: Props) {
  const { t, i18n } = useTranslation()

  if (!isOpen || !order) return null

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

  // Aggregate items just like payment panel computation
  const aggregated = order.tickets.flatMap(tk => tk.items || []).reduce((acc: any[], item) => {
    let name = item.itemName
    if (item.options && item.options.length > 0) {
      name += ` (${item.options.map(o => o.optionName).join(', ')})`
    }
    const extraPrice = item.options?.reduce((sum, o) => sum + o.extraPrice, 0) || 0
    const finalPrice = item.unitPrice + extraPrice

    const existing = acc.find(x => x.menuItemId === item.menuItemId && x.name === name && x.unitPrice === finalPrice)
    if (existing) {
      existing.qty += item.quantity
      existing.total += finalPrice * item.quantity
    } else {
      acc.push({
        menuItemId: item.menuItemId,
        name,
        qty: item.quantity,
        unitPrice: finalPrice,
        total: finalPrice * item.quantity
      })
    }
    return acc
  }, [])

  const orderIdPrefix = order.id ? order.id.split('-')[0].toUpperCase() : ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant shrink-0 bg-surface relative">
          <div>
            <h3 className="font-bold text-lg text-on-surface uppercase tracking-tight flex items-center gap-2">
              {t('pos.payment.invoiceDetail', 'Chi tiết hóa đơn')} #{orderIdPrefix}
              {getStatusBadge(order.status)}
            </h3>
            <p className="text-sm text-on-surface-variant font-medium mt-0.5">
              {t('admin.orders.table.table', 'Bàn')}: {order.orderType === 'TAKEAWAY' ? t('pos.tableMap.takeaway', 'Mang về') : (order.tableNumber || '--')} • {formatDateTime(order.createdAt)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-on-surface-variant hover:bg-surface-variant">
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-w-0 bg-surface">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface border-b border-outline-variant z-10">
              <tr className="text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="px-5 py-4">{t('pos.payment.table.item', 'Món ăn')}</th>
                <th className="px-5 py-4 text-center">{t('pos.payment.table.qty', 'SL')}</th>
                <th className="px-5 py-4 text-right">{t('pos.payment.table.price', 'Đơn giá')}</th>
                <th className="px-5 py-4 text-right pr-6">{t('pos.payment.table.total', 'Thành tiền')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {aggregated.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant italic">
                    {t('report.orderModal.noItems', '(Không có món nào được đặt)')}
                  </td>
                </tr>
              )}
              {aggregated.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-variant/20 transition-colors">
                  <td className="px-5 py-4 font-bold text-on-surface max-w-[150px] md:max-w-[250px]" title={item.name}>
                    {item.name}
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-on-surface-variant">{item.qty}</td>
                  <td className="px-5 py-4 text-right font-medium text-on-surface-variant">{formatPrice(item.unitPrice)}</td>
                  <td className="px-5 py-4 text-right font-black text-on-surface tracking-tight pr-6">{formatPrice(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-5 bg-surface-variant/30 border-t border-outline-variant shrink-0 space-y-3">
          <div className="flex justify-between text-sm font-semibold text-on-surface-variant">
             <span>{t('pos.payment.subtotal', 'Tạm tính')}</span>
             <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.total < order.subtotal && (
            <div className="flex justify-between text-sm text-error font-bold">
              <span className="flex items-center gap-1.5">
                <Tag className="size-4" />
                {t('pos.payment.discount', 'Giảm giá')}
              </span>
              <span>-{formatPrice(order.subtotal - order.total)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-semibold text-on-surface-variant italic mt-1">
             <span>{t('report.orderModal.vatLabel', 'Bao gồm VAT (8%)')}</span>
             <span>{formatPrice(Math.round(order.total - (order.total / 1.08)))}</span>
          </div>
          <div className="pt-4 mt-2 border-t border-outline-variant/50 flex justify-between items-center">
             <span className="text-base font-bold text-on-surface uppercase tracking-wider">
               {t('pos.payment.grandTotal', 'Tổng cộng')}
             </span>
             <span className="text-2xl font-black text-primary tracking-tighter">
               {formatPrice(order.total)}
             </span>
          </div>
        </div>
      </div>
    </div>
  )
}
