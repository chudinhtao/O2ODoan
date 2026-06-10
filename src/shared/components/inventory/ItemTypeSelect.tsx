import { useTranslation } from 'react-i18next'
import { Select } from '@/shared/components/ui/Select'
import { ITEM_TYPE } from '@/pages/admin/inventory/types/inventory.type'

interface ItemTypeSelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
}

export default function ItemTypeSelect({
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled,
  className
}: ItemTypeSelectProps) {
  const { t } = useTranslation()

  const resolvedLabel = label !== undefined ? label : t('admin.inventory.item.colType', 'Loại mặt hàng')
  const resolvedPlaceholder = placeholder !== undefined ? placeholder : t('admin.inventory.item.allTypes', 'Tất cả loại')

  return (
    <Select
      label={resolvedLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={[
        { label: resolvedPlaceholder, value: '' },
        { label: t('admin.inventory.item.typeRaw', 'Nguyên vật liệu (RAW)'), value: ITEM_TYPE.RAW },
        { label: t('admin.inventory.item.typeRetail', 'Hàng bán lẻ (RETAIL)'), value: ITEM_TYPE.RETAIL },
        { label: t('admin.inventory.item.typeConsumable', 'Hàng tiêu hao (CONSUMABLE)'), value: ITEM_TYPE.CONSUMABLE }
      ]}
      error={error as any}
      disabled={disabled}
      className={className}
    />
  )
}
