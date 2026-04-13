import { useState } from 'react'
import { useAdminMenuItems, useAdminCategories } from './useMenuQueries'
import {
  useDeleteMenuItem,
  useToggleMenuItem,
  useDeleteCategory,
  useRestoreMenuItem,
  useHardDeleteMenuItem,
  useHardDeleteCategory,
  useToggleCategoryStatus,
} from './useMenuMutations'
import { useMenuFilters } from './useMenuFilters'

export function useMenuManagement() {
  const filters = useMenuFilters()
  const {
    activeTab,
    keyword,
    pageSize,
    currentPage,
    selectedCategory,
    selectedStatus,
    selectedAvailable,
    selectedFeatured,
    selectedStation
  } = filters.state

  // Drawer state
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

  // Confirm Modal state
  const [confirmAction, setConfirmAction] = useState<{
    type: 'DELETE_ITEM' | 'RESTORE_ITEM' | 'HARD_DELETE_ITEM' | 'DELETE_CATEGORY' | 'HARD_DELETE_CATEGORY'
    id: string
  } | null>(null)

  // Mutations
  const deleteItemMutation = useDeleteMenuItem()
  const toggleMutation = useToggleMenuItem()
  const deleteCategoryMutation = useDeleteCategory()
  const restoreItemMutation = useRestoreMenuItem()
  const hardDeleteItemMutation = useHardDeleteMenuItem()
  const toggleCategoryStatusMutation = useToggleCategoryStatus()
  const hardDeleteCategoryMutation = useHardDeleteCategory()

  // Queries
  const { data: menuPage, isLoading: isLoadingItems } = useAdminMenuItems({
    page: currentPage,
    size: pageSize,
    keyword: keyword || undefined,
    categoryId: selectedCategory || undefined,
    isActive: selectedStatus === 'ALL' ? undefined : selectedStatus === 'ACTIVE',
    isAvailable: selectedAvailable === 'ALL' ? undefined : selectedAvailable === 'AVAILABLE',
    isFeatured: selectedFeatured === 'ALL' ? undefined : selectedFeatured === 'FEATURED',
    station: selectedStation === 'ALL' ? undefined : selectedStation,
  })

  // We fetch categories with pagination if we are on the categories tab.
  // The dropdown filter on items tab needs the list of categories, so size: 100 is fine there.
  const { data: categoriesPage, isLoading: isLoadingCategories } = useAdminCategories({
    keyword: activeTab === 'categories' ? keyword : undefined,
    page: activeTab === 'categories' ? currentPage : 0,
    size: activeTab === 'categories' ? pageSize : 100,
  })
  const categories = categoriesPage?.content || []

  // Removed handleResetFilters because it's in filters.actions 

  // Component Handlers
  const handleAddNew = () => {
    if (activeTab === 'items') {
      setEditingItemId(null)
      setIsMenuDrawerOpen(true)
    } else {
      setEditingCategoryId(null)
      setIsCategoryDrawerOpen(true)
    }
  }

  const handleEditItem = (id: string) => { setEditingItemId(id); setIsMenuDrawerOpen(true) }
  const handleDeleteItem = (id: string) => setConfirmAction({ type: 'DELETE_ITEM', id })
  const handleToggleStatus = (id: string) => toggleMutation.mutate(id)
  const handleEditCategory = (id: string) => { setEditingCategoryId(id); setIsCategoryDrawerOpen(true) }
  const handleToggleCategoryStatus = (id: string) => toggleCategoryStatusMutation.mutate(id)
  const handleDeleteCategory = (id: string) => setConfirmAction({ type: 'DELETE_CATEGORY', id })
  const handleRestoreItem = (id: string) => setConfirmAction({ type: 'RESTORE_ITEM', id })
  const handleHardDeleteItem = (id: string) => setConfirmAction({ type: 'HARD_DELETE_ITEM', id })
  const handleHardDeleteCategory = (id: string) => setConfirmAction({ type: 'HARD_DELETE_CATEGORY', id })
  
  const handleConfirmExecute = async () => {
    if (!confirmAction) return
    
    try {
      if (confirmAction.type === 'DELETE_ITEM') {
        await deleteItemMutation.mutateAsync(confirmAction.id)
      } else if (confirmAction.type === 'DELETE_CATEGORY') {
        await deleteCategoryMutation.mutateAsync(confirmAction.id)
      } else if (confirmAction.type === 'RESTORE_ITEM') {
        await restoreItemMutation.mutateAsync(confirmAction.id)
      } else if (confirmAction.type === 'HARD_DELETE_ITEM') {
        await hardDeleteItemMutation.mutateAsync(confirmAction.id)
      } else if (confirmAction.type === 'HARD_DELETE_CATEGORY') {
        await hardDeleteCategoryMutation.mutateAsync(confirmAction.id)
      }
    } finally {
      setConfirmAction(null)
    }
  }

  const handleCancelConfirm = () => setConfirmAction(null)

  const isExecutingConfirm = deleteItemMutation.isPending || deleteCategoryMutation.isPending || restoreItemMutation.isPending || hardDeleteItemMutation.isPending || toggleCategoryStatusMutation.isPending || hardDeleteCategoryMutation.isPending

  return {
    state: {
      ...filters.state,
      isMenuDrawerOpen,
      editingItemId,
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
      ...filters.actions,
      setPageSize: filters.actions.setPageSize,
      setIsMenuDrawerOpen,
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
      handleCancelConfirm
    },
  }
}
