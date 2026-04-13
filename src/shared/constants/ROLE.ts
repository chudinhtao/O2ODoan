export const ROLE = {
  ADMIN:    'ADMIN',
  CASHIER:  'CASHIER',
  KITCHEN:  'KITCHEN',
} as const
export type IRole = (typeof ROLE)[keyof typeof ROLE]
