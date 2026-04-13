import { useTranslation } from 'react-i18next'
import { BarChart, QrCode, Banknote } from 'lucide-react'

interface PaymentBreakdownProps {
  totalRevenue: number
  cashRevenue: number
  qrRevenue: number
}

// Bọc nội dung để tuân thủ thẻ cha min-w-0
export function PaymentBreakdown({ totalRevenue, cashRevenue, qrRevenue }: PaymentBreakdownProps) {
  const { t, i18n } = useTranslation()

  const qrPercent = totalRevenue > 0 ? Math.round((qrRevenue / totalRevenue) * 100) : 0
  const cashPercent = totalRevenue > 0 ? Math.round((cashRevenue / totalRevenue) * 100) : 0

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND',
      currencyDisplay: 'symbol'
    }).format(amount)
  }

  return (
    <div className="bg-surface p-6 rounded-xl shadow-sm border border-outline-variant min-w-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-on-surface flex items-center gap-2">
          <BarChart className="text-primary size-5" />
          {t('report.breakdown.title', 'Doanh thu theo nguồn')}
        </h3>
      </div>

      <div className="space-y-6">
        {/* QR */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-on-surface-variant flex items-center gap-2">
              <QrCode className="size-4" />
              {t('report.breakdown.qr', 'QR (phi tiền mặt)')}
            </span>
            <span className="font-bold text-on-surface">
              {formatPrice(qrRevenue)} ({qrPercent}%)
            </span>
          </div>
          <div className="w-full bg-surface-variant h-3 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${qrPercent}%` }}></div>
          </div>
        </div>

        {/* CASH */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-on-surface-variant flex items-center gap-2">
              <Banknote className="size-4" />
              {t('report.breakdown.cash', 'POS (tiền mặt)')}
            </span>
            <span className="font-bold text-on-surface">
              {formatPrice(cashRevenue)} ({cashPercent}%)
            </span>
          </div>
          <div className="w-full bg-surface-variant h-3 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${cashPercent}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
