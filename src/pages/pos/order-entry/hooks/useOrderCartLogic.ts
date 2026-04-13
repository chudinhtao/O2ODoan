import { useState, useCallback } from 'react'
import { ICart } from '../types/posOrder.type'
import { IMenuItem } from '@/pages/admin/menu/types/adminMenu.type'

export function useOrderCartLogic() {
  const [localCart, setLocalCart] = useState<ICart>({
    sessionToken: '',
    items: [],
    totalAmount: 0
  })

  // Function to add item to local cart
  const addLocalItem = useCallback((item: IMenuItem, quantity: number, note: string, selectedOptions: string[]) => {
    setLocalCart(prev => {
      const resolvedOptions = item.optionGroups?.flatMap((g) => 
        g.options.filter((o) => o.id && selectedOptions.includes(o.id)).map((o) => ({
           optionId: o.id!,
           optionName: o.name,
           extraPrice: o.extraPrice
        }))
      ) || [];
      
      const extraOptionsTotal = resolvedOptions.reduce((sum: number, o) => sum + o.extraPrice, 0);
      const itemTotal = (item.basePrice + extraOptionsTotal) * quantity;

      const newItems = [...prev.items];
      
      const existingItemIndex = newItems.findIndex(i => 
        i.menuItemId === item.id && 
        i.note === note && 
        i.options.length === resolvedOptions.length &&
        i.options.every(o => resolvedOptions.some((ro) => ro.optionId === o.optionId))
      );

      if (existingItemIndex >= 0) {
        const exItem = newItems[existingItemIndex];
        newItems[existingItemIndex] = {
          ...exItem,
          quantity: exItem.quantity + quantity,
          lineTotal: exItem.lineTotal + itemTotal
        };
        return {
          ...prev,
          totalAmount: prev.totalAmount + itemTotal,
          items: newItems
        };
      }
      
      const newItem = {
        cartItemId: Math.random().toString(),
        menuItemId: item.id,
        name: item.name,
        basePrice: item.basePrice,
        quantity,
        note,
        options: resolvedOptions, 
        lineTotal: itemTotal
      }
      
      return {
        ...prev,
        totalAmount: prev.totalAmount + itemTotal,
        items: [...newItems, newItem]
      }
    })
  }, [])

  // Update item quantity
  const updateLocalItemQuantity = useCallback((cartItemId: string, newQty: number) => {
    setLocalCart(prev => {
      const item = prev.items.find(i => i.cartItemId === cartItemId)
      if (!item) return prev
      const unitPrice = item.lineTotal / item.quantity 
      
      if (newQty <= 0) {
        return {
          ...prev,
          items: prev.items.filter(i => i.cartItemId !== cartItemId),
          totalAmount: prev.totalAmount - item.lineTotal
        }
      }
      return {
        ...prev,
        items: prev.items.map(i => i.cartItemId === cartItemId ? { ...i, quantity: newQty, lineTotal: newQty * unitPrice } : i),
        totalAmount: prev.totalAmount - (item.lineTotal) + (newQty * unitPrice)
      }
    })
  }, [])

  // Remove completely
  const removeLocalItem = useCallback((cartItemId: string) => {
    setLocalCart(prev => {
      const item = prev.items.find(i => i.cartItemId === cartItemId)
      if (!item) return prev
      return {
        ...prev,
        items: prev.items.filter(it => it.cartItemId !== cartItemId),
        totalAmount: prev.totalAmount - item.lineTotal
      }
    })
  }, [])
  
  const resetLocalCart = useCallback(() => {
    setLocalCart({ sessionToken: '', items: [], totalAmount: 0 })
  }, [])

  return {
    localCart, 
    setLocalCart,
    addLocalItem,
    updateLocalItemQuantity,
    removeLocalItem,
    resetLocalCart
  }
}
