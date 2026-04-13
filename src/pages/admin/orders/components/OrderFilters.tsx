import { useTranslation } from 'react-i18next'
import { Select } from '@/shared/components/ui/Select'
import { Input } from '@/shared/components/ui/Input'
import { Filter, Search } from 'lucide-react'

interface Props {
  filters: {
    status: string
    source: string
    search: string
  }
  onFilterChange: (key: string, value: string) => void
}

export function OrderFilters({ filters, onFilterChange }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
        <Input
          placeholder={t('admin.orders.searchPlaceholder')}
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="pl-10 !h-10 text-sm w-full"
        />
      </div>
      
      <div className="flex gap-4">
        <Select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          options={[
            { value: '', label: t('admin.orders.status.all') },
            { value: 'OPEN', label: t('admin.orders.status.open') },
            { value: 'PAID', label: t('admin.orders.status.paid') },
            { value: 'CANCELLED', label: t('admin.orders.status.cancelled') },
          ]}
          className="w-[180px] !h-10 text-sm"
          icon={<Filter className="w-4 h-4 text-slate-400" />}
        />
        <Select
          value={filters.source}
          onChange={(e) => onFilterChange('source', e.target.value)}
          options={[
            { value: '', label: t('admin.orders.source.all') },
            { value: 'MANUAL', label: t('admin.orders.source.pos') },
            { value: 'QR', label: t('admin.orders.source.qr') },
          ]}
          className="w-[180px] !h-10 text-sm"
        />
      </div>
    </div>
  )
}
