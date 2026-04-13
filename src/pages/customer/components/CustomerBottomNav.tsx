import { Link, useNavigate } from 'react-router-dom'
import { Home, UtensilsCrossed, ShoppingCart, Receipt, CreditCard } from 'lucide-react'
import { useCustomerCart } from '../menu/hooks/useCustomerQueries'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/shared/constants/ROUTES'

interface CustomerBottomNavProps {
  token: string
  activeTab: 'home' | 'menu' | 'cart' | 'tracking' | 'payment'
  onCartClick?: () => void
}

export function CustomerBottomNav({ token, activeTab, onCartClick }: CustomerBottomNavProps) {
  const navigate = useNavigate()
  const { data: cart } = useCustomerCart(token)
  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const { t } = useTranslation()

  const handleCartClick = () => {
    if (onCartClick) { onCartClick() } else { navigate(`/menu?t=${token}`) }
  }

  const isActive = (tab: string) => activeTab === tab

  const tabCls = (tab: string) =>
    `flex flex-col items-center gap-0.5 transition-colors ${isActive(tab) ? 'text-guest-primary' : 'text-slate-400'}`

  const labelCls = (tab: string) =>
    `text-[9px] uppercase tracking-tight ${isActive(tab) ? 'font-black' : 'font-medium'}`

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/96 backdrop-blur-xl border-t border-slate-100 pb-5 pt-2.5 z-[45]">
      <div className="flex justify-around items-end max-w-md mx-auto px-2">

        {/* Home */}
        <Link to={`/?t=${token}`} className={tabCls('home')}>
          <Home size={22} fill={isActive('home') ? 'currentColor' : 'none'} strokeWidth={isActive('home') ? 0 : 1.8} />
          <span className={labelCls('home')}>{t('customer.nav.home')}</span>
        </Link>

        {/* Menu */}
        <Link to={`/menu?t=${token}`} className={tabCls('menu')}>
          <UtensilsCrossed size={22} strokeWidth={isActive('menu') ? 2.2 : 1.8} />
          <span className={labelCls('menu')}>{t('customer.nav.menu')}</span>
        </Link>

        {/* Cart — elevated tile */}
        <div onClick={handleCartClick} className="flex flex-col items-center gap-0.5 cursor-pointer">
          <div className={`
            relative w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-90
            ${isActive('cart')
              ? 'bg-gradient-to-br from-[#ff7a00] to-[#ff5000] shadow-[0_4px_14px_-4px_rgba(255,105,51,0.55)] text-white'
              : 'bg-slate-100 text-slate-500'}
          `}>
            <ShoppingCart size={22} strokeWidth={isActive('cart') ? 2.2 : 1.8} />
            {cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </div>
          <span className={labelCls('cart')}>{t('customer.nav.cart')}</span>
        </div>

        {/* Tracking */}
        <Link to={`/tracking?t=${token}`} className={tabCls('tracking')}>
          <Receipt size={22} strokeWidth={isActive('tracking') ? 2.2 : 1.8} />
          <span className={labelCls('tracking')}>{t('customer.nav.tracking')}</span>
        </Link>

        {/* Payment */}
        <Link to={`${ROUTES.customer.payment}?t=${token}`} className={tabCls('payment')}>
          <CreditCard size={22} strokeWidth={isActive('payment') ? 2.2 : 1.8} />
          <span className={labelCls('payment')}>{t('customer.nav.payment', 'Thanh toán')}</span>
        </Link>

      </div>
    </nav>
  )
}
