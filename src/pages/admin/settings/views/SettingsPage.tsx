import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Loader2, Store, Phone, MapPin, Image as ImageIcon } from 'lucide-react'
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { ImageUpload } from '@/shared/components/ImageUpload'
import { useAdminProfile, useUpdateProfile } from '../hooks/useSettingsQuery'
import { IProfileRequest } from '../types'
import { toast } from 'sonner'

const EMPTY_FORM: IProfileRequest = {
  name: '', slogan: '', logoUrl: '', bannerUrl: '', address: '', phone: '', openTime: '08:00', closeTime: '22:00', localCultureNotes: ''
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useAdminProfile()
  const mutation = useUpdateProfile()

  const [form, setForm] = useState<IProfileRequest>(EMPTY_FORM)

  useEffect(() => {
    if (profile) setForm({
      name:      profile.name      || '',
      slogan:    profile.slogan    || '',
      logoUrl:   profile.logoUrl   || '',
      bannerUrl: profile.bannerUrl || '',
      address:   profile.address   || '',
      phone:     profile.phone     || '',
      openTime:  profile.openTime  || '08:00',
      closeTime: profile.closeTime || '22:00',
      localCultureNotes: profile.localCultureNotes || '',
    })
  }, [profile])

  const set = (key: keyof IProfileRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form, {
      onSuccess: () => {
        toast.success(t('admin.settings.saveSuccess'))
      },
      onError: () => {
        toast.error(t('admin.settings.saveError'))
      }
    })
  }

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">

      <AdminPageHeader
        title={t('admin.settings.pageTitle', 'Cài đặt hệ thống')}
      />

      {/* ── Content Scrollable Area ── */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="w-full px-6 lg:px-12 py-8 pb-32">
          <form
            id="settings-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* ── Card 1: Thương hiệu ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {t('admin.settings.brand.sectionTitle', 'Thông tin thương hiệu')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('admin.settings.brand.sectionDesc', 'Tên và slogan hiển thị trên hoá đơn, màn hình khách hàng')}
                  </p>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      {t('admin.settings.brand.nameLabel', 'Tên cửa hàng')}
                    </label>
                    <Input
                      value={form.name}
                      onChange={set('name')}
                      placeholder={t('admin.settings.brand.namePlaceholder')}
                      required
                      className="!py-2.5 !rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      {t('admin.settings.brand.sloganLabel', 'Slogan (Khẩu hiệu)')}
                    </label>
                    <Input
                      value={form.slogan}
                      onChange={set('slogan')}
                      placeholder={t('admin.settings.brand.sloganPlaceholder')}
                      className="!py-2.5 !rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 2: Liên hệ ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {t('admin.settings.contact.sectionTitle', 'Thông tin liên hệ')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('admin.settings.contact.sectionDesc', 'Địa chỉ và số điện thoại hỗ trợ khách hàng')}
                  </p>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      {t('admin.settings.contact.addressLabel', 'Địa chỉ cửa hàng')}
                    </label>
                    <Input
                      value={form.address}
                      onChange={set('address')}
                      placeholder={t('admin.settings.contact.addressPlaceholder')}
                      icon={<MapPin className="size-4" />}
                      className="!py-2.5 !rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      {t('admin.settings.contact.phoneLabel', 'Số điện thoại')}
                    </label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder={t('admin.settings.contact.phonePlaceholder')}
                      icon={<Phone className="size-4" />}
                      className="!py-2.5 !rounded-lg"
                    />
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      {t('admin.settings.contact.openTimeLabel', 'Giờ mở cửa')}
                    </label>
                    <Input
                      type="time"
                      value={form.openTime || ''}
                      onChange={set('openTime')}
                      className="!py-2.5 !rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      {t('admin.settings.contact.closeTimeLabel', 'Giờ đóng cửa')}
                    </label>
                    <Input
                      type="time"
                      value={form.closeTime || ''}
                      onChange={set('closeTime')}
                      className="!py-2.5 !rounded-lg"
                    />
                  </div>
                </div>

                {/* Local Culture Notes */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    {t('admin.settings.contact.cultureNotesLabel', 'Ghi chú văn hóa địa phương (Dành cho AI)')}
                  </label>
                  <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                    {t('admin.settings.contact.cultureNotesDesc', 'Nhập các lưu ý về văn hóa, cách xưng hô, khẩu vị đặc trưng của khách hàng tại địa phương này. AI trợ lý sẽ đọc và học theo phong cách này.')}
                  </p>
                  <Input
                    value={form.localCultureNotes || ''}
                    onChange={set('localCultureNotes')}
                    placeholder={t('admin.settings.contact.cultureNotesPlaceholder', "VD: Khách hàng ở đây thích ăn ngọt, hay xưng hô 'anh/chị' và 'em', phục vụ cần nhanh nhẹn...")}
                    className="!py-2.5 !rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* ── Card 3: Nhận diện hình ảnh ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {t('admin.settings.media.sectionTitle', 'Nhận diện hình ảnh')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('admin.settings.media.sectionDesc', 'Logo và Banner hiển thị trên Menu điện tử (QR)')}
                  </p>
                </div>
              </div>
              
              <div className="p-6 space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                      {t('admin.settings.media.logoTitle', 'Logo thương hiệu')}
                    </label>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
                      {t('admin.settings.media.logoHint', 'Khuyến nghị: Vuông (1:1), có nền trong suốt')}
                    </span>
                  </div>
                  <ImageUpload
                    value={form.logoUrl}
                    onChange={(url) => setForm(prev => ({ ...prev, logoUrl: url }))}
                  />
                </div>

                <div className="border-t border-slate-100" />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                      {t('admin.settings.media.bannerTitle', 'Ảnh bìa (Banner)')}
                    </label>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
                      {t('admin.settings.media.bannerHint', 'Khuyến nghị: Tỉ lệ 16:9, tối đa 2MB')}
                    </span>
                  </div>
                  <ImageUpload
                    value={form.bannerUrl}
                    onChange={(url) => setForm(prev => ({ ...prev, bannerUrl: url }))}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ── Sticky Footer ── */}
      <div className="absolute bottom-0 right-0 left-0 bg-white border-t border-slate-200 p-4 px-8 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40 flex justify-end gap-3 items-center">
        <Button
          variant="outline"
          type="button"
          className="!font-bold !px-6"
          onClick={() => {
            if (profile) setForm({
              name:      profile.name      || '',
              slogan:    profile.slogan    || '',
              logoUrl:   profile.logoUrl   || '',
              bannerUrl: profile.bannerUrl || '',
              address:   profile.address   || '',
              phone:     profile.phone     || '',
              openTime:  profile.openTime  || '08:00',
              closeTime: profile.closeTime || '22:00',
              localCultureNotes: profile.localCultureNotes || '',
            })
          }}
        >
          {t('common.cancel', 'Huỷ')}
        </Button>
        <Button
          form="settings-form"
          type="submit"
          className="!font-bold !px-8 shadow-sm"
          isLoading={mutation.isPending}
        >
          {!mutation.isPending && <Save className="size-4 mr-2" />}
          {t('admin.settings.save', 'Lưu thay đổi')}
        </Button>
      </div>
    </div>
  )
}
