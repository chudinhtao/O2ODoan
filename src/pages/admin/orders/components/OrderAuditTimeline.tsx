import { useTranslation } from 'react-i18next'
import { IAuditLog } from '../types/order.type'

interface Props {
  timeline: IAuditLog[]
}

import { useStaff } from '../../staff/hooks/useStaff'

export function OrderAuditTimeline({ timeline }: Props) {
  const { t } = useTranslation()
  const { staff } = useStaff()

  if (!timeline || timeline.length === 0) return null

  const getActorName = (userId: string, role: string) => {
    if (role === 'CUSTOMER') return t('admin.orders.detail.customer', 'Khách hàng')
    const cashier = staff?.find(s => s.id === userId)
    return cashier ? cashier.fullName : `ID: ${userId?.slice(0, 6) || 'System'}`
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          {t('admin.orders.detail.auditTimeline', 'Lịch sử tác động')}
        </h2>
      </div>
      <div>
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
          {timeline.map((log) => (
            <div key={log.id} className="relative pl-6">
              <div className="absolute -left-2.5 top-1 size-4 rounded-full bg-slate-50 border-2 border-slate-300 z-10" />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">{log.actionName}</span>
                <span className="text-xs font-medium text-slate-500 mt-1">
                  {new Date(log.createdAt).toLocaleString('vi-VN')}
                </span>
                {log.details && (
                  <span className="text-xs text-slate-600 mt-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100 leading-relaxed inline-block max-w-lg">
                    {log.details}
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                  {t('admin.orders.detail.actor', 'Người thao tác')}: <span className="text-slate-600">{getActorName(log.userId, log.role)}</span> ({log.role})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
