import { TicketGrid } from '../components/TicketGrid';
import { useKdsQuery } from '../hooks/useKdsQuery';
import { useKdsSocket } from '../hooks/useKdsSocket';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { Button } from '@/shared/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, WifiOff } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/Skeleton';

export const KdsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tickets, isLoading, updateItemStatus, updateTicketStatus, cancelOrderItem } = useKdsQuery();
  const { isConnected } = useKdsSocket();

  const handleItemStatus = (id: string, newStatus: string) => {
    updateItemStatus.mutate({ id, status: newStatus });
  };

  const handleTicketStatus = (id: string, newStatus: string) => {
    updateTicketStatus.mutate({ id, status: newStatus });
  };

  const handleItemCancelRequest = (orderId: string, itemId: string, reason: string) => {
    cancelOrderItem.mutate({ orderId, itemId, reason });
  };

  // Header part
  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 h-16 bg-neutral-800 text-gray-100 shadow-md z-50 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/pos/table-map')}
          className="text-gray-300 hover:text-white hover:bg-white/10"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          {t('kds.header.backToPos')}
        </Button>
        <div className="h-6 w-px bg-gray-700" />
        <h1 className="text-xl font-bold tracking-wide">
          {t('kds.header.title')} <span className="text-orange-500 ml-2 text-sm uppercase px-2 py-0.5 rounded border border-orange-500">{t('kds.header.modeLabel')}</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {!isConnected && (
          <div className="flex items-center text-red-400 text-sm font-medium animate-pulse">
            <WifiOff className="w-4 h-4 mr-1.5" />
            {t('kds.header.offlineMode')}
          </div>
        )}
        <div className="scale-90">
           <LanguageToggle />
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col font-['Inter']">
      {renderHeader()}
      
      <main className="flex-1 mt-16 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white rounded-lg border p-4 h-[300px] flex flex-col gap-3">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <TicketGrid 
            tickets={tickets} 
            onItemStatusChange={handleItemStatus}
            onTicketStatusChange={handleTicketStatus}
            onItemCancelRequest={handleItemCancelRequest}
            isLoading={updateItemStatus.isPending || updateTicketStatus.isPending || cancelOrderItem.isPending}
          />
        )}
      </main>
    </div>
  );
};

export default KdsPage;
