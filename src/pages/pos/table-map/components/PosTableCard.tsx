import { Check, Clock, Coffee, Sparkles, ArrowLeftRight, Link, ShoppingBag } from 'lucide-react'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'

interface PosTableCardProps {
  table: IPosTable
  isTakeawayMode?: boolean
  onOpenSession: (id: string) => void
  onViewOrder: (id: string) => void
  onCheckout: (id: string) => void
  onMarkCleaned: (id: string) => void
  onTransfer: (id: string) => void
  onMerge: (id: string) => void
}
export function PosTableCard({
  table,
  isTakeawayMode = false,
  onOpenSession,
  onViewOrder,
  onCheckout,
  onMarkCleaned,
  onTransfer,
  onMerge
}: PosTableCardProps) {
  const { t } = useTranslation()

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

  if (table.status === 'FREE') {
    return (
      <div 
        onClick={() => onOpenSession(table.id)}
        className="group bg-white border border-outline-variant/20 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] transition-all hover:shadow-xl hover:border-secondary/30 cursor-pointer"
      >
        <div className="flex justify-between items-start">
          <h3 className="text-4xl font-black font-headline text-on-surface/30 group-hover:text-on-surface/50 transition-colors">{table.number}</h3>
          <span className="bg-secondary-container/40 text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            {t('pos.table.status.free', 'Trống')} <Check className="size-3" />
          </span>
        </div>
        <div className="mt-auto">
          <p className="text-on-surface-variant/60 text-xs mb-4">{t('pos.tableMap.capacity', 'Sức chứa:')} {table.capacity} {t('pos.tableMap.guests', 'khách')}</p>
          <Button variant="outline" className="w-full bg-secondary-container/60 text-on-secondary-container py-3 rounded-xl font-bold text-sm hover:bg-secondary-container transition-all border-none">
            {t('pos.table.action.open', 'Mở bàn')}
          </Button>
        </div>
      </div>
    )
  }

  if (table.status === 'MERGED') {
    return (
      <div className="bg-[#F3E8FF] border-2 border-[#A855F7] rounded-2xl p-6 flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#A855F7]"></div>
        <div className="flex justify-between items-start">
          <h3 className="text-4xl font-black font-headline text-[#A855F7]/80 group-hover:text-[#A855F7] transition-colors">{table.number}</h3>
          <span className="bg-[#A855F7] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Link className="size-3" /> {t('pos.table.status.merged', 'Đã ghép')}
          </span>
        </div>
        <div className="text-center py-4 mt-auto">
          <p className="text-[#A855F7] font-bold text-sm bg-white/60 p-2 rounded-lg border border-[#A855F7]/20 flex items-center justify-center gap-2">
            🔗 {t('pos.table.status.mergedWith', 'Đang gộp vào Bàn')} {table.parentTableNumber}
          </p>
        </div>
        <Button 
          variant="primary"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); if(table.parentTableId) onViewOrder(table.parentTableId) }}
          className="w-full bg-[#A855F7] text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all font-body tracking-wider shadow-lg shadow-[#A855F7]/30"
        >
          {t('pos.table.action.viewParent', 'Xem Bàn Gốc')}
        </Button>
      </div>
    )
  }

  if (table.status === 'CLEANING') {
    return (
      <div className="bg-white border-2 border-secondary/10 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-secondary"></div>
        <div className="flex justify-between items-start">
          <h3 className="text-4xl font-black font-headline text-on-surface/30">{table.number}</h3>
          <Sparkles className="text-secondary animate-pulse size-6" />
        </div>
        <div className="text-center py-4 mt-auto">
          <p className="text-secondary font-bold text-sm italic">{t('pos.table.status.cleaningText', 'Đang vệ sinh...')}</p>
        </div>
        <Button 
          variant="primary"
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onMarkCleaned(table.id) }}
          className="w-full bg-secondary text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 transition-all font-body uppercase tracking-wider"
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
        className="bg-white border-2 border-tertiary-container/10 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] shadow-sm relative overflow-hidden cursor-pointer hover:shadow-md hover:border-tertiary-container/30 transition-all group"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-tertiary-container"></div>
        <div className="flex justify-between items-start">
          <h3 className="text-4xl font-black font-headline text-tertiary-container">{table.number}</h3>
          <span className="bg-tertiary-container text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 animate-pulse">
            {t('pos.table.status.waitingPayment', 'Chờ TT')}
          </span>
        </div>
        <div className="mt-auto">
          <div className="mb-4">
            <p className="text-tertiary-container/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">{t('pos.tableMap.needToPay', 'Cần thanh toán')}</p>
            <p className="text-2xl font-black text-on-surface">{new Intl.NumberFormat('vi-VN').format(table.totalAmount || 0)}đ</p>
          </div>
          <Button 
            variant="primary"
            onClick={(e) => { e.stopPropagation(); onCheckout(table.id); }}
            className="w-full bg-tertiary-container text-white py-3 rounded-xl font-bold text-sm hover:brightness-110 shadow-lg shadow-tertiary-container/20 transition-all"
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
      className="relative bg-white border-2 border-primary/10 rounded-2xl p-6 flex flex-col justify-between min-h-[220px] shadow-sm overflow-hidden cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
      <div className="flex justify-between items-start">
        {isTakeawayMode ? (
          <ShoppingBag className="size-9 text-primary/80" />
        ) : (
          <h3 className="text-4xl font-black font-headline text-primary">{table.number}</h3>
        )}
        <div className="flex flex-col items-end">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
            {t('pos.table.status.occupied', 'Đang dùng')}
          </span>
          <span className="text-on-surface-variant text-[10px] mt-2 font-bold uppercase tracking-widest flex items-center gap-1">
             <Clock className="size-3" /> {elapsed}
          </span>
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-widest mb-0.5">{t('pos.tableMap.totalAmount', 'Tổng đơn')}</p>
            <p className="text-2xl font-black text-on-surface">{new Intl.NumberFormat('vi-VN').format(table.totalAmount || 0)}đ</p>
          </div>
          <Coffee className="text-primary/40 size-6" />
        </div>
        
        <div className="flex gap-2 w-full">
          {!isTakeawayMode && (
            <>
              <Button 
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onTransfer(table.id); }}
                className="flex-1 border-primary/20 text-primary py-2 rounded-xl font-bold text-[12px] hover:bg-primary/5 transition-all flex items-center justify-center gap-1 px-1"
                title={t('common.transfer', 'Chuyển bàn')}
              >
                <ArrowLeftRight className="size-3.5" />
              </Button>
              <Button 
                variant="outline"
                onClick={(e) => { e.stopPropagation(); onMerge(table.id); }}
                className="flex-1 border-primary/20 text-primary py-2 rounded-xl font-bold text-[12px] hover:bg-primary/5 transition-all flex items-center justify-center gap-1 px-1"
                title={t('common.merge', 'Gộp bàn')}
              >
                <Link className="size-3.5" />
              </Button>
            </>
          )}
          <Button 
            variant="primary"
            onClick={(e) => { e.stopPropagation(); onViewOrder(table.id); }}
            className="flex-[2] bg-primary text-white py-2 rounded-xl font-bold text-[13px] hover:brightness-110 transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
          >
            {t('pos.table.action.detail', 'Chi tiết')}
          </Button>
        </div>
      </div>
    </div>
  )
}

