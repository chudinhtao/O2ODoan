import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { useMenuForm } from '../hooks/useMenuForm'
import { ToppingGroupEditor } from '../components/ToppingGroupEditor'
import { KitchenStationPicker } from '../components/KitchenStationPicker'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { NumberInput } from '@/shared/components/ui/NumberInput'
import { Toggle } from '@/shared/components/ui/Toggle'
import { ImageUpload } from '@/shared/components/ImageUpload'
import { ROUTES } from '@/shared/constants/ROUTES'

export default function MenuFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const handleGoBack = () => navigate(ROUTES.admin.menu)

  const {
    form,
    isEdit,
    isLoadingItem,
    categories,
    optionGroupsArray: { fields: groupFields, remove: removeGroup },
    onSubmit,
    handleCreateNewOptionGroup
  } = useMenuForm({ itemId: id || null, onSuccess: handleGoBack })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  return (
    <>
      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-surface-dim flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold font-display text-on-surface">
            {isEdit ? t('admin.menu.form.title.edit') : t('admin.menu.form.title.add')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={handleGoBack}
            className="!px-6 !py-2 !rounded-xl !text-sm border-slate-200 text-slate-600 hover:bg-white font-semibold shadow-sm"
          >
            {t('admin.menu.form.cancel')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="menu-form"
            isLoading={isSubmitting}
            className="!px-6 !py-2 !rounded-xl !text-sm bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            {isEdit ? t('admin.menu.form.save') : t('admin.menu.form.create')}
          </Button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoadingItem && isEdit ? (
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <form id="menu-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* ── Main Column (Left - 2/3) ── */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                    {t('admin.menu.form.basicInfo', 'Thông tin cơ bản')}
                  </h3>

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

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide px-1">{t('admin.menu.form.description')}</label>
                    <textarea
                      {...register('description')}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-slate-800 text-sm shadow-sm min-h-[120px]"
                      placeholder="Mô tả ngắn về sản phẩm..."
                      rows={4}
                    ></textarea>
                  </div>
                </div>

                {/* Kitchen Station */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <KitchenStationPicker register={register} control={form.control as any} />
                </div>

                {/* Topping Groups */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <ToppingGroupEditor form={form} groupFields={groupFields} removeGroup={removeGroup} onAddGroup={handleCreateNewOptionGroup} />
                </div>
              </div>

              {/* ── Sidebar Column (Right - 1/3) ── */}
              <div className="lg:col-span-1 space-y-6 sticky top-8">
                {/* Image Upload */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
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
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                    {t('admin.menu.form.options', 'Tùy chọn')}
                  </h3>
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

            </form>
          </div>
        )}
      </div>
    </>
  )
}
