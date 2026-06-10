import { UseFormReturn, UseFieldArrayReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Target, Package, Plus, Trash2, ShoppingCart, Gift } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import MenuItemAsyncSelect from '@/shared/components/menu/MenuItemAsyncSelect'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import type { PromotionFormValues } from '../../hooks/usePromotionForm'

interface Props {
  form: UseFormReturn<PromotionFormValues>
  bundleArray: UseFieldArrayReturn<PromotionFormValues, 'bundleItems'>
  categories: { id: string; name: string }[]
}

export function TargetBundleSection({ form, bundleArray, categories }: Props) {
  const { t } = useTranslation()
  const { register, watch, setValue, formState: { errors } } = form
  const currentScope = watch('scope')

  if (currentScope === 'ORDER') return null

  return (
    <div className={`rounded-lg shadow-sm border-2 p-6 space-y-5 ${
      currentScope === 'BUNDLE' ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'
    }`}>
      <h3 className={`text-base font-bold flex items-center gap-2 ${
        currentScope === 'BUNDLE' ? 'text-amber-800' : 'text-slate-800'
      }`}>
        {currentScope === 'BUNDLE' ? (
          <><Package className="w-5 h-5 text-amber-500" /> {t('admin.promotions.form.targetSection.bundleTitle', 'Cấu hình Bundle/Combo')}</>
        ) : (
          <><Target className="w-5 h-5 text-primary" /> {t('admin.promotions.form.targetSection.targetTitle', 'Món/Danh mục áp dụng (Target)')}</>
        )}
      </h3>

      {currentScope === 'PRODUCT' && (
        <div className="flex gap-4">
          <div className="w-1/3">
            <Select 
              {...register('targetType')} 
              options={[
                { value: "GLOBAL", label: t('admin.promotions.form.targetSection.global', 'Tất cả menu') as string },
                { value: "CATEGORY", label: t('admin.promotions.form.targetSection.category', 'Theo danh mục') as string },
                { value: "ITEM", label: t('admin.promotions.form.targetSection.item', 'Theo món cụ thể') as string }
              ]}
            />
          </div>

          {watch('targetType') === 'CATEGORY' && (
            <div className="flex-1">
              <Select 
                {...register('targetId')} 
                options={[
                  { value: "", label: t('admin.promotions.form.targetSection.selectCategory', '-- Chọn danh mục --') as string },
                  ...categories.map((c) => ({ value: c.id, label: c.name }))
                ]}
              />
            </div>
          )}

          {watch('targetType') === 'ITEM' && (
            <div className="flex-1">
              <MenuItemAsyncSelect 
                value={watch('targetId') || ''}
                onChange={(val) => setValue('targetId', String(val), { shouldValidate: true, shouldDirty: true })}
                placeholder={t('admin.promotions.form.targetSection.selectItem', '-- Chọn món ăn --') as string}
              />
            </div>
          )}
        </div>
      )}

      {currentScope === 'BUNDLE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-700">{t('admin.promotions.form.targetSection.bundleExample', 'Ví dụ: MUA 2 Trà Sữa (BUY) + ĐƯỢC 1 Bánh ngọt (GET) giá 0đ')}</p>
            <Button 
              type="button" 
              onClick={() => bundleArray.append({ itemId: '', quantity: 1, role: 'BUY' })} 
              className="h-8 px-3 text-xs bg-amber-500 hover:bg-amber-600 text-white !rounded-lg border-none shadow-sm flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> {t('admin.promotions.form.targetSection.addItemBtn', 'Thêm món')}
            </Button>
          </div>

          <div className="space-y-3">
            {bundleArray.fields.length === 0 && (
              <div className="p-6 border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-lg text-center">
                <Package className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-amber-700">{t('admin.promotions.form.targetSection.emptyBundle', 'Chưa có món nào, vui lòng thêm món vào Combo.')}</p>
              </div>
            )}
            
            {bundleArray.fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3 p-3 bg-white border border-amber-100 rounded-lg shadow-sm">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-[110px] shrink-0">
                      <button
                        type="button"
                        onClick={() => setValue(`bundleItems.${index}.role`, watch(`bundleItems.${index}.role`) === 'BUY' ? 'GET' : 'BUY', { shouldValidate: true, shouldDirty: true })}
                        className={`w-full h-10 px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold border transition-colors ${
                          watch(`bundleItems.${index}.role`) === 'BUY' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {watch(`bundleItems.${index}.role`) === 'BUY' ? (
                          <><ShoppingCart className="w-3.5 h-3.5"/> {t('admin.promotions.form.targetSection.buyRoleText', 'MUA')}</>
                        ) : (
                          <><Gift className="w-3.5 h-3.5"/> {t('admin.promotions.form.targetSection.getRoleText', 'TẶNG')}</>
                        )}
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <MenuItemAsyncSelect 
                        value={watch(`bundleItems.${index}.itemId`) || ''}
                        onChange={(val) => setValue(`bundleItems.${index}.itemId`, String(val), { shouldValidate: true, shouldDirty: true })}
                        placeholder={t('admin.promotions.form.targetSection.selectBundleItem', '-- Chọn món --') as string}
                      />
                    </div>

                    <div className="w-[120px] shrink-0">
                      <NumberInput
                        {...register(`bundleItems.${index}.quantity` as const, { valueAsNumber: true })}
                        placeholder="1"
                        prefix={t('admin.promotions.form.targetSection.quantityPrefix', 'SL:')}
                      />
                    </div>
                  </div>
                  {errors.bundleItems?.[index]?.itemId && (
                    <p className="text-xs text-red-500 ml-1">{errors.bundleItems[index]?.itemId?.message}</p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="icon"
                  onClick={() => bundleArray.remove(index)}
                  className="!p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 bg-slate-50 border border-slate-100 mt-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
