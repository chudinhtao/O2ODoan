import axiosInstance from "../../../../services/interceptor";
import { API_ROUTES } from "@/shared/constants/API_ROUTES";
import { IAttendanceLog, IShiftTemplate, IStaffProfile, IWorkSchedule, ICreateStaffRequest, IUpdateStaffRequest } from "../types/staff.type";
import { IApiResponse } from "@/shared/types/IApiResponse";

const StaffService = {
  // --- Staff Profiles ---
  getAllStaff: async (params?: { page?: number, size?: number, keyword?: string }): Promise<import('@/shared/types/IApiResponse').IPageResponse<IStaffProfile>> => {
    const response = await axiosInstance.get<IApiResponse<import('@/shared/types/IApiResponse').IPageResponse<IStaffProfile>>>(API_ROUTES.adminStaff.root, { params });
    return response.data.data;
  },

  createStaff: async (data: ICreateStaffRequest): Promise<IStaffProfile> => {
    const response = await axiosInstance.post<IApiResponse<IStaffProfile>>(API_ROUTES.adminStaff.root, data);
    return response.data.data;
  },

  updateStaff: async (id: string, data: IUpdateStaffRequest): Promise<IStaffProfile> => {
    const response = await axiosInstance.patch<IApiResponse<IStaffProfile>>(API_ROUTES.adminStaff.byId(id), data);
    return response.data.data;
  },

  toggleActive: async (id: string): Promise<void> => {
    await axiosInstance.patch(API_ROUTES.adminStaff.toggle(id));
  },

  deleteStaff: async (id: string): Promise<void> => {
    await axiosInstance.delete(API_ROUTES.adminStaff.byId(id));
  },

  // --- Shift Templates ---
  getShifts: async (): Promise<IShiftTemplate[]> => {
    const response = await axiosInstance.get<IApiResponse<IShiftTemplate[]>>(API_ROUTES.adminStaff.shifts);
    return response.data.data;
  },

  saveShift: async (shift: IShiftTemplate): Promise<IShiftTemplate> => {
    const response = await axiosInstance.post<IApiResponse<IShiftTemplate>>(API_ROUTES.adminStaff.shifts, shift);
    return response.data.data;
  },

  deleteShift: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ROUTES.adminStaff.shifts}/${id}`);
  },

  // --- Schedules ---
  getSchedules: async (from: string, to: string): Promise<IWorkSchedule[]> => {
    const response = await axiosInstance.get<IApiResponse<IWorkSchedule[]>>(`${API_ROUTES.adminStaff.schedules}?from=${from}&to=${to}`);
    return response.data.data;
  },

  assignShift: async (schedule: Partial<IWorkSchedule>): Promise<IWorkSchedule> => {
    const response = await axiosInstance.post<IApiResponse<IWorkSchedule>>(API_ROUTES.adminStaff.assign, schedule);
    return response.data.data;
  },

  deleteSchedule: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_ROUTES.adminStaff.schedules}/${id}`);
  },

  // --- Attendance ---
  getAttendanceLogs: async (from: string, to?: string): Promise<IAttendanceLog[]> => {
    const response = await axiosInstance.get<IApiResponse<IAttendanceLog[]>>(`${API_ROUTES.adminStaff.attendance}?from=${from}${to ? `&to=${to}` : ''}`);
    return response.data.data;
  },

  checkIn: async (): Promise<void> => {
    await axiosInstance.post('/api/auth/staff/attendance/check-in');
  },

  checkOut: async (): Promise<void> => {
    await axiosInstance.post('/api/auth/staff/attendance/check-out');
  }
};

export default StaffService;
