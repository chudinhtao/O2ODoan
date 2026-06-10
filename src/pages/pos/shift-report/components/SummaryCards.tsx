import { useTranslation } from 'react-i18next'
import { TrendingUp } from 'lucide-react'

interface SummaryCardsProps {
  totalRevenue: number
  totalOrders: number
  cashRevenue: number
  qrRevenue: number
  cashOrders: number
  qrOrders: number
}

// Bọc nội dung để tuân thủ thẻ cha min-w-0
export function SummaryCards({ totalRevenue, totalOrders, cashRevenue, qrRevenue, cashOrders, qrOrders }: SummaryCardsProps) {
  const { t } = useTranslation()

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' đ'
  }

  return (
    <>
      <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline-variant min-w-0 h-full">
        <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">
          {t('report.summary.totalRevenue', 'Tổng doanh thu ca')}
        </p>
        <p className="text-xl sm:text-2xl font-headline font-bold text-primary truncate">
          {formatPrice(totalRevenue)}
        </p>
        <div className="mt-2 flex items-center text-xs font-semibold text-success truncate">
          <TrendingUp className="size-3.5 mr-1" />
          {t('report.summary.upLabel', 'Chỉ báo tốt')}
        </div>
      </div>

      <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline-variant min-w-0 h-full">
        <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">
          {t('report.summary.orders', 'Số hóa đơn')}
        </p>
        <p className="text-xl sm:text-2xl font-headline font-bold text-on-surface truncate">
          {totalOrders} {t('report.summary.orderUnit', 'đơn')}
        </p>
        <p className="mt-2 text-xs font-medium text-on-surface-variant truncate">
          <span className="text-on-surface">{t('report.summary.qrPrefix', 'QR:')} {qrOrders}</span> | <span className="text-on-surface">{t('report.summary.cashPrefix', 'Tiền mặt:')} {cashOrders}</span>
        </p>
      </div>

      <div className="bg-surface p-4 rounded-xl shadow-sm border border-outline-variant min-w-0 h-full">
        <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-wider mb-1">
          {t('report.summary.cashRevenue', 'Tiền mặt thu')}
        </p>
        <p className="text-xl sm:text-2xl font-headline font-bold text-on-surface truncate">
          {formatPrice(cashRevenue)}
        </p>
        <p className="mt-2 text-xs font-medium text-on-surface-variant truncate">
          {t('report.summary.nonCash', 'Phi tiền mặt:')}{' '}
          <span className="text-success font-semibold">
            {formatPrice(qrRevenue)} {t('report.summary.qrPayLabel', '(QR Pay)')}
          </span>
        </p>
      </div>
    </>
  )
}
