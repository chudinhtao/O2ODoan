import { useState, useEffect } from 'react'
import { X, ArrowLeftRight, Link, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { TableTransferPanel } from './TableTransferPanel'
import { TableMergePanel } from './TableMergePanel'

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
  const [search, setSearch] = useState('')
  const [manualSourceId, setManualSourceId] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      setActionType(initialActionType)
      setTargetId('')
      setSelectedIds([])
      setSearch('')
      setManualSourceId('')
    }
  }, [isOpen, initialActionType])

  /* eslint-disable react-hooks/rules-of-hooks */
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])
  /* eslint-enable react-hooks/rules-of-hooks */

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
      
      <div className="relative bg-surface rounded-2xl shadow-xl w-full max-w-[500px] flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <Button variant="outline" onClick={onClose} className="absolute top-4 right-4 !p-2 h-auto rounded-full z-10 border-transparent bg-surface-variant hover:bg-outline-variant">
          <X className="size-5" />
        </Button>

        {/* Header */}
        <div className="p-6 border-b border-outline-variant bg-surface shrink-0">
          <h2 className="text-xl font-bold font-headline text-on-surface">
            {t('pos.table.actionModal.title', 'Thao tác Bàn')}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            {isMerge 
              ? t('pos.table.actionModal.mergeSubtitle', 'Chọn các bàn cần gộp vào bàn hiện tại')
              : t('pos.table.actionModal.subtitle', 'Chọn bàn đích mong muốn')}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-variant/30 space-y-6">
          {/* Action Tabs */}
          <div className="flex bg-surface-variant p-1 rounded-xl shadow-inner border border-outline-variant/50 gap-1">
            <Button
              variant={actionType === 'TRANSFER' ? 'primary' : 'outline'}
              onClick={() => { setActionType('TRANSFER'); setTargetId(''); setSelectedIds([]) }}
              className={`flex-1 py-2.5 flex justify-center items-center gap-2 rounded-lg text-sm font-bold transition-all border-transparent ${
                actionType !== 'TRANSFER' && 'bg-transparent text-on-surface-variant shadow-none hover:bg-surface'
              }`}
            >
              <ArrowLeftRight className="size-4" />
              {t('common.transfer', 'Chuyển Bàn')}
            </Button>
            <Button
              variant={actionType === 'MERGE' ? 'primary' : 'outline'}
              onClick={() => { setActionType('MERGE'); setTargetId(''); setSelectedIds([]) }}
              className={`flex-1 py-2.5 flex justify-center items-center gap-2 rounded-lg text-sm font-bold transition-all border-transparent ${
                actionType !== 'MERGE' && 'bg-transparent text-on-surface-variant shadow-none hover:bg-surface'
              }`}
            >
              <Link className="size-4" />
              {t('common.merge', 'Gộp Bàn')}
            </Button>
          </div>

          {!actualSourceTable ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 bg-surface border border-outline-variant/50 rounded-2xl shadow-sm">
              <span className="text-sm font-bold text-on-surface mb-4">
                {isMerge 
                  ? t('pos.table.actionModal.step1Merge', '1. Chọn BÀN NHẬN (bàn sẽ giữ lại)') 
                  : t('pos.table.actionModal.step1Transfer', '1. Chọn BÀN HIỆN TẠI (bàn đang có khách)')}
              </span>
              <div className="flex flex-col w-full gap-3">
                 <Input
                   placeholder={t('pos.table.actionModal.searchOccupied', 'Tìm số bàn đang sử dụng...')}
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   icon={<Search className="size-4" />}
                   className="bg-surface"
                 />
                 <div className="grid grid-cols-4 gap-3 max-h-[180px] overflow-y-auto pr-1 pb-1 mt-2">
                    {allTables.filter(t => t.status === 'OCCUPIED' && t.number.toString().includes(search)).map(tbl => (
                      <Button
                        variant="outline"
                        key={tbl.id}
                        onClick={() => setManualSourceId(tbl.id)}
                        className="p-3 h-auto rounded-xl border border-outline-variant flex flex-col items-center justify-center transition-all bg-surface hover:border-primary text-on-surface"
                      >
                        <span className="text-xl font-bold">{tbl.number}</span>
                      </Button>
                    ))}
                    {allTables.filter(t => t.status === 'OCCUPIED' && t.number.toString().includes(search)).length === 0 && (
                      <div className="col-span-4 text-center text-sm text-on-surface-variant py-4">
                        {t('pos.table.actionModal.noOccupiedFound', 'Không có bàn đang sử dụng nào.')}
                      </div>
                    )}
                 </div>
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

        {/* Footer */}
        <div className="p-5 border-t border-outline-variant bg-surface shrink-0 flex gap-3">
          <Button variant="outline" className="flex-1 py-3 cursor-pointer" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel', 'Hủy')}
          </Button>
          <Button 
            variant="primary"
            className="flex-1 py-3 cursor-pointer" 
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
    </div>
  )
}
