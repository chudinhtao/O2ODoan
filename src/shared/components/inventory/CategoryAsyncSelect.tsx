import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncSelect } from '../ui/AsyncSelect'
import { useInventoryCategorySearch } from '@/pages/admin/inventory/hooks/useInventoryQueries'

interface CategoryAsyncSelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

export default function CategoryAsyncSelect({
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled,
  className
}: CategoryAsyncSelectProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const { data: searchResponse, isLoading } = useInventoryCategorySearch({ keyword: searchTerm, page: 0, size: 20 })

  const resolvedLabel = label !== undefined ? label : t('admin.inventory.item.colCategory', 'Danh mục')
  const resolvedPlaceholder = placeholder !== undefined ? placeholder : t('admin.inventory.item.selectCategoryPlaceholder', '-- Chọn danh mục --')

  const categories = searchResponse?.content || []
  const totalElements = searchResponse?.totalElements || 0

  const options = useMemo(() => {
    return categories.map(c => ({ label: c.name, value: c.id }))
  }, [categories])

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
