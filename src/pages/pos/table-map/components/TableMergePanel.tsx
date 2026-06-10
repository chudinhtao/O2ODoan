import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { TableSelector } from './TableSelector'

interface TableMergePanelProps {
  actualSourceTable: IPosTable
  allTables: IPosTable[]
  selectedIds: string[]
  toggleMergeSelection: (id: string) => void
}

export function TableMergePanel({ actualSourceTable, allTables, selectedIds, toggleMergeSelection }: TableMergePanelProps) {
  const { t } = useTranslation()

  const selectableTables = allTables
    .filter(table => table.id !== actualSourceTable.id)
    .filter(table => ['OCCUPIED', 'PAYMENT_REQUESTED'].includes(table.status))

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Visual Indicator - Fixed Flow: Sources -> Arrow -> Target */}
      {/* Visual Indicator - Clean */}
      <div className="shrink-0 flex flex-col sm:flex-row items-center px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 flex-1 overflow-x-auto scrollbar-none max-w-full sm:max-w-xs">
          <span className="text-sm font-bold text-slate-600 tracking-wide whitespace-nowrap shrink-0">
            {t('pos.table.actionModal.mergeFrom', 'Các Bàn Gộp')}
          </span>
          <div className="flex gap-2 items-center shrink-0">
            {selectedIds.length === 0 ? (
              <div className="w-10 h-10 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 flex items-center justify-center font-bold text-sm">?</div>
            ) : (
              selectedIds.map(id => {
                const tbl = allTables.find(t => t.id === id)
                return (
                  <div 
                    key={id} 
                    className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-primary/20 animate-in zoom-in-95"
                  >
                    {tbl?.number}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex justify-center py-2 sm:py-0 shrink-0">
          <ArrowRight className="text-slate-300 size-6" />
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
            {actualSourceTable.number}
          </div>
          <span className="text-sm font-bold text-slate-600 tracking-wide">
            {t('pos.table.actionModal.receiveTable', 'Bàn Nhận')}
          </span>
        </div>
      </div>

      {/* Target Selection Grid */}
      <div className="flex-1 flex flex-col min-h-0 space-y-2">
        <div className="flex items-center justify-between shrink-0">
          <label className="text-sm font-semibold text-on-surface">
             {t('pos.table.actionModal.selectMergeSources', 'Chọn các bàn muốn gộp') + ':'}
          </label>
          <span className="text-xs text-on-surface-variant">
            {`${t('pos.table.actionModal.onlyOccupied', 'Chỉ bàn ĐANG SỬ DỤNG')} • ${selectedIds.length} ${t('pos.table.actionModal.selected', 'đã chọn')}`}
          </span>
        </div>
        
        <TableSelector 
          tables={selectableTables}
          selectedIds={selectedIds}
          onSelect={toggleMergeSelection}
          emptyMessage={t('pos.table.actionModal.noTableFound', 'Không tìm thấy bàn phù hợp nào =((')}
        />
      </div>
    </div>
  )
}

