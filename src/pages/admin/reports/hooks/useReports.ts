import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'

export const REPORT_KEYS = {
  all: ['reports'] as const,
  revenue: (from: string, to: string) => [...REPORT_KEYS.all, 'revenue', from, to] as const,
  topItems: (from: string, to: string, limit: number) => [...REPORT_KEYS.all, 'topItems', from, to, limit] as const,
  source: (from: string, to: string) => [...REPORT_KEYS.all, 'source', from, to] as const,
  hourly: (from: string, to: string) => [...REPORT_KEYS.all, 'hourly', from, to] as const,
  tables: (from: string, to: string) => [...REPORT_KEYS.all, 'tables', from, to] as const,
  shift: (date: string) => [...REPORT_KEYS.all, 'shift', date] as const,
}

export function useRevenueReport(from: string, to: string) {
  return useQuery({
    queryKey: REPORT_KEYS.revenue(from, to),
    queryFn: () => reportService.getRevenue(from, to),
    enabled: !!from && !!to
  })
}

export function useTopItemsReport(from: string, to: string, limit: number = 10) {
  return useQuery({
    queryKey: REPORT_KEYS.topItems(from, to, limit),
    queryFn: () => reportService.getTopItems(from, to, limit),
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
