import { useTranslation } from 'react-i18next'
import { useFieldArray } from 'react-hook-form'
import { memo } from 'react'
import type { UseFormReturn, Control } from 'react-hook-form'
import type { MenuFormValues } from '../hooks/useMenuForm'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import { NumberInput } from '@/shared/components/ui/NumberInput'

interface Props {
  form: UseFormReturn<MenuFormValues>
  groupFields: Record<"id", string>[]
  removeGroup: (index: number) => void
  onAddGroup: () => void
}

export const ToppingGroupEditor = memo(({ form, groupFields, removeGroup, onAddGroup }: Props) => {
  const { t } = useTranslation()
  const { register, control } = form

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">{t('admin.menu.form.toppingGroupTitle')}</label>
        <Button 
          type="button" 
          onClick={onAddGroup}
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 hover:bg-primary/5"
        >
          <span className="material-symbols-outlined text-[16px] mr-1.5">add_circle</span>
          {t('admin.menu.form.addToppingGroup')}
        </Button>
      </div>

      {groupFields.map((field, gIndex) => (
        <OptionGroupItem 
          key={field.id}
          gIndex={gIndex}
          register={register}
          control={control}
          removeGroup={removeGroup}
          t={t}
          error={form.formState.errors.optionGroups?.[gIndex]}
        />
      ))}
    </div>
  )
})

interface OptionGroupItemProps {
  gIndex: number
  register: any
  control: Control<MenuFormValues>
  removeGroup: (index: number) => void
  t: any
  error: any
}

const OptionGroupItem = memo(({ gIndex, register, control, removeGroup, t, error }: OptionGroupItemProps) => {
  return (
    <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3 relative shadow-sm">
      <Button type="button" onClick={() => removeGroup(gIndex)} variant="icon" size="icon" className="absolute top-2 right-2 p-1 text-[18px] material-symbols-outlined text-slate-400 hover:text-red-500 hover:bg-red-50">
        delete
      </Button>
      
      <Input
        label={t('admin.menu.form.groupName') as string}
        {...register(`optionGroups.${gIndex}.name` as const)}
        placeholder={t('admin.menu.form.groupNamePlaceholder') as string}
        className="!py-2 !px-3 !text-sm border !border-slate-200 focus:!ring-primary/20 bg-white"
        error={error?.name}
      />

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
          <input type="checkbox" {...register(`optionGroups.${gIndex}.isRequired` as const)} className="rounded text-primary focus:ring-primary/20 cursor-pointer" />
          {t('admin.menu.form.isRequiredLabel')}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 mr-2">{t('admin.menu.form.typeLabel')}</span>
          <div className="w-32">
            <Select
               {...register(`optionGroups.${gIndex}.type` as const)}
               className="!py-1.5 !pr-8 !text-xs !rounded-lg"
               options={[
                 { value: "SINGLE", label: t('admin.menu.form.typeSingle') },
                 { value: "MULTI", label: t('admin.menu.form.typeMulti') }
               ]}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-slate-200 mt-2">
        <ToppingOptionsRegister control={control} register={register} gIndex={gIndex} t={t} />
      </div>
    </div>
  )
})

const ToppingOptionsRegister = memo(({ control, register, gIndex, t }: { control: any, register: any, gIndex: number, t: any }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `optionGroups.${gIndex}.options`
  })

  return (
    <>
      {fields.map((optField, oIndex) => (
        <OptionItem 
          key={optField.id}
          gIndex={gIndex}
          oIndex={oIndex}
          register={register}
          remove={remove}
          t={t}
        />
      ))}
      <Button type="button" onClick={() => append({ name: '', extraPrice: 0 })} variant="ghost" size="sm" className="text-primary hover:text-primary/80 mt-2 p-0 px-1 justify-start">
        + {t('admin.menu.form.addOption')}
      </Button>
    </>
  )
})

const OptionItem = memo(({ gIndex, oIndex, register, remove, t }: { 
  gIndex: number, 
  oIndex: number, 
  register: any, 
  remove: (idx: number) => void, 
  t: any 
}) => {
  return (
    <div className="flex items-start gap-2">
      <div className="flex-1">
        <Input
          {...register(`optionGroups.${gIndex}.options.${oIndex}.name`)}
          placeholder={t('admin.menu.form.optionName') as string}
          className="!py-1.5 !px-3 !text-xs border !border-slate-200 focus:!ring-2 focus:!ring-primary/20 bg-white"
        />
      </div>
      <div className="w-32">
        <NumberInput
          {...register(`optionGroups.${gIndex}.options.${oIndex}.extraPrice`, { valueAsNumber: true })}
          placeholder={t('admin.menu.form.extraPrice') as string}
          className="!py-1.5 !px-3 !text-xs !bg-white"
          suffix="đ"
        />
      </div>
      <Button type="button" onClick={() => remove(oIndex)} variant="icon" size="icon" className="p-1 material-symbols-outlined text-[16px] leading-tight mt-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50">
        remove
      </Button>
    </div>
  )
})
