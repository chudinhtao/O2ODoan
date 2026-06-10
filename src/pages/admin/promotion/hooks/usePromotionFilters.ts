import { useState, useMemo } from 'react'
import type { IPromotion } from '../types/adminPromotion.type'

interface IPromotionFilters {
  search: string
  selectedStatus: string
  selectedScope: string
  selectedTrigger: string
  selectedDiscountType: string
  pageSize: number
  currentPage: number
}

const DEFAULT_FILTERS: IPromotionFilters = {
  search: '',
  selectedStatus: 'ALL',
  selectedScope: 'ALL',
  selectedTrigger: 'ALL',
  selectedDiscountType: 'ALL',
  pageSize: 10,
  currentPage: 0,
}

export function usePromotionFilters(initialData: IPromotion[] = []) {
  const [filters, setFilters] = useState<IPromotionFilters>(DEFAULT_FILTERS)
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  const handleSearchChange      = (val: string) => setFilters(prev => ({ ...prev, search: val, currentPage: 0 }))
  const handleStatusChange      = (val: string) => setFilters(prev => ({ ...prev, selectedStatus: val, currentPage: 0 }))
  const handleScopeChange       = (val: string) => setFilters(prev => ({ ...prev, selectedScope: val, currentPage: 0 }))
  const handleTriggerChange     = (val: string) => setFilters(prev => ({ ...prev, selectedTrigger: val, currentPage: 0 }))
  const handleDiscountTypeChange = (val: string) => setFilters(prev => ({ ...prev, selectedDiscountType: val, currentPage: 0 }))
  const handlePageSizeChange    = (val: number) => setFilters(prev => ({ ...prev, pageSize: val, currentPage: 0 }))
  const handlePageChange        = (val: number) => setFilters(prev => ({ ...prev, currentPage: val }))
  const handleResetFilters      = () => setFilters(DEFAULT_FILTERS)

  const hasActiveFilters =
    filters.search !== '' ||
    filters.selectedStatus !== 'ALL' ||
    filters.selectedScope !== 'ALL' ||
    filters.selectedTrigger !== 'ALL' ||
    filters.selectedDiscountType !== 'ALL'

  const filteredData = useMemo(() => {
    return initialData.filter((promo) => {
      if (filters.selectedStatus === 'ACTIVE'   && !promo.active) return false
      if (filters.selectedStatus === 'INACTIVE' && promo.active)  return false
      if (filters.selectedScope !== 'ALL'        && promo.scope !== filters.selectedScope) return false
      if (filters.selectedTrigger !== 'ALL'      && promo.triggerType !== filters.selectedTrigger) return false
      if (filters.selectedDiscountType !== 'ALL' && promo.discountType !== filters.selectedDiscountType) return false

      if (filters.search) {
        const q = filters.search.toLowerCase()
        const nameMatch = promo.name?.toLowerCase().includes(q) ?? false
        const codeMatch = promo.code?.toLowerCase().includes(q) ?? false
        if (!nameMatch && !codeMatch) return false
      }

      return true
    })
  }, [initialData, filters.selectedStatus, filters.selectedScope, filters.selectedTrigger, filters.selectedDiscountType, filters.search])

  const paginatedData = useMemo(() => {
    return filteredData.slice(
      filters.currentPage * filters.pageSize,
      (filters.currentPage + 1) * filters.pageSize
    )
  }, [filteredData, filters.currentPage, filters.pageSize])

  const totalPages = Math.ceil(filteredData.length / filters.pageSize)

  return {
    filters,
    isFiltersExpanded,
    setIsFiltersExpanded,
    hasActiveFilters,
    filteredData,
    paginatedData,
    totalPages,
    actions: {
      handleSearchChange,
      handleStatusChange,
      handleScopeChange,
      handleTriggerChange,
      handleDiscountTypeChange,
      handlePageSizeChange,
      handlePageChange,
      handleResetFilters,
    }
  }
}
