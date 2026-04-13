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
  const { t, i18n } = useTranslation()

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
      currencyDisplay: 'symbol'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Doanh thu */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant min-w-0">
        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
          {t('report.summary.totalRevenue', 'Tổng doanh thu ca')}
        </p>
        <p className="text-3xl font-headline font-bold text-primary truncate">
          {formatPrice(totalRevenue)}
        </p>
        <div className="mt-3 flex items-center text-xs font-semibold text-success truncate">
          <TrendingUp className="size-4 mr-1" />
          {t('report.summary.upLabel', 'Chỉ báo tốt')}
        </div>
      </div>

      {/* Số hóa đơn */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant min-w-0">
        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
          {t('report.summary.orders', 'Số hóa đơn')}
        </p>
        <p className="text-3xl font-headline font-bold text-on-surface truncate">
          {totalOrders} {t('report.summary.orderUnit', 'đơn')}
        </p>
        <p className="mt-3 text-xs font-medium text-on-surface-variant truncate">
          <span className="text-on-surface">{t('report.summary.qrPrefix', 'QR:')} {qrOrders}</span> | <span className="text-on-surface">{t('report.summary.cashPrefix', 'Tiền mặt:')} {cashOrders}</span>
        </p>
      </div>

      {/* Tiền mặt thu */}
      <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant min-w-0">
        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2">
          {t('report.summary.cashRevenue', 'Tiền mặt thu')}
        </p>
        <p className="text-3xl font-headline font-bold text-on-surface truncate">
          {formatPrice(cashRevenue)}
        </p>
        <p className="mt-3 text-xs font-medium text-on-surface-variant truncate">
          {t('report.summary.nonCash', 'Phi tiền mặt:')}{' '}
          <span className="text-success font-semibold">
            {formatPrice(qrRevenue)} {t('report.summary.qrPayLabel', '(QR Pay)')}
          </span>
        </p>
      </div>
    </div>
  )
}
