import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import { Input } from '@/shared/components/ui/Input'
import { usePosReservations } from '../hooks/usePosReservations'
import { usePosTables } from '@/pages/pos/table-map/hooks/usePosTables'
import { usePosMenuItems } from '@/pages/pos/order-entry/hooks/usePosMenu'
import { IReservation } from '@/shared/types/reservation'
import { LayoutList, Map, Plus, Search, Filter, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDebounce } from '@/shared/hooks/useDebounce'

import { ReservationListView } from '../components/ReservationListView'
import { ReservationTimelineView } from '../components/ReservationTimelineView'
import { UpdateReservationModal } from '../components/UpdateReservationModal'
import { PreOrderDraftModal } from '../components/PreOrderDraftModal'
import { CreateReservationModal } from '../components/CreateReservationModal'
import { ReservationDetailModal } from '../components/ReservationDetailModal'
import { AssignTableMapModal } from '../components/AssignTableMapModal'

export default function ReservationsPage() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounce(searchQuery, 500)
  
  useEffect(() => {
    setPage(0)
  }, [selectedDate, statusFilter, debouncedSearch])

  const { 
    reservations, pageData, isLoading, 
    createMutation, updateMutation, assignTableMutation, checkInMutation, cancelMutation 
  } = usePosReservations(selectedDate, statusFilter, debouncedSearch, page, 10)

  const { data: tables } = usePosTables()
  const { data: menuItems } = usePosMenuItems()

  const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isResModalOpen, setIsResModalOpen] = useState(false) // Edit Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAssignMapModalOpen, setIsAssignMapModalOpen] = useState(false) // Map Modal

  // Pre-order Modal state
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false)
  const [draftJsonStr, setDraftJsonStr] = useState<string | null>(null)

  const leftToolbarNode = (
    <div className="flex bg-slate-200/50 p-1 rounded-xl gap-1 w-fit">
      <Button 
        variant="ghost"
        onClick={() => setViewMode('LIST')}
        className={`px-4 py-1.5 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${viewMode === 'LIST' ? 'bg-white text-primary shadow-sm hover:bg-white/90' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
      >
        <LayoutList className="w-4 h-4" /> {t('pos.reservations.view_list', 'Dạng Bảng')}
      </Button>
      <Button 
        variant="ghost"
        onClick={() => setViewMode('MAP')}
        className={`px-4 py-1.5 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${viewMode === 'MAP' ? 'bg-white text-primary shadow-sm hover:bg-white/90' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
      >
        <Map className="w-4 h-4" /> {t('pos.reservations.view_map', 'Sơ đồ')}
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      <AdminPageHeader
        title={t('pos.reservations.title', 'Đặt bàn')}
        description={t('pos.reservations.description', 'Quản lý lịch đặt bàn, xếp bàn và trạng thái phục vụ')}
        actions={
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="shadow-sm shadow-primary/10"
              variant="primary"
            >
              <Plus className="size-4" /> {t('pos.reservations.create', 'Tạo Đặt Bàn')}
            </Button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden w-full relative px-4 lg:px-6 pt-4 pb-4 md:pb-6 flex flex-col">
        {/* Top Controls Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-4 shrink-0">
          {leftToolbarNode}
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none min-w-[200px]">
              <Input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                icon={<CalendarIcon className="size-4" />}
                className="!py-2 !rounded-xl !bg-white cursor-pointer"
              />
            </div>

            <div className="relative flex-1 lg:flex-none min-w-[200px]">
              <Input 
                type="text" 
                placeholder={t('pos.reservations.search', 'Tìm theo tên, SĐT...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="size-4" />}
                className="!py-2 !rounded-xl !bg-white"
              />
            </div>

            <div className="relative flex-1 lg:flex-none min-w-[180px]">
              <Select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                icon={<Filter className="w-[18px] h-[18px]" />}
                className="!py-2 !rounded-xl !border-slate-200/60 !shadow-sm !bg-white"
                options={[
                  { value: "ALL", label: t('pos.reservations.status.ALL', 'Tất cả trạng thái') },
                  { value: "PENDING", label: t('pos.reservations.status.PENDING', 'Chờ xử lý') },
                  { value: "CONFIRMED", label: t('pos.reservations.status.CONFIRMED', 'Đã xếp bàn') },
                  { value: "COMPLETED", label: t('pos.reservations.status.COMPLETED', 'Đã hoàn thành') },
                  { value: "CANCELLED", label: t('pos.reservations.status.CANCELLED', 'Đã hủy') },
                  { value: "NO_SHOW", label: t('pos.reservations.status.NO_SHOW', 'Không đến') }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-slate-200/60 shadow-sm flex flex-col min-h-0 overflow-hidden">
        {viewMode === 'LIST' && (
          <div className="flex-1 flex flex-col min-h-0">
            <ReservationListView 
              reservations={reservations}
              isLoading={isLoading}
              onEditClick={(res) => {
                setSelectedReservation(res)
                setIsDetailModalOpen(true)
              }}
              onAssignTableClick={(res) => {
                setSelectedReservation(res)
                setIsAssignMapModalOpen(true) 
              }}
              onCheckInClick={(id) => checkInMutation.mutate(id)}
              onViewPreOrder={(json) => {
                setDraftJsonStr(json)
                setIsDraftModalOpen(true)
              }}
            />
          </div>
        )}
        
        {viewMode === 'MAP' && (
          <div className="flex-1 flex flex-col min-h-0">
            <ReservationTimelineView 
              reservations={reservations}
              isLoading={isLoading}
              onEditClick={(res) => {
                setSelectedReservation(res)
                setIsDetailModalOpen(true)
              }}
              onAssignTableClick={(res) => {
                setSelectedReservation(res)
                setIsAssignMapModalOpen(true) 
              }}
              onCheckInClick={(id) => checkInMutation.mutate(id)}
              onViewPreOrder={(json) => {
                setDraftJsonStr(json)
                setIsDraftModalOpen(true)
              }}
            />
          </div>
        )}

        {/* Pagination Controls (DRY) */}
        {pageData && pageData.totalPages > 1 && (
          <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-500 font-medium">
              {t('pos.reservations.page_info', 'Trang {{page}} / {{total}} (Tổng {{count}})', { 
                page: pageData.page + 1, 
                total: pageData.totalPages, 
                count: pageData.totalElements 
              })}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="p-1.5 h-auto text-slate-500"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button 
                variant="outline"
                size="icon"
                disabled={pageData.last}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 h-auto text-slate-500"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>

      <CreateReservationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isSubmitting={createMutation.isPending}
        onSubmit={(data) => createMutation.mutate(data, { onSuccess: () => setIsCreateModalOpen(false) })}
      />

      <ReservationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        reservation={selectedReservation}
        isUpdating={cancelMutation.isPending}
        onEditClick={(res) => {
          setSelectedReservation(res)
          setIsResModalOpen(true)
        }}
        onUpdateStatus={(id, status, reason, refundStatus) => {
          cancelMutation.mutate({ id, data: { status, reason, refundStatus } }, { onSuccess: () => setIsDetailModalOpen(false) })
        }}
      />

      <UpdateReservationModal
        isOpen={isResModalOpen}
        onClose={() => setIsResModalOpen(false)}
        reservation={selectedReservation}
        isSubmitting={updateMutation.isPending || cancelMutation.isPending}
        onSave={(id, data) => updateMutation.mutate({ id, data }, { onSuccess: () => setIsResModalOpen(false) })}
        onCancelRes={(id) => cancelMutation.mutate({ id, data: { status: 'CANCELLED' } }, { onSuccess: () => setIsResModalOpen(false) })}
      />

      <AssignTableMapModal
        isOpen={isAssignMapModalOpen}
        onClose={() => setIsAssignMapModalOpen(false)}
        reservation={selectedReservation}
        tables={tables || []}
        activeReservations={reservations.filter(r => r.status === 'PENDING' || r.status === 'CONFIRMED')}
        isSubmitting={assignTableMutation.isPending}
        onAssignSubmit={(resId, tableIds) => {
          assignTableMutation.mutate({ id: resId, data: { tableIds } }, {
            onSuccess: () => setIsAssignMapModalOpen(false)
          })
        }}
      />

      <PreOrderDraftModal 
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        draftJson={draftJsonStr}
        menuItems={menuItems || []}
      />
    </div>
  )
}
