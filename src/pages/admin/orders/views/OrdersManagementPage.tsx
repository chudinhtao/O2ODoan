import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useOrders } from '../hooks/useOrders'
import { OrderFiltersParams } from '../types/order.type'
import { OrdersTable } from '../components/OrdersTable'
import { OrderFilters } from '../components/OrderFilters'
import { OrderDetailModal } from '../components/OrderDetailModal'
import { RefreshCw } from 'lucide-react'
// import { Select } from '@/shared/components/ui/Select'
import { Pagination } from '@/shared/components/ui/Pagination'

export default function OrdersManagementPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<OrderFiltersParams>({
    page: 0,
    size: 20,
    status: '',
    source: '',
    search: ''
  })
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const { data, isLoading, refetch, isFetching } = useOrders(filters)

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  return (
    <>
      <header className="h-16 bg-white border-b border-surface-dim flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold font-display text-on-surface">
            {t('admin.orders.title')}
          </h2>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors font-medium text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{t('common.refresh')}</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col min-h-0 w-full relative">
        <div className="shrink-0 px-4 md:px-6 pt-4 flex flex-col gap-4 mb-4 w-full">
          <OrderFilters
            filters={{
              status: filters.status || '',
              source: filters.source || '',
              search: filters.search || ''
            }}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="flex-1 min-h-0 px-4 md:px-8 pb-8 flex flex-col overflow-hidden w-full">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden w-full">
            <OrdersTable
              orders={data?.content || []}
              isLoading={isLoading}
              onViewDetail={setSelectedOrderId}
            />

            <Pagination
              currentPage={filters.page}
              pageSize={filters.size}
              totalElements={data?.totalElements || 0}
              totalPages={data?.totalPages || 0}
              onPageChange={handlePageChange}
              onPageSizeChange={(size) => {
                setFilters(prev => ({ ...prev, size, page: 0 }));
              }}
            />
          </div>
        </div>
      </div>

      <OrderDetailModal
        orderId={selectedOrderId}
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </>
  )
}
