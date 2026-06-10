import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Tags, Box, UtensilsCrossed, Star, CheckCircle, FilterX, Filter, Package, FolderTree, Plus, Percent } from 'lucide-react'
import { CategoryFormModal } from '../components/CategoryFormModal'
import { MenuItemsTable } from '../components/MenuItemsTable'
import { MenuCategoriesTable } from '../components/MenuCategoriesTable'
import { useMenuManagement } from '../hooks/useMenuManagement'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader'
import { ExportButton } from '@/shared/components/ExportButton'

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

  const filtersNode = (
    <Button
      variant="ghost"
      onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
      className={`!px-4 !py-2 !rounded-xl transition-all min-w-[110px] justify-center border-none ${hasActiveFilters ? '!bg-primary/10 !text-primary font-semibold' : '!bg-slate-100 !text-slate-600 hover:!bg-slate-200'}`}
    >
      {isFiltersExpanded ? <FilterX size={18} className="mr-2 hidden sm:block" /> : <Filter size={18} className="mr-2 hidden sm:block" />}
      {t('admin.menu.filters.filterBtn')}
      {hasActiveFilters && <span className="ml-1.5 flex h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </Button>
  )

  const advancedFiltersNode = isFiltersExpanded ? (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:flex lg:flex-wrap items-center gap-3 w-full">
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
  ) : null

  const leftToolbarNode = (
    <div className="flex bg-slate-100/80 p-1 rounded-xl">
      <button
        onClick={() => { setActiveTab('categories'); setKeyword(''); setCurrentPage(0); }}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
          activeTab === 'categories' 
            ? 'bg-white text-primary shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <FolderTree className="w-4 h-4" />
        {t('admin.menu.tabs.categories')}
      </button>
      <button
        onClick={() => { setActiveTab('items'); setKeyword(''); setCurrentPage(0); }}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
          activeTab === 'items' 
            ? 'bg-white text-primary shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Package className="w-4 h-4" />
        {t('admin.menu.tabs.items')}
      </button>
    </div>
  )

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden bg-[#F8F9FD]">
        <AdminPageHeader
          title={t('admin.menu.title', 'Quản lý Thực đơn')}
          description={t('admin.menu.description', 'Quản lý danh sách món ăn, danh mục và các thiết lập liên quan')}
          actions={
            <div className="flex items-center gap-2">
              {activeTab === 'items' && (
                <Link
                  to="/admin/promotions"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 hover:from-amber-100 hover:to-orange-100 rounded-lg transition-all duration-300 font-bold border border-amber-200/60 text-xs shadow-[0_2px_8px_-3px_rgba(245,158,11,0.2)] hover:shadow-md hover:scale-[1.02]"
                >
                  <Percent size={13} className="text-amber-600 animate-pulse" />
                  {t('admin.nav.promotions', 'Khuyến mãi')}
                </Link>
              )}
              {activeTab === 'items' ? (
                <ExportButton
                  data={(menuPage?.content || []).map(item => ({
                    ...item,
                    costPrice: item.basePrice * 0.35,
                    profitMarginValue: item.basePrice * 0.65,
                    profitMarginPercent: 65,
                    statusLabel: item.isActive ? t('admin.menu.filters.statusActive', { defaultValue: 'Đang hoạt động' }) : t('admin.menu.filters.statusInactive', { defaultValue: 'Ngừng hoạt động' }),
                    stationLabel: item.station ? t(`admin.menu.filters.station${item.station.toUpperCase()}`, { defaultValue: item.station }) : '-',
                    availableLabel: item.isAvailable ? t('common.yes', { defaultValue: 'Có' }) : t('common.no', { defaultValue: 'Không' })
                  }))}
                  fileName={t('admin.menu.exportItemsFileName', 'Danh_sach_thuc_don')}
                  sheetName="ThucDon"
                  headers={{
                    'name': t('admin.menu.table.colName', 'Tên món'),
                    'basePrice': t('admin.menu.table.colPrice', 'Giá bán'),
                    'costPrice': t('admin.menu.table.colCostPrice', 'Giá vốn (COGS 35%)'),
                    'profitMarginValue': t('admin.menu.table.colProfitValue', 'Lợi nhuận gộp'),
                    'profitMarginPercent': t('admin.menu.table.colProfitPercent', 'Tỷ suất lợi nhuận (%)'),
                    'categoryName': t('admin.menu.table.colCategory', 'Danh mục'),
                    'stationLabel': t('admin.menu.table.colStation', 'Khu vực chế biến'),
                    'availableLabel': t('admin.menu.table.colAvailable', 'Sẵn sàng phục vụ'),
                    'statusLabel': t('admin.menu.table.colStatus', 'Trạng thái'),
                    'description': t('admin.menu.table.colDescription', 'Mô tả')
                  }}
                />
              ) : (
                <ExportButton
                  data={categories.map(c => ({
                    ...c,
                    statusLabel: c.isActive ? t('admin.menu.filters.statusActive', 'Đang hoạt động') : t('admin.menu.filters.statusInactive', 'Ngừng hoạt động')
                  }))}
                  fileName={t('admin.menu.exportCategoriesFileName', 'Danh_muc_thuc_don')}
                  sheetName="DanhMuc"
                  headers={{
                    'name': t('admin.menu.table.colCategoryName', 'Tên danh mục'),
                    'statusLabel': t('admin.menu.table.colStatus', 'Trạng thái'),
                    'itemCount': t('admin.menu.table.colItemCount', 'Số lượng món ăn')
                  }}
                />
              )}
              <Button onClick={handleAddNew} className="shadow-sm shadow-primary/10">
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">
                  {activeTab === 'items' ? t('admin.menu.addNew', 'Thêm món ăn') : t('admin.categories.addNew', 'Thêm danh mục')}
                </span>
              </Button>
            </div>
          }
        />
        <div className="flex-1 min-h-0 overflow-hidden w-full relative px-4 lg:px-6 pt-4 pb-4 md:pb-6">
          {activeTab === 'items' ? (
            <MenuItemsTable
              items={menuPage?.content || []}
              isLoading={isLoadingItems}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onRestore={handleRestoreItem}
              onHardDelete={handleHardDeleteItem}
              onToggleStatus={handleToggleStatus}
              keyword={keyword}
              onSearchChange={(v) => { setKeyword(v); setCurrentPage(0); }}
              page={menuPage?.page}
              pageSize={pageSize}
              totalElements={menuPage?.totalElements || 0}
              onPageChange={setCurrentPage}
              onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(0); }}
              filtersNode={filtersNode}
              advancedFiltersNode={advancedFiltersNode}
              leftToolbarNode={leftToolbarNode}
            />
          ) : (
            <MenuCategoriesTable
              categories={categories}
              isLoading={isLoadingCategories}
              onEdit={handleEditCategory}
              onToggleStatus={handleToggleCategoryStatus}
              onDelete={handleDeleteCategory}
              onHardDelete={handleHardDeleteCategory}
              keyword={keyword}
              onSearchChange={(v) => { setKeyword(v); setCurrentPage(0); }}
              page={categoriesPage?.page}
              pageSize={pageSize}
              totalElements={categoriesPage?.totalElements || 0}
              onPageChange={setCurrentPage}
              onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(0); }}
              leftToolbarNode={leftToolbarNode}
            />
          )}
        </div>
      </div>

      <CategoryFormModal
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        categoryId={editingCategoryId}
      />

      <ConfirmDialog
        isOpen={confirmAction !== null}
        title={
          confirmAction?.type === 'DELETE_ITEM' ? t('admin.menu.table.confirmDeleteTitle', 'Xác nhận lưu trữ món') :
            confirmAction?.type === 'RESTORE_ITEM' ? t('admin.menu.table.confirmRestoreTitle', 'Xác nhận khôi phục món') :
              confirmAction?.type === 'HARD_DELETE_ITEM' ? t('admin.menu.table.confirmHardDeleteTitle', 'Xác nhận xóa vĩnh viễn món') :
                confirmAction?.type === 'DELETE_CATEGORY' ? t('admin.categories.table.confirmDeleteTitle', 'Xác nhận lưu trữ danh mục') :
                  confirmAction?.type === 'HARD_DELETE_CATEGORY' ? t('admin.categories.table.confirmHardDeleteTitle', 'Xác nhận xóa vĩnh viễn danh mục') :
                    t('admin.categories.table.confirmGenericTitle', 'Xác nhận thao tác')
        }
        description={
          confirmAction?.type === 'RESTORE_ITEM'
            ? t('admin.menu.table.confirmRestoreDesc', 'Món này sẽ được khôi phục lại và hiển thị trên menu.')
            : confirmAction?.type === 'HARD_DELETE_ITEM'
              ? t('admin.menu.table.confirmHardDeleteDesc', 'Hành động này sẽ XÓA VĨNH VIỄN món này khỏi hệ thống và không thể hoàn tác!')
              : confirmAction?.type === 'HARD_DELETE_CATEGORY'
                ? t('admin.categories.table.confirmHardDeleteDesc', 'Hành động này sẽ XÓA VĨNH VIỄN danh mục này khỏi hệ thống và không thể hoàn tác!')
                : confirmAction?.type === 'DELETE_CATEGORY'
                  ? t('admin.categories.table.confirmDeleteDesc', 'Danh mục này sẽ bị lưu trữ khỏi menu bán hàng.')
                  : confirmAction?.type === 'DELETE_ITEM'
                    ? t('admin.menu.table.confirmDeleteDesc', 'Món này sẽ bị lưu trữ khỏi menu bán hàng.')
                    : t('common.confirmDeleteDescription', 'Bạn có chắc chắn muốn thực hiện thao tác này?')
        }
        onConfirm={handleConfirmExecute}
        onCancel={handleCancelConfirm}
        isLoading={isExecutingConfirm}
        variant={(confirmAction?.type === 'RESTORE_ITEM') ? 'info' : 'danger'}
      />
    </>
  )
}

