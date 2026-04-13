import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Edit, Archive, ShieldBan } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import type { ICategory } from '../types/adminMenu.type'

interface Props {
  categories: ICategory[]
  isLoading: boolean
  onEdit: (id: string) => void
  onToggleStatus: (id: string) => void
  onDelete: (id: string) => void
  onHardDelete: (id: string) => void
  page?: number
  pageSize?: number
}

export function MenuCategoriesTable({ categories, isLoading, onEdit, onToggleStatus, onDelete, onHardDelete, page = 0, pageSize = 20 }: Props) {
  const { t } = useTranslation()

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 text-center">STT</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16 text-center">Icon</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.categories.table.name')}</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.categories.table.displayOrder')}</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('admin.categories.table.status')}</th>
            <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">{t('admin.categories.table.actions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
        {isLoading ? (
          <tr>
            <td colSpan={6} className="p-8 text-center text-slate-500">{t('admin.categories.loading')}</td>
          </tr>
        ) : categories.map((cat, index) => (
          <tr key={cat.id} className="hover:bg-slate-100 transition-colors">
            <td className="p-4 text-center text-xs font-bold text-slate-400">{(page * pageSize) + index + 1}</td>
            <td className="p-4 text-center">
              <div 
                className={`w-10 h-10 rounded-lg bg-cover bg-center border mx-auto ${cat.isActive ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-200 opacity-50 grayscale'}`} 
                style={{backgroundImage: `url('${cat.imageUrl || 'https://placehold.co/100x100?text=Cat'}')`}}
              ></div>
            </td>
            <td className="p-4 max-w-[200px] overflow-hidden">
              <p className={`truncate font-semibold ${cat.isActive ? 'text-slate-800' : 'text-slate-400'}`} title={cat.name}>
                {cat.name}
              </p>
            </td>
            <td className={`p-4 text-sm font-medium ${cat.isActive ? 'text-slate-600' : 'text-slate-400'}`}>{cat.displayOrder || 0}</td>
            <td className="p-4">
              {cat.isActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {t('admin.categories.table.statusActive')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  {t('admin.categories.table.statusHidden')}
                </span>
              )}
            </td>
            <td className="p-4 text-right">
              <div className="flex items-center justify-end gap-1">
                <Button 
                  onClick={() => onToggleStatus(cat.id)} 
                  variant="ghost" size="icon"
                  className="!text-slate-400 hover:!text-orange-500 hover:!bg-slate-100 !p-2 !rounded-lg"
                  title={cat.isActive ? t('admin.categories.table.hide') : t('admin.categories.table.show')}
                >
                  {cat.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
                <Button 
                  onClick={() => onEdit(cat.id)} 
                  variant="ghost" size="icon"
                  className="!text-slate-400 hover:!text-primary hover:!bg-slate-100 !p-2 !rounded-lg"
                  title={t('admin.categories.table.edit')}
                >
                  <Edit className="w-5 h-5" />
                </Button>
                {cat.isActive ? (
                  <Button 
                    onClick={() => onDelete(cat.id)} 
                    variant="ghost" size="icon"
                    className="!text-slate-400 hover:!text-amber-500 hover:!bg-amber-50 !p-2 !rounded-lg"
                    title={t('admin.categories.table.delete')}
                  >
                    <Archive className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button 
                    onClick={() => onHardDelete(cat.id)} 
                    variant="ghost" size="icon"
                    className="!text-slate-400 hover:!text-red-500 hover:!bg-red-50 !p-2 !rounded-lg"
                    title={t('admin.categories.table.hardDelete')}
                  >
                    <ShieldBan className="w-5 h-5" />
                  </Button>
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
