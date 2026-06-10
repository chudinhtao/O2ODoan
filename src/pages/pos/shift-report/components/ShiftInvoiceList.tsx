import { useTranslation } from 'react-i18next'
import { useShiftOrders } from '../hooks/useShiftOrders'
import { Badge } from '@/shared/components/ui/Badge'

import { useState } from 'react'
import { IOrder } from '@/pages/admin/orders/types/order.type'
import { ShiftOrderModal } from './ShiftOrderModal'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'

export function ShiftInvoiceList({ startDate, endDate }: { startDate: string, endDate: string }) {
  const { t, i18n } = useTranslation()
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const { data, isLoading, error } = useShiftOrders(startDate, endDate, page, size, keyword)
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('vi-VN') + ' đ'
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')
  }

  if (error) {
    return (
      <div className="bg-surface rounded-xl shadow-sm border border-error/20 overflow-hidden text-center p-8">
        <p className="text-error font-medium">{t('report.page.invoiceError', 'Không thể tải danh sách hóa đơn.')}</p>
      </div>
    )
  }

  const invoices = data?.content || []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">{t('admin.orders.status.paid', 'Đã TTS')}</Badge>
      case 'MERGED':
        return <Badge variant="neutral">{t('admin.orders.status.merged', 'Đã Gộp')}</Badge>
      case 'CANCELLED':
        return <Badge variant="danger">{t('admin.orders.status.cancelled', 'Đã hủy')}</Badge>
      case 'PAYMENT_REQUESTED':
        return <Badge variant="warning">{t('admin.orders.status.payment_requested', 'Chờ TT')}</Badge>
      default:
        return <Badge variant="info">{t('admin.orders.status.open', 'Đang dùng')}</Badge>
    }
  }

  const columns: ColumnDef<IOrder>[] = [
    {
      header: t('admin.orders.table.id', 'Mã Đơn'),
      accessorKey: 'id',
      cell: (item) => <span className="font-mono text-sm">#{item.id.substring(0, 8)}</span>
    },
    {
      header: t('admin.orders.table.createdAt', 'Thời gian'),
      accessorKey: 'createdAt',
      cell: (item) => <span className="text-sm text-on-surface-variant whitespace-nowrap">{formatDateTime(item.createdAt)}</span>
    },
    {
      header: t('admin.orders.table.table', 'Bàn'),
      accessorKey: 'tableNumber',
      cell: (item) => <span className="text-sm font-medium capitalize">{item.orderType === 'TAKEAWAY' ? t('pos.tableMap.takeaway', 'Mang về') : (item.tableNumber || '--')}</span>
    },
    {
      header: t('admin.orders.table.total', 'Tổng tiền'),
      accessorKey: 'total',
      align: 'right',
      cell: (item) => <span className="text-sm font-bold text-primary whitespace-nowrap">{formatPrice(item.total)}</span>
    },
    {
      header: t('admin.orders.table.status', 'Trạng thái'),
      accessorKey: 'status',
      align: 'center',
      cell: (item) => getStatusBadge(item.status)
    }
  ]

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-outline-variant flex flex-col min-h-[450px] flex-1 relative print:border-none print:shadow-none overflow-hidden print:max-h-none print:overflow-visible">
      <DataTable 
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        searchValue={keyword}
        onSearchChange={(val) => {
          setKeyword(val)
          setPage(0)
        }}
        searchPlaceholder={t('admin.orders.search', 'Tìm kiếm...')}
        onRowClick={(item) => setSelectedOrder(item)}
        pagination={data ? {
          currentPage: data.page,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          pageSize: data.size,
          onPageChange: (p) => setPage(p),
          onPageSizeChange: (s) => {
            setSize(s)
            setPage(0)
          }
        } : undefined}
      />
      <ShiftOrderModal 
        isOpen={selectedOrder !== null} 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  )
}
