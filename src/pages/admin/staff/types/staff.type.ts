export enum SCHEDULE_STATUS {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export const ROLE = {
  ADMIN: 'ADMIN',
  CASHIER: 'CASHIER',
  KITCHEN: 'KITCHEN',
  SERVER: 'SERVER'
} as const;

export type RoleType = typeof ROLE[keyof typeof ROLE];

export interface IStaffProfile {
  id: string;
  username: string;
  fullName: string;
  role: RoleType;
  phone?: string;
  active: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface IShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  colorCode: string;
  gracePeriodMinutes?: number;
  active: boolean;
}

export interface IWorkSchedule {
  id: string;
  userId: string;
  shiftId: string;
  workDate: string; // ISO Date string yyyy-MM-dd
  status: SCHEDULE_STATUS;
  notes?: string;
  // Join data
  staffName?: string;
  shiftName?: string;
  startTime?: string;
  endTime?: string;
  colorCode?: string;
}

export interface IAttendanceLog {
  id: string;
  userId: string;
  fullName: string;
  shiftName?: string;
  workDate: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  late: boolean;
  lateMinutes?: number;
  earlyLeave: boolean;
  earlyLeaveMinutes?: number;
  otMinutes?: number;
  checkInNote?: string;
  checkOutNote?: string;
}

export interface IAttendanceSummary {
  id: string; // for DataTable
  userId: string;
  fullName: string;
  totalShifts: number;
  totalWorkingHours: number;
  totalLateMinutes: number;
  totalEarlyLeaveMinutes: number;
  totalOtMinutes: number;
}

export interface ICreateStaffRequest {
  username: string;
  password?: string;
  fullName: string;
  phone?: string;
  role: RoleType;
  active?: boolean;
}

export interface IUpdateStaffRequest {
  password?: string;
  fullName?: string;
  phone?: string;
  role?: RoleType;
}
