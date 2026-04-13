import { PosTableCard } from './PosTableCard'
import { IPosTable } from '@/pages/admin/tables/types/adminTable.type'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { useTranslation } from 'react-i18next'
import { LayoutGrid } from 'lucide-react'

interface PosTableGridProps {
  tables: IPosTable[]
  isLoading: boolean
  onOpenSession: (id: string) => void
  onViewOrder: (id: string) => void
  onCheckout: (id: string) => void
  onMarkCleaned: (id: string) => void
  onTransfer: (id: string) => void
  onMerge: (id: string) => void
}

export function PosTableGrid({
  tables,
  isLoading,
  onOpenSession,
  onViewOrder,
  onCheckout,
  onMarkCleaned,
  onTransfer,
  onMerge
}: PosTableGridProps) {
  const { t } = useTranslation()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[220px] w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!tables || tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant gap-3">
        <LayoutGrid className="size-12 opacity-20" />
        <p className="font-semibold">{t('pos.tableMap.empty.title', 'Không có dữ liệu bàn nào')}</p>
        <p className="text-sm opacity-80">{t('pos.tableMap.empty.desc', 'Chưa có bàn nào được thiết lập trong hệ thống.')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {tables.map(table => (
        <PosTableCard 
          key={table.id} 
          table={table}
          onOpenSession={onOpenSession}
          onViewOrder={onViewOrder}
          onCheckout={onCheckout}
          onMarkCleaned={onMarkCleaned}
          onTransfer={onTransfer}
          onMerge={onMerge}
        />
      ))}
    </div>
  )
}
