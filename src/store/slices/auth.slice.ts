import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IUser } from '@/pages/auth/types/auth.type'
import type { IRole } from '@/shared/constants/ROLE'

interface AuthState {
  user:         IUser | null
  accessToken:  string | null
  refreshToken: string | null
  role:         IRole | null
}

const initialState: AuthState = { user: null, accessToken: null, refreshToken: null, role: null }

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }: PayloadAction<{ user: IUser; accessToken: string; refreshToken: string }>) {
      state.user         = payload.user
      state.accessToken  = payload.accessToken
      state.refreshToken = payload.refreshToken
      state.role         = payload.user.role
    },
    setTokens(state, { payload }: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken  = payload.accessToken
      state.refreshToken = payload.refreshToken
    },
    logout(state) {
      state.user         = null
      state.accessToken  = null
      state.refreshToken = null
      state.role         = null
    },
  },
})

export const { setCredentials, setTokens, logout } = authSlice.actions
export default authSlice.reducer
