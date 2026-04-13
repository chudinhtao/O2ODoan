import { useTranslation } from 'react-i18next'
import { Edit, Star as StarIcon, Eye, EyeOff, Trash2, RotateCcw, ShieldBan } from 'lucide-react'
import type { IMenuItem } from '../types/adminMenu.type'
import { Button } from '@/shared/components/ui/Button'
import { StationBadge } from '@/shared/components/ui/StationBadge'
import { cloudinaryService } from '@/shared/services/cloudinary.service'

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
  pageSize = 20
}: Props) {
  const { t } = useTranslation()

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center">STT</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.menu.table.image')}</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.menu.table.name')}</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.menu.table.category')}</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.menu.table.basePrice')}</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.menu.table.status')}</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.menu.table.station')}</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.menu.table.featured')}</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">{t('admin.menu.table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {isLoading ? (
            <tr>
              <td colSpan={9} className="p-8 text-center text-slate-500">{t('admin.menu.table.loading')}</td>
            </tr>
        ) : items.map((item, index) => (
          <tr key={item.id} className={`hover:bg-slate-100 transition-colors ${!item.isActive ? 'opacity-60 bg-slate-50 grayscale-[50%]' : ''}`}>
            <td className="p-4 text-center text-xs font-bold text-slate-400">{(page * pageSize) + index + 1}</td>
            <td className="p-4">
              <div 
                className="w-12 h-12 rounded-lg bg-slate-100 bg-cover bg-center border border-slate-200" 
                style={{backgroundImage: `url('${item.imageUrl ? cloudinaryService.getOptimizedUrl(item.imageUrl, { width: 100, height: 100 }) : 'https://placehold.co/100x100?text=Food'}')`}}
              ></div>
            </td>
            <td className="p-4 max-w-[200px] overflow-hidden">
              <p className={`truncate font-semibold ${!item.isActive ? 'text-slate-500 line-through' : 'text-slate-800'}`} title={item.name}>{item.name}</p>
            </td>
            <td className="p-4 max-w-[200px] overflow-hidden">
              <p className="truncate text-sm text-slate-600" title={item.categoryName || item.categoryId || ''}>
                {item.categoryName || item.categoryId || '—'}
              </p>
            </td>
            <td className="p-4 text-sm font-bold">
              <div className={`flex flex-col gap-0.5 group w-fit ${item.isActive ? 'cursor-pointer' : ''}`} onClick={() => item.isActive && onEdit(item.id)}>
                {item.salePrice && item.salePrice < item.basePrice ? (
                  <>
                    <span className="text-red-500 text-base md:text-lg tracking-tight">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.salePrice)}
                    </span>
                    <span className="text-slate-400 text-[10px] line-through font-normal">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.basePrice)}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-800 text-sm md:text-base">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.basePrice)}
                  </span>
                )}
                {item.isActive && <Edit className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 inline-block align-middle" />}
              </div>
            </td>
            <td className="p-4">
              <div className="flex flex-col gap-1">
                {!item.isActive ? (
                  <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-red-50 text-red-500 w-fit whitespace-nowrap border border-red-100">{t('admin.menu.table.statusHidden')}</span>
                ) : item.isAvailable ? (
                  <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-600 w-fit whitespace-nowrap border border-emerald-100">{t('admin.menu.table.statusSelling')}</span>
                ) : (
                  <span className="inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-md bg-amber-50 text-amber-600 w-fit whitespace-nowrap border border-amber-100">{t('admin.menu.table.statusSoldOut')}</span>
                )}
              </div>
            </td>
            <td className="p-4">
              <div className="flex items-center justify-start">
                <StationBadge station={item.station} />
              </div>
            </td>
            <td className="p-4">
              {item.isFeatured ? (
                <StarIcon className="w-5 h-5 text-amber-400 fill-amber-400" />
              ) : (
                <StarIcon className="w-5 h-5 text-slate-300" />
              )}
            </td>
            <td className="p-4 text-right">
              <div className="flex items-center justify-end gap-1">
                {item.isActive ? (
                  <>
                    <Button 
                      onClick={() => onToggleStatus(item.id)} 
                      variant="ghost" size="icon"
                      className="!text-slate-400 hover:!text-primary hover:!bg-slate-100 !p-2 !rounded-lg" 
                      title={t('admin.menu.filters.toggleVisibility')}
                    >
                      {item.isAvailable ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </Button>
                    <Button 
                      onClick={() => onEdit(item.id)} 
                      variant="ghost" size="icon"
                      className="!text-slate-400 hover:!text-primary hover:!bg-slate-100 !p-2 !rounded-lg"
                      title={t('admin.menu.table.edit')}
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button 
                      onClick={() => onDelete(item.id)} 
                      variant="ghost" size="icon"
                      className="!text-slate-400 hover:!text-red-500 hover:!bg-red-50 !p-2 !rounded-lg"
                      title={t('admin.menu.table.delete')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => onRestore(item.id)} 
                      variant="ghost" size="icon"
                      className="!text-emerald-500 hover:!text-emerald-600 hover:!bg-emerald-50 !p-2 !rounded-lg"
                      title={t('admin.menu.table.restore')}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                    <Button 
                      onClick={() => onHardDelete(item.id)} 
                      variant="ghost" size="icon"
                      className="!text-red-400 hover:!text-red-600 hover:!bg-red-50 !p-2 !rounded-lg"
                      title={t('admin.menu.table.hardDelete')}
                    >
                      <ShieldBan className="w-5 h-5" />
                    </Button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
}
