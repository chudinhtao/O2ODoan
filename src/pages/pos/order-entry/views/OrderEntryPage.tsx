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
import { useOrderSubmitActions } from '../hooks/useOrderSubmitActions'
import { useActiveSessionQuery, useTakeawaySessionMutation } from '../hooks/useActiveSessionQuery'
import { posMenuService } from '../services/posMenu.service'
import { getSuccessMessage } from '@/shared/utils/apiResponse'

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
  const { data: tables } = usePosTables()
  const { data: activeSession } = useActiveSessionQuery(tableId)
  const { mutate: createTakeawaySession } = useTakeawaySessionMutation()
  
  const [sessionToken, setSessionToken] = useState<string>(location.state?.sessionToken || '')
  const tableNumber = activeSession?.tableNumber || 0

  // Ngăn chặn rò rỉ session khi chuyển qua lại giữa các bàn/mang về mà component không unmount
  useEffect(() => {
    if (location.state?.sessionToken) {
      setSessionToken(location.state.sessionToken)
    } else if (activeSession === null) {
      // Bàn trống -> xoá session
      setSessionToken('')
    } else if (tableId === 'takeaway' && sessionToken) {
       // Nếu đổi sang Takeaway mà đang dính session cũ của bàn trước đó -> xoá
       setSessionToken('')
    }
  }, [tableId, location.state?.sessionToken, activeSession])

  useEffect(() => {
    if (activeSession?.sessionToken) {
      setSessionToken(activeSession.sessionToken)
    } else if (tableId === 'takeaway' && !sessionToken) {
      // Chỉ auto-tạo phiên khi người dùng TƯỜNG MINH chọn Takeaway (tableId = 'takeaway')
      // Không trigger khi tableId = undefined (người dùng chỉ đang mở màn Sales để chọn bàn)
      createTakeawaySession(undefined, {
        onSuccess: (data) => {
           if (data?.sessionToken) {
              setSessionToken(data.sessionToken)
           }
        }
      })
    }
  }, [activeSession, tableId, sessionToken, createTakeawaySession])
  useEffect(() => {
    // Session token state management has handled the token.
    // LocalCart has been completely removed since sessions are now actively opened immediately.
  }, [])

  const { data: serverCart, isLoading: isCartLoading } = usePosCart(sessionToken)
  const { mutate: addItem } = useAddCartItem(sessionToken)
  const { mutate: updateItem } = useUpdateCartItem(sessionToken)
  const { mutate: removeItem } = useRemoveCartItem(sessionToken)

  const cart = (serverCart || { items: [], totalAmount: 0 }) as ICart

  const { isSubmitting, handleSubmit, handleCheckout } = useOrderSubmitActions({
    tableId,
    sessionToken,
    cart
  })

  const handleItemClick = (item: IMenuItem) => {
    if (!tableId) {
      toast.warning(t('pos.cart.selectFirst', 'Vui lòng chọn bàn hoặc Mang về trước khi thêm món!'))
      return
    }
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleAddToCart = (item: IMenuItem, quantity: number, options: string[], note: string, editingCartItemId?: string) => {
    if (!sessionToken) {
      toast.error(t('pos.cart.noSession', 'Không tìm thấy phiên làm việc. Vui lòng tải lại trang.'));
      return;
    }
    const payloadOptions = options.map(id => ({ optionId: id }))
    if (editingCartItemId) {
        removeItem(editingCartItemId, {
          onSuccess: () => addItem(
            { menuItemId: item.id, quantity, note, options: payloadOptions },
            {
              onSuccess: (res) => {
                toast.success(getSuccessMessage(res.message, t('pos.cart.updated', 'Đã cập nhật món')))
              }
            }
          )
        })
    } else {
        addItem(
          { menuItemId: item.id, quantity, note, options: payloadOptions },
          {
            onSuccess: (res) => {
              toast.success(getSuccessMessage(res.message, t('pos.cart.added', 'Đã thêm món vào đơn tạm')))
            }
          }
        )
    }
  }

  const handleEditCartItem = async (cartItem: ICartItem) => {
    try {
      const item = await posMenuService.getItem(cartItem.menuItemId)
      setSelectedItem(item)
      setEditingCartItem(cartItem)
      setIsModalOpen(true)
    } catch {
      toast.error(t('pos.cart.loadFailed', 'Không thể tải thông tin món này.'))
    }
  }

  const handleIncrease = (cartItemId: string) => {
    if (sessionToken) {
      const current = serverCart?.items.find(i => i.cartItemId === cartItemId)
      if (current) updateItem({ cartItemId, payload: { quantity: current.quantity + 1 } })
    }
  }

  const handleDecrease = (cartItemId: string, qty: number) => {
    if (sessionToken) {
       if (qty <= 1) handleRemove(cartItemId)
       else updateItem({ cartItemId, payload: { quantity: qty - 1 } })
    }
  }

  const handleRemove = (cartItemId: string) => {
    removeItem(cartItemId, {
      onSuccess: (res) => {
        toast.success(getSuccessMessage(res.message, t('pos.cart.removed', 'Đã xóa món khỏi đơn tạm')))
      }
    })
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
             tableId={tableId}
             tableNumber={tableNumber}
             cart={cart}
             isCartLoading={isCartLoading}
             isSubmitting={isSubmitting}
             onIncreaseItem={handleIncrease}
             onDecreaseItem={handleDecrease}
             onRemoveItem={handleRemove}
             onSubmitTicket={handleSubmit}
             onCheckout={handleCheckout}
             onEditItem={handleEditCartItem}
             onClearCart={() => {}} // Disabled since server cart handles clearing after submit
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

