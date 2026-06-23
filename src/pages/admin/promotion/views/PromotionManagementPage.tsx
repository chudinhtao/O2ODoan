import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import { 
  Plus, FilterX, Filter, TicketPercent, Edit, Trash2, Trash, RotateCcw, 
  Percent, Banknote, Zap, Ticket, ShoppingCart, Tag, Package 
} from 'lucide-react'
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Button } from '@/shared/components/ui/Button'
import { Select } from '@/shared/components/ui/Select'
import {
  usePromotions,
  useDeletePromotion,
  useHardDeletePromotion,
  useTogglePromotionStatus,
} from '../hooks/usePromotions'
import { usePromotionFilters } from '../hooks/usePromotionFilters'
import { ROUTES } from '@/shared/constants/ROUTES'
import { ExportButton } from '@/shared/components/ExportButton'
import type { 
  IPromotion, 
  PromotionDiscountType, 
  PromotionScope, 
  PromotionTriggerType 
} from '../types/adminPromotion.type'
import type { ColumnDef } from '@/shared/components/DataTable/types'

// ── Badge lookup maps ──────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

const formatDate = (d: string | null) => {
  if (!d) return '—'
  try { return format(new Date(d), 'HH:mm dd/MM/yy') } catch { return d }
}

const formatDiscountValue = (value: number | null, type: PromotionDiscountType) => {
  if (value == null) return '—'
  return type === 'PERCENT' ? `${value}%` : `${fmt(value)}đ`
}



// ── Badge helper ───────────────────────────────────────────────────────────────
function Badge({ icon: Icon, label, cls }: { icon?: React.ElementType; label: string; cls: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-md border ${cls}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  )
}

export default function PromotionManagementPage() {
  const { t, i18n } = useTranslation()

  const scopeBadge: Record<PromotionScope, { label: string; cls: string; icon: typeof Tag }> = {
    ORDER:   { label: t('admin.promotions.table.scopeOrder', 'Đơn hàng'), cls: 'bg-blue-50 text-blue-600 border-blue-100',    icon: ShoppingCart },
    PRODUCT: { label: t('admin.promotions.table.scopeProduct', 'Sản phẩm'), cls: 'bg-green-50 text-green-600 border-green-100', icon: Tag },
    BUNDLE:  { label: t('admin.promotions.table.scopeBundle', 'Combo'),    cls: 'bg-amber-50 text-amber-600 border-amber-100', icon: Package },
  }
  const discountBadge: Record<PromotionDiscountType, { label: string; cls: string; icon: typeof Percent }> = {
    PERCENT:    { label: t('admin.promotions.table.discountPercent', '%'),        cls: 'bg-primary/10 text-primary border-primary/20',       icon: Percent },
    FIX_AMOUNT: { label: t('admin.promotions.table.discountFixAmount', 'Cố định'), cls: 'bg-secondary/10 text-secondary border-secondary/20', icon: Banknote },
    FIX_PRICE:  { label: t('admin.promotions.table.discountFixPrice', 'Giá cố'),  cls: 'bg-rose-50 text-rose-600 border-rose-100',           icon: Banknote },
  }
  const triggerBadge: Record<PromotionTriggerType, { label: string; cls: string; icon: typeof Zap }> = {
    AUTO:   { label: t('admin.promotions.table.triggerAuto', 'Tự động'), cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: Zap },
    COUPON: { label: t('admin.promotions.table.triggerCoupon', 'Coupon'),  cls: 'bg-teal-50 text-teal-600 border-teal-100',     icon: Ticket },
  }
  const statusBadge: Record<IPromotion['displayStatus'], { label: string; cls: string }> = {
    ACTIVE:    { label: t('admin.promotions.table.statusActive', '● Đang chạy'), cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    SCHEDULED: { label: t('admin.promotions.table.statusScheduled', '◔ Sắp tới'),  cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    EXPIRED:   { label: t('admin.promotions.table.statusExpired', '○ Hết hạn'),  cls: 'bg-rose-50 text-rose-600 border-rose-200 opacity-80' },
    DISABLED:  { label: t('admin.promotions.table.statusDisabled', '◌ Tạm dừng'), cls: 'bg-slate-50 text-slate-500 border-slate-200' },
  }

  const navigate = useNavigate()
  const { data: pageData, isLoading } = usePromotions({ page: 0, size: 200, keyword: '' })

  const {
    filters,
    isFiltersExpanded,
    setIsFiltersExpanded,
    hasActiveFilters,
    filteredData,
    paginatedData,
    totalPages,
    actions,
  } = usePromotionFilters(pageData?.content || [])

  const deleteMutation    = useDeletePromotion()
  const hardDeleteMutation = useHardDeletePromotion()
  const toggleMutation    = useTogglePromotionStatus()

  const [deleteDialog, setDeleteDialog]         = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' })
  const [hardDeleteDialog, setHardDeleteDialog] = useState<{ isOpen: boolean; id: string; name: string }>({ isOpen: false, id: '', name: '' })

  const handleCreate = () => navigate(ROUTES.admin.promotionCreate)
  const handleEdit   = (promo: IPromotion) => navigate(ROUTES.admin.promotionEdit.replace(':id', promo.id))

  // ── Column definitions ───────────────────────────────────────────────────────
  const columns: ColumnDef<IPromotion>[] = [
    {
      header: '#',
      align: 'center',
      width: '50px',
      className: 'w-12',
      cell: (_, idx) => (
        <span className="text-slate-400 font-medium text-sm">
          {filters.currentPage * filters.pageSize + idx + 1}
        </span>
      ),
    },
    {
      header: t('admin.promotions.table.codeName', 'Mã / Tên'),
      width: '25%',
      cell: (p) => (
        <div>
          <div className="font-mono font-bold text-primary text-sm tracking-wider">
            {p.code ?? <span className="text-slate-400 font-normal text-xs">{t('admin.promotions.table.noCode', 'Không có mã')}</span>}
          </div>
          <div className="text-sm text-slate-700 font-semibold mt-0.5">{p.name}</div>
          {p.stackable && (
            <span className="text-[10px] text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded mt-1 inline-block">⚡ Stackable</span>
          )}
        </div>
      ),
    },
    {
      header: t('admin.promotions.table.scope', 'Phạm vi'),
      width: '120px',
      cell: (p) => { const s = scopeBadge[p.scope] ?? scopeBadge.ORDER; return <Badge icon={s.icon} label={s.label} cls={s.cls} /> },
    },
    {
      header: t('admin.promotions.table.trigger', 'Kích hoạt'),
      width: '120px',
      cell: (p) => { const tr = triggerBadge[p.triggerType] ?? triggerBadge.AUTO; return <Badge icon={tr.icon} label={tr.label} cls={tr.cls} /> },
    },
    {
      header: t('admin.promotions.table.discountType', 'Loại giảm'),
      width: '120px',
      cell: (p) => { const d = discountBadge[p.discountType] ?? discountBadge.PERCENT; return <Badge icon={d.icon} label={d.label} cls={d.cls} /> },
    },
    {
      header: t('admin.promotions.table.discountValue', 'Giá trị'),
      align: 'right',
      width: '120px',
      cell: (p) => (
        <div>
          <span className="text-sm font-bold text-slate-800">{formatDiscountValue(p.discountValue, p.discountType)}</span>
          {p.maxDiscount && p.discountType === 'PERCENT' && (
            <div className="text-[10px] text-slate-400">{t('admin.promotions.table.maxDiscount', 'tối đa')} {fmt(p.maxDiscount)}đ</div>
          )}
        </div>
      ),
    },
    {
      header: t('admin.promotions.table.usage', 'Lượt dùng'),
      align: 'center',
      width: '100px',
      cell: (p) => (
        <div>
          <span className="text-sm font-bold text-slate-700">{p.usedCount}</span>
          {p.usageLimit && <div className="text-[10px] text-slate-400">/ {p.usageLimit}</div>}
        </div>
      ),
    },
    {
      header: t('admin.promotions.table.validity', 'Hiệu lực'),
      width: '150px',
      cell: (p) => (
        <div className="text-xs text-slate-500 whitespace-nowrap">
          <div>{formatDate(p.startAt)}</div>
          <div className="text-slate-300">→ {formatDate(p.endAt)}</div>
        </div>
      ),
    },
    {
      header: t('admin.promotions.table.status', 'Trạng thái'),
      align: 'center',
      width: '120px',
      cell: (p) => {
        const s = statusBadge[p.displayStatus]
        return <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-md border min-w-[90px] ${s.cls}`}>{s.label}</span>
      },
    },
    {
      header: t('admin.promotions.table.actions', 'Thao tác'),
      align: 'right',
      width: '100px',
      cell: (p) => (
        <DropdownMenu
          items={[
            {
              label: t('admin.promotions.actions.edit', 'Chỉnh sửa'),
              icon: <Edit className="w-4 h-4" />,
              onClick: () => handleEdit(p)
            },
            {
              label: p.active ? t('admin.promotions.actions.pause', 'Tạm dừng') : t('admin.promotions.actions.reactivate', 'Kích hoạt lại'),
              icon: <RotateCcw className={`w-4 h-4 ${p.active ? 'text-amber-500' : 'text-emerald-500'}`} />,
              onClick: () => toggleMutation.mutate(p.id)
            },
            {
              label: t('admin.promotions.actions.archive', 'Ẩn chương trình'),
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => setDeleteDialog({ isOpen: true, id: p.id, name: p.name })
            },
            {
              label: t('admin.promotions.actions.hardDelete', 'Xóa vĩnh viễn'),
              icon: <Trash className="w-4 h-4" />,
              variant: 'danger',
              onClick: () => setHardDeleteDialog({ isOpen: true, id: p.id, name: p.name })
            }
          ]}
        />
      ),
    },
  ]

  // ── Filter toolbar node ──────────────────────────────────────────────────────
  const filtersNode = (
    <Button
      variant="ghost"
      onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
      className={`!px-3 !py-2 !rounded-lg !text-sm border-none ${hasActiveFilters ? '!bg-primary/10 !text-primary' : '!bg-slate-100 !text-slate-600'}`}
    >
      {isFiltersExpanded ? <FilterX size={15} className="mr-1.5" /> : <Filter size={15} className="mr-1.5" />}
      {t('admin.promotions.filters.btn', 'Bộ lọc')}
      {hasActiveFilters && <span className="ml-1.5 w-2 h-2 rounded-full bg-primary inline-block" />}
    </Button>
  )

  const advancedFiltersNode = isFiltersExpanded ? (
    <div className="flex items-center gap-2 pt-2">
      <Select
        value={filters.selectedStatus}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => actions.handleStatusChange(e.target.value)}
        className="!py-1.5 !text-sm flex-1"
        options={[
          { value: 'ALL', label: t('admin.promotions.filters.statusAll', 'Tất cả trạng thái') },
          { value: 'ACTIVE', label: t('admin.promotions.filters.statusActive', 'Đang chạy') },
          { value: 'INACTIVE', label: t('admin.promotions.filters.statusInactive', 'Tạm dừng') },
        ]}
      />
      <Select
        value={filters.selectedScope}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => actions.handleScopeChange(e.target.value)}
        className="!py-1.5 !text-sm flex-1"
        options={[
          { value: 'ALL', label: t('admin.promotions.filters.scopeAll', 'Tất cả phạm vi') },
          { value: 'ORDER', label: t('admin.promotions.table.scopeOrder', 'Đơn hàng') },
          { value: 'PRODUCT', label: t('admin.promotions.table.scopeProduct', 'Sản phẩm') },
          { value: 'BUNDLE', label: t('admin.promotions.table.scopeBundle', 'Combo') },
        ]}
      />
      <Select
        value={filters.selectedTrigger}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => actions.handleTriggerChange(e.target.value)}
        className="!py-1.5 !text-sm flex-1"
        options={[
          { value: 'ALL', label: t('admin.promotions.filters.triggerAll', 'Tất cả kích hoạt') },
          { value: 'AUTO', label: t('admin.promotions.table.triggerAuto', 'Tự động') },
          { value: 'COUPON', label: t('admin.promotions.table.triggerCoupon', 'Mã Coupon') },
        ]}
      />
      <Select
        value={filters.selectedDiscountType}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => actions.handleDiscountTypeChange(e.target.value)}
        className="!py-1.5 !text-sm flex-1"
        options={[
          { value: 'ALL', label: t('admin.promotions.filters.discountAll', 'Tất cả loại giảm') },
          { value: 'PERCENT', label: '% ' + t('admin.promotions.table.discountPercent', 'Phần trăm') },
          { value: 'FIX_AMOUNT', label: 'đ ' + t('admin.promotions.table.discountFixAmount', 'Số tiền cố định') },
          { value: 'FIX_PRICE', label: 'đ ' + t('admin.promotions.table.discountFixPrice', 'Giá cố định') },
        ]}
      />
      {hasActiveFilters && (
        <Button variant="ghost" onClick={actions.handleResetFilters}
          className="!px-3 !py-1.5 !text-sm !text-rose-500 !bg-rose-50 hover:!bg-rose-100 !rounded-lg border-none shrink-0">
          <FilterX className="w-4 h-4 mr-1" />
          {t('admin.promotions.filters.reset', 'Bỏ lọc')}
        </Button>
      )}
    </div>
  ) : undefined

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
      <AdminPageHeader
        title={t('admin.promotions.title', 'Quản lý Khuyến mãi')}
        description={t('admin.promotions.description', '{{count}} chương trình khuyến mãi', { count: filteredData.length })}
        actions={
          <div className="flex items-center gap-2">
            <ExportButton
              data={filteredData.map(promo => ({
                ...promo,
                code: promo.code || t('admin.promotions.table.noCode', 'Không có mã'),
                startDate: promo.startAt ? new Date(promo.startAt).toLocaleDateString('vi-VN') : '—',
                endDate: promo.endAt ? new Date(promo.endAt).toLocaleDateString('vi-VN') : '—',
                usedCount: promo.usedCount || 0,
                usageLimit: promo.usageLimit || '—',
                discountValueFormatted: promo.discountType === 'PERCENT' ? `${promo.discountValue}%` : `${promo.discountValue?.toLocaleString()} đ`,
                discountTypeLabel: t(`admin.promotions.table.discount${promo.discountType === 'PERCENT' ? 'Percent' : promo.discountType === 'FIX_AMOUNT' ? 'FixAmount' : 'FixPrice'}`),
                triggerTypeLabel: t(`admin.promotions.table.trigger${promo.triggerType === 'AUTO' ? 'Auto' : 'Coupon'}`),
                scopeLabel: t(`admin.promotions.table.scope${promo.scope === 'PRODUCT' ? 'Product' : promo.scope === 'ORDER' ? 'Order' : 'Bundle'}`),
                displayStatusLabel: t(`admin.promotions.table.status${promo.displayStatus.charAt(0).toUpperCase() + promo.displayStatus.slice(1).toLowerCase()}`)
              }))}
              fileName={t('admin.promotions.export.fileName', 'Danh_sach_khuyen_mai')}
              sheetName={t('admin.promotions.export.sheetName', 'KhuyenMai')}
              headers={{
                'code': t('admin.promotions.export.colCode', 'Mã Coupon'),
                'name': t('admin.promotions.export.colName', 'Tên chương trình'),
                'description': t('admin.promotions.export.colDesc', 'Mô tả'),
                'discountValueFormatted': t('admin.promotions.export.colVal', 'Giá trị giảm'),
                'discountTypeLabel': t('admin.promotions.export.colType', 'Loại giảm'),
                'triggerTypeLabel': t('admin.promotions.export.colTrigger', 'Cách thức'),
                'scopeLabel': t('admin.promotions.export.colScope', 'Áp dụng'),
                'startDate': t('admin.promotions.export.colStart', 'Ngày bắt đầu'),
                'endDate': t('admin.promotions.export.colEnd', 'Ngày kết thúc'),
                'usedCount': t('admin.promotions.export.colUsed', 'Lượt dùng'),
                'usageLimit': t('admin.promotions.export.colLimit', 'Giới hạn sử dụng'),
                'displayStatusLabel': t('admin.promotions.export.colStatus', 'Trạng thái')
              }}
            />
            <Button onClick={handleCreate} className="!px-3 sm:!px-4 !py-2 !rounded-lg !text-sm gap-1.5 shrink-0">
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">
                {t('admin.promotions.createBtn', 'Tạo Khuyến mãi')}
              </span>
              <span className="inline sm:hidden">
                {t('admin.promotions.createBtnMobile', i18n.language === 'en' ? 'Create' : 'Tạo')}
              </span>
            </Button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 flex flex-col px-4 lg:px-6 pt-4 pb-4 md:pb-6">
        <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder={t('admin.promotions.search', 'Tìm theo tên hoặc mã coupon...')}
        searchValue={filters.search}
        onSearchChange={actions.handleSearchChange}
        filters={filtersNode}
        advancedFilters={advancedFiltersNode}
        emptyState={
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <TicketPercent className="w-12 h-12 text-slate-200 mb-3" />
            <p className="font-semibold text-slate-600">{t('admin.promotions.emptyTitle', 'Chưa có chương trình khuyến mãi nào')}</p>
            <p className="text-sm mt-1">{t('admin.promotions.emptySub', 'Nhấn "Tạo mới" để thêm chương trình đầu tiên')}</p>
          </div>
        }
        pagination={{
          currentPage: filters.currentPage,
          totalPages,
          totalElements: filteredData.length,
          pageSize: filters.pageSize,
          onPageChange: actions.handlePageChange,
          onPageSizeChange: actions.handlePageSizeChange,
        }}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={t('admin.promotions.dialog.pauseTitle', 'Tạm dừng khuyến mãi')}
        description={t('admin.promotions.dialog.pauseDesc', 'Bạn có chắc muốn tạm dừng "{{name}}"? Bạn có thể kích hoạt lại sau.', { name: deleteDialog.name })}
        onConfirm={() => deleteMutation.mutate(deleteDialog.id, { onSuccess: () => setDeleteDialog({ isOpen: false, id: '', name: '' }) })}
        onCancel={() => setDeleteDialog({ isOpen: false, id: '', name: '' })}
        isLoading={deleteMutation.isPending}
      />
      <ConfirmDialog
        isOpen={hardDeleteDialog.isOpen}
        title={t('admin.promotions.dialog.deleteTitle', 'Xóa vĩnh viễn khuyến mãi')}
        description={t('admin.promotions.dialog.deleteDesc', 'Bạn có chắc muốn xóa vĩnh viễn "{{name}}"? Hành động này không thể hoàn tác.', { name: hardDeleteDialog.name })}
        onConfirm={() => hardDeleteMutation.mutate(hardDeleteDialog.id, { onSuccess: () => setHardDeleteDialog({ isOpen: false, id: '', name: '' }) })}
        onCancel={() => setHardDeleteDialog({ isOpen: false, id: '', name: '' })}
      />
      </div>
    </div>
  )
}
