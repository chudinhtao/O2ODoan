import { StrictMode } from 'react'
import { createRoot }  from 'react-dom/client'
import { AppProviders } from '@/providers/AppProviders'
import { AppRouter }    from './AppRouter'
import { Toaster } from 'sonner'
import './config/i18n'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)
