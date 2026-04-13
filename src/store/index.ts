import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import authReducer from './slices/auth.slice'
import cartReducer from './slices/cart.slice'
import sessionReducer from './slices/session.slice'
import uiReducer from './slices/ui.slice'

// Custom storage — tránh Vite ESM/CJS conflict với redux-persist/lib/storage
const storage = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, val: string) => Promise.resolve(localStorage.setItem(key, val)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
}

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  session: sessionReducer,
  ui: uiReducer,
})

const persistConfig = {
  key: 'fnb-root',
  storage,
  whitelist: ['auth', 'session', 'ui'],  // ui persist language pref; cart reset khi đóng tab
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
