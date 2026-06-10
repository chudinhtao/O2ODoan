import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncSelect } from '../ui/AsyncSelect'
import { useInventoryUomSearch } from '@/pages/admin/inventory/hooks/useInventoryQueries'

interface UomAsyncSelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

export default function UomAsyncSelect({
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled,
  className
}: UomAsyncSelectProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const { data: searchResponse, isLoading } = useInventoryUomSearch({ keyword: searchTerm, page: 0, size: 20 })

  const resolvedLabel = label !== undefined ? label : t('admin.inventory.item.uomLabel', 'Đơn vị tính (UoM) *')
  const resolvedPlaceholder = placeholder !== undefined ? placeholder : t('admin.inventory.item.selectUomPlaceholder', '-- Chọn đơn vị --')

  const uoms = searchResponse?.content || []
  const totalElements = searchResponse?.totalElements || 0

  const options = useMemo(() => {
    return uoms.map(u => ({ label: `${u.name} (${u.shortName})`, value: u.id }))
  }, [uoms])

  return (
    <AsyncSelect
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      value={value}
      onChange={(val) => onChange(String(val))}
      onSearch={setSearchTerm}
      options={options}
      totalElements={totalElements}
      isLoading={isLoading}
      error={error}
      disabled={disabled}
      className={className}
    />
  )
}
