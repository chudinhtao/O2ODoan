import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search, Filter, FilterX, Zap } from 'lucide-react'
import {
  usePromotions,
  useDeletePromotion,
  useHardDeletePromotion,
  useTogglePromotionStatus,
} from '../hooks/usePromotions'
import { usePromotionFilters } from '../hooks/usePromotionFilters'
import { PromotionsTable } from '../components/PromotionsTable'
import { PromotionFormModal } from '../components/PromotionFormModal'
import { FlashSaleFormModal } from '../components/FlashSaleFormModal'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Pagination } from '@/shared/components/ui/Pagination'
import { IPromotion } from '../types/adminPromotion.type'
import { FlashSaleTracking } from '../components/FlashSaleTracking'

export default function PromotionManagementPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'vouchers' | 'flash_sale'>('vouchers')
  const { data: pageData, isLoading } = usePromotions({ page: 0, size: 100, keyword: '' })

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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [flashSaleDrawerOpen, setFlashSaleDrawerOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<IPromotion | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string; mode: 'soft' | 'hard' }>({
    isOpen: false,
    id: '',
    name: '',
    mode: 'soft'
  })

  const openCreateDrawer = () => {
    setEditingPromo(null)
    setDrawerOpen(true)
  }

  const openEditDrawer = (promo: IPromotion) => {
    setEditingPromo(promo)
    setDrawerOpen(true)
  }

  return (
    <>
      <header className="h-16 bg-white border-b border-surface-dim flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold font-display text-on-surface hidden md:block">
            {t('admin.promotion.title')}
          </h2>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Button
              variant="ghost"
              onClick={() => setActiveTab('vouchers')}
              className={`!px-4 !py-1.5 !text-sm !font-semibold !rounded-lg !transition-all border-none ${activeTab === 'vouchers' ? '!bg-white !shadow-sm !text-primary' : '!text-slate-500 hover:!text-slate-700 hover:!bg-slate-200/50'}`}
            >
              {t('admin.promotion.tabs.vouchers')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab('flash_sale')}
              className={`!px-4 !py-1.5 !text-sm !font-semibold !rounded-lg !transition-all border-none ${activeTab === 'flash_sale' ? '!bg-white !shadow-sm !text-primary' : '!text-slate-500 hover:!text-slate-700 hover:!bg-slate-200/50'}`}
            >
              {t('admin.promotion.tabs.flashSales')}
            </Button>
          </div>
        </div>

        {activeTab === 'flash_sale' && (
          <Button onClick={() => setFlashSaleDrawerOpen(true)} className="!px-4 !py-2 !rounded-xl !text-sm !bg-tertiary hover:opacity-90 text-on-tertiary border-none">
            <Zap className="w-[18px] h-[18px] mr-1" />
            <span className="hidden sm:inline">{t('admin.promotion.tabs.createFlashSale')}</span>
          </Button>
        )}
        {activeTab === 'vouchers' && (
          <Button onClick={openCreateDrawer} className="!px-4 !py-2 !rounded-xl !text-sm">
            <Plus className="w-[18px] h-[18px] mr-1" />
            <span className="hidden sm:inline">{t('admin.promotion.addNew')}</span>
          </Button>
        )}
      </header>

      <div className="flex-1 flex flex-col min-h-0 w-full relative">
        {activeTab === 'vouchers' ? (
          <>
            <div className="shrink-0 px-4 md:px-6 pt-4 flex flex-col gap-4 mb-4 w-full">
              <div className="flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <Input
                    value={filters.search}
                    onChange={(e) => actions.handleSearchChange(e.target.value)}
                    placeholder={t('admin.promotion.searchPlaceholder', 'Tìm mã khuyến mãi...')}
                    className="!py-2 !pl-10 !pr-4 !bg-surface-bright border !border-outline-variant !rounded-xl focus:!ring-2 focus:!ring-primary/20 focus:!border-primary !shadow-sm transition-all"
                    icon={<Search className="w-[18px] h-[18px] text-on-surface-variant/70" />}
                  />
                </div>

                <Button
                  variant="ghost"
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className={`!px-4 !py-2 !rounded-xl transition-all min-w-[110px] justify-center border-none ${hasActiveFilters ? '!bg-primary/10 !text-primary font-semibold' : '!bg-surface-container !text-on-surface-variant hover:!bg-surface-dim'}`}
                >
                  {isFiltersExpanded ? <FilterX size={18} className="mr-2 hidden sm:block" /> : <Filter size={18} className="mr-2 hidden sm:block" />}
                  {t('admin.promotion.filters.filterBtn', 'Bộ lọc')}
                  {hasActiveFilters && <span className="ml-1.5 flex h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </Button>
              </div>

              {isFiltersExpanded && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap items-center gap-3 w-full animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="relative col-span-2 md:col-span-1 flex-1 min-w-[150px]">
                    <Select
                      value={filters.selectedStatus}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => actions.handleStatusChange(e.target.value)}
                      className="!py-2"
                      options={[
                        { value: "ALL", label: t('admin.promotion.filters.allStatus', 'Tất cả trạng thái') as string },
                        { value: "ACTIVE", label: t('admin.promotion.filters.statusActive', 'Đang hoạt động') as string },
                        { value: "INACTIVE", label: t('admin.promotion.filters.statusPaused', 'Tạm dừng / Đã ẩn') as string }
                      ]}
                    />
                  </div>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={actions.handleResetFilters}
                      className="col-span-2 md:col-span-1 !px-4 !py-2 !text-sm !font-medium !text-error !bg-error-container hover:brightness-95 !rounded-lg border !border-error-container whitespace-nowrap !shadow-none"
                    >
                      <FilterX className="w-[18px] h-[18px] mr-1" />
                      {t('admin.promotion.filters.reset', 'Bỏ lọc')}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0 px-4 md:px-6 pb-6 flex flex-col overflow-hidden w-full">
              <div className="bg-surface-bright rounded-xl shadow-sm border border-outline-variant flex flex-col h-full overflow-hidden w-full">
                <div className="flex-1 overflow-auto custom-scrollbar relative">
                  <PromotionsTable
                    data={paginatedData}
                    isLoading={isLoading}
                    startIndex={filters.currentPage * filters.pageSize}
                    onEdit={openEditDrawer}
                    onDelete={(id, name) => setDeleteDialog({ isOpen: true, id, name, mode: 'soft' })}
                    onRestore={(id) => toggleMutation.mutate(id)}
                    onHardDelete={(id, name) => setDeleteDialog({ isOpen: true, id, name, mode: 'hard' })}
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
          </>
        ) : (
          <FlashSaleTracking />
        )}
      </div>

      <PromotionFormModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingPromo={editingPromo}
      />

      <FlashSaleFormModal
        isOpen={flashSaleDrawerOpen}
        onClose={() => setFlashSaleDrawerOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.mode === 'soft' ? t('admin.promotion.deleteTitle', 'Tạm dừng Khuyến mãi') : t('admin.promotion.hardDeleteTitle', 'Xóa vĩnh viễn Khuyến mãi')}
        description={deleteDialog.mode === 'soft'
          ? t('admin.promotion.deleteDesc', 'Bạn có chắc chắn muốn tạm dừng "{{name}}"?', { name: deleteDialog.name })
          : t('admin.promotion.hardDeleteDesc', 'Hành động này sẽ XÓA VĨNH VIỄN "{{name}}" khỏi hệ thống và không thể hoàn tác!', { name: deleteDialog.name })
        }
        onConfirm={() => {
          if (deleteDialog.mode === 'soft') {
            deleteMutation.mutate(deleteDialog.id, {
              onSuccess: () => setDeleteDialog({ isOpen: false, id: '', name: '', mode: 'soft' })
            })
          } else {
            hardDeleteMutation.mutate(deleteDialog.id, {
              onSuccess: () => setDeleteDialog({ isOpen: false, id: '', name: '', mode: 'soft' })
            })
          }
        }}
        onCancel={() => setDeleteDialog({ isOpen: false, id: '', name: '', mode: 'soft' })}
        isLoading={deleteMutation.isPending || hardDeleteMutation.isPending}
      />
    </>
  )
}
