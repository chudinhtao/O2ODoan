import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useActiveTakeaways } from '../hooks/usePosTables'
import { PosTableGrid } from '../components/PosTableGrid'
import { Button } from '@/shared/components/ui/Button'
import { ShoppingBag } from 'lucide-react'

export default function TakeawayListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: takeaways, isLoading } = useActiveTakeaways()

  const activeCount = takeaways?.filter(t => t.status === 'OCCUPIED').length || 0
  const waitingPaymentCount = takeaways?.filter(t => t.status === 'PAYMENT_REQUESTED').length || 0

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      <main className="flex-grow p-4 lg:p-6 overflow-y-auto">
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black font-headline text-primary tracking-tight mb-3">
              {t('pos.takeaway.title', 'Đơn Mang Về')}
            </h2>
            <div className="flex flex-wrap gap-3">
              <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                {t('pos.tableMap.stats.using', { count: activeCount })}
              </span>
              <span className="bg-tertiary-container/10 text-tertiary-container px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-tertiary-container shrink-0" />
                {t('pos.tableMap.stats.waiting', { count: waitingPaymentCount })}
              </span>
            </div>
          </div>

          <Button
            id="btn-create-takeaway"
            variant="primary"
            onClick={() => navigate('/pos/orders/new/takeaway')}
            className="bg-primary hover:bg-primary/90 text-white px-5 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            <ShoppingBag className="size-4" />
            {t('pos.tableMap.takeaway', 'Tạo Mang Về')}
          </Button>
        </header>

        <PosTableGrid
          tables={takeaways || []}
          isLoading={isLoading}
          isTakeawayMode={true}
          onOpenSession={() => {}}
          onViewOrder={(id) => {
            const item = takeaways?.find(x => x.id === id)
            navigate('/pos/orders/takeaway', { state: { sessionToken: item?.currentSessionToken } })
          }}
          onCheckout={(id) => {
            const item = takeaways?.find(x => x.id === id)
            navigate('/pos/payment/takeaway', { state: { sessionToken: item?.currentSessionToken } })
          }}
          onMarkCleaned={() => {}}
          onTransfer={() => {}}
          onMerge={() => {}}
        />
      </main>
    </div>
  )
}
