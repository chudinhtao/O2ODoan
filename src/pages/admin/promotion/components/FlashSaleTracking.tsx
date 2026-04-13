import { Zap, Clock, Trash2, Search, Tags } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useAdminMenuItems } from '../../menu/hooks/useMenuQueries'
import { adminMenuService } from '../../menu/services/adminMenu.service'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import { Input } from '@/shared/components/ui/Input'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { IMenuItem } from '../../menu/types/adminMenu.type'
import { usePromotions, useDeletePromotion, useHardDeletePromotion, useTogglePromotionStatus } from '../hooks/usePromotions'
import { PromotionsTable } from './PromotionsTable'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Pagination } from '@/shared/components/ui/Pagination'
import { useState, useMemo } from 'react'

export function FlashSaleTracking() {
  const { t } = useTranslation()
  const { data: menuPage, isLoading: isLoadingMenu, refetch: refetchMenu } = useAdminMenuItems({ page: 0, size: 500 }) // Lấy nhiều để filter client-side
  const { data: promoPage, isLoading: isLoadingPromos } = usePromotions({ page: 0, size: 100, keyword: '' })

  const deleteMutation = useDeletePromotion()
  const hardDeleteMutation = useHardDeletePromotion()
  const toggleMutation = useTogglePromotionStatus()
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string; mode: 'soft' | 'hard' }>({
    isOpen: false,
    id: '',
    name: '',
    mode: 'soft'
  })

  // Pagination states
  const [campaignPage, setCampaignPage] = useState(0)
  const [campaignPageSize, setCampaignPageSize] = useState(10)
  const [itemPage, setItemPage] = useState(0)
  const [itemPageSize, setItemPageSize] = useState(24)

  // Item filters states
  const [itemSearch, setItemSearch] = useState('')
  const [itemCategory, setItemCategory] = useState('ALL')

  const campaigns = useMemo(() =>
    (promoPage?.content || []).filter(p => p.type === 'FLASH_SALE'),
    [promoPage])

  // Filter items that have salePrice
  const flashSaleItems = useMemo(() => {
    const items: IMenuItem[] = menuPage?.content || []
    return items.filter((item: IMenuItem) => item.salePrice !== null && item.salePrice !== undefined)
  }, [menuPage])

  const filteredFlashSaleItems = useMemo(() => {
    let filtered = [...flashSaleItems]

    if (itemSearch) {
      const kw = itemSearch.toLowerCase().trim()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(kw) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(kw))
      )
    }

    if (itemCategory !== 'ALL') {
      filtered = filtered.filter(item => item.categoryId === itemCategory)
    }

    return filtered
  }, [flashSaleItems, itemSearch, itemCategory])

  const saleCategories = useMemo(() => {
    const cats = new Map<string, string>()
    flashSaleItems.forEach(item => {
      if (item.categoryId && item.categoryName) {
        cats.set(item.categoryId, item.categoryName)
      }
    })
    return Array.from(cats.entries()).map(([id, name]) => ({ value: id, label: name }))
  }, [flashSaleItems])

  const paginatedCampaigns = useMemo(() =>
    campaigns.slice(campaignPage * campaignPageSize, (campaignPage + 1) * campaignPageSize),
    [campaigns, campaignPage, campaignPageSize])

  const paginatedItems = useMemo(() =>
    filteredFlashSaleItems.slice(itemPage * itemPageSize, (itemPage + 1) * itemPageSize),
    [filteredFlashSaleItems, itemPage, itemPageSize])

  const handleRemoveSale = async (itemId: string) => {
    try {
      await adminMenuService.bulkUpdateSalePrice({
        itemIds: [itemId],
        clear: true
      })
      toast.success(t('admin.promotion.flashSaleTracking.removeSuccess'))
      refetchMenu()
    } catch {
      toast.error(t('admin.promotion.flashSaleTracking.removeError'))
    }
  }

  if (isLoadingMenu || isLoadingPromos) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tertiary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col p-4 md:p-6 pb-2 space-y-6">

      {/* Campaigns Section */}
      <div className="bg-surface-bright rounded-xl shadow-sm border border-outline-variant p-4">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-4">
          <Zap className="size-5 text-tertiary fill-tertiary" />
          {t('admin.promotion.flashSaleTracking.title')}
        </h3>

        {campaigns.length === 0 ? (
          <div className="text-center p-8 bg-surface-container rounded-xl">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">event_busy</span>
            <p className="text-on-surface-variant font-medium">{t('admin.promotion.flashSaleTracking.emptyCampaigns')}</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <PromotionsTable
              data={paginatedCampaigns}
              isLoading={isLoadingPromos}
              variant="flash_sale"
              startIndex={campaignPage * campaignPageSize}
              onEdit={() => { /* Edit currently not supported for Flash Sale */ }}
              onDelete={(id, name) => setDeleteDialog({ isOpen: true, id, name, mode: 'soft' })}
              onRestore={(id) => toggleMutation.mutate(id)}
              onHardDelete={(id, name) => setDeleteDialog({ isOpen: true, id, name, mode: 'hard' })}
            />
            {campaigns.length > campaignPageSize && (
              <Pagination
                currentPage={campaignPage}
                pageSize={campaignPageSize}
                totalElements={campaigns.length}
                totalPages={Math.ceil(campaigns.length / campaignPageSize)}
                onPageChange={setCampaignPage}
                onPageSizeChange={(size) => { setCampaignPageSize(size); setCampaignPage(0); }}
                pageSizeOptions={[5, 10, 20]}
                className="border-none"
              />
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.mode === 'soft' ? t('admin.promotion.flashSaleTracking.confirmCancelTitle') : t('admin.promotion.hardDeleteTitle')}
        description={deleteDialog.mode === 'soft'
          ? t('admin.promotion.flashSaleTracking.confirmCancelDesc', { name: deleteDialog.name })
          : t('admin.promotion.hardDeleteDesc', { name: deleteDialog.name })
        }
        onConfirm={() => {
          if (deleteDialog.mode === 'soft') {
            deleteMutation.mutate(deleteDialog.id, {
              onSuccess: () => {
                setDeleteDialog({ isOpen: false, id: '', name: '', mode: 'soft' })
                refetchMenu()
              }
            })
          } else {
            hardDeleteMutation.mutate(deleteDialog.id, {
              onSuccess: () => {
                setDeleteDialog({ isOpen: false, id: '', name: '', mode: 'soft' })
                refetchMenu()
              }
            })
          }
        }}
        onCancel={() => setDeleteDialog({ isOpen: false, id: '', name: '', mode: 'soft' })}
      />

      {/* Menu Items tracking section */}
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 px-1">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary shadow-sm border border-tertiary/20">
              <span className="material-symbols-outlined text-[24px]">monitor_heart</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-surface">{t('admin.promotion.flashSaleTracking.itemsTitle')}</h3>
              <p className="text-xs text-on-surface-variant font-medium">{t('admin.promotion.flashSaleTracking.itemsDesc')}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <Input
              type="text"
              placeholder={t('admin.promotion.flashSaleTracking.searchPlaceholder')}
              value={itemSearch}
              onChange={(e) => { setItemSearch(e.target.value); setItemPage(0); }}
              icon={<Search className="size-4 text-slate-400" />}
              className="w-full !py-2.5 !rounded-xl"
            />
            <div className="w-full sm:w-48">
              <Select
                value={itemCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setItemCategory(e.target.value); setItemPage(0); }}
                placement="bottom"
                icon={<Tags className="size-4" />}
                className="!py-2 !rounded-xl !bg-white"
                options={[
                  { value: 'ALL', label: t('admin.promotion.flashSaleTracking.allCategories') },
                  ...saleCategories
                ]}
              />
            </div>
          </div>
        </div>

        {filteredFlashSaleItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-surface-container rounded-3xl min-h-[400px] border-2 border-dashed border-outline-variant/50">
            <div className="size-24 rounded-full bg-surface-dim flex items-center justify-center text-on-surface-variant/30 mb-6 shadow-inner">
              <span className="material-symbols-outlined text-[48px]">search_off</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">{t('admin.promotion.flashSaleTracking.noItemsFound')}</h3>
            <p className="text-on-surface-variant max-w-sm font-medium">{t('admin.promotion.flashSaleTracking.noItemsDesc')}</p>
            {(itemSearch || itemCategory !== 'ALL') && (
              <Button
                variant="ghost"
                onClick={() => { setItemSearch(''); setItemCategory('ALL'); }}
                className="mt-6 !text-primary hover:!bg-primary/5 font-bold !rounded-xl"
              >
                {t('admin.promotion.flashSaleTracking.resetFilters')}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {paginatedItems.map((item: IMenuItem) => {
                const isExpired = item.saleEndAt && new Date(item.saleEndAt) < new Date()
                const isNotStarted = item.saleStartAt && new Date(item.saleStartAt) > new Date()
                const isActive = !isExpired && !isNotStarted
                const discountPercent = Math.round((1 - item.salePrice! / item.basePrice) * 100)

                return (
                  <div
                    key={item.id}
                    className={`group bg-white rounded-[20px] border border-slate-100 p-3 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-amber-100/40 hover:-translate-y-1 ${isActive ? 'ring-1 ring-amber-100/50' : 'opacity-70 grayscale-[0.3]'}`}
                  >
                    {/* Background Glow */}
                    <div className="absolute -right-8 -top-8 size-20 rounded-full bg-amber-400 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className={`backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm border ${isExpired ? 'bg-slate-500/10 text-slate-600 border-slate-200/50' :
                          isNotStarted ? 'bg-blue-500/10 text-blue-600 border-blue-200/50' :
                            'bg-amber-500/10 text-amber-600 border-amber-200/50 animate-pulse'
                        }`}>
                        {isExpired ? t('admin.promotion.flashSaleTracking.statusExpired') : isNotStarted ? t('admin.promotion.flashSaleTracking.statusUpcoming') : t('admin.promotion.flashSaleTracking.statusActive')}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* Image Container */}
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.name}
                          fallback="https://via.placeholder.com/150"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {isActive && (
                          <div className="absolute bottom-3 left-3 flex flex-col items-start gap-1">
                            <div className="bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-black shadow-lg shadow-red-500/30">
                              -{discountPercent}%
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-0.5 mb-1">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em]">{item.categoryName || 'Menu'}</span>
                          <h4 className="font-bold text-slate-900 truncate text-sm group-hover:text-primary transition-colors leading-tight">{item.name}</h4>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-red-500 font-black text-lg tracking-tighter">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.salePrice!)}
                          </span>
                          <span className="text-slate-400 text-[10px] line-through decoration-slate-300 font-medium">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.basePrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-50 space-y-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50/80 p-2 rounded-lg border border-slate-100/50">
                        <Clock className="size-3 text-slate-400" />
                        <span className="truncate">
                          {item.saleStartAt ? new Date(item.saleStartAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '00:00'}
                          {' → '}
                          {item.saleEndAt ? new Date(item.saleEndAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '00/00'}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveSale(item.id)}
                        className="w-full !justify-center !bg-slate-50 hover:!bg-red-50 !text-slate-400 hover:!text-red-500 !h-9 !rounded-lg !text-[10px] font-black uppercase tracking-[0.05em] transition-all border border-slate-100 hover:border-red-100 shadow-sm"
                      >
                        <Trash2 className="size-3.5 mr-1.5" />
                        {t('admin.promotion.flashSaleTracking.removeBtn')}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            <Pagination
              currentPage={itemPage}
              pageSize={itemPageSize}
              totalElements={filteredFlashSaleItems.length}
              totalPages={Math.ceil(filteredFlashSaleItems.length / itemPageSize)}
              onPageChange={setItemPage}
              onPageSizeChange={(size) => { setItemPageSize(size); setItemPage(0); }}
              pageSizeOptions={[12, 24, 60, 120]}
              className="mt-4 rounded-2xl border border-outline-variant shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  )
}
