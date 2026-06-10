import { useState, useMemo } from 'react'
import { IReservation } from '@/shared/types/reservation'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { format, parseISO } from 'date-fns'
import { Clock, Users, Phone, Check, MousePointerClick, Utensils } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Button } from '@/shared/components/ui/Button'
import { useTranslation } from 'react-i18next'

interface SplitMapViewProps {
  reservations: IReservation[]
  tables: IPosTable[]
  isLoading: boolean
  onEditClick: (reservation: IReservation) => void
  onAssignTableSubmit: (resId: string, tableIds: string[]) => void
  onCheckInClick: (reservationId: string) => void
  onViewPreOrder?: (json: string) => void
}

export function ReservationSplitMapView({
  reservations,
  tables,
  isLoading,
  onAssignTableSubmit,
  onCheckInClick,
  onViewPreOrder
}: SplitMapViewProps) {
  const { t } = useTranslation()
  const [selectedResId, setSelectedResId] = useState<string | null>(null)
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([])

  // Lọc danh sách: Chỉ hiển thị Pending và Confirmed (Những đơn đang cần thao tác gán bàn/nhận bàn)
  const displayRes = reservations.filter(r => r.status === 'PENDING' || r.status === 'CONFIRMED')
  displayRes.sort((a, b) => new Date(a.bookingTime).getTime() - new Date(b.bookingTime).getTime())

  // Phân loại khu vực bàn (Zones)
  const [selectedZone, setSelectedZone] = useState<string>('All')
  const zones = useMemo(() => {
    const uniqueZones = Array.from(new Set(tables.map(t => t.zone).filter(Boolean) as string[]))
    return ['All', ...uniqueZones]
  }, [tables])

  const filteredTables = useMemo(() => {
    if (selectedZone === 'All') return tables
    return tables.filter(t => t.zone === selectedZone)
  }, [tables, selectedZone])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-row min-h-0">
        <div className="w-80 border-r border-slate-200 p-4 flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex-1 p-4 grid grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    )
  }

  const handleTableClick = (tableId: string) => {
    if (!selectedResId) return
    setSelectedTableIds(prev => 
      prev.includes(tableId) ? prev.filter(id => id !== tableId) : [...prev, tableId]
    )
  }

  const handleSubmitAssignment = () => {
    if (!selectedResId || selectedTableIds.length === 0) return
    onAssignTableSubmit(selectedResId, selectedTableIds)
    setSelectedResId(null)
    setSelectedTableIds([])
  }

  const handleCancelAssignment = () => {
    setSelectedResId(null)
    setSelectedTableIds([])
  }

  return (
    <div className="flex-1 flex flex-row min-h-0 bg-slate-50">
      {/* CỘT TRÁI: DANH SÁCH ĐẶT BÀN */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">{t('pos.reservations.splitMap.waitingList', 'Danh sách chờ')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('pos.reservations.splitMap.instruction', 'Chọn 1 đơn, sau đó chọn bàn bên phải để gán.')}</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {displayRes.map(res => {
            const isSelected = selectedResId === res.id
            const isAssigned = res.assignedTableNumbers && res.assignedTableNumbers.length > 0

            return (
              <div
                key={res.id}
                onClick={() => {
                  setSelectedResId(res.id)
                  setSelectedTableIds([])
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <h4 className="font-bold text-slate-800 text-[15px]">{res.customerName}</h4>
                    <p className="text-xs text-slate-500 font-medium">{res.customerPhone}</p>
                    {res.preOrderDraft && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewPreOrder?.(res.preOrderDraft!)
                        }}
                        className="mt-1 w-fit flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-orange-200 transition-colors"
                      >
                        <Utensils className="size-3" />
                        {t('pos.reservations.hasPreorderShort', 'Có món đặt trước')}
                      </button>
                    )}
                  </div>
                  {isAssigned && (
                    <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ml-2">
                      {t('pos.reservations.table.table', 'Bàn')} {res.assignedTableNumbers.join(', ')}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">{format(parseISO(res.bookingTime), 'HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-slate-400" />
                      {res.partySize} {t('pos.reservations.person', 'người')}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-100/60">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="size-3.5" />
                      {res.customerPhone}
                    </div>
                    
                    {/* Nút Nhận Bàn hiển thị luôn trên Card */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCheckInClick(res.id)
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded text-[10px] font-bold transition-colors border border-emerald-200 hover:border-emerald-500"
                    >
                      <Check className="size-3" /> {t('pos.reservations.action.checkIn', 'Nhận bàn')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          
          {displayRes.length === 0 && (
            <div className="text-center p-6 text-slate-400 text-sm">
              {t('pos.reservations.splitMap.empty', 'Không có đơn chờ xử lý')}
            </div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI: SƠ ĐỒ BÀN */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
        {/* Thanh trạng thái nhắc nhở (Nếu đang chọn Đơn) */}
        {selectedResId && (
          <div className="bg-blue-600 text-white p-3 px-6 flex items-center justify-between shadow-md shrink-0 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MousePointerClick className="size-4 animate-bounce" />
              {selectedTableIds.length > 0 ? (
                <span>{t('pos.reservations.selectedTablesPrompt', 'Đã chọn {{count}} bàn. Nhấn "Xác nhận" để gán.', { count: selectedTableIds.length })}</span>
              ) : (
                <span>{t('pos.reservations.selectTablesPrompt', 'Hãy bấm vào một/nhiều bàn trống bên dưới để gán!')}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost"
                onClick={handleCancelAssignment}
                className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {t('common.action.cancel', 'Hủy')}
              </Button>
              {selectedTableIds.length > 0 && (
                <Button 
                  variant="primary"
                  onClick={handleSubmitAssignment}
                  className="px-4 py-1.5 bg-white text-blue-700 hover:bg-blue-50"
                >
                  {t('common.action.confirm', 'Xác nhận')}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Lọc khu vực */}
        {zones.length > 1 && (
          <div className="flex overflow-x-auto scrollbar-none gap-2 p-4 pb-0 shrink-0">
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
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 auto-rows-max">
            {filteredTables.map(table => {
              const isOccupied = table.status !== 'FREE'
              // Kiểm tra xem bàn này có đang được gán cho đơn nào trong danh sách không
              const isReservedBySomeone = displayRes.some(r => r.assignedTableNumbers?.includes(table.number))

              const isTableSelected = selectedTableIds.includes(table.id)

              return (
                <button
                  key={table.id}
                  onClick={() => handleTableClick(table.id)}
                  disabled={isOccupied && !isReservedBySomeone}
                  className={`
                    relative p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 aspect-square transition-all
                    ${isOccupied 
                      ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed' 
                      : isReservedBySomeone
                        ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 cursor-pointer'
                        : isTableSelected
                          ? 'bg-primary/10 border-primary text-primary shadow-md cursor-pointer scale-[0.98]'
                          : selectedResId
                            ? 'bg-white border-primary/40 hover:border-primary hover:bg-primary/5 hover:shadow-md cursor-pointer hover:-translate-y-1'
                            : 'bg-white border-slate-200 cursor-default'
                    }
                  `}
                >
                  <span className="font-black text-xl">{table.number}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isOccupied ? 'bg-slate-200 text-slate-500' : 
                    isReservedBySomeone ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {table.capacity} {t('pos.reservations.person', 'người')}
                  </span>

                  {isReservedBySomeone && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
