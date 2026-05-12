import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Plus, Search, Tags, Box, UtensilsCrossed, Star, CheckCircle, FilterX, Filter } from 'lucide-react'
import { CategoryFormModal } from '../components/CategoryFormModal'
import { MenuItemsTable } from '../components/MenuItemsTable'
import { MenuCategoriesTable } from '../components/MenuCategoriesTable'
import { useMenuManagement } from '../hooks/useMenuManagement'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Pagination } from '@/shared/components/ui/Pagination'

export default function MenuManagementPage() {
  const { t } = useTranslation()
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)
  const {
    state: {
      activeTab,
      keyword,
      pageSize,
      selectedCategory,
      selectedStatus,
      selectedAvailable,
      selectedStation,
      selectedFeatured,
      isCategoryDrawerOpen,
      editingCategoryId,
      isLoadingItems,
      isLoadingCategories,
      menuPage,
      categoriesPage,
      categories,
      confirmAction,
      isExecutingConfirm,
    },
    actions: {
      setActiveTab,
      setKeyword,
      setPageSize,
      setCurrentPage,
      setSelectedCategory,
      setSelectedStatus,
      setSelectedAvailable,
      setSelectedStation,
      setSelectedFeatured,
      setIsCategoryDrawerOpen,
      handleAddNew,
      handleEditItem,
      handleDeleteItem,
      handleToggleStatus,
      handleEditCategory,
      handleToggleCategoryStatus,
      handleRestoreItem,
      handleHardDeleteItem,
      handleDeleteCategory,
      handleHardDeleteCategory,
      handleConfirmExecute,
      handleCancelConfirm,
      handleResetFilters
    }
  } = useMenuManagement()

  const hasActiveFilters =
    keyword !== '' ||
    selectedCategory !== '' ||
    selectedStatus !== 'ACTIVE' ||
    selectedAvailable !== 'AVAILABLE' ||
    selectedStation !== 'ALL' ||
    selectedFeatured !== 'ALL'

  return (
    <>
      <header className="h-16 bg-white border-b border-surface-dim flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold font-display text-on-surface hidden md:block">{t('admin.menuManagement')}</h2>

          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200 shadow-inner">
            <button
              onClick={() => { setActiveTab('categories'); setKeyword(''); setCurrentPage(0); }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'categories' ? 'bg-white shadow-sm text-primary border border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 hover:shadow-sm'}`}
            >
              {t('admin.menu.tabs.categories')}
            </button>
            <button
              onClick={() => { setActiveTab('items'); setKeyword(''); setCurrentPage(0); }}
              className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'items' ? 'bg-white shadow-sm text-primary border border-slate-200/60' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 hover:shadow-sm'}`}
            >
              {t('admin.menu.tabs.items')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'items' && (
            <Link to="/admin/promotions" className="hidden lg:flex items-center gap-1 min-w-[124px] px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors font-semibold shadow-sm border border-amber-100/50">
              <span className="material-symbols-outlined text-[20px] text-amber-500">bolt</span>
              {t('admin.nav.promotions')}
            </Link>
          )}
          <Button onClick={handleAddNew} className="!px-4 !py-2 !rounded-xl !text-sm shadow-lg shadow-primary/10">
            <Plus className="w-[18px] h-[18px] mr-1" />
            <span className="hidden sm:inline">{activeTab === 'items' ? t('admin.menu.addNew') : t('admin.categories.addNew')}</span>
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0 w-full relative">
        <div className="shrink-0 px-4 md:px-6 pt-4 flex flex-col gap-4 mb-4 w-full">
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <Input
                icon={<Search className="w-[18px] h-[18px] text-on-surface/40" />}
                className="!py-2 !pl-10 !pr-4 !bg-white border !border-slate-200 !rounded-xl focus:!ring-2 focus:!ring-primary/20 focus:!border-primary !shadow-sm transition-all"
                placeholder={activeTab === 'items' ? t('admin.menu.filters.search', 'Tìm kiếm...') : t('admin.categories.filters.search', 'Tìm kiếm...')}
                type="text"
                value={keyword}
                onChange={e => {
                  setKeyword(e.target.value)
                  setCurrentPage(0)
                }}
              />
            </div>

            {activeTab === 'items' && (
              <Button
                variant="ghost"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                className={`!px-4 !py-2 !rounded-xl transition-all min-w-[110px] justify-center border-none ${hasActiveFilters ? '!bg-primary/10 !text-primary font-semibold' : '!bg-slate-100 !text-slate-600 hover:!bg-slate-200'}`}
              >
                {isFiltersExpanded ? <FilterX size={18} className="mr-2 hidden sm:block" /> : <Filter size={18} className="mr-2 hidden sm:block" />}
                {t('admin.menu.filters.filterBtn')}
                {hasActiveFilters && <span className="ml-1.5 flex h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </Button>
            )}
          </div>

          {activeTab === 'items' && isFiltersExpanded && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap items-center gap-3 w-full animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="relative col-span-2 md:col-span-1 flex-1 min-w-[150px]">
                <Select
                  value={selectedCategory}
                  onChange={(e: any) => { setSelectedCategory(e.target.value); setCurrentPage(0); }}
                  icon={<Tags className="w-[18px] h-[18px]" />}
                  className="!py-2"
                  options={[
                    { value: "", label: t('admin.menu.filters.allCategories') as string },
                    ...categories.map(c => ({ value: c.id, label: c.name }))
                  ]}
                />
              </div>

              <div className="relative flex-1 md:flex-none min-w-[140px]">
                <Select
                  value={selectedAvailable}
                  onChange={(e: any) => { setSelectedAvailable(e.target.value as any); setCurrentPage(0); }}
                  icon={<Box className="w-[18px] h-[18px]" />}
                  className="!py-2"
                  options={[
                    { value: "ALL", label: t('admin.menu.filters.allInventory') as string },
                    { value: "AVAILABLE", label: t('admin.menu.filters.available') as string },
                    { value: "UNAVAILABLE", label: t('admin.menu.filters.unavailable') as string }
                  ]}
                />
              </div>

              <div className="relative flex-1 md:flex-none min-w-[140px]">
                <Select
                  value={selectedStation}
                  onChange={(e: any) => { setSelectedStation(e.target.value); setCurrentPage(0); }}
                  icon={<UtensilsCrossed className="w-[18px] h-[18px]" />}
                  className="!py-2"
                  options={[
                    { value: "ALL", label: t('admin.menu.filters.allStations') as string },
                    { value: "HOT", label: t('admin.menu.filters.stationHot') as string },
                    { value: "COLD", label: t('admin.menu.filters.stationCold') as string },
                    { value: "DRINK", label: t('admin.menu.filters.stationDrink') as string }
                  ]}
                />
              </div>

              <div className="relative flex-1 md:flex-none min-w-[140px]">
                <Select
                  value={selectedFeatured}
                  onChange={(e: any) => { setSelectedFeatured(e.target.value as any); setCurrentPage(0); }}
                  icon={<Star className="w-[18px] h-[18px]" />}
                  className="!py-2"
                  options={[
                    { value: "ALL", label: t('admin.menu.filters.allTypes') as string },
                    { value: "FEATURED", label: t('admin.menu.filters.featured') as string },
                    { value: "NORMAL", label: t('admin.menu.filters.normal') as string }
                  ]}
                />
              </div>

              <div className="relative flex-1 md:flex-none min-w-[140px]">
                <Select
                  value={selectedStatus}
                  onChange={(e: any) => { setSelectedStatus(e.target.value as any); setCurrentPage(0); }}
                  icon={<CheckCircle className="w-[18px] h-[18px]" />}
                  className="!py-2"
                  options={[
                    { value: "ALL", label: t('admin.menu.filters.allStatuses') as string },
                    { value: "ACTIVE", label: t('admin.menu.filters.statusActive') as string },
                    { value: "INACTIVE", label: t('admin.menu.filters.statusInactive') as string }
                  ]}
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="danger"
                  onClick={handleResetFilters}
                  className="col-span-2 md:col-span-1 !px-4 !py-2 !text-sm !font-medium !text-red-600 !bg-red-50 hover:!bg-red-100 !rounded-lg border !border-red-100 whitespace-nowrap !shadow-none"
                >
                  <FilterX className="w-[18px] h-[18px] mr-1" />
                  {t('admin.menu.filters.reset')}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-h-0 px-4 md:px-8 pb-8 flex flex-col overflow-hidden w-full relative">

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden w-full">
            <div className="flex-1 overflow-auto custom-scrollbar relative">
              {activeTab === 'items' ? (
                <MenuItemsTable
                  items={menuPage?.content || []}
                  isLoading={isLoadingItems}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onRestore={handleRestoreItem}
                  onHardDelete={handleHardDeleteItem}
                  onToggleStatus={handleToggleStatus}
                  page={menuPage?.page}
                  pageSize={pageSize}
                />
              ) : (
                <MenuCategoriesTable
                  categories={categories}
                  isLoading={isLoadingCategories}
                  onEdit={handleEditCategory}
                  onToggleStatus={handleToggleCategoryStatus}
                  onDelete={handleDeleteCategory}
                  onHardDelete={handleHardDeleteCategory}
                  page={categoriesPage?.page}
                  pageSize={pageSize}
                />
              )}
            </div>

            {(() => {
              const currentPageData = activeTab === 'items' ? menuPage : categoriesPage;
              if (!currentPageData) return null;

              return (
                <Pagination
                  currentPage={currentPageData.page || 0}
                  pageSize={pageSize}
                  totalElements={currentPageData.totalElements || 0}
                  totalPages={currentPageData.totalPages || 0}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  infoKey={activeTab === 'items' ? 'admin.menu.notifications.info' : 'admin.categories.notifications.info'}
                />
              )
            })()}
          </div>
        </div>
      </div>


      <CategoryFormModal
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        categoryId={editingCategoryId}
      />

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={
          confirmAction?.type === 'DELETE_ITEM' ? t('admin.menu.table.confirmDelete', 'Xác nhận ẩn món') :
            confirmAction?.type === 'RESTORE_ITEM' ? t('admin.menu.table.confirmRestore', 'Xác nhận khôi phục món') :
              confirmAction?.type === 'HARD_DELETE_ITEM' ? t('admin.menu.table.confirmHardDelete', 'Xác nhận xóa vĩnh viễn món') :
                confirmAction?.type === 'DELETE_CATEGORY' ? t('admin.categories.table.confirmDelete', 'Xác nhận ẩn danh mục') :
                  confirmAction?.type === 'HARD_DELETE_CATEGORY' ? t('admin.categories.table.confirmHardDelete', 'Xác nhận xóa vĩnh viễn danh mục') :
                    t('admin.categories.table.confirmGeneric')
        }
        description={
          confirmAction?.type === 'RESTORE_ITEM'
            ? t('admin.menu.table.confirmRestoreDesc', 'Món này sẽ được khôi phục lại và hiển thị trên menu.')
            : confirmAction?.type === 'HARD_DELETE_ITEM'
              ? t('admin.menu.table.confirmHardDeleteDesc', 'Hành động này sẽ XÓA VĨNH VIỄN món này khỏi hệ thống và không thể hoàn tác!')
              : confirmAction?.type === 'HARD_DELETE_CATEGORY'
                ? t('admin.categories.table.confirmHardDeleteDesc', 'Hành động này sẽ XÓA VĨNH VIỄN danh mục này khỏi hệ thống và không thể hoàn tác!')
                : confirmAction?.type === 'DELETE_CATEGORY'
                  ? t('admin.categories.table.confirmDeleteDesc', 'Danh mục này sẽ bị ẩn khỏi menu bán hàng.')
                  : t('common.confirmDeleteDescription')
        }
        onConfirm={handleConfirmExecute}
        onCancel={handleCancelConfirm}
        isLoading={isExecutingConfirm}
        variant={(confirmAction?.type === 'RESTORE_ITEM') ? 'info' : 'danger'}
      />
    </>
  )
}

