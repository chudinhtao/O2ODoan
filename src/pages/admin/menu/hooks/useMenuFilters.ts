import { useState } from 'react'

export function useMenuFilters() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items')

  // Filter state
  const [keyword, setKeyword] = useState('')
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE')
  const [selectedAvailable, setSelectedAvailable] = useState<'ALL' | 'AVAILABLE' | 'UNAVAILABLE'>('AVAILABLE')
  const [selectedFeatured, setSelectedFeatured] = useState<'ALL' | 'FEATURED' | 'NORMAL'>('ALL')
  const [selectedStation, setSelectedStation] = useState<string>('ALL')

  const handleResetFilters = () => {
    setKeyword('')
    setSelectedCategory('')
    setSelectedStatus('ACTIVE')
    setSelectedAvailable('AVAILABLE')
    setSelectedFeatured('ALL')
    setSelectedStation('ALL')
    setCurrentPage(0)
  }

  return {
    state: {
      activeTab,
      keyword,
      pageSize,
      currentPage,
      selectedCategory,
      selectedStatus,
      selectedAvailable,
      selectedFeatured,
      selectedStation,
    },
    actions: {
      setActiveTab,
      setKeyword,
      setPageSize,
      setCurrentPage,
      setSelectedCategory,
      setSelectedStatus,
      setSelectedAvailable,
      setSelectedFeatured,
      setSelectedStation,
      handleResetFilters
    }
  }
}
