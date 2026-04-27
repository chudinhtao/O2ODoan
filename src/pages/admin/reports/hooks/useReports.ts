import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'

export const REPORT_KEYS = {
  all: ['reports'] as const,
  revenue: (from: string, to: string) => [...REPORT_KEYS.all, 'revenue', from, to] as const,
  topItems: (from: string, to: string, limit: number, sortBy: string) =>
    [...REPORT_KEYS.all, 'topItems', from, to, limit, sortBy] as const,
  source: (from: string, to: string) => [...REPORT_KEYS.all, 'source', from, to] as const,
  hourly: (from: string, to: string) => [...REPORT_KEYS.all, 'hourly', from, to] as const,
  tables: (from: string, to: string) => [...REPORT_KEYS.all, 'tables', from, to] as const,
  shift: (date: string) => [...REPORT_KEYS.all, 'shift', date] as const,
  promotionEffectiveness: (from: string, to: string) =>
    [...REPORT_KEYS.all, 'promotionEffectiveness', from, to] as const,
  staffCalls: (from: string, to: string) => [...REPORT_KEYS.all, 'staffCalls', from, to] as const,
  kitchenPerformance: (from: string, to: string) => [...REPORT_KEYS.all, 'kitchenPerf', from, to] as const,
  cancelledDrilldown: (from: string, to: string) => [...REPORT_KEYS.all, 'cancelled', from, to] as const,
}

export function useRevenueReport(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.revenue(from, to),
    queryFn: () => reportService.getRevenue(from, to),
    enabled: !!from && !!to
  })
}

// F2: Thêm sortBy — 'QUANTITY' (mặc định) | 'REVENUE'
export function useTopItemsReport(
  from: string,
  to: string,
  limit: number = 10,
  sortBy: 'QUANTITY' | 'REVENUE' = 'QUANTITY'
) {
  return useQuery({
    queryKey: REPORT_KEYS.topItems(from, to, limit, sortBy),
    queryFn: () => reportService.getTopItems(from, to, limit, sortBy),
    enabled: !!from && !!to
  })
}

export function useSourceReport(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.source(from, to),
    queryFn: () => reportService.getBySource(from, to),
    enabled: !!from && !!to
  })
}

export function useHourlyTraffic(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.hourly(from, to),
    queryFn: () => reportService.getHourlyTraffic(from, to),
    enabled: !!from && !!to
  })
}

export function useTableUsageReport(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.tables(from, to),
    queryFn: () => reportService.getTableUsage(from, to),
    enabled: !!from && !!to
  })
}

// N2: Hook mới — hiệu quả khuyến mãi
export function usePromotionEffectiveness(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.promotionEffectiveness(from, to),
    queryFn: () => reportService.getPromotionEffectiveness(from, to),
    enabled: !!from && !!to
  })
}

// N3: Hook moi — thong ke goi nhan vien
export function useStaffCallStats(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.staffCalls(from, to),
    queryFn: () => reportService.getStaffCallStats(from, to),
    enabled: !!from && !!to
  })
}

// 1.4: Hook moi — hieu suat bep
export function useKitchenPerformance(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.kitchenPerformance(from, to),
    queryFn: () => reportService.getKitchenPerformance(from, to),
    enabled: !!from && !!to
  })
}

// 1.4: Hook moi — chi tiet don huy
export function useCancelledDrilldown(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.cancelledDrilldown(from, to),
    queryFn: () => reportService.getCancelledDrilldown(from, to),
    enabled: !!from && !!to
  })
}
