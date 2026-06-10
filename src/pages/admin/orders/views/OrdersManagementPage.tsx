import { useTranslation } from 'react-i18next'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'
import { OrderFiltersParams } from '../types/order.type'
import { OrdersTable } from '../components/OrdersTable'
import { Filter, FilterX } from 'lucide-react'
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import { ExportButton } from '@/shared/components/ExportButton'

export default function OrdersManagementPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<OrderFiltersParams>({
    page: 0,
    size: 20,
    status: '',
    source: '',
    search: ''
  })

  const { data, isLoading  } = useOrders(filters)

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }))
  }

  const hasActiveFilters = filters.status !== '' || filters.source !== '' || filters.orderType !== '' || filters.paymentMethod !== '' || !!filters.startDate || !!filters.endDate

  const filtersNode = (
    <Button
      variant="ghost"
      onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
      className={`!px-4 !py-2 !rounded-xl transition-all min-w-[110px] justify-center border-none ${hasActiveFilters ? '!bg-primary/10 !text-primary font-semibold' : '!bg-slate-100 !text-slate-600 hover:!bg-slate-200'}`}
    >
      {isFiltersExpanded ? <FilterX size={18} className="mr-2 hidden sm:block" /> : <Filter size={18} className="mr-2 hidden sm:block" />}
      {t('common.filter', 'Bộ lọc')}
      {hasActiveFilters && <span className="ml-1.5 flex h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </Button>
  )

  const advancedFiltersNode = isFiltersExpanded ? (
    <div className="flex flex-wrap items-center gap-3 w-full animate-in slide-in-from-top-2 duration-200">
      <div className="w-full md:w-[180px] shrink-0">
        <Select
          value={filters.status || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('status', e.target.value)}
          options={[
            { value: '', label: t('admin.orders.status.all') as string },
            { value: 'OPEN', label: t('admin.orders.status.open') as string },
            { value: 'PAID', label: t('admin.orders.status.paid') as string },
            { value: 'CANCELLED', label: t('admin.orders.status.cancelled') as string },
          ]}
          className="!py-2"
          icon={<Filter className="w-4 h-4 text-slate-400" />}
        />
      </div>
      <div className="w-full md:w-[180px] shrink-0">
        <Select
          value={filters.source || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('source', e.target.value)}
          options={[
            { value: '', label: t('admin.orders.source.all') as string },
            { value: 'MANUAL', label: t('admin.orders.source.pos') as string },
            { value: 'QR', label: t('admin.orders.source.qr') as string },
          ]}
          className="!py-2"
        />
      </div>
      <div className="w-full md:w-[180px] shrink-0">
        <Select
          value={filters.orderType || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('orderType', e.target.value)}
          options={[
            { value: '', label: t('admin.orders.orderType.all') as string },
            { value: 'DINE_IN', label: t('admin.orders.orderType.dine_in') as string },
            { value: 'TAKEAWAY', label: t('admin.orders.orderType.takeaway') as string },
            { value: 'DELIVERY', label: t('admin.orders.orderType.delivery') as string },
          ]}
          className="!py-2"
        />
      </div>
      <div className="w-full md:w-[180px] shrink-0">
        <Select
          value={filters.paymentMethod || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('paymentMethod', e.target.value)}
          options={[
            { value: '', label: t('admin.orders.paymentMethod.all') as string },
            { value: 'CASH', label: t('admin.orders.paymentMethod.cash') as string },
            { value: 'TRANSFER', label: t('admin.orders.paymentMethod.transfer') as string },
            { value: 'MIXED', label: t('admin.orders.paymentMethod.mixed') as string },
          ]}
          className="!py-2"
        />
      </div>
      <div className="w-full md:w-[180px] shrink-0">
        <input 
          type="date"
          className="w-full h-[38px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm cursor-pointer hover:border-slate-300"
          value={filters.startDate ? filters.startDate.split('T')[0] : ''}
          onChange={(e) => {
            if (!e.target.value) {
              handleFilterChange('startDate', '')
            } else {
              handleFilterChange('startDate', `${e.target.value}T00:00:00`)
            }
          }}
          title={t('admin.orders.filter.startDate') as string}
        />
      </div>
      <div className="w-full md:w-[180px] shrink-0">
        <input 
          type="date"
          className="w-full h-[38px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm cursor-pointer hover:border-slate-300"
          value={filters.endDate ? filters.endDate.split('T')[0] : ''}
          onChange={(e) => {
            if (!e.target.value) {
              handleFilterChange('endDate', '')
            } else {
              handleFilterChange('endDate', `${e.target.value}T23:59:59`)
            }
          }}
          title={t('admin.orders.filter.endDate') as string}
          min={filters.startDate ? filters.startDate.split('T')[0] : undefined}
        />
      </div>
      {hasActiveFilters && (
        <Button
          variant="danger"
          onClick={() => setFilters(prev => ({...prev, status: '', source: '', orderType: '', paymentMethod: '', startDate: undefined, endDate: undefined, page: 0}))}
          className="w-full md:w-[180px] shrink-0 h-[38px] flex items-center justify-center !px-4 !py-2 !text-sm !font-medium !text-red-600 !bg-red-50 hover:!bg-red-100 !rounded-lg border !border-red-100 whitespace-nowrap !shadow-none"
        >
          <FilterX className="w-[18px] h-[18px] mr-1" />
          {t('common.reset', 'Bỏ lọc')}
        </Button>
      )}
    </div>
  ) : null

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
        <AdminPageHeader
          title={t('admin.orders.title')}
		  description={t('admin.orders.description')}
          actions={
            <div className="flex items-center gap-2">
              <ExportButton
                data={(data?.content || []).map(order => ({
                  ...order,
                  orderNumber: `#${order.id.slice(-6).toUpperCase()}`,
                  tableName: order.orderType === 'TAKEAWAY' ? t('pos.tableMap.takeaway', 'Mang về') : (order.tableNumber || '-'),
                  discountAmount: order.discount || 0,
                  taxAmount: order.tax || 0,
                  netRevenue: order.total - (order.tax || 0),
                  paymentMethodLabel: order.paymentMethod ? t(`admin.orders.paymentMethod.${order.paymentMethod.toLowerCase()}`, order.paymentMethod) : '-',
                  statusLabel: t(`admin.orders.status.${order.status.toLowerCase()}`),
                  sourceLabel: order.source === 'MANUAL' ? t('admin.orders.source.pos') : t('admin.orders.source.qr'),
                  orderTypeLabel: t(`admin.orders.orderType.${order.orderType.toLowerCase()}`),
                  createdAtFormatted: new Date(order.createdAt).toLocaleString('vi-VN'),
                  promoCode: order.promotionCode || '—',
                  cancelReason: order.cancelReason || '—',
                  orderItemsSummary: (() => {
                    if (!order.tickets || order.tickets.length === 0) return ''
                    const itemMap = new Map<string, number>()
                    order.tickets.forEach(ticket => {
                      if (ticket.items) {
                        ticket.items.forEach(item => {
                          const current = itemMap.get(item.itemName) || 0
                          itemMap.set(item.itemName, current + item.quantity)
                        })
                      }
                    })
                    return Array.from(itemMap.entries())
                      .map(([name, qty]) => `${qty}x ${name}`)
                      .join(', ')
                  })()
                }))}
                fileName={t('admin.orders.exportFileName', { date: new Date().toISOString().split('T')[0], defaultValue: `Danh_sach_don_hang_${new Date().toISOString().split('T')[0]}` })}
                sheetName="DonHang"
                headers={{
                  'orderNumber': t('admin.orders.table.id', 'Mã đơn hàng'),
                  'createdAtFormatted': t('admin.orders.table.createdAt', 'Ngày tạo'),
                  'sourceLabel': t('admin.orders.table.source', 'Nguồn'),
                  'orderTypeLabel': t('admin.orders.table.orderType', 'Loại đơn'),
                  'tableName': t('admin.orders.table.table', 'Bàn'),
                  'orderItemsSummary': t('admin.orders.table.itemsSummary', 'Tóm tắt món ăn'),
                  'discountAmount': t('admin.orders.table.discount', 'Chiết khấu / Giảm giá'),
                  'taxAmount': t('admin.orders.table.tax', 'Thuế VAT'),
                  'netRevenue': t('admin.orders.table.netRevenue', 'Doanh thu thuần'),
                  'total': t('admin.orders.table.total', 'Tổng tiền thanh toán'),
                  'paymentMethodLabel': t('admin.orders.table.paymentMethod', 'Hình thức thanh toán'),
                  'statusLabel': t('admin.orders.table.status', 'Trạng thái'),
                  'promoCode': t('admin.orders.table.promoCode', 'Mã KM'),
                  'cancelReason': t('admin.orders.table.cancelReason', 'Lý do hủy')
                }}
              />
             
            </div>
          }
        />

        <div className="flex-1 min-h-0 flex flex-col px-4 lg:px-6 pt-4 pb-4 md:pb-6">
          <OrdersTable
            orders={data?.content || []}
            isLoading={isLoading}
            onViewDetail={(id) => navigate(`/admin/orders/${id}`)}
            keyword={filters.search || ''}
            onSearchChange={(value) => handleFilterChange('search', value)}
            page={filters.page}
            pageSize={filters.size}
            totalElements={data?.totalElements || 0}
            totalPages={data?.totalPages || 0}
            onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
            onPageSizeChange={(size) => setFilters(prev => ({ ...prev, size, page: 0 }))}
            filtersNode={filtersNode}
            advancedFiltersNode={advancedFiltersNode}
          />
        </div>
      </div>
    </>
  )
}
