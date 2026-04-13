export const ROLE = {
  ADMIN: 'ADMIN',
  CASHIER: 'CASHIER',
  KITCHEN: 'KITCHEN'
} as const;

export type RoleType = typeof ROLE[keyof typeof ROLE];

export interface IStaff {
  id: string;
  username: string;
  fullName: string;
  role: RoleType;
  active: boolean;
  createdAt?: string; // e.g. "2023-11-20T10:00:00"
  lastLoginAt?: string; // Optional depending on backend
}

export interface ICreateStaffRequest {
  username: string;
  password?: string;
  fullName: string;
  role: RoleType;
  active?: boolean;
}

export interface IUpdateStaffRequest {
  password?: string;
  fullName?: string;
  role?: RoleType;
}
