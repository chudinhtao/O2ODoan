import http from '@/services/interceptor'
import { API_ROUTES } from '@/shared/constants/API_ROUTES'
import type { IApiResponse, IPageResponse } from '@/shared/types/IApiResponse'
import type {
  IRevenueReport,
  ITopItemTarget,
  ISourceReport,
  IHourlyTraffic,
  ITableUsage,
  ICashierShiftReport,
  IPromotionEffectiveness,
  IStaffCallStats,
  IKitchenPerformance,
  ICancelledOrderDrilldown,
  IProfitLossReport,
  IInventoryVarianceReport,
  IChefPerformance,
  IServerPerformance,
  ICategorySales,
  IStaffTimesheet,
  IReservationReport
} from '../types/report.type'

export const reportService = {
  getRevenue: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<IRevenueReport[]>>(API_ROUTES.report.revenue, { params: { from, to } })
    return res.data.data
  },

  getProfitLoss: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<IProfitLossReport>>(API_ROUTES.report.profitLoss, { params: { from, to } })
    return res.data.data
  },

  getInventoryVariance: async (from: string, to: string, page: number = 0, size: number = 10) => {
    const res = await http.get<IApiResponse<IPageResponse<IInventoryVarianceReport>>>(API_ROUTES.report.inventoryVariance, { params: { from, to, page, size } })
    return res.data.data
  },

  exportInventoryVariance: async (from: string, to: string) => {
    const res = await http.get(API_ROUTES.report.inventoryVarianceExport, { 
      params: { from, to },
      responseType: 'blob' 
    })
    return res.data
  },

  // F2: Thêm sortBy param (QUANTITY | REVENUE)
  getTopItems: async (from: string, to: string, sortBy: 'QUANTITY' | 'REVENUE' = 'QUANTITY', page: number = 0, size: number = 10) => {
    const res = await http.get<IApiResponse<IPageResponse<ITopItemTarget>>>(API_ROUTES.report.topItems, {
      params: { from, to, sortBy, page, size }
    })
    return res.data.data
  },

  getBySource: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<ISourceReport[]>>(API_ROUTES.report.bySource, { params: { from, to } })
    return res.data.data
  },

  getHourlyTraffic: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<IHourlyTraffic[]>>(API_ROUTES.report.byHour, { params: { from, to } })
    return res.data.data
  },

  getTableUsage: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<ITableUsage[]>>(API_ROUTES.report.tables, { params: { from, to } })
    return res.data.data
  },

  getCashierShift: async (shiftDate: string) => {
    const res = await http.get<IApiResponse<ICashierShiftReport>>(API_ROUTES.report.cashierShift, { params: { shiftDate } })
    return res.data.data
  },

  // N2: Endpoint mới — hiệu quả khuyến mãi
  getPromotionEffectiveness: async (from: string, to: string, page: number = 0, size: number = 10) => {
    const res = await http.get<IApiResponse<IPageResponse<IPromotionEffectiveness>>>(
      API_ROUTES.report.promotionEffectiveness,
      { params: { from, to, page, size } }
    )
    return res.data.data
  },

  // N3: Endpoint mới — thống kê gọi nhân viên
  getStaffCallStats: async (from: string, to: string, page: number = 0, size: number = 10) => {
    const res = await http.get<IApiResponse<IPageResponse<IStaffCallStats>>>(
      API_ROUTES.report.staffCalls,
      { params: { from, to, page, size } }
    )
    return res.data.data
  },

  // 1.4: Hieu suat bep
  getKitchenPerformance: async (from: string, to: string, page: number = 0, size: number = 10) => {
    const res = await http.get<IApiResponse<IPageResponse<IKitchenPerformance>>>(
      API_ROUTES.report.kitchenPerformance,
      { params: { from, to, page, size } }
    )
    return res.data.data
  },

  // 1.4: Chi tiet don huy
  getCancelledDrilldown: async (from: string, to: string, page: number = 0, size: number = 10) => {
    const res = await http.get<IApiResponse<IPageResponse<ICancelledOrderDrilldown>>>(
      API_ROUTES.report.cancelledDrilldown,
      { params: { from, to, page, size } }
    )
    return res.data.data
  },

  getChefPerformance: async (from: string, to: string, page: number = 0, size: number = 10) => {
    const res = await http.get<IApiResponse<IPageResponse<IChefPerformance>>>(
      API_ROUTES.report.chefPerformance,
      { params: { from, to, page, size } }
    )
    return res.data.data
  },

  getServerPerformance: async (from: string, to: string, page: number = 0, size: number = 10) => {
    const res = await http.get<IApiResponse<IPageResponse<IServerPerformance>>>(
      API_ROUTES.report.serverPerformance,
      { params: { from, to, page, size } }
    )
    return res.data.data
  },

  getCategorySales: async (from: string, to: string, page: number = 0, size: number = 10) => {
    const res = await http.get<IApiResponse<IPageResponse<ICategorySales>>>(
      API_ROUTES.report.categorySales,
      { params: { from, to, page, size } }
    )
    return res.data.data
  },

  getStaffTimesheet: async (from: string, to: string, page: number = 0, size: number = 10) => {
    const res = await http.get<IApiResponse<IPageResponse<IStaffTimesheet>>>(
      API_ROUTES.report.staffTimesheet,
      { params: { from, to, page, size } }
    )
    return res.data.data
  },

  getReservationReport: async (from: string, to: string) => {
    const res = await http.get<IApiResponse<IReservationReport>>(
      API_ROUTES.report.reservations,
      { params: { from, to } }
    )
    return res.data.data
  }
}
