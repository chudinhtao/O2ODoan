import { createRoot }  from 'react-dom/client'
import { AppProviders } from '@/providers/AppProviders'
import { AppRouter }    from './AppRouter'
import { Toaster } from 'sonner'
import './config/i18n'
import './index.css'

createRoot(document.getElementById('root')!).render(
    <AppProviders>
      <Toaster 
        position="top-right" 
        richColors 
        expand={true}
        toastOptions={{
          style: {
            width: '350px',
            fontSize: '14px',
            padding: '16px'
          }
        }}
      />
      <AppRouter />
    </AppProviders>
)
