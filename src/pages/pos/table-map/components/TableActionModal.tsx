import { useState, useEffect } from 'react'
import { ArrowLeftRight, Link } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { Button } from '@/shared/components/ui/Button'
import { TableTransferPanel } from './TableTransferPanel'
import { TableMergePanel } from './TableMergePanel'
import { TableSelector } from './TableSelector'

interface TableActionModalProps {
  isOpen: boolean
  onClose: () => void
  sourceTable: IPosTable | null
  allTables: IPosTable[]
  initialActionType: 'TRANSFER' | 'MERGE'
  onTransferSubmit: (sourceTableId: string, targetTableId: string) => void
  onMergeSubmit: (sourceTableIds: string[], targetTableId: string) => void
  isSubmitting: boolean
}

export function TableActionModal({
  isOpen,
  onClose,
  sourceTable,
  allTables,
  initialActionType,
  onTransferSubmit,
  onMergeSubmit,
  isSubmitting
}: TableActionModalProps) {
  const { t } = useTranslation()
  const [actionType, setActionType] = useState<'TRANSFER' | 'MERGE'>(initialActionType)
  const [targetId, setTargetId] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [manualSourceId, setManualSourceId] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      setActionType(initialActionType)
      setTargetId('')
      setSelectedIds([])
      setManualSourceId('')
    }
  }, [isOpen, initialActionType])

   
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])
   

  if (!isOpen) return null

  const actualSourceTable = sourceTable || allTables.find(t => t.id === manualSourceId)

  const toggleMergeSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleSubmit = () => {
    if (!actualSourceTable) return
    if (actionType === 'TRANSFER') {
      if (!targetId) return
      onTransferSubmit(actualSourceTable.id, targetId)
    } else {
      if (selectedIds.length === 0) return
      onMergeSubmit(selectedIds, actualSourceTable.id)
    }
  }

  const isMerge = actionType === 'MERGE'
  const hasSelection = isMerge ? selectedIds.length > 0 : !!targetId

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[900px] flex flex-col h-[85vh] sm:h-[600px] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black font-headline text-slate-800 flex items-center gap-3">
              {t('pos.table.actionModal.title', 'Thao tác Bàn')}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isMerge 
                ? t('pos.table.actionModal.mergeSubtitle', 'Chọn các bàn cần gộp vào bàn hiện tại')
                : t('pos.table.actionModal.subtitle', 'Chọn bàn đích mong muốn')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="px-5 font-bold" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel', 'Hủy')}
            </Button>
            <Button 
              variant="primary"
              className="px-6 font-bold" 
              onClick={handleSubmit} 
              disabled={!actualSourceTable || !hasSelection || isSubmitting}
              isLoading={isSubmitting}
            >
              {isMerge 
                ? `${t('pos.table.actionModal.mergeNow', 'Gộp Ngay')}${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`
                : t('pos.table.actionModal.transferNow', 'Chuyển Ngay')}
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
          {/* Action Tabs - Clean Underline */}
          <div className="px-6 pt-3 border-b border-slate-200 bg-white shrink-0">
            <div className="flex gap-6">
              <button 
                onClick={() => { setActionType('TRANSFER'); setTargetId(''); setSelectedIds([]) }}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${actionType === 'TRANSFER' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                <ArrowLeftRight className="size-4" />
                {t('common.transferTable', 'Chuyển Bàn')}
              </button>
              <button 
                onClick={() => { setActionType('MERGE'); setTargetId(''); setSelectedIds([]) }}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${actionType === 'MERGE' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
              >
                <Link className="size-4" />
                {t('common.mergeTable', 'Gộp Bàn')}
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 p-6">

          {!actualSourceTable ? (
            <div className="flex-1 flex flex-col px-4 py-6 bg-surface border border-outline-variant/50 rounded-2xl shadow-sm min-h-0">
              <span className="text-sm font-bold text-on-surface mb-4 text-center shrink-0">
                {isMerge 
                  ? t('pos.table.actionModal.step1Merge', '1. Chọn BÀN NHẬN (bàn sẽ giữ lại)') 
                  : t('pos.table.actionModal.step1Transfer', '1. Chọn BÀN HIỆN TẠI (bàn đang có khách)')}
              </span>
              <div className="flex-1 min-h-0">
                <TableSelector 
                  tables={allTables.filter(t => t.status === 'OCCUPIED' || t.status === 'PAYMENT_REQUESTED')}
                  selectedIds={manualSourceId ? [manualSourceId] : []}
                  onSelect={(id) => setManualSourceId(id)}
                  emptyMessage={t('pos.table.actionModal.noOccupiedFound', 'Không có bàn đang sử dụng nào.')}
                  searchPlaceholder={t('pos.table.actionModal.searchOccupied', 'Tìm số bàn đang sử dụng...')}
                />
              </div>
            </div>
          ) : isMerge ? (
            <TableMergePanel 
              actualSourceTable={actualSourceTable}
              allTables={allTables}
              selectedIds={selectedIds}
              toggleMergeSelection={toggleMergeSelection}
            />
          ) : (
            <TableTransferPanel 
              actualSourceTable={actualSourceTable}
              allTables={allTables}
              setTargetId={setTargetId}
              targetId={targetId}
            />
          )}
        </div>

        </div>
      </div>
    </div>
  )
}
