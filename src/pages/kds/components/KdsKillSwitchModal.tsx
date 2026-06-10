import { X, Search, Power } from 'lucide-react';
import { useState ,useEffect} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import httpClient from '@/services/interceptor';
import { IApiResponse } from '@/shared/types/IApiResponse';
import { Pagination } from '@/shared/components/ui/Pagination';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { IMenuItem } from '@/pages/customer/menu/types';
import { useTranslation } from 'react-i18next';

interface KdsKillSwitchModalProps {
  onClose: () => void;
}

export const KdsKillSwitchModal = ({ onClose }: KdsKillSwitchModalProps) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [confirmItem, setConfirmItem] = useState<{ id: string, name: string, isAvailable: boolean } | null>(null);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  const { data: pageData, isLoading, isFetching } = useQuery({
    queryKey: ['kds', 'menu', 'items', debouncedSearch, page, size],
    queryFn: async () => {
      // Use KDS specific menu endpoint with server-side search and pagination
      const res = await httpClient.get<IApiResponse<any>>('/menu/kds/items', { 
        params: { 
          keyword: debouncedSearch || undefined,
          page,
          size
        } 
      });
      return res.data.data;
    }
  });

  const menuItems: IMenuItem[] = pageData?.content || [];
  const totalElements = pageData?.totalElements || 0;
  const totalPages = pageData?.totalPages || 0;

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      // Call the newly created specific endpoint for KDS
      const res = await httpClient.patch(`/menu/kds/items/${id}/toggle`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || t('kds.killSwitch.successMsg', 'Cập nhật trạng thái món thành công'));
      queryClient.invalidateQueries({ queryKey: ['kds', 'menu', 'items'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'menu'] });
      setConfirmItem(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t('kds.killSwitch.errorMsg', 'Có lỗi xảy ra, không thể cập nhật món'));
      setConfirmItem(null);
    }
  });


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        <div className="p-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-bright">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Power className="w-5 h-5 text-orange-500" />
            {t('kds.killSwitch.title', 'Báo Hết Món / Tắt Món')}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:!bg-surface-variant !text-on-surface-variant">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 border-b border-outline-variant/30">
          <Input
            icon={<Search className="w-5 h-5" />}
            placeholder={t('kds.killSwitch.searchPlaceholder', 'Tìm kiếm món ăn...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !bg-surface-bright !border-outline-variant !text-on-surface"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-surface-bright/50">
          {(isLoading || isFetching) ? (
            <div className="flex justify-center p-8 text-on-surface-variant">{t('kds.killSwitch.searching', 'Đang tìm kiếm món...')}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {menuItems.map(item => (
                <div 
                  key={item.id} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    item.isAvailable 
                      ? 'bg-surface border-outline-variant' 
                      : 'bg-error-container/30 border-error/30'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className={`font-bold truncate ${!item.isAvailable ? 'text-error line-through opacity-70' : 'text-on-surface'}`}>
                      {item.name}
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {item.station || t('kds.killSwitch.noStation', 'Chưa phân trạm')}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setConfirmItem({ id: item.id, name: item.name, isAvailable: item.isAvailable })}
                    disabled={toggleMutation.isPending && confirmItem?.id === item.id}
                    variant={item.isAvailable ? 'ghost' : 'primary'}
                    className={`whitespace-nowrap px-4 py-1.5 ${
                      item.isAvailable
                        ? '!bg-error/10 !text-error hover:!bg-error/20'
                        : '!bg-primary !text-on-primary hover:!bg-primary/90'
                    }`}
                  >
                    {item.isAvailable ? t('kds.killSwitch.markOut', 'Báo Hết') : t('kds.killSwitch.markAvailable', 'Mở Lại')}
                  </Button>
                </div>
              ))}
            </div>
          )}
          {menuItems.length === 0 && !isLoading && !isFetching && (
            <div className="text-center p-8 text-on-surface-variant">
              {t('kds.killSwitch.noResults', 'Không tìm thấy món nào khớp với tìm kiếm.')}
            </div>
          )}
        </div>

        {totalPages > 0 && (
          <div className="border-t border-outline-variant/30 [&_*]:!text-on-surface-variant [&_input]:!bg-surface-bright [&_button]:!text-on-surface">
            <Pagination
              currentPage={page}
              pageSize={size}
              totalElements={totalElements}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setSize(newSize);
                setPage(0);
              }}
              pageSizeOptions={[15, 30, 45, 60]}
              className="!bg-surface !border-none !py-2"
            />
          </div>
        )}
      </div>

      {confirmItem && (
        <ConfirmDialog
          isOpen={true}
          onCancel={() => setConfirmItem(null)}
          onConfirm={() => toggleMutation.mutate(confirmItem.id)}
          title={confirmItem.isAvailable ? t('kds.killSwitch.confirmOutTitle', 'Xác nhận báo hết món') : t('kds.killSwitch.confirmInTitle', 'Xác nhận mở lại món')}
          description={confirmItem.isAvailable 
            ? t('kds.killSwitch.confirmOutDesc', 'Bạn có chắc chắn muốn báo hết món "{{name}}" không?', { name: confirmItem.name })
            : t('kds.killSwitch.confirmInDesc', 'Bạn có chắc chắn muốn mở lại món "{{name}}" không?', { name: confirmItem.name })
          }
          confirmText={confirmItem.isAvailable ? t('kds.killSwitch.markOut', 'Báo Hết') : t('kds.killSwitch.markAvailable', 'Mở Lại')}
          cancelText={t('common.cancel', 'Hủy')}
          variant={confirmItem.isAvailable ? 'danger' : 'info'}
          isLoading={toggleMutation.isPending}
        />
      )}
    </div>
  );
};
