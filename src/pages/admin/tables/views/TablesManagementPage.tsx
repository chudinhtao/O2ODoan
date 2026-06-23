import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Button } from '@/shared/components/ui/Button'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Plus } from 'lucide-react'
import { TableCard } from '../components/TableCard'
import { TableFormModal } from '../components/TableFormModal'
import { TableActionDialog } from '../components/TableActionDialog'
import { AdminPageHeader } from '@/shared/components/ui/AdminPageHeader'
import { useTables, useDeleteTable, useHardDeleteTable, useGenerateQr, useToggleActiveTable } from '../hooks/useTables'
import type { ITable } from '../types/adminTable.type'

type ActionMode = 'merge' | 'transfer'
type DeleteMode = 'soft' | 'hard'

export default function TablesManagementPage() {
  const { t } = useTranslation()

  const [drawerOpen, setDrawerOpen]         = useState(false)
  const [editingTable, setEditingTable]     = useState<ITable | null>(null)
  const [deleteDialog, setDeleteDialog]     = useState<{ isOpen: boolean; table: ITable | null; mode: DeleteMode }>({ isOpen: false, table: null, mode: 'soft' })
  const [actionDialog, setActionDialog]     = useState<{ isOpen: boolean; mode: ActionMode; source: ITable | null }>({ isOpen: false, mode: 'merge', source: null })
  const [activeZone, setActiveZone]         = useState<string>('ALL')

  const { data: pageData, isLoading } = useTables({ keyword: '', status: '', page: 0, size: 500 })
  const deleteMutation = useDeleteTable()
  const hardDeleteMutation = useHardDeleteTable()
  const generateQrMutation = useGenerateQr()
  const toggleActiveMutation = useToggleActiveTable()

  const allTables = pageData?.content ?? []

  const zones = useMemo(() => {
    const z = Array.from(new Set(allTables.map(table => table.zone || t('admin.tables.noZone', 'Khu vực chung'))))
    return ['ALL', ...z]
  }, [allTables, t])

  const groupedTables = useMemo(() => {
    return allTables.reduce((acc, table) => {
      const zone = table.zone || t('admin.tables.noZone', 'Khu vực chung')
      if (activeZone !== 'ALL' && zone !== activeZone) return acc
      if (!acc[zone]) acc[zone] = []
      acc[zone].push(table)
      return acc
    }, {} as Record<string, ITable[]>)
  }, [allTables, activeZone, t])

  const openCreate = () => { setEditingTable(null); setDrawerOpen(true) }
  const openEdit   = (table: ITable) => { setEditingTable(table); setDrawerOpen(true) }

  const activeEditingTable = useMemo(() => {
    return editingTable ? allTables.find(t => t.id === editingTable.id) || editingTable : null;
  }, [editingTable, allTables])

  return (
    <>
      <div className="flex flex-col h-full bg-slate-50/50">
        <AdminPageHeader
          title={t('admin.tables.title')}
          actions={
            <Button onClick={openCreate} className="!px-3 sm:!px-4 !py-2 !text-sm gap-1">
              <Plus className="w-[18px] h-[18px] shrink-0" />
              <span className="hidden sm:inline">{t('admin.tables.addNew')}</span>
            </Button>
          }
        />

        {/* Zone Navigation Tabs */}
        <div className="bg-white border-b border-slate-100 px-4 md:px-6 py-2 sticky top-16 z-10 overflow-x-auto no-scrollbar shadow-sm">
          <div className="flex items-center gap-2 min-w-max">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => setActiveZone(zone)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeZone === zone 
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {zone === 'ALL' ? t('common.all', 'Tất cả') : zone}
                <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] ${activeZone === zone ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {zone === 'ALL' ? allTables.length : allTables.filter(table => (table.zone || t('admin.tables.noZone', 'Khu vực chung')) === zone).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 w-full relative">
          <section className="flex-1 min-h-0 flex flex-col overflow-hidden px-4 md:px-6 py-6 bg-slate-50/30">
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0 space-y-10">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full rounded-xl" />
                  ))}
                </div>
              ) : Object.entries(groupedTables).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="font-bold text-slate-600">{t('admin.tables.empty')}</p>
                  <p className="text-xs text-slate-400 mt-1">{t('admin.tables.emptyDesc')}</p>
                </div>
              ) : Object.entries(groupedTables).map(([zone, tables]) => (
                <div key={zone} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-1 bg-primary rounded-full"></div>
                      <h3 className="text-base font-bold text-slate-700 uppercase tracking-widest">
                        {zone} 
                      </h3>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                      {tables.length} {t('admin.tablesLabel', 'Bàn')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tables.map((table: ITable) => (
                      <TableCard
                        key={table.id}
                        table={table}
                        onEdit={openEdit}
                        onDelete={(t: ITable) => setDeleteDialog({ isOpen: true, table: t, mode: 'soft' })}
                        onHardDelete={(t: ITable) => setDeleteDialog({ isOpen: true, table: t, mode: 'hard' })}
                        onGenerateQr={(id: string) => generateQrMutation.mutate(id)}
                        onToggleActive={(id: string) => toggleActiveMutation.mutate(id)}
                        isGeneratingQr={generateQrMutation.isPending && generateQrMutation.variables === table.id}
                        isTogglingActive={toggleActiveMutation.isPending && toggleActiveMutation.variables === table.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <TableFormModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingTable={activeEditingTable}
      />

      {actionDialog.source && (
        <TableActionDialog 
          isOpen={actionDialog.isOpen}
          mode={actionDialog.mode}
          sourceTable={actionDialog.source}
          allTables={allTables}
          onClose={() => setActionDialog({ isOpen: false, mode: 'merge', source: null })}
        />
      )}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.mode === 'soft' ? t('admin.tables.deleteTitle') : t('admin.tables.hardDeleteTitle')}
        description={deleteDialog.table ? (deleteDialog.mode === 'soft' 
          ? t('admin.tables.deleteDesc', { name: `#${deleteDialog.table.number} ${deleteDialog.table.name ?? ''}`.trim() })
          : t('admin.tables.hardDeleteDesc')) : ''
        }
        onConfirm={() => {
          if (!deleteDialog.table) return
          if (deleteDialog.mode === 'soft') {
            deleteMutation.mutate(deleteDialog.table.id, {
              onSuccess: () => setDeleteDialog({ isOpen: false, table: null, mode: 'soft' }),
            })
          } else {
            hardDeleteMutation.mutate(deleteDialog.table.id, {
              onSuccess: () => setDeleteDialog({ isOpen: false, table: null, mode: 'soft' }),
            })
          }
        }}
        onCancel={() => setDeleteDialog({ isOpen: false, table: null, mode: 'soft' })}
        isLoading={deleteMutation.isPending || hardDeleteMutation.isPending}
      />
    </>
  )
}
