import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { usePromotionForm } from '../hooks/usePromotionForm'
import { Button } from '@/shared/components/ui/Button'
import { ROUTES } from '@/shared/constants/ROUTES'

// ── Components ──
import { BasicInfoSection } from '../components/form/BasicInfoSection'
import { DiscountConfigSection } from '../components/form/DiscountConfigSection'
import { TargetBundleSection } from '../components/form/TargetBundleSection'
import { SidebarStatusSection, SidebarLimitsSection } from '../components/form/SidebarSections'
import { ScheduleSection } from '../components/form/ScheduleSection'

export default function PromotionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const handleGoBack = () => navigate(ROUTES.admin.promotions)

  const {
    form,
    isEdit,
    isLoadingPromo,
    isSubmitting,
    categories,
    menuItems,
    serverTimeStr,
    bundleArray,
    scheduleArray,
    onSubmit,
    onError,
  } = usePromotionForm({ promoId: id || null, onSuccess: handleGoBack })

  const { handleSubmit } = form

  return (
    <div className="flex flex-col h-full bg-slate-50/50 relative">
      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800 leading-tight">
              {isEdit ? 'Chỉnh sửa Khuyến mãi' : 'Tạo Khuyến mãi mới'}
            </h2>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest hidden md:block">
              {isEdit ? 'Quản lý thông tin & điều kiện' : 'Thiết lập chương trình mới'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            type="button"
            onClick={handleGoBack}
            className="!px-5 !py-2.5 !rounded-xl !text-sm text-slate-600 hover:bg-slate-100 font-bold"
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="promo-form"
            isLoading={isSubmitting}
            className="!px-6 !py-2.5 !rounded-xl !text-sm bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo chương trình'}
          </Button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoadingPromo && isEdit ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <form id="promo-form" onSubmit={handleSubmit(onSubmit, onError)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* ── Main Column (Left - 2/3) ── */}
              <div className="lg:col-span-2 space-y-8">
                <BasicInfoSection form={form} />
                <DiscountConfigSection form={form} />
                <TargetBundleSection 
                  form={form} 
                  bundleArray={bundleArray} 
                  categories={categories} 
                  menuItems={menuItems} 
                />
                <ScheduleSection form={form} scheduleArray={scheduleArray} />
              </div>

              {/* ── Sidebar Column (Right - 1/3) ── */}
              <div className="lg:col-span-1 space-y-6 sticky top-8">
                {/* Server time indicator */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Giờ Server
                  </span>
                  <span className="text-xs font-black text-slate-700 font-mono bg-slate-100 px-2 py-1 rounded-lg">
                    {serverTimeStr}
                  </span>
                </div>

                <SidebarStatusSection form={form} />
                <SidebarLimitsSection form={form} />
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  )
}
