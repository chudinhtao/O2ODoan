import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Loader2, CheckCircle, AlertCircle, Store, Phone, MapPin } from 'lucide-react'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { ImageUpload } from '@/shared/components/ImageUpload'
import { useAdminProfile, useUpdateProfile } from '../hooks/useSettingsQuery'
import { IProfileRequest } from '../types'

const EMPTY_FORM: IProfileRequest = {
  name: '', slogan: '', logoUrl: '', bannerUrl: '', address: '', phone: ''
}

export default function SettingsPage() {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useAdminProfile()
  const mutation = useUpdateProfile()

  const [form, setForm] = useState<IProfileRequest>(EMPTY_FORM)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (profile) setForm({
      name:      profile.name      || '',
      slogan:    profile.slogan    || '',
      logoUrl:   profile.logoUrl   || '',
      bannerUrl: profile.bannerUrl || '',
      address:   profile.address   || '',
      phone:     profile.phone     || '',
    })
  }, [profile])

  const set = (key: keyof IProfileRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(form, {
      onSuccess: () => {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    })
  }

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">

      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
        <h2 className="text-xl font-bold font-display text-on-surface">
          {t('admin.settings.pageTitle')}
        </h2>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm animate-in fade-in">
              <CheckCircle className="size-4" />
              {t('admin.settings.saveSuccess')}
            </span>
          )}
          {mutation.isError && (
            <span className="flex items-center gap-1.5 text-red-500 font-semibold text-sm">
              <AlertCircle className="size-4" />
              {t('admin.settings.saveError')}
            </span>
          )}
          <Button
            form="settings-form"
            type="submit"
            isLoading={mutation.isPending}
          >
            {!mutation.isPending && <Save className="size-4" />}
            {t('admin.settings.save')}
          </Button>
        </div>
      </header>

      {/* ── Content ── */}
      <form
        id="settings-form"
        onSubmit={handleSubmit}
        className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-hidden"
      >
        {/* ── Cột trái: Text fields ── */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* Thương hiệu */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Store className="size-4 text-primary" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">
                {t('admin.settings.brand.sectionTitle')}
              </h3>
            </div>
            <div className="space-y-4">
              <Input
                label={t('admin.settings.brand.nameLabel')}
                value={form.name}
                onChange={set('name')}
                placeholder={t('admin.settings.brand.namePlaceholder')}
                required
              />
              <Input
                label={t('admin.settings.brand.sloganLabel')}
                value={form.slogan}
                onChange={set('slogan')}
                placeholder={t('admin.settings.brand.sloganPlaceholder')}
              />
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Liên hệ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="size-4 text-primary" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">
                {t('admin.settings.contact.sectionTitle')}
              </h3>
            </div>
            <div className="space-y-4">
              <Input
                label={t('admin.settings.contact.addressLabel')}
                value={form.address}
                onChange={set('address')}
                placeholder={t('admin.settings.contact.addressPlaceholder')}
                icon={<MapPin className="size-4" />}
              />
              <Input
                type="tel"
                label={t('admin.settings.contact.phoneLabel')}
                value={form.phone}
                onChange={set('phone')}
                placeholder={t('admin.settings.contact.phonePlaceholder')}
                icon={<Phone className="size-4" />}
              />
            </div>
          </div>
        </div>

        {/* ── Cột phải: Upload ── */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* Logo */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="size-4 text-primary" />
                </div>
                <h3 className="font-bold text-slate-700 text-sm">
                  {t('admin.settings.media.logoTitle')}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
                {t('admin.settings.media.logoHint')}
              </span>
            </div>
            <ImageUpload
              value={form.logoUrl}
              onChange={(url) => setForm(prev => ({ ...prev, logoUrl: url }))}
            />
          </div>

          <div className="border-t border-slate-100" />

          {/* Banner */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Store className="size-4 text-primary" />
                </div>
                <h3 className="font-bold text-slate-700 text-sm">
                  {t('admin.settings.media.bannerTitle')}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
                {t('admin.settings.media.bannerHint')}
              </span>
            </div>
            <ImageUpload
              value={form.bannerUrl}
              onChange={(url) => setForm(prev => ({ ...prev, bannerUrl: url }))}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
