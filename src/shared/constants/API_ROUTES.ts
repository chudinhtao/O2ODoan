const BASE = ''

export const API_ROUTES = {
  auth: {
    login:   `${BASE}auth/login`,
    refresh: `${BASE}auth/refresh`,
    logout:  `${BASE}auth/logout`,
  },
  menu: {
    categories: `${BASE}menu/categories`,
    items:       `${BASE}menu/items`,
    item:        (id: string) => `${BASE}menu/items/${id}`,
  },
  adminMenu: {
    categories: `${BASE}admin/menu/categories`,
    category:   (id: string) => `${BASE}admin/menu/categories/${id}`,
    categoryHard: (id: string) => `${BASE}admin/menu/categories/${id}/hard`,
    items:       `${BASE}admin/menu/items`,
    item:        (id: string) => `${BASE}admin/menu/items/${id}`,
    bulkSale:    `${BASE}admin/menu/items/bulk-sale`,
    toggleOption: (id: string, optId: string) => `${BASE}admin/menu/items/${id}/options/${optId}/toggle`,
  },
  order: {
    root:       `${BASE}orders`,
    byId:       (id: string) => `${BASE}orders/${id}`,
    bySession:  (token: string) => `${BASE}orders/session/${token}`,
    byTable:    (tableId: string) => `${BASE}orders/table/${tableId}`,
    // POS Cart
    cart:       `${BASE}orders/cart`,
    cartItems:  `${BASE}orders/cart/items`,
    cartItem:   (cartItemId: string) => `${BASE}orders/cart/items/${cartItemId}`,
    tickets:    `${BASE}orders/tickets`,
    sessionOrder: `${BASE}orders/session`,
  },
  posSession: {
    openManual: (tableId: string) => `${BASE}sessions/open/manual/${tableId}`,
    close:      (token: string) => `${BASE}sessions/${token}/close`,
    byToken:    (token: string) => `${BASE}sessions/${token}`,
  },
  kds: {
    tickets:   `${BASE}kds/tickets`,
    ticket:    (id: string) => `${BASE}kds/tickets/${id}`,
    updateItem:(ticketId: string, itemId: string) => `${BASE}kds/tickets/${ticketId}/items/${itemId}`,
  },
  adminTable: {
    root:       `${BASE}admin/tables`,
    byId:       (id: string) => `${BASE}admin/tables/${id}`,
    generateQr: (id: string) => `${BASE}admin/tables/${id}/qr`,
    disableQr:  (id: string) => `${BASE}admin/tables/${id}/disable-qr`,
    toggleActive: (id: string) => `${BASE}admin/tables/${id}/toggle-active`,
    hardDelete: (id: string) => `${BASE}admin/tables/${id}/hard`,
  },
  table: {
    root:      `${BASE}tables`,
    byId:      (id: string) => `${BASE}tables/${id}`,
    cleanDone: (id: string) => `${BASE}tables/${id}/clean-done`,
    merge:     `${BASE}tables/merge`,
    transfer:  `${BASE}tables/transfer`,
  },
  report: {
    revenue:                `${BASE}reports/revenue`,
    topItems:               `${BASE}reports/top-items`,
    bySource:               `${BASE}reports/by-source`,
    byHour:                 `${BASE}reports/by-hour`,
    tables:                 `${BASE}reports/tables`,
    cashierShift:           `${BASE}reports/cashier-shift`,
    promotionEffectiveness: `${BASE}reports/promotion-effectiveness`,
    staffCalls:             `${BASE}reports/staff-calls`,
    kitchenPerformance:     `${BASE}reports/kitchen-performance`,     // 1.4: mới
    cancelledDrilldown:     `${BASE}reports/cancelled-drilldown`,     // 1.4: mới
  },
  promotion: {
    root:      `${BASE}admin/promotions`,
    byId:      (id: string) => `${BASE}admin/promotions/${id}`,
    hardDelete:(id: string) => `${BASE}admin/promotions/${id}/hard`,
    toggle:    (id: string) => `${BASE}admin/promotions/${id}/toggle`,
    validate:  `${BASE}promotions/validate`,
    flashSale: `${BASE}admin/promotions/flash-sale`,
  },
  adminStaff: {
    root:   `${BASE}admin/staff`,
    byId:   (id: string) => `${BASE}admin/staff/${id}`,
    toggle: (id: string) => `${BASE}admin/staff/${id}/toggle`,
  },
  ai: {
    customerChat: `${BASE}customer/ai/chat`,
    adminChat:    `${BASE}admin/ai/chat`, // Admin AI Agent
  },
} as const
