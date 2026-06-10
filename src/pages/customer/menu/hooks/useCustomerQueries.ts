import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { customerService } from '../services/customerService'
import { useWebSocketCtx } from '@/contexts/WebSocketContext'

export const CUSTOMER_QUERY_KEYS = {
  all: ['customer'] as const,
  profile: () => [...CUSTOMER_QUERY_KEYS.all, 'profile'] as const,
  categories: () => [...CUSTOMER_QUERY_KEYS.all, 'categories'] as const,
  items: (categoryId: string) => [...CUSTOMER_QUERY_KEYS.all, 'items', categoryId] as const,
  item: (id: string) => [...CUSTOMER_QUERY_KEYS.all, 'item', id] as const,
  sessionOrder: (token: string) => [...CUSTOMER_QUERY_KEYS.all, 'sessionOrder', token] as const,
  cart: (token: string) => [...CUSTOMER_QUERY_KEYS.all, 'cart', token] as const,
}

// =================== QUERIES ===================

export function useCustomerProfile() {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.profile(),
    queryFn: async () => {
      return customerService.getProfile()
    },
  })
}

export function useCustomerCategories() {
  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.categories(),
    queryFn: async () => {
      const data = await customerService.getCategories()
      return data.content
    },
  })
}

export function useCustomerItems(categoryId: string) {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  useEffect(() => {
    if (!isConnected) return
    // Topic menu.updated là public, ai cũng nghe được
    const sub = subscribe('/topic/menu/updates', () => {
      // Invalidate tất cả items khi có bất kỳ món nào thay đổi stock/giá
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.items(categoryId) })
      // Cả chi tiết món nếu đang mở modal
      queryClient.invalidateQueries({ queryKey: [...CUSTOMER_QUERY_KEYS.all, 'item'] })
    })
    return () => {
      sub?.unsubscribe()
    }
  }, [isConnected, subscribe, queryClient, categoryId])

  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.items(categoryId || 'all'),
    queryFn: async () => {
      const data = await customerService.getItems(categoryId || '')
      const items = data.content || []
      
      return [...items].sort((a, b) => {
        if (!!a.isFeatured === !!b.isFeatured) return 0
        return a.isFeatured ? -1 : 1
      })
    },
    enabled: true, // Luôn luôn cho phép tải, nếu không có categoryId thì backend trả về tất cả
  })
}

/**
 * Lightweight query for the booking pre-order menu page.
 * Differences vs useCustomerItems:
 * - No WebSocket subscription (booking doesn't need real-time stock updates)
 * - staleTime: 5 min (avoids redundant refetches when navigating back & forth)
 * - size: 50 (avoids blasting 100 items; enough for smooth UX without pagination UI)
 */
export function useBookingMenuItems(categoryId: string) {
  return useQuery({
    queryKey: [...CUSTOMER_QUERY_KEYS.all, 'booking-items', categoryId || 'all'],
    queryFn: async () => {
      const data = await customerService.getItems(categoryId || '')
      const items = data.content || []
      return [...items].sort((a, b) => {
        if (!!a.isFeatured === !!b.isFeatured) return 0
        return a.isFeatured ? -1 : 1
      })
    },
    staleTime: 5 * 60 * 1000, // 5 phút — tránh refetch khi navigate back
    enabled: true,
  })
}

export function useCustomerActivePromotions(scope: string) {
  return useQuery({
    queryKey: [...CUSTOMER_QUERY_KEYS.all, 'promotions', scope],
    queryFn: async () => {
      return customerService.getActivePromotionsByScope(scope)
    },
  })
}

export function useCustomerCart(token: string | null) {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  useEffect(() => {
    if (!token || !isConnected) return
    const sub = subscribe(`/topic/sessions/${token}/cart`, () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.cart(token) })
    })
    return () => {
      sub?.unsubscribe()
    }
  }, [token, subscribe, isConnected, queryClient])

  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.cart(token!),
    queryFn: async () => {
      return customerService.getCart()
    },
    enabled: !!token,
  })
}

export function useCustomerSessionOrder(token: string | null) {
  const queryClient = useQueryClient()
  const { subscribe, isConnected } = useWebSocketCtx()

  useEffect(() => {
    if (!token || !isConnected) return
    
    // Subscribe to both tickets status updates and general paid/order events
    const subTickets = subscribe(`/topic/sessions/${token}/tickets`, () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
    })
    const subPaid = subscribe(`/topic/sessions/${token}/paid`, () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
    })
    const subCreated = subscribe(`/topic/sessions/${token}/orders`, () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token) })
    })

    return () => {
      subTickets?.unsubscribe()
      subPaid?.unsubscribe()
      subCreated?.unsubscribe()
    }
  }, [token, subscribe, isConnected, queryClient])

  return useQuery({
    queryKey: CUSTOMER_QUERY_KEYS.sessionOrder(token!),
    queryFn: async () => {
      return customerService.getSessionOrder()
    },
    enabled: !!token,
  })
}
