import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import type { ITopItemTarget } from '../types/report.type'

interface TopItemsListProps {
  data: ITopItemTarget[]
  isLoading: boolean
  isDashboard?: boolean
}

export const TopItemsList = ({ data, isLoading, isDashboard = false }: TopItemsListProps) => {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const displayLimit = isDashboard ? 5 : (expanded ? data.length : 5)
  const displayData = data.slice(0, displayLimit)

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col min-w-0 h-full">
      <h3 className="text-lg font-bold text-on-surface mb-3 flex items-center gap-2">
        <Trophy size={20} className="text-primary"/>
        {t('admin.dashboard.top_items')}
      </h3>

      <div className="flex-1 w-full">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-on-surface/40">
            <p>{t('admin.dashboard.no_item_data')}</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {displayData.map((item: ITopItemTarget, index: number) => (
              <li key={item.itemName || index} className="flex items-center justify-between gap-2 overflow-hidden">
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-on-surface truncate" title={item.itemName}>
                    {index + 1}. {item.itemName}
                  </span>
                  <span className="text-xs text-on-surface/50">{item.totalSold} {t('admin.dashboard.sold')}</span>
                </div>
                <span className="font-bold text-primary flex-shrink-0">
                  {item.revenue.toLocaleString()} ₫
                </span>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && data.length > 5 && !isDashboard && (
          <div className="flex justify-center mt-4 border-t border-slate-200 pt-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-primary font-semibold text-sm hover:underline"
            >
              {expanded ? t('common.showLess', 'Show less') : t('common.showMore', 'Show more')}
            </button>
          </div>
        )}

        {!isLoading && isDashboard && (
          <div className="flex justify-center mt-4 border-t border-slate-200 pt-4">
            <Link
              to="/admin/reports"
              className="text-primary font-semibold text-sm hover:underline"
            >
              {t('admin.dashboard.viewDetailedReport')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
