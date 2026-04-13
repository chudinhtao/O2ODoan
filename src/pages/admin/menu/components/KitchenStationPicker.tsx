import { useTranslation } from 'react-i18next'
import { UseFormRegister, useWatch, Control } from 'react-hook-form'

interface Props {
  register: UseFormRegister<any>
  control: Control<any>
}

export function KitchenStationPicker({ register, control }: Props) {
  const { t } = useTranslation()
  const stationValue = useWatch({
    control,
    name: 'station'
  })
  
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-3">{t('admin.menu.form.kitchen')}</label>
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'HOT', value: 'HOT', icon: 'local_fire_department', labelKey: 'admin.menu.form.kitchenHot' },
          { key: 'COLD', value: 'COLD', icon: 'ac_unit', labelKey: 'admin.menu.form.kitchenCold' },
          { key: 'DRINK', value: 'DRINK', icon: 'local_cafe', labelKey: 'admin.menu.form.kitchenDrink' },
        ].map(k => {
          const isSelected = stationValue === k.value
          return (
            <label 
              key={k.key} 
              className={`group cursor-pointer border rounded-xl p-3 text-center flex flex-col items-center gap-1 transition-all hover:bg-slate-50 shadow-sm
                ${isSelected ? 'border-primary bg-primary/5' : 'border-slate-200'}
              `}
            >
              <input {...register('station')} value={k.value} className="hidden" type="radio" />
              <span className={`material-symbols-outlined text-[28px] mb-1 transition-colors
                ${isSelected ? 'text-primary' : 'text-slate-300'}
              `}>
                {k.icon}
              </span>
              <span className={`text-[11px] font-semibold ${isSelected ? 'text-primary' : 'text-slate-600'}`}>
                {t(k.labelKey)}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
