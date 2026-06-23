import {  useState, useMemo , useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Plus, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'
import { Badge } from '@/shared/components/ui/Badge'
import { inventoryService } from '../services/inventory.service'
import { useLocations } from '../hooks/useInventoryQueries'
import CreateTransferModal from './transfer/CreateTransferModal'

export default function TransferTab() {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const { data: locations } = useLocations()
  const getLocationName = (id?: string) => locations?.find(l => l.id === id)?.name || t('admin.inventory.transfer.systemLocation', 'Kho hệ thống')

  // We can query transactions of type IN_TRANSFER or OUT_TRANSFER
  const { data, isLoading } = useQuery({
    queryKey: ['inventory-transactions-transfers', page, pageSize],
    queryFn: () => inventoryService.getTransactions({ 
      type: 'OUT_TRANSFER',
      page, 
      size: pageSize, 
    })
  })

  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0
  const contentData = data?.content || []

  const columns: ColumnDef<any>[] = [
    {
      header: t('admin.inventory.transfer.time', 'Thời gian'),
      cell: (tx) => (
        <span className="text-slate-600">
          {new Date(tx.transactionDate).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      header: t('admin.inventory.transfer.item', 'Nguyên liệu'),
      cell: (tx) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{tx.itemName}</span>
          <span className="text-[10px] text-slate-400 font-mono">{tx.itemSku}</span>
        </div>
      )
    },
    {
      header: t('admin.inventory.transfer.transferQty', 'Số lượng chuyển'),
      align: 'right',
      cell: (tx) => (
        <span className="font-bold text-slate-700">
          {Math.abs(tx.quantityChange)} {tx.uomName}
        </span>
      )
    },
    {
      header: t('admin.inventory.transfer.fromLocation', 'Từ Kho (Xuất)'),
      cell: (tx) => (
        <Badge variant="neutral">{getLocationName(tx.locationId)}</Badge>
      )
    },
    {
      header: t('admin.inventory.transfer.reason', 'Lý do'),
      cell: (tx) => (
        <span className="text-sm text-slate-600 truncate max-w-[200px] block">
          {tx.reason}
        </span>
      )
    }
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800">
          {t('admin.inventory.transfer.title', 'Chuyển kho nội bộ')}
        </h2>
        <Button size="sm" onClick={() => setIsModalOpen(true)} className="!rounded-lg bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1.5" /> 
          {t('admin.inventory.transfer.createBtn', 'Tạo Phiếu Luân Chuyển')}
        </Button>
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-100 flex items-start gap-3">
        <ArrowRightLeft className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1">{t('admin.inventory.transfer.historyTitle', 'Lịch sử điều chuyển hàng hóa (OUT_TRANSFER)')}</p>
          <p className="opacity-90">{t('admin.inventory.transfer.historyDesc', 'Bảng này hiển thị các giao dịch xuất kho để chuyển nội bộ. Tương ứng với mỗi lệnh xuất sẽ có một lệnh IN_TRANSFER được tạo ngầm ở kho đích.')}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={contentData}
        isLoading={isLoading}
        pagination={{
          currentPage: page,
          totalPages: totalPages,
          onPageChange: setPage,
          pageSize: pageSize,
          totalElements: totalElements, onPageSizeChange: (size) => { setPageSize(size); setPage(0); },
        }}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ArrowRightLeft className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-bold">{t('admin.inventory.transfer.emptyState', 'Chưa có dữ liệu chuyển kho')}</p>
          </div>
        }
      />

      {isModalOpen && (
        <CreateTransferModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}
