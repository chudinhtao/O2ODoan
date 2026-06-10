import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { IReservation } from '@/shared/types/reservation'
import { CheckCircle, Eye, AlertCircle } from 'lucide-react'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { format } from 'date-fns'

interface Props {
  reservations: IReservation[]
  isLoading: boolean
  isUpdating: boolean
  onUpdateRefundStatus: (id: string, refundStatus: string) => void
  onViewDetail: (res: IReservation) => void
  keyword: string
  onSearchChange: (value: string) => void
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  filtersNode?: React.ReactNode
}

export function AdminRefundsTable({
  reservations,
  isLoading,
  isUpdating,
  onUpdateRefundStatus,
  onViewDetail,
  keyword,
  onSearchChange,
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  filtersNode
}: Props) {
  const { t } = useTranslation()
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    description: string
    variant: 'danger' | 'warning' | 'info'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'info',
    onConfirm: () => {}
  })

  const openConfirm = (
    title: string,
    description: string,
    variant: 'danger' | 'warning' | 'info',
    onConfirm: () => void
  ) => {
    setConfirmState({
      isOpen: true,
      title,
      description,
      variant,
      onConfirm: () => {
        onConfirm()
        setConfirmState(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const columns = [
    {
      header: t('admin.reservations.table.id', 'Mã booking'),
      width: '120px',
      cell: (res: IReservation) => (
        <span className="font-mono text-sm font-semibold text-slate-900">
          #{res.id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      header: t('admin.reservations.table.customer', 'Khách hàng'),
      width: '200px',
      cell: (res: IReservation) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-slate-800">{res.customerName}</span>
          <span className="text-xs text-slate-500">{res.customerPhone}</span>
        </div>
      )
    },
    {
      header: t('admin.reservations.table.time', 'Thời gian đến'),
      width: '180px',
      cell: (res: IReservation) => (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-700">
            {format(new Date(res.bookingTime), 'HH:mm')}
          </span>
          <span className="text-xs text-slate-500">
            {format(new Date(res.bookingTime), 'dd/MM/yyyy')}
          </span>
        </div>
      )
    },
    {
      header: t('admin.reservations.table.deposit', 'Tiền cọc'),
      align: 'right' as const,
      width: '140px',
      cell: (res: IReservation) => (
        <span className="text-sm font-bold text-slate-700">
          {res.depositAmount ? `${res.depositAmount.toLocaleString()}đ` : '0đ'}
        </span>
      )
    },
    {
      header: t('admin.reservations.refund.status', 'Trạng thái hoàn cọc'),
      align: 'center' as const,
      width: '180px',
      cell: (res: IReservation) => {
        const isPending = res.refundStatus === 'PENDING_REFUND'
        const isRefunded = res.refundStatus === 'REFUNDED'
        
        return (
          <Badge 
            variant={
              isRefunded ? 'success' :
              isPending ? 'warning' :
              'neutral'
            }
          >
            {isRefunded ? t('pos.reservations.refund.refunded', 'Đã hoàn tiền') :
             isPending ? t('pos.reservations.refund.pending', 'Chờ hoàn tiền') : 
             t('pos.reservations.refund.none', 'Không hoàn tiền')}
          </Badge>
        )
      }
    },
    {
      header: t('admin.reservations.table.actions', 'Thao tác'),
      align: 'center' as const,
      width: '100px',
      cell: (res: IReservation) => (
        <DropdownMenu
          items={[
            {
              label: t('admin.reservations.action.viewDetail', 'Xem chi tiết'),
              icon: <Eye className="w-4 h-4 text-slate-500" />,
              onClick: () => onViewDetail(res)
            },
            ...(res.refundStatus === 'PENDING_REFUND' ? [
              {
                label: t('admin.reservations.refund.actionRefund', 'Xác nhận đã hoàn tiền'),
                icon: <CheckCircle className="w-4 h-4 text-green-600" />,
                onClick: () => {
                  openConfirm(
                    t('admin.reservations.refund.confirmRefundTitle', 'Xác nhận đã hoàn cọc'),
                    t('admin.reservations.refund.confirmRefundDesc', { amount: res.depositAmount?.toLocaleString(), name: res.customerName }),
                    'info',
                    () => onUpdateRefundStatus(res.id, 'REFUNDED')
                  )
                }
              },
              {
                label: t('admin.reservations.refund.actionReject', 'Từ chối hoàn cọc (Phạt)'),
                icon: <AlertCircle className="w-4 h-4 text-red-600" />,
                onClick: () => {
                  openConfirm(
                    t('admin.reservations.refund.confirmRejectTitle', 'Không hoàn trả tiền cọc'),
                    t('admin.reservations.refund.confirmRejectDesc', { amount: res.depositAmount?.toLocaleString(), name: res.customerName }),
                    'danger',
                    () => onUpdateRefundStatus(res.id, 'NOT_REQUIRED')
                  )
                }
              }
            ] : [])
          ]}
        />
      )
    }
  ]

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <p className="font-semibold text-slate-800">{t('admin.reservations.table.empty', 'Không tìm thấy đặt bàn nào')}</p>
      <p className="text-sm mt-1">{t('admin.reservations.table.emptyDesc', 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm')}</p>
    </div>
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={reservations}
        isLoading={isLoading || isUpdating}
        searchPlaceholder={t('admin.reservations.searchPlaceholder', 'Tìm theo số điện thoại khách hàng...')}
        searchValue={keyword}
        onSearchChange={onSearchChange}
        filters={filtersNode}
        emptyState={emptyState}
        pagination={{
          currentPage: page,
          pageSize: pageSize,
          totalElements: totalElements,
          totalPages: totalPages,
          onPageChange,
          onPageSizeChange
        }}
      />
      
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        variant={confirmState.variant}
      />
    </>
  )
}
