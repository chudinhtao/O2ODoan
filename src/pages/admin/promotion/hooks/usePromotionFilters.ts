import { useState, useMemo } from 'react'
import type { IPromotion } from '../types/adminPromotion.type'

interface IPromotionFilters {
  search: string
  selectedStatus: string
  pageSize: number
  currentPage: number
}

export function usePromotionFilters(initialData: IPromotion[] = []) {
  const [filters, setFilters] = useState<IPromotionFilters>({
    search: '',
    selectedStatus: 'ALL',
    pageSize: 10,
    currentPage: 0
  })

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  const handleSearchChange = (val: string) => setFilters(prev => ({ ...prev, search: val, currentPage: 0 }))
  const handleStatusChange = (val: string) => setFilters(prev => ({ ...prev, selectedStatus: val, currentPage: 0 }))
  const handlePageSizeChange = (val: number) => setFilters(prev => ({ ...prev, pageSize: val, currentPage: 0 }))
  const handlePageChange = (val: number) => setFilters(prev => ({ ...prev, currentPage: val }))

  const handleResetFilters = () => {
    setFilters({
      search: '',
      selectedStatus: 'ALL',
      pageSize: 10,
      currentPage: 0
    })
  }

  const hasActiveFilters = filters.search !== '' || filters.selectedStatus !== 'ALL'

  const filteredData = useMemo(() => {
    return initialData.filter((promo) => {
      // Filter by status
      if (filters.selectedStatus === 'ACTIVE' && !promo.active) return false
      if (filters.selectedStatus === 'INACTIVE' && promo.active) return false

      // Filter by search (name or code)
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const nameMatch = promo.name?.toLowerCase().includes(q) ?? false
        const codeMatch = promo.code?.toLowerCase().includes(q) ?? false
        if (!nameMatch && !codeMatch) return false
      }

      return true
    })
  }, [initialData, filters.selectedStatus, filters.search])

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
      handlePageSizeChange,
      handlePageChange,
      handleResetFilters
    }
  }
}
