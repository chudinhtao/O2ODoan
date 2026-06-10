import { useState, useMemo, useEffect } from 'react'
import { IReservation } from '@/shared/types/reservation'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { MousePointerClick, X, Check } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { useTranslation } from 'react-i18next'

interface AssignTableMapModalProps {
  isOpen: boolean
  onClose: () => void
  reservation: IReservation | null
  tables: IPosTable[]
  activeReservations: IReservation[] // to know which tables are assigned to other pending/confirmed reservations
  onAssignSubmit: (resId: string, tableIds: string[]) => void
  isSubmitting?: boolean
}

export function AssignTableMapModal({
  isOpen,
  onClose,
  reservation,
  tables,
  activeReservations,
  onAssignSubmit,
  isSubmitting
}: AssignTableMapModalProps) {
  const { t } = useTranslation()
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([])
  const [selectedZone, setSelectedZone] = useState<string>('All')

  // Reset selected tables when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTableIds(reservation?.assignedTableNumbers 
        ? tables.filter(t => reservation.assignedTableNumbers?.includes(t.number)).map(t => t.id)
        : [])
      setSelectedZone('All')
    }
  }, [isOpen, reservation, tables])

  const zones = useMemo(() => {
    const uniqueZones = Array.from(new Set(tables.map(t => t.zone).filter(Boolean) as string[]))
    return ['All', ...uniqueZones]
  }, [tables])

  const filteredTables = useMemo(() => {
    if (selectedZone === 'All') return tables
    return tables.filter(t => t.zone === selectedZone)
  }, [tables, selectedZone])

  if (!isOpen || !reservation) return null

  const handleTableClick = (tableId: string) => {
    setSelectedTableIds(prev => 
      prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
    )
  }

  const handleSubmit = () => {
    if (!reservation) return
    onAssignSubmit(reservation.id, selectedTableIds)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{t('pos.reservations.assignTableTitle', 'Xếp bàn trên sơ đồ')}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{t('pos.reservations.customer', 'Khách:')} <span className="font-bold text-primary">{reservation.customerName}</span> ({reservation.partySize} {t('pos.reservations.guests', 'khách')})</p>
          </div>
          <Button 
            variant="icon"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Trạng thái nhắc nhở */}
        <div className="bg-blue-600 text-white p-3 px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MousePointerClick className="size-4 animate-bounce" />
            {selectedTableIds.length > 0 ? (
              <span>{t('pos.reservations.selectedTablesPrompt', 'Đã chọn {{count}} bàn. Nhấn "Xác nhận" để lưu.', { count: selectedTableIds.length })}</span>
            ) : (
              <span>{t('pos.reservations.selectTablesPrompt', 'Hãy bấm vào một/nhiều bàn trống bên dưới để gán cho khách!')}</span>
            )}
          </div>
        </div>

        {/* Lọc khu vực */}
        {zones.length > 1 && (
          <div className="flex overflow-x-auto scrollbar-none gap-2 p-4 pb-0 shrink-0 bg-slate-50">
            {zones.map(zone => (
              <Button
                key={zone}
                variant={selectedZone === zone ? 'primary' : 'outline'}
                onClick={() => setSelectedZone(zone)}
                className={`rounded-full px-4 py-1.5 ${
                  selectedZone === zone ? 'shadow-sm' : 'border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30'
                }`}
              >
                {zone === 'All' ? t('pos.reservations.allZones', 'Tất cả khu vực') : zone}
              </Button>
            ))}
          </div>
        )}

        {/* Lưới Bàn */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-max">
            {filteredTables.map(table => {
              const isOccupiedStatus = table.status !== 'FREE'
              // Kiểm tra xem bàn này có đang được gán cho đơn KHÁC không
              const isReservedByOthers = activeReservations.some(r => r.id !== reservation.id && r.assignedTableNumbers?.includes(table.number))
              const isReservedByThis = reservation?.assignedTableNumbers?.includes(table.number)
              const isTableSelected = selectedTableIds.includes(table.id)
              
              const isDisabled = isReservedByOthers || (isOccupiedStatus && !isReservedByThis)

              return (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table.id)}
                  disabled={isDisabled}
                  className={`
                    relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 aspect-square transition-all
                    ${(isDisabled && !isTableSelected)
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' 
                      : isReservedByOthers
                        ? 'bg-blue-50 border-blue-200 text-blue-700 opacity-60 cursor-not-allowed'
                        : isTableSelected
                          ? 'bg-primary/10 border-primary text-primary shadow-md cursor-pointer scale-[0.98]'
                          : 'bg-white border-primary/40 hover:border-primary hover:bg-primary/5 hover:shadow-md cursor-pointer hover:-translate-y-1'
                    }
                  `}
                >
                  <span className="font-black text-xl">{table.number}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isOccupiedStatus ? 'bg-slate-200 text-slate-500' : 
                    isReservedByOthers ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {table.capacity} {t('pos.reservations.person', 'chỗ')}
                  </span>

                  {isReservedByOthers && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                  {isTableSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                      <Check className="size-3" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <Button 
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-slate-600"
          >
            {t('common.action.cancel', 'Hủy')}
          </Button>
          <Button 
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="px-8 py-2.5 rounded-xl shadow-sm"
          >
            {t('pos.reservations.confirmAssign', 'Xác nhận gán bàn')}
          </Button>
        </div>

      </div>
    </div>
  )
}
