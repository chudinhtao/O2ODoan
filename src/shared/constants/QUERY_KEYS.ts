export const QUERY_KEYS = {
  menu: {
    all:        ['menu'] as const,
    categories: () => [...QUERY_KEYS.menu.all, 'categories'] as const,
    items:      (catId?: string, page = 0, size = 20) =>
                  [...QUERY_KEYS.menu.all, 'items', catId, page, size] as const,
    item:       (id: string) => [...QUERY_KEYS.menu.all, 'item', id] as const,
  },
  order: {
    all:       ['order'] as const,
    byId:      (id: string)    => ['order', id] as const,
    bySession: (token: string) => ['order', 'session', token] as const,
    byTable:   (tableId: string) => ['order', 'table', tableId] as const,
    list:      (params: Record<string, unknown>) => [...QUERY_KEYS.order.all, 'list', params] as const,
  },
  kds: {
    all:     ['kds'] as const,
    tickets: (station?: string) => ['kds', 'tickets', station] as const,
  },
  table: {
    all:    ['table'] as const,
    list:   (params?: Record<string, unknown>) => [...QUERY_KEYS.table.all, 'list', params] as const,
    byId:   (id: string) => [...QUERY_KEYS.table.all, 'detail', id] as const,
  },
  report: {
    base:    ['report'] as const,
    revenue: (params: Record<string, unknown>) => ['report', 'revenue', params] as const,
    orders:  (params: Record<string, unknown>) => ['report', 'orders', params] as const,
    shift:   (date: string) => ['report', 'shift', date] as const,
  },
  promotion: {
    all:    ['promotion'] as const,
    list:   (params: Record<string, unknown>) => [...QUERY_KEYS.promotion.all, 'list', params] as const,
    detail: (id: string) => [...QUERY_KEYS.promotion.all, 'detail', id] as const,
  },
} as const
