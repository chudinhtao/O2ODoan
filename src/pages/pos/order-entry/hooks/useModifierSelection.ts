import { useState, useMemo, useEffect } from 'react'
import { IMenuItem, IOptionGroup } from '@/pages/admin/menu/types/adminMenu.type'
import { useServerTime } from '@/shared/hooks/useServerTime'

export function useModifierSelection(
  item: IMenuItem | null,
  isOpen: boolean,
  initialQuantity?: number,
  initialNote?: string,
  initialOptsArray?: string[]
) {
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({})
  const { isExpired } = useServerTime(5000);

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(initialQuantity ?? 1)
      setNote(initialNote ?? '')
      const initialOptions: Record<string, string[]> = {}
      item.optionGroups?.forEach(group => {
        if (initialOptsArray && initialOptsArray.length > 0) {
           const matchingOpts = group.options.filter(o => initialOptsArray.includes(o.id!)).map(o => o.id!)
           if (matchingOpts.length > 0) {
              initialOptions[group.id!] = matchingOpts
           }
        } else {
          if (group.type === 'SINGLE' && group.options.length > 0) {
            initialOptions[group.id!] = [group.options[0].id!]
          }
        }
      })
      setSelectedOptions(initialOptions)
    }
  }, [isOpen, item, initialQuantity, initialNote, initialOptsArray])

  const handleToggleOption = (group: IOptionGroup, optionId: string) => {
    setSelectedOptions(prev => {
      const currentGroup = prev[group.id!] || []
      if (group.type === 'SINGLE') {
        return { ...prev, [group.id!]: [optionId] }
      }
      if (currentGroup.includes(optionId)) {
        return { ...prev, [group.id!]: currentGroup.filter(id => id !== optionId) }
      }
      return { ...prev, [group.id!]: [...currentGroup, optionId] }
    })
  }

  const extraPrice = useMemo(() => {
    if (!item?.optionGroups) return 0
    let total = 0
    item.optionGroups.forEach(group => {
      const selected = selectedOptions[group.id!] || []
      selected.forEach(optId => {
        const opt = group.options.find(o => o.id === optId)
        if (opt) total += opt.extraPrice
      })
    })
    return total
  }, [item, selectedOptions])

  // Logic giá chuẩn đồng bộ Server
  const isSaleExpired = item?.saleEndAt ? isExpired(item.saleEndAt) : false
  const effectiveBasePrice = (item?.salePrice && item.salePrice < item.basePrice && !isSaleExpired)
    ? item.salePrice
    : (item?.basePrice ?? 0);

  const totalPrice = (effectiveBasePrice + extraPrice) * quantity

  const isValid = useMemo(() => {
    return item?.optionGroups?.filter(g => g.type === 'SINGLE' && g.isRequired).every(g => (selectedOptions[g.id!] || []).length > 0) ?? true
  }, [item, selectedOptions])

  const flatOptions = useMemo(() => Object.values(selectedOptions).flat(), [selectedOptions])

  const handleDecreaseQuantity = () => setQuantity(q => Math.max(1, q - 1))
  const handleIncreaseQuantity = () => setQuantity(q => q + 1)

  return {
    quantity,
    handleDecreaseQuantity,
    handleIncreaseQuantity,
    note,
    setNote,
    selectedOptions,
    handleToggleOption,
    totalPrice,
    isValid,
    flatOptions
  }
}
