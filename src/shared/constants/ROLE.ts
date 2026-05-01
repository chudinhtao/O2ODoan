export const ROLE = {
  ADMIN:    'ADMIN',
  CASHIER:  'CASHIER',
  KITCHEN:  'KITCHEN',
  SERVER:   'SERVER',
} as const
export type IRole = (typeof ROLE)[keyof typeof ROLE]
