import { Coffee } from 'lucide-react'
import { IOrder } from '@/pages/admin/orders/types/order.type'
import { useTranslation } from 'react-i18next'

interface InvoiceCardProps {
  order: IOrder
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

export function InvoiceCard({ order }: InvoiceCardProps) {
  const { t } = useTranslation()

  // Aggregate items — skip CANCELLED / RETURNED
  const itemsMap: Record<string, { name: string; quantity: number; lineTotal: number }> = {}
  order.tickets.forEach(ticket => {
    ticket.items.forEach(item => {
      if (item.status === 'CANCELLED' || item.status === 'RETURNED') return
      const key = `${item.menuItemId}-${item.options?.map(o => o.optionName).join(',')}`
      const price = item.unitPrice + (item.options?.reduce((s, o) => s + o.extraPrice, 0) || 0)
      if (itemsMap[key]) {
        itemsMap[key].quantity += item.quantity
        itemsMap[key].lineTotal += price * item.quantity
      } else {
        itemsMap[key] = { name: item.itemName, quantity: item.quantity, lineTotal: price * item.quantity }
      }
    })
  })

  const aggregated = Object.values(itemsMap)

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Receipt header */}
      <div className="bg-gradient-to-br from-[#ff7a00] to-[#ff5000] px-6 py-5 flex items-center gap-4">
        <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          <Coffee size={22} className="text-white" strokeWidth={2} />
        </div>
        <div className="text-white">
          <h2 className="font-black text-lg leading-tight">{t('customer.invoice.brand')}</h2>
          <p className="text-white/70 text-xs font-medium mt-0.5">
            #{order.id.slice(0, 6).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString('vi-VN')} · Bàn {order.tableNumber}
          </p>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Items list */}
        <div className="space-y-2.5">
          {aggregated.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-3">Chưa có món nào</p>
          ) : aggregated.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center">
                  {item.quantity}
                </span>
                <span className="text-sm text-slate-700 font-medium truncate">{item.name}</span>
              </div>
              <span className="text-sm font-bold text-slate-800 shrink-0 ml-2">{fmt(item.lineTotal)}đ</span>
            </div>
          ))}
        </div>

        {/* Dashed separator */}
        <div
          className="my-4"
          style={{
            backgroundImage: 'linear-gradient(to right, #e2e8f0 50%, transparent 0%)',
            backgroundSize: '10px 1px',
            backgroundRepeat: 'repeat-x',
            height: '1px',
          }}
        />

        {/* Subtotals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">{t('customer.invoice.subtotal')}</span>
            <span className="text-slate-700 font-medium">{fmt(order.subtotal)}đ</span>
          </div>
          {!!order.discount && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('customer.invoice.discount')}</span>
              <span className="text-emerald-600 font-bold">-{fmt(order.discount)}đ</span>
            </div>
          )}
        </div>

        {/* Total & VAT */}
        <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('customer.invoice.total')}</span>
            <span className="text-2xl font-black text-guest-primary">{fmt(order.total)}đ</span>
          </div>
          <div className="text-right mt-1">
            <span className="text-[10px] text-slate-400 font-medium italic">
              (Giá đã bao gồm {fmt(Math.round(order.total - (order.total / 1.08)))}đ thuế VAT 8%)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
