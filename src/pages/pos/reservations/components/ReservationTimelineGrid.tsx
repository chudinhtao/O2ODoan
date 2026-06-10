import { useTranslation } from 'react-i18next'
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar'
import dragAndDropModule, { EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import { format, parse, startOfWeek, getDay, parseISO } from 'date-fns'
import { vi, enUS } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-custom.css'

import { IReservation } from '@/shared/types/reservation'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { Skeleton } from '@/shared/components/ui/Skeleton'

const locales = {
  'vi': vi,
  'en': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface TimelineGridProps {
  reservations: IReservation[]
  tables: IPosTable[]
  isLoading: boolean
  dateStr: string
  onReservationClick?: (reservation: IReservation) => void
  onAssignTable?: (reservationId: string, tableId: string) => void
}

interface CalendarEvent extends Event {
  resourceId: string
  reservation: IReservation
}

// Safely extract withDragAndDrop for Vite CJS interop
const withDragAndDrop = typeof dragAndDropModule === 'function' 
  ? dragAndDropModule 
  : (dragAndDropModule as any).default;

const DnDCalendar = withDragAndDrop(Calendar)

export function ReservationTimelineGrid({ reservations, tables, isLoading, dateStr, onReservationClick, onAssignTable }: TimelineGridProps) {
  const { t, i18n } = useTranslation()

  if (isLoading) {
    return (
      <div className="flex-1 p-4 bg-white overflow-hidden flex flex-col gap-2 border-l">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-full w-full flex-1" />
      </div>
    )
  }

  // Create resources from tables
  const resources = [
    { id: 'unassigned', title: t('pos.reservations.unassigned', 'Chưa xếp bàn') },
    ...tables.map(table => ({
      id: table.id,
      title: table.name || `${t('pos.reservations.table.table', 'Bàn')} ${table.number} (${table.capacity} ${t('pos.reservations.person', 'chỗ')})`,
    }))
  ]

  const events: CalendarEvent[] = []
  reservations.forEach(r => {
    if (r.status === 'CANCELLED' || r.status === 'NO_SHOW') return
    
    const start = parseISO(r.bookingTime)
    // Assume 2 hours duration by default
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)

    if (!r.assignedTableNumbers || r.assignedTableNumbers.length === 0) {
      events.push({
        title: `${r.customerName} - ${r.partySize} ${t('pos.reservations.guests', 'khách')}`,
        start,
        end,
        resourceId: 'unassigned',
        reservation: r
      })
    } else {
      r.assignedTableNumbers.forEach(tableNum => {
        const table = tables.find(t => t.number === tableNum)
        if (table) {
          events.push({
            title: `${r.customerName} - ${r.partySize} ${t('pos.reservations.guests', 'khách')}`,
            start,
            end,
            resourceId: table.id,
            reservation: r
          })
        }
      })
    }
  })

  const handleEventDrop = (args: EventInteractionArgs<CalendarEvent>) => {
    const { event, resourceId } = args
    if (resourceId && resourceId !== 'unassigned' && event.resourceId !== resourceId) {
      onAssignTable?.(event.reservation.id, resourceId as string)
    }
  }

  // Use vi by default or en if selected
  const currentLocale = i18n.language?.startsWith('vi') ? 'vi' : 'en'

  return (
    <div className="flex-1 bg-white p-4 h-full flex flex-col border-l">
      <DnDCalendar
        localizer={localizer}
        events={events}
        resources={resources}
        defaultView="day"
        views={['day']}
        step={30}
        timeslots={2}
        date={parseISO(dateStr)} // Force date from prop
        onNavigate={() => {}} // Disable internal navigation if controlled from outside
        toolbar={false} // We have our own date picker in sidebar
        culture={currentLocale}
        onSelectEvent={(event: CalendarEvent) => onReservationClick?.(event.reservation)}
        onEventDrop={handleEventDrop}
        resizable={false}
        eventPropGetter={(event: CalendarEvent) => {
          const status = event.reservation.status
          let backgroundColor = '#f59e0b' // PENDING (amber-500)
          if (status === 'CONFIRMED') backgroundColor = '#3b82f6' // blue-500
          if (status === 'COMPLETED') backgroundColor = '#d1d5db' // gray-300
          
          return {
            style: {
              backgroundColor,
              borderRadius: '6px',
              border: 'none',
              color: status === 'COMPLETED' ? '#374151' : '#fff',
              fontSize: '12px',
              fontWeight: 500,
              padding: '2px 6px',
            }
          }
        }}
        min={new Date(1970, 0, 1, 8, 0, 0)} // 8:00 AM (Date part doesn't matter for time gutter)
        max={new Date(1970, 0, 1, 23, 0, 0)} // 11:00 PM
        className="react-big-calendar-custom flex-1"
        messages={{
          allDay: t('pos.reservations.allDay', 'Cả ngày'),
          noEventsInRange: t('pos.reservations.noEvents', 'Không có đặt bàn nào.'),
        }}
      />
    </div>
  )
}
