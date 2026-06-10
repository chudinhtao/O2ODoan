import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Search, ShoppingBag, ChefHat, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCustomerCategories, useBookingMenuItems } from '../../menu/hooks/useCustomerQueries'
import { MenuItemCard } from '../../menu/components/MenuItemCard'
import { ItemDetailModal } from '../../menu/components/ItemDetailModal'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { IMenuItem, IMenuItemOption } from '../../menu/types'
import { ROUTES } from '@/shared/constants/ROUTES'
import { BookingCartBar } from '../components/BookingCartBar'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'

// ── Types ──────────────────────────────────────────────────────────────────
export interface PreOrderItem {
  item: IMenuItem
  qty: number
  opts: Record<string, IMenuItemOption[]>
  note: string
}

interface LocationState {
  preOrderItems?: PreOrderItem[]
  formData?: Record<string, any>
}

// ── BookingMenuPage ────────────────────────────────────────────────────────
export default function BookingMenuPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const state = (location.state as LocationState) || {}

  // Restore cart from navigation state
  const [cart, setCart] = useState<PreOrderItem[]>(state.preOrderItems || [])
  const [selectedCatId, setSelectedCatId] = useState('')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<IMenuItem | null>(null)

  const { data: categories, isLoading: isCatLoading } = useCustomerCategories()
  const { data: rawItems, isLoading: isItemsLoading } = useBookingMenuItems(selectedCatId)

  // Filter by search
  const items = useMemo(() => {
    if (!rawItems) return []
    if (!search.trim()) return rawItems
    const q = search.toLowerCase()
    return rawItems.filter(i => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))
  }, [rawItems, search])

  const featuredItems = useMemo(() => items.filter(i => i.isFeatured && i.isAvailable), [items])
  const regularItems = useMemo(() => items.filter(i => !i.isFeatured), [items])

  const totalQty = cart.reduce((s, c) => s + c.qty, 0)

  const addItem = (item: IMenuItem, qty: number, opts: Record<string, IMenuItemOption[]>, note: string) => {
    setCart(prev => {
      const optsKey = JSON.stringify(opts)
      const idx = prev.findIndex(
        p => p.item.id === item.id && JSON.stringify(p.opts) === optsKey && p.note === note
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return next
      }
      return [...prev, { item, qty, opts, note }]
    })
  }

  const removeItem = (idx: number) => setCart(prev => prev.filter((_, i) => i !== idx))

  const handleBack = () => {
    navigate(ROUTES.customer.booking, {
      state: { ...state, preOrderItems: cart },
      replace: true,
    })
  }

  const handleConfirm = () => {
    navigate(ROUTES.customer.booking, {
      state: { ...state, preOrderItems: cart },
      replace: true,
    })
  }

  return (
    <div className="font-sans bg-guest-background min-h-[100dvh] flex flex-col">
      {/* ── STICKY HEADER ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-guest-border">
        {/* Top bar */}
        <div className="flex items-center gap-3 p-3 px-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="!w-10 !h-10 !min-w-0 !p-0 !rounded-full bg-guest-background !border-none shrink-0 hover:!bg-slate-200"
          >
            <ArrowLeft size={20} className="text-text-base" />
          </Button>

          <div className="flex-1">
            <h1 className="font-black text-base text-text-base m-0 leading-tight">{t('customer.bookingMenu.title')}</h1>
            <p className="text-xs text-text-muted m-0">{t('customer.bookingMenu.subtitle')}</p>
          </div>

          {totalQty > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-guest-primary shadow-sm shadow-guest-primary/30">
              <ShoppingBag size={14} className="text-white" />
              <span className="font-extrabold text-sm text-white">{t('customer.bookingMenu.itemsCount', { count: totalQty })}</span>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="px-4 pb-2.5 relative">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('customer.bookingMenu.searchPlaceholder')}
            className="w-full box-border rounded-xl bg-guest-surface shadow-none border-surface-border text-[0.83rem] font-medium"
            icon={<Search className="text-text-subtle" size={15} />}
            rightAddon={search && (
              <Button
                type="button"
                variant="icon"
                onClick={() => setSearch('')}
                className="w-auto h-auto min-w-0 bg-transparent border-none cursor-pointer text-text-subtle hover:bg-transparent hover:text-text-base transition-colors p-1"
              >
                <X size={14} />
              </Button>
            )}
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          <Button
            variant={selectedCatId === '' ? 'guest' : 'outline'}
            className={`!px-4 !py-2 !h-auto !w-auto !min-w-0 !rounded-full !text-sm whitespace-nowrap shrink-0 ${selectedCatId === '' ? '!shadow-[0_4px_12px_rgba(232,114,28,0.35)] !border-none' : 'text-text-muted !border-surface-border hover:!bg-orange-50 hover:!border-guest-primary/30'}`}
            onClick={() => setSelectedCatId('')}
          >
            {t('customer.bookingMenu.all')}
          </Button>
          {isCatLoading
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="w-18 h-8 rounded-full bg-surface-subtle shrink-0 animate-pulse" />
              ))
            : categories?.map(cat => (
                <Button
                  key={cat.id}
                  variant={selectedCatId === cat.id ? 'guest' : 'outline'}
                  className={`!px-4 !py-2 !h-auto !w-auto !min-w-0 !rounded-full !text-sm whitespace-nowrap shrink-0 ${selectedCatId === cat.id ? '!shadow-[0_4px_12px_rgba(232,114,28,0.35)] !border-none' : 'text-text-muted !border-surface-border hover:!bg-orange-50 hover:!border-guest-primary/30'}`}
                  onClick={() => setSelectedCatId(cat.id)}
                >
                  {cat.name}
                </Button>
              ))
          }
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className={`flex-1 overflow-y-auto ${totalQty > 0 ? 'pb-24' : 'pb-6'}`}>
        {isItemsLoading ? (
          <div className="p-4">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 mb-4">
              {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
            </div>
            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl mb-3" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-6 text-text-subtle">
            <ChefHat size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-sm">{t('customer.bookingMenu.notFound')}</p>
            <p className="text-[0.78rem] mt-1">{t('customer.bookingMenu.searchTryAgain')}</p>
          </div>
        ) : (
          <>
            {/* Featured section */}
            {featuredItems.length > 0 && !search && (
              <div className="pt-4 px-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[0.7rem] font-extrabold text-guest-primary uppercase tracking-wider">🔥 {t('customer.bookingMenu.featured')}</span>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5 mb-5">
                  {featuredItems.slice(0, 6).map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      variant="vertical"
                      onAdd={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All items / regular section */}
            {regularItems.length > 0 && (
              <div className="px-4 pb-4">
                {!search && regularItems.length > 0 && featuredItems.length > 0 && (
                  <div className="mb-2.5">
                    <span className="text-[0.7rem] font-extrabold text-text-muted uppercase tracking-wider">{t('customer.bookingMenu.allItems')}</span>
                  </div>
                )}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2">
                  {(search ? items : regularItems).map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      variant="horizontal"
                      onAdd={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* If only featured (no regular), search result shows featured too */}
            {search && featuredItems.length > 0 && regularItems.length === 0 && (
              <div className="px-4 pb-4 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2">
                {featuredItems.map(item => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    variant="horizontal"
                    onAdd={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── STICKY FOOTER: Cart bar ── */}
      <BookingCartBar cart={cart} onRemoveItem={removeItem} onConfirm={handleConfirm} />

      {/* ── ItemDetailModal (reused) ── */}
      <ItemDetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
        onAddToCart={(item, qty, opts, note) => {
          addItem(item, qty, opts, note)
          setSelectedItem(null)
          // ← KHÔNG đóng page, để user có thể chọn thêm món
        }}
      />
    </div>
  )
}
