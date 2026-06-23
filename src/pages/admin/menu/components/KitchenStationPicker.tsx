import { useTranslation } from 'react-i18next'
import { UseFormRegister, useWatch, Control } from 'react-hook-form'

import type { MenuFormValues } from '../hooks/useMenuForm'

interface Props {
  register: UseFormRegister<MenuFormValues>
  control: Control<MenuFormValues>
}

export function KitchenStationPicker({ register, control }: Props) {
  const { t } = useTranslation()
  const stationValue = useWatch({
    control,
    name: 'station'
  })
  
  return (
    <>
      <label className="block text-sm font-semibold text-slate-700">{t('admin.menu.form.kitchen', 'Khu vực bếp (Station)')}</label>
      <div className="flex bg-slate-100/80 p-1 rounded-lg w-full">
        {[
          { key: 'HOT', value: 'HOT', icon: 'local_fire_department', labelKey: 'admin.menu.form.kitchenHot', defaultText: 'Bếp Nóng' },
          { key: 'COLD', value: 'COLD', icon: 'ac_unit', labelKey: 'admin.menu.form.kitchenCold', defaultText: 'Bếp Lạnh' },
          { key: 'DRINK', value: 'DRINK', icon: 'local_cafe', labelKey: 'admin.menu.form.kitchenDrink', defaultText: 'Quầy Pha Chế' },
          { key: 'RETAIL', value: 'RETAIL', icon: 'inventory_2', labelKey: 'admin.menu.form.kitchenRetail', defaultText: 'Bán Lẻ' },
        ].map(k => {
          const isSelected = stationValue === k.value
          return (
            <label 
              key={k.key} 
              className={`flex-1 flex items-center justify-center py-2 px-2 text-[13px] rounded-md cursor-pointer transition-all select-none
                ${isSelected ? 'bg-white shadow-sm text-primary font-bold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
              `}
            >
              <input {...register('station')} value={k.value} className="hidden" type="radio" />
              <span className={`material-symbols-outlined text-[16px] mr-1.5 transition-colors
                ${isSelected ? 'text-primary' : 'text-slate-400'}
              `}>
                {k.icon}
              </span>
              <span>{t(k.labelKey, k.defaultText)}</span>
            </label>
          )
        })}
      </div>
    </>
  )
}
