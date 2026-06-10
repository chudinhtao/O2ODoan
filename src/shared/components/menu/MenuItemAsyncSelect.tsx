import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AsyncSelect } from '../ui/AsyncSelect'
import { useAdminMenuItems, useAdminMenuItem } from '@/pages/admin/menu/hooks/useMenuQueries'

interface MenuItemAsyncSelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

export default function MenuItemAsyncSelect({
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled,
  className
}: MenuItemAsyncSelectProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  
  // 1. Search items by keyword (limit 20)
  const { data: searchResponse, isLoading: isSearching } = useAdminMenuItems({
    keyword: searchTerm || undefined,
    size: 20,
    isActive: true
  })
  
  // 2. Fetch the currently selected item if it's not in the search results
  const isValueLoaded = searchResponse?.content?.some(item => item.id === value)
  const { data: selectedItem, isLoading: isLoadingSelected } = useAdminMenuItem(
    value && !isValueLoaded ? value : null
  )

  const items = searchResponse?.content || []
  const totalElements = searchResponse?.totalElements || 0

  const options = useMemo(() => {
    const list = items.map(i => ({ label: i.name, value: i.id }))
    if (selectedItem && !list.some(opt => opt.value === selectedItem.id)) {
      list.push({ label: selectedItem.name, value: selectedItem.id })
    }
    return list
  }, [items, selectedItem])

  return (
    <AsyncSelect
      label={label}
      placeholder={placeholder || t('admin.promotions.form.targetSection.selectItem', '-- Chọn món ăn --')}
      value={value}
      onChange={(val) => onChange(String(val))}
      onSearch={setSearchTerm}
      options={options}
      totalElements={totalElements}
      isLoading={isSearching || isLoadingSelected}
      error={error}
      disabled={disabled}
      className={className}
    />
  )
}
