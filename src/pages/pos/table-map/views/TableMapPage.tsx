import { useNavigate } from 'react-router-dom'
import { usePosTables, useOpenPosTable, useMarkCleaned, useMergeTable, useTransferTable } from '../hooks/usePosTables'
import { PosTableGrid } from '../components/PosTableGrid'
import { TableActionModal } from '../components/TableActionModal'
import { Users, LogOut, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StaffCallPopover } from '../components/StaffCallPopover'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Button } from '@/shared/components/ui/Button'



export default function TableMapPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: tables, isLoading } = usePosTables()
  const { mutate: openTable } = useOpenPosTable()
  const { mutate: markCleaned } = useMarkCleaned()
  const { mutate: mergeTable, isPending: isMerging } = useMergeTable()
  const { mutate: transferTable, isPending: isTransferring } = useTransferTable()

  // Modal Action State
  const [actionSourceTable, setActionSourceTable] = useState<IPosTable | null>(null)
  const [actionType, setActionType] = useState<'TRANSFER' | 'MERGE'>('TRANSFER')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Stats
  const usingCount = tables?.filter(t => t.status === 'OCCUPIED').length || 0
  const waitingCount = tables?.filter(t => t.status === 'PAYMENT_REQUESTED').length || 0
  const freeCount = tables?.filter(t => t.status === 'FREE').length || 0

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

  const handleTransferSubmit = (sourceTableId: string, targetTableId: string) => {
    transferTable({ 
      sourceTableId, 
      targetTableId 
    }, { 
      onSuccess: () => {
        setIsModalOpen(false)
        setActionSourceTable(null)
      } 
    })
  }

  const handleMergeSubmit = (sourceTableIds: string[], targetTableId: string) => {
    mergeTable({ 
      sourceTableIds, 
      targetTableId 
    }, { 
      onSuccess: () => {
        setIsModalOpen(false)
        setActionSourceTable(null)
      } 
    })
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      <main className="flex-grow p-4 lg:p-6 overflow-y-auto">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-black font-headline text-primary tracking-tight mb-3">{t('pos.tableMap.title')}</h2>
            <div className="flex flex-wrap gap-3">
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                {isLoading ? <Skeleton className="h-4 w-12 rounded bg-primary/20" /> : t('pos.tableMap.stats.using', { count: usingCount })}
              </span>
              <span className="bg-tertiary-container/10 text-tertiary-container px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary-container shrink-0"></span>
                {isLoading ? <Skeleton className="h-4 w-12 rounded bg-tertiary-container/20" /> : t('pos.tableMap.stats.waiting', { count: waitingCount })}
              </span>
              <span className="bg-secondary-container/30 text-on-secondary-container px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                {isLoading ? <Skeleton className="h-4 w-12 rounded bg-secondary/20" /> : t('pos.tableMap.stats.free', { count: freeCount })}
              </span>
            </div>
          </div>
          
          {/* Global Toolbar */}
          <div className="flex gap-3">
            <div className="flex items-center justify-center bg-white border border-outline-variant/20 rounded-full px-2">
              <StaffCallPopover />
            </div>
            <Button 
              variant="outline"
              onClick={() => { setActionType('MERGE'); setActionSourceTable(null); setIsModalOpen(true); }}
              className="bg-white border-outline-variant/20 px-5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-surface-container-low shadow-sm whitespace-nowrap"
            >
              <Users className="size-4 text-on-surface-variant" />
              {t('common.mergeTable', 'Gộp bàn')}
            </Button>
            <Button 
              variant="outline"
              onClick={() => { setActionType('TRANSFER'); setActionSourceTable(null); setIsModalOpen(true); }}
              className="bg-white border-outline-variant/20 px-5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-surface-container-low shadow-sm whitespace-nowrap"
            >
              <LogOut className="size-4 text-on-surface-variant" />
              {t('common.transferTable', 'Chuyển bàn')}
            </Button>
            <Button 
              variant="primary"
              onClick={() => navigate('/pos/orders/new/takeaway')}
              className="bg-primary hover:bg-primary/90 text-white px-5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap ml-2"
            >
              <ShoppingBag className="size-4" />
              {t('pos.tableMap.takeaway', 'Tạo Mang Về')}
            </Button>
          </div>
        </header>



        <PosTableGrid 
          tables={tables || []} 
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
      </main>

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

