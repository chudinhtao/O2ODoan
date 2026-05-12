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
    <div className="flex flex-col h-full space-y-6">
      {/* Visual Indicator - Fixed Flow: Sources -> Arrow -> Target */}
      <div className="shrink-0 flex items-center justify-between px-4 py-6 bg-surface border border-outline-variant/50 rounded-2xl shadow-sm">
        <div className="flex flex-col items-center flex-1">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            {t('pos.table.actionModal.mergeFrom', 'Các Bàn Gộp')}
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center min-h-[4rem] items-center">
            {selectedIds.length === 0 ? (
              <div className="w-12 h-12 rounded-xl bg-surface-variant border-2 border-dashed border-outline text-on-surface-variant/50 flex items-center justify-center font-bold text-lg">?</div>
            ) : (
              selectedIds.map(id => {
                const tbl = allTables.find(t => t.id === id)
                return (
                  <div 
                    key={id} 
                    className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center font-bold text-lg text-primary shadow-sm animate-in zoom-in-95"
                  >
                    {tbl?.number}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="flex flex-col items-center px-3">
          <span className="text-xs font-semibold text-primary/70 bg-primary/5 px-3 py-1 rounded-full mb-2">
            {t('pos.table.actionModal.mergeTo', 'Gộp vào')}
          </span>
          <div className="w-full flex items-center h-[2px] bg-outline-variant relative">
            <ArrowRight className="absolute right-0 translate-x-1/2 text-outline-variant bg-surface" />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            {t('pos.table.actionModal.receiveTable', 'Bàn Nhận')}
          </span>
          <div className="w-16 h-16 rounded-xl bg-primary border-2 border-primary flex items-center justify-center font-bold text-2xl text-on-primary shadow-inner">
            {actualSourceTable.number}
          </div>
        </div>
      </div>

      {/* Target Selection Grid */}
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
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

