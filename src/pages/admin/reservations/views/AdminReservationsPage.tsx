import { useTranslation } from 'react-i18next'
import React, { useState, useEffect, useMemo } from 'react'
import { useAdminReservationsList, useAdminUpdateReservationStatus } from '../hooks/useAdminReservations'
import { AdminReservationsTable } from '../components/AdminReservationsTable'
import { AdminRefundsTable } from '../components/AdminRefundsTable'
import { ReservationDetailModal } from '@/pages/pos/reservations/components/ReservationDetailModal'
import { Filter, FilterX, CalendarDays, Banknote, Wallet, Clock, Undo2, Coins } from 'lucide-react'
import { IReservation } from '@/shared/types/reservation'
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import { StatCard } from '@/pages/admin/reports/components/StatCard'

export default function AdminReservationsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'ALL' | 'REFUNDS'>('ALL')
  const [refundStatusFilter, setRefundStatusFilter] = useState<string>('ALL')

  const [filters, setFilters] = useState({
    page: 0,
    size: 20,
    status: '',
    phone: '',
    startDate: '',
    endDate: ''
  })
  
  const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // When activeTab is REFUNDS, we fetch both CANCELLED and NO_SHOW reservations
  const apiStatus = activeTab === 'REFUNDS' ? 'CANCELLED,NO_SHOW' : filters.status

  const { data, isLoading } = useAdminReservationsList(
    filters.startDate,
    filters.endDate,
    apiStatus,
    filters.phone,
    filters.page,
    filters.size,
    activeTab === 'REFUNDS' ? true : undefined,
    activeTab === 'REFUNDS' ? refundStatusFilter : undefined
  )

  // Fetch all cancelled/no-show reservations for the selected date range to calculate absolute totals for refund stats
  const { data: allRefundReservationsData, isLoading: isStatsLoading } = useAdminReservationsList(
    filters.startDate,
    filters.endDate,
    'CANCELLED,NO_SHOW',
    undefined,
    0,
    1000,
    true
  )

  const refundStats = useMemo(() => {
    const refundReservations = allRefundReservationsData?.content || []
    let totalDeposits = 0
    let pendingRefund = 0
    let refunded = 0
    let forfeited = 0

    refundReservations.forEach((res) => {
      const deposit = res.depositAmount ?? 0
      if (deposit > 0) {
        totalDeposits += deposit
        if (res.refundStatus === 'PENDING_REFUND') {
          pendingRefund += deposit
        } else if (res.refundStatus === 'REFUNDED') {
          refunded += deposit
        } else if (res.refundStatus === 'NOT_REQUIRED') {
          forfeited += deposit
        }
      }
    })

    return {
      totalDeposits,
      pendingRefund,
      refunded,
      forfeited
    }
  }, [allRefundReservationsData])

  const { mutate: updateStatus, isPending: isUpdating } = useAdminUpdateReservationStatus()

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  // Reset page on tab switch
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 0 }))
    setRefundStatusFilter('ALL')
  }, [activeTab])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }))
  }

  const hasActiveFilters = activeTab === 'ALL' 
    ? (filters.status !== '' || filters.phone !== '' || !!filters.startDate || !!filters.endDate)
    : (refundStatusFilter !== 'ALL' || filters.phone !== '' || !!filters.startDate || !!filters.endDate)

  const filteredReservations = data?.content || []

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
      {activeTab === 'ALL' ? (
        <div className="w-full md:w-[180px] shrink-0">
          <Select
            value={filters.status || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('status', e.target.value)}
            options={[
              { value: '', label: t('admin.reservations.status.all', 'Tất cả trạng thái') },
              { value: 'PENDING', label: t('admin.reservations.status.pending', 'Chờ xác nhận') },
              { value: 'CONFIRMED', label: t('admin.reservations.status.confirmed', 'Đã xác nhận (Có cọc)') },
              { value: 'COMPLETED', label: t('admin.reservations.status.completed', 'Đã đến') },
              { value: 'CANCELLED', label: t('admin.reservations.status.cancelled', 'Đã hủy') },
              { value: 'NO_SHOW', label: t('admin.reservations.status.noShow', 'Không đến') },
            ]}
            className="!py-2"
            icon={<Filter className="w-4 h-4 text-slate-400" />}
          />
        </div>
      ) : (
        <div className="w-full md:w-[180px] shrink-0">
          <Select
            value={refundStatusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRefundStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: t('admin.reservations.status.all', 'Tất cả trạng thái') },
              { value: 'PENDING_REFUND', label: t('pos.reservations.refund.pending', 'Chờ hoàn tiền') },
              { value: 'REFUNDED', label: t('pos.reservations.refund.refunded', 'Đã hoàn tiền') },
              { value: 'NOT_REQUIRED', label: t('pos.reservations.refund.none', 'Không hoàn tiền') }
            ]}
            className="!py-2"
            icon={<Filter className="w-4 h-4 text-slate-400" />}
          />
        </div>
      )}
      <div className="w-full md:w-[180px] shrink-0">
        <input 
          type="date"
          className="w-full h-[38px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm cursor-pointer hover:border-slate-300"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          title={t('admin.reservations.filter.startDate', 'Từ ngày')}
        />
      </div>
      <div className="w-full md:w-[180px] shrink-0">
        <input 
          type="date"
          className="w-full h-[38px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm cursor-pointer hover:border-slate-300"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          title={t('admin.reservations.filter.endDate', 'Đến ngày')}
          min={filters.startDate || undefined}
        />
      </div>
      {hasActiveFilters && (
        <Button
          variant="danger"
          onClick={() => {
            setFilters(prev => ({...prev, status: '', phone: '', startDate: '', endDate: '', page: 0}))
            setRefundStatusFilter('ALL')
          }}
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
          title={t('admin.reservations.title', 'Quản lý Đặt bàn')}
          description={t('admin.reservations.description', 'Theo dõi và quản lý danh sách khách đặt bàn')}
        />

        <div className="flex-1 min-h-0 flex flex-col px-4 lg:px-6 pt-4 pb-4 md:pb-6">
          {/* Tab Selection Navigation */}
          <div className="flex border-b border-slate-200 mb-5 shrink-0 gap-6">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'ALL' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <CalendarDays size={18} />
              {t('admin.reservations.tabs.all', 'Tất cả đặt bàn')}
            </button>
            <button
              onClick={() => setActiveTab('REFUNDS')}
              className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${activeTab === 'REFUNDS' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <Banknote size={18} />
              {t('admin.reservations.tabs.refunds', 'Đối soát hoàn cọc')}
            </button>
          </div>

          {/* Refund Stats Cards Section */}
          {activeTab === 'REFUNDS' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-in fade-in-50 duration-300 shrink-0">
              <StatCard
                title={t('admin.reservations.stats.totalDeposits', 'Tổng tiền cọc đã nhận')}
                value={`${refundStats.totalDeposits.toLocaleString()} ₫`}
                icon={Wallet}
                color="primary"
                isLoading={isStatsLoading}
              />
              <StatCard
                title={t('admin.reservations.stats.pendingRefund', 'Chờ xử lý hoàn')}
                value={`${refundStats.pendingRefund.toLocaleString()} ₫`}
                icon={Clock}
                color="amber"
                isLoading={isStatsLoading}
              />
              <StatCard
                title={t('admin.reservations.stats.refunded', 'Đã hoàn trả khách')}
                value={`${refundStats.refunded.toLocaleString()} ₫`}
                icon={Undo2}
                color="emerald"
                isLoading={isStatsLoading}
              />
              <StatCard
                title={t('admin.reservations.stats.forfeited', 'Tiền phạt thu giữ')}
                value={`${refundStats.forfeited.toLocaleString()} ₫`}
                icon={Coins}
                color="rose"
                isLoading={isStatsLoading}
              />
            </div>
          )}

          {activeTab === 'ALL' ? (
            <AdminReservationsTable
              reservations={filteredReservations}
              isLoading={isLoading}
              isUpdating={isUpdating}
              onUpdateStatus={(id, status) => updateStatus({ id, status })}
              onViewDetail={(res) => {
                setSelectedReservation(res)
                setIsModalOpen(true)
              }}
              keyword={filters.phone}
              onSearchChange={(value) => handleFilterChange('phone', value)}
              page={filters.page}
              pageSize={filters.size}
              totalElements={data?.totalElements || 0}
              totalPages={data?.totalPages || 0}
              onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              onPageSizeChange={(size) => setFilters(prev => ({ ...prev, size, page: 0 }))}
              filtersNode={filtersNode}
              advancedFiltersNode={advancedFiltersNode}
            />
          ) : (
            <AdminRefundsTable
              reservations={filteredReservations}
              isLoading={isLoading}
              isUpdating={isUpdating}
              onUpdateRefundStatus={(id, refundStatus) => {
                const res = filteredReservations.find(r => r.id === id)
                updateStatus({ id, status: res ? res.status : 'CANCELLED', refundStatus })
              }}
              onViewDetail={(res) => {
                setSelectedReservation(res)
                setIsModalOpen(true)
              }}
              keyword={filters.phone}
              onSearchChange={(value) => handleFilterChange('phone', value)}
              page={filters.page}
              pageSize={filters.size}
              totalElements={data?.totalElements || 0}
              totalPages={data?.totalPages || 0}
              onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              onPageSizeChange={(size) => setFilters(prev => ({ ...prev, size, page: 0 }))}
              filtersNode={filtersNode}
            />
          )}
        </div>
      </div>

      <ReservationDetailModal
        reservation={selectedReservation}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setTimeout(() => setSelectedReservation(null), 300)
        }}
        onUpdateStatus={(id, status, reason, refundStatus) => updateStatus({ id, status, reason, refundStatus })}
        onEditClick={() => {}}
        isUpdating={isUpdating}
        hideEditButton={true}
      />
    </>
  )
}
