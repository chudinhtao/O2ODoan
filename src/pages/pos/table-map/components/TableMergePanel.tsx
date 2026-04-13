import { useState } from 'react'
import { ArrowRight, Search, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'

interface TableMergePanelProps {
  actualSourceTable: IPosTable
  allTables: IPosTable[]
  selectedIds: string[]
  toggleMergeSelection: (id: string) => void
}

export function TableMergePanel({ actualSourceTable, allTables, selectedIds, toggleMergeSelection }: TableMergePanelProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const selectableTables = allTables
    .filter(table => table.id !== actualSourceTable.id)
    .filter(table => ['OCCUPIED', 'PAYMENT_REQUESTED'].includes(table.status))
    .filter(table => table.number.toString().includes(search) || (table.name && table.name.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="space-y-6">
      {/* Visual Indicator */}
      <div className="flex items-center justify-between px-4 py-6 bg-surface border border-outline-variant/50 rounded-2xl shadow-sm">
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
                  <div key={id} className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary flex items-center justify-center font-bold text-lg text-primary">
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-on-surface">
             {t('pos.table.actionModal.selectMergeSources', 'Chọn các bàn muốn gộp') + ':'}
          </label>
          <span className="text-xs text-on-surface-variant">
            {`${t('pos.table.actionModal.onlyOccupied', 'Chỉ bàn ĐANG SỬ DỤNG')} • ${selectedIds.length} ${t('pos.table.actionModal.selected', 'đã chọn')}`}
          </span>
        </div>
        
        <Input
           placeholder={t('pos.table.actionModal.searchPlaceholder', 'Tìm theo số bàn...')}
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           icon={<Search className="size-4" />}
           className="bg-surface"
        />

        {selectableTables.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant text-sm">
            {t('pos.table.actionModal.noTableFound', 'Không tìm thấy bàn phù hợp nào =((') }
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 max-h-[180px] overflow-y-auto pr-1 pb-1">
            {selectableTables.map(tbl => {
              const isSelected = selectedIds.includes(tbl.id)
              return (
                <Button
                  key={tbl.id}
                  variant={isSelected ? 'primary' : 'outline'}
                  onClick={() => toggleMergeSelection(tbl.id)}
                  className={`relative p-3 h-auto rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary shadow-[0_0_0_2px_rgba(var(--color-primary),0.2)]'
                      : 'border-outline-variant hover:border-primary/50 bg-surface text-on-surface'
                  }`}
                >
                  <span className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                    {tbl.number}
                  </span>
                  {isSelected && (
                     <div className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full p-0.5">
                       <Check className="size-3" />
                     </div>
                  )}
                </Button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

