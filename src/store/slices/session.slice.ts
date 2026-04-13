import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface SessionState {
  token:       string | null
  tableId:     string | null
  tableNumber: string | null
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: { token: null, tableId: null, tableNumber: null } as SessionState,
  reducers: {
    setSession(
      state,
      { payload }: PayloadAction<{ token: string; tableId: string; tableNumber: string }>
    ) {
      state.token       = payload.token
      state.tableId     = payload.tableId
      state.tableNumber = payload.tableNumber
    },
    clearSession(state) {
      state.token       = null
      state.tableId     = null
      state.tableNumber = null
    },
  },
})

export const { setSession, clearSession } = sessionSlice.actions
export default sessionSlice.reducer
