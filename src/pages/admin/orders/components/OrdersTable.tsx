import { useTranslation } from 'react-i18next'
import { IOrder } from '../types/order.type'
import { Eye, Printer } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'

interface Props {
  orders: IOrder[]
  isLoading: boolean
  onViewDetail: (id: string) => void
}

export function OrdersTable({ orders, isLoading, onViewDetail }: Props) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4"><Skeleton className="h-8 w-1/3" /></div>
        <div className="space-y-4 p-4">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex-1 min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="overflow-auto flex-1 relative custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24 whitespace-nowrap">{t('admin.orders.table.id')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t('admin.orders.table.createdAt')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t('admin.orders.table.source')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t('admin.orders.table.table')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">{t('admin.orders.table.total')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{t('admin.orders.table.status')}</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">{t('admin.orders.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <p className="font-semibold text-slate-800">{t('admin.orders.table.empty')}</p>
                    <p className="text-sm mt-1">{t('admin.orders.table.emptyDesc')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-100 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">
                    #{order.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {order.source === 'MANUAL' ? (
                      <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{t('admin.orders.source.pos')}</span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{t('admin.orders.source.qr')}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">
                    {order.orderType === 'TAKEAWAY' ? t('pos.tableMap.takeaway', 'Mang về') : (order.tableNumber || '-')}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-orange-600">
                    {order.total.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                      order.status === 'PAID' ? 'bg-green-50 text-green-700' :
                      order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                      'bg-orange-50 text-orange-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        order.status === 'PAID' ? 'bg-green-500' :
                        order.status === 'CANCELLED' ? 'bg-red-500' :
                        'bg-orange-500'
                      }`}></span>
                      {t(`admin.orders.status.${order.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 justify-end flex gap-2">
                    <button
                      onClick={() => onViewDetail(order.id)}
                      className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                      title={t('admin.orders.table.view')}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                      title={t('admin.orders.table.print')}
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
