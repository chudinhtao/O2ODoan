import { useTranslation } from 'react-i18next'
import { useMenuForm } from '../hooks/useMenuForm'
import { ToppingGroupEditor } from './ToppingGroupEditor'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { Toggle } from '@/shared/components/ui/Toggle'
import { Controller } from 'react-hook-form'
import { ImageUpload } from '@/shared/components/ImageUpload'
import { KitchenStationPicker } from './KitchenStationPicker'

interface Props {
  isOpen: boolean
  onClose: () => void
  itemId?: string | null
}

export function MenuFormModal({ isOpen, onClose, itemId }: Props) {
  const { t } = useTranslation()

  const {
    form,
    isEdit,
    isLoadingItem,
    categories,
    optionGroupsArray: { fields: groupFields, remove: removeGroup },
    onSubmit,
    handleCreateNewOptionGroup
  } = useMenuForm({ itemId, isOpen, onClose })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-display">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 h-[90vh]">
        {isLoadingItem && isEdit && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        )}
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isEdit ? t('admin.menu.form.title.edit') : t('admin.menu.form.title.add')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <form id="menu-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Basic Info */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide px-1">{t('admin.menu.table.name')}</label>
                  <Input
                    {...register('name')}
                    className="!py-3 !rounded-xl"
                    placeholder="VD: Cà phê sữa đá"
                    error={errors.name}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label={t('admin.menu.table.category')}
                    {...register('categoryId')}
                    error={errors.categoryId}
                    className="!py-3 !rounded-xl"
                    options={[
                      { label: '--', value: '' },
                      ...categories.map(c => ({ label: c.name, value: c.id }))
                    ]}
                  />
                  <NumberInput
                    {...register('basePrice', { valueAsNumber: true })}
                    label={t('admin.menu.table.basePrice')}
                    error={errors.basePrice}
                    className="!py-3 !rounded-xl"
                    suffix="đ"
                  />
                </div>

                {/* Kitchen Area Radio */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <KitchenStationPicker register={register} control={form.control as any} />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide px-1">{t('admin.menu.form.description')}</label>
                  <textarea
                    {...register('description')}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none text-slate-800 text-sm shadow-sm min-h-[120px]"
                    placeholder="Mô tả ngắn về sản phẩm..."
                    rows={4}
                  ></textarea>
                </div>
              </div>

              {/* Right Column: Image & Options */}
              <div className="space-y-8">
                {/* Image Upload */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <Controller
                    name="imageUrl"
                    control={form.control}
                    render={({ field }) => (
                      <ImageUpload
                        label={t('admin.menu.form.image')}
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-4 p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                  <Toggle
                    label={t('admin.menu.form.statusSelling')}
                    {...register('isAvailable')}
                  />
                  <Toggle
                    label={t('admin.menu.form.featured')}
                    {...register('isFeatured')}
                  />
                </div>
              </div>
            </div>

            {/* Topping Groups Array - Full Width Below */}
            <div className="pt-6 border-t border-slate-100">
               <ToppingGroupEditor form={form} groupFields={groupFields} removeGroup={removeGroup} onAddGroup={handleCreateNewOptionGroup} />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 shrink-0">
          <Button variant="outline" type="button" onClick={onClose} className="!px-8 !py-3 !rounded-xl !text-base border-slate-200 text-slate-600 hover:bg-white font-semibold shadow-sm transition-all">
            {t('admin.menu.form.cancel')}
          </Button>
          <Button variant="primary" type="submit" form="menu-form" isLoading={isSubmitting} className="!px-10 !py-3 !rounded-xl !text-base bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
            {isEdit ? t('admin.menu.form.save') : t('admin.menu.form.create')}
          </Button>
        </div>
      </div>
    </div>
  )
}
