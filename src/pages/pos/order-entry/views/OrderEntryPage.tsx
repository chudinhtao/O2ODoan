import { useParams, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { MenuPanel } from '../components/MenuPanel'
import { CartPanel } from '../components/CartPanel'
import { ItemModifierModal } from '../components/ItemModifierModal'
import { OrderEntryHeader } from '../components/OrderEntryHeader'

import { usePosCart, useAddCartItem, useUpdateCartItem, useRemoveCartItem } from '../hooks/usePosCart'
import { usePosTables } from '@/pages/pos/table-map/hooks/usePosTables'
import { useOrderCartLogic } from '../hooks/useOrderCartLogic'
import { useOrderSubmitActions } from '../hooks/useOrderSubmitActions'
import { useActiveSessionQuery } from '../hooks/useActiveSessionQuery'
import { posMenuService } from '../services/posMenu.service'

import { IMenuItem } from '@/pages/admin/menu/types/adminMenu.type'
import { ICart, ICartItem } from '../types/posOrder.type'

export default function OrderEntryPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const location = useLocation()
  const { t } = useTranslation()

  // Modal State
  const [selectedItem, setSelectedItem] = useState<IMenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCartItem, setEditingCartItem] = useState<ICartItem | null>(null)

  // Local Cart Logic
  const { 
    localCart, 
    setLocalCart, 
    addLocalItem, 
    updateLocalItemQuantity, 
    removeLocalItem,
    resetLocalCart
  } = useOrderCartLogic()

  const { data: tables } = usePosTables()
  const { data: activeSession } = useActiveSessionQuery(tableId)
  
  const [sessionToken, setSessionToken] = useState<string>(location.state?.sessionToken || '')
  const tableNumber = activeSession?.tableNumber || 0

  useEffect(() => {
    if (activeSession?.sessionToken) {
      setSessionToken(activeSession.sessionToken)
    }
  }, [activeSession])

  useEffect(() => {
    // Initialize Local Cart from location state if Takeaway
    const state = location.state as { cart?: ICart } | null
    if (state?.cart) {
      setLocalCart(state.cart)
    } else {
      setLocalCart({ sessionToken: '', items: [], totalAmount: 0 } as ICart)
    }
  }, [location.state, setLocalCart])

  const { data: serverCart, isLoading: isCartLoading } = usePosCart(sessionToken)
  const { mutate: addItem } = useAddCartItem(sessionToken)
  const { mutate: updateItem } = useUpdateCartItem(sessionToken)
  const { mutate: removeItem } = useRemoveCartItem(sessionToken)

  const cart = (sessionToken ? (serverCart || { items: [], totalAmount: 0 }) : localCart) as ICart

  const { isSubmitting, handleSubmit, handleCheckout } = useOrderSubmitActions({
    tableId,
    sessionToken,
    cart,
    localCart,
    setLocalCart
  })

  const handleItemClick = (item: IMenuItem) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleAddToCart = (item: IMenuItem, quantity: number, options: string[], note: string, editingCartItemId?: string) => {
    if (sessionToken) {
      const payloadOptions = options.map(id => ({ optionId: id }))
      if (editingCartItemId) {
         removeItem(editingCartItemId, {
           onSuccess: () => addItem({ menuItemId: item.id, quantity, note, options: payloadOptions })
         })
      } else {
         addItem({ menuItemId: item.id, quantity, note, options: payloadOptions })
      }
      toast.success(editingCartItemId ? t('pos.cart.updated', 'Đã cập nhật món') : t('pos.cart.added', 'Đã thêm món vào đơn tạm'))
    } else {
      if (editingCartItemId) removeLocalItem(editingCartItemId)
      addLocalItem(item, quantity, note, options)
      toast.success(editingCartItemId ? t('pos.cart.updated', 'Đã cập nhật món') : t('pos.cart.added', 'Đã thêm món vào đơn tạm'))
    }
  }

  const handleEditCartItem = async (cartItem: ICartItem) => {
    try {
      const res = await posMenuService.getItem(cartItem.menuItemId)
      if (res.data.data) {
        setSelectedItem(res.data.data)
        setEditingCartItem(cartItem)
        setIsModalOpen(true)
      }
    } catch {
      toast.error(t('pos.cart.loadFailed', 'Không thể tải thông tin món này.'))
    }
  }

  const handleIncrease = (cartItemId: string) => {
    if (sessionToken) {
      const current = serverCart?.items.find(i => i.cartItemId === cartItemId)
      if (current) updateItem({ cartItemId, payload: { quantity: current.quantity + 1 } })
    } else {
      const current = localCart.items.find(i => i.cartItemId === cartItemId)
      if (current) updateLocalItemQuantity(cartItemId, current.quantity + 1)
    }
  }

  const handleDecrease = (cartItemId: string, qty: number) => {
    if (sessionToken) {
       if (qty <= 1) removeItem(cartItemId)
       else updateItem({ cartItemId, payload: { quantity: qty - 1 } })
    } else {
      updateLocalItemQuantity(cartItemId, qty - 1)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-surface-variant relative">
      <OrderEntryHeader tableId={tableId} tables={tables} />

      {/* Content Wrapper */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3 relative">
         <section className="flex-1 flex flex-col min-w-0 bg-surface-bright rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
           <MenuPanel onItemClick={handleItemClick} />
         </section>
         <aside className="w-[420px] flex flex-col shrink-0 z-10 hidden lg:flex bg-surface-bright rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
           <CartPanel
             tableNumber={tableNumber}
             cart={cart}
             isCartLoading={isCartLoading}
             isSubmitting={isSubmitting}
             onIncreaseItem={handleIncrease}
             onDecreaseItem={handleDecrease}
             onRemoveItem={sessionToken ? removeItem : removeLocalItem}
             onSubmitTicket={handleSubmit}
             onCheckout={handleCheckout}
             onEditItem={handleEditCartItem}
             onClearCart={resetLocalCart}
           />
         </aside>
      </div>

      <ItemModifierModal
        isOpen={isModalOpen}
        onClose={() => {
           setIsModalOpen(false)
           setTimeout(() => setEditingCartItem(null), 300)
        }}
        item={selectedItem!}
        onAddToCart={handleAddToCart}
        editingCartItemId={editingCartItem?.cartItemId}
        initialQuantity={editingCartItem?.quantity}
        initialNote={editingCartItem?.note}
        initialOptions={editingCartItem?.options?.map((o) => o.optionId)}
      />
    </div>
  )
}

