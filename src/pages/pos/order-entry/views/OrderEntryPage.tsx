import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ROUTES } from '@/shared/constants/ROUTES'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ShoppingCart, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'

import { MenuPanel } from '../components/MenuPanel'
import { CartPanel } from '../components/CartPanel'
import { ItemModifierModal } from '../components/ItemModifierModal'
import { OrderEntryHeader } from '../components/OrderEntryHeader'
import { TakeawayCustomerModal } from '../components/TakeawayCustomerModal'

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
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Modal State
  const [selectedItem, setSelectedItem] = useState<IMenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)
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

  const [isTakeawayModalOpen, setIsTakeawayModalOpen] = useState(false)

  useEffect(() => {
    if (activeSession?.sessionToken) {
      setSessionToken(activeSession.sessionToken)
    } else if (tableId === 'takeaway' && !sessionToken && !isTakeawayModalOpen) {
      // Prompt modal instead of auto-creating
      setIsTakeawayModalOpen(true)
    }
  }, [activeSession, tableId, sessionToken])

  const handleTakeawaySubmit = (customerName?: string, customerPhone?: string) => {
    createTakeawaySession({ customerName, customerPhone }, {
      onSuccess: (data) => {
         if (data?.sessionToken) {
            setSessionToken(data.sessionToken)
         }
         setIsTakeawayModalOpen(false)
      }
    })
  }

  const handleTakeawayCancel = () => {
    setIsTakeawayModalOpen(false)
    // Go back to table map if they cancel creating takeaway order
    navigate(ROUTES.pos.tables)
  }
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
      // Error is handled by interceptor
    }
  }

  const handleUpdateQuantity = (cartItemId: string, qty: number) => {
    if (sessionToken) {
       if (qty <= 0) handleRemove(cartItemId)
       else updateItem({ cartItemId, payload: { quantity: qty } })
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
      <OrderEntryHeader 
        tableId={tableId} 
        tables={tables} 
        actions={
          <div className="md:hidden">
            <Button 
              variant="outline"
              className="h-9 px-3 gap-2 border-outline-variant/30 hover:bg-surface-variant rounded-lg"
              onClick={() => setIsMobileCartOpen(true)}
            >
              <ShoppingCart className="size-4" />
              {cart.items.length > 0 && (
                <span className="bg-error text-white text-xs font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                  {cart.items.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </Button>
          </div>
        }
      />

      {/* Content Wrapper */}
      <div className="flex flex-row flex-1 overflow-hidden p-3 gap-3 relative">
         <section className="flex-1 flex flex-col min-w-0 bg-surface-bright rounded-2xl shadow-sm border border-surface-container-high overflow-hidden">
           <MenuPanel onItemClick={handleItemClick} />
         </section>
         {/* Mobile Cart Overlay */}
         {isMobileCartOpen && (
           <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileCartOpen(false)} />
         )}

         {/* Cart Aside */}
         <aside className={`
           fixed md:relative inset-y-0 right-0 z-50 md:z-10 
           w-[85vw] sm:w-[360px] md:w-[320px] lg:w-[420px] 
           flex flex-col shrink-0 bg-surface-bright shadow-2xl md:shadow-sm border-l md:border border-surface-container-high
           transition-transform duration-300 ease-in-out
           ${isMobileCartOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
           md:rounded-2xl overflow-hidden
         `}>
           {/* Mobile Close Button inside Cart */}
           <div className="md:hidden flex justify-between items-center p-4 border-b border-outline-variant bg-surface shrink-0">
             <span className="font-bold text-on-surface text-lg">{t('pos.cart.title', 'Giỏ hàng')}</span>
             <Button variant="ghost" size="icon" onClick={() => setIsMobileCartOpen(false)}>
               <X className="size-6" />
             </Button>
           </div>
           
           <div className="flex-1 overflow-hidden flex flex-col relative">
             <CartPanel
               tableId={tableId}
               tableNumber={tableNumber}
               cart={cart}
               isCartLoading={isCartLoading}
               isSubmitting={isSubmitting}
               onUpdateQuantity={handleUpdateQuantity}
               onRemoveItem={handleRemove}
               onSubmitTicket={handleSubmit}
               onCheckout={handleCheckout}
               onEditItem={handleEditCartItem}
               onClearCart={() => {}} // Disabled since server cart handles clearing after submit
             />
           </div>
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

      <TakeawayCustomerModal
        isOpen={isTakeawayModalOpen}
        onClose={handleTakeawayCancel}
        onSubmit={handleTakeawaySubmit}
      />
    </div>
  )
}
