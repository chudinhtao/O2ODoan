import { useState } from 'react'
import { IReservation } from '@/shared/types/reservation'
import { format, parseISO } from 'date-fns'
import { Check, Columns3, Eye, Utensils, Banknote } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/Table'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useTranslation } from 'react-i18next'

interface ListViewProps {
  reservations: IReservation[]
  isLoading: boolean
  onEditClick: (reservation: IReservation) => void
  onAssignTableClick: (reservation: IReservation) => void
  onCheckInClick: (reservationId: string) => void
  onViewPreOrder?: (json: string) => void
}

export function ReservationListView({
  reservations,
  isLoading,
  onEditClick,
  onAssignTableClick,
  onCheckInClick,
  onViewPreOrder
}: ListViewProps) {
  const { t } = useTranslation()
  const [checkInTargetId, setCheckInTargetId] = useState<string | null>(null)
  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  const displayRes = [...reservations]
  // Sort theo giờ
  displayRes.sort((a, b) => new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime())

  return (
    <>
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto w-full">
      <Table>
        <TableHeader className="sticky top-0 z-10 shadow-sm">
          <TableRow>
            <TableHead className="px-6">{t('pos.reservations.table.customer', 'Khách hàng')}</TableHead>
            <TableHead className="px-6 text-center">{t('pos.reservations.table.time', 'Giờ hẹn')}</TableHead>
            <TableHead className="px-6 text-right">{t('pos.reservations.guests', 'Số lượng')}</TableHead>
            <TableHead className="px-6 text-center">{t('pos.reservations.table.table', 'Bàn')}</TableHead>
            <TableHead className="px-6 text-center">{t('pos.reservations.table.status', 'Trạng thái')}</TableHead>
            <TableHead className="px-6 text-center w-32">{t('pos.reservations.table.action', 'Hành động')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayRes.map((res) => {
            const isCompleted = res.status === 'COMPLETED'
            const isAssigned = res.assignedTableNumbers && res.assignedTableNumbers.length > 0

            return (
              <TableRow key={res.id}>
                <TableCell className="px-6">
                  <p className="font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors cursor-pointer">{res.customerName}</p>
                  <p className="text-xs text-slate-500 font-medium">{res.customerPhone}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    {res.preOrderDraft && (
                      <Button 
                        variant="ghost"
                        onClick={() => onViewPreOrder?.(res.preOrderDraft!)}
                        className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] h-auto font-bold hover:bg-blue-200 transition-colors w-fit"
                      >
                        <Utensils className="size-3" />
                        {t('pos.reservations.hasPreorderShort', 'Có món đặt trước')}
                      </Button>
                    )}
                    {(res.depositAmount || 0) > 0 && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold w-fit">
                        <Banknote className="size-3" />
                        <span>{t('pos.reservations.deposited', 'Đã cọc:')} {new Intl.NumberFormat('vi-VN').format(res.depositAmount)}đ</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 text-center font-medium text-slate-700">
                  {format(parseISO(res.bookingTime), 'HH:mm')}
                </TableCell>
                <TableCell className="px-6 text-right">
                  {res.partySize} {t('pos.reservations.guests', 'khách')}
                </TableCell>
                <TableCell className="px-6 text-center">
                  {isAssigned ? (
                    <div className="flex flex-wrap gap-1 justify-center">
                      {res.assignedTableNumbers.map(n => (
                        <span key={n} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[11px] font-bold border border-primary/20">
                          {t('pos.reservations.table.table', 'Bàn')} {n}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-xs italic">{t('pos.reservations.badge.pending', 'Chưa xếp')}</span>
                  )}
                </TableCell>
                <TableCell className="px-6 text-center">
                  {isCompleted ? (
                    <Badge variant="success">{t('pos.reservations.badge.completed', 'Đã xong')}</Badge>
                  ) : res.status === 'CANCELLED' ? (
                    <Badge variant="danger">{t('pos.reservations.badge.cancelled', 'Đã hủy')}</Badge>
                  ) : res.status === 'NO_SHOW' ? (
                    <Badge variant="neutral">{t('pos.reservations.badge.noShow', 'Không đến')}</Badge>
                  ) : isAssigned ? (
                    <Badge variant="info">{t('pos.reservations.badge.waiting', 'Chờ khách')}</Badge>
                  ) : (
                    <Badge variant="warning">{t('pos.reservations.badge.pending', 'Chờ gán bàn')}</Badge>
                  )}
                </TableCell>
                <TableCell className="px-6 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {!isCompleted && !['CANCELLED', 'NO_SHOW'].includes(res.status) && (
                      <Button
                        variant="icon"
                        size="icon"
                        onClick={() => onAssignTableClick(res)}
                        title={isAssigned ? t('pos.reservations.action.editTable', 'Sửa bàn') : t('pos.reservations.action.assignTable', 'Xếp bàn')}
                        className={isAssigned ? 'text-slate-400 hover:text-blue-600 hover:bg-blue-50' : 'text-blue-600 hover:bg-blue-50'}
                      >
                        <Columns3 className="size-4" />
                      </Button>
                    )}
                    {!isCompleted && !['CANCELLED', 'NO_SHOW'].includes(res.status) && (
                      <Button
                        variant="icon"
                        size="icon"
                        onClick={() => setCheckInTargetId(res.id)}
                        title={t('pos.reservations.action.checkIn', 'Nhận bàn')}
                        className="text-emerald-600 hover:bg-emerald-50"
                      >
                        <Check className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="icon"
                      size="icon"
                      onClick={() => onEditClick(res)}
                      title={t('pos.reservations.action.viewDetail', 'Xem chi tiết')}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {displayRes.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="px-6 py-12 text-center text-slate-400">
                {t('pos.reservations.emptyList', 'Không có đơn đặt bàn nào trong ngày')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>

    <ConfirmDialog
      isOpen={!!checkInTargetId}
      title={t('pos.reservations.action.checkIn', 'Nhận bàn')}
      description={t('pos.reservations.confirmCheckIn', 'Xác nhận khách đã đến và nhận bàn?')}
      onConfirm={() => {
        if (checkInTargetId) onCheckInClick(checkInTargetId)
        setCheckInTargetId(null)
      }}
      onCancel={() => setCheckInTargetId(null)}
      variant="info"
    />
    </>
  )
}
