import { useTranslation } from 'react-i18next'
import { BellRing, Zap, UtensilsCrossed } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Badge } from '@/shared/components/ui/Badge'
import type { IServerPerformance } from '../types/report.type'

interface Props {
  data: IServerPerformance[]
  isLoading: boolean
}

export function ServerPerformanceList({ data, isLoading }: Props) {
  const { t } = useTranslation()

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <h3 className="text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
        <BellRing size={20} className="text-primary" />
        {t('admin.analytics.server_kpi', 'KPI Phục vụ (Hỗ trợ & Trả món)')}
      </h3>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            {t('admin.analytics.no_data', 'Chưa có dữ liệu')}
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((server) => {
              const isLightningCall = server.avgResponseSeconds < 30
              const isLightningDelivery = server.avgDeliverySeconds > 0 && server.avgDeliverySeconds < 120
              
              return (
                <div key={server.serverId} className="flex flex-col p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      {server.serverName}
                      {(isLightningCall || isLightningDelivery) && (
                        <span title="Phục vụ siêu tốc">
                          <Zap size={16} className="text-yellow-500 fill-yellow-500" />
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">
                        📞 {server.totalCallsResolved}
                      </Badge>
                      <Badge variant="success">
                        <UtensilsCrossed size={12} className="mr-1" /> {server.totalItemsServed}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="flex flex-col bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-xs uppercase font-bold text-slate-400">{t('admin.analytics.response_speed', 'Tốc độ tiếp nhận')}</span>
                      <span className={`font-bold ${isLightningCall ? 'text-green-600' : 'text-slate-700'}`}>
                        {server.avgResponseSeconds.toFixed(0)} {t('admin.analytics.seconds', 'giây')}
                      </span>
                    </div>
                    <div className="flex flex-col bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-xs uppercase font-bold text-slate-400">{t('admin.analytics.delivery_speed', 'Thời gian bưng món')}</span>
                      <span className={`font-bold ${isLightningDelivery ? 'text-green-600' : 'text-slate-700'}`}>
                        {server.avgDeliverySeconds > 0 ? `${server.avgDeliverySeconds.toFixed(0)} ${t('admin.analytics.seconds', 'giây')}` : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
