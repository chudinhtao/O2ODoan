import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Calendar, Printer, LogOut, AlertCircle } from 'lucide-react'
import { useShiftReport } from '../hooks/useShiftReport'
import { SummaryCards } from '../components/SummaryCards'
import { PaymentBreakdown } from '../components/PaymentBreakdown'
import { ShiftInvoiceList } from '../components/ShiftInvoiceList'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { toast } from 'sonner'
import { ErrorBoundary } from 'react-error-boundary'
import { logout } from '@/store/slices/auth.slice'
import { queryClient } from '@/providers/AppProviders'
import { ROUTES } from '@/shared/constants/ROUTES'

import { timeService } from '@/services/time.service'

function ShiftReportContent() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Sử dụng giờ server để lấy ngày hiện tại
  const serverNow = new Date(timeService.getNow())
  const today = serverNow.toLocaleDateString('en-CA') // YYYY-MM-DD
  
  const { data: report, isLoading, error } = useShiftReport(today)
  const [showEndShift, setShowEndShift] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')
  }

  const handleEndShift = () => {
    toast.success(t('report.page.endShiftSuccess', 'Đã kết ca thành công!'))
    setShowEndShift(false)
    dispatch(logout())
    queryClient.clear()
    navigate(ROUTES.login)
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-8 space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-error">
        <AlertCircle className="size-10 opacity-80" />
        <p className="font-medium text-sm">{t('report.page.error', 'Không thể tải dữ liệu ca làm, vui lòng thử lại!')}</p>
      </div>
    )
  }

  const cashRevenue = report.revenueByPaymentMethod?.['CASH'] || 0
  const qrRevenue = report.totalRevenue - cashRevenue // Aggregate the rest as QR/Transfer
  const cashOrders = report.ordersByPaymentMethod?.['CASH'] || 0
  const qrOrders = report.totalOrders - cashOrders

  return (
    <>
      {/* Header - hide on print */}
      <header className="bg-surface border-b border-outline-variant px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 print:hidden">
        <div className="mb-4 md:mb-0 min-w-0">
          <h2 className="text-2xl font-headline font-bold text-on-surface truncate">
            {t('report.page.title', 'Báo cáo ca — Thu Ngân')}
          </h2>
          <p className="text-on-surface-variant text-sm mt-1 flex items-center gap-2 truncate">
            <Calendar className="size-4 shrink-0" />
            {t('report.page.shiftTime', 'Ca hiện tại: {{date}}', { date: formatDisplayDate(serverNow) })}
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" className="gap-2 shadow-sm font-semibold" onClick={handlePrint}>
            <Printer className="size-4" />
            {t('report.page.print', 'In báo cáo')}
          </Button>
          <Button 
            className="gap-2 shadow-sm font-semibold bg-error hover:bg-error/90 text-error-content"
            onClick={() => setShowEndShift(true)}
          >
            <LogOut className="size-4" />
            {t('report.page.endShift', 'Kết ca')}
          </Button>
        </div>
      </header>

      {/* Scrollable Area - This is what will be printed */}
      <div ref={reportRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-surface-variant/30 print:bg-white print:p-0 print:overflow-visible">
        {/* Print Only Header */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-bold">{t('report.page.title', 'Báo cáo ca — Thu Ngân')}</h1>
          <p className="text-sm mt-1">{formatDisplayDate(serverNow)}</p>
        </div>

        <SummaryCards
          totalRevenue={report.totalRevenue}
          totalOrders={report.totalOrders}
          cashRevenue={cashRevenue}
          qrRevenue={qrRevenue}
          cashOrders={cashOrders}
          qrOrders={qrOrders}
        />
        
        <div className="grid grid-cols-1 gap-6">
          <PaymentBreakdown
            totalRevenue={report.totalRevenue}
            cashRevenue={cashRevenue}
            qrRevenue={qrRevenue}
          />
        </div>

        {/* Invoice List */}
        <ShiftInvoiceList date={today} />
      </div>

      <ConfirmDialog
        isOpen={showEndShift}
        title={t('report.page.confirmEnd.title', 'Xác nhận kết ca')}
        description={t('report.page.confirmEnd.desc', 'Bạn có chắc chắn muốn kết ca và đăng xuất không? Thao tác này sẽ khóa phiên làm việc hiện tại.')}
        confirmText={t('report.page.confirmEnd.confirm', 'Kết ca')}
        cancelText={t('report.page.confirmEnd.cancel', 'Hủy')}
        onConfirm={handleEndShift}
        onCancel={() => setShowEndShift(false)}
        variant="danger"
      />
    </>
  )
}

function ErrorFallback() {
  const { t } = useTranslation()
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-error print:hidden">
      <AlertCircle className="size-10" />
      <p>{t('report.page.crash', 'Giao diện phát sinh lỗi')}</p>
      <Button onClick={() => window.location.reload()}>{t('common.retry', 'Thử lại')}</Button>
    </div>
  )
}

export default function ShiftReportPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <main className="flex-1 flex flex-col overflow-hidden h-screen bg-surface print:h-auto print:bg-white">
        <ShiftReportContent />
      </main>
    </ErrorBoundary>
  )
}
