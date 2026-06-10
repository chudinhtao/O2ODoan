import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { IReservation } from '@/shared/types/reservation'
import { CheckCircle, XCircle, Ban, Eye } from 'lucide-react'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { format } from 'date-fns'

interface Props {
  reservations: IReservation[]
  isLoading: boolean
  isUpdating: boolean
  onUpdateStatus: (id: string, status: string) => void
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
  advancedFiltersNode?: React.ReactNode
}

export function AdminReservationsTable({ 
  reservations, 
  isLoading, 
  isUpdating,
  onUpdateStatus,
  onViewDetail,
  keyword,
  onSearchChange,
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  filtersNode,
  advancedFiltersNode
}: Props) {
  const { t } = useTranslation()
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {}
  })

  const openConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      title,
      description,
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
      header: t('admin.reservations.table.partySize', 'Số khách'),
      width: '100px',
      align: 'center' as const,
      cell: (res: IReservation) => (
        <span className="text-sm font-bold text-slate-700">{res.partySize}</span>
      )
    },
    {
      header: t('admin.reservations.table.deposit', 'Tiền cọc'),
      align: 'right' as const,
      width: '140px',
      cell: (res: IReservation) => (
        <span className={`text-sm font-bold ${res.depositAmount ? 'text-green-600' : 'text-slate-400'}`}>
          {res.depositAmount ? `${res.depositAmount.toLocaleString()}đ` : 'Không cọc'}
        </span>
      )
    },
    {
      header: t('admin.reservations.table.status', 'Trạng thái'),
      align: 'center' as const,
      width: '140px',
      cell: (res: IReservation) => (
        <Badge 
          variant={
            res.status === 'CONFIRMED' ? 'success' :
            res.status === 'COMPLETED' ? 'info' :
            res.status === 'PENDING' ? 'warning' :
            'danger'
          }
        >
          {t(`admin.reservations.status.${res.status.toLowerCase()}`, res.status)}
        </Badge>
      )
    },
    {
      header: t('admin.reservations.table.actions', 'Thao tác'),
      align: 'center' as const,
      width: '80px',
      cell: (res: IReservation) => (
        <DropdownMenu
          items={[
            {
              label: t('admin.reservations.action.viewDetail', 'Xem chi tiết'),
              icon: <Eye className="w-4 h-4 text-slate-500" />,
              onClick: () => onViewDetail(res)
            },
            ...(res.status === 'PENDING' ? [
              {
                label: t('admin.reservations.action.confirm', 'Xác nhận (Đã cọc)'),
                icon: <CheckCircle className="w-4 h-4 text-green-600" />,
                onClick: () => {
                  openConfirm(
                    t('admin.reservations.action.confirm', 'Xác nhận (Đã cọc)'),
                    t('admin.reservations.confirmAccept', 'Xác nhận khách đã cọc và đặt bàn thành công?'),
                    () => onUpdateStatus(res.id, 'CONFIRMED')
                  )
                }
              }
            ] : []),
            ...(['PENDING', 'CONFIRMED'].includes(res.status) ? [
              {
                label: t('admin.reservations.action.cancel', 'Hủy đặt bàn'),
                icon: <XCircle className="w-4 h-4 text-red-600" />,
                onClick: () => {
                  openConfirm(
                    t('admin.reservations.action.cancel', 'Hủy đặt bàn'),
                    t('admin.reservations.confirmCancel', 'Bạn có chắc chắn muốn hủy đặt bàn này?'),
                    () => onUpdateStatus(res.id, 'CANCELLED')
                  )
                }
              },
              {
                label: t('admin.reservations.action.noShow', 'Đánh dấu Không đến'),
                icon: <Ban className="w-4 h-4 text-orange-600" />,
                onClick: () => {
                  openConfirm(
                    t('admin.reservations.action.noShow', 'Đánh dấu Không đến'),
                    t('admin.reservations.confirmNoShow', 'Xác nhận khách không đến?'),
                    () => onUpdateStatus(res.id, 'NO_SHOW')
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
      advancedFilters={advancedFiltersNode}
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
      variant="danger"
    />
    </>
  )
}
