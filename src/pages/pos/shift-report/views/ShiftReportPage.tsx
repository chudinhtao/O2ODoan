import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, LogOut, AlertCircle, PackagePlus } from 'lucide-react'
import { useShiftReport } from '../hooks/useShiftReport'
import { SummaryCards } from '../components/SummaryCards'
import { PaymentBreakdown } from '../components/PaymentBreakdown'
import { ShiftInvoiceList } from '../components/ShiftInvoiceList'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { ErrorBoundary } from 'react-error-boundary'
import { useShift } from '@/shared/hooks/useShift'
import QuickGrnModal from '@/pages/pos/components/QuickGrnModal'
import { PosHeader } from '@/layouts/components/PosHeader'

import { timeService } from '@/services/time.service'
import { format } from 'date-fns'

function ShiftReportContent() {
  const { t, i18n } = useTranslation()
  
  // Sử dụng giờ server để lấy ngày hiện tại
  const serverNow = new Date(timeService.getNow())
  const today = serverNow.toLocaleDateString('en-CA') // YYYY-MM-DD
  const { clockOut, currentShift } = useShift()
  const attendanceLog = currentShift.data
  
  const { data: report, isLoading, error } = useShiftReport(today, attendanceLog?.id)
  const [showEndShift, setShowEndShift] = useState(false)
  const [showQuickGrn, setShowQuickGrn] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')
  }


  const handleEndShift = () => {
    clockOut.mutate('Kết ca')
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

  const cashRevenue = report?.revenueByPaymentMethod?.['CASH'] || 0
  const qrRevenue = (report?.totalRevenue || 0) - cashRevenue
  const cashOrders = report?.ordersByPaymentMethod?.['CASH'] || 0
  const qrOrders = (report?.totalOrders || 0) - cashOrders

  return (
    <>
      {/* Header - hide on print */}
      <div className="print:hidden">
        <PosHeader
          title={`${t('report.page.title', 'Báo cáo ca')} — ${attendanceLog?.fullName || 'Thu Ngân'}`}
          subtitle={
            <span className="text-slate-500 text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <Calendar className="size-3.5" />
              {attendanceLog?.shiftName ? `${attendanceLog.shiftName} | ` : ''} 
              {t('report.page.shiftTime', 'Ngày: {{date}}', { date: formatDisplayDate(serverNow) })}
            </span>
          }
          actions={
            <>
              <Button
                variant="outline"
                className="gap-2 shadow-sm font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-9"
                onClick={() => setShowQuickGrn(true)}
              >
                <PackagePlus className="size-4" />
                <span className="hidden sm:inline">{t('report.page.quickGrn', 'Nhập Kho Nhanh')}</span>
              </Button>
      
              <Button 
                className="gap-2 shadow-sm font-semibold bg-error hover:bg-error/90 text-error-content h-9"
                onClick={() => setShowEndShift(true)}
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">{t('report.page.endShift', 'Kết ca')}</span>
              </Button>
            </>
          }
        />
      </div>

      {/* Main Content Area */}
      {error || !report ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-error">
          <AlertCircle className="size-10 opacity-80" />
          <p className="font-medium text-sm">{t('report.page.error', 'Không thể tải dữ liệu báo cáo, nhưng bạn vẫn có thể kết ca!')}</p>
        </div>
      ) : (
        <div ref={reportRef} className="flex-1 overflow-y-auto p-4 md:p-6 pb-12 md:pb-20 space-y-4 bg-surface-variant/30 print:bg-white print:p-0 print:overflow-visible flex flex-col">
          {/* Print Only Header */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-bold">{t('report.page.title', 'Báo cáo ca — Thu Ngân')}</h1>
            <p className="text-sm mt-1">{formatDisplayDate(serverNow)}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
            <SummaryCards
              totalRevenue={report.totalRevenue}
              totalOrders={report.totalOrders}
              cashRevenue={cashRevenue}
              qrRevenue={qrRevenue}
              cashOrders={cashOrders}
              qrOrders={qrOrders}
            />
            
            <PaymentBreakdown
              totalRevenue={report.totalRevenue}
              cashRevenue={cashRevenue}
              qrRevenue={qrRevenue}
            />
          </div>

          {/* Invoice List */}
          <ShiftInvoiceList 
            startDate={attendanceLog?.checkIn || `${today}T00:00:00`}
            endDate={attendanceLog?.checkOut || format(serverNow, "yyyy-MM-dd'T'HH:mm:ss.SSS")}
          />
        </div>
      )}

      <ConfirmDialog
        isOpen={showEndShift}
        title={t('report.page.confirmEnd.title', 'Xác nhận kết ca')}
        description={t('report.page.confirmEnd.desc', 'Bạn có chắc chắn muốn kết ca và đăng xuất không? Thao tác này sẽ khóa phiên làm việc hiện tại.')}
        confirmText={t('report.page.confirmEnd.confirm', 'Kết ca')}
        cancelText={t('report.page.confirmEnd.cancel', 'Hủy')}
        onConfirm={handleEndShift}
        onCancel={() => setShowEndShift(false)}
        variant="danger"
        isLoading={clockOut.isPending}
      />

      {showQuickGrn && <QuickGrnModal onClose={() => setShowQuickGrn(false)} />}
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
