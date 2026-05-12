import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, FilterX } from 'lucide-react'
import {
  usePromotions,
  useDeletePromotion,
  useHardDeletePromotion,
  useTogglePromotionStatus,
} from '../hooks/usePromotions'
import { usePromotionFilters } from '../hooks/usePromotionFilters'
import { PromotionsTable } from '../components/PromotionsTable'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Pagination } from '@/shared/components/ui/Pagination'
import type { IPromotion } from '../types/adminPromotion.type'
import { ROUTES } from '@/shared/constants/ROUTES'

export default function PromotionManagementPage() {
  const navigate = useNavigate()
  const { data: pageData, isLoading } = usePromotions({ page: 0, size: 200, keyword: '' })

  const {
    filters,
    isFiltersExpanded,
    setIsFiltersExpanded,
    hasActiveFilters,
    filteredData,
    paginatedData,
    totalPages,
    actions
  } = usePromotionFilters(pageData?.content || [])

  const deleteMutation = useDeletePromotion()
  const hardDeleteMutation = useHardDeletePromotion()
  const toggleMutation = useTogglePromotionStatus()

  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false, id: '', name: ''
  })
  const [hardDeleteDialog, setHardDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false, id: '', name: ''
  })

  const handleCreate = () => navigate(ROUTES.admin.promotionCreate)
  const handleEdit = (promo: IPromotion) => navigate(ROUTES.admin.promotionEdit.replace(':id', promo.id))

  return (
    <>
      {/* Header */}
      <header className="h-16 bg-white border-b border-surface-dim flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold font-display text-on-surface hidden md:block">
            🎁 Quản lý Khuyến mãi
          </h2>
          <div className="text-sm text-slate-400 hidden lg:block">
            {filteredData.length} chương trình
          </div>
        </div>

        <Button onClick={handleCreate} className="!px-4 !py-2 !rounded-xl !text-sm gap-1.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tạo mới</span>
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        {/* Toolbar */}
        <div className="shrink-0 px-4 md:px-6 pt-4 flex flex-col gap-3 mb-4 w-full">
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Input
                value={filters.search}
                onChange={(e) => actions.handleSearchChange(e.target.value)}
                placeholder="Tìm theo tên hoặc mã coupon..."
                className="!py-2 !pl-10 !pr-4 !rounded-xl !shadow-sm"
                icon={<Search className="w-4 h-4 text-slate-400" />}
              />
            </div>
            <Button
              variant="ghost"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={`!px-4 !py-2 !rounded-xl min-w-[100px] border-none ${
                hasActiveFilters ? '!bg-primary/10 !text-primary' : '!bg-slate-100 !text-slate-600'
              }`}
            >
              {isFiltersExpanded ? <FilterX size={16} className="mr-1.5" /> : <Filter size={16} className="mr-1.5" />}
              Bộ lọc
              {hasActiveFilters && <span className="ml-1.5 w-2 h-2 rounded-full bg-primary inline-block" />}
            </Button>
          </div>

          {isFiltersExpanded && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <Select
                value={filters.selectedStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => actions.handleStatusChange(e.target.value)}
                className="!py-2 min-w-[180px]"
                options={[
                  { value: 'ALL', label: 'Tất cả trạng thái' },
                  { value: 'ACTIVE', label: 'Đang hoạt động' },
                  { value: 'INACTIVE', label: 'Tạm dừng' },
                ]}
              />
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={actions.handleResetFilters}
                  className="!px-3 !py-2 !text-sm !text-rose-500 !bg-rose-50 hover:!bg-rose-100 !rounded-lg border-none"
                >
                  <FilterX className="w-4 h-4 mr-1" />
                  Bỏ lọc
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="flex-1 min-h-0 px-4 md:px-6 pb-6 flex flex-col overflow-hidden w-full">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto">
              <PromotionsTable
                data={paginatedData}
                isLoading={isLoading}
                startIndex={filters.currentPage * filters.pageSize}
                onEdit={handleEdit}
                onDelete={(id, name) => setDeleteDialog({ isOpen: true, id, name })}
                onHardDelete={(id, name) => setHardDeleteDialog({ isOpen: true, id, name })}
                onToggle={(id) => toggleMutation.mutate(id)}
              />
            </div>
            <Pagination
              currentPage={filters.currentPage}
              pageSize={filters.pageSize}
              totalElements={filteredData.length}
              totalPages={totalPages}
              onPageChange={actions.handlePageChange}
              onPageSizeChange={actions.handlePageSizeChange}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Tạm dừng khuyến mãi"
        description={`Bạn có chắc muốn tạm dừng / xóa mềm "${deleteDialog.name}"? Bạn có thể kích hoạt lại sau.`}
        onConfirm={() => {
          deleteMutation.mutate(deleteDialog.id, {
            onSuccess: () => setDeleteDialog({ isOpen: false, id: '', name: '' })
          })
        }}
        onCancel={() => setDeleteDialog({ isOpen: false, id: '', name: '' })}
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        isOpen={hardDeleteDialog.isOpen}
        title="Xóa vĩnh viễn khuyến mãi"
        description={`Bạn có chắc muốn xóa vĩnh viễn "${hardDeleteDialog.name}"? Hành động này không thể hoàn tác và sẽ xóa hoàn toàn khỏi cơ sở dữ liệu.`}
        onConfirm={() => {
          hardDeleteMutation.mutate(hardDeleteDialog.id, {
            onSuccess: () => setHardDeleteDialog({ isOpen: false, id: '', name: '' })
          })
        }}
        onCancel={() => setHardDeleteDialog({ isOpen: false, id: '', name: '' })}
        isLoading={hardDeleteMutation.isPending}
      />
    </>
  )
}
