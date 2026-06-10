import { useState } from 'react'
import { IReservation } from '@/shared/types/reservation'
import { format, parseISO, getHours } from 'date-fns'
import { Check, Columns3, Eye, MoreVertical, Utensils, Banknote } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { useTranslation } from 'react-i18next'

interface TimelineViewProps {
  reservations: IReservation[]
  isLoading: boolean
  onEditClick: (reservation: IReservation) => void
  onAssignTableClick: (reservation: IReservation) => void
  onCheckInClick: (reservationId: string) => void
  onViewPreOrder?: (json: string) => void
}

export function ReservationTimelineView({
  reservations,
  isLoading,
  onEditClick,
  onAssignTableClick,
  onCheckInClick,
  onViewPreOrder
}: TimelineViewProps) {
  const { t } = useTranslation()
  const [checkInTargetId, setCheckInTargetId] = useState<string | null>(null)
  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-16 w-full mb-4" />
        <Skeleton className="h-16 w-full mb-4" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  const displayRes = [...reservations]
  // Sort theo giờ
  displayRes.sort((a, b) => new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime())

  // Nhóm theo khung giờ
  const groupedRes: Record<number, IReservation[]> = {}
  displayRes.forEach(res => {
    const hour = getHours(parseISO(res.bookingTime))
    if (!groupedRes[hour]) groupedRes[hour] = []
    groupedRes[hour].push(res)
  })

  // Sinh danh sách các khung giờ từ 06:00 đến 23:00
  const hours = Array.from({ length: 18 }, (_, i) => i + 6)

  return (
    <>
    <div className="flex-1 bg-white flex flex-col min-h-0 overflow-y-auto">
      <div className="flex flex-col border-t border-slate-100">
        {hours.map(hour => {
          const hourRes = groupedRes[hour] || []
          const timeLabel = format(new Date().setHours(hour, 0, 0, 0), 'hh a').replace('AM', 'SA').replace('PM', 'CH')

          return (
            <div key={hour} className="flex border-b border-slate-100 min-h-[80px]">
              {/* Cột hiển thị giờ */}
              <div className="w-24 shrink-0 flex items-start justify-center pt-5 border-r border-slate-100 bg-slate-50/30">
                <span className="text-sm font-bold text-slate-600">{timeLabel}</span>
              </div>

              {/* Cột hiển thị nội dung (các block) */}
              <div className="flex-1 p-3 flex flex-col gap-2 relative bg-white">
                {hourRes.map((res) => {
                  const isCompleted = res.status === 'COMPLETED'
                  const isCancelled = res.status === 'CANCELLED' || res.status === 'NO_SHOW'
                  const isAssigned = res.assignedTableNumbers && res.assignedTableNumbers.length > 0
                  
                  // Lấy màu nền và viền tùy theo trạng thái
                  let blockStyle = "border-l-[4px] border-blue-500 bg-blue-50/50"
                  if (isCompleted) blockStyle = "border-l-[4px] border-emerald-500 bg-emerald-50"
                  if (isCancelled) blockStyle = "border-l-[4px] border-red-400 bg-red-50"
                  if (isAssigned && !isCompleted && !isCancelled) blockStyle = "border-l-[4px] border-primary bg-primary/5"

                  return (
                    <div 
                      key={res.id} 
                      className={`flex flex-wrap md:flex-nowrap items-center justify-between p-3 rounded-r-md ${blockStyle}`}
                    >
                      {/* Cột Thông tin */}
                      <div className="flex-1 min-w-[300px] mb-2 md:mb-0">
                        <div className="flex items-center flex-wrap gap-2 text-sm">
                          <span className="font-bold text-slate-800">{res.customerName} - {res.customerPhone}</span>
                          <span className="text-slate-500">/</span>
                          <span className="font-medium text-slate-600" title={`${res.adultCount || res.partySize} ${t('pos.reservations.adults', 'Người lớn')}, ${res.childrenCount || 0} ${t('pos.reservations.children', 'Trẻ em')}`}>
                            {res.partySize} {t('pos.reservations.person', 'người')} <span className="text-[11px] text-slate-400 font-normal">({res.adultCount || res.partySize}A{res.childrenCount ? `, ${res.childrenCount}C` : ''})</span>
                          </span>
                          <span className="text-slate-500">/</span>
                          <span className="text-slate-500">({format(parseISO(res.bookingTime), 'hh:mm a')})</span>
                          
                          {/* Trạng thái Label (nếu bị hủy hoặc hoàn thành) */}
                          {isCompleted && (
                            <Badge variant="success" className="ml-2">{t('pos.reservations.badge.completed', 'Đã xong')}</Badge>
                          )}
                          {res.status === 'CANCELLED' && (
                            <Badge variant="danger" className="ml-2">{t('pos.reservations.badge.cancelled', 'Đã hủy')}</Badge>
                          )}
                          {res.status === 'NO_SHOW' && (
                            <Badge variant="neutral" className="ml-2">{t('pos.reservations.badge.noShow', 'Không đến')}</Badge>
                          )}
                        </div>
                        {res.preOrderDraft && (
                          <Button 
                            variant="ghost"
                            onClick={() => onViewPreOrder?.(res.preOrderDraft!)}
                            className="mt-1.5 h-auto flex items-center gap-1 text-blue-600 bg-blue-100/80 hover:bg-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors w-fit"
                          >
                            <Utensils className="size-3" />
                            {t('pos.reservations.hasPreorder', 'Khách có gọi món trước')}
                          </Button>
                        )}
                        {(res.depositAmount || 0) > 0 && (
                          <div className="mt-1.5 flex items-center gap-1 bg-green-100/80 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold w-fit">
                            <Banknote className="size-3" />
                            <span>{t('pos.reservations.deposited', 'Đã cọc:')} {new Intl.NumberFormat('vi-VN').format(res.depositAmount)}đ</span>
                          </div>
                        )}
                      </div>

                      {/* Cột Hành động */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!isCompleted && !isCancelled && (
                          <>
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setCheckInTargetId(res.id)}
                              className="text-emerald-600 hover:text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50 !px-3"
                            >
                              <Check className="size-4" /> {t('pos.reservations.action.checkIn', 'Nhận bàn')}
                            </Button>
                            
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => onAssignTableClick(res)}
                              className={
                                isAssigned
                                  ? 'text-slate-500 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 !px-3'
                                  : 'text-blue-600 hover:border-blue-500 hover:bg-blue-50 !px-3'
                              }
                            >
                              <Columns3 className="size-4" /> {isAssigned ? t('pos.reservations.action.editTable', 'Sửa bàn') : t('pos.reservations.action.assignTable', 'Xếp bàn')}
                            </Button>
                          </>
                        )}
                        
                        <DropdownMenu 
                          trigger={
                            <Button variant="ghost" size="icon" className="text-slate-500">
                              <MoreVertical className="size-5" />
                            </Button>
                          }
                          items={[
                            {
                              label: t('pos.reservations.action.viewDetail', 'Xem chi tiết'),
                              icon: <Eye className="size-4 text-slate-400" />,
                              onClick: () => onEditClick(res)
                            }
                          ]}
                          align="right"
                        />
                      </div>
                    </div>
                  )
                })}
                
                {/* Dòng mờ hướng dẫn khi không có đơn */}
                {hourRes.length === 0 && (
                  <div className="absolute inset-0 flex items-center px-4 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-slate-300">{t('pos.reservations.timeline.emptySlot', 'Không có đơn đặt bàn trong khung giờ này')}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
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
