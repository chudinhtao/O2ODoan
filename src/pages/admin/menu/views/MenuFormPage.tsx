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
    <div className="flex flex-col h-full overflow-hidden bg-[#F8F9FD]">
      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoBack}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">
              {isEdit ? t('admin.menu.form.title.edit', 'Cập nhật Sản phẩm') : t('admin.menu.form.title.add', 'Thêm Sản phẩm Mới')}
            </h2>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <span>{t('admin.nav.menu', 'Thực đơn')}</span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-primary">{isEdit ? t('admin.menu.form.title.edit', 'Cập nhật') : t('admin.menu.form.title.add', 'Thêm mới')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {isLoadingItem && isEdit ? (
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        ) : (
          <div className="w-full px-4 md:px-6 lg:px-8 py-6 pb-28">
            <form id="menu-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* ── Card 1: Products Description ── */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t('admin.menu.form.basicInfo', 'Thông tin cơ bản')}</h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('admin.menu.table.name', 'Tên sản phẩm')}</label>
                    <Input
                      {...register('name')}
                      placeholder={t('admin.menu.form.namePlaceholder', 'Nhập tên sản phẩm') as string}
                      error={errors.name}
                      className="!py-2.5 !rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700">{t('admin.menu.table.category', 'Danh mục')}</label>
                      <Select
                        {...register('categoryId')}
                        error={errors.categoryId}
                        className="!py-2.5 !rounded-lg"
                        options={[
                          { label: t('admin.menu.form.categoryPlaceholder', 'Chọn danh mục') as string, value: '' },
                          ...categories.map(c => ({ label: c.name, value: c.id }))
                        ]}
                      />
                    </div>
                    {/* Station */}
                    <div className="space-y-2">
                       <KitchenStationPicker register={register} control={form.control} />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('admin.menu.form.description', 'Mô tả')}</label>
                    <textarea
                      {...register('description')}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y text-slate-800 text-sm shadow-sm min-h-[120px]"
                      placeholder={t('admin.menu.form.descPlaceholder', 'Thông tin thêm (tuỳ chọn)...') as string}
                      rows={4}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* ── Card 2: Pricing & Availability ── */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t('admin.menu.form.pricingAvailability', 'Định giá & Phục vụ')}</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Base Price */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('admin.menu.table.basePrice', 'Giá bán (VND)')}</label>
                      <NumberInput
                        {...register('basePrice', { valueAsNumber: true })}
                        error={errors.basePrice}
                        className="!py-2.5 !rounded-lg"
                        suffix="đ"
                      />
                    </div>
                    {/* Tax Rate */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('admin.menu.form.taxRate', 'Thuế suất (%)')}</label>
                      <NumberInput
                        {...register('taxRate', { valueAsNumber: true })}
                        error={errors.taxRate}
                        className="!py-2.5 !rounded-lg"
                        suffix="%"
                      />
                    </div>
                    {/* Featured */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('admin.menu.form.featured', 'Nổi bật')}</label>
                      <div className="h-[42px] flex items-center border border-slate-200 rounded-lg px-4">
                        <Toggle
                          label={t('admin.menu.form.markFeatured', 'Đánh dấu nổi bật') as string}
                          {...register('isFeatured')}
                        />
                      </div>
                    </div>
                    {/* Availability Status */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('admin.menu.form.statusSelling', 'Trạng thái Phục vụ')}</label>
                      <div className="h-[42px] flex items-center border border-slate-200 rounded-lg px-4">
                        <Toggle
                          label={t('admin.menu.form.markAvailable', 'Đang phục vụ') as string}
                          {...register('isAvailable')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Card 3: Products Images ── */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t('admin.menu.form.image', 'Hình ảnh sản phẩm')}</h3>
                </div>
                <div className="p-6">
                  <Controller
                    name="imageUrl"
                    control={form.control}
                    render={({ field }) => (
                      <ImageUpload
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <p className="text-center text-xs text-slate-400 mt-3">
                    {t('admin.menu.form.imageHint', 'Click to upload or drag and drop SVG, PNG, JPG or GIF (MAX. 800x400px)')}
                  </p>
                </div>
              </div>

              {/* ── Card 4: Advanced Options (Toppings) ── */}
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">{t('admin.menu.form.toppingGroupTitle', 'Tuỳ chọn & Topping')}</h3>
                </div>
                <div className="p-6">
                  <ToppingGroupEditor form={form} groupFields={groupFields} removeGroup={removeGroup} onAddGroup={handleCreateNewOptionGroup} />
                </div>
              </div>

            </form>
          </div>
        )}

        {/* ── Sticky Footer ── */}
        <div className="fixed bottom-0 right-0 left-0 lg:left-64 bg-white border-t border-slate-200 p-4 px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20 flex justify-end gap-3 items-center">
          <Button
            variant="outline"
            type="button"
            onClick={handleGoBack}
            className="!px-8 !py-2.5 !rounded-lg !text-sm border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
          >
            {t('admin.menu.form.cancel', 'Huỷ')}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="menu-form"
            isLoading={isSubmitting}
            className="!px-8 !py-2.5 !rounded-lg !text-sm bg-primary hover:bg-primary/90 text-white font-bold transition-all"
          >
            {isEdit ? t('admin.menu.form.save', 'Cập nhật') : t('admin.menu.form.create', 'Thêm mới')}
          </Button>
        </div>
      </div>
    </div>
  )
}
