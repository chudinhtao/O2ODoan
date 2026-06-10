import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Pencil } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { IInventoryItem, ITEM_TYPE } from '../types/inventory.type'
import { useItemMutations } from '../hooks/useInventoryMutations'
import CategoryAsyncSelect from '@/shared/components/inventory/CategoryAsyncSelect'
import UomAsyncSelect from '@/shared/components/inventory/UomAsyncSelect'
import ItemTypeSelect from '@/shared/components/inventory/ItemTypeSelect'

const itemSchema = z.object({
  name: z.string().min(1, { message: 'admin.inventory.item.nameRequired' }),
  sku: z.string().optional(),
  type: z.nativeEnum(ITEM_TYPE),
  categoryId: z.string().optional(),
  baseUomId: z.string().min(1, { message: 'admin.inventory.item.uomRequired' }),
  safetyStock: z.number().min(0),
  avgCostPrice: z.number().min(0)
})

type ItemSchemaType = z.infer<typeof itemSchema>

interface ItemFormModalProps {
  isOpen: boolean
  onClose: () => void
  editItem?: IInventoryItem | null
}

export default function ItemFormModal({ isOpen, onClose, editItem }: ItemFormModalProps) {
  const { t } = useTranslation()
  const [isEditingSku, setIsEditingSku] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<ItemSchemaType>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      sku: '',
      type: ITEM_TYPE.RAW,
      categoryId: '',
      baseUomId: '',
      safetyStock: 0,
      avgCostPrice: 0
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        reset({
          name: editItem.name,
          sku: editItem.sku || '',
          type: editItem.type as any,
          categoryId: editItem.category?.id || '',
          baseUomId: editItem.baseUom?.id || '',
          safetyStock: editItem.safetyStock || 0,
          avgCostPrice: editItem.avgCostPrice || 0
        })
      } else {
        reset({
          name: '',
          sku: '',
          type: ITEM_TYPE.RAW,
          categoryId: '',
          baseUomId: '',
          safetyStock: 0,
          avgCostPrice: 0
        })
      }
    }
    if (!isOpen) {
      setIsEditingSku(false)
    }
  }, [isOpen, editItem, reset])

  const { create: createMutation, update: updateMutation } = useItemMutations()

  if (!isOpen) return null

  const onSubmit = (data: ItemSchemaType) => {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data: data as any }, {
        onSuccess: () => onClose()
      })
    } else {
      createMutation.mutate(data as any, {
        onSuccess: () => onClose()
      })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <form 
        id="item-form" 
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl shadow-xl w-full max-w-5xl min-h-[70vh] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">
            {editItem ? t('admin.inventory.item.form.editTitle') : t('admin.inventory.item.form.addTitle')}
          </h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 relative z-10 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="min-h-[90px]">
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                {t('admin.inventory.item.form.category')}
              </label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <CategoryAsyncSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    label=""
                    error={errors.categoryId?.message ? t(errors.categoryId.message) : undefined}
                  />
                )}
              />
            </div>

            <div className="min-h-[90px]">
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                {t('admin.inventory.item.form.uom')} <span className="text-red-500">*</span>
              </label>
              <Controller
                name="baseUomId"
                control={control}
                render={({ field }) => (
                  <UomAsyncSelect
                    value={field.value || ''}
                    onChange={field.onChange}
                    label=""
                    error={errors.baseUomId?.message ? t(errors.baseUomId.message) : undefined}
                  />
                )}
              />
            </div>

            <div className="md:col-span-2 min-h-[90px]">
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                {t('admin.inventory.item.form.itemName')} <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder={t('admin.inventory.item.form.itemNamePlaceholder')}
                error={errors.name}
              />
            </div>
            
            <div className="min-h-[90px]">
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                {t('admin.inventory.item.form.itemType')} <span className="text-red-500">*</span>
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <ItemTypeSelect
                    value={field.value}
                    onChange={field.onChange}
                    label=""
                    error={errors.type?.message ? t(errors.type.message) : undefined}
                  />
                )}
              />
            </div>

            <div className="min-h-[90px]">
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                {t('admin.inventory.item.form.sku')}
              </label>
              <div className="relative group">
                <Input
                  {...register('sku')}
                  placeholder={isEditingSku || editItem ? t('admin.inventory.item.form.skuPlaceholderManual') : t('admin.inventory.item.form.skuPlaceholderAuto')}
                  disabled={!isEditingSku && !editItem}
                  className={!isEditingSku && !editItem ? "bg-slate-50 text-slate-400 border-dashed" : ""}
                  error={errors.sku}
                />
                {!editItem && !isEditingSku && (
                  <button 
                    type="button"
                    onClick={() => setIsEditingSku(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-primary transition-colors"
                    title={t('admin.inventory.item.form.skuTooltipManual')}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="min-h-[90px]">
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                {t('admin.inventory.item.form.safetyStock')}
              </label>
              <Controller
                name="safetyStock"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    value={field.value}
                    onChange={e => field.onChange(Number(e.target.value))}
                    min={0}
                  />
                )}
              />
            </div>

            <div className="min-h-[90px]">
              <label className="text-sm font-semibold text-slate-700 mb-1 block">
                {t('admin.inventory.item.form.avgCostPrice')}
              </label>
              <Controller
                name="avgCostPrice"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    value={field.value}
                    onChange={e => field.onChange(Number(e.target.value))}
                    min={0}
                    step={1000}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('admin.inventory.item.form.cancel')}
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            className="min-w-[120px]"
          >
            {isPending ? t('admin.inventory.item.form.saving') : t('admin.inventory.item.form.save')}
          </Button>
        </div>
      </form>
    </div>
  )
}
