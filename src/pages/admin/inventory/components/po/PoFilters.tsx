import { useTranslation } from 'react-i18next'
import { Select } from '@/shared/components/ui/Select'

interface PoFiltersProps {
  statusFilter: string; setStatusFilter: (v: string) => void
  typeFilter: string;   setTypeFilter: (v: string) => void
  startDate: string;    setStartDate: (v: string) => void
  endDate: string;      setEndDate: (v: string) => void
}

export function PoFilters({ statusFilter, setStatusFilter, typeFilter, setTypeFilter, startDate, setStartDate, endDate, setEndDate }: PoFiltersProps) {
  const { t } = useTranslation()
  
  return (
    <div className="flex items-center gap-2">
      <Select
        value={statusFilter}
        onChange={(e: any) => setStatusFilter(e.target.value)}
        options={[
          { value: '', label: t('admin.inventory.po.filterStatusAll', 'Tất cả trạng thái') },
          { value: 'DRAFT', label: t('admin.inventory.po.statusDraft', 'Nháp') },
          { value: 'CONFIRMED', label: t('admin.inventory.po.statusConfirmed', 'Đã chốt') },
          { value: 'PARTIAL_RECEIVED', label: t('admin.inventory.po.statusPartial', 'Nhận một phần') },
          { value: 'COMPLETED', label: t('admin.inventory.po.statusCompleted', 'Hoàn thành') },
          { value: 'CANCELLED', label: t('admin.inventory.po.statusCancelled', 'Đã hủy') },
        ]}
        className="!h-9 !text-xs !w-44 border-none !bg-slate-50 focus:!ring-1 focus:!ring-primary/30"
      />
      <Select
        value={typeFilter}
        onChange={(e: any) => setTypeFilter(e.target.value)}
        options={[
          { value: '', label: t('admin.inventory.po.filterTypeAll', 'Tất cả loại') },
          { value: 'STANDARD', label: t('admin.inventory.po.typeStd', 'Tiêu chuẩn') },
          { value: 'QUICK_GRN', label: t('admin.inventory.po.typeQuick', 'Nhập nhanh') },
        ]}
        className="!h-9 !text-xs !w-36 border-none !bg-slate-50 focus:!ring-1 focus:!ring-primary/30"
      />
      <div className="flex items-center gap-2">
        <input 
          type="date"
          className="h-9 px-2 bg-slate-50 border-none rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30 shadow-sm"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          title={t('common.fromDate', 'Từ ngày')}
        />
        <span className="text-slate-300 text-xs">—</span>
        <input 
          type="date"
          className="h-9 px-2 bg-slate-50 border-none rounded-md text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/30 shadow-sm"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          title={t('common.toDate', 'Đến ngày')}
          min={startDate}
        />
      </div>
    </div>
  )
}
