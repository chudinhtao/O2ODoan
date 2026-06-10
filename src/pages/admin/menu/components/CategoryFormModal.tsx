import { useTranslation } from 'react-i18next'
import { useCategoryForm } from '../hooks/useCategoryForm'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { Controller } from 'react-hook-form'
import { ImageUpload } from '@/shared/components/ImageUpload'

interface Props {
  isOpen: boolean
  onClose: () => void
  categoryId?: string | null
}

export function CategoryFormModal({ isOpen, onClose, categoryId }: Props) {
  const { t } = useTranslation()
  const { form, isEdit, isLoading, onSubmit } = useCategoryForm({ categoryId, isOpen, onClose })
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            {isEdit ? t('admin.categories.form.title.edit') : t('admin.categories.form.title.add')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
            <div className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              {t('admin.categories.loading')}
            </div>
          </div>
        ) : (
          <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wide px-1">
                {t('admin.categories.form.name')} <span className="text-red-500">*</span>
              </label>
              <Input 
                {...register('name')}
                autoFocus
                type="text" 
                className="!bg-white !py-3 !px-1!rounded-xl border border-slate-200 outline-none transition-all focus:!ring-primary/10 focus:border-primary !shadow-sm" 
                placeholder={t('admin.categories.form.namePlaceholder') as string}
                error={errors.name as any}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide px-1">
                  {t('admin.categories.form.displayOrder')}
                </label>
                <NumberInput 
                  {...register('displayOrder', { valueAsNumber: true })}
                  placeholder="0"
                  error={errors.displayOrder as any}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide px-1">
                  {t('admin.categories.form.taxRate', 'Thuế suất (%)')} <span className="text-red-500">*</span>
                </label>
                <NumberInput 
                  {...register('taxRate', { valueAsNumber: true })}
                  placeholder="8"
                  suffix="%"
                  error={errors.taxRate as any}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <Controller
                  name="imageUrl"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      label={t('admin.categories.form.image')}
                      value={field.value || ''}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

          </form>
        )}

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
          <Button 
            variant="outline"
            type="button" 
            onClick={onClose}
            className="flex-1 !py-3.5 !rounded-2xl !text-base font-semibold border-slate-200 text-slate-600 hover:bg-white transition-all shadow-sm"
          >
            {t('admin.menu.form.cancel')}
          </Button>
          <Button 
            variant="primary"
            type="submit" 
            form="category-form"
            isLoading={isSubmitting || isLoading}
            className="flex-1 !py-3.5 !rounded-2xl !text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            {isEdit ? t('admin.menu.form.save') : t('admin.menu.form.create')}
          </Button>
        </div>
      </div>
    </div>
  )
}
