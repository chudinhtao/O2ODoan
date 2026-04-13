import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface CartItem {
  menuItemId:  string
  name:        string
  price:       number
  quantity:    number
  note?:       string
}

interface CartState {
  items: CartItem[]
  total: number
}

const calcTotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 } as CartState,
  reducers: {
    addItem(state, { payload }: PayloadAction<CartItem>) {
      const existing = state.items.find(i => i.menuItemId === payload.menuItemId)
      if (existing) {
        existing.quantity += payload.quantity
      } else {
        state.items.push(payload)
      }
      state.total = calcTotal(state.items)
    },
    updateQty(state, { payload }: PayloadAction<{ menuItemId: string; quantity: number }>) {
      const item = state.items.find(i => i.menuItemId === payload.menuItemId)
      if (item) {
        item.quantity = payload.quantity
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.menuItemId !== payload.menuItemId)
        }
      }
      state.total = calcTotal(state.items)
    },
    removeItem(state, { payload }: PayloadAction<string>) {
      state.items = state.items.filter(i => i.menuItemId !== payload)
      state.total = calcTotal(state.items)
    },
    clearCart(state) {
      state.items = []
      state.total = 0
    },
  },
})

export const { addItem, updateQty, removeItem, clearCart } = cartSlice.actions
export default cartSlice.reducer
