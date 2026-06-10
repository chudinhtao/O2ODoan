import { useTranslation } from 'react-i18next'
import { IOrder } from '../types/order.type'
import { Eye, Printer } from 'lucide-react'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { Badge } from '@/shared/components/ui/Badge'

interface Props {
  orders: IOrder[]
  isLoading: boolean
  onViewDetail: (id: string) => void
  keyword: string
  onSearchChange: (value: string) => void
  page: number
  pageSize: number
  totalElements: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  filtersNode?: React.ReactNode
  advancedFiltersNode?: React.ReactNode
}

export function OrdersTable({ 
  orders, 
  isLoading, 
  onViewDetail,
  keyword,
  onSearchChange,
  page,
  pageSize,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  filtersNode,
  advancedFiltersNode
}: Props) {
  const { t } = useTranslation()

  const columns = [
    {
      header: t('admin.orders.table.id'),
      width: '100px',
      cell: (order: IOrder) => (
        <span className="font-mono text-sm font-semibold text-slate-900">
          #{order.id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      header: t('admin.orders.table.createdAt'),
      width: '180px',
      cell: (order: IOrder) => (
        <span className="text-sm text-slate-600">
          {new Date(order.createdAt).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      header: t('admin.orders.table.source'),
      width: '120px',
      cell: (order: IOrder) => (
        order.source === 'MANUAL' ? (
          <Badge variant="info">{t('admin.orders.source.pos')}</Badge>
        ) : (
          <Badge variant="success">{t('admin.orders.source.qr')}</Badge>
        )
      )
    },
    {
      header: t('admin.orders.table.table'),
      width: '120px',
      cell: (order: IOrder) => (
        <span className="text-sm font-bold text-slate-700">
          {order.orderType === 'TAKEAWAY' ? t('pos.tableMap.takeaway', 'Mang về') : (order.tableNumber || '-')}
        </span>
      )
    },
    {
      header: t('admin.orders.table.total'),
      align: 'right' as const,
      width: '140px',
      cell: (order: IOrder) => (
        <span className="text-sm font-bold text-orange-600">
          {order.total.toLocaleString()}đ
        </span>
      )
    },
    {
      header: t('admin.orders.table.status'),
      align: 'center' as const,
      width: '130px',
      cell: (order: IOrder) => (
        <Badge 
          variant={
            order.status === 'PAID' ? 'success' :
            order.status === 'CANCELLED' ? 'danger' :
            'warning'
          }
        >
          {t(`admin.orders.status.${order.status.toLowerCase()}`)}
        </Badge>
      )
    },
    {
      header: t('admin.orders.table.actions'),
      align: 'center' as const,
      width: '80px',
      cell: (order: IOrder) => (
        <DropdownMenu
          items={[
            {
              label: t('admin.orders.table.view'),
              icon: <Eye className="w-4 h-4" />,
              onClick: () => onViewDetail(order.id)
            },
            {
              label: t('admin.orders.table.print'),
              icon: <Printer className="w-4 h-4" />,
              onClick: () => console.log('Print order', order.id)
            }
          ]}
        />
      )
    }
  ]

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <p className="font-semibold text-slate-800">{t('admin.orders.table.empty')}</p>
      <p className="text-sm mt-1">{t('admin.orders.table.emptyDesc')}</p>
    </div>
  )

  return (
    <DataTable
      columns={columns}
      data={orders}
      isLoading={isLoading}
      searchPlaceholder={t('admin.orders.searchPlaceholder')}
      searchValue={keyword}
      onSearchChange={onSearchChange}
      filters={filtersNode}
      advancedFilters={advancedFiltersNode}
      emptyState={emptyState}
      pagination={{
        currentPage: page,
        pageSize: pageSize,
        totalElements: totalElements,
        totalPages: totalPages,
        onPageChange,
        onPageSizeChange
      }}
    />
  )
}
