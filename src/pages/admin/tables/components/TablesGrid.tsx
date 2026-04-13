import { useTranslation } from 'react-i18next'
import { LayoutGrid } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { TableCard } from './TableCard'
import { useGenerateQr, useToggleActiveTable } from '../hooks/useTables'
import type { ITable } from '../types/adminTable.type'

interface TablesGridProps {
  data: ITable[]
  isLoading: boolean
  onEdit: (table: ITable) => void
  onDelete: (table: ITable) => void
  onHardDelete: (table: ITable) => void
}

export function TablesGrid({ data, isLoading, onEdit, onDelete, onHardDelete }: TablesGridProps) {
  const { t } = useTranslation()
  const generateQrMutation = useGenerateQr()
  const toggleActiveMutation = useToggleActiveTable()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-2xl w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <LayoutGrid className="w-14 h-14 text-slate-300 mb-4" />
        <p className="font-semibold text-slate-600">{t('admin.tables.empty')}</p>
        <p className="text-sm text-slate-400 mt-1">{t('admin.tables.emptyDesc')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onEdit={onEdit}
          onDelete={onDelete}
          onHardDelete={onHardDelete}
          onGenerateQr={(id) => generateQrMutation.mutate(id)}
          onToggleActive={(id) => toggleActiveMutation.mutate(id)}
          isGeneratingQr={generateQrMutation.isPending && generateQrMutation.variables === table.id}
          isTogglingActive={toggleActiveMutation.isPending && toggleActiveMutation.variables === table.id}
        />
      ))}
    </div>
  )
}
