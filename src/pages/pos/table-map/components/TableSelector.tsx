import { useState } from 'react'
import { Search, Check, Users } from 'lucide-react'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { useTranslation } from 'react-i18next'

interface TableSelectorProps {
  tables: IPosTable[]
  selectedIds: string[]
  onSelect: (id: string) => void
  emptyMessage: string
  searchPlaceholder?: string
}

export function TableSelector({ tables, selectedIds, onSelect, emptyMessage, searchPlaceholder }: TableSelectorProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filteredTables = tables.filter(table => 
    table.number.toString().includes(search) || 
    (table.name && table.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full space-y-4">
      <Input
        placeholder={searchPlaceholder || t('pos.table.actionModal.searchPlaceholder', 'Tìm theo số bàn...')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="size-4" />}
        className="bg-surface shrink-0"
      />

      {filteredTables.length === 0 ? (
        <div className="py-8 text-center text-on-surface-variant text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 flex-1 overflow-y-auto pr-2 pb-1 scrollbar-thin content-start">
          {filteredTables.map(tbl => {
            const isSelected = selectedIds.includes(tbl.id)
            return (
              <Button
                key={tbl.id}
                variant={isSelected ? 'primary' : 'outline'}
                onClick={() => onSelect(tbl.id)}
                className={`relative p-3 h-auto rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary shadow-[0_0_0_2px_rgba(var(--color-primary),0.2)]'
                    : 'border-outline-variant hover:border-primary/50 bg-surface text-on-surface hover:shadow-md'
                }`}
              >
                <span className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                  {tbl.number}
                </span>
                
                {/* Visual upgrade: show capacity/guests */}
                <div className={`flex items-center gap-1 mt-1 font-bold ${isSelected ? 'text-primary/70' : 'text-on-surface-variant/60'}`}>
                   <Users className="size-3" />
                   <span className="text-[10px]">{tbl.capacity}</span>
                </div>

                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 bg-primary text-white rounded-full p-0.5 shadow-sm animate-in zoom-in-50 duration-200">
                    <Check className="size-3" />
                  </div>
                )}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
