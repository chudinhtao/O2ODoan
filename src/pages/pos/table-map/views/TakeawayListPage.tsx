import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useActiveTakeaways } from '../hooks/usePosTables'
import { PosTableGrid } from '../components/PosTableGrid'
import { Button } from '@/shared/components/ui/Button'
import { ShoppingBag } from 'lucide-react'
import { PosHeader } from '@/layouts/components/PosHeader'

export default function TakeawayListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: takeaways, isLoading } = useActiveTakeaways()

  const activeCount = takeaways?.filter(t => t.status === 'OCCUPIED').length || 0
  const waitingPaymentCount = takeaways?.filter(t => t.status === 'PAYMENT_REQUESTED').length || 0

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface">
      <PosHeader
        title={t('pos.takeaway.title', 'Đơn Mang Về')}
        subtitle={
          <>
            <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              {t('pos.tableMap.stats.using', { count: activeCount })}
            </span>
            <span className="bg-error/10 text-error px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
              {t('pos.tableMap.stats.waiting', { count: waitingPaymentCount })}
            </span>
          </>
        }
        actions={
          <Button
            id="btn-create-takeaway"
            variant="primary"
            onClick={() => navigate('/pos/orders/new/takeaway')}
            className="bg-primary hover:brightness-110 text-on-primary px-4 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm whitespace-nowrap h-9 transition-all"
          >
            <ShoppingBag className="size-3.5" />
            <span className="hidden sm:inline">{t('pos.tableMap.takeaway', 'Tạo Mang Về')}</span>
          </Button>
        }
      />
      
      <main className="flex-1 p-3 lg:p-4 overflow-y-auto">

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
