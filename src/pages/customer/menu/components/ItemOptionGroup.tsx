import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { IMenuItemOptionGroup, IMenuItemOption } from '../types'

interface ItemOptionGroupProps {
  group: IMenuItemOptionGroup
  selectedOptions: IMenuItemOption[]
  onToggleOption: (option: IMenuItemOption, isSingle: boolean) => void
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

export function ItemOptionGroup({ group, selectedOptions, onToggleOption }: ItemOptionGroupProps) {
  const { t } = useTranslation()
  const isSingle = group.type === 'SINGLE'
  const currentSelectedIds = selectedOptions.map(o => o.id)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-black text-slate-800 text-[15px]">{group.name}</h4>
          <span className="text-xs text-slate-400 font-medium">
            {isSingle ? t('customer.itemDetail.chooseOne') : t('customer.itemDetail.chooseMultiple')}
          </span>
        </div>
        {group.isRequired && (
          <span className="bg-orange-100 text-guest-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
            {t('customer.itemDetail.required')}
          </span>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {group.options.map((opt) => {
          const isSelected = currentSelectedIds.includes(opt.id)
          return (
            <label
              key={opt.id}
              className={`
                flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border-2
                ${isSelected
                  ? 'border-guest-primary bg-orange-50/60'
                  : 'border-slate-100 bg-white hover:border-slate-200'}
              `}
            >
              {/* Radio/Checkbox indicator */}
              <div className={`
                size-5 shrink-0 rounded-full flex items-center justify-center border-2 transition-all
                ${isSelected ? 'bg-guest-primary border-guest-primary' : 'border-slate-300 bg-white'}
              `}>
                {isSelected && <Check size={11} strokeWidth={3} className="text-white" />}
              </div>

              <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                {opt.name}
              </span>

              {opt.extraPrice > 0 && (
                <span className={`text-sm font-bold shrink-0 ${isSelected ? 'text-guest-primary' : 'text-slate-400'}`}>
                  +{fmt(opt.extraPrice)}đ
                </span>
              )}

              <input type="checkbox" className="hidden" checked={isSelected} onChange={() => onToggleOption(opt, isSingle)} />
            </label>
          )
        })}
      </div>
    </div>
  )
}
