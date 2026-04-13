import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as ReduxProvider }        from 'react-redux'
import { PersistGate }                      from 'redux-persist/integration/react'

import { useEffect }                        from 'react'
import type { ReactNode }                   from 'react'
import { useTranslation }                   from 'react-i18next'
import { store, persistor }                 from '@/store'
import { useAppSelector }                   from '@/store/hooks'

import { WebSocketProvider } from '@/contexts/WebSocketContext'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:           30_000,
      retry:               1,
      refetchOnWindowFocus: false,
    },
  },
})

/** Syncs persisted language preference from Redux into i18next on mount */
function LanguageSyncer() {
  const { i18n }  = useTranslation()
  const language  = useAppSelector(state => state.ui.language)

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <WebSocketProvider>
            <LanguageSyncer />
            {children}
          </WebSocketProvider>
        </QueryClientProvider>
      </PersistGate>
    </ReduxProvider>
  )
}
