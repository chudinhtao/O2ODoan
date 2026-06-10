import { Clock, Coffee, Sparkles, ArrowLeftRight, Link, ShoppingBag } from 'lucide-react'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { IReservation } from '@/shared/types/reservation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { format, parseISO } from 'date-fns'

interface PosTableCardProps {
  table: IPosTable
  upcomingReservation?: IReservation
  isTakeawayMode?: boolean
  onOpenSession: (id: string) => void
  onViewOrder: (id: string) => void
  onCheckout: (id: string) => void
  onMarkCleaned: (id: string) => void
  onTransfer: (id: string) => void
  onMerge: (id: string) => void
  onDropReservation?: (tableId: string, reservationId: string) => void
}
export function PosTableCard({
  table,
  upcomingReservation,
  isTakeawayMode = false,
  onOpenSession,
  onViewOrder,
  onCheckout,
  onMarkCleaned,
  onTransfer,
  onMerge,
  onDropReservation
}: PosTableCardProps) {
  const { t } = useTranslation()

  const handleDragOver = (e: React.DragEvent) => {
    if (table.status === 'FREE' || table.status === 'RESERVED') {
      e.preventDefault() // Allow drop only on FREE tables
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if ((table.status !== 'FREE' && table.status !== 'RESERVED') || !onDropReservation) return
    const resId = e.dataTransfer.getData('reservationId')
    if (resId) {
      onDropReservation(table.id, resId)
    }
  }

  const getElapsedTime = (openedAt?: string) => {
    if (!openedAt) return '--'
    const openedDate = new Date(openedAt)
    const diffMs = Date.now() - openedDate.getTime() // Note: useServerTime logic handles the offset globally via interceptor
    
    // We want a positive duration, so we use getRemaining logic but inverted or just calculate
    const minutes = Math.floor(Math.abs(diffMs) / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  const elapsed = getElapsedTime(table.openedAt)

  if (table.status === 'FREE' || table.status === 'RESERVED') {
    const isReserved = table.status === 'RESERVED' || !!upcomingReservation

    return (
      <div 
        onClick={() => {
          if (table.status === 'FREE' && !isReserved) onOpenSession(table.id)
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group bg-white border ${isReserved ? 'border-orange-200 shadow-orange-100/50 cursor-default' : 'border-slate-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300/80'} rounded-xl p-4 flex flex-col justify-between min-h-[160px] transition-all duration-300 relative overflow-hidden`}
      >
        <div className={`absolute top-0 right-0 w-16 h-16 ${isReserved ? 'bg-orange-50/50' : 'bg-slate-50'} rounded-bl-full -z-10 transition-transform group-hover:scale-110`}></div>
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-3xl font-black font-headline ${isReserved ? 'text-orange-400 group-hover:text-orange-500' : 'text-slate-400 group-hover:text-slate-500'} transition-colors`}>{table.number}</h3>
          <div className="flex flex-col items-end gap-1">
            <span className={`${isReserved ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'} px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1`}>
              {isReserved ? t('pos.table.status.reserved', 'Đã đặt') : t('pos.table.status.free', 'Trống')}
            </span>
            {table.zone && <span className={`text-[9px] font-bold ${isReserved ? 'text-orange-400' : 'text-slate-400'} uppercase`}>{table.zone}</span>}
          </div>
        </div>

        {upcomingReservation && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-2 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-orange-600 flex items-center gap-1">
              <Clock className="size-3" /> Giờ đến: {format(parseISO(upcomingReservation.bookingTime), 'HH:mm')}
            </span>
            <span className="text-[11px] font-medium text-slate-700 truncate w-full" title={upcomingReservation.customerName}>
              {upcomingReservation.customerName}
            </span>
          </div>
        )}

        <div className="mt-auto">
          <p className={`${isReserved ? 'text-orange-400/80' : 'text-slate-400'} text-xs ${!isReserved ? 'mb-2' : ''} font-medium`}>{t('pos.tableMap.capacity', 'Sức chứa:')} {table.capacity} {t('pos.tableMap.guests', 'khách')}</p>
          {!isReserved && (
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation()
                onOpenSession(table.id)
              }}
              className="w-full bg-slate-50 text-slate-600 border-slate-200 hover:bg-primary/10 hover:text-primary hover:border-primary/30 py-2 rounded-lg font-bold text-xs transition-all shadow-sm"
            >
              {t('pos.table.action.open', 'Mở bàn')}
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (table.status === 'MERGED') {
    return (
      <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-secondary/20 hover:border-secondary/30 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-3xl font-black font-headline text-secondary">{table.number}</h3>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Link className="size-3" /> {t('pos.table.status.merged', 'Đã ghép')}
            </span>
            {table.zone && <span className="text-[9px] font-bold text-secondary/70 uppercase">{table.zone}</span>}
          </div>
        </div>
        <div className="text-center py-2 mt-auto">
          <p className="text-secondary font-bold text-xs bg-white/60 p-1.5 rounded-md border border-secondary/20">
            🔗 Gộp vào: {table.parentTableNumber}
          </p>
        </div>
        <Button 
          variant="primary"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); if(table.parentTableId) onViewOrder(table.parentTableId) }}
          className="w-full mt-2 bg-secondary text-on-secondary hover:brightness-110 py-2 rounded-lg font-bold text-xs transition-all shadow-md shadow-secondary/20"
        >
          {t('pos.table.action.viewParent', 'Xem Bàn Gốc')}
        </Button>
      </div>
    )
  }

  if (table.status === 'CLEANING') {
    return (
      <div className="bg-tertiary/5 border border-tertiary/20 rounded-xl p-4 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-tertiary/20 hover:border-tertiary/30 relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-3xl font-black font-headline text-tertiary">{table.number}</h3>
          <div className="flex flex-col items-end gap-1">
            <Sparkles className="text-tertiary animate-pulse size-5" />
            {table.zone && <span className="text-[9px] font-bold text-tertiary/70 uppercase mt-1">{table.zone}</span>}
          </div>
        </div>
        <div className="text-center py-2 mt-auto">
          <p className="text-tertiary font-bold text-xs italic bg-white/60 rounded-md py-1 border border-tertiary/20">{t('pos.table.status.cleaningText', 'Đang dọn dẹp...')}</p>
        </div>
        <Button 
          variant="primary"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onMarkCleaned(table.id) }}
          className="w-full mt-2 bg-tertiary text-on-tertiary hover:brightness-110 py-2 rounded-lg font-bold text-xs transition-all shadow-md shadow-tertiary/20"
        >
          {t('pos.table.action.cleanDone', 'Dọn xong')}
        </Button>
      </div>
    )
  }

  if (table.status === 'PAYMENT_REQUESTED') {
    return (
      <div 
        onClick={() => onCheckout(table.id)}
        className="bg-error/5 border border-error/20 rounded-xl p-4 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-error/20 hover:border-error/30 relative cursor-pointer group"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-3xl font-black font-headline text-error">{table.number}</h3>
          <div className="flex flex-col items-end gap-1">
            <span className="bg-error text-on-error px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 animate-pulse shadow-sm shadow-error/30">
              {t('pos.table.status.waitingPayment', 'Chờ TT')}
            </span>
            {table.zone && <span className="text-[9px] font-bold text-error/70 uppercase">{table.zone}</span>}
          </div>
        </div>
        <div className="mt-auto">
          <div className="mb-3 bg-white/60 p-2 rounded-lg border border-error/20">
            <p className="text-error/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">{t('pos.tableMap.needToPay', 'Cần thanh toán')}</p>
            <p className="text-xl font-black text-error">{new Intl.NumberFormat('vi-VN').format(table.totalAmount || 0)}đ</p>
          </div>
          <Button 
            variant="primary"
            onClick={(e) => { e.stopPropagation(); onCheckout(table.id); }}
            className="w-full bg-error text-on-error hover:brightness-110 py-2 rounded-lg font-bold text-xs transition-all shadow-md shadow-error/20"
          >
            {t('pos.table.action.checkout', 'Thu tiền')}
          </Button>
        </div>
      </div>
    )
  }

  // OCCUPIED
  return (
    <div 
      onClick={() => onViewOrder(table.id)}
      className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col justify-between min-h-[160px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/30 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        {isTakeawayMode ? (
          <ShoppingBag className="size-7 text-primary" />
        ) : (
          <h3 className="text-3xl font-black font-headline text-primary">{table.number}</h3>
        )}
        <div className="flex flex-col items-end gap-1">
          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
            {t('pos.table.status.occupied', 'Đang dùng')}
          </span>
          <div className="flex flex-col items-end">
            <span className="text-primary/70 text-[10px] mt-1 font-bold uppercase flex items-center gap-1">
               <Clock className="size-3" /> {elapsed}
            </span>
            {table.zone && <span className="text-[9px] font-bold text-primary/60 uppercase mt-0.5">{table.zone}</span>}
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex justify-between items-end mb-3 bg-white/60 p-2 rounded-lg border border-primary/20">
          <div>
            <p className="text-primary/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">{t('pos.tableMap.totalAmount', 'Tổng đơn')}</p>
            <p className="text-xl font-black text-primary">{new Intl.NumberFormat('vi-VN').format(table.totalAmount || 0)}đ</p>
          </div>
          <Coffee className="text-primary/40 size-6" />
        </div>
        
        <div className="flex gap-2 w-full">
          {!isTakeawayMode && (
            <>
              <Button 
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onTransfer(table.id); }}
                className="flex-1 border-primary/20 bg-white text-primary hover:bg-primary/10 hover:border-primary/40 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center p-0 shadow-sm"
                title={t('common.transfer', 'Chuyển')}
              >
                <ArrowLeftRight className="size-3.5" />
              </Button>
              <Button 
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onMerge(table.id); }}
                className="flex-1 border-primary/20 bg-white text-primary hover:bg-primary/10 hover:border-primary/40 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center p-0 shadow-sm"
                title={t('common.merge', 'Gộp')}
              >
                <Link className="size-3.5" />
              </Button>
            </>
          )}
          <Button 
            variant="primary"
            onClick={(e) => { e.stopPropagation(); onViewOrder(table.id); }}
            className="flex-[2] bg-primary text-on-primary hover:brightness-110 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center justify-center shadow-md shadow-primary/20"
          >
            {t('pos.table.action.detail', 'Chi tiết')}
          </Button>
        </div>
      </div>
    </div>
  )
}

