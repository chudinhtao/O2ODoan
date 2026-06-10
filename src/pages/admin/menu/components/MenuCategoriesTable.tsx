import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Edit, Archive, ShieldBan } from 'lucide-react'
import { DropdownMenu } from '@/shared/components/ui/DropdownMenu'
import type { ICategory } from '../types/adminMenu.type'
import { DataTable } from '@/shared/components/DataTable/DataTable'
import { ColumnDef } from '@/shared/components/DataTable/types'

interface Props {
  categories: ICategory[]
  isLoading: boolean
  onEdit: (id: string) => void
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void
  onHardDelete: (id: string) => void
  page?: number
  pageSize?: number
  keyword: string
  onSearchChange: (val: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  totalElements: number
  leftToolbarNode?: React.ReactNode
}

export function MenuCategoriesTable({ 
  categories, 
  isLoading, 
  onEdit, 
  onToggleStatus, 
  onDelete, 
  onHardDelete,
  page = 0, 
  pageSize = 20,
  keyword,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  totalElements,
  leftToolbarNode
}: Props) {
  const { t } = useTranslation()

  const columns: ColumnDef<ICategory>[] = [
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
      header: 'Icon',
      accessorKey: 'imageUrl',
      cell: (item) => (
        <div 
          className={`w-10 h-10 rounded-lg bg-cover bg-center border mx-auto ${item.isActive ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-200 opacity-50 grayscale'}`} 
          style={{backgroundImage: `url('${item.imageUrl || 'https://placehold.co/100x100?text=Cat'}')`}}
        ></div>
      ),
      width: '60px',
      align: 'center'
    },
    {
      header: t('admin.categories.table.name', 'Tên danh mục'),
      accessorKey: 'name',
      width: '40%',
      align: 'center',
      cell: (item) => (
        <p className={`font-semibold ${item.isActive ? 'text-slate-800' : 'text-slate-400'} text-center`} title={item.name}>
          {item.name}
        </p>
      )
    },
    {
      header: t('admin.categories.table.displayOrder', 'Thứ tự hiển thị'),
      accessorKey: 'displayOrder',
      cell: (item) => (
        <span className={`font-medium ${item.isActive ? 'text-slate-600' : 'text-slate-400'}`}>
          {item.displayOrder || 0}
        </span>
      ),
      align: 'center',
      width: '120px'
    },
    {
      header: t('admin.categories.table.status', 'Trạng thái'),
      accessorKey: 'isActive',
      cell: (item) => (
        <div className="flex justify-center w-full">
          {item.isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {t('admin.categories.table.statusActive', 'Đang hoạt động')}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              {t('admin.categories.table.statusHidden', 'Đang ẩn')}
            </span>
          )}
        </div>
      ),
      align: 'center',
      width: '150px'
    },
    {
      header: t('admin.categories.table.actions', 'Thao tác'),
      align: 'center',
      cell: (item) => (
        <div className="flex justify-center w-full">
          <DropdownMenu
            items={[
              {
                label: item.isActive ? t('admin.categories.table.hide', 'Ẩn') : t('admin.categories.table.show', 'Hiện'),
                icon: item.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-orange-500" />,
                onClick: () => onToggleStatus(item.id)
              },
              {
                label: t('admin.categories.table.edit', 'Sửa'),
                icon: <Edit className="w-4 h-4" />,
                onClick: () => onEdit(item.id)
              },
              item.isActive ? {
                label: t('admin.categories.table.delete', 'Lưu trữ'),
                icon: <Archive className="w-4 h-4" />,
                onClick: () => onDelete(item.id)
              } : {
                label: t('admin.categories.table.hardDelete', 'Xóa vĩnh viễn'),
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
      <DataTable<ICategory>
        columns={columns}
        data={categories}
        isLoading={isLoading}
        searchPlaceholder={t('admin.categories.filters.search', 'Tìm kiếm danh mục...')}
        searchValue={keyword}
        onSearchChange={onSearchChange}
        leftToolbar={leftToolbarNode}
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
