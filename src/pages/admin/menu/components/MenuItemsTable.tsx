import { useTranslation } from 'react-i18next'
import { Edit, Star as StarIcon, Eye, EyeOff, Trash2, RotateCcw, ShieldBan } from 'lucide-react'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import type { IMenuItem } from '../types/adminMenu.type'
import { StationBadge } from '@/shared/components/ui/StationBadge'
import { cloudinaryService } from '@/shared/services/cloudinary.service'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'

interface Props {
  items: IMenuItem[]
  isLoading: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
  onHardDelete: (id: string) => void
  onToggleStatus: (id: string) => void
  page?: number
  pageSize?: number
  keyword: string
  onSearchChange: (val: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  totalElements: number
  filtersNode?: React.ReactNode
  advancedFiltersNode?: React.ReactNode
  leftToolbarNode?: React.ReactNode
}

export function MenuItemsTable({ 
  items, 
  isLoading, 
  onEdit, 
  onDelete, 
  onRestore, 
  onHardDelete, 
  onToggleStatus,
  page = 0,
  pageSize = 20,
  keyword,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  totalElements,
  filtersNode,
  advancedFiltersNode,
  leftToolbarNode
}: Props) {
  const { t } = useTranslation()

  const columns: ColumnDef<IMenuItem>[] = [
    {
      header: 'STT',
      accessorKey: 'id',
      cell: (_, index) => (
        <span className="text-slate-400 font-bold text-xs">{(page * pageSize) + index + 1}</span>
      ),
      width: '50px',
      align: 'center'
    },
    {
      header: t('admin.menu.table.image', 'Hình ảnh'),
      accessorKey: 'imageUrl',
      cell: (item) => (
        <div 
          className="w-12 h-12 rounded-lg bg-slate-100 bg-cover bg-center border border-slate-200" 
          style={{backgroundImage: `url('${item.imageUrl ? cloudinaryService.getOptimizedUrl(item.imageUrl, { width: 100, height: 100 }) : 'https://placehold.co/100x100?text=Food'}')`}}
        ></div>
      ),
      width: '70px',
      align: 'center'
    },
    {
      header: t('admin.menu.table.name', 'Tên món'),
      accessorKey: 'name',
      width: '25%',
      align: 'center',
      cell: (item) => (
        <p className={`font-semibold ${!item.isActive ? 'text-slate-500 line-through' : 'text-slate-800'} text-center`} title={item.name}>
          {item.name}
        </p>
      )
    },
    {
      header: t('admin.menu.table.category', 'Danh mục'),
      accessorKey: 'categoryName',
      align: 'center',
      cell: (item) => (
        <p className="text-sm text-slate-600 text-center" title={item.categoryName || item.categoryId || ''}>
          {item.categoryName || item.categoryId || '—'}
        </p>
      ),
      width: '180px'
    },
    {
      header: t('admin.menu.table.basePrice', 'Giá bán'),
      accessorKey: 'basePrice',
      align: 'center',
      width: '15%',
      cell: (item) => (
        <div className={`flex flex-col items-center justify-center gap-0.5 group w-full ${item.isActive ? 'cursor-pointer' : ''}`} onClick={() => item.isActive && onEdit(item.id)}>
          {item.salePrice && item.salePrice < item.basePrice ? (
            <>
              <span className="text-red-500 text-base md:text-lg tracking-tight font-bold">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.salePrice)}
              </span>
              <span className="text-slate-400 text-[10px] line-through font-normal">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.basePrice)}
              </span>
            </>
          ) : (
            <span className="text-slate-800 text-sm md:text-base font-bold">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.basePrice)}
            </span>
          )}
        </div>
      )
    },
    {
      header: t('admin.menu.table.status', 'Trạng thái'),
      accessorKey: 'isActive',
      cell: (item) => (
        <div className="flex flex-col items-center justify-center gap-1 w-full">
          {!item.isActive ? (
            <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-red-50 text-red-500 w-fit whitespace-nowrap border border-red-100">{t('admin.menu.table.statusHidden', 'Đang ẩn')}</span>
          ) : item.isAvailable ? (
            <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-600 w-fit whitespace-nowrap border border-emerald-100">{t('admin.menu.table.statusSelling', 'Đang bán')}</span>
          ) : (
            <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-amber-50 text-amber-600 w-fit whitespace-nowrap border border-amber-100">{t('admin.menu.table.statusSoldOut', 'Hết hàng')}</span>
          )}
        </div>
      ),
      align: 'center',
      width: '120px'
    },
    {
      header: t('admin.menu.table.station', 'Quầy'),
      accessorKey: 'station',
      align: 'center',
      cell: (item) => (
        <div className="flex justify-center w-full">
          <StationBadge station={item.station} />
        </div>
      ),
      width: '120px'
    },
    {
      header: t('admin.menu.table.featured', 'Nổi bật'),
      accessorKey: 'isFeatured',
      cell: (item) => (
        <div className="flex justify-center w-full">
          {item.isFeatured ? (
            <StarIcon className="w-5 h-5 text-amber-400 fill-amber-400" />
          ) : (
            <StarIcon className="w-5 h-5 text-slate-300" />
          )}
        </div>
      ),
      align: 'center',
      width: '80px'
    },
    {
      header: t('admin.menu.table.actions', 'Thao tác'),
      align: 'center',
      cell: (item) => (
        <div className="flex justify-center w-full">
          <DropdownMenu
            items={item.isActive ? [
              {
                label: t('admin.menu.filters.toggleVisibility', 'Đổi trạng thái'),
                icon: item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />,
                onClick: () => onToggleStatus(item.id)
              },
              {
                label: t('admin.menu.table.edit', 'Sửa'),
                icon: <Edit className="w-4 h-4" />,
                onClick: () => onEdit(item.id)
              },
              {
                label: t('admin.menu.table.delete', 'Lưu trữ'),
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => onDelete(item.id)
              }
            ] : [
              {
                label: t('admin.menu.table.restore', 'Khôi phục'),
                icon: <RotateCcw className="w-4 h-4 text-emerald-500" />,
                onClick: () => onRestore(item.id)
              },
              {
                label: t('admin.menu.table.hardDelete', 'Xóa vĩnh viễn'),
                icon: <ShieldBan className="w-4 h-4" />,
                variant: 'danger',
                onClick: () => onHardDelete(item.id)
              }
            ]}
          />
        </div>
      ),
      width: '120px'
    }
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      <DataTable<IMenuItem>
        columns={columns}
        data={items}
        isLoading={isLoading}
        searchPlaceholder={t('admin.menu.filters.search', 'Tìm kiếm món ăn...')}
        searchValue={keyword}
        onSearchChange={onSearchChange}
        leftToolbar={leftToolbarNode}
        filters={filtersNode}
        advancedFilters={advancedFiltersNode}
        pagination={{
          currentPage: page,
          pageSize: pageSize,
          totalElements: totalElements,
          totalPages: Math.ceil(totalElements / pageSize),
          onPageChange: onPageChange,
          onPageSizeChange: onPageSizeChange
        }}
      />
    </div>
  )
}
