import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { Button } from '@/shared/components/ui/Button'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Plus, Maximize, QrCode, Ban } from 'lucide-react'
import { TablesGrid } from '../components/TablesGrid'
import { TableFormModal } from '../components/TableFormModal'
import { TableActionDialog } from '../components/TableActionDialog'
import { useTables, useDeleteTable, useHardDeleteTable } from '../hooks/useTables'
import type { ITable } from '../types/adminTable.type'

type ActionMode = 'merge' | 'transfer'
type DeleteMode = 'soft' | 'hard'

export default function TablesManagementPage() {
  const { t } = useTranslation()

  const [drawerOpen, setDrawerOpen]         = useState(false)
  const [editingTable, setEditingTable]     = useState<ITable | null>(null)
  const [deleteDialog, setDeleteDialog]     = useState<{ isOpen: boolean; table: ITable | null; mode: DeleteMode }>({ isOpen: false, table: null, mode: 'soft' })
  const [actionDialog, setActionDialog]     = useState<{ isOpen: boolean; mode: ActionMode; source: ITable | null }>({ isOpen: false, mode: 'merge', source: null })

  const { data: pageData, isLoading } = useTables({ keyword: '', status: '', page: 0, size: 500 })
  const deleteMutation = useDeleteTable()
  const hardDeleteMutation = useHardDeleteTable()

  const allTables = pageData?.content ?? []

  const [pageSize, setPageSize] = useState(12)
  const [currentPage, setCurrentPage] = useState(0)

  const paginatedTables = useMemo(() => {
    return allTables.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  }, [allTables, currentPage, pageSize])

  const totalPages = Math.ceil(allTables.length / pageSize)

  const openCreate = () => { setEditingTable(null); setDrawerOpen(true) }
  const openEdit   = (table: ITable) => { setEditingTable(table); setDrawerOpen(true) }
  return (
    <>
      <header className="h-16 bg-white border-b border-surface-dim flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold font-display text-on-surface hidden md:block">
            {t('admin.tables.title')}
          </h2>
        </div>
        <Button onClick={openCreate} className="!px-4 !py-2 !rounded-xl !text-sm">
          <Plus className="w-[18px] h-[18px] mr-1" />
          <span className="hidden sm:inline">{t('admin.tables.addNew')}</span>
        </Button>
      </header>

      <div className="flex-1 flex flex-col min-h-0 w-full relative">
      {/* Stats Cards */}
      <div className="shrink-0 px-4 md:px-6 pt-4 mb-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                <Maximize className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('admin.tables.stats.total')}</p>
                <p className="text-xl font-bold text-slate-900">{allTables.length}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('admin.tables.stats.qrActive')}</p>
                <p className="text-xl font-bold text-slate-900">{allTables.filter(t => t.qrUrl && t.active).length}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('admin.tables.stats.qrInactive')}</p>
                <p className="text-xl font-bold text-slate-900">{allTables.filter(t => !t.qrUrl || !t.active).length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Grid area with fixed bottom pagination */}
      <section className="flex-1 min-h-0 flex flex-col overflow-hidden px-4 md:px-6 pb-6">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
          <TablesGrid
            data={paginatedTables}
          isLoading={isLoading}
          onEdit={openEdit}
          onDelete={(table) => setDeleteDialog({ isOpen: true, table, mode: 'soft' })}
          onHardDelete={(table) => setDeleteDialog({ isOpen: true, table, mode: 'hard' })}
          />
        </div>

        {allTables.length > 0 && (
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalElements={allTables.length}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(0);
            }}
            pageSizeOptions={[12, 24, 48]}
            className="mt-4 border border-slate-200 rounded-xl shadow-sm"
          />
        )}
      </section>
      </div>

      {/* Modal */}
      <TableFormModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editingTable={editingTable}
      />

      {/* Action Dialog (merge/transfer) */}
      {actionDialog.source && (
        <TableActionDialog 
          isOpen={actionDialog.isOpen}
          mode={actionDialog.mode}
          sourceTable={actionDialog.source}
          allTables={allTables}
          onClose={() => setActionDialog({ isOpen: false, mode: 'merge', source: null })}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={deleteDialog.mode === 'soft' ? t('admin.tables.deleteTitle') : t('admin.tables.hardDeleteTitle')}
        description={deleteDialog.mode === 'soft' 
          ? t('admin.tables.deleteDesc', { name: `#${deleteDialog.table?.number} ${deleteDialog.table?.name ?? ''}`.trim() })
          : t('admin.tables.hardDeleteDesc')
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
