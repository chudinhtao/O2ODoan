import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, SlidersHorizontal, X } from 'lucide-react'
import { CategoryTabs } from '../components/CategoryTabs'
import { MenuSection } from '../components/MenuSection'
import { DealsHeaderButton } from '../components/DealsHeaderButton'
import { ActiveDealsDrawer } from '../components/ActiveDealsDrawer'
import { BundleMissionDrawer } from '../components/BundleMissionDrawer'
import { ItemDetailModal } from '../components/ItemDetailModal'
import { CartDrawer } from '../components/CartDrawer'
import { CustomerBottomNav } from '../../components/CustomerBottomNav'
import { AiChatPage } from '../../ai-chat/views/AiChatPage'
import { useCustomerCategories, useCustomerItems, useCustomerCart, CUSTOMER_QUERY_KEYS } from '../hooks/useCustomerQueries'
import { useQueryClient } from '@tanstack/react-query'
import { FilterDrawer, FilterState } from '../components/FilterDrawer'
import {
  useCustomerAddToCart,
  useCustomerUpdateCartItem,
  useCustomerDeleteCartItem,
  useCustomerSubmitOrder
} from '../hooks/useCustomerMutations'
import { IMenuItem, ITicketItemRequest, IMenuItemOption } from '../types'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Button } from '@/shared/components/ui/Button'
import { useTranslation } from 'react-i18next'
import { usePaymentLock } from '../../shared/hooks/usePaymentLock'

export default function CustomerMenuPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('t')
  const navigate = useNavigate()
  const { t } = useTranslation()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<IMenuItem | null>(null)
  const [selectedBundle, setSelectedBundle] = useState<any | null>(null)
  const [isDealsDrawerOpen, setIsDealsDrawerOpen] = useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleOpenCart = () => {
    if (token) {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEYS.cart(token) })
    }
    setIsCartDrawerOpen(true)
  }
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'none',
    onlyFeatured: false,
    onlyAvailable: false
  })

  const { data: categories, isLoading: isCategoriesLoading } = useCustomerCategories()
  const { data: items, isLoading: isItemsLoading } = useCustomerItems(activeCategoryId || '')
  const { data: cart, error: cartError, isLoading: isCartLoading } = useCustomerCart(token)
  const [sessionError, setSessionError] = useState<string | null>(null)

  usePaymentLock(token)

  useEffect(() => {
    if (cartError) {
      const msg = (cartError as any).response?.data?.message || t('customer.home.invalidSession')
      setSessionError(msg)
    }
  }, [cartError, t])

  const addToCartMutation = useCustomerAddToCart(token)
  const updateCartItemMutation = useCustomerUpdateCartItem(token)
  const deleteCartItemMutation = useCustomerDeleteCartItem(token)
  const submitOrderMutation = useCustomerSubmitOrder(token)

  useEffect(() => {
    if (categories && categories.length > 0 && activeCategoryId === null) {
      setActiveCategoryId('')
    }
  }, [categories, activeCategoryId])

  const handleOpenItemDetail = (item: IMenuItem) => setSelectedMenuItem(item)

  const handleAddToCart = (
    item: IMenuItem,
    quantity: number,
    selectedOptions: Record<string, IMenuItemOption[]>,
    note: string
  ) => {
    const formattedOptions = Object.values(selectedOptions).flat().map(opt => ({ optionId: opt.id }))
    const payload: ITicketItemRequest = { menuItemId: item.id, quantity, note, options: formattedOptions }
    addToCartMutation.mutate(payload)
  }

  const handleUpdateCartQuantity = (cartItemId: string, newQuantity: number) => {
    const item = cart?.items.find(i => i.cartItemId === cartItemId)
    updateCartItemMutation.mutate({ cartItemId, quantity: newQuantity, note: item?.note || '' })
  }

  const handleRemoveCartItem = (cartItemId: string) => deleteCartItemMutation.mutate(cartItemId)

  const handleCheckout = () => {
    setIsCartDrawerOpen(false)
    submitOrderMutation.mutate(undefined, {
      onSuccess: () => navigate(`/tracking?t=${token}`)
    })
  }

  const handleClearCart = () => {
    cart?.items.forEach(item => deleteCartItemMutation.mutate(item.cartItemId))
  }

  const filteredItems = useMemo(() => {
    if (!items) return []
    let result = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (filters.onlyFeatured) result = result.filter(item => item.isFeatured)
    if (filters.onlyAvailable) result = result.filter(item => item.isAvailable)
    result = [...result].sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.basePrice - b.basePrice
      if (filters.sortBy === 'price-desc') return b.basePrice - a.basePrice
      if (a.isFeatured === b.isFeatured) return 0
      return a.isFeatured ? -1 : 1
    })
    return result
  }, [items, searchQuery, filters])

  const activeFilterCount = [
    filters.sortBy !== 'none',
    filters.onlyFeatured,
    filters.onlyAvailable
  ].filter(Boolean).length

  const handleQuickAdd = (item: IMenuItem) => {
    if (item.optionGroups && item.optionGroups.length > 0) {
      setSelectedMenuItem(item)
    } else {
      addToCartMutation.mutate({ menuItemId: item.id, quantity: 1, note: '', options: [] })
    }
  }

  /* ─── Error state ─── */
  if (!token || sessionError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6 text-center">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 max-w-sm w-full">
          <span className="material-symbols-outlined text-red-400 text-4xl block mb-3">qr_code_scanner</span>
          <h1 className="text-base font-black text-red-700 mb-2">{sessionError || t('customer.home.invalidTable')}</h1>
          <p className="text-sm text-red-400 mb-4">{t('customer.menu.error.pleaseRescan', 'Vui lòng quét mã QR mới tại bàn để tiếp tục gọi món.')}</p>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full border-red-200 text-red-600 hover:bg-red-50 shadow-none rounded-xl">
            {t('customer.tracking.backToHome', 'Về trang chủ')}
          </Button>
        </div>
      </div>
    )
  }

  if (isCartLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-guest-primary border-t-transparent" />
      </div>
    )
  }


  return (
    <div className="bg-[#f8fafc] font-sans text-slate-900 min-h-screen pb-44">

      {/* ══ STICKY HEADER ══ */}
      <header className="fixed top-0 left-0 right-0 z-30">
        {/* Top bar */}
        <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 pt-3 pb-2">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => navigate(`/?t=${token}`)}
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 active:scale-90 transition-all"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>

            {/* Search bar */}
            <div className={`
              flex-1 flex items-center gap-2 bg-slate-100 rounded-2xl px-3 py-2.5 transition-all duration-200
              ${isSearchFocused ? 'bg-white ring-2 ring-guest-primary/30 shadow-sm' : ''}
            `}>
              <Search size={17} className="text-slate-400 shrink-0" strokeWidth={2} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder={t('customer.menu.searchPlaceholder', 'Tìm món ăn...')}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none min-w-0"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 shrink-0">
                  <X size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <DealsHeaderButton onClick={() => setIsDealsDrawerOpen(true)} />
              
              {/* Filter button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className={`
                  relative w-10 h-10 shrink-0 flex items-center justify-center rounded-2xl transition-all active:scale-90
                  ${activeFilterCount > 0
                    ? 'bg-gradient-to-br from-[#ff7a00] to-[#ff5000] text-white shadow-[0_4px_12px_-2px_rgba(255,105,51,0.4)]'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}
                `}
              >
                <SlidersHorizontal size={18} strokeWidth={2} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="bg-white/90 backdrop-blur-md border-b border-slate-100 py-2">
          {isCategoriesLoading ? (
            <div className="px-4 flex gap-2">
              {[80, 96, 72, 88].map(w => (
                <Skeleton key={w} className={`h-8 rounded-full shrink-0 w-[${w}px]`} />
              ))}
            </div>
          ) : (
            <CategoryTabs
              categories={categories || []}
              activeCategoryId={activeCategoryId}
              onSelectCategory={setActiveCategoryId}
            />
          )}
        </div>
      </header>

      {/* ══ MAIN CONTENT ══ */}
      {/* Spacer = exact header height: search row (58px) + tabs row (48px) */}
      <div className="h-[120px]" aria-hidden="true" />

      <main className="px-4 pt-2">
      
        {/* Menu grid/list */}
        {isItemsLoading ? (
          <div className="space-y-5">
            {/* Hero skeleton */}
            <div>
              <div className="flex gap-2 mb-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="flex gap-3 overflow-hidden">
                <Skeleton className="w-[190px] h-[142px] rounded-3xl shrink-0" />
                <Skeleton className="w-[190px] h-[142px] rounded-3xl shrink-0" />
              </div>
            </div>
            {/* Horizontal skeletons */}
            <div className="space-y-2.5">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 bg-white rounded-2xl p-3">
                  <Skeleton className="w-[88px] h-[88px] rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <MenuSection items={filteredItems} onAdd={handleOpenItemDetail} />
        )}
      </main>



      {/* ══ BOTTOM NAV ══ */}
      <CustomerBottomNav
        token={token || ''}
        activeTab="menu"
        onCartClick={handleOpenCart}
      />

      {/* ══ MODALS ══ */}
      <ItemDetailModal
        isOpen={!!selectedMenuItem}
        onClose={() => setSelectedMenuItem(null)}
        item={selectedMenuItem}
        onAddToCart={handleAddToCart}
        isAdding={addToCartMutation.isPending}
      />

      <ActiveDealsDrawer
        isOpen={isDealsDrawerOpen}
        onClose={() => setIsDealsDrawerOpen(false)}
        onSelectBundle={(bundle) => setSelectedBundle(bundle)}
        cart={cart}
      />

      <BundleMissionDrawer
        isOpen={!!selectedBundle}
        onClose={() => setSelectedBundle(null)}
        bundle={selectedBundle}
        cart={cart}
        onQuickAdd={handleQuickAdd}
      />

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckout={handleCheckout}
      />

      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={setFilters}
      />

      {/* ══ AI CHAT ══ */}
      <AiChatPage sessionToken={token} />
    </div>
  )
}
