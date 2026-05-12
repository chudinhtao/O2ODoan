import http from '@/services/interceptor';
import { API_ROUTES } from '@/shared/constants/API_ROUTES';
import { IStaff, ICreateStaffRequest, IUpdateStaffRequest } from '../types/adminStaff.type';
import { IApiResponse } from '@/shared/types/IApiResponse';

export const adminStaffService = {
  getStaffList: async (params?: { keyword?: string, role?: string, active?: boolean }) => {
    const res = await http.get<IApiResponse<IStaff[]>>(API_ROUTES.adminStaff.root, { params });
    return res.data.data;
  },

  createStaff: async (payload: ICreateStaffRequest) => {
    const res = await http.post<IApiResponse<IStaff>>(API_ROUTES.adminStaff.root, payload);
    return res.data;
  },

  updateStaff: async (id: string, payload: IUpdateStaffRequest) => {
    const res = await http.patch<IApiResponse<IStaff>>(API_ROUTES.adminStaff.byId(id), payload);
    return res.data;
  },

  toggleStaffStatus: async (id: string) => {
    const res = await http.patch<IApiResponse<IStaff>>(API_ROUTES.adminStaff.toggle(id));
    return res.data;
  }
};
