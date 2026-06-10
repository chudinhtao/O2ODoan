import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/constants/QUERY_KEYS'
import { inventoryService } from '../services/inventory.service'

export function useUoms() {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.uoms(),
    queryFn: inventoryService.getUoms,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLocations() {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.locations(),
    queryFn: inventoryService.getLocations,
    staleTime: 5 * 60 * 1000,
  })
}

export function useInventoryCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.categories(),
    queryFn: inventoryService.getCategories,
    staleTime: 5 * 60 * 1000,
  })
}

export function useSuppliers(params?: { keyword?: string; isActive?: boolean; page?: number; size?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.suppliers(params),
    queryFn: () => inventoryService.getSuppliers(params),
  })
}

export function useInventoryItems(params?: { keyword?: string; categoryId?: string; type?: string; page?: number; size?: number; isActive?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.items(params),
    queryFn: () => inventoryService.getItems(params),
  })
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.item(id),
    queryFn: () => inventoryService.getItem(id),
    enabled: !!id,
  })
}

export function useUomConversions(itemId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.inventory.conversions(itemId),
    queryFn: () => inventoryService.getConversions(itemId),
    enabled: !!itemId,
  })
}

export function useInventoryDashboardSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'inventory', 'dashboard-summary', startDate, endDate],
    queryFn: () => inventoryService.getDashboardSummary(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}

export function useInventoryTrend(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'inventory', 'trend', startDate, endDate],
    queryFn: () => inventoryService.getTrendData(startDate, endDate),
    enabled: !!startDate && !!endDate,
  })
}

export function useInventoryCategorySearch(params?: { keyword?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['inventory', 'categories', 'search', params],
    queryFn: () => inventoryService.getCategoriesSearch(params),
  })
}

export function useInventoryUomSearch(params?: { keyword?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: ['inventory', 'uoms', 'search', params],
    queryFn: () => inventoryService.getUomsSearch(params),
  })
}
