import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { TFunction } from 'i18next'
import { Coffee, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useLogin } from '../hooks/useLogin'
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle'

import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'

const getLoginSchema = (t: TFunction) => z.object({
  username: z.string().min(1, t('auth.login.usernameRequired')),
  password: z.string().min(6, t('auth.login.passwordMinLength')),
  remember: z.boolean().optional()
})

type LoginFormValues = z.infer<ReturnType<typeof getLoginSchema>>

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)

  const { t } = useTranslation()
  const loginSchema = getLoginSchema(t)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const { mutate, isPending } = useLogin()

  return (
    <main className="w-full min-h-screen flex flex-col md:flex-row bg-surface text-on-surface font-body relative">
      {/* Language Toggle — Fixed in page context */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle variant="pill" />
      </div>

      {/* Left Side: Branding & Visuals (Desktop) */}
      <section className="hidden md:flex md:w-1/2 bg-primary-container relative overflow-hidden flex-col items-center justify-center p-12 text-center">
        {/* Decorative Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-primary blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-tertiary blur-[100px] opacity-20"></div>
        
        <div className="relative z-10 space-y-8 max-w-md">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shadow-2xl rotate-3">
              <Coffee className="text-primary size-14" strokeWidth={2} />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight font-headline">Cà Phê Suntime</h1>
            <p className="text-on-primary-container text-xl font-medium tracking-wide">Hệ thống quản lý thông minh</p>
          </div>
          <div className="pt-12">
            <div className="inline-block p-1 bg-white/10 rounded-lg backdrop-blur-md">
              <img 
                className="w-full h-64 object-cover rounded-md shadow-inner" 
                alt="Cafe Interior" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHm_pmHQEM_fYm4O9K90bdxbia-c1bgd0aO9IDLWPxC40nrjIL4mgMqsf-HssccB5cnZw6A8xxHoRiuh3f-Rmt1UjMOz2vI_fZ-yf4Oxze4MFvFbV-bhe7xF1EkaCSacsYBYgtIf6F2a27--JQN_m7R8bn5roPmAi9l5TiKyGU5vlKVHCKqMMDvyl-k0x8KDcaaRqcuR4SXjcQ-tLReAZCcdQHJVxRX34Tp9CQJn_vFyN-XvCvDbZWmxhDUPY3TIEAdQkw7kV4kNhY" 
              />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-center text-white/40 text-xs font-medium tracking-widest uppercase">
          <span>Premium Quality</span>
          <span>Est. 2024</span>
          <span>Eco Friendly</span>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="flex-1 bg-surface flex flex-col items-center justify-center px-6 py-12 md:px-24">
        {/* Mobile Header */}
        <div className="md:hidden flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <Coffee className="text-white size-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-primary font-headline">Cà Phê Suntime</h2>
        </div>

        <div className="w-full max-w-md space-y-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">{t('auth.login.welcome')}</h2>
            <p className="text-on-surface-variant text-lg">{t('auth.login.instruction')}</p>
          </div>

          <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-6">
            <Input
              label={t('auth.login.username')}
              placeholder="suntime_admin"
              icon={<User className="size-6" />}
              error={errors.username}
              {...register('username')}
            />

            <Input
              label={t('auth.login.password')}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock className="size-6" />}
              error={errors.password}
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="text-outline hover:text-on-surface transition-colors"
                  aria-label={showPass ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                >
                  {showPass ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center space-x-3 ml-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded accent-primary cursor-pointer"
                {...register('remember')}
              />
              <label htmlFor="remember" className="text-sm font-medium text-on-surface-variant cursor-pointer select-none">
                {t('auth.login.rememberMe')}
              </label>
            </div>

            <Button type="submit" isLoading={isPending} className="w-full">
              {isPending ? '' : t('auth.login.button')}
            </Button>
          </form>

          <div className="pt-10 flex flex-col items-center space-y-4">
            <div className="flex items-center gap-3 py-2 px-4 bg-secondary-container/30 rounded-full border border-secondary-container/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold text-on-secondary-container uppercase tracking-widest">
                {t('auth.login.internalAccess')}
              </span>
            </div>
          </div>
        </div>

        <footer className="mt-auto pt-12 text-center w-full">
          <div className="flex flex-col items-center gap-3">
            <p className="font-body text-sm tracking-wide text-on-surface-variant/60">
              {t('auth.login.copyright')}
            </p>
            <div className="flex gap-6 text-xs font-semibold text-outline hover:text-on-surface transition-colors">
              <a href="#" className="hover:text-primary">{t('common.help')}</a>
              <a href="#" className="hover:text-primary">{t('common.privacy')}</a>
              <a href="#" className="hover:text-primary">{t('common.terms')}</a>
            </div>
          </div>
        </footer>
      </section>
    </main>
  )
}
