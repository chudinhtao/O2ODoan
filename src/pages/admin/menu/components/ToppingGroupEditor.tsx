import { useTranslation } from 'react-i18next'
import { useFieldArray } from 'react-hook-form'
import { memo } from 'react'
import type { UseFormReturn, Control } from 'react-hook-form'
import type { MenuFormValues } from '../hooks/useMenuForm'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { Plus, Trash2, X } from 'lucide-react'

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
    <div className="space-y-6">
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
      
      <Button 
        type="button" 
        onClick={onAddGroup}
        variant="outline"
        className="w-full !py-3 border-dashed border-2 border-slate-200 text-primary hover:border-primary/50 hover:bg-primary/5 font-bold rounded-xl"
      >
        <Plus className="w-5 h-5 mr-1.5" />
        {t('admin.menu.form.addToppingGroup', 'Thêm Nhóm Tuỳ chọn mới')}
      </Button>
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
    <div className="p-5 border border-slate-200 rounded-xl bg-slate-50 relative group shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <Button 
        type="button" 
        onClick={() => removeGroup(gIndex)} 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 !text-slate-400 hover:!text-red-500 hover:!bg-red-50 !rounded-lg !p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Xoá nhóm"
      >
        <Trash2 className="w-5 h-5" />
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pr-10">
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
            {t('admin.menu.form.groupName', 'Tên nhóm Tuỳ chọn')}
          </label>
          <Input
            {...register(`optionGroups.${gIndex}.name` as const)}
            placeholder={t('admin.menu.form.groupNamePlaceholder', 'VD: Chọn Size, Thêm Topping')}
            className="!py-2.5 !rounded-lg bg-white"
            error={error?.name}
          />
        </div>

        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">
            {t('admin.menu.form.typeLabel', 'Quy tắc chọn')}
          </label>
          <Select
            {...register(`optionGroups.${gIndex}.type` as const)}
            className="!py-2.5 !rounded-lg bg-white"
            options={[
              { value: "SINGLE", label: t('admin.menu.form.typeSingle', 'Chỉ chọn 1 (Radio)') },
              { value: "MULTI", label: t('admin.menu.form.typeMulti', 'Chọn nhiều (Checkbox)') }
            ]}
          />
        </div>

        <div className="md:col-span-3 flex items-center pt-6">
          <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer select-none">
            <input 
              type="checkbox" 
              {...register(`optionGroups.${gIndex}.isRequired` as const)} 
              className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer" 
            />
            {t('admin.menu.form.isRequiredLabel', 'Bắt buộc chọn')}
          </label>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-200">
        <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wide">
          Danh sách lựa chọn
        </label>
        <div className="space-y-3">
          <ToppingOptionsRegister control={control} register={register} gIndex={gIndex} t={t} />
        </div>
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
      <div className="pt-2">
        <Button 
          type="button" 
          onClick={() => append({ name: '', extraPrice: 0 })} 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/90 hover:bg-primary/10 !px-3 !py-1.5 !rounded-lg font-bold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          {t('admin.menu.form.addOption', 'Thêm lựa chọn')}
        </Button>
      </div>
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
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <Input
          {...register(`optionGroups.${gIndex}.options.${oIndex}.name`)}
          placeholder={t('admin.menu.form.optionName', 'Tên lựa chọn (VD: Trân châu trắng)') as string}
          className="!py-2.5 !rounded-lg bg-white"
        />
      </div>
      <div className="w-[160px]">
        <NumberInput
          {...register(`optionGroups.${gIndex}.options.${oIndex}.extraPrice`, { valueAsNumber: true })}
          placeholder={t('admin.menu.form.extraPrice', 'Giá cộng thêm') as string}
          className="!py-2.5 !rounded-lg bg-white"
          suffix="đ"
        />
      </div>
      <Button 
        type="button" 
        onClick={() => remove(oIndex)} 
        variant="ghost" 
        size="icon" 
        className="!text-slate-400 hover:!text-red-500 hover:!bg-red-50 !rounded-lg !p-2.5 mt-[1px]"
        title="Xoá lựa chọn"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  )
})
