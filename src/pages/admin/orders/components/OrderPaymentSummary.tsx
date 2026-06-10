import { useTranslation } from 'react-i18next'
import { Ban } from 'lucide-react'
import { IOrder } from '../types/order.type'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useStaff } from '../../staff/hooks/useStaff'

interface Props {
  order: IOrder
}

export function OrderPaymentSummary({ order }: Props) {
  const { t } = useTranslation()
  const { staff } = useStaff()

  const getCashierName = (id: string) => {
    const cashier = staff?.find(s => s.id === id)
    return cashier ? cashier.fullName : `ID: ${id.slice(0, 6)}`
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          {t('admin.orders.detail.paymentSummary', 'Thanh toán & Hoá đơn')}
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">{t('admin.orders.drawer.subtotal', 'Tạm tính')}</span>
          <span className="font-bold text-slate-700">{formatCurrency(order.subtotal)}</span>
        </div>
        {(order.discount || 0) > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-red-500 flex items-center gap-1">
              {t('admin.orders.detail.discount', 'Giảm giá')}
              {order.promotionCode && (
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold group relative cursor-help">
                  {order.promotionCode}
                  {order.minOrderAmount && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center font-normal shadow-xl">
                      Min Order: {formatCurrency(order.minOrderAmount)}
                      {order.maxDiscountValue ? ` | Max: ${formatCurrency(order.maxDiscountValue)}` : ''}
                    </span>
                  )}
                </span>
              )}
            </span>
            <span className="font-bold text-red-600">-{formatCurrency(order.discount || 0)}</span>
          </div>
        )}
        {(order.serviceFee || 0) > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">{t('admin.orders.detail.serviceFee', 'Phí dịch vụ')}</span>
            <span className="font-bold text-slate-700">{formatCurrency(order.serviceFee || 0)}</span>
          </div>
        )}
        {(order.tax || 0) > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">{t('admin.orders.detail.tax', 'Thuế GTGT (VAT)')}</span>
            <span className="font-bold text-slate-700">{formatCurrency(order.tax || 0)}</span>
          </div>
        )}
        <div className="pt-4 border-t border-slate-200 border-dashed flex justify-between items-center">
          <span className="text-base font-bold text-slate-800 uppercase tracking-wide">
            {t('admin.orders.drawer.total', 'Tổng cộng')}
          </span>
          <span className="text-3xl font-black text-slate-900">{formatCurrency(order.total)}</span>
        </div>

        {order.status === 'PAID' && (
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex justify-between text-sm items-start">
              <span className="text-slate-500 mt-1">{t('admin.orders.detail.paymentMethod', 'Hình thức')}</span>
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {order.paymentMethod === 'CASH' 
                    ? t('admin.orders.detail.cash', 'Tiền mặt') 
                    : order.paymentMethod === 'MIXED'
                    ? t('admin.orders.detail.mixed', 'Thanh toán hỗn hợp')
                    : t('admin.orders.detail.transfer', 'Chuyển khoản (PayOS)')}
                </span>
                {order.paymentMethod === 'MIXED' && order.paymentDetail && (
                  <div className="text-[10px] text-slate-500 text-right bg-slate-50 p-2 rounded-lg border border-slate-100 w-full">
                    {(() => {
                      try {
                        const parsed = JSON.parse(order.paymentDetail)
                        return Object.entries(parsed).map(([key, val]) => (
                          <div key={key} className="flex justify-between gap-4">
                            <span className="capitalize">{key}:</span>
                            <span className="font-bold text-slate-700">{formatCurrency(Number(val))}</span>
                          </div>
                        ))
                      } catch {
                        return <span>{order.paymentDetail}</span>
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>
            {order.paidAt && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('admin.orders.detail.paymentTime', 'Thời gian')}</span>
                <span className="font-bold text-slate-800">{new Date(order.paidAt).toLocaleString('vi-VN')}</span>
              </div>
            )}
            {order.cashierId && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{t('admin.orders.detail.cashier', 'Thu ngân')}</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {getCashierName(order.cashierId)}
                </span>
              </div>
            )}
          </div>
        )}

        {order.status === 'CANCELLED' && (
          <div className="mt-4 pt-4 border-t border-slate-100 bg-red-50/50 p-4 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Ban className="w-4 h-4" />
              <span className="font-bold text-sm">{t('admin.orders.detail.cancelledTitle', 'Đơn đã huỷ')}</span>
            </div>
            <p className="text-xs text-red-700 font-medium leading-relaxed">
              {t('admin.orders.detail.reason', 'Lý do')}: {order.cancelReason || t('admin.orders.detail.noReason', 'Không có lý do')}
            </p>
            {order.cancelledBy && (
              <p className="text-[10px] text-red-500 mt-2 font-bold uppercase tracking-wider">
                {t('admin.orders.detail.cancelledBy', 'Bởi: ')} {getCashierName(order.cancelledBy)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
