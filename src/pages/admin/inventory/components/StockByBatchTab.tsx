import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CalendarClock, Trash2, Download, History } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { useInventoryItems } from '../hooks/useInventoryQueries'
import { IInventoryItem, IBatchFlattened } from '../types/inventory.type'
import { Badge } from '@/shared/components/ui/Badge'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import WasteModal from './WasteModal'

export default function StockByBatchTab() {
  const { t } = useTranslation()
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(0)
  const [wasteItem, setWasteItem] = useState<{ itemId: string, name: string } | null>(null)
  const [sortOrder] = useState<'asc' | 'desc'>('asc')
  const pageSize = 20

  const { data, isLoading } = useInventoryItems({ 
    keyword: keyword || undefined, 
    isActive: true, 
    page, 
    size: pageSize 
  })

  const flattenedBatches = useMemo(() => {
    if (!data?.content) return []
    
    const batches: IBatchFlattened[] = []
    data.content.forEach((item: IInventoryItem) => {
      if (item.batches && item.batches.length > 0) {
        item.batches.forEach(batch => {
          batches.push({
            ...batch,
            itemId: item.id,
            itemName: item.name,
            itemSku: item.sku,
            baseUom: item.baseUom,
          })
        })
      } else if (item.currentStock > 0) {
        batches.push({
          id: `manual-${item.id}`,
          lotNumber: t('admin.inventory.batch.defaultLot'),
          expiryDate: '',
          currentStock: item.currentStock,
          itemId: item.id,
          itemName: item.name,
          itemSku: item.sku,
          baseUom: item.baseUom,
        })
      }
    })

    return batches.sort((a, b) => {
      if (!a.expiryDate) return 1
      if (!b.expiryDate) return -1
      const timeA = new Date(a.expiryDate).getTime()
      const timeB = new Date(b.expiryDate).getTime()
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA
    })
  }, [data, sortOrder, t])

  const columns: ColumnDef<IBatchFlattened>[] = [
    {
      header: t('admin.inventory.batch.colItem'),
      cell: (batch) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{batch.itemName}</span>
          <span className="text-[10px] text-slate-500 font-mono">{batch.itemSku}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.batch.colLot'),
      cell: (batch) => (
        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700 font-bold border border-slate-200">
          {batch.lotNumber}
        </span>
      )
    },
    {
      header: t('admin.inventory.batch.colExpiry'),
      cell: (batch) => {
        const isExpired = batch.expiryDate && new Date(batch.expiryDate) < new Date()
        return (
          <span className={isExpired ? 'text-red-600 font-bold' : 'text-slate-600'}>
            {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('vi-VN') : '—'}
          </span>
        )
      }
    },
    {
      header: t('admin.inventory.batch.colStock'),
      align: 'right',
      cell: (batch) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-slate-900">{batch.currentStock.toLocaleString()}</span>
          <span className="text-[10px] text-slate-500 font-medium uppercase">{batch.baseUom?.shortName}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.batch.colStatus'),
      align: 'center',
      cell: (batch) => {
        const isExpired = batch.expiryDate && new Date(batch.expiryDate) < new Date()
        const isExpiringSoon = batch.expiryDate && !isExpired && 
          (new Date(batch.expiryDate).getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000)

        if (isExpired) return <Badge variant="danger">{t('admin.inventory.batch.statusExpired')}</Badge>
        if (isExpiringSoon) return <Badge variant="warning">{t('admin.inventory.batch.statusExpiringSoon')}</Badge>
        return <Badge variant="success">{t('admin.inventory.batch.statusNormal')}</Badge>
      }
    },
    {
      header: '',
      align: 'right',
      cell: (batch) => (
        <DropdownMenu 
          items={[
            { 
              label: t('admin.inventory.batch.actionWaste'), 
              onClick: () => setWasteItem({ itemId: batch.itemId, name: batch.itemName }), 
              icon: <Trash2 className="w-4 h-4" />,
              variant: 'danger' 
            },
            { label: 'Xem lịch sử', onClick: () => {}, icon: <History className="w-4 h-4" /> },
          ]}
        />
      )
    }
  ]

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title={t('admin.inventory.batch.title')}
        description={t('admin.inventory.batch.description')}
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Xuất File
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={flattenedBatches}
        isLoading={isLoading}
        searchPlaceholder={t('admin.inventory.batch.searchPlaceholder')}
        searchValue={keyword}
        onSearchChange={(val) => {
          setKeyword(val)
          setPage(0)
        }}
        pagination={{
          currentPage: page,
          totalPages: data?.totalPages ?? 0,
          onPageChange: setPage,
          pageSize: pageSize,
          totalElements: data?.totalElements ?? 0,
        }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <CalendarClock className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-bold">{t('admin.inventory.batch.empty')}</p>
          </div>
        }
      />

      {wasteItem && (
        <WasteModal
          isOpen={!!wasteItem}
          onClose={() => setWasteItem(null)}
          prefilledItem={wasteItem}
        />
      )}
    </div>
  )
}
