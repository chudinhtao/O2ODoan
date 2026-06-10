import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { IOrder } from '@/pages/admin/orders/types/order.type'
import { useStoreProfile } from '@/shared/hooks/useStoreProfile'

interface ReceiptPrintProps {
  order: IOrder
  items: { name: string; qty: number; unitPrice: number; total: number }[]
  cashGiven?: number
  paymentMethod?: string
  paymentDetail?: Record<string, number> | null
  excessDeposit?: number
}

// Chuyên dùng để in ra máy in nhiệt 80mm
export const ReceiptPrint = forwardRef<HTMLDivElement, ReceiptPrintProps>(
  ({ order, items, cashGiven = 0, paymentMethod, paymentDetail, excessDeposit = 0 }, ref) => {
    const { t } = useTranslation()
    const { data: profile } = useStoreProfile()
    
    return (
      <div
        ref={ref}
        className="w-[80mm] bg-white text-black font-sans leading-none p-4 mx-auto"
        style={{ color: 'black' }}
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-1 uppercase tracking-wider text-black">
            {profile?.name || 'SUNTIME CAFE'}
          </h2>
          <p className="text-sm text-black">{profile?.address || '123 Street Name, City'}</p>
          <p className="text-sm text-black">Tel: {profile?.phone || '0123 456 789'}</p>
        </div>

        <div className="text-center mb-4 border-b border-black/20 pb-4">
          <h3 className="text-lg font-bold mb-2 text-black">{t('pos.payment.receiptTitle', 'PHIẾU THANH TOÁN')}</h3>
          <p className="text-sm text-black">{t('pos.payment.receiptTable', 'Bàn:')} <span className="font-bold">{order.tableNumber}</span></p>
          <p className="text-sm text-black">{t('pos.payment.receiptInvoice', 'Hóa đơn:')} #{order.id ? order.id.split('-')[0].toUpperCase() : t('pos.payment.newOrder', 'MỚI')}</p>
          <p className="text-sm text-black">{t('pos.payment.receiptOrderType', 'Loại đơn:')} <span className="font-bold">{order.orderType === 'TAKEAWAY' ? t('pos.payment.takeaway', 'MANG ĐI') : t('pos.payment.dineIn', 'TẠI BÀN')}</span></p>
          <p className="text-sm text-black">{t('pos.payment.receiptDate', 'Ngày:')} {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN')}</p>
          {order.cashierId && (
            <p className="text-sm text-black">{t('pos.payment.receiptCashier', 'Thu ngân:')} {order.cashierId.split('-')[0].toUpperCase()}</p>
          )}
        </div>

        <table className="w-full text-sm mb-4 border-b border-black/20 pb-4">
          <thead>
            <tr className="border-b border-black/20">
              <th className="text-left font-bold text-black py-2">{t('pos.payment.receiptItem', 'Món')}</th>
              <th className="text-center font-bold text-black py-2">{t('pos.payment.receiptQty', 'SL')}</th>
              <th className="text-right font-bold text-black py-2">{t('pos.payment.receiptTotal', 'T.Tiền')}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-black/5 last:border-0 align-top">
                <td className="py-2 text-black pr-2">
                  <div className="max-w-[40mm] break-words leading-tight">{item.name}</div>
                  <div className="text-xs text-black/60 mt-1">{item.unitPrice.toLocaleString('vi-VN')}đ</div>
                </td>
                <td className="text-center py-2 text-black font-semibold">{item.qty}</td>
                <td className="text-right py-2 text-black font-bold whitespace-nowrap">
                  {item.total.toLocaleString('vi-VN')}đ
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 mb-6 border-b border-black/20 pb-4">
          <div className="flex justify-between text-sm text-black">
            <span>{t('pos.payment.receiptSubtotal', 'Tạm tính:')}</span>
            <span>{order.subtotal.toLocaleString('vi-VN')}đ</span>
          </div>
          {(order.depositAmount || 0) > 0 && (
            <div className="flex justify-between text-sm text-black">
              <span>Tiền cọc:</span>
              <span>-{(order.depositAmount || 0).toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          {(order.discount || 0) > 0 && (
            <div className="flex justify-between text-sm text-black">
              <span>{t('pos.payment.receiptDiscount', 'Giảm giá:')}</span>
              <span>-{(order.discount || 0).toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          {order.tax !== undefined && order.tax > 0 && (
            <div className="flex justify-between text-sm text-black">
              <span>{t('pos.payment.receiptTax', 'Thuế VAT:')}</span>
              <span>{order.tax.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold mt-2 text-black">
            <span>{t('pos.payment.receiptFinalTotal', 'TỔNG CỘNG:')}</span>
            <span>{order.total.toLocaleString('vi-VN')}đ</span>
          </div>
          
          {paymentMethod === 'MIXED' && paymentDetail ? (
            <div className="pt-2 space-y-1 border-t border-black/10 mt-2">
              <p className="text-xs font-bold text-black uppercase mb-1">{t('pos.payment.paymentBreakdown', 'CHI TIẾT THANH TOÁN:')}</p>
              <div className="flex justify-between text-sm text-black">
                <span>{t('pos.payment.receiptCashPart', 'Tiền mặt:') || 'Tiền mặt:'}</span>
                <span>{(paymentDetail.CASH || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-sm text-black">
                <span>{t('pos.payment.receiptQrPart', 'Chuyển khoản:') || 'Chuyển khoản:'}</span>
                <span>{(paymentDetail.QR || 0).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          ) : (
            cashGiven > 0 && (
              <>
                <div className="flex justify-between text-sm text-black mt-2">
                  <span>{t('pos.payment.receiptCashGiven', 'Tiền khách đưa:')}</span>
                  <span>{cashGiven.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm text-black">
                  <span>{t('pos.payment.receiptChange', 'Tiền thừa:')}</span>
                  <span>{(Math.max(0, cashGiven - order.total) + excessDeposit).toLocaleString('vi-VN')}đ</span>
                </div>
              </>
            )
          )}
          {excessDeposit > 0 && !(cashGiven > 0) && (
            <div className="flex justify-between text-sm text-black mt-2 font-bold">
              <span>{t('pos.payment.excessDeposit', 'Tiền cọc thừa cần hoàn:')}</span>
              <span>{excessDeposit.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
        </div>

        <div className="text-center text-sm mb-2 text-black">
          <p className="font-bold">{t('pos.payment.receiptThankYou', 'Cảm ơn quý khách!')}</p>
          <p>{t('pos.payment.receiptSeeYou', 'Hẹn gặp lại')}</p>
        </div>
      </div>
    )
  }
)

ReceiptPrint.displayName = 'ReceiptPrint'
