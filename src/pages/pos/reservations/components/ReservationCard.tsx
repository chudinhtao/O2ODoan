import { useTranslation } from 'react-i18next'
import { Clock, Users, Phone, MapPin, Banknote } from 'lucide-react'
import { Badge } from '@/shared/components/ui/Badge'
import { IReservation } from '@/shared/types/reservation'
import { format, parseISO } from 'date-fns'

interface ReservationCardProps {
  reservation: IReservation
  onClick?: () => void
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void
}

export function ReservationCard({ reservation, onClick, onDragStart }: ReservationCardProps) {
  const { t } = useTranslation()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED': 
      case 'NO_SHOW': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const timeFormatted = format(parseISO(reservation.bookingTime), 'HH:mm')
  const dateFormatted = format(parseISO(reservation.bookingTime), 'dd/MM')

  return (
    <div
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      className={`
        p-3 bg-white border rounded-lg shadow-sm mb-3 
        ${onDragStart ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
        hover:border-primary/50 transition-colors
      `}
    >
      <div className="flex justify-between items-start mb-2 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate flex-1 min-w-0 pr-2">
          {reservation.customerName}
        </h4>
        <Badge className={`shrink-0 ${getStatusColor(reservation.status)}`}>
          {t(`pos.reservations.status.${reservation.status}`, reservation.status)}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 shrink-0 text-gray-400" />
          <span>{timeFormatted} - {dateFormatted}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 shrink-0 text-gray-400" />
          <span className="truncate" title={`${reservation.adultCount || reservation.partySize} ${t('pos.reservations.adults', 'Người lớn')}, ${reservation.childrenCount || 0} ${t('pos.reservations.children', 'Trẻ em')}`}>
            {reservation.partySize} {t('pos.reservations.person', 'người')} 
            <span className="text-xs text-gray-400 ml-1">({reservation.adultCount || reservation.partySize}A{reservation.childrenCount ? `, ${reservation.childrenCount}C` : ''})</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Phone className="w-4 h-4 shrink-0 text-gray-400" />
          <span className="truncate">{reservation.customerPhone}</span>
        </div>
        {reservation.assignedTableNumbers && reservation.assignedTableNumbers.length > 0 && (
          <div className="flex items-center gap-1.5 text-blue-600 font-medium">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('pos.reservations.table.table', 'Bàn')}: {reservation.assignedTableNumbers.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Hiển thị tiền cọc nếu có */}
      {(reservation.depositAmount || 0) > 0 && (
        <div className="mt-2 flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded w-fit border border-green-100">
          <Banknote className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">{t('pos.reservations.deposited', 'Đã cọc:')} {new Intl.NumberFormat('vi-VN').format(reservation.depositAmount!)}đ</span>
        </div>
      )}

      {reservation.note && (
        <div className="mt-2 text-sm text-gray-500 italic bg-gray-50 p-1.5 rounded truncate">
          {reservation.note}
        </div>
      )}
    </div>
  )
}
