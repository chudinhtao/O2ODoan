import { useState } from 'react'
import { Gift, Tag } from 'lucide-react'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import type { IPromotionEffectiveness } from '../types/report.type'

interface Props {
  data: IPromotionEffectiveness[]
  isLoading: boolean
}

export function PromotionEffectivenessList({ data, isLoading }: Props) {
  const [expanded, setExpanded] = useState(false)

  const displayLimit = expanded ? data.length : 5
  const displayData = data.slice(0, displayLimit)

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col min-w-0 h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <Gift size={20} className="text-primary"/>
          Hiệu quả khuyến mãi
        </h3>
      </div>

      <div className="flex-1 w-full">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-on-surface/40">
            <p>Không có dữ liệu khuyến mãi</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {displayData.map((item, index) => (
              <li key={item.promotionCode || index} className="flex flex-col gap-2 p-3 bg-surface rounded-xl border border-primary/10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag size={14} className="text-primary" />
                      {item.promotionCode}
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">{item.orderCount} đơn hàng áp dụng</span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-xs text-slate-500">Mang lại</span>
                    <span className="font-bold text-emerald-600">{item.grossRevenue.toLocaleString()} ₫</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-1">
                  <div className="text-xs">
                    <span className="text-slate-500">Đã giảm: </span>
                    <span className="font-semibold text-error">-{item.totalDiscountGiven.toLocaleString()} ₫</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500">TB đơn: </span>
                    <span className="font-medium text-slate-700">{item.avgOrderValue ? item.avgOrderValue.toLocaleString() : 0} ₫</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isLoading && data.length > 5 && (
          <div className="flex justify-center mt-4 border-t border-slate-200 pt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-primary font-semibold text-sm hover:underline"
            >
              {expanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
