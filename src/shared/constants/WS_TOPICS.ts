export const WS_TOPICS = {
  pos:           '/topic/pos',
  customerOrder: (token: string) => `/topic/customer/${token}`,
  kds:           (station: string) => `/topic/kds/${station}`,
} as const
