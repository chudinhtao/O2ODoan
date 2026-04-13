import { useState } from 'react'
import { ArrowRight, Search, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'

interface TableTransferPanelProps {
  actualSourceTable: IPosTable
  allTables: IPosTable[]
  targetId: string
  setTargetId: (id: string) => void
}

export function TableTransferPanel({ actualSourceTable, allTables, targetId, setTargetId }: TableTransferPanelProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const selectableTables = allTables
    .filter(table => table.id !== actualSourceTable.id)
    .filter(table => ['FREE', 'CLEANING'].includes(table.status))
    .filter(table => table.number.toString().includes(search) || (table.name && table.name.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="space-y-6">
      {/* Visual Indicator */}
      <div className="flex items-center justify-between px-4 py-6 bg-surface border border-outline-variant/50 rounded-2xl shadow-sm">
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-on-surface">
            {t('pos.table.actionModal.selectTarget', 'Vui lòng chọn bàn đích') + ':'}
          </label>
          <span className="text-xs text-on-surface-variant">
            {t('pos.table.actionModal.onlyFree', 'Chỉ bàn TRỐNG')}
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
              const isSelected = targetId === tbl.id
              return (
                <Button
                  key={tbl.id}
                  variant={isSelected ? 'primary' : 'outline'}
                  onClick={() => setTargetId(tbl.id)}
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
