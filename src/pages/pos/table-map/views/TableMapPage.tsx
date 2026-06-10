import { useNavigate } from 'react-router-dom'
import { usePosTables, useOpenPosTable, useMarkCleaned, useMergeTable, useTransferTable } from '../hooks/usePosTables'
import { PosTableGrid } from '../components/PosTableGrid'
import { TableActionModal } from '../components/TableActionModal'
import { Users, LogOut, ShoppingBag } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Button } from '@/shared/components/ui/Button'
import { PosHeader } from '@/layouts/components/PosHeader'
import { usePosReservations } from '@/pages/pos/reservations/hooks/usePosReservations'
import { IReservation } from '@/shared/types/reservation'
import { format } from 'date-fns'

export default function TableMapPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // Table Queries
  const { data: tables, isLoading: isTablesLoading } = usePosTables()
  // TableMap needs ALL reservations for the day to display indicators on FREE tables
  const { reservations, isLoading: isResLoading } = usePosReservations(format(new Date(), 'yyyy-MM-dd'), 'ALL', '', 0, 1000)
  const isLoading = isTablesLoading || isResLoading
  const { mutate: openTable } = useOpenPosTable()
  const { mutate: markCleaned } = useMarkCleaned()
  const { mutateAsync: mergeTable, isPending: isMerging } = useMergeTable()
  const { mutateAsync: transferTable, isPending: isTransferring } = useTransferTable()

  // UI State
  const [actionSourceTable, setActionSourceTable] = useState<IPosTable | null>(null)
  const [actionType, setActionType] = useState<'TRANSFER' | 'MERGE'>('TRANSFER')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Stats
  const usingCount = tables?.filter(t => t.status === 'OCCUPIED').length || 0
  const waitingCount = tables?.filter(t => t.status === 'PAYMENT_REQUESTED').length || 0
  const freeCount = tables?.filter(t => t.status === 'FREE').length || 0
  const cleaningCount = tables?.filter(t => t.status === 'CLEANING').length || 0

  // Zone Filtering
  const [selectedZone, setSelectedZone] = useState<string>('All')

  // Pre-calculate reservations map to avoid O(N*M) lookups in cards
  const reservedTablesMap = useMemo(() => {
    const map = new Map<number, IReservation>()
    if (!reservations) return map
    reservations.forEach(r => {
      if (r.status === 'PENDING' || r.status === 'CONFIRMED') {
        r.assignedTableNumbers?.forEach(num => {
          if (!map.has(num)) {
            map.set(num, r)
          }
        })
      }
    })
    return map
  }, [reservations])

  const zones = useMemo(() => {
    if (!tables) return ['All']
    const uniqueZones = Array.from(new Set(tables.map(t => t.zone).filter(Boolean) as string[]))
    return ['All', ...uniqueZones]
  }, [tables])

  const filteredTables = useMemo(() => {
    if (!tables) return []
    if (selectedZone === 'All') return tables
    return tables.filter(t => t.zone === selectedZone)
  }, [tables, selectedZone])

  const handleOpenSession = (id: string) => {
    openTable(id, {
      onSuccess: () => navigate(`/pos/orders/new/${id}`)
    })
  }

  const handleActionClick = (id: string, type: 'TRANSFER' | 'MERGE') => {
    const t = tables?.find(x => x.id === id)
    if (t) {
      setActionSourceTable(t)
      setActionType(type)
      setIsModalOpen(true)
    }
  }

  const handleTransferSubmit = async (sourceTableId: string, targetTableId: string) => {
    try {
      await transferTable({ sourceTableId, targetTableId })
      setIsModalOpen(false)
      setActionSourceTable(null)
    } catch (error) {}
  }

  const handleMergeSubmit = async (sourceTableIds: string[], targetTableId: string) => {
    try {
      await mergeTable({ sourceTableIds, targetTableId })
      setIsModalOpen(false)
      setActionSourceTable(null)
    } catch (error) {}
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-slate-50">
      <PosHeader
        title={t('pos.tableMap.title', 'Sơ đồ Bàn')}
        subtitle={
          <>
            <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
              {isLoading ? <Skeleton className="h-3 w-8 rounded bg-primary/20" /> : t('pos.tableMap.stats.using', 'Đang dùng ({{count}})', { count: usingCount })}
            </span>
            <span className="bg-error/10 text-error px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
              {isLoading ? <Skeleton className="h-3 w-8 rounded bg-error/20" /> : t('pos.tableMap.stats.waiting', 'Chờ thanh toán ({{count}})', { count: waitingCount })}
            </span>
            {cleaningCount > 0 && (
              <span className="bg-orange-500/10 text-orange-600 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                {isLoading ? <Skeleton className="h-3 w-8 rounded bg-orange-500/20" /> : t('pos.tableMap.stats.cleaning', 'Đang dọn ({{count}})', { count: cleaningCount })}
              </span>
            )}
            <span className="bg-white text-slate-500 px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
              {isLoading ? <Skeleton className="h-3 w-8 rounded bg-slate-200" /> : t('pos.tableMap.stats.free', 'Trống ({{count}})', { count: freeCount })}
            </span>
          </>
        }
        actions={
          <>
            <Button 
              variant="outline"
              onClick={() => { setActionType('MERGE'); setActionSourceTable(null); setIsModalOpen(true); }}
              className="bg-white border-slate-200 px-4 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20 shadow-sm whitespace-nowrap h-9 text-slate-600 transition-all"
            >
              <Users className="size-3.5 text-slate-500 group-hover:text-primary" />
              <span className="hidden sm:inline">{t('common.mergeTable', 'Gộp bàn')}</span>
            </Button>
            <Button 
              variant="outline"
              onClick={() => { setActionType('TRANSFER'); setActionSourceTable(null); setIsModalOpen(true); }}
              className="bg-white border-slate-200 px-4 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary/20 shadow-sm whitespace-nowrap h-9 text-slate-600 transition-all"
            >
              <LogOut className="size-3.5 text-slate-500 group-hover:text-primary" />
              <span className="hidden sm:inline">{t('common.transferTable', 'Chuyển bàn')}</span>
            </Button>
            <Button 
              variant="primary"
              onClick={() => navigate('/pos/orders/new/takeaway')}
              className="bg-primary hover:brightness-110 text-on-primary px-4 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm whitespace-nowrap h-9 sm:ml-1 transition-all"
            >
              <ShoppingBag className="size-3.5" />
              <span className="hidden sm:inline">{t('pos.tableMap.takeaway', 'Tạo Mang Về')}</span>
            </Button>
          </>
        }
      />

      <div className="flex-1 flex flex-col min-h-0 p-3 lg:p-4">
        {zones.length > 1 && (
          <div className="flex overflow-x-auto scrollbar-none gap-2 mb-3 pb-3 border-b border-slate-200 shrink-0">
            {zones.map(zone => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedZone === zone
                    ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary hover:border-primary/30'
                }`}
              >
                {zone === 'All' ? t('pos.tableMap.allZones', 'Tất cả khu vực') : zone}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 overflow-y-auto pr-1">
          <PosTableGrid 
            tables={filteredTables} 
            reservedTablesMap={reservedTablesMap}
            isLoading={isLoading}
            onOpenSession={handleOpenSession}
            onViewOrder={(id) => {
              const t = tables?.find(x => x.id === id)
              navigate(`/pos/orders/${id}`, { state: { sessionToken: t?.currentSessionToken } })
            }}
            onCheckout={(id) => {
              const t = tables?.find(x => x.id === id)
              navigate(`/pos/payment/${id}`, { state: { sessionToken: t?.currentSessionToken } })
            }}
            onMarkCleaned={(id) => markCleaned(id)}
            onTransfer={(id) => handleActionClick(id, 'TRANSFER')}
            onMerge={(id) => handleActionClick(id, 'MERGE')}
          />
        </div>
      </div>

      {/* Action Popups */}
      <TableActionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setActionSourceTable(null)
        }}
        sourceTable={actionSourceTable}
        allTables={tables || []}
        initialActionType={actionType}
        onTransferSubmit={handleTransferSubmit}
        onMergeSubmit={handleMergeSubmit}
        isSubmitting={isMerging || isTransferring}
      />
    </div>
  )
}

