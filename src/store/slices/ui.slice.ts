import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type Language = 'vi' | 'en'

interface UIState {
  language: Language
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { language: 'vi' } as UIState,
  reducers: {
    setLanguage(state, { payload }: PayloadAction<Language>) {
      state.language = payload
    },
  },
})

export const { setLanguage } = uiSlice.actions
export default uiSlice.reducer
