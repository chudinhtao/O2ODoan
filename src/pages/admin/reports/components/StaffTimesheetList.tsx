import { useTranslation } from 'react-i18next'
import { Users, Crown, ChefHat, Headphones } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import type { IStaffTimesheet } from '../types/report.type'

interface Props {
  data: IStaffTimesheet[]
  isLoading: boolean
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  CASHIER:  { label: 'Thu ngân',  color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
  KITCHEN:  { label: 'Bếp',      color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-100' },
  SERVER:   { label: 'Phục vụ',   color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-100' },
}

function RoleActivityMetric({ staff }: { staff: IStaffTimesheet }) {
  const { t } = useTranslation()

  if (staff.role === 'CASHIER') {
    return (
      <div className="flex gap-6 items-center">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {t('admin.analytics.revenue_generated', 'Doanh thu')}
          </span>
          <span className="font-bold text-emerald-600 tabular-nums">
            {(staff.totalRevenue ?? 0).toLocaleString()} ₫
          </span>
        </div>
        <div className="flex flex-col items-end min-w-[80px]">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {t('admin.analytics.rph', 'RPH')}
          </span>
          <span className="font-bold text-slate-800 tabular-nums">
            {(staff.revenuePerHour ?? 0).toLocaleString()} ₫/h
          </span>
        </div>
      </div>
    )
  }

  if (staff.role === 'KITCHEN') {
    return (
      <div className="flex gap-6 items-center">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {t('admin.analytics.items_prepared', 'Món đã nấu')}
          </span>
          <span className="font-bold text-orange-600 tabular-nums flex items-center gap-1.5">
            <ChefHat size={14} />
            {(staff.itemsPrepared ?? 0).toLocaleString()} {t('admin.analytics.items_unit', 'món')}
          </span>
        </div>
      </div>
    )
  }

  if (staff.role === 'SERVER') {
    return (
      <div className="flex gap-6 items-center">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {t('admin.analytics.calls_resolved', 'Yêu cầu xử lý')}
          </span>
          <span className="font-bold text-blue-600 tabular-nums flex items-center gap-1.5">
            <Headphones size={14} />
            {(staff.callsResolved ?? 0).toLocaleString()} {t('admin.analytics.calls_unit', 'lượt')}
          </span>
        </div>
      </div>
    )
  }

  return null
}

export function StaffTimesheetList({ data, isLoading }: Props) {
  const { t } = useTranslation()

  // Sap xep theo totalWorkingHours giam dan (chung cho moi role)
  const sortedData = [...data].sort((a, b) => b.totalWorkingHours - a.totalWorkingHours)
  const bestCashier = sortedData.find(s => s.role === 'CASHIER' && (s.revenuePerHour ?? 0) > 0)

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
        <Users size={20} className="text-primary" />
        {t('admin.analytics.staff_productivity', 'Năng suất nhân sự (Chấm công & Hoạt động)')}
      </h3>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            {t('admin.analytics.no_data', 'Chưa có dữ liệu')}
          </div>
        ) : (
          <div className="space-y-3">
            {sortedData.map((staff) => {
              const isBestCashier = bestCashier && staff.staffId === bestCashier.staffId
              const roleConf = ROLE_CONFIG[staff.role] ?? { label: staff.role, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-100' }
              
              return (
                <div key={staff.staffId} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      {staff.staffName}
                      {isBestCashier && <Crown size={16} className="text-yellow-500" />}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${roleConf.bg} ${roleConf.color}`}>
                        {roleConf.label}
                      </span>
                      <span className="text-xs text-slate-500">
                        {staff.totalShifts} {t('admin.analytics.shifts', 'ca')} • {staff.totalWorkingHours}h
                      </span>
                    </div>
                  </div>
                  
                  <RoleActivityMetric staff={staff} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
