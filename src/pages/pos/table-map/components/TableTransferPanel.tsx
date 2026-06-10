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
    <div className="flex flex-col h-full space-y-3">
      {/* Visual Indicator */}
      {/* Visual Indicator - Clean */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
            {actualSourceTable.number}
          </div>
          <span className="text-sm font-bold text-slate-600 tracking-wide">{t('pos.table.actionModal.currentTable', 'Bàn Hiện Tại')}</span>
        </div>

        <div className="flex-1 flex justify-center py-2 sm:py-0">
          <ArrowRight className="text-slate-300 size-6" />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl transition-all duration-300 ${
            targetId 
              ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' 
              : 'border-2 border-dashed border-slate-300 text-slate-400'
          }`}>
            {targetId ? allTables.find(t => t.id === targetId)?.number : '?'}
          </div>
          <span className="text-sm font-bold text-slate-600 tracking-wide">{t('pos.table.actionModal.targetTable', 'Bàn Đích')}</span>
        </div>
      </div>

      {/* Target Selection Grid */}
      <div className="flex-1 flex flex-col min-h-0 space-y-2">
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
