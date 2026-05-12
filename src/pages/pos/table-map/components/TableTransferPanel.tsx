import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { TableSelector } from './TableSelector'

interface TableTransferPanelProps {
  actualSourceTable: IPosTable
  allTables: IPosTable[]
  targetId: string
  setTargetId: (id: string) => void
}

export function TableTransferPanel({ actualSourceTable, allTables, targetId, setTargetId }: TableTransferPanelProps) {
  const { t } = useTranslation()

  const selectableTables = allTables
    .filter(table => table.id !== actualSourceTable.id)
    .filter(table => ['FREE', 'CLEANING'].includes(table.status))

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Visual Indicator */}
      <div className="shrink-0 flex items-center justify-between px-4 py-6 bg-surface border border-outline-variant/50 rounded-2xl shadow-sm">
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">{t('pos.table.actionModal.currentTable', 'Bàn Hiện Tại')}</span>
          <div className="w-16 h-16 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center font-bold text-2xl text-primary shadow-inner">
            {actualSourceTable.number}
          </div>
        </div>

        <div className="flex flex-col flex-1 items-center px-4">
          <span className="text-xs font-semibold text-primary/70 bg-primary/5 px-3 py-1 rounded-full mb-2">
            {t('pos.table.actionModal.transferTo', 'Chuyển sang')}
          </span>
          <div className="w-full flex items-center h-[2px] bg-outline-variant relative">
            <ArrowRight className="absolute right-0 translate-x-1/2 text-outline-variant bg-surface" />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">{t('pos.table.actionModal.targetTable', 'Bàn Đích')}</span>
          <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center font-bold text-2xl shadow-inner transition-colors ${
            targetId 
              ? 'bg-primary border-primary text-on-primary' 
              : 'bg-surface-variant border-dashed border-outline text-on-surface-variant/50'
          }`}>
            {targetId ? allTables.find(t => t.id === targetId)?.number : '?'}
          </div>
        </div>
      </div>

      {/* Target Selection Grid */}
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        <div className="flex items-center justify-between shrink-0">
          <label className="text-sm font-semibold text-on-surface">
            {t('pos.table.actionModal.selectTarget', 'Vui lòng chọn bàn đích') + ':'}
          </label>
          <span className="text-xs text-on-surface-variant">
            {t('pos.table.actionModal.onlyFree', 'Chỉ bàn TRỐNG')}
          </span>
        </div>
        
        <TableSelector 
          tables={selectableTables}
          selectedIds={targetId ? [targetId] : []}
          onSelect={(id) => setTargetId(id)}
          emptyMessage={t('pos.table.actionModal.noTableFound', 'Không tìm thấy bàn phù hợp nào =((')}
        />
      </div>
    </div>
  )
}
