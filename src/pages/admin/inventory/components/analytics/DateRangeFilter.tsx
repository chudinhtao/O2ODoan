import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { Calendar } from 'lucide-react'

export type FilterType = 'last7' | 'month' | 'custom'

interface DateRangeFilterProps {
  filterType: FilterType
  onFilterTypeChange: (type: FilterType) => void
  customRange: { from: string; to: string }
  onCustomRangeChange: (range: { from: string; to: string }) => void
}

export default function DateRangeFilter({
  filterType,
  onFilterTypeChange,
  customRange,
  onCustomRangeChange
}: DateRangeFilterProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="flex items-center gap-1 bg-surface-raised p-1 rounded-xl shadow-sm border border-surface-dim">
        <Button
          variant={filterType === 'last7' ? 'primary' : 'ghost'}
          size="sm"
          className="!px-4 !py-2 rounded-lg text-xs font-semibold"
          onClick={() => onFilterTypeChange('last7')}
        >
          {t('admin.analytics.last_7_days', '7 ngày qua')}
        </Button>
        <Button
          variant={filterType === 'month' ? 'primary' : 'ghost'}
          size="sm"
          className="!px-4 !py-2 rounded-lg text-xs font-semibold"
          onClick={() => onFilterTypeChange('month')}
        >
          {t('admin.analytics.this_month')}
        </Button>
        <Button
          variant={filterType === 'custom' ? 'primary' : 'ghost'}
          size="sm"
          className="!px-4 !py-2 rounded-lg text-xs font-semibold"
          onClick={() => onFilterTypeChange('custom')}
        >
          {t('admin.analytics.custom_range', 'Tùy chọn')}
        </Button>
      </div>

      {filterType === 'custom' && (
        <div className="flex items-center gap-2 bg-surface-raised p-1.5 rounded-xl shadow-sm border border-surface-dim animate-in fade-in slide-in-from-left-2 duration-300">
          <Calendar className="w-4 h-4 text-on-surface-variant ml-2" />
          <input
            type="date"
            value={customRange.from}
            onChange={(e) => onCustomRangeChange({ ...customRange, from: e.target.value })}
            className="bg-transparent border-none text-xs font-medium focus:ring-0 px-2 text-on-surface"
          />
          <span className="text-surface-dim">→</span>
          <input
            type="date"
            value={customRange.to}
            onChange={(e) => onCustomRangeChange({ ...customRange, to: e.target.value })}
            className="bg-transparent border-none text-xs font-medium focus:ring-0 px-2 text-on-surface"
          />
        </div>
      )}
    </div>
  )
}
