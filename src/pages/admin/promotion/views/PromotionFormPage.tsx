import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/shared/components/ui/Button'
import { usePromotionForm } from '../hooks/usePromotionForm'
import { ROUTES } from '@/shared/constants/ROUTES'

// ── Form Section Components ──
import { BasicInfoSection }   from '../components/form/BasicInfoSection'
import { DiscountConfigSection } from '../components/form/DiscountConfigSection'
import { RequirementSection }   from '../components/form/RequirementSection'
import { TargetBundleSection }   from '../components/form/TargetBundleSection'
import { SidebarLimitsSection } from '../components/form/SidebarSections'
import { ScheduleSection }       from '../components/form/ScheduleSection'
import { ArrowLeft, Clock } from 'lucide-react'

export default function PromotionFormPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const handleGoBack = () => navigate(ROUTES.admin.promotions)

  const {
    form,
    isEdit,
    isLoadingPromo,
    isSubmitting,
    categories,
    serverTimeStr,
    bundleArray,
    scheduleArray,
    onSubmit,
    onError,
  } = usePromotionForm({ promoId: id || null, onSuccess: handleGoBack })

  const { handleSubmit } = form

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F8F9FD]">
      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6 shrink-0 z-10 sticky top-0 shadow-sm w-full gap-4">
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
              {isEdit ? t('admin.promotions.form.titleEdit', 'Chỉnh sửa Khuyến mãi') : t('admin.promotions.form.titleAdd', 'Tạo Khuyến mãi mới')}
            </h2>
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <span>{t('admin.promotions.form.breadcrumb', 'Khuyến mãi')}</span>
              <span className="text-slate-300">&gt;</span>
              <span className="text-primary">{isEdit ? t('admin.promotions.form.breadcrumbEdit', 'Chỉnh sửa') : t('admin.promotions.form.breadcrumbAdd', 'Tạo mới')}</span>
            </div>
          </div>
        </div>

        {/* Server time indicator (moved from sidebar to header) */}
        {serverTimeStr && (
          <div className="ml-auto flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('admin.promotions.form.serverTime', 'Giờ Server')}</span>
            <span className="text-xs font-black text-slate-700 font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {serverTimeStr}
            </span>
          </div>
        )}
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
        {isLoadingPromo && isEdit ? (
          <div className="flex items-center justify-center h-64">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        ) : (
          <div className="w-full px-4 md:px-6 lg:px-8 py-6 pb-28">
            <form id="promo-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">

              {/* ── Card 1: Thông tin cơ bản ── */}
              <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-visible">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t('admin.promotions.form.basicInfo', 'Thông tin cơ bản')}</h3>
                </div>
                <div className="p-6">
                  <BasicInfoSection form={form} />
                </div>
              </div>

              {/* ── Card 2: Cấu hình giảm giá ── */}
              <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-visible">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t('admin.promotions.form.discountConfig', 'Cấu hình Giảm giá')}</h3>
                </div>
                <div className="p-6">
                  <DiscountConfigSection form={form} />
                </div>
              </div>

              {/* ── Card 3: Điều kiện Yêu cầu ── */}
              <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-visible">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t('admin.promotions.form.requirements', 'Điều kiện Yêu cầu')}</h3>
                </div>
                <div className="p-6">
                  <RequirementSection form={form} />
                </div>
              </div>

              {/* ── Card 4: Sản phẩm Áp dụng ── */}
              <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-visible">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t('admin.promotions.form.targets', 'Sản phẩm Áp dụng (Target)')}</h3>
                </div>
                <div className="p-6">
                  <TargetBundleSection
                    form={form}
                    bundleArray={bundleArray}
                    categories={categories}
                  />
                </div>
              </div>

              {/* ── Card 5: Lịch chạy ── */}
              <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-visible">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t('admin.promotions.form.schedule', 'Lịch chạy (Schedule)')}</h3>
                </div>
                <div className="p-6">
                  <ScheduleSection form={form} scheduleArray={scheduleArray} />
                </div>
              </div>

              {/* ── Card 6: Giới hạn & Thời gian (full width, stackable inside) ── */}
              <div className="bg-white rounded-lg border border-slate-200/60 shadow-sm overflow-visible">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800">{t('admin.promotions.form.limits', 'Giới hạn & Thời gian')}</h3>
                </div>
                <div className="p-6">
                  <SidebarLimitsSection form={form} />
                </div>
              </div>

            </form>
          </div>
        )}
      </div>

      {/* ── Sticky Footer ── */}
      <div className="fixed bottom-0 right-0 left-0 lg:left-64 bg-white border-t border-slate-200 p-4 px-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-20 flex justify-end gap-3 items-center">
        <Button
          variant="outline"
          type="button"
          onClick={handleGoBack}
          className="!px-8 !py-2.5 !rounded-lg !text-sm border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
        >
          {t('admin.promotions.form.cancel', 'Huỷ')}
        </Button>
        <Button
          variant="primary"
          type="submit"
          form="promo-form"
          isLoading={isSubmitting}
          className="!px-8 !py-2.5 !rounded-lg !text-sm bg-primary hover:bg-primary/90 text-white font-bold transition-all"
        >
          {isEdit ? t('admin.promotions.form.saveEdit', 'Lưu thay đổi') : t('admin.promotions.form.saveAdd', 'Tạo chương trình')}
        </Button>
      </div>
    </div>
  )
}
