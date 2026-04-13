import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { posMenuService } from '../services/posMenu.service'
import { useWebSocketCtx } from '@/contexts/WebSocketContext'

export const POS_MENU_KEYS = {
  all: ['pos-menu'] as const,
  categories: ['pos-menu', 'categories'] as const,
  items: (categoryId?: string) => ['pos-menu', 'items', categoryId] as const,
}

export function usePosCategories() {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  useEffect(() => {
    if (!isConnected) return
    const sub = subscribe('/topic/menu/updates', () => {
      queryClient.invalidateQueries({ queryKey: POS_MENU_KEYS.categories })
    })
    return () => {
      sub?.unsubscribe()
    }
  }, [isConnected, subscribe, queryClient])

  return useQuery({
    queryKey: POS_MENU_KEYS.categories,
    queryFn: async () => {
      const res = await posMenuService.getCategories()
      return res.data.data.content
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePosMenuItems(categoryId?: string) {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  useEffect(() => {
    if (!isConnected) return
    const sub = subscribe('/topic/menu/updates', () => {
      queryClient.invalidateQueries({ queryKey: POS_MENU_KEYS.items(categoryId) })
    })
    return () => {
      sub?.unsubscribe()
    }
  }, [isConnected, subscribe, queryClient, categoryId])

  return useQuery({
    queryKey: POS_MENU_KEYS.items(categoryId),
    queryFn: async () => {
      const res = await posMenuService.getItems(categoryId)
      const items = res.data.data.content || []
      
      // Sắp xếp đưa các sản phẩm Featured lên trước
      return [...items].sort((a, b) => {
        if (a.isFeatured === b.isFeatured) return 0
        return a.isFeatured ? -1 : 1
      })
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Hook tổng hợp kèm quản lý category được chọn
export function usePosMenu() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>()
  const categories = usePosCategories()
  const menuItems = usePosMenuItems(selectedCategoryId)

  return { categories, menuItems, selectedCategoryId, setSelectedCategoryId }
}

export function usePosMenuItem(itemId?: string) {
  return useQuery({
    queryKey: ['pos-menu', 'item', itemId],
    queryFn: async () => {
      const res = await posMenuService.getItem(itemId!)
      return res.data.data
    },
    enabled: !!itemId,
  })
}
